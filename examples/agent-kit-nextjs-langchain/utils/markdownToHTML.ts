import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

interface MarkedOptions {
  gfm: boolean;
  breaks: boolean;
  headerIds: boolean;
  mangle: false;
  highlight?: (code: string, lang: string) => string;
}

// Configure marked options
const markedOptions: MarkedOptions = {
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
  headerIds: true, // Add ids to headers
  mangle: false, // Don't escape HTML
  highlight: function (code: string, lang: string): string {
    // You can add syntax highlighting here if needed
    return code;
  },
};

marked.setOptions(markedOptions);

// Basic markdown to HTML conversion with sanitization
export default function markdownToHtml(markdown: string) {
  const rawHtml = marked.parse(markdown);
  return DOMPurify.sanitize(rawHtml as string);
}
