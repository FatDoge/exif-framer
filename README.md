# ExifFrame

一个极简的照片工具：上传图片，自动提取 EXIF 元数据，生成优雅的边框并一键下载。

**在线用途**：给作品加上“相机信息边框”，用于社媒分享、作品集展示与打印前预览。

## 功能特性
- 自动解析 EXIF：品牌、型号、镜头、焦距、光圈、快门、ISO、拍摄日期
- HEIC 支持：自动检测并转换为 `PNG`（失败则使用原文件）
- 自定义展示：可编辑元数据、选择边框颜色、切换布局（左/居中/右）
- 高质量导出：基于 DOM 渲染为图片，支持内嵌字体与自定义背景色
- 轻量动画与优雅 UI：交互顺滑，样式简洁

## 技术栈
- 前端框架：`React + TypeScript`
- 构建工具：`Vite`
- 动画与图标：`framer-motion`、`lucide-react`
- 颜色选择器：`react-color`
- EXIF 解析：`exifreader`
- HEIC 转换：`heic-to`
- DOM 导出：`@zumer/snapdom`
- 样式：`TailwindCSS`（通过 CDN 引入）

## 快速开始
- 环境要求：已安装 `Node.js`（推荐 `pnpm`）
- 安装依赖：
  - `pnpm install`
  - 或 `npm install`
- 本地开发：`pnpm dev`（或 `npm run dev`），默认端口 `3000`
- 生产构建：`pnpm build`
- 本地预览构建产物：`pnpm preview`

## 使用说明
- 打开页面后上传图片（支持 `JPG/PNG/WEBP/HEIC`）
- 应用会自动：
  - 检测 HEIC 并尝试转为 `PNG`（`App.tsx:27–37`）
  - 解析 EXIF 并格式化字段（`utils/exifHelper.ts:71–100`）
- 在右侧面板可编辑：品牌、型号、镜头、焦距、光圈、快门、ISO、日期（`components/Controls.tsx:47–214`）
- 选择边框颜色（预设与拾色器），并在“布局”切换左/居中/右（`components/Controls.tsx:132–187`）
- 点击“下载图片”生成成品 PNG（`App.tsx:95–103`）

## 目录结构
- `App.tsx`：页面入口与状态管理、上传/解析/下载逻辑
- `components/UploadZone.tsx`：上传区域与拖拽处理
- `components/PreviewCard.tsx`：成品预览卡片，含品牌图标与元数据排版（`components/PreviewCard.tsx:13–87`）
- `components/Controls.tsx`：右侧控制面板（编辑/颜色/布局/下载）
- `components/BrandIcon.tsx`：品牌图标（内置 Apple/Sony/Canon/Fuji/Nikon/Leica/Hasselblad/Xiaomi/Oppo，未匹配时回退通用相机图标，`components/BrandIcon.tsx:165–181`）
- `utils/exifHelper.ts`：EXIF 读取与格式化（`extractExif`、`formatFocalLength`、`formatFNumber`、`formatISO`、`formatShutter`、`formatDate`）
- `utils/canvasRenderer.ts`：备用的高分辨率 Canvas 渲染方案（当前主流程使用 DOM 导出）
- `types.ts`：类型与默认 EXIF（`types.ts:21–30`）
- `index.html`：基础 HTML、Tailwind 与字体加载
- `index.tsx`：挂载 React 应用
- `vite.config.ts`：Vite 配置（`vite.config.ts:8–11` 服务器端口与主机）

## 关键实现
- EXIF 解析：`extractExif` 统一处理可能的多种返回形式，并做空值兜底（`utils/exifHelper.ts:71–100`）
- 字段格式化：
  - 焦距：`formatFocalLength` 支持分数与单位清理为 `xxmm`（`utils/exifHelper.ts:4–22`）
  - 光圈：`formatFNumber` 规范为 `f/xx`（`utils/exifHelper.ts:24–34`）
  - ISO：`formatISO` 规范为 `ISO xx`（`utils/exifHelper.ts:36–46`）
  - 快门：`formatShutter` 转为带 `s` 的人类可读形式（`utils/exifHelper.ts:48–56`）
- HEIC 处理：先探测再转换，失败时退回原文件（`App.tsx:27–37`）
- 预览渲染：根据边框颜色自动切换暗/亮文本色并清理型号冗余（`components/PreviewCard.tsx:35–44`、`63–85`）
- 品牌图标：按 `make` 识别品牌，未匹配则使用通用图标（`components/BrandIcon.tsx:8–181`）
- 导出成品：基于 `snapdom.download`，自定义文件名、背景色、质量、字体嵌入（`App.tsx:95–103`）

## 配置说明
- 开发服务器：端口 `3000`，主机 `0.0.0.0`（`vite.config.ts:8–11`）
- 环境变量：`vite.config.ts:14–16` 中定义了 `GEMINI_API_KEY` 的映射，当前代码未实际使用，可忽略或后续移除
- 路径别名：`@` 指向项目根目录（`vite.config.ts:17–21`）

## 常见问题
- 无 EXIF 或字段缺失：使用默认空值 `INITIAL_EXIF`（`types.ts:21–30`），可在右侧面板手工填写
- 跨域问题：图片源来自本地上传的 `Blob URL`，下载基于 DOM 渲染，通常不会触发外部跨域限制
- 品牌未识别：将显示通用相机图标（`components/BrandIcon.tsx:165–181`）

## 许可证
- 暂未设置许可证。如需开源分发，请添加合适的 `LICENSE` 并在此处注明

## 致谢
- 依赖：`exifreader`、`heic-to`、`@zumer/snapdom`、`framer-motion`、`react-color`、`lucide-react`
