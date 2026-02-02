import { NotionRichText } from "../types";

export function richTextToMarkdown(richText: NotionRichText[] | undefined): string {
  if (!richText || !Array.isArray(richText)) {
    return "";
  }

  return richText.map((t) => {
    let text = t.plain_text;
    const annotations = t.annotations;

    // Handle links
    const link = t.text?.link?.url || t.href;
    if (link) {
      text = `[${text}](${link})`;
    }

    // Handle formatting (order matters: code innermost)
    if (annotations?.code) {
      text = `\`${text}\``;
    }
    if (annotations?.strikethrough) {
      text = `~~${text}~~`;
    }
    if (annotations?.italic) {
      text = `*${text}*`;
    }
    if (annotations?.bold) {
      text = `**${text}**`;
    }

    return text;
  }).join("");
}

export function parseInlineFormatting(text: string): unknown[] {
  const richText: unknown[] = [];
  // Regex to match: **bold**, *italic*, `code`, ~~strikethrough~~, [link](url)
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|~~(.+?)~~|\[(.+?)\]\((.+?)\))/g;

  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Add plain text before this match
    if (match.index > lastIndex) {
      const plainText = text.slice(lastIndex, match.index);
      if (plainText) {
        richText.push({ type: "text", text: { content: plainText } });
      }
    }

    const fullMatch = match[0];

    if (fullMatch.startsWith("**") && fullMatch.endsWith("**")) {
      richText.push({
        type: "text",
        text: { content: match[2] },
        annotations: { bold: true }
      });
    } else if (fullMatch.startsWith("~~") && fullMatch.endsWith("~~")) {
      richText.push({
        type: "text",
        text: { content: match[5] },
        annotations: { strikethrough: true }
      });
    } else if (fullMatch.startsWith("`") && fullMatch.endsWith("`")) {
      richText.push({
        type: "text",
        text: { content: match[4] },
        annotations: { code: true }
      });
    } else if (fullMatch.startsWith("[") && fullMatch.includes("](")) {
      richText.push({
        type: "text",
        text: { content: match[6], link: { url: match[7] } }
      });
    } else if (fullMatch.startsWith("*") && fullMatch.endsWith("*")) {
      richText.push({
        type: "text",
        text: { content: match[3] },
        annotations: { italic: true }
      });
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining plain text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining) {
      richText.push({ type: "text", text: { content: remaining } });
    }
  }

  // If no formatting found, return simple text
  if (richText.length === 0) {
    return [{ type: "text", text: { content: text } }];
  }

  return richText;
}
