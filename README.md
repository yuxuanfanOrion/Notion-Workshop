

# Notion Workshop

**[English](./README.md)** | **[中文](./README_CN.md)**

Hi, this is [Eason](https://yuxuanfanorion.github.io/).

This project is still under development. Feel free to open issues or PRs.

This project will be published to the VS Code Marketplace later.

A VS Code extension that lets you browse Notion pages, open them locally as Markdown, edit, and push changes back to Notion.

## ✨ Features

- 🌳 Native tree view for pages and sub-pages
- 📄 Click a page to open it (auto-pull)
- 🔄 Auto-push on save with smart debouncing (2s delay)
- ⚡ Parallel API requests for fast sync
- 💾 Request caching to reduce API calls
- 🗂️ Local sync folders with per-page `<title>.md` (file + folder side by side)
- 📝 Rich block type support (headings, toggles, tables, callouts, and more)

See [Format Mapping](./docs/format-mapping.md) for the complete list of supported Notion blocks.

## 📋 Requirements

- VS Code 1.85+
- A Notion integration token
- The root page shared with your integration

---

## 🚀 Get Started

### Step 1: Create a Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click **+ New integration**
3. Give it a name (e.g., "VS Code Workshop")
4. Select the workspace you want to connect
5. Click **Submit** and copy the **Internal Integration Token** (starts with `ntn_` or `secret_`)

### Step 2: Share Pages with Your Integration

1. Open the Notion page you want to sync
2. Click the **•••** menu in the top right
3. Select **Add connections** → Choose your integration
4. All child pages will be accessible automatically

### Step 3: Configure the Extension

1. Open VS Code
2. Look for the **Notion** icon in the Activity Bar (left sidebar)
3. Click **Configure Notion** or run command: `Notion: Login/Configure`
4. Paste your integration token

### Step 4: Start Working

1. Click **Refresh** (🔄) in the Notion sidebar
2. Your shared pages will appear in the tree view
3. Click any page to open it locally as Markdown
4. Edit and save — changes auto-push to Notion after 2 seconds

### Environment Variables (Optional)

For the Python web server, create a `.env` file:

```env
NOTION_TOKEN=ntn_your_token_here
MARKDOWN_FILE=./data/note.md
HOST=127.0.0.1
PORT=8000
```

---

## 📖 Quick Reference

### Commands

| Command | Description |
|---------|-------------|
| `Notion: Login/Configure` | Set up your Notion token |
| `Notion: Refresh Pages` | Reload pages from Notion |
| `Notion: Push` | Manually push current page |
| `Notion: New Page` | Create a child page |
| `Notion: Focus Root Page` | Set a page as the root for navigation |
| `Notion: Logout` | Clear configuration |

### Settings

Open VS Code settings and search for **Notion Workshop**:

| Setting | Description | Default |
|---------|-------------|---------|
| `notionWorkshop.token` | Notion integration token | `""` |
| `notionWorkshop.databaseId` | Target Notion database ID | `""` |
| `notionWorkshop.filter` | Title filter (substring match) | `""` |

> **Note:** The sync folder path is configured interactively on first use. You'll be prompted to select a folder when you first pull a page.

---

## 📁 Local File Structure

```
notion-sync/
├── My-Project.md           # Parent page content
├── My-Project/             # Folder for child pages
│   ├── Design-Doc.md       # Child page content
│   ├── Design-Doc/         # Grandchildren folder
│   └── Meeting-Notes.md    # Another child page
```

The first line of each `.md` file contains a metadata comment:
```markdown
<!-- notion-id: abc123-def456-... -->
```

> **Note:** Legacy `index.md` structures are automatically migrated to the new layout.

---

## 🛠️ Development

### Build from Source

```bash
git clone https://github.com/yfanorion/Notion-Workshop.git
cd Notion-Workshop
npm install
npm run compile
```

### Run in Development

1. Open the project in VS Code
2. Press `F5` to launch the Extension Development Host
3. The extension will be available in the new window

---

## 🙏 Credits

Thanks to the [Overleaf-Workshop](https://github.com/overleaf-workshop/Overleaf-Workshop) repository for inspiration.

---

## 📄 License

MIT
