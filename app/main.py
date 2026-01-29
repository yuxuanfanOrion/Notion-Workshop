from __future__ import annotations

import asyncio
import hashlib
import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from markdown import markdown
from pydantic import BaseModel
from notion_client import Client

from app.notion_sync import NotionMarkdownSync


load_dotenv()

HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))
MARKDOWN_FILE = Path(os.getenv("MARKDOWN_FILE", "./data/note.md"))

NOTION_TOKEN = os.getenv("NOTION_TOKEN")
NOTION_PAGE_ID = os.getenv("NOTION_PAGE_ID")

notion_client: Optional[Client] = Client(auth=NOTION_TOKEN) if NOTION_TOKEN else None
notion_sync: Optional[NotionMarkdownSync] = None
if NOTION_TOKEN and NOTION_PAGE_ID:
    notion_sync = NotionMarkdownSync(NOTION_TOKEN, NOTION_PAGE_ID)


class MarkdownPayload(BaseModel):
    markdown: str


class PageSelection(BaseModel):
    page_id: str


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str) -> None:
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except WebSocketDisconnect:
                self.disconnect(connection)


app = FastAPI()
manager = ConnectionManager()
last_hash: Optional[str] = None

static_dir = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
async def index() -> FileResponse:
    return FileResponse(static_dir / "index.html")


@app.get("/api/markdown")
async def get_markdown() -> dict:
    MARKDOWN_FILE.parent.mkdir(parents=True, exist_ok=True)
    if MARKDOWN_FILE.exists():
        content = MARKDOWN_FILE.read_text(encoding="utf-8")
        if content.strip():
            return {"markdown": content}

    if notion_sync:
        content = await asyncio.to_thread(notion_sync.pull_markdown)
        MARKDOWN_FILE.write_text(content, encoding="utf-8")
        return {"markdown": content}

    return {"markdown": ""}


@app.post("/api/markdown")
async def set_markdown(payload: MarkdownPayload) -> dict:
    await apply_update(payload.markdown, push_to_notion=True)
    return {"status": "ok"}


@app.get("/api/pages")
async def list_pages() -> dict:
    if not notion_client:
        return {"status": "not_configured", "pages": []}

    pages = await asyncio.to_thread(fetch_pages)
    return {"status": "ok", "pages": pages}


@app.post("/api/page")
async def set_page(payload: PageSelection) -> dict:
    if not NOTION_TOKEN:
        return {"status": "not_configured"}

    update_notion_sync(payload.page_id)
    content = await asyncio.to_thread(notion_sync.pull_markdown) if notion_sync else ""
    await apply_update(content, push_to_notion=False)
    return {"status": "ok", "markdown": content}


@app.post("/api/pull")
async def pull_from_notion() -> dict:
    if not notion_sync:
        return {"status": "not_configured"}
    content = await asyncio.to_thread(notion_sync.pull_markdown)
    await apply_update(content, push_to_notion=False)
    return {"status": "ok", "markdown": content}


@app.post("/api/preview")
async def preview(payload: MarkdownPayload) -> HTMLResponse:
    html = markdown(payload.markdown, extensions=["fenced_code", "tables"])
    return HTMLResponse(content=html)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        initial = await get_markdown()
        await websocket.send_text(initial["markdown"])
        while True:
            text = await websocket.receive_text()
            await apply_update(text, push_to_notion=True)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


async def apply_update(markdown_text: str, push_to_notion: bool) -> None:
    global last_hash
    MARKDOWN_FILE.parent.mkdir(parents=True, exist_ok=True)
    MARKDOWN_FILE.write_text(markdown_text, encoding="utf-8")
    last_hash = hash_text(markdown_text)

    if push_to_notion and notion_sync:
        await asyncio.to_thread(notion_sync.push_markdown, markdown_text)

    await manager.broadcast(markdown_text)


async def watch_file_changes() -> None:
    global last_hash
    MARKDOWN_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not MARKDOWN_FILE.exists():
        MARKDOWN_FILE.write_text("", encoding="utf-8")

    while True:
        try:
            content = MARKDOWN_FILE.read_text(encoding="utf-8")
        except FileNotFoundError:
            content = ""
        current_hash = hash_text(content)
        if current_hash != last_hash:
            last_hash = current_hash
            if notion_sync:
                await asyncio.to_thread(notion_sync.push_markdown, content)
            await manager.broadcast(content)
        await asyncio.sleep(1)


def hash_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def update_notion_sync(page_id: str) -> None:
    global notion_sync, NOTION_PAGE_ID
    NOTION_PAGE_ID = page_id
    if NOTION_TOKEN and page_id:
        notion_sync = NotionMarkdownSync(NOTION_TOKEN, page_id)
    else:
        notion_sync = None


def fetch_pages() -> list[dict]:
    results: list[dict] = []
    start_cursor: Optional[str] = None
    if not notion_client:
        return results

    raw_pages: list[dict] = []

    while True:
        response = notion_client.search(
            query="",
            filter={"property": "object", "value": "page"},
            start_cursor=start_cursor,
            page_size=50,
        )
        raw_pages.extend(response.get("results", []))

        if not response.get("has_more"):
            break
        start_cursor = response.get("next_cursor")

    page_title_map: dict[str, str] = {}
    page_parent_map: dict[str, Optional[str]] = {}
    page_parent_type: dict[str, Optional[str]] = {}

    for item in raw_pages:
        page_id = item.get("id")
        if not page_id:
            continue
        page_title_map[page_id] = extract_page_title(item)
        parent = item.get("parent", {})
        page_parent_map[page_id] = parent.get("page_id")
        page_parent_type[page_id] = parent.get("type")

    def build_path(page_id: str) -> tuple[list[str], int]:
        path: list[str] = []
        depth = 0
        current_id: Optional[str] = page_id
        while current_id:
            title = page_title_map.get(current_id, "(无标题)")
            path.insert(0, title)
            parent_id = page_parent_map.get(current_id)
            if not parent_id:
                break
            if parent_id not in page_title_map:
                path.insert(0, "(外层页面)")
                break
            depth += 1
            current_id = parent_id
        return path, depth

    for page_id, title in page_title_map.items():
        path, depth = build_path(page_id)
        results.append(
            {
                "id": page_id,
                "title": title,
                "path": " / ".join(path),
                "depth": depth,
                "parent_id": page_parent_map.get(page_id),
                "parent_type": page_parent_type.get(page_id),
            }
        )

    results.sort(key=lambda item: item.get("path", ""))
    return results


def extract_page_title(page: dict) -> str:
    properties = page.get("properties", {})
    for prop in properties.values():
        if prop.get("type") == "title":
            title_items = prop.get("title", [])
            parts = [item.get("text", {}).get("content", "") for item in title_items]
            title = "".join(parts).strip()
            if title:
                return title
    return "(无标题)"


@app.on_event("startup")
async def startup_event() -> None:
    asyncio.create_task(watch_file_changes())
