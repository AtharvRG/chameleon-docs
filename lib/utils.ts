import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Get accurate caret/selection coordinates in a textarea using the mirror div technique.
 * This creates an off-screen div that mirrors the textarea's styling and measures
 * the exact position of text at a given index.
 */
export function getTextareaCaretCoordinates(
    element: HTMLTextAreaElement,
    position: number
): { top: number; left: number; height: number } {
    const properties = [
        'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
        'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderStyle',
        'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust',
        'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent', 'textDecoration',
        'letterSpacing', 'wordSpacing', 'tabSize'
    ] as const;

    // Remove any existing mirror div
    const existingDiv = document.getElementById('textarea-caret-position-mirror');
    if (existingDiv) {
        existingDiv.parentNode?.removeChild(existingDiv);
    }

    const div = document.createElement('div');
    div.id = 'textarea-caret-position-mirror';
    document.body.appendChild(div);

    const style = div.style;
    const computed = window.getComputedStyle(element);

    // Mirror the textarea's styling
    style.whiteSpace = 'pre-wrap';
    style.wordWrap = 'break-word';
    style.position = 'absolute';
    style.visibility = 'hidden';
    style.top = '0';
    style.left = '0';
    style.pointerEvents = 'none';

    properties.forEach((prop) => {
        style[prop as any] = computed[prop];
    });

    // Firefox scrollbar handling
    const isFirefox = typeof window !== 'undefined' && (window as any).mozInnerScreenX != null;
    if (isFirefox) {
        if (element.scrollHeight > parseInt(computed.height)) {
            style.overflowY = 'scroll';
        }
    } else {
        style.overflow = 'hidden';
    }

    // Set the text before the caret position
    const textBeforeCaret = element.value.substring(0, position);
    div.textContent = textBeforeCaret;

    // Create span at caret position to measure its position
    const span = document.createElement('span');
    // The span needs content to be measurable - use the rest of the text to ensure
    // proper wrapping calculation, or a placeholder if at end
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);

    const coordinates = {
        top: span.offsetTop + parseInt(computed.borderTopWidth) || 0,
        left: span.offsetLeft + parseInt(computed.borderLeftWidth) || 0,
        height: parseInt(computed.lineHeight) || parseInt(computed.fontSize) * 1.2 || 20
    };

    document.body.removeChild(div);

    return coordinates;
}