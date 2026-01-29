# Notion Workshop
Hi, this is [Eason](https://yuxuanfanorion.github.io/).

This project is still under development. Feel free to open issues or PRs.

A VS Code extension that lets you browse Notion pages, pull them to local Markdown, edit, and push changes back to Notion.

## Features

- Native tree view for pages and sub-pages
- Click a page to pull it locally
- Auto-push on save
- Commands for login, refresh, pull, push, and open
- Local sync folders with per-page `index.md`

## Requirements

- VS Code 1.85+
- A Notion integration token
- The root page shared with your integration

## Quick Start

1. Open the Command Palette and run **Notion: Login/Configure**.
2. Enter your Notion integration token.
3. Enter the root page ID (from the Notion page URL).
4. Click **Refresh** in the sidebar.
5. Click a page to pull it locally.
6. Edit `index.md` and save to auto-push.

## Commands

- **Notion: Login/Configure**
- **Notion: Refresh Pages**
- **Notion: Pull**
- **Notion: Push**
- **Notion: Open Page**

## Configuration

Open VS Code settings and search for **Notion Workshop**:

- `notionWorkshop.defaultSyncPath`: Local sync folder (relative to workspace root)
- `notionWorkshop.filter`: Title filter (substring match)

## Local Files

Each page is stored as a folder under the sync path:

```
<sync-path>/<page-title>-<page-id>/index.md
```

The first line contains a metadata comment with the page ID.

## Credits

Thanks to the [Overleaf-Workshop](https://github.com/overleaf-workshop/Overleaf-Workshop) repository for inspiration.
