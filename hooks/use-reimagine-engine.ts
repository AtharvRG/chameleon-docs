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

let engineInstance: ReimagineEngine | null = null;

class ReimagineEngine {
  private state: ReimagineEngineState = {
    isProcessing: false,
    currentRequest: null,
    queue: [],
  };

  private listeners = new Set<() => void>();
  private puterReimagine: ((content: string, mode: string) => Promise<string>) | null = null;

  constructor() {
    if (engineInstance) {
      return engineInstance;
    }
    engineInstance = this;
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

  async enqueue(
    projectSlug: string,
    pageSlug: string,
    content: string,
    mode: string
  ): Promise<string> {
    const requestId = this.generateRequestId(projectSlug, pageSlug, mode);

    // Deduplicate: if same request is in queue or processing, return existing promise
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
    // Remove all requests for this page from queue
    const beforeLength = this.state.queue.length;
    this.state.queue = this.state.queue.filter(
      (r) => !(r.projectSlug === projectSlug && r.pageSlug === pageSlug)
    );

    // Cancel current request if it matches
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
      request.resolve(result);
    } catch (error) {
      request.reject(
        error instanceof Error ? error : new Error("Reimagine failed")
      );
    } finally {
      this.state.currentRequest = null;
      this.state.isProcessing = false;
      this.notify();

      // Process next in queue
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

  return {
    enqueue,
    cancelForPage,
    isProcessingForPage,
    getQueueLength,
    isProcessing: engineRef.current.getState().isProcessing,
  };
}