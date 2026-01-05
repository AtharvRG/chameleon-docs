// js/copyCode.js

export const initCopyButtons = () => {
  // Find all code blocks (usually wrapped in <pre> tags)
  const codeBlocks = document.querySelectorAll('pre');

  codeBlocks.forEach((block) => {
    // 1. Create the button
    const button = document.createElement('button');
    button.innerText = 'Copy';
    button.className = 'copy-code-button';

    // 2. Wrap block in a container for positioning if not already
    block.style.position = 'relative';
    block.appendChild(button);

    // 3. Add Click Event
    button.addEventListener('click', async () => {
      const code = block.querySelector('code')?.innerText || block.innerText;
      
      try {
        await navigator.clipboard.writeText(code);
        
        // 4. User Feedback (Success State)
        button.innerText = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
          button.innerText = 'Copy';
          button.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    });
  });
};