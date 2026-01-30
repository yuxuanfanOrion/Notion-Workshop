# Changelog

All notable changes to the "Notion Workshop" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-30

### Added
- Native tree view for browsing Notion pages and sub-pages
- Click-to-open pages with automatic pull from Notion
- Auto-push on save with smart 2-second debouncing
- Manual push command for explicit sync
- Create new child pages directly from VS Code
- Focus mode to select a root page for navigation
- Parallel API requests for faster sync performance
- Request caching (5-second TTL) to reduce API calls
- Secure token storage using VS Code SecretStorage API
- Local sync folders with `<title>.md` file structure
- Legacy file structure migration support

### Security
- Tokens stored securely via VS Code SecretStorage API
- API request timeout (30 seconds) to prevent hanging
- No credentials stored in plain text files
