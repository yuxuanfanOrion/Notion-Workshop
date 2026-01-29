from __future__ import annotations

import argparse
import os
from pathlib import Path

from dotenv import load_dotenv

from app.notion_sync import NotionMarkdownSync


def main() -> None:
    load_dotenv()
    token = os.getenv("NOTION_TOKEN")
    page_id = os.getenv("NOTION_PAGE_ID")
    markdown_file = Path(os.getenv("MARKDOWN_FILE", "./data/note.md"))

    if not token or not page_id:
        raise SystemExit("NOTION_TOKEN 或 NOTION_PAGE_ID 未配置")

    markdown_file.parent.mkdir(parents=True, exist_ok=True)
    sync = NotionMarkdownSync(token, page_id)

    parser = argparse.ArgumentParser(description="同步本地 Markdown 与 Notion")
    parser.add_argument("action", choices=["pull", "push"], help="pull 或 push")
    args = parser.parse_args()

    if args.action == "pull":
        content = sync.pull_markdown()
        markdown_file.write_text(content, encoding="utf-8")
        print("已从 Notion 拉取内容")
    else:
        content = markdown_file.read_text(encoding="utf-8") if markdown_file.exists() else ""
        sync.push_markdown(content)
        print("已推送本地内容到 Notion")


if __name__ == "__main__":
    main()
