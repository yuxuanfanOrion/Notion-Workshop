# Notion Workshop
Hi, this is [Eason](https://yuxuanfanorion.github.io/).

This project is still under development. Feel free to open issues or PRs.

This project will be published to the VS Code Marketplace later.

A VS Code extension that lets you browse Notion pages, open them locally as Markdown, edit, and push changes back to Notion.

## Features

- Native tree view for pages and sub-pages
- Click a page to open it (auto-pull)
- Auto-push on save (manual or auto-save)
- Commands for login, refresh, push, and new page
- Local sync folders with per-page `<title>.md` (file + folder side by side)

## Requirements

- VS Code 1.85+
- A Notion integration token
- The root page shared with your integration

## Quick Start

1. Open the Command Palette and run **Notion: Login/Configure**.
2. Enter your Notion integration token.
3. Enter the root page ID (from the Notion page URL).
4. Click **Refresh** in the sidebar.
5. Click a page to open it (auto-pull on open).
6. Edit the page `<title>.md` and save to auto-push.
7. Use **Notion: New Page** to create a child page under the selected page.

## Commands

- **Notion: Login/Configure**
- **Notion: Refresh Pages**
- **Notion: Push**
- **Notion: New Page**

## Configuration

Open VS Code settings and search for **Notion Workshop**:

- `notionWorkshop.defaultSyncPath`: Local sync folder (relative to workspace root)
- `notionWorkshop.filter`: Title filter (substring match)

## Local Files

Each page is stored as a file and a folder (for its children) at the same level:

```
<sync-path>/<page-title>.md
<sync-path>/<page-title>/

Child pages live under the parent folder and follow the same pattern:

<sync-path>/<page-title>/<child-title>.md
<sync-path>/<page-title>/<child-title>/
```

The first line contains a metadata comment with the page ID.

Legacy migration: old `index.md` structures are automatically migrated to the new layout.

## Credits

Thanks to the [Overleaf-Workshop](https://github.com/overleaf-workshop/Overleaf-Workshop) repository for inspiration.
