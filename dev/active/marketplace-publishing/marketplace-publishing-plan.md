# VS Code Marketplace Publishing Plan

**Last Updated:** 2026-02-02

## Executive Summary

This plan outlines the steps required to publish Notion Workshop v0.1.0 to the VS Code Marketplace. The extension is functionally complete with pending improvements to sync path management and API batch handling. This plan covers pre-publication checklist, marketplace setup, and post-publication monitoring.

---

## Current State Analysis

### Strengths
- Clean modular architecture with separation of concerns
- Comprehensive Notion block support (paragraphs, headings, lists, code, tables, etc.)
- Intelligent caching and batching for API performance
- Secure token storage via VS Code secrets
- Interactive sync path configuration
- Well-documented codebase (CLAUDE.md, README, format-mapping docs)

### Pending Changes (Uncommitted)
| File | Change |
|------|--------|
| `src/authManager.ts` | New sync path management with interactive picker |
| `src/notion/api/blocks.ts` | Batch processing for 100-block API limit |
| `src/notionApiClient.ts` | Simplified block appending logic |
| `src/notionService.ts` | Removed redundant batching |
| `package.json` | Removed `defaultSyncPath` config |
| `README.md` / `README_CN.md` | Minor updates |

### Gaps to Address
1. No automated tests for new sync path functionality
2. Missing CHANGELOG entry for v0.1.0
3. Publisher account setup required
4. Extension icon and branding verification needed

---

## Proposed Future State

A published VS Code extension available on the Marketplace with:
- All pending changes committed and tested
- Complete documentation and changelog
- Proper publisher branding
- Monitoring for user feedback and issues

---

## Implementation Phases

### Phase 1: Code Finalization
**Goal:** Commit pending changes and ensure code quality

1. Review and test all pending changes locally
2. Run TypeScript compilation without errors
3. Execute existing test suite
4. Commit changes with descriptive message

### Phase 2: Documentation & Branding
**Goal:** Ensure professional presentation

1. Update CHANGELOG.md with v0.1.0 release notes
2. Verify README screenshots and instructions
3. Validate extension icon (128x128 PNG recommended)
4. Review package.json metadata (description, keywords, categories)

### Phase 3: Publisher Setup
**Goal:** Configure Azure DevOps and vsce

1. Create/verify Azure DevOps organization
2. Generate Personal Access Token (PAT)
3. Create publisher on VS Code Marketplace
4. Configure vsce with publisher credentials

### Phase 4: Package & Publish
**Goal:** Build and submit extension

1. Run `npx vsce package` to create .vsix
2. Test .vsix installation locally
3. Publish with `npx vsce publish`
4. Verify listing on Marketplace

### Phase 5: Post-Publication
**Goal:** Monitor and respond to feedback

1. Monitor GitHub issues for bug reports
2. Track Marketplace reviews and ratings
3. Plan v0.1.1 patch if critical issues found

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| PAT token issues | Medium | High | Follow Azure DevOps docs carefully |
| Icon rejection | Low | Medium | Use 128x128 PNG, no transparency issues |
| Missing dependencies | Low | High | Test .vsix on clean VS Code install |
| API rate limits in production | Medium | Medium | Already implemented retry logic |

---

## Success Metrics

- [ ] Extension published and visible on Marketplace
- [ ] Installation count > 0 within first week
- [ ] No critical bugs reported in first 48 hours
- [ ] README renders correctly on Marketplace page

---

## Required Resources

### Tools
- Node.js and npm
- vsce CLI (`npm install -g @vscode/vsce`)
- Azure DevOps account

### Credentials
- Azure DevOps Personal Access Token (Marketplace scope)
- GitHub account for repository link

### Time Investment
- Phase 1: Code review and commit
- Phase 2: Documentation updates
- Phase 3: Account setup (may require email verification)
- Phase 4: Package and publish
- Phase 5: Ongoing monitoring
