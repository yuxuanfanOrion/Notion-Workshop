import { NotionBlock, NotionRichText } from "../types";
import { richTextToMarkdown } from "./richText";

export interface BlockToMarkdownOptions {
  maxDepth?: number;
  getBlockChildren: (blockId: string) => Promise<NotionBlock[]>;
}

function getIndent(depth: number): string {
  return "  ".repeat(depth);
}

export async function blocksToMarkdown(
  blocks: NotionBlock[],
  options: BlockToMarkdownOptions,
  depth: number = 0
): Promise<string> {
  const maxDepth = options.maxDepth ?? 10;

  // Pre-fetch children in parallel batches for better performance
  const blocksWithChildren = blocks.filter(
    (b) => b.has_children && b.type !== "child_page" && b.type !== "child_database"
  );
  const BATCH_SIZE = 5;
  for (let i = 0; i < blocksWithChildren.length; i += BATCH_SIZE) {
    const batch = blocksWithChildren.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((b) =>
        options.getBlockChildren(b.id).catch((err) => {
          console.error(`[blockToMarkdown] Pre-fetch failed for block ${b.id}:`, err);
          return [];
        })
      )
    );
  }

  const lines: string[] = [];

  for (const block of blocks) {
    const line = await blockToMarkdown(block, options, depth, maxDepth);
    if (line !== null) {
      lines.push(line);
    }
  }

  return lines.join("\n\n");
}

async function fetchBlockChildrenContent(
  blockId: string,
  options: BlockToMarkdownOptions,
  depth: number,
  maxDepth: number
): Promise<string> {
  if (depth >= maxDepth) {
    return "";
  }

  try {
    const children = await options.getBlockChildren(blockId);
    if (children.length === 0) {
      return "";
    }

    return await blocksToMarkdown(children, options, depth + 1);
  } catch (error) {
    console.error(`[blockToMarkdown] Failed to fetch children for block ${blockId}:`, error);
    return "";
  }
}

async function blockToMarkdown(
  block: NotionBlock,
  options: BlockToMarkdownOptions,
  depth: number = 0,
  maxDepth: number = 10
): Promise<string | null> {
  const type = block.type;
  const data = block[type] as Record<string, unknown> | undefined;

  if (!data) {
    return null;
  }

  const indent = getIndent(depth);

  switch (type) {
    case "paragraph": {
      const text = richTextToMarkdown(data.rich_text as NotionRichText[]);
      return indent + text;
    }

    case "heading_1": {
      const text = richTextToMarkdown(data.rich_text as NotionRichText[]);
      const isToggleable = data.is_toggleable === true;

      if (isToggleable && block.has_children) {
        const childContent = await fetchBlockChildrenContent(block.id, options, depth, maxDepth);
        if (childContent) {
          return `${indent}<details><summary>\n\n${indent}# ${text}\n\n${indent}</summary>\n\n${childContent}\n\n${indent}</details>`;
        }
      }
      return `${indent}# ${text}`;
    }

    case "heading_2": {
      const text = richTextToMarkdown(data.rich_text as NotionRichText[]);
      const isToggleable = data.is_toggleable === true;

      if (isToggleable && block.has_children) {
        const childContent = await fetchBlockChildrenContent(block.id, options, depth, maxDepth);
        if (childContent) {
          return `${indent}<details><summary>\n\n${indent}## ${text}\n\n${indent}</summary>\n\n${childContent}\n\n${indent}</details>`;
        }
      }
      return `${indent}## ${text}`;
    }

    case "heading_3": {
      const text = richTextToMarkdown(data.rich_text as NotionRichText[]);
      const isToggleable = data.is_toggleable === true;

      if (isToggleable && block.has_children) {
        const childContent = await fetchBlockChildrenContent(block.id, options, depth, maxDepth);
        if (childContent) {
          return `${indent}<details><summary>\n\n${indent}### ${text}\n\n${indent}</summary>\n\n${childContent}\n\n${indent}</details>`;
        }
      }
      return `${indent}### ${text}`;
    }

    case "bulleted_list_item": {
      const text = richTextToMarkdown(data.rich_text as NotionRichText[]);
      let result = `${indent}- ${text}`;

      if (block.has_children) {
        const childContent = await fetchBlockChildrenContent(block.id, options, depth, maxDepth);
        if (childContent) {
          result += "\n" + childContent;
        }
      }

      return result;
    }

    case "numbered_list_item": {
      const text = richTextToMarkdown(data.rich_text as NotionRichText[]);
      let result = `${indent}1. ${text}`;

      if (block.has_children) {
        const childContent = await fetchBlockChildrenContent(block.id, options, depth, maxDepth);
        if (childContent) {
          result += "\n" + childContent;
        }
      }

      return result;
    }

    case "to_do": {
      const checked = data.checked ? "x" : " ";
      let result = `${indent}- [${checked}] ${richTextToMarkdown(data.rich_text as NotionRichText[])}`;

      if (block.has_children) {
        const childContent = await fetchBlockChildrenContent(block.id, options, depth, maxDepth);
        if (childContent) {
          result += "\n" + childContent;
        }
      }

      return result;
    }

    case "toggle": {
      const summary = richTextToMarkdown(data.rich_text as NotionRichText[]);
      let childContent = "";

      if (block.has_children) {
        childContent = await fetchBlockChildrenContent(block.id, options, depth, maxDepth);
      }

      if (childContent) {
        return `${indent}<details><summary>${summary}</summary>\n\n${childContent}\n\n${indent}</details>`;
      }
      return `${indent}<details><summary>${summary}</summary></details>`;
    }

    case "code": {
      const language = (data.language as string) || "";
      const code = richTextToMarkdown(data.rich_text as NotionRichText[]);
      return `\`\`\`${language}\n${code}\n\`\`\``;
    }

    case "quote": {
      const text = richTextToMarkdown(data.rich_text as NotionRichText[]);
      let result = `${indent}> ${text}`;

      if (block.has_children) {
        const childContent = await fetchBlockChildrenContent(block.id, options, depth, maxDepth);
        if (childContent) {
          const quotedChildren = childContent
            .split("\n")
            .map((line) => (line ? `${indent}> ${line}` : `${indent}>`))
            .join("\n");
          result += "\n" + quotedChildren;
        }
      }

      return result;
    }

    case "divider":
      return `${indent}---`;

    default:
      return handleSpecialBlocks(block, type, data, options, depth, maxDepth, indent);
  }
}

async function handleSpecialBlocks(
  block: NotionBlock,
  type: string,
  data: Record<string, unknown>,
  options: BlockToMarkdownOptions,
  depth: number,
  maxDepth: number,
  indent: string
): Promise<string | null> {
  switch (type) {
    case "callout": {
      const icon = (data.icon as { emoji?: string })?.emoji || "💡";
      const text = richTextToMarkdown(data.rich_text as NotionRichText[]);
      let result = `${indent}> ${icon} ${text}`;

      if (block.has_children) {
        const childContent = await fetchBlockChildrenContent(block.id, options, depth, maxDepth);
        if (childContent) {
          const quotedChildren = childContent
            .split("\n")
            .map((line) => (line ? `${indent}> ${line}` : `${indent}>`))
            .join("\n");
          result += "\n" + quotedChildren;
        }
      }

      return result;
    }

    case "image": {
      const imageData = data as { type: string; file?: { url: string }; external?: { url: string } };
      const url = imageData.type === "file" ? imageData.file?.url : imageData.external?.url;
      return url ? `${indent}![image](${url})` : null;
    }

    case "bookmark":
    case "link_preview": {
      const urlData = data as { url?: string };
      return urlData.url ? `${indent}[${urlData.url}](${urlData.url})` : null;
    }

    case "column_list":
    case "column": {
      if (!block.has_children) {
        return null;
      }
      const childContent = await fetchBlockChildrenContent(block.id, options, depth, maxDepth);
      return childContent || null;
    }

    case "synced_block": {
      const syncedFrom = (data as { synced_from?: { block_id: string } }).synced_from;

      if (syncedFrom?.block_id) {
        const originalChildren = await options.getBlockChildren(syncedFrom.block_id);
        return await blocksToMarkdown(originalChildren, options, depth);
      }

      if (block.has_children) {
        return await fetchBlockChildrenContent(block.id, options, depth, maxDepth);
      }

      return null;
    }

    case "table": {
      return handleTableBlock(block, options, indent);
    }

    case "table_row":
    case "child_page":
      return null;

    default:
      console.log(`[blockToMarkdown] Unsupported block type: ${type}`);
      return null;
  }
}

async function handleTableBlock(
  block: NotionBlock,
  options: BlockToMarkdownOptions,
  indent: string
): Promise<string | null> {
  if (!block.has_children) {
    return null;
  }

  try {
    const rows = await options.getBlockChildren(block.id);
    if (rows.length === 0) {
      return null;
    }

    const tableLines: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.type !== "table_row") {
        continue;
      }

      const rowData = row.table_row as { cells?: NotionRichText[][] };
      const cells = rowData?.cells || [];
      const cellTexts = cells.map((cell) => richTextToMarkdown(cell));
      tableLines.push(`${indent}| ${cellTexts.join(" | ")} |`);

      if (i === 0) {
        const separator = cells.map(() => "---").join(" | ");
        tableLines.push(`${indent}| ${separator} |`);
      }
    }

    return tableLines.join("\n");
  } catch (error) {
    console.error(`[blockToMarkdown] Failed to fetch table rows:`, error);
    return null;
  }
}
