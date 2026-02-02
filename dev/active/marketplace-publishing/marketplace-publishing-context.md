# Marketplace Publishing Context

**Last Updated:** 2026-02-02

## Key Files

### Core Extension Files
| File | Purpose |
|------|---------|
| `package.json` | Extension manifest, commands, configuration |
| `src/extension.ts` | Entry point, command registration |
| `src/authManager.ts` | Token and sync path management |
| `src/notionService.ts` | Sync orchestration |

### Documentation
| File | Purpose |
|------|---------|
| `README.md` | Marketplace description (English) |
| `README_CN.md` | Chinese documentation |
| `CHANGELOG.md` | Version history |
| `LICENSE` | MIT license |

### Assets
| File | Purpose |
|------|---------|
| `resources/icon.png` | Extension icon |
| `resources/notion.svg` | Activity bar icon |

---

## Key Decisions

### 1. Sync Path Management
**Decision:** Removed `notionWorkshop.defaultSyncPath` config setting
**Rationale:** Interactive directory picker provides better UX
**Impact:** Users select sync folder on first use via dialog

### 2. Block Batching
**Decision:** Batch block appends at 100 per request
**Rationale:** Notion API limit is 100 blocks per append call
**Impact:** Large pages now sync reliably

### 3. Publisher Identity
**Publisher:** `yfanorion`
**Repository:** https://github.com/yfanorion/Notion-Workshop

---

## Dependencies

### Runtime Dependencies
- None (pure VS Code extension API)

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5.5.4 | Compilation |
| @types/vscode | ^1.85.0 | VS Code API types |
| @vscode/test-electron | ^2.3.10 | Testing |
| mocha | ^10.2.0 | Test runner |

### External Services
- Notion API (requires user's integration token)
- Azure DevOps (for Marketplace publishing)

---

## Environment Requirements

- VS Code 1.85.0+
- Node.js (for development)
- vsce CLI (for packaging)

---

## Related Documentation

- [VS Code Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Notion API Docs](https://developers.notion.com/)
- [vsce CLI Reference](https://github.com/microsoft/vscode-vsce)
