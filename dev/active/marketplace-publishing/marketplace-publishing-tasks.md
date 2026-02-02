# Marketplace Publishing Tasks

**Last Updated:** 2026-02-02

## Phase 1: Code Finalization

- [ ] **1.1** Run `npm run compile` and verify no TypeScript errors
  - Acceptance: Clean compilation with no errors or warnings
  - Effort: S

- [ ] **1.2** Run `npm run test` and verify all tests pass
  - Acceptance: All existing tests pass
  - Effort: S

- [ ] **1.3** Test sync path picker manually in Extension Development Host
  - Acceptance: Directory picker opens, navigation works, path saves correctly
  - Effort: M

- [ ] **1.4** Test block batching with a large page (100+ blocks)
  - Acceptance: Page pushes successfully without API errors
  - Effort: M

- [ ] **1.5** Commit all pending changes
  - Acceptance: Clean git status, descriptive commit message
  - Depends on: 1.1, 1.2, 1.3, 1.4
  - Effort: S

---

## Phase 2: Documentation & Branding

- [ ] **2.1** Update CHANGELOG.md with v0.1.0 release notes
  - Acceptance: Entry includes date, features, and breaking changes
  - Effort: S

- [ ] **2.2** Verify README.md renders correctly as Markdown
  - Acceptance: All images load, links work, formatting correct
  - Effort: S

- [ ] **2.3** Validate extension icon meets requirements
  - Acceptance: 128x128 PNG, clear at small sizes
  - Effort: S

- [ ] **2.4** Review package.json metadata
  - Acceptance: Description, keywords, categories are accurate
  - Effort: S

---

## Phase 3: Publisher Setup

- [ ] **3.1** Create Azure DevOps organization (if needed)
  - Acceptance: Organization accessible at dev.azure.com
  - Effort: M

- [ ] **3.2** Generate Personal Access Token with Marketplace scope
  - Acceptance: PAT created with "Marketplace > Manage" permission
  - Effort: S

- [ ] **3.3** Create publisher on VS Code Marketplace
  - Acceptance: Publisher "yfanorion" registered
  - Depends on: 3.1, 3.2
  - Effort: M

- [ ] **3.4** Login vsce with publisher credentials
  - Acceptance: `npx vsce login yfanorion` succeeds
  - Depends on: 3.3
  - Effort: S

---

## Phase 4: Package & Publish

- [ ] **4.1** Run `npx vsce package`
  - Acceptance: notion-workshop-0.1.0.vsix created without errors
  - Depends on: 1.5, 2.1, 2.2, 2.3, 2.4
  - Effort: S

- [ ] **4.2** Test .vsix installation on clean VS Code
  - Acceptance: Extension installs, activates, login works
  - Depends on: 4.1
  - Effort: M

- [ ] **4.3** Publish with `npx vsce publish`
  - Acceptance: Extension visible on Marketplace
  - Depends on: 3.4, 4.2
  - Effort: S

- [ ] **4.4** Verify Marketplace listing
  - Acceptance: Icon, description, README display correctly
  - Depends on: 4.3
  - Effort: S

---

## Phase 5: Post-Publication

- [ ] **5.1** Monitor GitHub issues for 48 hours
  - Acceptance: Respond to any critical bug reports
  - Depends on: 4.3
  - Effort: M

- [ ] **5.2** Check Marketplace reviews
  - Acceptance: Address any user feedback
  - Depends on: 4.3
  - Effort: S

- [ ] **5.3** Plan v0.1.1 if needed
  - Acceptance: Patch release plan created if critical issues found
  - Depends on: 5.1, 5.2
  - Effort: L

---

## Effort Legend

| Size | Description |
|------|-------------|
| S | Small - straightforward task |
| M | Medium - requires some investigation |
| L | Large - significant work |
| XL | Extra Large - major undertaking |
