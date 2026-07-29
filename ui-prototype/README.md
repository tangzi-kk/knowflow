# KnowFlow UI 原型

本目录保存 KnowFlow 的 UI 原型、设计工具元数据和历史样式备份。它已纳入正式 Git 仓库以便备份和追溯，但不是发布时加载的运行代码。

## 与正式产品的关系

- 浏览器正式实现位于 `../extension/`。
- Obsidian 正式实现位于 `../packages/ob-plugin/`。
- 原型中的页面、样式或交互只能作为参考；要进入正式产品，必须在正式源码中重新实现并通过双端验证。
- 不得将 `backup-extension-css/` 直接覆盖到 `extension/`；该目录只是历史样式参考。

## 目录说明

```text
ui-prototype/
├── README.md
├── .canvas-meta.json       # 设计画布元数据
├── .design.json            # 设计工具配置
├── .design-state.json      # 设计工具状态
├── backup-extension-css/   # 历史扩展样式备份
└── react-vite/              # 可独立运行的 React/Vite 原型
```

## 本地预览

从 `ui-prototype/react-vite/` 执行：

```bash
npm ci
npm run dev:design
```

生产构建检查：

```bash
npm run build
```

`node_modules/` 和 `dist/` 是可再生内容，不进入 Git。
