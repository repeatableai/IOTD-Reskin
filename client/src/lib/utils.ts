import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Strip markdown formatting from text for clean display
 * Removes: **bold**, *italic*, [links](url), `code`, headers, HTML tags
 */
export function stripMarkdown(text: string): string {
  if (!text) return text;

  return text
    // Remove bold: **text** or __text__
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Remove italic: *text* or _text_ (but not inside words)
    .replace(/(?<!\w)\*([^*]+)\*(?!\w)/g, '$1')
    .replace(/(?<!\w)_([^_]+)_(?!\w)/g, '$1')
    // Remove inline code: `code`
    .replace(/`([^`]+)`/g, '$1')
    // Remove links: [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove headers: # Header -> Header
    .replace(/^#{1,6}\s+/gm, '')
    // Remove HTML-like tags: <tag> or </tag>
    .replace(/<\/?[^>]+>/g, '')
    // Clean up multiple spaces
    .replace(/  +/g, ' ')
    .trim();
}
