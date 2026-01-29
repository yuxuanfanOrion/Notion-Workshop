from __future__ import annotations

import re
from typing import Dict, List, Optional

from notion_client import Client


class NotionMarkdownSync:
    def __init__(self, token: str, page_id: str) -> None:
        self.page_id = page_id
        self.client = Client(auth=token)

    def pull_markdown(self) -> str:
        blocks = self._list_blocks()
        return self._blocks_to_markdown(blocks)

    def push_markdown(self, markdown_text: str) -> None:
        self._replace_blocks(self._markdown_to_blocks(markdown_text))

    def _list_blocks(self) -> List[Dict]:
        results: List[Dict] = []
        start_cursor: Optional[str] = None
        while True:
            response = self.client.blocks.children.list(
                block_id=self.page_id, start_cursor=start_cursor
            )
            results.extend(response.get("results", []))
            if not response.get("has_more"):
                break
            start_cursor = response.get("next_cursor")
        return results

    def _replace_blocks(self, new_blocks: List[Dict]) -> None:
        existing = self._list_blocks()
        for block in existing:
            block_id = block.get("id")
            if block_id:
                self.client.blocks.delete(block_id=block_id)

        for i in range(0, len(new_blocks), 100):
            chunk = new_blocks[i : i + 100]
            if chunk:
                self.client.blocks.children.append(
                    block_id=self.page_id, children=chunk
                )

    @staticmethod
    def _text_obj(content: str) -> List[Dict]:
        return [{"type": "text", "text": {"content": content}}]

    def _markdown_to_blocks(self, text: str) -> List[Dict]:
        lines = text.splitlines()
        blocks: List[Dict] = []
        i = 0
        while i < len(lines):
            line = lines[i]

            if not line.strip():
                i += 1
                continue

            if line.startswith("```"):
                language = line[3:].strip() or "plain text"
                code_lines: List[str] = []
                i += 1
                while i < len(lines) and not lines[i].startswith("```"):
                    code_lines.append(lines[i])
                    i += 1
                if i < len(lines):
                    i += 1
                blocks.append(
                    {
                        "type": "code",
                        "code": {
                            "language": language,
                            "rich_text": self._text_obj("\n".join(code_lines)),
                        },
                    }
                )
                continue

            if line.startswith("#"):
                level = len(line) - len(line.lstrip("#"))
                content = line[level:].strip()
                block_type = (
                    "heading_1" if level == 1 else "heading_2" if level == 2 else "heading_3"
                )
                blocks.append(
                    {
                        "type": block_type,
                        block_type: {"rich_text": self._text_obj(content)},
                    }
                )
                i += 1
                continue

            if re.match(r"^\s*[-*+]\s+", line):
                content = re.sub(r"^\s*[-*+]\s+", "", line)
                blocks.append(
                    {
                        "type": "bulleted_list_item",
                        "bulleted_list_item": {"rich_text": self._text_obj(content)},
                    }
                )
                i += 1
                continue

            if re.match(r"^\s*\d+\.\s+", line):
                content = re.sub(r"^\s*\d+\.\s+", "", line)
                blocks.append(
                    {
                        "type": "numbered_list_item",
                        "numbered_list_item": {"rich_text": self._text_obj(content)},
                    }
                )
                i += 1
                continue

            if line.lstrip().startswith(">"):
                content = line.lstrip()[1:].strip()
                blocks.append(
                    {
                        "type": "quote",
                        "quote": {"rich_text": self._text_obj(content)},
                    }
                )
                i += 1
                continue

            paragraph_lines = [line]
            i += 1
            while i < len(lines):
                next_line = lines[i]
                if not next_line.strip():
                    i += 1
                    break
                if (
                    next_line.startswith("```")
                    or next_line.startswith("#")
                    or re.match(r"^\s*[-*+]\s+", next_line)
                    or re.match(r"^\s*\d+\.\s+", next_line)
                    or next_line.lstrip().startswith(">")
                ):
                    break
                paragraph_lines.append(next_line)
                i += 1

            content = " ".join([p.strip() for p in paragraph_lines]).strip()
            blocks.append(
                {
                    "type": "paragraph",
                    "paragraph": {"rich_text": self._text_obj(content)},
                }
            )

        return blocks

    def _blocks_to_markdown(self, blocks: List[Dict]) -> str:
        lines: List[str] = []
        numbered_index = 1
        for block in blocks:
            block_type = block.get("type")
            if not block_type:
                continue

            def extract_text(rt: List[Dict]) -> str:
                parts = []
                for item in rt or []:
                    text = item.get("text", {}).get("content", "")
                    parts.append(text)
                return "".join(parts)

            if block_type in {"paragraph", "heading_1", "heading_2", "heading_3"}:
                content = extract_text(block[block_type].get("rich_text", []))
                if block_type == "heading_1":
                    lines.append(f"# {content}")
                elif block_type == "heading_2":
                    lines.append(f"## {content}")
                elif block_type == "heading_3":
                    lines.append(f"### {content}")
                else:
                    lines.append(content)
                numbered_index = 1
                continue

            if block_type == "bulleted_list_item":
                content = extract_text(block[block_type].get("rich_text", []))
                lines.append(f"- {content}")
                numbered_index = 1
                continue

            if block_type == "numbered_list_item":
                content = extract_text(block[block_type].get("rich_text", []))
                lines.append(f"{numbered_index}. {content}")
                numbered_index += 1
                continue

            if block_type == "quote":
                content = extract_text(block[block_type].get("rich_text", []))
                lines.append(f"> {content}")
                numbered_index = 1
                continue

            if block_type == "code":
                language = block[block_type].get("language", "plain text")
                content = extract_text(block[block_type].get("rich_text", []))
                lines.append(f"```{language}")
                lines.extend(content.splitlines())
                lines.append("```")
                numbered_index = 1
                continue

        return "\n".join(lines).strip() + "\n" if lines else ""
