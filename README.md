# Notion Workshop

一个基于 TypeScript 的 VS Code 插件示例，目标是在 VS Code 内完成 Notion 的编辑与同步闭环。当前版本提供可运行的最小实现，使用 mock 数据演示“拉取 → 本地编辑 → 推送”的流程。

## 功能

- 在编辑器中打开/保存 Notion 页面（本地 Markdown 文件）
- Pull → Edit → Push 的同步流程与状态反馈
- 命令面板：Notion: Pull / Push / Open Page
- 侧边栏 Webview：页面列表、同步进度、日志
- 配置项：token、databaseId、默认同步路径、过滤条件

## 安装与运行（开发模式）

1. 安装依赖

```
npm install
```

2. 编译

```
npm run compile
```

3. 运行扩展

- 在 VS Code 中按 F5 启动扩展调试窗口。
- 在侧边栏打开 “Notion” 视图，或通过命令面板运行：
	- Notion: Open Page
	- Notion: Pull
	- Notion: Push

## 配置

在 VS Code 设置中搜索 “Notion Workshop”，可配置以下选项：

- `notionWorkshop.token`：Notion 集成 Token
- `notionWorkshop.databaseId`：目标数据库 ID
- `notionWorkshop.defaultSyncPath`：本地同步目录（可相对工作区）
- `notionWorkshop.filter`：按标题过滤页面（包含匹配）

## 使用流程（最小闭环）

1. 执行 Notion: Open Page 或在侧边栏点击“打开”，生成本地 Markdown。
2. 本地编辑保存，日志记录保存事件。
3. 执行 Notion: Push 或侧边栏点击“推送”，更新 mock 数据。

## 说明

- 当前实现使用 mock 数据存储在扩展全局目录，便于演示流程。
- 同步文件会自动写入 `notionWorkshop.defaultSyncPath` 指定目录。
- 后续可替换为真实 Notion API 实现并保留同样的扩展贡献点结构。

## 目录结构（扩展部分）

- src/extension.ts：扩展入口
- src/notionService.ts：mock 同步逻辑
- src/webview/notionViewProvider.ts：侧边栏 Webview
- resources/notion.svg：侧边栏图标
