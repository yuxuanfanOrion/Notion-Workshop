# Notion Workshop

**[English](./README.md)** | **[中文](./README_CN.md)**

你好，我是 [Eason](https://yuxuanfanorion.github.io/)。

这个项目仍在开发中，欢迎提交 Issue 或 PR。

该项目将在稍后发布到 VS Code 插件市场。

这是一个 VS Code 扩展，可以浏览 Notion 页面、将其作为 Markdown 文件在本地打开、编辑并推送回 Notion。

## ✨ 功能特性

- 🌳 原生树形视图展示页面和子页面
- 📄 点击页面即可打开（自动拉取）
- 🔄 保存时自动推送，智能防抖（2秒延迟）
- ⚡ 并行 API 请求，快速同步
- 💾 请求缓存，减少 API 调用
- 🗂️ 本地同步文件夹，每个页面对应 `<标题>.md`（文件和文件夹并列）
- 📝 丰富的块类型支持（标题、折叠块、表格、标注等）

查看 [格式映射文档](./docs/format-mapping_cn.md) 了解支持的 Notion 块类型完整列表。

## 📋 环境要求

- VS Code 1.85+
- Notion 集成令牌
- 与集成共享的根页面

---

## 🚀 快速开始

### 第一步：创建 Notion 集成

1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 点击 **+ New integration**
3. 输入名称（例如 "VS Code Workshop"）
4. 选择要连接的工作区
5. 点击 **Submit** 并复制 **Internal Integration Token**（以 `ntn_` 或 `secret_` 开头）

### 第二步：与集成共享页面

1. 打开要同步的 Notion 页面
2. 点击右上角的 **•••** 菜单
3. 选择 **Add connections** → 选择你的集成
4. 所有子页面将自动可访问

### 第三步：配置扩展

1. 打开 VS Code
2. 在活动栏（左侧边栏）找到 **Notion** 图标
3. 点击 **Configure Notion** 或运行命令：`Notion: Login/Configure`
4. 粘贴你的集成令牌

### 第四步：开始使用

1. 点击 Notion 侧边栏中的 **刷新**（🔄）
2. 共享的页面将显示在树形视图中
3. 点击任意页面，以 Markdown 格式在本地打开
4. 编辑并保存 — 2秒后自动推送到 Notion

### 环境变量（可选）

用于开发或高级用法，创建 `.env` 文件：

```env
NOTION_TOKEN=ntn_your_token_here
MARKDOWN_FILE=./data/note.md
HOST=127.0.0.1
PORT=8000
```

---

## 📖 快速参考

### 命令

| 命令 | 描述 |
|------|------|
| `Notion: Login/Configure` | 设置 Notion 令牌 |
| `Notion: Refresh Pages` | 从 Notion 重新加载页面 |
| `Notion: Push` | 手动推送当前页面 |
| `Notion: New Page` | 创建子页面 |
| `Notion: Focus Root Page` | 设置页面为导航根节点 |
| `Notion: Logout` | 清除配置 |

### 设置

打开 VS Code 设置，搜索 **Notion Workshop**：

| 设置 | 描述 | 默认值 |
|------|------|--------|
| `notionWorkshop.token` | Notion 集成令牌 | `""` |
| `notionWorkshop.databaseId` | 目标 Notion 数据库 ID | `""` |
| `notionWorkshop.defaultSyncPath` | 本地同步文件夹 | `notion-sync` |
| `notionWorkshop.filter` | 标题过滤器（子字符串匹配） | `""` |

---

## 📁 本地文件结构

```
notion-sync/
├── My-Project.md           # 父页面内容
├── My-Project/             # 子页面文件夹
│   ├── Design-Doc.md       # 子页面内容
│   ├── Design-Doc/         # 孙页面文件夹
│   └── Meeting-Notes.md    # 另一个子页面
```

每个 `.md` 文件的第一行包含元数据注释：
```markdown
<!-- notion-id: abc123-def456-... -->
```

> **注意：** 旧版 `index.md` 结构会自动迁移到新布局。

---

## 🛠️ 开发

### 从源码构建

```bash
git clone https://github.com/yfanorion/Notion-Workshop.git
cd Notion-Workshop
npm install
npm run compile
```

### 开发模式运行

1. 在 VS Code 中打开项目
2. 按 `F5` 启动扩展开发主机
3. 扩展将在新窗口中可用

---

## 🙏 致谢

感谢 [Overleaf-Workshop](https://github.com/overleaf-workshop/Overleaf-Workshop) 仓库提供的灵感。

---

## 📄 许可证

MIT
