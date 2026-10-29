# 小说阅读助手

一个免费、开源的浏览器扩展（Manifest V3），为网页小说阅读提供**统一、纯净、舒适的阅读体验**。

经常在网上看小说的朋友都知道，不同小说网站排版五花八门，广告多、字号小、背景刺眼。小说阅读助手会自动统一各个小说站的阅读样式，把网页变成清爽的阅读界面。

## ✨ 功能特性

- 🎨 **统一阅读样式**：自动为各小说网站应用统一的排版、字号、背景色
- 🧹 **纯净阅读**：DOM 层 + 文本层净化，去广告、去干扰，聚焦正文
- 📄 **正文优化**：自动分段、段落整理、合并引号、净化正文内容
- ⚡ **自动翻页**：智能识别"下一页"，预加载 + 链式预读，接近页底自动加载；请求超时自动兜底，不卡死
- 🔖 **进度记忆**：记录阅读位置，下次继续
- ⌨️ **快捷键**：支持自定义快捷键，默认 `O` 打开/关闭阅读模式
- 🗂️ **站点白名单**：可自选启用阅读模式的网站，其余网站不受影响
- 💾 **数据导出/导入**：设置、站点规则、阅读进度一键备份与恢复

## 📦 安装（浏览器扩展）

目前通过**开发者模式**加载安装：

1. 下载安装包：进入仓库右侧 **Releases** → 最新版 → 下载 `.zip` 安装包，解压到本地
2. 打开 Chrome / Edge 浏览器，进入扩展管理页：
   - Chrome：地址栏输入 `chrome://extensions/`
   - Edge：地址栏输入 `edge://extensions/`
3. 打开右上角 **开发者模式** 开关
4. 点击 **加载已解压的扩展程序**，选择本项目解压后的文件夹（含 `manifest.json` 的那个根目录）
5. 安装完成，打开小说网站即可使用

## 🐒 安装（油猴脚本）

不想装扩展的话，也可以用油猴：

1. 浏览器安装 [Tampermonkey](https://www.tampermonkey.net/) / Violentmonkey
2. 下载仓库根目录的 `小说阅读助手.user.js`
3. 拖进浏览器或用脚本管理器「导入」，确认安装即可

## 🛠️ 技术栈

- 浏览器扩展：**Manifest V3**
- 源码：**TypeScript**（`src/*.ts`）
- 构建：**esbuild**（`build.js`），一次产出扩展产物与油猴脚本
- 兼容：Chrome 88+ / Edge 等 Chromium 内核浏览器

## 🔧 开发

```bash
npm install        # 安装依赖
npm run typecheck  # 类型检查（tsc --noEmit）
npm run build      # 构建：dist/*.js + 根目录油猴脚本
npm test           # 单元测试
```

目录结构：

```
src/                TypeScript 源码
  content.ts        内容脚本主逻辑（正文解析、渲染、交互）
  dom.ts            DOM 操作层（jQuery 兼容）
  sites.ts          站点规则库
  adapter.ts        扩展 API ↔ 油猴 API 适配层
  background.ts     后台 service worker
  popup.ts/.html    图标弹窗
  tpl/              内联样式与模板
dist/               构建产物（扩展加载这个）
build.js            构建脚本
test.js             单元测试
manifest.json      扩展清单
```

改完代码跑 `npm run build`，然后在 `chrome://extensions` 里点「重新加载」，油猴脚本需重新导入。

## 📄 许可证

本项目使用 [MIT License](https://github.com/zdl0228/xiaoshuo-reader/blob/main/LICENSE)。欢迎自由使用、修改、分发。
