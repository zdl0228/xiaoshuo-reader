/* =============================================================
 * globals.d.ts — 小说阅读助手 全局类型声明（ES module 架构）
 * content 为唯一入口，经 import 内联 dom/net/sites；不再有跨文件 window 全局通信。
 * 这里只声明两类真正需要的全局：
 *   1) 站点页面自身提供的全局（uuid/bid/booktitle/Title/ReadParams 等，第三方
 *      书源脚本读取，类型放行，仅消除 tsc 报错）；
 *   2) esbuild 以 text loader 内联的模板资源模块（*.css / *.html）。
 * ============================================================= */

/** 站点页面自身提供的全局（第三方站点脚本读取，类型放行） */
interface Window {
  /** Firefox 注入 API 兼容（content.ts 兜底实现） */
  exportFunction?: (...args: any[]) => any;
  /** 页面全局：创世/纵横 等站脚本提供（站点规则分支读取） */
  uuid?: string;
  bid?: string;
  booktitle?: string;
  Title?: string;
  ReadParams?: any;
}

/** content.ts 对页面暴露的 Firefox 注入 API（裸引用，同文件内，非跨文件） */
declare const exportFunction: (...args: any[]) => any;

/** esbuild 以 text loader 内联的模板资源模块（src/tpl/*.css / *.html） */
declare module '*.css' {
  const content: string;
  export default content;
}
declare module '*.html' {
  const content: string;
  export default content;
}
