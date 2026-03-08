// hooks/use-reimagine-engine.ts
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { usePuterAI } from "@/hooks/use-puter-ai";

interface ReimagineRequest {
  id: string;
  projectSlug: string;
  pageSlug: string;
  content: string;
  mode: string;
  timestamp: number;
  resolve: (content: string) => void;
  reject: (error: Error) => void;
}

interface ReimagineEngineState {
  isProcessing: boolean;
  currentRequest: ReimagineRequest | null;
  queue: ReimagineRequest[];
}

interface CacheEntry {
  content: string;
  timestamp: number;
}

interface CacheStore {
  [key: string]: CacheEntry;
}

let engineInstance: ReimagineEngine | null = null;

class ReimagineEngine {
  private state: ReimagineEngineState = {
    isProcessing: false,
    currentRequest: null,
    queue: [],
  };

  private listeners = new Set<() => void>();
  private puterReimagine: ((content: string, mode: string) => Promise<string>) | null = null;
  
  // Cache layer
  private memoryCache: Map<string, CacheEntry> = new Map();
  private cacheEnabled: boolean = true;
  private readonly CACHE_STORAGE_KEY = "chameleon-reimagine-cache";
  private readonly MAX_CACHE_SIZE = 100; // Limit cache entries

  constructor() {
    if (engineInstance) {
      return engineInstance;
    }
    engineInstance = this;
    this.loadCacheFromStorage();
  }

  setPuterReimagine(fn: (content: string, mode: string) => Promise<string>) {
    this.puterReimagine = fn;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState() {
    return this.state;
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  private generateRequestId(projectSlug: string, pageSlug: string, mode: string): string {
    return `${projectSlug}:${pageSlug}:${mode}`;
  }

  /**
   * Generate a simple stable hash for content
   * Uses content length + checksum of character codes
   */
  private hashContent(content: string): string {
    let hash = 0;
    const len = content.length;
    
    // Sample characters at intervals for performance on large content
    const step = Math.max(1, Math.floor(len / 100));
    
    for (let i = 0; i < len; i += step) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `${len}-${hash.toString(36)}`;
  }

  /**
   * Generate cache key from request parameters
   */
  private getCacheKey(projectSlug: string, pageSlug: string, mode: string, content: string): string {
    const contentHash = this.hashContent(content);
    return `${projectSlug}:${pageSlug}:${mode}:${contentHash}`;
  }

  /**
   * Load cache from localStorage
   */
  private loadCacheFromStorage() {
    try {
      const stored = localStorage.getItem(this.CACHE_STORAGE_KEY);
      if (stored) {
        const cacheStore: CacheStore = JSON.parse(stored);
        Object.entries(cacheStore).forEach(([key, entry]) => {
          this.memoryCache.set(key, entry);
        });
      }
    } catch (error) {
      console.warn("Failed to load reimagine cache from storage:", error);
      // Continue without cached data
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveCacheToStorage() {
    try {
      const cacheStore: CacheStore = {};
      this.memoryCache.forEach((entry, key) => {
        cacheStore[key] = entry;
      });
      localStorage.setItem(this.CACHE_STORAGE_KEY, JSON.stringify(cacheStore));
    } catch (error) {
      console.warn("Failed to save reimagine cache to storage:", error);
      // Continue without persisting
    }
  }

  /**
   * Get cached result if available
   */
  private getCachedResult(cacheKey: string): string | null {
    if (!this.cacheEnabled) {
      return null;
    }

    const cached = this.memoryCache.get(cacheKey);
    if (cached) {
      return cached.content;
    }

    return null;
  }

  /**
   * Store result in cache
   */
  private setCachedResult(cacheKey: string, content: string) {
    if (!this.cacheEnabled) {
      return;
    }

    // Enforce cache size limit (LRU-style: remove oldest)
    if (this.memoryCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }

    this.memoryCache.set(cacheKey, {
      content,
      timestamp: Date.now(),
    });

    this.saveCacheToStorage();
  }

  /**
   * Enable or disable cache
   */
  setCacheEnabled(enabled: boolean) {
    this.cacheEnabled = enabled;
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.memoryCache.clear();
    try {
      localStorage.removeItem(this.CACHE_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear cache from storage:", error);
    }
  }

  async enqueue(
    projectSlug: string,
    pageSlug: string,
    content: string,
    mode: string
  ): Promise<string> {
    // Check cache first
    const cacheKey = this.getCacheKey(projectSlug, pageSlug, mode, content);
    const cachedResult = this.getCachedResult(cacheKey);
    
    if (cachedResult !== null) {
      // Cache hit - resolve immediately without queuing
      return Promise.resolve(cachedResult);
    }

    // Cache miss - proceed with normal queue logic
    const requestId = this.generateRequestId(projectSlug, pageSlug, mode);

    const existingInQueue = this.state.queue.find((r) => r.id === requestId);
    if (existingInQueue) {
      return new Promise((resolve, reject) => {
        existingInQueue.resolve = resolve;
        existingInQueue.reject = reject;
      });
    }

    if (
      this.state.currentRequest &&
      this.state.currentRequest.id === requestId
    ) {
      return new Promise((resolve, reject) => {
        this.state.currentRequest!.resolve = resolve;
        this.state.currentRequest!.reject = reject;
      });
    }

    return new Promise((resolve, reject) => {
      const request: ReimagineRequest = {
        id: requestId,
        projectSlug,
        pageSlug,
        content,
        mode,
        timestamp: Date.now(),
        resolve,
        reject,
      };

      this.state.queue.push(request);
      this.notify();

      if (!this.state.isProcessing) {
        this.processNext();
      }
    });
  }

  cancelForPage(projectSlug: string, pageSlug: string) {
    const beforeLength = this.state.queue.length;
    this.state.queue = this.state.queue.filter(
      (r) => !(r.projectSlug === projectSlug && r.pageSlug === pageSlug)
    );

    if (
      this.state.currentRequest &&
      this.state.currentRequest.projectSlug === projectSlug &&
      this.state.currentRequest.pageSlug === pageSlug
    ) {
      this.state.currentRequest.reject(new Error("Request cancelled"));
      this.state.currentRequest = null;
      this.state.isProcessing = false;
      this.processNext();
    }

    if (beforeLength !== this.state.queue.length) {
      this.notify();
    }
  }

  private async processNext() {
    if (this.state.isProcessing || this.state.queue.length === 0) {
      return;
    }

    const request = this.state.queue.shift()!;
    this.state.currentRequest = request;
    this.state.isProcessing = true;
    this.notify();

    try {
      if (!this.puterReimagine) {
        throw new Error("PuterAI reimagine function not initialized");
      }

      const result = await this.puterReimagine(request.content, request.mode);
      
      // Store result in cache
      const cacheKey = this.getCacheKey(
        request.projectSlug,
        request.pageSlug,
        request.mode,
        request.content
      );
      this.setCachedResult(cacheKey, result);
      
      request.resolve(result);
    } catch (error) {
      request.reject(
        error instanceof Error ? error : new Error("Reimagine failed")
      );
    } finally {
      this.state.currentRequest = null;
      this.state.isProcessing = false;
      this.notify();

      if (this.state.queue.length > 0) {
        setTimeout(() => this.processNext(), 100);
      }
    }
  }

  getQueueLength(): number {
    return this.state.queue.length;
  }

  isProcessingForPage(projectSlug: string, pageSlug: string): boolean {
    return (
      this.state.isProcessing &&
      this.state.currentRequest !== null &&
      this.state.currentRequest.projectSlug === projectSlug &&
      this.state.currentRequest.pageSlug === pageSlug
    );
  }
}

export function useReimagineEngine() {
  const [, forceUpdate] = useState({});
  const engineRef = useRef<ReimagineEngine>(new ReimagineEngine());
  const { reimagine: puterReimagine } = usePuterAI();

  useEffect(() => {
    engineRef.current.setPuterReimagine(puterReimagine);
  }, [puterReimagine]);

  useEffect(() => {
    const engine = engineRef.current;
    const unsubscribe = engine.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  const enqueue = useCallback(
    (
      projectSlug: string,
      pageSlug: string,
      content: string,
      mode: string
    ): Promise<string> => {
      return engineRef.current.enqueue(projectSlug, pageSlug, content, mode);
    },
    []
  );

  const cancelForPage = useCallback((projectSlug: string, pageSlug: string) => {
    engineRef.current.cancelForPage(projectSlug, pageSlug);
  }, []);

  const isProcessingForPage = useCallback(
    (projectSlug: string, pageSlug: string): boolean => {
      return engineRef.current.isProcessingForPage(projectSlug, pageSlug);
    },
    []
  );

  const getQueueLength = useCallback((): number => {
    return engineRef.current.getQueueLength();
  }, []);

  const setCacheEnabled = useCallback((enabled: boolean) => {
    engineRef.current.setCacheEnabled(enabled);
  }, []);

  const clearCache = useCallback(() => {
    engineRef.current.clearCache();
  }, []);

  return {
    enqueue,
    cancelForPage,
    isProcessingForPage,
    getQueueLength,
    setCacheEnabled,
    clearCache,
    isProcessing: engineRef.current.getState().isProcessing,
  };
}