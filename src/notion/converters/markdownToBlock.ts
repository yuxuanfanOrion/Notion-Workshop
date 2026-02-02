import { parseInlineFormatting } from "./richText";

export function markdownToBlocks(markdown: string): unknown[] {
  const lines = markdown.split("\n");
  const blocks: unknown[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // Skip notion-id comment
    if (trimmed.startsWith("<!--") && trimmed.includes("notion-id")) {
      i++;
      continue;
    }

    let block: unknown = null;

    // Handle code blocks
    if (trimmed.startsWith("```")) {
      const result = parseCodeBlock(lines, i);
      block = result.block;
      i = result.nextIndex;
    } else if (trimmed.startsWith("### ")) {
      block = createHeadingBlock(3, trimmed.slice(4));
      i++;
    } else if (trimmed.startsWith("## ")) {
      block = createHeadingBlock(2, trimmed.slice(3));
      i++;
    } else if (trimmed.startsWith("# ")) {
      block = createHeadingBlock(1, trimmed.slice(2));
      i++;
    } else if (trimmed.startsWith("- [x] ") || trimmed.startsWith("- [ ] ")) {
      block = createTodoBlock(trimmed);
      i++;
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      block = createBulletedListBlock(trimmed.slice(2));
      i++;
    } else if (/^\d+\.\s/.test(trimmed)) {
      block = createNumberedListBlock(trimmed);
      i++;
    } else if (trimmed.startsWith("> ")) {
      block = createQuoteBlock(trimmed.slice(2));
      i++;
    } else if (trimmed === "---") {
      block = { object: "block", type: "divider", divider: {} };
      i++;
    } else {
      block = createParagraphBlock(trimmed);
      i++;
    }

    if (block) {
      blocks.push(block);
    }
  }

  return blocks;
}

function parseCodeBlock(lines: string[], startIndex: number): { block: unknown; nextIndex: number } {
  const trimmed = lines[startIndex].trim();
  const language = trimmed.slice(3).trim();
  const codeLines: string[] = [];
  let i = startIndex + 1;

  while (i < lines.length && !lines[i].trim().startsWith("```")) {
    codeLines.push(lines[i]);
    i++;
  }
  i++; // Skip closing ```

  return {
    block: {
      object: "block",
      type: "code",
      code: {
        rich_text: [{ type: "text", text: { content: codeLines.join("\n") } }],
        language: language || "plain text"
      }
    },
    nextIndex: i
  };
}

function createHeadingBlock(level: 1 | 2 | 3, text: string): unknown {
  const type = `heading_${level}` as const;
  return {
    object: "block",
    type,
    [type]: { rich_text: parseInlineFormatting(text) }
  };
}

function createTodoBlock(trimmed: string): unknown {
  const checked = trimmed.startsWith("- [x] ");
  return {
    object: "block",
    type: "to_do",
    to_do: {
      rich_text: parseInlineFormatting(trimmed.slice(6)),
      checked
    }
  };
}

function createBulletedListBlock(text: string): unknown {
  return {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: { rich_text: parseInlineFormatting(text) }
  };
}

function createNumberedListBlock(trimmed: string): unknown {
  const content = trimmed.replace(/^\d+\.\s/, "");
  return {
    object: "block",
    type: "numbered_list_item",
    numbered_list_item: { rich_text: parseInlineFormatting(content) }
  };
}

function createQuoteBlock(text: string): unknown {
  return {
    object: "block",
    type: "quote",
    quote: { rich_text: parseInlineFormatting(text) }
  };
}

function createParagraphBlock(text: string): unknown {
  return {
    object: "block",
    type: "paragraph",
    paragraph: { rich_text: parseInlineFormatting(text) }
  };
}
