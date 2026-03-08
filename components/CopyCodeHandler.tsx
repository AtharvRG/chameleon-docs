"use client";

import { useEffect } from "react";

export default function CopyCodeHandler() {
  useEffect(() => {
    // Select all <pre> tags which Next.js/Markdown uses for code blocks
    const codeBlocks = document.querySelectorAll("pre");

    codeBlocks.forEach((block) => {
      // 1. Check if we already added a button to avoid duplicates
      if (block.parentElement?.classList.contains("code-wrapper")) return;

      // 2. Create a wrapper and the button
      const wrapper = document.createElement("div");
      wrapper.className = "code-wrapper";
      
      const button = document.createElement("button");
      button.className = "copy-button";
      button.innerText = "Copy";

      // 3. Wrap the <pre> block
      block.parentNode?.insertBefore(wrapper, block);
      wrapper.appendChild(block);
      wrapper.appendChild(button);

      // 4. Click Logic
      button.addEventListener("click", async () => {
        const text = block.innerText;
        await navigator.clipboard.writeText(text);

        button.innerText = "Copied!";
        button.style.background = "#10b981"; // Success Green

        setTimeout(() => {
          button.innerText = "Copy";
          button.style.background = "#2d3748";
        }, 2000);
      });
    });
  }, []);

  return null; // This component doesn't render anything visually itself
}