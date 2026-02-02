# Notion Block to Markdown Format Mapping

**[English](./format-mapping.md)** | **[中文](./format-mapping_cn.md)**

This document shows how Notion blocks are converted to Markdown format.

## Text Blocks

| Notion Block | Markdown Output |
|--------------|-----------------|
| Paragraph | Plain text |
| Heading 1 | `# Heading` |
| Heading 2 | `## Heading` |
| Heading 3 | `### Heading` |

## Toggle Headings

Toggleable headings (headings with expandable content) are converted to HTML `<details>` elements:

**Notion:**
```
▶ Toggle Heading 1
  └─ Child content here
```

**Markdown:**
```html
<details><summary>

# Toggle Heading 1

</summary>

Child content here

</details>
```

## Lists

| Notion Block | Markdown Output |
|--------------|-----------------|
| Bulleted list | `- Item` |
| Numbered list | `1. Item` |
| To-do (unchecked) | `- [ ] Task` |
| To-do (checked) | `- [x] Task` |

Nested list items are indented with 2 spaces per level.

## Toggle Block

**Notion:**
```
▶ Toggle summary
  └─ Hidden content
```

**Markdown:**
```html
<details><summary>Toggle summary</summary>

Hidden content

</details>
```

## Code Block

**Notion:**
```
Code block with language: javascript
console.log("hello");
```

**Markdown:**
````markdown
```javascript
console.log("hello");
```
````

## Quote & Callout

| Notion Block | Markdown Output |
|--------------|-----------------|
| Quote | `> Quoted text` |
| Callout | `> 💡 Callout text` (with emoji icon) |

## Other Blocks

| Notion Block | Markdown Output |
|--------------|-----------------|
| Divider | `---` |
| Image | `![image](url)` |
| Bookmark | `[url](url)` |
| Link preview | `[url](url)` |

## Table

**Notion:**
```
| Col1 | Col2 |
| A    | B    |
| C    | D    |
```

**Markdown:**
```markdown
| Col1 | Col2 |
| --- | --- |
| A | B |
| C | D |
```

## Inline Formatting

| Notion Style | Markdown Output |
|--------------|-----------------|
| **Bold** | `**Bold**` |
| *Italic* | `*Italic*` |
| ~~Strikethrough~~ | `~~Strikethrough~~` |
| `Code` | `` `Code` `` |
| [Link](url) | `[Link](url)` |

## Special Blocks

| Notion Block | Behavior |
|--------------|----------|
| Column list | Content merged inline |
| Synced block | Fetches original content |
| Child page | Skipped (separate file) |
| Child database | Skipped |

## Unsupported Blocks

The following blocks are logged but not converted:
- Embed
- Video
- Audio
- File
- PDF
- Equation
- Breadcrumb
- Table of contents
- Template button
