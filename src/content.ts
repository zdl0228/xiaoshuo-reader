/* =============================================================
 * 小说阅读助手 浏览器扩展版 content.js（Manifest V3）
 * 由独立文件 dom.js + content.js（主逻辑，已并入原 storage.js 运行时库）提供
 * ============================================================= */

// 模板资源（由 esbuild --loader:.html=text / .css=text 内联为字符串）
import tplMainHtml from './tpl/main.html';
import tplMainCss from './tpl/main.css';
import tplPreferencesHTML from './tpl/preferences.html';
import tplPreferencesCSS from './tpl/preferences.css';


/* =============================================================
 * [M0] 运行时库（原 storage.js，已并入本文件）
 * 提供配置持久化、样式注入、跨域请求、打开标签等运行时能力，
 * 以 window 全局 Store/Net/addStyle/openInTab/appInfo 暴露给主逻辑。
 *
 * 关键策略：
 *  1. Store.get/set/list/remove → chrome.storage.local
 *     启动时一次性预加载全部配置到内存缓存，后续同步读内存、异步写回，
 *     保证 content.js 主体（大量同步读取）无需改动。
 *  2. Net.fetch → 经 background 转发（content script 受 CORS 限制）
 *  3. addStyle → 直接注入 <style>
 *  4. openInTab → 经 background chrome.tabs.create
 * ============================================================= */
// ES module 入口：content.ts 作为唯一 content script 入口，import 底层模块并打包为单文件。
// 依赖单向：dom（工具）/ net（网络）→ sites（规则）→ content（主逻辑）。
import { XS, toRE } from './dom';
import { SITE_RULES } from './sites';
import { Request } from './net';

// [v3.0] 油猴全局（仅 Tampermonkey/Violentmonkey 存在，扩展版无此全局，运行时用 typeof 守卫）。
declare const GM_registerMenuCommand: any;

'use strict';

// ---- 存储层：内存缓存 + 异步落盘 ----
  let __store: Record<string, any> = {};
  let __loaded = false;
  let __loadTimedOut = false;   // 预加载超时（拿不到真实存储），此时禁止用默认值覆盖磁盘
  let __loadPromise: any = null;

  function loadAll() {
    if (__loadPromise) return __loadPromise;
    // chrome.storage 读取可能较慢或被延迟；加超时兜底，避免 content.js 的
    // await __loadAll() 长期挂起（挂起会导致扩展版不自动进入阅读模式、净化/翻页全失效）。
    __loadPromise = new Promise(function (resolve) {
      let done = false;
      function finish(store: any) {
        if (done) return;
        done = true;
        __store = store || {};
        __loaded = true;
        resolve(__store);
      }
      try {
        chrome.storage.local.get(null, function (items) {
          finish(items);
        });
      } catch (e) {
        finish(null);
      }
      // 超时兜底：2.5s 内读取未完成也视为"已加载"，后续写入的值仍可读
      setTimeout(function () {
        if (!done) __loadTimedOut = true;
        finish(__store);
      }, 2500);
    });
    return __loadPromise;
  }

  // ---- 配置读写（同步外观） ----
  let Store = {
    get: function (key: string, def?: any) {
      // 优先返回缓存中已有的值（包括本会话内已写入、但存储尚未完成预加载的值）。
      // 这修复了"注入块 Store.set('launchMode','auto') 后，isAutoLaunch 仍读回默认值
      // → 不自动进入阅读模式"的根因。
      if (key in __store) return __store[key];
      if (!__loaded) return def;   // 极端情况：预加载完成前调用且从未写入该 key
      return def;
    },
    set: function (key: string, value: any) {
      __store[key] = value;
      try {
        chrome.storage.local.set({ [key]: value }, function () {});
      } catch (e) {}
    },
    remove: function (key: string) {
      delete __store[key];
      try {
        chrome.storage.local.remove(key, function () {});
      } catch (e) {}
    },
    list: function () {
      return Object.keys(__store);
    }
  };

  // ---- 样式注入 ----
  function addStyle(css: string) {
    let style = document.createElement('style');
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
    return style;
  }

  // ---- 跨域请求：Net / Request 已归入 net.ts（ES module）。
  //     content 主逻辑不直接引用 Net；sites.ts 个别书源分支经 Request 间接使用。 ----

  // ---- 打开新标签 ----
  function openInTab(url: string, active: boolean) {
    chrome.runtime.sendMessage({ action: 'xs_open_tab', url: url, active: !!active });
  }

  // ---- 应用信息 ----
  let appInfo = {
    script: {
      name: '小说阅读助手',
      description: '小说阅读助手：统一阅读样式、去广告、段落整理、自动翻页、进度记忆、快捷键',
      includes: ['*://*/*'],
      excludes: []
    }
  };

  // ---- 立即开始预加载存储 ----
  // ES module：Store / addStyle / openInTab / appInfo 为模块顶层，主逻辑 IIFE 直接访问；
  // loadAll 亦为顶层函数（popup 已移除，无需经 window.__runtime 暴露）。
  loadAll();


/* ---- 主逻辑 ---- */
/* =============================================================
 * 小说阅读助手 浏览器扩展版 content.js（Manifest V3）
 * 主逻辑：正文提取、净化、翻页、快捷键与设置。
 * 运行库：dom.js；存储/运行时（原 storage.js）已并入本文件；站点规则：sites.js。
 * ============================================================= */

(function () {


  'use strict';

  /* global XS, Store, Net, addStyle, openInTab, appInfo, document, window,
  location, history, localStorage, setTimeout, clearTimeout, console, Promise,
  Set, WeakMap, prompt, MutationObserver, DOMParser, NodeFilter, WheelEvent,
  MouseEvent, getComputedStyle, CSSFontFaceRule, Blob, URL, FileReader,
  exportFunction */

  /* =====================================================================
   * 模块导航索引（单文件内结构化模块化，逻辑零改动）
   * ---------------------------------------------------------------------
   * M0  运行时与全局     IIFE / 'use strict' / window 映射
   * M1  基础配置与常量   config / window 映射
   * M2  通用工具函数     本地存储 L_* / parseHTML / toRE / wildcard /
   *                     getUrlHost / sleep / DOMContentLoaded / Request /
   *                     getTextNodesIn / getBooleanConfig
   * M3  设置对象 Setting 全部可读写设置项 + 快捷键 + 站点启用
   * M4  站点规则与映射   sites(SiteRules) / CHAR_ALIAS / ParseDefaults / PurifyRules
   * M5  正文处理工具     tpl_mainHtml / 书名识别 / 归一化 / HTML清洗 /
   *                     渲染 / 字体 / 观察器
   * M6  内容净化         applyContentSettings（文本层）/ applyDomClean（DOM层）
   * M7  正文解析器       Parser：章节/正文提取与站点规则执行
   * M8  样式与面板模板   tpl_mainCss / tpl_preferencesHTML / tpl_preferencesCSS
   * M9  资源常量         Res
   * M10 界面 UI          阅读界面 / 设置面板 / reapplyContentClean
   * M11 事件清理与翻页辅  cleanupEvents / RequestStatus / iframeHeight
   * M12 主应用 app     init / launch / processPage / registerControls /
   *                     registerKeys / 自动滚动 / doRequest / addNextPage
   * M13 启动注入         注入块 / 扩展增强监听 / 兜底按钮
   * ===================================================================== */

  
//#region [M1] 基础配置与常量
  // =====================================================================
  // [模块 M1] 基础配置与常量
  // 职责：脚本运行常量 config 等基础配置
  // =====================================================================
  const config = {

    soduso: false,                  // www.sodu.so 跳转
    // content_replacements: true,     // 小说屏蔽字修复

    xhr_time: 15 * 1000,
  };


  //------------------- 辅助函数 ----------------------------------------


  if (typeof window.exportFunction == 'undefined') {
      // 兜底：若环境未提供 exportFunction，则补充一个简单实现。
      window.exportFunction = (function(foo: any, scope: any, defAs: any) {
          scope[defAs.defineAs] = foo;
      }).bind(window);
  }

  // [已删除] 日志功能：原输出到浏览器 console 的调试日志已整体移除（排错直接在开发者工具中观察），
  // 不再保留 logStore 日志层与 C 调用对象，全部 C.* 调用点一并删除。
//#endregion
//#region [M2] 通用工具函数

  // =====================================================================
  // [模块 M2] 通用工具函数
  // 职责：parseHTML / toRE / wildcard / getUrlHost /
  //       sleep / DOMContentLoaded / Request / getTextNodesIn / getBooleanConfig
  // 依赖：无（仅用原生 + dom.js 工具层）
  // =====================================================================
  function parseHTML(str: string) {
      let doc;
      try {
          // firefox and chrome 30+，Opera 12 会报错
          doc = new DOMParser().parseFromString(str, "text/html");
      } catch (ex) {}

      if (!doc) {
          doc = document.implementation.createHTMLDocument("");
          doc.querySelector("html")!.innerHTML = str;
      }
      // [安全] sanitize HTML，防止 XSS 攻击
      // 删除所有 on* 属性（onclick、onerror、onload 等）
      var allElements = doc.querySelectorAll('*');
      for (var i = 0; i < allElements.length; i++) {
          var el = allElements[i];
          var attrs = el.attributes;
          for (var j = attrs.length - 1; j >= 0; j--) {
              var attrName = attrs[j].name.toLowerCase();
              if (attrName.startsWith('on')) {
                  el.removeAttribute(attrs[j].name);
              }
          }
      }
      // 删除所有 javascript: 协议的链接
      var links = doc.querySelectorAll('a[href]');
      for (var i = 0; i < links.length; i++) {
          var href = links[i].getAttribute('href');
          if (href && href.toLowerCase().startsWith('javascript:')) {
              links[i].removeAttribute('href');
          }
      }
      // [修复] 不再删除 <script> 节点：
      //   ① DOMParser 产出的文档是惰性的，脚本不会执行，删除并不带来安全性收益；
      //   ② 大量站点规则靠「读内联脚本参数」拿上一页/下一页/目录地址
      //      （sites.ts 里 $doc.find('script:contains(...)') 共 5 处，如有度中文网、
      //      某站 ReadParams 等），此前这里把 script 全删了，导致这些站点翻页时
      //      contentPatch 取不到参数 → 下一页地址为空 → 只在第一章能翻，之后停住。
      //   脚本文本混入正文的风险在正文提取阶段处理（dom.cleanContent 会移除 script/style/noscript）。
      return doc;
  }

  // toRE（正则缓存工具）已移至 dom.ts 并 export，本文件经 import 使用；此处保留 toReStr。
  function toReStr(str: string) {  // 处理字符串，否则可能会无法用正则替换
      return str.replace(/[()\[\]{}|+.,^$?\\*]/g, "\\$&");
  }

  function wildcardToRegExpStr(urlstr: any) {
      if (urlstr.source) return urlstr.source;
      let reg = urlstr.replace(/[()\[\]{}|+.,^$?\\]/g, "\\$&").replace(/\*+/g, function(str: string){
          return str === "*" ? ".*" : "[^/]*";
      });
      return "^" + reg + "$";
  }

  function getUrlHost(url: string) {
      let a = document.createElement('a');
      a.href = url;
      return a.host;
  }

  function sleep(timeout: number) {
      return new Promise(resolve => setTimeout(resolve, timeout))
  }

  // 等待 DOMContentLoaded 事件触发
  function DOMContentLoaded(){
      return new Promise(resolve => XS(resolve))
  }

  // Request（Net.fetch Promise 包装）已移至 net.ts 并 export，供 sites.ts 经 import 使用；
  // 本文件主逻辑不直接调用 Request。


  // https://stackoverflow.com/a/4399718
  // 获取所有文本节点
  function getTextNodesIn(node: Node, includeWhitespaceNodes: boolean) {
      let textNodes: any[] = [],
          nonWhitespaceMatcher = /\S/;

      function getTextNodes(node: Node) {
          if (node.nodeType == 3) {
              if (includeWhitespaceNodes || nonWhitespaceMatcher.test(node.nodeValue!)) {
                  textNodes.push(node);
              }
          } else {
              for (let i = 0, len = node.childNodes.length; i < len; ++i) {
                  getTextNodes(node.childNodes[i]);
              }
          }
      }
      node.normalize();
      getTextNodes(node);
      return textNodes
  }

  /* jshint ignore: start */


  if (typeof String.prototype.startsWith != 'function') {
      String.prototype.startsWith = function(str) {
          return this.slice(0, str.length) == str;
      };
  }

  if (typeof String.prototype.endsWith != 'function') {
      String.prototype.endsWith = function(str) {
          return this.slice(-str.length) == str;
      };
  }

  if (!String.prototype.includes) {
      String.prototype.includes = function(search, start) {
          if (typeof start !== 'number') {
              start = 0;
          }
          if (start + search.length > this.length) {
              return false;
          } else {
              return this.indexOf(search, start) !== -1;
          }
      };
  }


  /* jshint ignore: end */

  let getBooleanConfig = function(configName: string, defaultValue: boolean) {
      let config = Store.get(configName);
      if(config === undefined) {
          // [修复] 存储尚未加载完成（或预加载超时）时不能把默认值写回存储：
          // 此时 Store 里是空的，写默认值会把用户已保存的 true/false 覆盖掉，
          // 表现为「刷新页面后开关自己变回默认」。只在确认读到过真实存储后才落盘。
          if (__loaded && !__loadTimedOut) {
              Store.set(configName, defaultValue);
          }
          config = defaultValue;
      }
      return config;
  };

  //#endregion
  //#region [M3] 设置对象 Setting
  // =====================================================================
  // [模块 M3] 设置对象 Setting
  // 职责：全部可读写设置项（皮肤/字体/排版/净化/翻页/快捷键/站点启用等）
  // 依赖：Store.get/Store.set、config
  // =====================================================================
  const Setting: { [key: string]: any } = {
      // },

      // 自动滚动阅读速度（像素/秒，1-100，默认 20）——与设置面板滑块 min/max 保持一致
      get auto_scroll_speed() {
          let v = parseInt(Store.get('auto_scroll_speed', 20), 10);
          if (isNaN(v)) return 20;
          return Math.min(100, Math.max(1, v));
      },
      set auto_scroll_speed(speed) {
          let v = parseInt(String(speed), 10);
          if (isNaN(v)) v = 20;
          Store.set('auto_scroll_speed', String(Math.min(100, Math.max(1, v))));
      },

      get remain_height() {  // 距离底部多少高度（px）开始加载下一页
          if(this._remain_height === void 0){
              this._remain_height = parseInt(Store.get("remain_height"), 10) || 400;
          }
          return this._remain_height;
      },
      set remain_height(val) {
          this._remain_height = val;
          Store.set("remain_height", val);
      },


      get font_family() {
          let saved = Store.get("font_family");
          if (saved) return saved;
          // 平台自适应默认字体：macOS 优先苹方 PingFang SC，Windows 优先微软雅黑（各 4 种）
          let isMac = /Macintosh|Mac OS X/.test(navigator.userAgent);
          return isMac ? "PingFang SC,苹方-简,宋体,楷体"
                       : "微软雅黑,宋体,黑体,楷体";
      },
      set font_family(val) {
          Store.set("font_family", val);
      },

      get font_size() {  // 字体大小
          return Store.get("font_size") || "20px";
      },
      set font_size(val) {
          Store.set("font_size", val);
      },

      get text_line_height(){
          return Store.get("text_line_height") || "1.5em";
      },
      set text_line_height(val){
          Store.set("text_line_height", val);
      },

      get paragraph_height(){
          return Store.get("paragraph_height") || "0.5em";
      },
      set paragraph_height(val){
          Store.set("paragraph_height", val);
      },

      get content_width() {  // 内容宽度
          return Store.get("content_width") || "1000px";
      },
      set content_width(val) {
          Store.set("content_width", val);
      },


      get custom_siteinfo() {
          return Store.get('custom_siteinfo', '[]');
      },
      set custom_siteinfo(val) {
          Store.set('custom_siteinfo', val);
      },


      get skin_name() {
          return Store.get("skin_name") || "自动";
      },
      set skin_name(val) {
          Store.set("skin_name", val);
      },

      get menu_list_hidden() {
          // [修复拼写] 旧 key 是 menu_list_hiddden（多了一个 d），启动时自动迁移
          if (this._menu_list_hidden === void 0) {
              let oldVal = Store.get("menu_list_hiddden");
              if (oldVal !== undefined) {
                  // 迁移旧值到新 key
                  Store.set("menu_list_hidden", oldVal);
                  Store.remove("menu_list_hiddden");
                  this._menu_list_hidden = oldVal;
              } else {
                  this._menu_list_hidden = getBooleanConfig("menu_list_hidden", true);
              }
          }
          return this._menu_list_hidden;
      },
      set menu_list_hidden(bool) {
          this._menu_list_hidden = bool;
          Store.set("menu_list_hidden", bool);
      },


      


      // === 快捷键

      // 打开设置窗口的快捷键
      get open_preferences_key() {
          if (this._open_preferences_key) {
              return this._open_preferences_key;
          }
          this._open_preferences_key = Store.get('open_preferences_key') || 'o';

          return this._open_preferences_key;
      },
      set open_preferences_key(keyCode) {
          this._open_preferences_key = keyCode;
          Store.set('open_preferences_key', keyCode);
      },

      // 隐藏左侧章节列表的快捷键
      get hide_menu_list_key() {  // 默认为 c
          // 'C'.charCodeAt(0) = 67
          if (this._hide_menu_list_key) {
              return this._hide_menu_list_key;
          }
          // [兼容迁移] 旧 key 是 hide_menulist_key（menulist 应该是 menu_list），统一改成 hide_menu_list_key
          if (this._hide_menu_list_key === void 0) {
              let oldVal = Store.get('hide_menulist_key');
              if (oldVal !== undefined) {
                  Store.set('hide_menu_list_key', oldVal);
                  Store.remove('hide_menulist_key');
                  this._hide_menu_list_key = oldVal;
              } else {
                  this._hide_menu_list_key = Store.get('hide_menu_list_key') || 'c';
              }
          }

          return this._hide_menu_list_key;
      },
      set hide_menu_list_key(key) {
          this._hide_menu_list_key = key;
          Store.set("hide_menu_list_key", key);
      },


      get preload_next_page() {
          // 预加载默认关闭：有自动翻页了，不需要后台预读，省流量也不容易触发站点风控
          // [兼容迁移] 旧 key 是驼峰 preloadNextPage，统一改成下划线 preload_next_page
          if (this._preload_next_page === void 0) {
              let oldVal = Store.get('preloadNextPage');
              if (oldVal !== undefined) {
                  Store.set('preload_next_page', oldVal);
                  Store.remove('preloadNextPage');
                  this._preload_next_page = oldVal;
              } else {
                  this._preload_next_page = Store.get('preload_next_page', false);
              }
          }
          return this._preload_next_page;
      },
      set preload_next_page(bool) {
          this._preload_next_page = bool;
          Store.set('preload_next_page', bool);
      },

      get smart_next_page() {  // 智能下一页：找不到下一页链接时按网址页码规律递增
          // [兼容迁移] 旧 key 是驼峰 smartNextPage，统一改成下划线 smart_next_page
          if (this._smart_next_page === void 0) {
              let oldVal = Store.get('smartNextPage');
              if (oldVal !== undefined) {
                  Store.set('smart_next_page', oldVal);
                  Store.remove('smartNextPage');
                  this._smart_next_page = oldVal;
              } else {
                  this._smart_next_page = Store.get('smart_next_page', true);
              }
          }
          return this._smart_next_page;
      },
      set smart_next_page(bool) {
          this._smart_next_page = bool;
          Store.set('smart_next_page', bool);
      },


      // 内容优化：合并多行引号/标点清洗/全半角转换/自动强制分段（会调整原文排版，默认关，需时再开）
      get content_optimize() {
          // [兼容迁移] 旧 key 是驼峰 contentOptimize，统一改成下划线 content_optimize
          if (this._content_optimize === void 0) {
              let oldVal = Store.get('contentOptimize');
              if (oldVal !== undefined) {
                  Store.set('content_optimize', oldVal);
                  Store.remove('contentOptimize');
                  this._content_optimize = oldVal;
              } else {
                  this._content_optimize = Store.get('content_optimize', false);
              }
          }
          return this._content_optimize;
      },
      set content_optimize(bool) {
          this._content_optimize = bool;
          Store.set('content_optimize', bool);
      },

      // 快速启动

      
  };


  // [清理] 正文内容净化已并入 dom 层（始终执行、无开关），移除已废弃的开关存储与一次性迁移标记；
  // 旧版本可能在 Store 残留这两个 key，主动清除以免随导出/恢复默认残留。
  Store.remove('contentNormalize');
  Store.remove('cn_default_on_migrated');
  // [清理] 日志不再写入扩展存储（仅输出浏览器 console），清除旧版本残留在 Store 的历史日志
  Store.remove('xs_logs');

  // [重构 2.1] 站点白名单（xs_enabled_sites）已移除：不再按"在此网站启用阅读器"自动进入，
  // 对齐主流阅读器改为"手动触发 + 对当前页解析"。
//#endregion
//#region [M4] 站点规则与字符映射

  // ===== 自定义站点规则 =====

  /**@typedef { import("../../typings/小说阅读助手").SiteConfigs } SiteConfigs */

  /**@type {SiteConfigs} */
  // =====================================================================
  // [模块 M4] 站点规则与字符映射
  // 职责：站点规则 SiteRules(sites+customRules) / 字符别名 CHAR_ALIAS / 正文解析默认值 ParseDefaults / 净化规则 PurifyRules
  // 依赖：Setting
  // =====================================================================
  // 站点规则库独立在 sites.ts（ES module，content 作为入口打包时经 import 内联本文件）。
  // 组成：主流阅读器续更版 v8.0.5 站点规则 + Legado 书源移植（完整规则见 sites.ts，由 SITE_RULES 导出）。
  const sites = Array.isArray(SITE_RULES) && SITE_RULES.length
      ? SITE_RULES
      : [ /* 兜底：规则未注入时为空规则集，走通用/启发式匹配 */ ];


  // 广告过滤已移除（统一交由浏览器广告拦截扩展处理，脚本不再内置）

  // Unicode/2000-2FFF：http://zh.wikibooks.org/wiki/Unicode/2000-2FFF
  // Unicode/F000-FFFF：https://zh.wikibooks.org/wiki/Unicode/F000-FFFF

  // replace 中的简写
  let CHAR_ALIAS: { [key: string]: any } = {
    '\\P': '[\\u2000-\\u2FFF\\u3004-\\u303F\\uFE00-\\uFF60\\uFFC0-\\uFFFF]',  // 小说中添加的特殊符号
  };

  // ===== 自动尝试的规则 =====
  let ParseDefaults = {


    titleRegExp: /第?\s*[一二两三四五六七八九十○零百千万亿0-9１２３４５６７８９０〇]{1,6}\s*[章回卷节折篇幕集话話]/i,


    titleReplace: /^章节目录|^文章正文|^正文卷?|全文免费阅读|最新章节|\(文\)/,
    // nextRegExp: /[上前下后][一]?[页张个篇章节步]/


    nextSelector: "a[rel='next'], a:contains('\u4E0B\u4E00\u9875'), a:contains('\u4E0B\u4E00\u9801'), a:contains('\u4E0B\u4E00\u7AE0'), a:contains('\u4E0B\u4E00\u8282'), a:contains('\u4E0B\u9875'), a:contains('\u4E0B\u7AE0')",


    prevSelector: "a[rel='prev'], a:contains('\u4E0A\u4E00\u9875'), a:contains('\u4E0A\u4E00\u9801'), a:contains('\u4E0A\u4E00\u7AE0'), a:contains('\u4E0A\u4E00\u8282'), a:contains('\u4E0A\u9875'), a:contains('\u4E0A\u7AE0')",
    // 忽略的下一页链接，匹配 href

    nextUrlIgnore: [
      /(?:(?:index|list|last|LastPage|end)\.)|BuyChapterUnLogin|^javascript:/i,
      // qidian
      // /BookReader\/LastPageNew\.aspx/i,
      // /read\.qidian\.com\/BookReader\/\d+,0\.aspx$/i,
      /read\.qidian\.com\/$/i,
      /book\.zongheng\.com\/readmore/i,
      /www\.shumilou\.com\/to-n-[a-z]+-\d+\.html/i,
      /\/0\.html$/i
    ],


    nextUrlCompare: /\/\d+([_-]\d+)?\.html?$|\/wcxs-\d+-\d+\/$|chapter-\d+\.html$|\/\d+_\d+\/$|\/\d+\/\d+$/i,
    // 忽略的下一页链接（特殊），跟上一页比较
    // 按顺序匹配，匹配到则停止。econtains 完全相等

    indexSelectors: [
      "a[href='index.html']",
      "a:contains('\u8FD4\u56DE\u4E66\u76EE')",
      "a:contains('\u7AE0\u8282\u76EE\u5F55')",
      "a:contains('\u7AE0\u8282\u5217\u8868')",
      "a:econtains('\u6700\u65B0\u7AE0\u8282')",
      "a:contains('\u56DE\u76EE\u5F55')",
      "a:contains('\u56DE\u4E66\u76EE')",
      "a:contains('\u76EE \u5F55')",
      "a:contains('\u76EE\u5F55')"
    ],


    contentSelectors: [
      "#nr_content",
      ".nr_content",
      "#nr",
      ".nr_nr",
      "#nr1",
      "#reader-content",
      "#pagecontent",
      "#contentbox",
      "#bmsy_content",
      "#bookpartinfo",
      "#htmlContent",
      "#text_area",
      "#chapter_content",
      "#chapterContent",
      "#chaptercontent",
      "#partbody",
      "#BookContent",
      "#read-content",
      "#article_content",
      "#BookTextRead",
      "#booktext",
      "#book_text",
      "#BookText",
      "#BookTextt",
      "#readtext",
      "#readcon",
      "#read",
      "#TextContent",
      "#txtContent",
      "#text_c",
      "#txt_td",
      "#TXT",
      "#txt",
      "#zjneirong",
      "#contentTxt",
      "#oldtext",
      "#a_content",
      "#contents",
      "#content2",
      "#contentts",
      "#content1",
      "#content",
      "#booktxt",
      "#nr",
      "#rtext",
      "#articlecontent",
      "#novelcontent",
      "#text-content",
      "#articlebody",
      "#ChapterContents",
      "#acontent",
      "#chapterinfo",
      "#read_content",
      "#chapter-content",
      ".novel_content",
      ".readmain_inner",
      ".noveltext",
      ".booktext",
      ".yd_text2",
      ".articlecontent",
      ".readcontent",
      ".txtnav",
      ".content",
      ".art_con",
      ".article",
      "article"
    ],
    // 尝试查找书名。顶部章节导航的最后一个链接可能是书名。

    bookTitleSelector: [
      ".h1title > .shuming > a[title]",
      ".chapter_nav > div:first > a:last",
      "#header > .readNav > span > a:last",
      'div[align="center"] > .border_b > a:last',
      ".ydselectedect > .weizhi > a:last",
      ".bdsub > .bdsite > a:last",
      "#sitebar > a:last",
      ".con_top > a:eq(1)",
      ".con_top > a:last",
      ".breadCrumb > a:last",
      ".breadcrumb > a:last",
      ".bookNav > a:last",
      ".srcbox > a:last",
      ".con_top > .nr_s1 > a:last",
      ".location > a:last",
      ".nav > a:last",
      ".DivCurrentPos > a:last",
      ".layout-tit > a:last",
      ".ymdz > a:last",
      ".articletitle > a",
      ".chepnav > a:last",
      ".bread_crumbs a:last",
      ".weizhi a:last",
      ".breadcrumbs a:last",
      ".cover-nav a:last",
      ".path > .p > a:last",
      ".headlink > .linkleft > a:last",
      ".path a:last",
      ".readNav a:last",
      ".chapter-nav a:last",
      ".bread > a:nth-child(3)",
      ".bread a:last"
    ],


    bookTitleReplace: [
      "\u5168\u6587\u9605\u8BFB$",
      "\u5728\u7EBF\u9605\u8BFB$",
      "\u6700\u65B0\u7AE0\u8282$",
      "^\u6B63\u6587\u5377"
    ],

  };

  let PurifyRules = {


    contentRemove: "script, iframe, a, audio, style, button", // 内容移除选择器
    // 文本层整行净化规则：净化始终执行，仅丢弃「整行完全匹配」的杂质行，绝不修改小说原文文字/缩进/空行

    trashLineRules: [
      // ===== 双保险说明 =====
      // 以下与 handleContentText2 的 DOM 层整块删除构成「双保险」：DOM 层删独立控件块，
      // 文本层删混入正文的独立行。二者刻意重复覆盖（打赏/上一章下一章/目录/下载App/
      // 扫一扫/添加书签/本章说/作者作家说/字数行/纯数字行等），即使某层因站点改版失效，
      // 另一层仍能兜底。请勿当作冗余清理删除。
      "^[()]$",
      "^\u6B63\u6587$",
      "^\u767B\u5F55$",
      "^\u8BA8\u8BBA\u70ED\u70C8[^\\n]{0,30}\u6BB5\u8BC4",
      "^[^\\n]{0,40}?\\d+\u5B57\\s*\\d{4}\u5E74\\d{1,2}\u6708\\d{1,2}\u65E5[^\\n]{0,20}$",
      "^\u672C\u7AE0(\u542B|\u5171)\\d+\u6761(\u8BC4|\u6BB5\u8BC4)",
      "^\\d+\u5B57 \\d{2}:\\d{2}",
      "^[^\\n]{0,15}?\\d{4}[-\u5E74]\\d{1,2}[-\u6708]\\d{1,2}\u65E5?[^\\n]{0,20}$",
      "^(\u4F5C\u8005\u6709\u8BDD\u8BF4|\u4F5C\u8005\u7559\u8A00|\u4F5C\u8005\u7684\u8BDD|PS|Ps|ps)[:\uFF1A]?[^\\n]{0,50}",
      "^(\u672C\u7AE0\u611F\u8A00|\u611F\u8A00|\u5C0F\u7F16\u8BF4|\u7F16\u8005\u6309|\u672A\u5B8C\u5F85\u7EED|\u5F85\u7EED|\u4E0B\u7AE0\u9884\u544A)[^\\n]{0,40}",
      "^(\\[|\u3010)\\s*\u7B2C?\\d+\u9875\\s*(\\]|\u3011)",
      "^(\u5206\u9875\u9605\u8BFB|\u4E0A\u4E00\u9875|\u4E0B\u4E00\u9875|>>>\u7FFB\u5230\u4E0B\u4E00\u9875|\u7FFB\u9875\u9605\u8BFB)[^\\n]*",
      "^(\u6295\u6708\u7968|\u6295\u63A8\u8350\u7968|\u6253\u8D4F\u4F5C\u8005|\u6253\u8D4F\u672C\u4E66|\u63A8\u8350\u672C\u4E66|\u70B9\u51FB\u6536\u85CF|\u52A0\u5165\u4E66\u67B6|\u70B9\u51FB\u89E3\u9501|\u5F00\u901AVIP|VIP\u7AE0\u8282|\u672C\u7AE0\u4ED8\u8D39)[^\\n]*",
      "^(\u63A8\u8350\u9605\u8BFB|\u70B9\u51FB\u9605\u8BFB|\u540C\u7C7B\u5C0F\u8BF4|\u66F4\u591A\u597D\u4E66|\u4F5C\u8005\u8FD8\u5199\u8FC7)[^\\n]{0,40}",
      "^\\s*(\\S+\xB7)?(\u4F5C\u8005|\u4F5C\u5BB6)\u8BF4\\s*$",
      "^\\s*\u4E0A\u8D77\u70B9\u4E2D\u6587\u7F51\u652F\u6301\u6211[^\\n]*$",
      "^\\s*[^\\n]{0,40}?\u6253\u8D4F\u4E86\\d+(\u4E07|\u5343)?(\u8D77\u70B9)?(\u70B9?\u5E01|\u70B9)$",
      "^\\s*\u6DFB\u52A0\u4E66\u7B7E$",
      "^\\s*\u626B\u4E00\u626B\uFF0C\u624B\u673A\u63A5\u7740\u8BFB$",
      "^\\s*\u672C\u7AE0\u8BF4\\s*\\d{0,6}\\s*$",
      "^\\s*(\u4E0B\u8F7DApp|\u4E0B\u8F7DAPP|\u4E0B\u8F7D\u5BA2\u6237\u7AEF|\u6253\u5F00App|\u7ACB\u5373\u4E0B\u8F7D)\\s*$",
      "^\\s*\u6253\u8D4F\\s*[\u2070\xB9\xB2\xB3\u2074\u2075\u2076\u2077\u2078\u2079\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089\\d]{0,4}\\s*$",
      "^\\s*(\u6253\u8D4F\u699C|\u6253\u8D4F\u5217\u8868|\u6700\u8FD1\u6253\u8D4F|\u672C\u7AE0\u6253\u8D4F|\u6253\u8D4F\u8BB0\u5F55)\\s*$",
      "^\\s*(\u4E0A\u4E00\u7AE0|\u4E0B\u4E00\u7AE0|\u76EE\u5F55|\u7AE0\u8282\u76EE\u5F55|\u7AE0\u8282\u5217\u8868|\u56DE\u76EE\u5F55)\\s*$",
      "^\\s*\\d{1,8}\u5B57\\s*$",
      "^\\s*\\d{1,5}\\s*$",
      "^\u5148\u5B9A\u4E2A\u5C0F\u76EE\u6807\uFF0C\u6BD4\u59821\u79D2\u8BB0\u4F4F\uFF1A .*",
      "^\u70ED\u95E8\u63A8\u8350\uFF1A.*",
      "^\u731C\u60A8\u559C\u6B22\uFF1A.*",
      "^.*\u8BF7\u4F60\u5148\u6536\u85CF\u6B64\u9875\u5427\uFF0C\u65B9\u4FBF\u7B49\u4E0B\u9605\u8BFB\u54AF\u2026\u2026",
      "^.*\u66F4\u65B0\u4E2D\u2026\u2026\u52AA\u529B\u66F4\u65B0\u4E2D\u2026\u2026.*",
      "^\u672C\u7AD9\u5DF2\u66F4\u6539\u57DF\u540D\uFF0C\u6700\u65B0\u57DF\u540D\uFF1A.*",
      "^.*\u6B63\u5728\u624B\u6253\u4E2D\uFF0C\u8BF7\u7A0D\u7B49\u7247\u523B[\uFF0C\u3002].*",
      "^.*\u5168\u6587\u5B57\u66F4\u65B0,\u7262\u8BB0\u7F51\u5740:.*",
      "^\u5C0F\u8BF4\u5206\u7C7B\uFF1A.*",
      "^\u672C\u4E66\u6765\u6E90.*",
      "^\u672C\u4E66\u6765\u81EA.*",
      "^.*\u6B22\u8FCE\u5E7F\u5927\u4E66\u53CB\u5149\u4E34\u9605\u8BFB\uFF0C\u6700\u65B0\u3001\u6700\u5FEB\u3001\u6700\u706B\u7684\u8FDE\u8F7D\u4F5C\u54C1\u5C3D\u5728.*",
      "^\u604B\u4E0A\u4F60\u770B\u4E66\u7F51.*",
      "^.*\u624B\u673A\u9605\u8BFB\u5730\u5740.*",
      "^.*\u4E3A\u4F60\u63D0\u4F9B\u6700\u5FEB\u7684.*?\u66F4\u65B0\uFF0C.*",
      "^.*\u6700\u65B0\u7AE0\u8282 \u8BF7\u5173\u6CE8\\(\\)",
      "^.*\u8001\u57DF\u540D(?:\\(.*?\\))?\u88AB\u5899\uFF0C\u8BF7\u60A8\u7262\u8BB0\u672C\u7AD9\u6700\u65B0\u57DF\u540D(?:\\(.*?\\))?",
      "^\u4F5C\u8005\uFF1A.*?\u5206\u7C7B\uFF1A.*",
      "^@@\\?\\s*",
      "^txt\u4E0B\u8F7D\u5730\u5740\uFF1A.*",
      "^.*\u624B\u673A\u7248\u9605\u8BFB\u7F51\u5740\uFF1A.*",
      "^(?:\u672C\u4E66)?\u624B\u673A\u9605\u8BFB\uFF1A.*",
      "^.*\\(?https?://.*",
      "^\\s*(?:\u4E0B\u8F7D|\u6253\u5F00|\u5B89\u88C5|\u524D\u5F80|\u4F7F\u7528)(?:APP|app|\u5BA2\u6237\u7AEF|\u5E94\u7528|\u8D77\u70B9\u8BFB\u4E66).{0,20}$",
      "^\\s*[^\\n]{0,25}?(?:\u524D\u5F80|\u8BF7|\u53BB|\u70B9\u51FB|\u89C2\u770B|\u9605\u8BFB\u5168\u6587|\u770B\u5B8C\u6574\u7248|\u4E0B\u8F7D)(?:APP|\u5BA2\u6237\u7AEF|\u5E94\u7528|\u8D77\u70B9\u8BFB\u4E66)[^\\n]{0,20}\\s*$",
      "^\\s*(?:\u672C\u7AE0)?\u672A\u5B8C[^\\n]{0,20}?(?:\u524D\u5F80|\u8BF7|\u70B9\u51FB|\u9605\u8BFB)(?:APP|\u5BA2\u6237\u7AEF|\u5E94\u7528)[^\\n]{0,20}\\s*$",
      "^\\s*(?:\u6C42\u6708\u7968|\u6C42\u63A8\u8350\u7968|\u6C42\u63A8\u8350|\u6C42\u8BA2\u9605|\u6C42\u6536\u85CF|\u6C42\u7968|\u6C42\u66F4\u65B0|\u50AC\u66F4|\u8FFD\u66F4|\u6295\u7968\u652F\u6301|\u70B9\u8D5E\u652F\u6301|\u6295\u51FA\u4F60\u5B9D\u8D35\u7684\u4E00\u7968)[^\\n]{0,30}\\s*$",
      "^\\s*(?:\u7248\u6743\u6240\u6709|\u76D7\u7248\u5FC5\u7A76|\u8BF7\u52FF\u8F6C\u8F7D|\u7981\u6B62\u8F6C\u8F7D|\u8C22\u7EDD\u8F6C\u8F7D|\u4FB5\u6743\u5FC5\u7A76|\u672A\u7ECF\u6388\u6743)[^\\n]{0,20}\\s*$",
      "^\\s*[\u3010\\[\uFF08(]\\s*(?:\u9996\u53D1|\u72EC\u5BB6|\u6765\u6E90|\u8F6C\u8F7D|\u7248\u6743|\u6B63\u7248)[^\\n]{0,30}\\s*[\u3011\\]\uFF09)]\\s*$",
      "^\\s*(?:\u672C\u7AD9|\u7F51\u7AD9|\u672C\u4E66)?(?:\u5730\u5740|\u7F51\u5740|\u57DF\u540D|\u6765\u6E90|\u9996\u53D1)[:\uFF1A]?[^\\n]{0,40}\\s*$"
    ],

    // DOM 层整块杂质净化正则（原 dom.ts cleanContent 内嵌默认值，收拢为数据；引擎只执行）
    trashBlockReg: /^(?:本章说\d{0,6}|(?:\S+·)?(?:作者|作家)说|上起点中文网支持我[^\n]*|下载App|下载APP|下载客户端|打开App|立即下载|打赏(?:了)?\d{0,8}(?:万|千)?(?:起点)?(?:点|币)?|打赏榜|打赏列表|最近打赏|本章打赏|打赏记录|扫一扫，手机接着读|上一章|下一章|目录|章节目录|章节列表|回目录|添加书签|\d{1,8}字|\d{1,5}|讨论热烈[^\n]{0,30}段评|阅文集团|本作品由起点中文网进行电子制作与发行|@版权所有侵权必究|与[0-9.]+万?位书友[^\n]{0,40}|「盟主」[^\n]{0,30}(?:「堂主」[^\n]{0,30})?|第[0-9一二三四五六七八九十百千]+章[^\n]{0,40}|类型|上架|连载中\(字\)|都市|[^\n]*◎著|反馈|指南|举报|旧版|著|请记住[\s\S]{0,120}唯一[\s\S]{0,10}网[\s\S]{0,4}址[\s\S]{0,80}站[\s\S]{0,4}长[\s\S]{0,60}其它[\s\S]{0,12}网[\s\S]{0,4}站[\s\S]{0,20}断[\s\S]{0,4}更[\s\S]{0,6}|\d{1,6}(?:\.\d{1,2})?万)$/,

    // 渲染层净化：整行仅 1-5 位数字（段评点赞数/楼号标记）
    trashLineNumReg: /^\s*\d{1,5}\s*$/,
    // 渲染层净化：段尾段评数字（起点段评数，如 "……情绪。58" → "……情绪。"）
    trashTailNumReg: /([\u4e00-\u9fa5。！？…」』”"）:：,，;；])\s*\d{1,5}$/,
    // 文本层净化：章节标题后的分页标记 " (第1/2页)" / "（第1/2页）"（保留章节名，去页码后缀）
    pageMarkReg: /^([^\n]{0,60}?)\s*[（(]\s*第\s*\d+\s*\/\s*\d+\s*页\s*[)）]\s*$/gm,

  };

  let SiteRules = {
    specialSite: sites,


    customRules: [] as any[],

  };

  //#endregion
  //#region [M5] 正文处理与 DOM 工具


  // =====================================================================
  // [模块 M5] 正文处理与 DOM 工具
  // 职责：阅读界面模板 tpl_mainHtml / 书名识别 / 字符归一化（toCDB·toDBC /
  //       getNormalizeMap）/ DOM 观察器 / HTML 清洗渲染（htmlFmt·cleanHTML·
  //       renderHTML·escapeHtml）/ 字体尺寸
  // 依赖：M4 ParseDefaults/PurifyRules、M2 工具
  // =====================================================================
  let tpl_mainHtml = tplMainHtml;

  const autoBookTitleSelector = ParseDefaults.bookTitleSelector;

  function autoGetBookTitle($doc: any) {
      let bookTitle = '';
      // 依次获取
      for (let s of autoBookTitleSelector) {
          let $node = $doc.find(s);
          if ($node.length === 1) {
              bookTitle = $node.text();
              break
          }
      }

      // 排除一些无效的？

      return bookTitle
  }

  // 正文内容标准化替换

  let replaceNormalizeMap: Record<string,string> | null = null;
  let replaceNormalizeMapForOpt: Record<string,string> | null = null; // 记录构建 map 时的 contentOptimize 开关值

  function getNormalizeMap() {
    // map 内「合并跨行引号」规则依赖 contentOptimize 开关；开关变化时需重建，否则切开关不生效
    if (replaceNormalizeMap && replaceNormalizeMapForOpt === Setting.content_optimize) {
      return replaceNormalizeMap
    }
    const rule: { [key: string]: any } = {
      '[,，]\\s*': '，', // 合并每一行以"，"结束的段落和去除"，"后的空格
      '\\s^，': '，', // 合并每一行以"，"开头的段落
      '\\s^”': '”', // 合并每一行以右引号开头的段落
      '\\. *$': '。',
      '\\.([”"])': '。$1',
      '([。！？”]) +': '$1',
      '，+': '，',
      '"(.*?)"': '“$1”',
      '”“': '”\n“', // 将一段中的相邻的对话分段
      // 将一段中的含多个句号、感叹号、问号的句子每句分为多段
      '([。！？])([\\u4e00-\\u9fa5“][\\u4e00-\\u9fa5“，]{20,})': '$1\n$2',
      // 将一段中的第一句后接对话（引号）句子的第一句话分段
      '(^.*?[.。])(“.*?”)': '$1\n$2',
      // 将一段中的右引号后面的内容分为一段
      '([。！？])”(?![\\u4e00-\\u9fa5，]+，“)([\\u4e00-\\u9fa5“，]{20,})':
        '$1”\n$2',
      '“([\\s\\S]*?)”': Setting.content_optimize
        ? (match: string) => match.replace(toRE('\n'), '')
        : undefined,
      '「(.*?)」': '“$1”',
      '『(.)』': '$1',
      '[┅。…·.]{3,20}': '……',
      '[~－]{3,50}': '——'
    };
    Object.keys(rule).forEach(key => !rule[key] && delete rule[key]);
    replaceNormalizeMap = rule;
    replaceNormalizeMapForOpt = Setting.content_optimize;
    return rule
  }

  // 不转换 ，？：；（）！
  const excludeCharCode = new Set([
    65292, 65311, 65306, 65307, 65288, 65289, 65281
  ]);

  // 全角转半角
  function toCDB(str: string) {
    let tmp = '',
      charCode;
    for (let i = 0; i < str.length; i++) {
      charCode = str.charCodeAt(i);
      if (
        charCode > 65248 &&
        charCode < 65375 &&
        !excludeCharCode.has(charCode)
      ) {
        tmp += String.fromCharCode(charCode - 65248);
      } else {
        tmp += str.charAt(i);
      }
    }
    return tmp
  }

  const includeCharCode = new Set([44, 63, 58, 59, 40, 41, 33]);

  // 半角转全角
  // 只转换，？：；（）！
  function toDBC(str: string) {
    let tmp = '',
      charCode;
    for (let i = 0; i < str.length; i++) {
      charCode = str.charCodeAt(i);
      if (includeCharCode.has(charCode)) {
        tmp += String.fromCharCode(charCode + 65248);
      } else {
        tmp += str.charAt(i);
      }
    }
    return tmp
  }

  // 等待页面上的元素出现
  function observeElement(
    doc: any,
    {
      contentSelector,
      mutationSelector,
      mutationChildText,
      mutationChildCount,
      mutationCheck
    }: any
  ) {
    let $doc = XS(doc);

    let contentSize = $doc.find(contentSelector).length;

    if (contentSize && !mutationSelector) {
      return
    }

    let target = $doc.find(mutationSelector)[0];

    if (!target) {
      return
    }

    let check = true;

    if (typeof mutationCheck === 'function') {
      check = mutationCheck($doc);
    }

    let beforeTargetChilren = target.children.length;

    // 未找到加载中标志文本
    const textNotFound = mutationChildText && !target.textContent.includes(mutationChildText);

    if (textNotFound && check) {
      return
    }

    // 节点孩子数量足够多（一般正文的节点数量会多于加载时）
    const childCountEnough = mutationChildCount !== undefined && target.children.length > mutationChildCount;

    if (childCountEnough && check) {
      return
    }

    if ((textNotFound || childCountEnough) && !check) {
      // 正文已生成，但检查函数还未通过，设置为 0 使得 nodeAdded 始终为 true
      beforeTargetChilren = 0;
    }

    return new Promise<void>(resolve => {
      let observer = new MutationObserver(function () {
        const t = $doc.find(mutationSelector)[0];
        if (!t) return;   // 目标节点可能被站点重建/移除，避免读 children 抛错中断回调
        let nodeAdded = t.children.length > beforeTargetChilren;
        let check = true;
        if (nodeAdded && typeof mutationCheck === 'function') {
          check = mutationCheck($doc);
        }

        if (nodeAdded && check) {
          observer.disconnect();
          resolve();
        }
      });

      // [修复] 原来固定观察顶层 document，但本函数会被 iframe 翻页流程以
      // observeElement(iframeDoc, ...) 调用：观察对象错成了主页面，
      // iframe 内正文渲染完成也收不到任何 mutation → promise 永不 resolve →
      // 翻页状态卡在 Loading，直到超时兜底 40s 后才判 Fail（表现为「一直正在载入」）。
      // 观察传入的 doc 根（同源 iframe 文档同样受支持）。
      observer.observe((doc && doc.nodeType) ? doc : document, {
        childList: true,
        subtree: true
      });

    })
  }

  // 等待 DOM 稳定
  function domMutation() {
    return new Promise<void>(resolve => {
      // 连续变异的页面（广告轮播 / 计时器 DOM）永远等不到 100ms 静默，会让调用方一直卡在这里
      // → 既不自动进入阅读模式、也不显示入口按钮。加一个硬上限兜底。
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        try { observer.disconnect(); } catch (e) {}
        clearTimeout(hardTimer);
        resolve();
      };
      const fn: any = () => {
        clearTimeout(fn._t);
        fn._t = setTimeout(finish, 100);
      };
      const observer = new MutationObserver(fn);
      observer.observe(document, {
        childList: true,
        subtree: true
      });
      const hardTimer = setTimeout(finish, 5000);
      fn();
    })
  }

  const r$1 = String.raw;
  const spaceRegex = toRE(r$1`&nbsp;|&ensp;|&emsp;`),
    noPrintRegex = toRE(r$1`&thinsp;|&zwnj;|&zwj;`),
    wrapHtmlRegex = toRE(r$1`</?(?:div|p|br|hr|h\d|article|dd|dl)[^>]*>`),
    indent1Regex = toRE(r$1`\s*\n+\s*`),
    indent2Regex = toRE(r$1`^[\n\s]+`),
    lastRegex = toRE(r$1`[\n\s]+$`),
    otherHtmlRegex = toRE(r$1`</?[a-zA-Z]+(?=[ >])[^<>]*>`);

  function htmlFmt(text: string, otherRegex = otherHtmlRegex) {
    text = text.replace(toRE('\ufeff|\u200b'), '');
    text = text.replace(spaceRegex, ' ');
    text = text.replace(noPrintRegex, '');
    text = text.replace(wrapHtmlRegex, '\n');
    text = text.replace(otherRegex, '');
    text = text.replace(indent1Regex, '\n');
    text = text.replace(indent2Regex, '');
    text = text.replace(lastRegex, '');
    // Unescape HTML entities
    text = parseHTML(text).documentElement.textContent;

    return text
  }

  /**
   * 清除 HTML 代码，保留格式
   * 说明：文本节点内空白会被压缩为单空格，再经 htmlFmt 按块级标签重新分段；
   * 最终阅读排版（段落/空行）由 renderHTML 逐行生成，不依赖原文空白，
   * 故「保留原文缩进/空行」的承诺由渲染层保证，而非本层。
   * @param {Document} doc
   * @returns {string}
   */
  function cleanHTML(doc: any) {
    const treeWalker = document.createTreeWalker(doc, NodeFilter.SHOW_COMMENT);
    while (treeWalker.nextNode()) {
      (treeWalker.currentNode as Element).remove();
    }

    // 模拟渲染文本节点
    getTextNodesIn(doc, true)
      .filter(n => n.data !== '\n')
      .forEach(n => (n.data = n.data
          .replace(/[\u2000-\u200F\u2028\u2029\uFEFF]/g, '')   // 清理零宽空白/U+20系列残码
          .trim()
          .replace(/\s+/g, ' ')));

    return htmlFmt(doc.outerHTML)
  }

  // 文本层净化：仅丢弃「整行完全匹配」杂质规则的行，绝不修改小说原文文字/缩进/空行
  const _trashLineRegs = new WeakMap();  // 按规则数组缓存编译后的正则，避免每次净化重建
  function filterTrashLines(text: string, rules: any) {
    if (!text) return text
    // 按原换行符切分；逐行判断：仅整行命中杂质规则才丢弃，未命中行原样保留（不 trim、不改字符、不改换行、不删空行）
    const lines = text.split(/\r?\n/);
    let res = _trashLineRegs.get(rules);
    if (!res) { res = rules.map((rs: string) => new RegExp(rs, 'im')); _trashLineRegs.set(rules, res); }
    const kept: string[] = [];
    for (const line of lines) {
      let trash = false;
      for (const re of res) {
        if (re.test(line)) { trash = true; break }
      }
      if (!trash) kept.push(line)
    }
    return kept.join('\n')
  }

  // 渲染：把净化后的纯文本逐行包成 <p>（段首两个全角空格属阅读排版，恒执行）。
  // 删独立成行的段评数字行/去段尾段评数字属「净化（始终执行，去杂质）」范畴，
  // 与「正文内容优化」开关（仅控制 applyContentSettings 的标点/全半角/空行/分段规整）无关。
  function renderHTML(text: string) {
    text = text
      .split('\n')
      .filter((t: string) => !!t.trim())
      // 清除独立成行的段评点赞数/楼号标记（整行仅1-5位数字）
      .filter((t: string) => !PurifyRules.trashLineNumReg.test(t))
      // 清除段尾的段评数字标记（起点段评数，如 "……情绪。58" → "……情绪。"）
      .map((t: string) => t.replace(PurifyRules.trashTailNumReg, '$1'))
      .map((t: string) => `<p>　　${escapeHtml(t)}</p>`)
      .join('\n');

    return `<div class="content">${text}</div>`
  }

  // https://stackoverflow.com/a/22706073
  const p = document.createElement("p");
  function escapeHtml(text: string) {
    p.textContent = text;
    return p.innerHTML
  }

  function getElemFontSize(_heading: HTMLElement) {
      let fontSize = 0;
      let _heading_style = window.getComputedStyle(_heading, null);
      if (_heading_style) {
          // firefox57 2017年9月10日 会错误
          try {
              let str = _heading_style.getPropertyValue("font-size") || 0;
              fontSize = parseInt(String(str), 10);
          } catch(e) { }
//#endregion
//#region [M6] 内容净化（文本层 + DOM 层）
      }

      return fontSize
  }

  // ================================================
  // [04.5] 正文文本净化/优化（开关即时重应用共用）
  // 输入「净化/优化前」的原始正文文本，按当前开关状态返回处理后的文本
  // 供 handleContentText2（首次加载）与 reapplyContentClean（切开关即时还原/重应用）复用
  // ================================================
  // =====================================================================
  // [模块 M6] 内容净化（文本层 + DOM 层）
  // 职责：applyContentSettings（正文去杂质始终执行 + 优化随开关）、
  //       applyDomClean（DOM 层净化：隐藏元素/章节标题/contentRemove/杂质块）
  // 依赖：M4 Rule、M5 归一化与清洗工具
  // =====================================================================
  function applyContentSettings(content: any, host: any, replaceText: any) {
      // 净化（正文内容净化已并入 dom 层默认能力，始终执行）：仅丢弃「整行完全匹配」杂质规则的行，绝不修改小说原文文字/缩进/空行
      // 删除含网站域名行（整行丢弃）；host 为空时跳过，避免误删
      if (host) {
          const hostEsc = toReStr(host);
          const hostVariant = hostEsc.replace(/^www\./i, '');
          const hostRe = toRE(`^.*?(?:${hostEsc}|${hostVariant}).*?$`);
          content = content.replace(hostRe, () => '');
      }
      // 按整行过滤杂质行
      content = filterTrashLines(content, PurifyRules.trashLineRules);
      // 移除正文行尾的分页标记：章节标题后的 " (第1/2页)" / "（第1/2页）"（保留章节名，去掉页码后缀）
      content = content.replace(PurifyRules.pageMarkReg, '$1');

      // 内容优化（独立开关，默认关）：移除不可见字符/修剪行首尾空格/规整全半角标点/修复引号配对/压缩连续空行/合并多行引号
      if (Setting.content_optimize) {
          content = content.replace(/[\u200B-\u200D\uFEFF\u2060\u00AD\u200E\u200F\u061C\u202A-\u202E]/g, '');
          content = content.split('\n').map((line: string) => line.replace(/^[ \t\u3000]+|[ \t\u3000]+$/g, '')).join('\n');
          content = toDBC(toCDB(content));
          // 完整标点/引号规整（与首次加载一致，含合并多行引号/按句分段等）
          if (typeof replaceText === 'function') {
              content = replaceText(content, getNormalizeMap());
          } else {
              content = content.replace(/「(.*?)」/g, '“$1”').replace(/『(.)』/g, '$1');
              content = content.replace(/[┅。…·.]{3,20}/g, '……').replace(/[~－]{3,50}/g, '——');
              content = content.replace(/\s*[,，]\s*/g, '，').replace(/,+/g, '，');
              content = content.replace(/([。！？])\s*/g, '$1');
          }
          content = content.replace(/\n[ \t]*\n(?:\n[ \t]*)+/g, '\n\n');
      }
      return content;
  }

  // DOM 层净化（收拢在 dom.js 的 cleanContent：隐藏元素/章节标题/contentRemove/整块杂质块）
  // 供首次加载（handleContentText2）与切开关重建（reapplyContentClean）共用
  // 净化始终执行（无开关）；站点 contentRemove 规则由调用方装配传入
//#endregion
//#region [M7] 正文解析器 Parser
  function applyDomClean($div: any, info: any) {
      $div.cleanContent({
          contentRemove: PurifyRules.contentRemove,
          extraRemove: (info && info.contentRemove) || null,
          trashReg: PurifyRules.trashBlockReg
      });
  }


  // =====================================================================
  // [模块 M7] 正文解析器 Parser
  // 职责：章节/正文提取与站点规则执行，产出标准正文结构供渲染
  // 依赖：M4 Rule / sites、M5 工具、M6 净化
  // =====================================================================
  interface Parser { [key: string]: any }
  function Parser(this: any, ...args: any[]){
      this.init.apply(this, arguments);
  }

  Parser.prototype = {
      constructor: Parser,

      init: function (this: any, info: any, doc: any, curPageUrl: any) {
          // 站点规则
          this.info = info || {};
          this.doc = (info.cloneNode && doc.defaultView) ? doc.cloneNode(true) : doc;
          this.$doc = XS(this.doc);
          this.curPageUrl = curPageUrl || doc.URL;
          this._curPageHost = getUrlHost(this.curPageUrl);  // 当前页的 host，后面用到

          // 设置初始值
          this.isTheEnd = false;
          this.isSection = false;

          if (doc.defaultView && doc.defaultView.$cleanupEvents) {
              doc.defaultView.$cleanupEvents(true);
          }
          
      },
      applyPatch: function (this: any){
          let contentPatch = this.info.contentPatch;
          if(contentPatch){
              try {
                  contentPatch.call(this, this.$doc);
              } catch (e) {
              }
          }
      },
      applyAsyncPatch: async function (this: any) {
          let contentPatch = this.info.contentPatchAsync;
          if(contentPatch){
              try {
                  await contentPatch.call(this, this.$doc);
              } catch (e) {
              }
          }
      },
      getAll: async function (this: any){

          this.applyPatch();

          await this.applyAsyncPatch();

          await this.preProcessDoc();

          this.parse();

          return this;
      },
      preProcessDoc: async function (this: any) {
          let data;

          if (!this.hasContent() && this.info.getContent) {
              data = await this.info.getContent.call(this, this.$doc);
              this.$content = null;
          } 
          if (data) {
              let div;
              if (data.content) {
                  div = XS('<div id="content"></div>').html(data.content);
              } else if (data.html) {
                  div = XS('<div></div>').html(data.html);
              }

              this.$doc.find('body').prepend(div);
          }

      },
      parse: function (this: any) {
          this.getPrevUrl();
          this.getIndexUrl();
          this.getNextUrl();

          this.getTitles();

          this.getContent();
      },

      hasContent: function (this: any) {
          if (this.$content) {
              return this.$content.length > 0;
          }

          let $content;

          // }

          // 排除 qidian 需付费的页面
          if (this.info.isVipChapter) {
              if (this.info.isVipChapter(this.$doc)) {
                  this.isTheEnd = 'vip';
                  return false;
              }
          }

          // 正文容器有效性校验（站点规则与默认选择器共用同一标准）：
          // 硬门槛只有两条——中文文本量≥200、链接文本占比<50%。选择器可能很宽泛
          // （如 .content / #content / article），首页/目录/列表页也能匹配到元素，
          // 而这类页面的文字几乎都包在 <a> 里，占比远高于 50%，足以挡住误判。
          // 注意：链接「数量」不能当硬门槛——正文容器里常混着推荐/相关链接块（8~10 条很常见），
          // 硬性限制会让正常章节被整章拒绝，所以链接数只作为「多候选择优」的打分项。
          let _cnLen = function(el: any){
              let _txt = (el.textContent || '').replace(/[\s\u3000]+/g, '');
              return { txt: _txt, cn: (_txt.match(/[\u4e00-\u9fff]/g) || []).length };
          };
          let _isContentNode = function(el: any){
              if (!el || el.nodeType !== 1) return false;
              let _m = _cnLen(el);
              if (_m.cn < 200) return false;
              let _links = el.querySelectorAll('a');
              let _linkLen = 0;
              for (let _li = 0; _li < _links.length; _li++) {
                  _linkLen += (_links[_li].textContent || '').replace(/[\s\u3000]+/g, '').length;
              }
              if (_m.txt.length > 0 && _linkLen / _m.txt.length > 0.5) return false; // 链接密集，像目录
              return true;
          };
          // 多个候选都合规时择优：中文越多越像正文，链接越多越像导航（每条链接罚 10 字）
          let _contentScore = function(el: any){
              let _m = _cnLen(el);
              return _m.cn - el.querySelectorAll('a').length * 10;
          };
          let _pickValid = function($cand: any){
              let _best = null, _bestScore: any = null;
              for (let _ci = 0; _ci < $cand.length; _ci++) {
                  if (!_isContentNode($cand[_ci])) continue;
                  let _s = _contentScore($cand[_ci]);
                  if (_best === null || _s > _bestScore) { _best = $cand[_ci]; _bestScore = _s; }
              }
              return _best ? XS(_best) : null;
          };

          if(this.info.contentSelector){
              let $cand = this.$doc.find(this.info.contentSelector);
              if ($cand && $cand.length) {
                  $content = _pickValid($cand);
              }
          }

          if (!$content || !$content.length) {
              // 按照顺序选取；与站点规则同标准校验，避免目录/首页容器被当成正文
              let selectors = ParseDefaults.contentSelectors;
              for(let i = 0, l = selectors.length; i < l; i++){
                  let $cand = this.$doc.find(selectors[i]);
                  if(!$cand.length){
                      continue;
                  }
                  $content = _pickValid($cand);
                  if($content && $content.length){
                      break;
                  }
              }
          }

          // ---- 兜底启发式正文识别：所有规则未命中时，自动选取中文文本量最大的正文容器 ----
          // [修复 2.0.1] 收紧判定：真正的章节正文是"连续成段、链接稀疏"的大段文字；而首页/目录/
          // 导航/列表的文本几乎都包在 <a> 链接里、且单块文本很短。加入两道过滤，避免"站点已启用
          // 时，首页等非正文页被误判为正文 → 直接进入阅读模式、导致页面无法浏览"。
          if (!$content || !$content.length) {
              let _maxNode = null, _maxLen = 0;
              let _MIN_CN = 200;              // 兜底正文的最短中文文本量（不足视为非正文，如目录项/短标签）
              let _MAX_LINK_RATIO = 0.5;      // 链接文本占比上限：超过则视为目录/导航/列表而非正文
              this.$doc.find('div,section,article,td,li,blockquote').each(function(this: any){
                  let _el = this;
                  // 只取最内层正文容器：容器内部不再嵌套同类块容器
                  if (_el.querySelector('div,section,article,td,li,blockquote')) return;
                  let _txt = (_el.textContent || '').replace(/[\s\u3000]+/g, '');
                  if (!_txt) return;
                  let _cn = (_txt.match(/[\u4e00-\u9fff]/g) || []).length;
                  if (_cn < _MIN_CN) return;                       // 文本太短，不像一章正文
                  let _linkLen = 0;
                  let _links = _el.querySelectorAll('a');
                  for (let _li = 0; _li < _links.length; _li++) {
                      _linkLen += (_links[_li].textContent || '').replace(/[\s\u3000]+/g, '').length;
                  }
                  if (_txt.length > 0 && _linkLen / _txt.length > _MAX_LINK_RATIO) return; // 链接密集，判为非正文
                  if (_cn > _maxLen) { _maxLen = _cn; _maxNode = _el; }
              });
              if (_maxNode) {
                  $content = this.$doc.find(_maxNode);
              }
          }

          this.$content = $content;

          return $content.length > 0;
      },
      // 获取书名和章节标题
      getTitles: function (this: any){
          let info = this.info,
              chapterTitle,
              bookTitle,
              docTitle = this.$doc.find("title").text();

          // 获取章节标题
          if (info.titleReg){
              let matches = docTitle.match(toRE(info.titleReg, 'i'));
              if(matches && matches.length >= 2){
                  let titlePos = ( info.titlePos || 0 ) + 1;
                  let chapterPos = (titlePos == 1) ? 2 : 1;

                  bookTitle = matches[titlePos];
                  chapterTitle = matches[chapterPos];
              }

          }

          // 如果有 titleSelector 则覆盖从 titleReg 中获取的
          let tmpChapterTitle = this.getTitleFromRule(info.titleSelector);
          if (tmpChapterTitle) {
              chapterTitle = tmpChapterTitle;
          }

          if(!chapterTitle){
              chapterTitle = this.autoGetChapterTitle(this.doc);
          }
          if (info.chapterTitleReplace) {
              chapterTitle = chapterTitle.replace(toRE(info.chapterTitleReplace), '');
          }

          // get bookTitle
          if (!bookTitle && info.bookTitleSelector) {
              bookTitle = this.getTitleFromRule(info.bookTitleSelector);
          }
          if (!bookTitle) {
              bookTitle = autoGetBookTitle(this.$doc);
              bookTitle = this.replaceText(bookTitle, ParseDefaults.bookTitleReplace);
          }
          if (info.bookTitleReplace) {
              bookTitle = bookTitle.replace(toRE(info.bookTitleReplace), '');
          }

          // 标题间增加一个空格，不准确，已注释
          chapterTitle = chapterTitle
                  .replace(/[\u2000-\u200F\u2028\u2029\uFEFF]/g, "")   // 清理零宽空白/U+20系列残码（修复目录标题 u20 乱码）
                  .replace(ParseDefaults.titleReplace, "")
                  .replace(/([\u4e00-\u9fa5。！？…」』”"）:：,，;；])\s*\d{1,5}$/, "$1")   // 4.7: 清除标题尾部段评数字标记
                  .trim();

          if (chapterTitle.startsWith(bookTitle)) {
              let _chapterTitle = chapterTitle.replace(bookTitle, '').trim();
              if (_chapterTitle.length > 0) {
                  chapterTitle = _chapterTitle;
              }
          }

          bookTitle = bookTitle.replace(/(?:最新章节|章节目录)$/, '');

          docTitle = bookTitle ?
                  bookTitle + ' - ' + chapterTitle :
                  docTitle;


          this.originChapterTitle = chapterTitle;

          this.bookTitle = (bookTitle || '目录').trim();
          this.chapterTitle = chapterTitle;
          this.docTitle = docTitle;
      },
      getTitleFromRule: function(this: any, selectorOrArray: any) {
          let title = '';
          if (!selectorOrArray) {
              return '';
          }

          if (typeof selectorOrArray === 'function') {
              try {
                  title = selectorOrArray(this.$doc);
              } catch (e) {
              }
              if (!title) {
                  return ''
              }
              return title
          }

          let selector,
              replace;

          if (Array.isArray(selectorOrArray)) {
              selector = selectorOrArray[0];
              replace = selectorOrArray[1];
          } else {
              selector = selectorOrArray;
          }

          let $title = this.$doc.find(selector);
          if (!$title.length) {
              return '';
          }

          title = $title.remove().first().text().trim();

          if (replace) {
              title = title.replace(toRE(replace), '');
          }

          return title;
      },
      // 智能获取章节标题
      autoGetChapterTitle: function (document: HTMLElement) {
          var
              _main_selector = "h1, h2, h3",
              _second_selector = "#TextTitle, #title, .ChapterName, #lbChapterName, div.h1, #nr_title",
              _positive_regexp = ParseDefaults.titleRegExp,
              _title_remove_regexp = /最新章节|书书网/,
              $doc = XS(document),
              _document_title = document.title || $doc.find("title").text(),
              _search_document_title = ' ' + _document_title.replace(/\s+/gi, ' ') + ' '
          ;

          let _headings = $doc.find(_main_selector);
          // 加上 second selector 并去除包含的
          $doc.find(_second_selector).each(function(this: any){
              if(XS(this).find(_main_selector).length === 0){
                  _headings.push(this);
              }
          });

          let possibleTitles: Record<string, any> = {},
              _heading_text;


          XS(_headings).each(function(this: any){
              let _heading = this,
                  _heading_text = _heading.textContent.trim();

              if (!_heading_text || _heading_text in possibleTitles) {
                  return;
              }


              // h1 为 1， h2 为 2
              var
                  nodeNum = parseInt(_heading.nodeName.slice(1), 10) || 10,
                  score = 10 / nodeNum,
                  _heading_words = _heading_text.replace(/\s+/g, " ").split(" "),
                  _matched_words = ""
              ;

              // 后面这种是特殊的判断
              if (_positive_regexp.test(_heading_text) || /\d{2,4}/.test(_heading_text)) {
                  score += 50;
              }
              // }

              //  count words present in title
              for (let j = 0, _j = _heading_words.length; j < _j; j++) {
                  if (_search_document_title.indexOf(_heading_words[j]) > -1) {
                      _matched_words += _heading_words[j] + ' ';
                  }
              }
              score += _matched_words.length * 1.5;

              let _font_size_add_score = getElemFontSize(_heading) * 1.5;
              score +=  _font_size_add_score;

              possibleTitles[_heading_text] = score;

          });

          // 找到分数最高的值
          let topScoreTitle,
              score_tmp = 0;
          for (_heading_text in possibleTitles) {
              if (possibleTitles[_heading_text] > score_tmp) {
                  topScoreTitle = _heading_text;
                  score_tmp = possibleTitles[_heading_text];
              }
          }

          let curTitle = topScoreTitle!;
          if (!curTitle) {
              curTitle = _document_title;

              // 下面的正则从
              //     Firefox-Firefox浏览器论坛-卡饭论坛 - 互助分享 - 大气谦和!
              // 变为
              //     Firefox-Firefox浏览器论坛-卡饭论坛
              curTitle = curTitle.replace(/\s-\s.*/i, "")
                  .replace(/_[^\[\]【】]+$/, "");
              curTitle = curTitle.trim();
              curTitle = curTitle.replace(_title_remove_regexp, '');
          }

          curTitle = curTitle.replace(ParseDefaults.titleReplace, "");


          return curTitle;
      },

      // 获取和处理内容
      getContent: function (this: any){

          this.hasContent();

          if (!this.$content || this.$content.length <= 0) {
              return;
          }

          if (typeof this.info.handleContentText === 'function') {
              try {
                  this.content = this.info.handleContentText.call(this, this.$content[0], this.info);
              } catch (e) {
                  this.content = this.handleContentText2(this.$content[0], this.info);
              }
          } else {
              this.content = this.handleContentText2(this.$content[0], this.info);
          }

      },
      handleContentText2(this: any, node: HTMLElement, info: any) {
          if(!node) return null;

          if (info.useRawContent) {
              return node.outerHTML
          }


          let $div = XS(node.cloneNode(true));

          // [v2.0] 缓存「完全原始」HTML（任何 DOM 删除/清理之前，用 outerHTML 保留结构），供切开关时完整还原原书效果
          // （含隐藏元素/章节标题/contentRemove 内容/杂质块）；reapplyContentClean 据此重建 DOM 并按当前优化开关净化
          app._rawContentCache = $div[0].outerHTML;
          // [全量重应用] 同时把原始 HTML 与站点规则存到当前 Parser 实例（this），
          // 供 reapplyContentClean 遍历所有已加载章节按各自 raw 重建（切开关历史章节也跟随生效）
          this._rawHTML = $div[0].outerHTML;
          this._curInfo = info;
          // 记录当前章节站点规则，供 reapplyContentClean 复用 info.contentRemove
          app._curInfo = info;

          // DOM 层净化（净化始终执行）：隐藏元素/章节标题/contentRemove/整块杂质块
          applyDomClean($div, info);

          let content = cleanHTML($div[0]);

          // 去重
          const contents = content.split('\n');
          const deDupeConetents = [...new Set(contents)];

          // 查重率超过 10% 则使用去重后内容
          const dupeRate = (contents.length - deDupeConetents.length) / contents.length;
          if (dupeRate > 0.1) {
              content = deDupeConetents.join('\n');
          }


          // 去除内容中的标题
          if (this.originChapterTitle) {
              try {
                  let reg = toReStr(this.originChapterTitle.trim()).replace(/\s+/g, '\\s*');
                  reg = "(" + this.bookTitle.trim() + "\\s*)*" + "\\s*" + "(" + reg + ")*";
                  content = content.replace(toRE(`^${reg}$`), '');
              } catch (e) {
              }
          }


          // ===== 文本层净化：净化始终执行（仅整行命中杂质规则才丢弃，不修改原文文字） =====
          // （原始正文缓存已在「整块杂质删除前」完成：app._rawContentCache 含杂质块，供切开关还原原书）

          // 开关关闭：不做任何文本处理，直接输出网页原始文本（保留杂质行，即「原看书效果」）
          // 开关开启：仅丢弃「整行完全匹配」杂质规则的行，绝不修改小说原文文字/缩进/空行
          content = applyContentSettings(content, this._curPageHost, this.replaceText.bind(this));
          // 日志：整章文本净化（只在整章处理时记一次，避免逐段刷屏）

          // 站点自定义规则替换（SiteRules.specialSite 单独配置的站点专属规则，始终执行，不受优化开关控制）
          if (info.contentReplace) {
              content = this.replaceText(content, info.contentReplace);
          }


          const contentHTML = renderHTML(content);


          return contentHTML

      },
      replaceText: function(text: string, rule: any){
          let selectedf = this;
          switch(true) {
              case rule instanceof RegExp:
                  text = text.replace(rule, '');
                  break;
              case typeof rule === 'string':
                  // 还原简写
                  Object.keys(CHAR_ALIAS).forEach(function(key) {
                      rule = rule.replace(key, CHAR_ALIAS[key]);
                  });
                  text = text.replace(toRE(rule), '');
                  break;
              case Array.isArray(rule):
                  rule.forEach(function(r){
                      text = selectedf.replaceText(text, r);
                  });
                  break;
              case (rule !== null && typeof rule === 'object'):
                  let key;
                  for(key in rule){
                      text = text.replace(toRE(key), rule[key]);
                  }
                  break;
          }
          return text;
      },

      getIndexUrl: function(this: any){
          let url = '',
              selector = this.info.indexSelector || this.info.indexUrl;

          if (selector === false) {
              this.indexUrl = url;
              return url;
          }

          // 先尝试站点规则
          if (selector && typeof selector === 'function') {
              try {
                  url = selector(this.$doc);
              } catch (e) {
              }
          } else if(this.info.indexSelector){
              url = this.$doc.find(this.info.indexSelector);
          }

          // 再尝试通用规则
          if (!url || !url.length) {
              let selectors = ParseDefaults.indexSelectors;
              let _indexLink;
              // 按照顺序选取目录链接
              for(let i = 0, l = selectors.length; i < l; i++){
                  _indexLink = this.$doc.find(selectors[i]);
                  if(_indexLink.length > 0){
                      url = _indexLink;
                      break;
                  }
              }
          }

          if(url){
              url = this.checkLinks(url);
          }

          if (!url) {
          }

          this.indexUrl = url;
          return url;
      },
      getNextUrl: function(this: any){
          let url = '',
              selector = this.info.nextSelector || this.info.nextUrl,
              noSection = this.info.noSection;
          this.nextFromReal = false;   // 是否命中页面真实「下一页」元素（用于翻页节流自适应）

          if (selector === false) {
              this.nextUrl = url;
              return url;
          }

          let urlElement, isSectionUrl = false;

          // 先尝试站点规则
          if (selector) {
              if (typeof selector === 'function') {
                  try {
                      urlElement = selector(this.$doc);
                  } catch (e) {
                  }
              } else {
                  urlElement = this.$doc.find(selector);
              }

              url = this.checkLinks(urlElement);
          }

          // 再尝试通用规则
          if (!url) {
              urlElement = this.$doc.find(ParseDefaults.nextSelector);
              url = this.checkLinks(urlElement);
          }

          // [优化] 真实「下一页」按钮识别增强：a 链接之外，再匹配 button/常见分页 class 等，
          // 命中即取真实跳转目标（href 或 data-url/closest a），避免落到智能拼 URL（慢且易踩空）。
          if (!url) {
              let extraSel = "button:contains('下一页'),button:contains('下一章'),button:contains('下一頁'),"
                  + "button:contains('下页'),button:contains('下章'),"
                  + "a.next,a.next-page,a.page-next,a[data-next],a[data-url],a[data-href],a[data-link],"
                  + "#next,#nextPage,#next_page,.next-page,.next_page,.pager-next,.page-next,.page_next,.next-btn,.btn-next,"
                  + "input[type='button'][value*='下一页'],input[type='button'][value*='下一章'],"
                  + "div[data-next],span[data-next],div[data-url],span[data-url]";
              let $extra = this.$doc.find(extraSel);
              for (let ei = 0; ei < $extra.length && !url; ei++) {
                  let $el = $extra.eq(ei);
                  if (!$el.is(':visible')) continue;
                  let h = $el.attr('href') || $el.attr('data-url') || $el.attr('data-href')
                      || $el.attr('data-link') || $el.attr('data-next');
                  if (!h && $el.closest('a').length) h = $el.closest('a').attr('href');
                  if (h && h !== location.href) { urlElement = $el; url = h; }
              }
          }

          if (!noSection && url && urlElement && typeof urlElement !== 'string') {
              // 一般第一页下一章按钮文本含页就是多页章节
              // 判断是否分页章节在获取上一页链接函数中处理
              // 这里如果是分页章节则跳过下一页地址的检查
              let t = urlElement.text();
              if (!this.isSection && (t.includes('页') || t.includes('頁'))) {
                  isSectionUrl = true;
              }
          }

          // [优化] 记录是否命中页面真实「下一页」元素；命中则翻页节流缩短、更跟手
          if (url && urlElement && urlElement.length) this.nextFromReal = true;

          // [Pagetual式智能翻页兜底] 站点规则/通用/额外选择器都未命中时，先在页面里启发式找真实「下一页」链接
          // （参考东方永页机 Pagetual 智能适配：遍历 a 标签 + 文本关键词 + href 校验，适配小说站场景）
          if (!url && Setting.smart_next_page) { url = this.smartFindNext(); }
          // 仍找不到真实链接：按网址页码规律自动递增构造下一页（AutoPager 思路兜底）
          if (!url && Setting.smart_next_page) { url = this.guessNextUrl(); }

          this.nextUrl = url || '';

          if (!isSectionUrl) {
              this.isTheEnd = !this.checkNextUrl(url);
              if (this.isTheEnd) {
              }
          }
          
          return url;
      },
      // [Pagetual式智能翻页兜底] 站点规则/通用/额外选择器都未命中时，遍历页面 a 标签启发式找真实「下一页」链接。
      // 参考东方永页机 Pagetual 的智能适配思路（遍历链接 + 文本关键词 + 排除上一页 + href 校验），适配小说站场景。
      // 只处理「翻页文本」明确且 href 可用的链接，减少误匹配。
      smartFindNext: function(this: any) {
          let selectedf = this, url = '';
          // 下一页文本关键词（中文 + 英文 next）
          let nextTextReg = /下一页|下一頁|下页|下頁|下一章|下一话|下一節|下章|下节|翻下一页/;
          let nextTextRegEn = /^next\b/i;
          // 排除「上一页 / 目录 / 返回」等非下一页链接，避免误抓
          let prevTextReg = /上一页|上一頁|上页|上頁|上一章|上一话|上一節|上章|上节|prev|previous|last|end|目录|回目录|返回|首页|封面/;
          let $a = this.$doc.find('a');
          let list: any[] = [];
          for (let i = 0; i < $a.length; i++) list.push($a.eq(i));
          // 从后往前遍历（分页控件通常在页面底部，更接近真实「下一页」按钮）
          for (let n = list.length - 1; n >= 0; n--) {
              let a = list[n];
              let text = (a.text() || '').trim().replace(/\s+/g, '');
              if (!text || text.length > 30) continue;          // 过滤空 / 超长文本
              if (prevTextReg.test(text)) continue;              // 排除上一页 / 目录 / 返回
              if (!nextTextReg.test(text) && !nextTextRegEn.test(text)) continue;  // 必须含下一页关键词
              url = selectedf.checkLinks(a);
              if (!url || url === location.href) { url = ''; continue; }
              if (selectedf.checkNextUrl(url)) {
                  selectedf.nextFromReal = true;   // 命中页面真实「下一页」元素，翻页节流缩短更跟手
                  return url;
              }
              url = '';
          }
          return '';
      },
      // 智能下一页：找不到「下一页」链接时，按网址页码规律自动递增构造下一页（借鉴 AutoPager 思路）
      guessNextUrl: function() {
          let href = location.href, url = '';
          // ① 网址参数页码：?page=2 / &pageNum=3 / &p=5 / &pageNo=6 / &pageindex=2
          let qm = href.match(/[?&](page|pageNum|p|pageNo|pageindex)=(\d+)([^&#]*)$/i);
          if (qm) {
              let next = parseInt(qm[2], 10) + 1;
              if (next > 999999999) return '';
              url = href.replace(qm[0], (qm[0].charAt(0) === '?' ? '?' : '&') + qm[1] + '=' + next + (qm[3] || ''));
          }
          // ② 路径分页格式：12345_2.html / chapter-3.html / book_2/
          if (!url) {
              let pm = href.match(/([_-])(\d+)(\.\w+)?(?:\?.*)?$/);
              if (pm) {
                  let next2 = parseInt(pm[2], 10) + 1;
                  if (next2 > 999999999) return '';
                  url = href.slice(0, pm.index) + pm[1] + next2 + (pm[3] || '');
              }
          }
          // ③ 纯数字路径：/txt/89959/40941338 → /txt/89959/40941339（69书吧等章节ID自增站，无后缀）
          if (!url) {
              let dm = href.match(/(\/\d+)\/(\d+)(\.htm[l]?)?(?:[?#].*)?$/);
              if (dm) {
                  let next3 = parseInt(dm[2], 10) + 1;
                  if (next3 > 999999999) return '';
                  url = href.slice(0, dm.index) + dm[1] + '/' + next3 + (dm[3] || '');
              }
          }
          if (url && url !== href) return url;
          return '';
      },
      // 获取上下页及目录页链接
      getPrevUrl: function(this: any){
          let url = '',
              selector = this.info.prevSelector || this.info.prevUrl,
              noSection = this.info.noSection;

          if (selector === false) {
              this.prevUrl = url;
              return url;
          }

          let urlElement;

          // 先尝试站点规则
          if (selector) {
              if (typeof selector === 'function') {
                  try {
                      urlElement = selector(this.$doc);
                  } catch (e) {
                  }
              } else {
                  urlElement = this.$doc.find(selector);
              }

              url = this.checkLinks(urlElement);
          }

          // 再尝试通用规则
          if (!url) {
              urlElement = this.$doc.find(ParseDefaults.prevSelector);
              url = this.checkLinks(urlElement);
          }

          if (!noSection && url && urlElement && typeof urlElement !== 'string') {
              // 一般第二页的上一章按钮文本含页就是多页章节
              // 这里如果判断成功则是第二页之后的内容
              // 设置 isSection 为 true 就可以将第二页之后的内容合并到第一页里面
              let t = urlElement.text();
              if (url && !this.isSection && (t.includes('页') || t.includes('頁'))) {
                  this.isSection = true;
              }
          }

          if (url) {
          } else {
          }

          this.prevUrl = url || '';
          return url;
      },
      checkNextUrl: function (this: any, url: string) {
          const sectionUrlRegex = /\/\d+([_-]\d+|\/\d)\.html?$/;
          if (url && this.info.checkSection) {
              // 如果第一页的下一页地址和第二页（当前解析页）的上一页地址都不能通过分页地址正则的检测，则不是分页章节
              if (!sectionUrlRegex.test(this.curPageUrl) &&
                  !sectionUrlRegex.test(this.prevUrl)) {
                  this.isSection = false;
              } else if (sectionUrlRegex.test(this.curPageUrl)) {
                  this.isSection = true;
              } else {
                  this.isSection = false;
              }
          }

          // 跟 include 比较
          let includeUrl = this.info.includeUrl || this.getIncludeUrl();
          if (!toRE(includeUrl).test(url))
              return false;

          switch(true){
              case url === '':
                  return false
              case this.info.exclude && toRE(this.info.exclude).test(url):
                  return false
              case ParseDefaults.nextUrlIgnore.some(function(re) { return toRE(re).test(url) }):
                  return false
              case url === this.indexUrl:
                  return false
              case url === this.prevUrl:
                  return false
              case url === this.curPageUrl:
                  return false
              // 分页章节不能比较、第一章的上一页如果是目录页，也不能比较
              case !this.isSection && this.prevUrl !== this.indexUrl && ParseDefaults.nextUrlCompare.test(this.prevUrl.split('?')[0]) && !ParseDefaults.nextUrlCompare.test(url.split('?')[0]):
                  return false
              default:
                  return true
          }
      },
      getIncludeUrl: function(this: any) {
          let includeUrl = this.info.url;

          if (!includeUrl && typeof appInfo !== 'undefined') {
              let locationHref = location.href;
              appInfo.script.includes.some(function(includeStr: string) {
                  let iUrl = wildcardToRegExpStr(includeStr);
                  if (toRE(iUrl).test(locationHref)) {
                      includeUrl = iUrl;
                      return true;
                  }
              });
          }

          this.info.includeUrl = includeUrl;
          return includeUrl;
      },
      checkLinks: function(links: any){
          let selectedf = this;
          let url = '';

          if (!links) return ''

          if (typeof links === 'string') {
              return this.getFullHref(links);
          }

          links && links.each(function(this: any){
              url = XS(this).attr("href");
              if(!url || url.indexOf("#") === 0 || url.indexOf("javascript:") === 0)
                  return;

              url = selectedf.getFullHref(this);
              return false;
          });

          return url;
      },
      getFullHref: function(this: any, href: string | HTMLElement) {
          if(!href) return '';

          if (typeof href !== 'string') {
              href = href.getAttribute('href') || '';
          }

          if (/^https?:\/\//.test(href)) {
              return href;
          }
//#endregion
//#region [M8] 样式与面板模板

          let a = this.a;
          if (!a) {
              this.a = a = document.createElement('a');
          }
          a.href = href.trim();

          // // 检测 host 是否和 当前页的一致
          // }

          return a.href;
//#endregion
//#region [M9] 资源常量 Res
      },
  };

  // =====================================================================
  // [模块 M8] 样式与面板模板
  // 职责：阅读界面样式 tpl_mainCss / 设置面板 HTML tpl_preferencesHTML /
  //       设置面板 CSS tpl_preferencesCSS
  // 依赖：config（{uiFont} 等占位符在运行时替换）
  // =====================================================================
  let tpl_mainCss = tplMainCss;

  // ---------- M8 设置面板模板（HTML / CSS）----------
//#endregion
//#region [M10] 界面 UI
  let tpl_preferencesHTML = tplPreferencesHTML;

  let tpl_preferencesCSS = tplPreferencesCSS;

  // =====================================================================
  // [模块 M9] 资源常量 Res
  // 职责：图标/素材等资源常量
  // =====================================================================
  let Res = {
    CSS_MAIN: tpl_mainCss,

    preferencesHTML: tpl_preferencesHTML
        .replace(/\\n/g, '\n'),

    preferencesCSS: tpl_preferencesCSS,
  };


  // =====================================================================
  // [模块 M10] 界面 UI
  // 职责：皮肤应用 / 阅读界面按钮 / 设置面板（含数据管理）/ reapplyContentClean
  // 依赖：M3 Setting、M8 模板、M6 净化
  // =====================================================================
  let UI: { [key: string]: any } = {
    fontStack: /Macintosh|Mac OS X/.test(navigator.userAgent)
        ? '-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Helvetica Neue", sans-serif'
        : '"Segoe UI Variable", "Segoe UI", "Microsoft YaHei", "微软雅黑", sans-serif',
    monoStack: /Macintosh|Mac OS X/.test(navigator.userAgent)
        ? '"SF Mono", Menlo, Consolas, monospace'
        : 'Consolas, "Courier New", monospace',
      skins: {},
      // 站点字体
      siteFontFamily: '',

      init: function(){
          UI.refreshMainStyle();

          UI.refreshSkinStyle(Setting.skin_name, true);


          UI.fixMobile();

          // 初始变量
          UI.$menu = XS('#menu');
          UI.$menuBar = XS('#menu-bar');
          UI.$content = XS('#xiaoshuo-reader-content');


          UI.hideMenuList(Setting.menu_list_hidden);  // 初始化章节列表是否隐藏

          // 目录侧边栏打开时，点击侧边栏外（阅读区）即关闭 —— 与设置面板点击遮罩关闭一致
          document.addEventListener('click', function(e){
              if(!UI.$menu || UI.$menu.length === 0) return;
              if(UI.menu_list_hidden) return;  // 侧边栏已隐藏，不处理
              let t: any = e.target;
              if(t && t.closest && !t.closest('#menu') && !t.closest('#menu-bar')){
                  UI.hideMenuList(true);
              }
          }, true);
      },
      _sheetFor: function(id: any){
          if (UI._sheets && UI._sheets[id]) return UI._sheets[id];
          let rec;
          // 优先原生 adoptedStyleSheets（constructable stylesheet），不支持则回退 <style> 标签
          if (document.adoptedStyleSheets && typeof CSSStyleSheet !== 'undefined' && typeof CSSStyleSheet.prototype.replaceSync === 'function') {
              rec = { sheet: new CSSStyleSheet() };
              document.adoptedStyleSheets.push(rec.sheet);
          } else {
              rec = { el: XS('<style>').appendTo('head') };
          }
          if (!UI._sheets) UI._sheets = {};
          UI._sheets[id] = rec;
          return rec;
      },
      _applySheet: function(id: string, css: string){
          let rec = UI._sheetFor(id);
          if (rec.sheet) {
              try { rec.sheet.replaceSync(css); } catch(e) {}
          } else {
              rec.el.text(css);
          }
      },
      refreshMainStyle: function(){
          // 添加站点字体到样式中
          if (app.site.useSiteFont && app.siteFontInfo) {
              UI.siteFontFamily = app.siteFontInfo.siteFontFamily;
          }

          let mainCss = Res.CSS_MAIN
                  .replace("{font_family}", UI.siteFontFamily + Setting.font_family)
                  .replace("{font_size}", UI.calcContentFontSize(Setting.font_size))
                  .replace("{title_font_size}", UI.calcTitleFontSize(Setting.font_size))
                  .replace("{content_width}", Setting.content_width)
                  .replace("{text_line_height}", Setting.text_line_height)
                  .replace("{paragraph_height}", Setting.paragraph_height)
                  .replace(/\{uiFont\}/g, UI.fontStack)
                  .replace(/\{monoFont\}/g, UI.monoStack);

          UI._applySheet('main', mainCss);
      },
      hideMenuList: function(hidden?: any){
          if(typeof(hidden) === "undefined"){
              hidden = !UI.menu_list_hidden;
          }

          // 悬浮目录：呼出只显隐浮层，正文布局完全不动（不再改 margin）
          // 非阅读模式下 $menu 未创建，直接跳过
          if (!UI.$menu || !UI.$menu.length) { UI.menu_list_hidden = hidden; return; }
          if(hidden){
              UI.$menu.addClass('hidden');
          }else {
              UI.$menu.removeClass('hidden');
          }
          UI.menu_list_hidden = hidden;
      },
      getSkinCss: function(skin_name: any) {
          let css = UI.skins[skin_name] || "";

          return css;
      },
          // 目录面板跟随皮肤（覆盖硬编码 #333 黑底）
            getMenuSkinCss: function(skin_name: any){
        if(skin_name == '深色'){ return '\n#menu{background:var(--panel-glass);border-right:1px solid rgba(255,255,255,.1);}' + '\n#menu #header{color:#F5F5F7;border-bottom:1px solid rgba(255,255,255,.1);}' + '\n#menu #header a{color:#9c9c9f;}' + '\n#menu .chapter div{color:#F5F5F7;}' + '\n#menu .chapter div:hover{background:rgba(255,255,255,.06);color:#F5F5F7;}' + '\n#menu .chapter.active div{background:rgba(10,132,255,.22);color:#0A84FF;font-weight:600;}'; }
        if(skin_name == '护眼'){ return '\n#menu{background:var(--panel-glass);border-right:1px solid rgba(0,0,0,.08);}' + '\n#menu #header{color:#263238;border-bottom:1px solid rgba(0,0,0,.08);}' + '\n#menu #header a{color:#5b6e60;}' + '\n#menu .chapter div{color:#263238;}' + '\n#menu .chapter div:hover{background:rgba(0,0,0,.05);color:#263238;}' + '\n#menu .chapter.active div{background:rgba(0,122,255,.12);color:#007AFF;font-weight:600;}'; }
        if(skin_name == '自动'){ return '\n@media (prefers-color-scheme: light){#menu{background:var(--panel-glass);border-right:1px solid rgba(0,0,0,.08);} #menu #header{color:#1D1D1F;border-bottom:1px solid rgba(0,0,0,.06);} #menu #header a{color:#888;} #menu .chapter div{color:#1D1D1F;} #menu .chapter div:hover{background:rgba(0,0,0,.05);color:#1D1D1F;} #menu .chapter.active div{background:rgba(0,122,255,.12);color:#007AFF;font-weight:600;}}' + '\n@media (prefers-color-scheme: dark){#menu{background:var(--panel-glass);border-right:1px solid rgba(255,255,255,.1);} #menu #header{color:#C9C9C9;border-bottom:1px solid rgba(255,255,255,.1);} #menu #header a{color:#9c9c9f;} #menu .chapter div{color:#C9C9C9;} #menu .chapter div:hover{background:rgba(255,255,255,.06);color:#C9C9C9;} #menu .chapter.active div{background:rgba(10,132,255,.22);color:#0A84FF;font-weight:600;}}'; }
        return '\n#menu{background:var(--panel-glass);border-right:1px solid rgba(0,0,0,.08);}' + '\n#menu #header{color:#1D1D1F;border-bottom:1px solid rgba(0,0,0,.06);}' + '\n#menu #header a{color:#888;}' + '\n#menu .chapter div{color:#1D1D1F;}' + '\n#menu .chapter div:hover{background:rgba(0,0,0,.05);color:#1D1D1F;}' + '\n#menu .chapter.active div{background:rgba(0,122,255,.12);color:#007AFF;font-weight:600;}';
    },
refreshSkinStyle: function(skin_name: any, isFirst?: any){
          // 统一转字符串：导入的备份/历史存储里可能是非字符串值，后面 indexOf 会抛错
          skin_name = String(skin_name == null ? '' : skin_name);
          let skinCss = UI.getSkinCss(skin_name);
          // 目录面板跟随皮肤
          skinCss += UI.getMenuSkinCss(skin_name);

          UI._applySheet('skin', skinCss);
          // 统一玻璃变量：无条件设根，目录侧边栏与设置面板共用 --panel-glass（刷新后即使面板未打开也设好，保证深色皮肤下打开面板即深色）
          let isDarkSkin = (skin_name == '深色') || (skin_name == '自动' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
          let panelGlass = 'rgba(248,248,248,1)';
          if(isDarkSkin){ panelGlass = 'rgba(44,44,46,1)'; }
          else if(skin_name.indexOf('护眼') != -1){ panelGlass = 'rgba(238,247,240,1)'; }
          if(document.documentElement){ document.documentElement.style.setProperty('--panel-glass', panelGlass); }
          // 皮肤面板卡片底色跟随
          // 面板底色：保留半透明但去掉毛玻璃模糊，透明度需足够高（.92）才不干扰文字可读性
          let cardColor, prefsBg;
          if(isDarkSkin){ cardColor = 'rgba(44,44,46,.92)'; prefsBg = 'rgba(44,44,46,.92)'; }
          else if(skin_name.indexOf('护眼') != -1){ cardColor = 'rgba(238,247,240,.92)'; prefsBg = 'rgba(238,247,238,.92)'; }
          else { cardColor = 'rgba(245,245,247,.92)'; prefsBg = 'rgba(250,249,248,.92)'; }
          if(document.documentElement){
              document.documentElement.style.setProperty('--panel-card', cardColor);
              document.documentElement.style.setProperty('--prefs-bg', prefsBg);
          }
          // 悬浮按钮跟随皮肤
          let btnBg, btnBgHover, btnBorder, btnText;
          if(isDarkSkin){
              btnBg = 'rgba(255,255,255,0.18)';
              btnBgHover = 'rgba(255,255,255,0.28)';
              btnBorder = 'rgba(255,255,255,0.2)';
              btnText = 'rgba(255,255,255,0.92)';
          } else {
              // 与 #alert/#loading 同一套玻璃配方：底色要够实（.62）磨砂才看得见，
              // 描边改用极淡黑边——原来的白边叠在白底页面上等于没有轮廓
              btnBg = 'rgba(255,255,255,0.62)';
              btnBgHover = 'rgba(255,255,255,0.78)';
              btnBorder = 'rgba(0,0,0,0.08)';
              btnText = 'rgba(60,60,67,0.92)';
          }
          if(document.documentElement){
              document.documentElement.style.setProperty('--reader-btn-bg', btnBg);
              document.documentElement.style.setProperty('--reader-btn-bg-hover', btnBgHover);
              document.documentElement.style.setProperty('--reader-btn-border', btnBorder);
              document.documentElement.style.setProperty('--reader-btn-text', btnText);
          }
          // 面板已打开时同步皮肤类与局部变量
          if(UI.$prefs && UI.$prefs.find('.body').length){
              let pb = UI.$prefs.find('.body')[0];
              if(isDarkSkin){ UI.$prefs.find('.body').addClass('prefs-dark').removeClass('prefs-eye'); }
              else {
                  UI.$prefs.find('.body').removeClass('prefs-dark');
                  if(skin_name.indexOf('护眼') != -1){ UI.$prefs.find('.body').addClass('prefs-eye'); }
                  else { UI.$prefs.find('.body').removeClass('prefs-eye'); }
              }
              pb.style.setProperty('--panel-card', cardColor);
              pb.style.setProperty('--prefs-bg', prefsBg);
          }
          // 自动皮肤：跟随系统主题实时切换（正文CSS由浏览器media query自动处理，此处刷新面板底色）
          if(skin_name == '自动' && window.matchMedia && !UI._autoSkinMedia){
              UI._autoSkinMedia = window.matchMedia('(prefers-color-scheme: dark)');
              let _al = UI._autoSkinMedia;
              if(_al.addListener){ _al.addListener(function(){ if(Setting.skin_name == '自动') UI.refreshSkinStyle('自动'); }); }
              else if(_al.addEventListener){ _al.addEventListener('change', function(){ if(Setting.skin_name == '自动') UI.refreshSkinStyle('自动'); }); }
          }
      },
      showNoContentTip: function() {
          // [v3.0] 非正文页提示：站点已启用阅读模式，但当前页面未检测到小说正文。
          // 提供两个操作：①「尝试解析」重新走通用兜底解析 ②「选择正文」手动自建站点规则。
          let $tip = XS('<div id="xs-notip">').css({
              position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)',
              zIndex: 2147483646, background: 'rgba(28,28,30,.82)', color: '#fff',
              WebkitBackdropFilter: 'blur(14px) saturate(1.6)', backdropFilter: 'blur(14px) saturate(1.6)',
              padding: '12px 20px', borderRadius: '12px', fontSize: '13px',
              fontFamily: '-apple-system, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif',
              boxShadow: '0 10px 30px rgba(0,0,0,.28), 0 1px 4px rgba(0,0,0,.15)',
              border: '1px solid rgba(255,255,255,.12)',
              lineHeight: '1.9', textAlign: 'center', maxWidth: '520px'
          }).html('未检测到小说正文：<b>请打开小说的章节正文页</b>再进入阅读模式。<br>'
              + '<a id="xs-notip-retry" href="javascript:void(0)" style="color:#7ecb5f;margin-right:12px">尝试解析</a>'
              + '<a id="xs-notip-select" href="javascript:void(0)" style="color:#7ecb5f;margin-right:12px">选择正文</a>'
              + '<a id="xs-notip-close" href="javascript:void(0)" style="color:#98989d">知道了</a>')
              .appendTo('body');
          XS('#xs-notip-retry').on('click', function(this: any){ $tip.remove(); try { app.launch(); } catch(e){} });
          XS('#xs-notip-select').on('click', function(this: any){ $tip.remove(); try { UI.selectContentGuide(); } catch(e){} });
          XS('#xs-notip-close').on('click', function(this: any){ $tip.remove(); });
          window.setTimeout(function(){ try { $tip.remove(); } catch(e){} }, 6000);
      },
      // 首页/入口页启用站点后的轻提示。
      // 首页按设计不显示悬浮入口（避免在书城/榜单页上多一个无用按钮），但「点了启用什么都没发生」
      // 很容易被当成失效，这里给一次 4 秒自动消失的提示说明后续行为。
      showHomeEnabledTip: function() {
          try { XS('#xs-home-tip').remove(); } catch (e) {}
          let $tip = XS('<div id="xs-home-tip">').css({
              position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)',
              zIndex: 2147483646, background: 'rgba(28,28,30,.82)', color: '#fff',
              WebkitBackdropFilter: 'blur(14px) saturate(1.6)', backdropFilter: 'blur(14px) saturate(1.6)',
              padding: '10px 18px', borderRadius: '12px', fontSize: '13px',
              fontFamily: '-apple-system, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif',
              boxShadow: '0 10px 30px rgba(0,0,0,.28), 0 1px 4px rgba(0,0,0,.15)',
              border: '1px solid rgba(255,255,255,.12)',
              lineHeight: '1.8', textAlign: 'center', maxWidth: '520px'
          }).html('已启用本站：<b>打开章节页会自动进入阅读模式</b>').appendTo('body');
          window.setTimeout(function(){ try { $tip.remove(); } catch(e){} }, 4000);
      },
      showEnterReaderButton: function() {
          // [幂等] 已有入口按钮时只刷新文案/状态，不重复创建。
          // 否则「自动进入 + 入口兜底 + popup 改站点」几条链路各调一次，页面上会叠出两个悬浮球、
          // 并重复注入 <style>。updateBtn 每次都按当前 app.site/阅读态重算文案，刷新即等价。
          if (XS('.reader-enter-wrap').length) {
              try { if (app.onEnterReader) app.onEnterReader(); } catch (e) {}
              return;
          }
          // 全局「阅读模式」入口：主流阅读器风格
          // 大圆形主按钮 + 右上角小齿轮设置图标（叠加）
          addStyle('\
            .reader-enter-wrap {\
                position: fixed;\
                right: 20px;\
                bottom: 20px;\
                /* 层级档位：面板 2147483647 > 通知/提示 2147483646 > 悬浮按钮 2147483645 */\
                z-index: 2147483645;\
            }\
            .reader-enter-main {\
                width: 54px;\
                height: 54px;\
                border-radius: 50%;\
                display: flex;\
                align-items: center;\
                justify-content: center;\
                background: var(--reader-btn-bg, rgba(255,255,255,0.62));\
                /* 玻璃配方与 #alert/#loading/首页提示条同一套：半透明底 + 磨砂 + 细描边 + 双层柔影 */\
                -webkit-backdrop-filter: blur(20px) saturate(1.8);\
                backdrop-filter: blur(20px) saturate(1.8);\
                border: 1px solid var(--reader-btn-border, rgba(0,0,0,0.08));\
                box-shadow: 0 6px 20px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06);\
                color: var(--reader-btn-text, rgba(60,60,67,0.92));\
                font-size: 11px;\
                font-weight: 500;\
                cursor: pointer;\
                transition: transform .15s ease, background .15s ease;\
                box-sizing: border-box;\
                user-select: none;\
                font-family: -apple-system, "SF Pro Text", "PingFang SC", "Microsoft YaHei", "微软雅黑", sans-serif;\
                text-align: center;\
                line-height: 1.2;\
            }\
            .reader-enter-main:hover {\
                transform: scale(1.05);\
                background: var(--reader-btn-bg-hover, rgba(255,255,255,0.78));\
            }\
            .reader-enter-set {\
                position: absolute;\
                top: -5px;\
                right: -5px;\
                width: 22px;\
                height: 22px;\
                border-radius: 50%;\
                display: flex;\
                align-items: center;\
                justify-content: center;\
                background: var(--reader-btn-bg, rgba(255,255,255,0.62));\
                -webkit-backdrop-filter: blur(20px) saturate(1.8);\
                backdrop-filter: blur(20px) saturate(1.8);\
                border: 1px solid var(--reader-btn-border, rgba(0,0,0,0.08));\
                box-shadow: 0 2px 8px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06);\
                cursor: pointer;\
                transition: transform .15s ease, background .15s ease;\
                box-sizing: border-box;\
                user-select: none;\
            }\
            .reader-enter-set:hover {\
                transform: scale(1.1);\
                background: var(--reader-btn-bg-hover, rgba(255,255,255,0.78));\
            }\
            .reader-enter-set svg {\
                width: 12px;\
                height: 12px;\
                fill: var(--reader-btn-text, rgba(60,60,67,0.92));\
            }\
        ');
          function updateBtn() {
              let $wrap = XS('.reader-enter-wrap');
              if (!$wrap.length) return;
              let inReader = !!(document.body && document.body.getAttribute &&
                  document.body.getAttribute('name') === '小说阅读助手');
              let siteMatched = !!(app.site && app.site.url);
              let $btn = $wrap.find('.reader-enter-main');
              let $btnSet = $wrap.find('.reader-enter-set');
              if (inReader) {
                  $btn.text('退出阅读').attr('title', '退出阅读模式');
                  $btnSet.css('display', 'flex');
              } else if (siteMatched) {
                  $btn.text('阅读模式').attr('title', '进入阅读模式');
                  $btnSet.css('display', 'none');
              } else {
                  // [v3.0] 未命中站点规则 → 显示「尝试解析阅读模式」通用兜底入口
                  $btn.text('尝试解析').attr('title', '尝试解析阅读模式');
                  $btnSet.css('display', 'none');
              }
          }
          let $wrap = XS("<div>").addClass("reader-enter-wrap");
          let $btn = XS("<div>")
              .addClass("reader-enter-main")
              .text("阅读模式")
              .on("mousedown", function(this: any, ev: MouseEvent){
                  ev.preventDefault();
                  ev.stopPropagation();
                  let inReader = !!(document.body && document.body.getAttribute &&
                      document.body.getAttribute('name') === '小说阅读助手');
                  let siteMatched = !!(app.site && app.site.url);
                  if (inReader) {
                      try { app.toggle && app.toggle(); } catch(e){}
                  } else if (siteMatched) {
                      try { app.launch(); } catch(e){}
                  } else {
                      // [v3.0] 未命中站点规则 → 触发通用兜底解析（启发式正文识别，命中则进入阅读模式）
                      try { app.launch(); } catch(e){}
                  }
                  setTimeout(updateBtn, 300);
              });
          // 齿轮设置图标（SVG），叠加在主按钮右上角
          let $btnSet = XS("<div>")
              .addClass("reader-enter-set")
              .attr("title", "阅读设置")
              .html('<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.14,12.94a7.51,7.51,0,0,0,0-1.88l2.03-1.58a.49.49,0,0,0,.12-.61l-1.92-3.32a.48.48,0,0,0-.59-.22l-2.39.96a7.03,7.03,0,0,0-1.62-.94L14.4,2.81a.5.5,0,0,0-.5-.25H10.1a.5.5,0,0,0-.5.25L8.99,5.34a7.03,7.03,0,0,0-1.62.94L4.98,5.32a.48.48,0,0,0-.59.22L2.47,8.86A.49.49,0,0,0,2.59,9.47l2.03,1.58a7.51,7.51,0,0,0,0,1.88L2.59,14.46a.49.49,0,0,0-.12.61l1.92,3.32a.48.48,0,0,0,.59.22l2.39-.96a7.03,7.03,0,0,0,1.62.94l.36,2.53a.5.5,0,0,0,.5.25h3.8a.5.5,0,0,0,.5-.25l.36-2.53a7.03,7.03,0,0,0,1.62-.94l2.39.96a.48.48,0,0,0,.59-.22l1.92-3.32a.49.49,0,0,0-.12-.61ZM12,15.5A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>')
              .on("mousedown", function(this: any, ev: MouseEvent){
                  ev.preventDefault();
                  ev.stopPropagation();
                  try { UI.preferencesShow(); } catch(e){}
              })
              .css("display", "none");
          $wrap.append($btn).append($btnSet).appendTo('body');
          app.onEnterReader = updateBtn;
          app.onExitReader = updateBtn;
          updateBtn();
      },
      selectContentGuide: function() {
          if (app._selectingContent) return;
          app._selectingContent = true;

          let step = 1;               // 1=选正文  2=选下一页按钮
          let contentSelector = '';
          let nextSelector = '';

          let $tip = XS('<div id="xs-select-tip">').css({
              position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)',
              zIndex: 2147483646, background: 'rgba(28,28,30,.78)', color: '#fff',
                  WebkitBackdropFilter: 'blur(14px) saturate(1.6)', backdropFilter: 'blur(14px) saturate(1.6)',
              padding: '10px 18px', borderRadius: '10px', fontSize: '13px',
              fontFamily: '-apple-system, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif',
              boxShadow: '0 10px 30px rgba(0,0,0,.28), 0 1px 4px rgba(0,0,0,.15)',
              border: '1px solid rgba(255,255,255,.12)',
              lineHeight: '1.8', textAlign: 'center'
          }).appendTo('body');

          // 根据点击的元素生成稳定选择器（优先 id，其次第一个 class，再向上找祖先，最后用标签+位置）
          function genSelector(el: HTMLElement) {
              let node: HTMLElement | null = el;
              for (let i = 0; node && node.nodeType === 1 && i < 6; i++) {
                  if (node.id) return '#' + node.id;
                  if (node.className && typeof node.className === 'string' && node.className.trim()) {
                      return '.' + node.className.trim().split(/\s+/)[0];
                  }
                  node = node.parentElement;
              }
              if (el && el.tagName) {
                  let tag = el.tagName.toLowerCase();
                  let parent = el.parentElement;
                  let idx = parent ? Array.prototype.indexOf.call(parent.children, el) + 1 : 1;
                  return tag + ':nth-child(' + idx + ')';
              }
              return '';
          }

          function updateTip() {
              if (step === 1) {
                  $tip.html('已进入「选择正文」模式：请<b>点击页面中的正文区域</b>（按 <b>Esc</b> 取消）');
              } else {
                  $tip.html('正文已选中：<code>' + contentSelector + '</code><br>'
                      + '如果页面有「下一页 / 下一章」链接或按钮，请<b>点击它</b>（用于自动翻页）<br>'
                      + '<a id="xs-skip-next" href="javascript:void(0)" style="color:#7ecb5f">[没有，跳过]</a>　按 <b>Esc</b> 取消');
                  // 绑定跳过按钮
                  $tip.find('#xs-skip-next').click(function(this: any, ev: Event) {
                      ev.preventDefault();
                      ev.stopPropagation();
                      finish();
                  });
              }
          }

          function finish() {
              XS(document).off('click.xsSelect', clickHandler);
              XS(document).off('keydown.xsSelect', escHandler);
              $tip.remove();
              app._selectingContent = false;

              // 保存规则（正文 + 可选的下一页选择器），然后立即用新规则重新启动阅读模式
              app.saveCurrentSiteRule(contentSelector, nextSelector);
              app.site = null;
              app.launch();
          }

          let clickHandler = function(e: any) {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              let target = e.target;
              if (!target || !target.nodeType || target.nodeType !== 1) target = target.parentElement;
              // 忽略提示层、阅读按钮自身、设置面板
              if (XS(target).closest('#xs-select-tip, .reader-enter-wrap, #reader-preferences').length) return;

              if (step === 1) {
                  contentSelector = genSelector(target);
                  if (!contentSelector) return;
                  step = 2;
                  updateTip();
              } else {
                  // 第二步：尽量命中链接/按钮元素本身
                  let link = XS(target).closest('a,button,area')[0] || target;
                  nextSelector = genSelector(link);
                  if (!nextSelector) return;
                  finish();
              }
          };
          let escHandler = function(ev: KeyboardEvent) {
              if (ev.keyCode === 27) {
                  XS(document).off('click.xsSelect', clickHandler);
                  XS(document).off('keydown.xsSelect', escHandler);
                  $tip.remove();
                  app._selectingContent = false;
                  // [重构 2.1] 「选择正文」已改为圆形图标按钮，无需改回文字
              }
          };

          updateTip();
          XS(document).on('click.xsSelect', clickHandler);
          XS(document).on('keydown.xsSelect', escHandler);
      },
      calcContentFontSize: function(fontSizeStr: any) {
          // 统一转字符串：Store 里的历史值/导入的 JSON 可能是数字，直接 .match 会抛错
          let _s = String(fontSizeStr == null ? '' : fontSizeStr);
          let m = _s.match(/([\d\.]+)(px|r?em|pt)/);
          if(m) {
              let size = m[1],
                  type = m[2];
              return parseFloat(size) + type;
          }

          m = _s.match(/([\d\.]+)/);
          if (m) {
              return parseFloat(m[1]) + 'px';
          }

          return "";
      },
      calcTitleFontSize: function(fontSizeStr: any){
          let _s = String(fontSizeStr == null ? '' : fontSizeStr);
          let m = _s.match(/([\d\.]+)(px|r?em|pt)/);
          if(m) {
              let size = m[1],
                  type = m[2];
              return parseFloat(size) * 1.8 + type;
          }

          m = _s.match(/([\d\.]+)/);
          if (m) {
              return parseFloat(m[1]) * 1.8 + 'px';
          }

          return "";
      },
      fixMobile: function(){  // 自适应网页设计
          let meta = document.createElement("meta");
          meta.setAttribute("name", "viewport");
          meta.setAttribute("content", "width=device-width, initial-scale=1");
          document.head.appendChild(meta);
      },
      

    // 解码 unicode 转义（修复章节标题 \u7b2c\u4e00\u7ae0 这类残码）
    // 策略：能还原的一律还原成字符，只有「不完整的残码」才删除，避免误伤正常标题。
    decodeUnicodeStr: function(str: string){
        if(typeof str !== 'string') return str;
        // 绝大多数标题没有任何转义/实体：只做首尾空白与连续空格清理，绝不改动正文内容
        let _tidy = function(s: string){
            return s.replace(/^[\s\u00a0]+/, '').replace(/[\s\u00a0]+$/, '').replace(/[ \t]{2,}/g, ' ');
        };
        if(str.indexOf('\\') < 0 && str.indexOf('&') < 0) return _tidy(str);
        try{
            let r = str;
            // 1) 完整转义 \uXXXX → 还原字符（代理对（如 emoji）由连续的两次还原自然拼成）
            r = r.replace(/\\u([0-9a-fA-F]{4})/g, function(_m, hex){
                let code = parseInt(hex, 16);
                if (isNaN(code) || code === 0) return '';
                return String.fromCharCode(code);
            });
            // 2) 不完整残码：\u + 0~3 位十六进制（如 "\u20"、"第\u7b2c" 被截断后的 "\u7b2"）→ 删除
            r = r.replace(/\\u[0-9a-fA-F]{0,3}(?![0-9a-fA-F])/g, '');
            // 3) HTML 实体：命名实体先还原成字符（有些站点把标题做了两次转义）
            let _ents: any = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
                ldquo: '\u201c', rdquo: '\u201d', lsquo: '\u2018', rsquo: '\u2019',
                hellip: '\u2026', mdash: '\u2014', ndash: '\u2013', middot: '\u00b7',
                emsp: ' ', ensp: ' ', thinsp: ' ' };
            r = r.replace(/&(#[0-9]{1,7}|#x[0-9a-fA-F]{1,6}|[a-zA-Z][a-zA-Z0-9]{1,9});/g, function(m, body){
                if (body.charAt(0) === '#') {
                    let code = body.charAt(1) === 'x' || body.charAt(1) === 'X'
                        ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
                    // 非法/控制字符码点直接丢弃，避免生成不可见乱码
                    if (!isNaN(code) && code >= 32 && code <= 0x10FFFF) {
                        try { return String.fromCodePoint(code); } catch(e) { return ''; }
                    }
                    return '';
                }
                let key = body.toLowerCase();
                return Object.prototype.hasOwnProperty.call(_ents, key) ? _ents[key] : '';
            });
            // 4) 缺分号的常见实体（&nbsp &amp …）：只处理白名单，避免把 "A&B" 这类正常文本吃掉
            r = r.replace(/&(nbsp|amp|lt|gt|quot|apos|emsp|ensp|thinsp)(?![a-zA-Z0-9])/gi, function(m, name){
                return _ents[String(name).toLowerCase()] || '';
            });
            // 5) 清理首尾残留的分隔符（"- 第一章"、"& 第一章" 之类）
            r = r.replace(/^[\s\u00a0\-&:;.]+/, '').replace(/[\s\u00a0]+$/, '');
            r = r.replace(/[ \t]{2,}/g, ' ');
            return r;
        }
        catch(e){ return str; }
    },
preferencesShow: function(event?: any){
          if(XS("#reader-preferences").length){
              return;
          }

          // 面板容器：普通 div 蒙层（非 <dialog>）。<dialog> 内部元素的 backdrop-filter 在 Chrome 里
          // 无法采样 dialog 外部的页面内容，毛玻璃(blur24px)实际不生效；改为蒙层 div + 面板 div 后，
          // .body 的 backdrop-filter 直接作用在蒙层+页面背景上，观感与本地阅读器一致。
          UI.$prefs = XS('<div id="reader-preferences">')
              .append(
                  XS('<style>').text(Res.preferencesCSS.replace(/\{uiFont\}/g, UI.fontStack).replace(/\{monoFont\}/g, UI.monoStack)))
              .append(
                  XS('<div class="body">').attr('style', UI._prefsPanelCssText()).html(Res.preferencesHTML))
              .appendTo('body');

          let _isDark = (Setting.skin_name == '深色' || (Setting.skin_name == '自动' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches));
          // 打开面板保险设根 --panel-glass（若此前 refreshSkinStyle 未执行过，深色皮肤也能拿到深色底）
          if(document.documentElement){
              let _pg = _isDark ? 'rgba(44,44,46,1)' : (Setting.skin_name.indexOf('护眼') != -1 ? 'rgba(238,247,240,1)' : 'rgba(248,248,248,1)');
              document.documentElement.style.setProperty('--panel-glass', _pg);
          }
          // 打开面板：面板底色跟随皮肤（深色/护眼/浅色）——保留半透明，不做毛玻璃模糊
          if(_isDark){
              UI.$prefs.find('.body').addClass('prefs-dark').removeClass('prefs-eye');
              let _pb = UI.$prefs.find('.body')[0]; _pb.style.setProperty('--panel-card','rgba(44,44,46,.92)'); _pb.style.setProperty('--prefs-bg','rgba(44,44,46,.92)');
          }else{
              UI.$prefs.find('.body').removeClass('prefs-dark');
              let _pb = UI.$prefs.find('.body')[0];
              if(Setting.skin_name.indexOf('护眼') != -1){ UI.$prefs.find('.body').addClass('prefs-eye'); _pb.style.setProperty('--panel-card','rgba(238,247,240,.92)'); _pb.style.setProperty('--prefs-bg','rgba(238,247,238,.92)'); }
              else { UI.$prefs.find('.body').removeClass('prefs-eye'); _pb.style.setProperty('--panel-card','rgba(245,245,247,.92)'); _pb.style.setProperty('--prefs-bg','rgba(250,249,248,.92)'); }
          }
          UI.preferencesLoadHandler();
          UI._enablePrefsDragResize();
          // 打开面板时滚动区置顶，避免残留滚动位置导致顶部内容（标题/外观设置/启动模式）不可见
          UI.$prefs.find('.prefs-body').scrollTop(0);
          // 阻止点击开关时 prefs-body 自动滚动定位：浏览器 focus 会把滚动区滚到开关处（面板中部），
          // 导致顶部内容整体滚出、界面“跳变/拉宽”感；preventDefault 仅阻止 focus 定位，开关仍可正常切换
          UI.$prefs.find('.prefs-switch, .skin-item').on('mousedown.preventScroll', function(this: any, e: Event){ e.preventDefault(); });
          // 捕获阶段阻止 checkbox/radio 获得焦点：浏览器在控件获得焦点时会把滚动区滚到控件处（面板中部，
          // 即“段落首行缩进”以下的可视区外开关），导致顶部内容滚出、界面跳变；阻止 focus 后点击切换仍正常
          let pbEl = UI.$prefs.find('.prefs-body')[0];
          if (pbEl) {
              pbEl.addEventListener('focus', function(e: any){
                  let t = e.target;
                  if (t && t.tagName === 'INPUT' && (t.type === 'checkbox' || t.type === 'radio')) {
                      e.preventDefault();
                  }
              }, true);
          }
          // 【根因修复】label 在 click 默认行为里激活 checkbox/radio 时，浏览器强制把控件滚进 prefs-body 视野
          // （即“段落首行缩进”以下开关点击后顶部内容滚出）；mousedown/focus 阻止拦不住 label 激活。
          // 改为捕获 click：阻止默认激活与传播，手动切换 checked，再调用原点击处理（视觉/功能一致，不滚动）
          if (pbEl) {
              pbEl.addEventListener('click', function(e: any){
                  let t = e.target;
                  if (!t || !t.closest) return;
                  let sw = t.closest('.prefs-switch');
                  if (sw) {
                      let cb = sw.querySelector('input[type=checkbox]');
                      if (cb) {
                          e.preventDefault();
                          e.stopPropagation();
                          cb.checked = !cb.checked;
                          // 手动切换后需主动触发 change，否则 saveHandler（依赖 change）不会执行、设置不保存
                          XS(cb).trigger('change');
                          UI.preferencesClickHandler(cb);
                      }
                  }
              }, true);
          }

          // 蒙层显示：加 .open 以 flex 撑满全屏并居中 .body；点击蒙层(自身)关闭；Esc 由 keydown 兜底(UI.hide)
          UI.$prefs[0].classList.add('open');
          UI.$prefs.on('click', function(this: any, e: Event){ if(e.target === this){ UI.preferencesCloseHandler(); } });
      },
      hide: function(){
          if(UI.$prefs) UI.$prefs.remove();
          UI.$prefs = null;
      },
      // 5.1: 读取记忆的面板位置尺寸
      _prefsPanelCssText: function(){
          // 面板完全固定：默认居中，不可缩放、不可拖动（位置/尺寸记忆已停用）
          return 'width:min(92vw,480px); min-width:320px; max-height:94vh; overflow:hidden; margin:auto; border-radius:16px;';
      },
      // 面板已固定（不可缩放/移动），仅保留阻止正文文本被拖拽选中
      _enablePrefsDragResize: function(){
          let $panel = UI.$prefs;
          if(!$panel || !$panel.length) return;
          let $body = $panel.find('.body');
          $body.on('dragstart.pre', function(this: any, e: Event){ e.preventDefault(); });
      },
      // ===== 站点规则：代码编辑器式排版 =====
      // 把紧凑 JSON 规整成「缩进对齐 + 每条规则之间空一行」，让每条站点规则一眼分开。
      // 解析失败时原样返回，绝不破坏用户已写内容。
      formatSiteinfoText: function(txt: string) {
          let src = (txt || '').trim();
          if (!src) return '';
          let rules;
          try { rules = JSON.parse(src); } catch (e) { return src; }
          if (!Array.isArray(rules)) return src;
          let blocks = rules.map(function (r: any) {
              return JSON.stringify(r, null, 2).split('\n')
                  .map(function (ln: string) { return '  ' + ln; }).join('\n');
          });
          if (!blocks.length) return '[]';
          return '[\n' + blocks.join(',\n\n') + '\n]';
      },
      // 顶部计数：显示规则条数；JSON 无效时标红提示，便于发现写坏
      updateSiteinfoCount: function() {
          let $ta = XS('#custom_siteinfo'), $cnt = XS('#siteinfo-count');
          if (!$ta.length || !$cnt.length) return;
          let src = ($ta.get(0).value || '').trim();
          if (!src) { $cnt.text('0 条规则').css('color', ''); return; }
          let rules;
          try { rules = JSON.parse(src); } catch (e) { rules = null; }
          if (!Array.isArray(rules)) { $cnt.text('JSON 格式有误，请检查').css('color', '#ff3b30'); return; }
          $cnt.text(rules.length + ' 条规则').css('color', '');
      },
      preferencesLoadHandler: function(){
          let $form = XS("#preferences");

          // checkbox


          $form.find("#hide-menu-list").get(0).checked = Setting.menu_list_hidden;

          

          let _ff = Setting.font_family;
          // 旧版字体值兼容映射：宋体/楷体/黑体原只有 Windows 字体名，映射到跨平台栈
          let _ffMap: { [key: string]: any } = {
              "宋体,SimSun": "宋体,SimSun,\"Songti SC\",宋体-简",
              "楷体,楷体_GB2312": "楷体,楷体_GB2312,\"Kaiti SC\",楷体-简",
              "黑体,SimHei": "黑体,SimHei,\"Heiti SC\",黑体-简"
          };
          if (_ffMap[_ff]) _ff = _ffMap[_ff];
          // 字体下拉按平台显示：macOS 保留苹方、隐藏微软雅黑；Windows 相反
          let _isMac = /Macintosh|Mac OS X/.test(navigator.userAgent);
          $form.find("#font-family option[data-def]").each(function(this: any){
              let _d = XS(this).attr('data-def');
              if((_d === 'mac' && !_isMac) || (_d === 'win' && _isMac)) XS(this).remove();
          });
          let _$ff = $form.find("#font-family");
          if (!_$ff.find('option').filter(function(this: any){ return XS(this).attr('value') === _ff; }).length) {
              XS('<option>').attr('value', _ff).text('自定义字体').appendTo(_$ff);
          }
          _$ff.val(_ff);
          $form.find("#font-size").get(0).value = parseFloat(Setting.font_size) || 20;
          $form.find("#content_width").get(0).value = parseFloat(Setting.content_width) || 1000;
          // [修复] 行高回填默认值原本写死 1.8，但 Setting.text_line_height 的默认是 1.5em：
          // 用户没动过行高滑块，只要开关一次设置面板（关闭时会强制保存一次），
          // 行高就会被从 1.5 悄悄改成 1.8。此处与 Setting 的默认值保持一致。
          $form.find("#text_line_height").get(0).value = parseFloat(Setting.text_line_height) || 1.5;
          $form.find("#paragraph_height").get(0).value = parseFloat(Setting.paragraph_height) || 0.5;

          $form.find("#auto-scroll-speed").get(0).value = Setting.auto_scroll_speed;
          $form.find("#val-auto-scroll-speed").text(Setting.auto_scroll_speed + ' px/s');
          // 自定义站点规则为空（未配置）时，文本框留空仅显示「暂无站点规则」占位（v3.0 已去掉示例 JSON）
          // 非空时自动规整成缩进对齐排版（每条规则空行分隔），并同步顶部条数
          let _csInfo = Setting.custom_siteinfo;
          let _csText = (_csInfo === '[]' || _csInfo === '' || _csInfo === 'null') ? '' : String(_csInfo);
          $form.find("#custom_siteinfo").get(0).value = UI.formatSiteinfoText(_csText);
          UI.updateSiteinfoCount();

          $form.find("#smart-next-page").get(0).checked = Setting.smart_next_page;
          $form.find('#preload-next-page').get(0).checked = Setting.preload_next_page;

          // 内容优化（净化已并入 dom 层固定能力，无开关）
          $form.find('#enable-content-optimize').get(0).checked = Setting.content_optimize;

          

          // 皮肤
          let $skin = $form.find("#skin");
          for(let key in UI.skins){
              XS("<option>").text(key).appendTo($skin);
          }
          $skin.val(Setting.skin_name).change(function(this: any){
              let key = XS(this).find("option:selected").text();
              UI.refreshSkinStyle(key);
              Setting.skin_name = key;
              $form.find('.skin-item').removeClass('selected');
              $form.find('.skin-item[data-skin="' + key + '"]').addClass('selected');
          });
          $form.find('.skin-item').click(function(this: any){
              let key = XS(this).attr('data-skin');
              $form.find('#skin').val(key).trigger('change');
          });
          // 打开面板时同步皮肤选中框：.val() 不会触发 change，需手动补 active 高亮
          $form.find('.skin-item').removeClass('selected');
          $form.find('.skin-item[data-skin="' + Setting.skin_name + '"]').addClass('selected');

          // 字体大小等预览
          let preview = (function(){
              let _t: any = null;
              function _orig(this: any){
                  switch(this.id){
                      case "font-size":
                          let contentFontSize = UI.calcContentFontSize(this.value);
                          let titleFontSize = UI.calcTitleFontSize(this.value);
                          if(titleFontSize) {
                              UI.$content.css("font-size", contentFontSize);
                              UI.$content.find("h1").css("font-size", titleFontSize);
                          }
                          break;
                      case "font-family":
                          UI.$content.css("font-family", UI.siteFontFamily + this.value);
                          break;
                      case "content_width":
                          UI.$content.css("width", this.value + 'px');
                          break;
                      case "text_line_height":
                          UI.$content.css("line-height", this.value);
                          break;
                      case "paragraph_height":
                          XS(app.curFocusElement).find('p').css("margin", this.value + 'em 0');
                          break;
                  }
              }
              return function (this: any){
                  let _s = this, _a = arguments;
                  clearTimeout(_t);
                  _t = setTimeout(function(){ _orig.apply(_s, _a as any); }, 300);
              };
          })();
          $form.on("input", "input", preview);

          // 滑块数值实时显示
          $form.find('input[type=range]').each(function(this: any){
              let $val = $form.find('#val-' + this.id);
              if (!$val.length) return;
              let selectedf = this;
              let upd = function(){
                  let v = selectedf.value;
                  if (selectedf.id === 'paragraph_height') $val.text(v + 'em');
                  else if (selectedf.id === 'content_width') $val.text(v + 'px');
                  else if (selectedf.id === 'text_line_height') $val.text(v);
                  else if (selectedf.id === 'auto-scroll-speed') $val.text(v + ' px/s');
                  else $val.text(v + 'px');
                  // 4.9: 滑轨蓝色进度填充（对齐macOS滑块）
                  let _min = parseFloat(selectedf.min)||0, _max = parseFloat(selectedf.max)||100;
                  let _pct = ((v-_min)/(_max-_min))*100;
                  if(_pct<0)_pct=0; if(_pct>100)_pct=100;
                  selectedf.style.setProperty('--val', _pct+'%');
              };
              upd();
              XS(this).on('input', upd);
          });

          // 字体下拉即时预览
          $form.find("#font-family").on('change', function(this: any){
              UI.$content.css("font-family", UI.siteFontFamily + this.value);
          });

          // 初始化设置按键（按钮文字显示当前键值）
          $form.find("#openPreferencesKey").text(Setting.open_preferences_key);
          $form.find("#setHideMenuListKey").text(Setting.hide_menu_list_key);

          // 点击事件
          $form.on('click', 'input:checkbox, input:button, button', function(this: any, event: Event){
              UI.preferencesClickHandler(event.target); // 不用 await
          });

          // macOS 即时生效：任何设置改动立即保存并应用，无确定按钮
          let _applyTimer: any = null;
          let _scheduleApply = function(){ clearTimeout(_applyTimer); _applyTimer = setTimeout(function(){ UI.preferencesSaveHandler(); }, 60); };
          $form.on('change', 'input, select, textarea', _scheduleApply);
          $form.on('input', 'input[type=range]', _scheduleApply);
          // 输入站点规则时实时更新顶部条数/格式提示（不改变原有保存时机）
          $form.on('input', '#custom_siteinfo', function(this: any){ UI.updateSiteinfoCount(); });
      },
      cleanPreview: function() {
          UI.$content.find("h1").css("font-size", "");

          // 恢复初始设置（有误操作）
      },
      preferencesClickHandler: async function(target: HTMLInputElement){
          let key;
          // 关闭面板不走这里：o 键 / 点遮罩 / Esc 三条路径都直接调 preferencesCloseHandler()
          // （内部先保存再隐藏），面板内不再放关闭按钮
          switch (target.id) {
              case 'reset-config':
                  UI.resetConfig();
                  break;
              case 'hide-menu-list':
                  UI.hideMenuList(target.checked);
                  break;
              
              case 'export-config':
                  UI.exportConfig();
                  break;
              case 'import-config':
                  UI.importConfig();
                  break;
              case 'format-siteinfo': {
                  let $ta = XS('#custom_siteinfo');
                  if (!$ta.length) break;
                  let fmt = UI.formatSiteinfoText($ta.get(0).value);
                  $ta.get(0).value = fmt;
                  UI.updateSiteinfoCount();
                  XS($ta.get(0)).trigger('change');   // 走既有 60ms 延迟保存链路
                  UI.notice(fmt ? '排版已整理' : '暂无规则可整理');
                  break;
              }
              case 'copy-siteinfo': {
                  let $ta2 = XS('#custom_siteinfo');
                  if (!$ta2.length) break;
                  let txt = $ta2.get(0).value || '';
                  if (!txt) { UI.notice('没有内容可复制'); break; }
                  try {
                      navigator.clipboard.writeText(txt).then(function() {
                          UI.notice('规则已复制到剪贴板');
                      }, function() { UI.copySiteinfoFallback(txt); });
                  } catch (e) { UI.copySiteinfoFallback(txt); }
                  break;
              }
              case 'openPreferencesKey':
                  key = prompt('请输入打开设置的快捷键：', Setting.open_preferences_key);
                  if (key) {
                      if (UI.keyConflict('openPreferencesKey', key)) {
                          UI.notice('按键冲突：该键已被其他功能使用');
                          break;
                      }
                      Setting.open_preferences_key = key;
                      XS(target).text(key);
                  }
                  break;
              case 'setHideMenuListKey':
                  key = prompt('请输入切换左侧章节列表的快捷键：', Setting.hide_menu_list_key);
                  if (key) {
                      if (UI.keyConflict('setHideMenuListKey', key)) {
                          UI.notice('按键冲突：该键已被其他功能使用');
                          break;
                      }
                      Setting.hide_menu_list_key = key;
                      XS(target).text(key);
                  }
                  break;
          }
      },

      // 复制兜底：navigator.clipboard 不可用（非安全上下文/旧内核）时用 textarea + execCommand
      copySiteinfoFallback: function(txt: string) {
          try {
              let ta = document.createElement('textarea');
              ta.value = txt;
              ta.style.cssText = 'position:fixed;left:-9999px;top:0';
              document.body.appendChild(ta);
              ta.select();
              let ok = document.execCommand('copy');
              document.body.removeChild(ta);
              UI.notice(ok ? '规则已复制到剪贴板' : '复制失败，请手动全选复制');
          } catch (e) { UI.notice('复制失败，请手动全选复制'); }
      },

      // 检测快捷键冲突：key 是否已被其他固定功能或另一个自定义键占用
      keyConflict: function(curId: string, key: string) {
          if (!key) return false;
          key = String(key).trim().toLowerCase();
          // 固定快捷键集合（基础导航键）
          let fixedKeys = ["enter", "left", "right", "esc", ",", ".", "[", "]"];
          if (fixedKeys.indexOf(key) !== -1) return true;
          // 另一个自定义键是否占用（排除自身）
          let other = curId === "openPreferencesKey" ? Setting.hide_menu_list_key : Setting.open_preferences_key;
          if (other && String(other).trim().toLowerCase() === key) return true;
          return false;
      },
      // 导出/导入白名单：只包含真正的用户数据（阅读设置、站点规则）。站点白名单已移除。
      // 排除日志(xs_logs)等内部/历史残留 key，避免备份文件混入调试数据。
      _exportKeys: [
          'auto_scroll_speed', 'remain_height', 'font_family', 'font_size',
          'text_line_height', 'paragraph_height', 'content_width', 'skin_name',
          'menu_list_hidden', 'hide_menu_list_key', 'open_preferences_key',
          'content_optimize', 'smart_next_page', 'preload_next_page',
          'custom_siteinfo'
      ],
      exportConfig: function() {
          let data = { app: "小说阅读助手", export_version: "1.4", exportDataType: "full", config: {} as Record<string, any> };
          UI._exportKeys.forEach(function(key: string) {
              let val = Store.get(key);
              if (val !== undefined && val !== null) data.config[key] = val;
          });
          let json = JSON.stringify(data, null, 2);
          try {
              let blob = new Blob([json], {type: "application/json"});
              let url = URL.createObjectURL(blob);
              let a = document.createElement("a");
              a.href = url;
              a.download = "小说阅读助手-data-" + new Date().toISOString().slice(0,10) + ".json";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
          } catch(e) {
              UI.notice("导出失败，请使用较新浏览器");
              return;
          }
          UI.notice("<b>数据已导出</b>（设置、站点规则）");
      },
      importConfig: function() {
          // [修复] 由旧版「粘贴JSON」改为「选择导出的备份文件」导入
          let input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json,application/json';
          input.onchange = function() {
              let file = input.files && input.files[0];
              if (!file) return;
              let reader = new FileReader();
              reader.onerror = function() { UI.notice("读取备份文件失败", 2000); };
              reader.onload = function() { UI.doImport(reader.result); };
              reader.readAsText(file);
          };
          input.click();
      },
      doImport: function(jsonText: string) {
          let data;
          try {
              data = JSON.parse(jsonText);
          } catch(e) {
              UI.notice("导入失败：不是有效的JSON");
              return;
          }
          if (!data || (data.app !== "小说阅读助手" && data.app !== "MyNovelReader" && data.app !== "小说阅读器") || !data.config) {
              UI.notice("导入失败：不是本脚本的备份文件");
              return;
          }
          // 版本校验（仅提示，不强挡低版本，避免导入不了旧备份）
          if (!data.export_version) {
              if (!confirm("此备份文件无版本号，可能来自旧版脚本，仍要继续导入吗？")) return;
          }
          // 旧版 full 标记不再有「保留阅读进度」语义（阅读进度功能已移除），统一按完整数据导入
          if (data.exportDataType === "full" && !confirm("导入完整备份将覆盖本机全部数据，确定继续吗？")) return;
          Object.keys(data.config).forEach(function(key) {
              // 只导入白名单内的用户数据，跳过日志(xs_logs)等内部/历史残留 key
              if (UI._exportKeys.indexOf(key) === -1) return;
              Store.set(key, data.config[key]);
          });
          UI.notice("数据导入成功（设置、站点规则），刷新页面生效");
          setTimeout(function() { location.reload(); }, 1200);
      },
      resetConfig: function() {
          if (!confirm('确定恢复全部设置为默认值吗？（站点设置会保留）')) return;
          // [修复] 原实现只保留 custom_siteinfo，会把 enabled_sites / page_whitelist /
          // custom_page_blacklist 一并删掉 —— 与按钮「恢复默认」的提示「站点设置会保留」
          // 以及用户预期不符（恢复一次默认设置，所有已启用站点全失效、要重新逐个开启）。
          // 站点相关配置统一保留。
          let _keep = ['custom_siteinfo', 'enabled_sites', 'page_whitelist', 'custom_page_blacklist'];
          let keys = Store.list();
          keys.forEach(function(key: string) {
              if (_keep.indexOf(key) !== -1) return;
              Store.remove(key);
          });
          UI.notice('<b>已恢复默认设置</b>（站点设置已保留），即将刷新页面生效');
          setTimeout(function() { location.reload(); }, 1200);
      },
      preferencesCloseHandler: function(){
          // 关闭面板前强制保存所有设置（含站点规则 TextArea），
          // 避免用户删除内容后直接关闭面板时 change 事件未触发、改动丢失
          // 保存失败不阻塞关闭：try-catch 兜底，确保面板始终能关掉
          try { UI.preferencesSaveHandler(); } catch (ex) {}
          try { UI.cleanPreview(); } catch (ex) {}
          UI.hide();
      },
      preferencesSaveHandler: function(){
          let $form = XS("#preferences");
          // 面板已被移除（关闭事件二次触发时），直接跳过，避免空表单把所有设置覆盖为默认值
          if (!$form || $form.length === 0) return;
          // [修复] 面板改动后 60ms 延迟保存；若用户在窗口内关闭面板（#preferences 被移除），
          // $form 为空，旧代码 $form.find("#xxx").get(0).value 抛
          // "Cannot read properties of undefined (reading 'value')"。统一判空跳过，避免崩溃。
          let _val = function(id: any, def: any){ let el = $form.find(id).get(0); return el ? el.value : def; };
          let _chk = function(id: any){ let el = $form.find(id).get(0); return el ? !!el.checked : false; };

          let _skin = $form.find("#skin").get(0);
          let skinName = _skin ? $form.find("#skin").find("option:selected").text() : '';
          Setting.skin_name = skinName;
          UI.refreshSkinStyle(skinName);

          Setting.font_family = _val('#font-family', Setting.font_family);
          UI.refreshMainStyle();  // 刷新主样式表，字体即时生效（含站点字体前缀）

          Setting.font_size = _val('#font-size', Setting.font_size);
          Setting.text_line_height = _val('#text_line_height', Setting.text_line_height);
          Setting.paragraph_height = (_val('#paragraph_height', '') || '1') + 'em';
          Setting.content_width = (_val('#content_width', '') || '') + 'px';
          Setting.auto_scroll_speed = _val('#auto-scroll-speed', Setting.auto_scroll_speed);
          // 自动滚动运行时实时应用新速度
          if (app.autoScrolling) {
              app.stopAutoScroll();
              app.startAutoScroll();
          }

          Setting.menu_list_hidden = _chk('#hide-menu-list');
          UI.hideMenuList(Setting.menu_list_hidden);

          // 站点规则为空时回写 '[]'（空规则库），避免空串导致后续 JSON.parse 报错
          let _csInfoVal = (_val('#custom_siteinfo', '') || '').trim();
          Setting.custom_siteinfo = (_csInfoVal && _csInfoVal !== '[]') ? _csInfoVal : '[]';

          Setting.smart_next_page = _chk('#smart-next-page');
          Setting.preload_next_page = _chk('#preload-next-page');

          // 内容优化（净化已并入 dom 层固定能力，始终执行，无开关）
          let _oldOpt = Setting.content_optimize;
          Setting.content_optimize = _chk('#enable-content-optimize');

          // 仅当优化开关实际变化时，才即时重应用净化/优化（避免改动其他开关时也重复处理并弹提示）
          if (Setting.content_optimize !== _oldOpt) {
              UI.reapplyContentClean();
          }

          // 重新载入样式
          UI.cleanPreview();
          UI.refreshMainStyle();

          // [修复] 关闭面板时持久化所有设置到 chrome.storage.local，
          // 否则刷新页面后设置丢失（preferencesClickHandler 只在点击开关时即时保存）
          Store.set('font_family', Setting.font_family);
          Store.set('font_size', Setting.font_size);
          Store.set('text_line_height', Setting.text_line_height);
          Store.set('paragraph_height', Setting.paragraph_height);
          Store.set('content_width', Setting.content_width);
          Store.set('auto_scroll_speed', Setting.auto_scroll_speed);
          Store.set('skin_name', Setting.skin_name);
          Store.set('menu_list_hidden', Setting.menu_list_hidden);
          Store.set('custom_siteinfo', Setting.custom_siteinfo);
          Store.set('smart_next_page', Setting.smart_next_page);
          Store.set('preload_next_page', Setting.preload_next_page);
          Store.set('content_optimize', Setting.content_optimize);
      },
      // 切「正文内容优化」开关后，遍历所有已加载章节，用每章缓存的原始正文按当前开关状态重建，无需刷新
      // 开关可逆：关闭优化即恢复原排版，打开即重新应用；净化始终执行
      reapplyContentClean: function() {
          // [全量重应用] 遍历所有已加载章节，用每章自己的「完全原始」HTML 按当前开关状态重建，
          // 使切优化开关时历史章节也跟随生效；多页拼接章节（data-section）无法整章重建，跳过。
          let $content = app.$content;
          if (!$content || $content.length <= 0) { return; }

          // host 用当前页 URL 计算，与首次加载的 Parser._curPageHost 一致
          let curHost = app._curPageHost || getUrlHost(app.curPageUrl || location.href);
          // 完整优化替换器：必须与首次加载（Parser.replaceText + getNormalizeMap）一致，
          // 否则切「正文内容优化」开关时优化退化为简化替换（缺失合并多行引号/按句分段）。
          let fullReplace = function(t: string, map: Record<string,string>) { for (let k in map) { t = t.replace(toRE(k), map[k]); } return t; };
          let normOn = true, optOn = Setting.content_optimize;  // 去杂质恒执行（无开关），故 normOn 恒 true

          let applied = 0, skipped = 0, removedTotal = 0;
          let articles = $content.find('article[id^=page-]');
          articles.each(function(this: any, i: number, el: HTMLElement) {
              let $el = XS(el);
              // 多页拼接章节（每页只取一节）无法用单页 raw 整章重建，跳过以保留原文
              if ($el.attr('data-section')) { skipped++; return; }
              let pageN = (el.id || '').replace(/^page-/, '');
              let parser = app._parserByPage[pageN];
              let raw = parser && parser._rawHTML;
              if (!raw) return;

              // 从该章原始 HTML 重建 DOM，先做 DOM 层净化（隐藏元素/章节标题/contentRemove/整块杂质块）
              let $div = XS(raw);
              applyDomClean($div, parser._curInfo || null);
              let content = cleanHTML($div[0]);
              let processed = applyContentSettings(content, curHost || '', fullReplace);

              // 统计净化移除的杂质行数（对比 DOM 层净化后的行集合）
              let rawLines = content.split('\n').filter(function(this: any, l: string){ return l.trim(); });
              let proLines = processed.split('\n').filter(function(this: any, l: string){ return l.trim(); });
              let rawSet: Record<string, any> = {}, proSet: Record<string, any> = {};
              rawLines.forEach(function(l: string){ rawSet[l] = (rawSet[l]||0)+1; });
              proLines.forEach(function(l: string){ proSet[l] = (proSet[l]||0)+1; });
              Object.keys(rawSet).forEach(function(l){ let d=(rawSet[l]||0)-(proSet[l]||0); if(d>0) removedTotal += d; });

              // 重新生成 HTML 并替换（renderHTML 内含清纯数字行/段尾段评数字，与首次加载一致）
              let newHtml = renderHTML(processed);
              let $target = $el.find('.content');
              if ($target.length) { $target.replaceWith(newHtml); applied++; }
          });

          // 反馈（明确报告应用范围与跳过情况）
          if (normOn || optOn) {
              let msg = '正文处理已应用：' + applied + ' 章';
              if (skipped > 0) msg += '（' + skipped + ' 章为多页拼接，跳过）';
              if (normOn) msg += '，去杂质移除 ' + removedTotal + ' 行';
              if (optOn) msg += (msg.indexOf('，') !== -1 ? '' : '，') + '优化已生效';
              UI.notice(msg, 2200);
              // 日志：设置重应用净化/优化完成
          }
      },
      notice: function (htmlText: string, ms: number){
          let $noticeDiv = XS("#alert");
          if (!ms) {
              ms = 1666;
          }

          clearTimeout(UI.noticeDivto);
          $noticeDiv.find("p").html(htmlText);
          $noticeDiv.fadeIn("fast");

          UI.noticeDivto = setTimeout(function(){
              $noticeDiv.fadeOut(500);
          }, ms);

          return $noticeDiv;
      }
  };

  // 皮肤只负责配色，不再硬写 line-height / letter-spacing：
  // 排版由设置里的「行高」「字间距」经 main 样式表统一注入，皮肤覆盖会导致设置失效。
  UI.skins["浅色"] = "body { color: #1D1D1F; background-color: #FAF9F8; } #alert { background: rgba(255,255,255,.78); color:#1D1D1F; border-color:rgba(0,0,0,.1); } #loading { background: rgba(255,255,255,.78); color:#1D1D1F; border-color:rgba(0,0,0,.1); }";
  UI.skins["深色"] = "body { color: #F5F5F7; background-color: #1E1E1E; } #xiaoshuo-reader-content { color: #F5F5F7; } .title { color: #8ab4f8; } body a { color: #8ab4f8; } ::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,.3) !important; } #alert { background: rgba(28,28,30,.78); color:#F5F5F7; border-color:rgba(255,255,255,.1); } #loading { background: rgba(28,28,30,.78); color:#F5F5F7; border-color:rgba(255,255,255,.1); }";
  UI.skins["护眼"] = "body { color: #263238; background-color: #E8F5E9; } #alert { background: rgba(232,245,233,.85); color:#263238; border-color:rgba(0,0,0,.08); } #loading { background: rgba(232,245,233,.85); color:#263238; border-color:rgba(0,0,0,.08); }";
  UI.skins["自动"] = "@media (prefers-color-scheme: light){ body { color: #1D1D1F; background-color: #FAF9F8; } #alert { background: rgba(255,255,255,.78); color:#1D1D1F; border-color:rgba(0,0,0,.1); } #loading { background: rgba(255,255,255,.78); color:#1D1D1F; border-color:rgba(0,0,0,.1); } } @media (prefers-color-scheme: dark){ body { color: #C9C9C9; background-color: #1E1E1E; } #xiaoshuo-reader-content { color: #C9C9C9; } .title { color: #8ab4f8; } body a { color: #8ab4f8; } ::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,.3) !important; } #alert { background: rgba(28,28,30,.78); color:#C9C9C9; border-color:rgba(255,255,255,.1); } #loading { background: rgba(28,28,30,.78); color:#C9C9C9; border-color:rgba(255,255,255,.1); } }";


  /**
   * 获取 substring 在 string 所有位置的数组
   *
   * @param {string} substring
   * @param {string} string
   * @returns {number[]}
   */

  /**
   * 22000 毫秒 => 00:00:02
//#endregion
//#region [M11] 事件清理与翻页辅助
   *
   * @param {number} distanceMillis
   * @returns {string}
   */


  const {
    HTMLElement,
    EventTarget,
    MutationObserver: MutationObserver$1,
    Navigator,
    Proxy,
    Reflect,
    Object: Object$1,
    console: console$1
  } = window;

  // 防止 iframe 中的脚本调用 focus 方法导致页面发生滚动
  // =====================================================================
  // [模块 M11] 事件清理与翻页辅助
  // 职责：cleanupEvents / cleanupEventArray / RequestStatus / iframeHeight
  // 依赖：M2 工具
  // =====================================================================
  const clenaupEventArray: any[] = [];

  // 事件/观察器代理仅用于 iframe 沙箱内的事件清理（cleanupEvents 只在 iframe 调用），
  // 不再全局替换，避免侵入页面所有 addEventListener：非 iframe 主文档完全不受影响，也不累积记录
  if (window.name === 'xiaoshuo-reader-iframe') {
    const _addEventListener = EventTarget.prototype.addEventListener;
    const addEventListenerProxy = new Proxy(_addEventListener, {
      apply(target, thisArg, argumentsList) {
        Reflect.apply(target, thisArg, argumentsList);
        clenaupEventArray.push(() => {
          try {
            thisArg.removeEventListener(...argumentsList);
          } catch (e) {}
        });
      }
    });
    EventTarget.prototype.addEventListener = addEventListenerProxy;
    document.addEventListener = addEventListenerProxy;

    const _observe = MutationObserver$1.prototype.observe;
    const _disconnect = MutationObserver$1.prototype.disconnect;
    const observeProxy = new Proxy(_observe, {
      apply(target, thisArg, argumentsList) {
        Reflect.apply(target, thisArg, argumentsList);
        clenaupEventArray.push(() => {
          try {
            _disconnect.apply(thisArg, argumentsList as any);
          } catch (e) {}
        });
      }
    });
    MutationObserver$1.prototype.observe = observeProxy;
  }

  function cleanupEvents() {
    let func;
    while ((func = clenaupEventArray.pop())) func();

    // 注：不再使用 setTimeout(';') + 全量 clearTimeout 的「清空全部定时器」写法——
    // 它违反 MV3 扩展 CSP（unsafe-eval），会被阻止并抛错；且翻页 iframe 每次重建，
    // 其内部定时器随 iframe 销毁自然失效，无需全量清除。

    try {
      XS(window).off();
      XS(document).off();
    } catch (e) {}
  }

  // cleanupEvents 为模块顶层函数，本文件内部直接调用；iframe 沙箱上下文不再需要 window 暴露。

  Object$1.defineProperty(Navigator.prototype, 'platform', {
    get: function platform() {
      return ''
    }
  });

  console$1.clear = () => {};

  /** @enum {number} */
  const RequestStatus = {
    Idle: 0,
    Loading: 1,
    Finish: 2,
    Fail: 3
  };

  class BaseRequest {
    // 运行时字段声明（构造函数/方法内赋值，class 需显式声明供 tsc）
    errorHandle: () => void;
    finishHandle: () => void;
    siteInfo: any;
    /**@param { import("../typings/小说阅读助手").SiteConfig } siteInfo */
    constructor(siteInfo: any) {
      this.errorHandle = () => {};
      this.finishHandle = () => {};
      // 站点规则
      this.siteInfo = siteInfo;
    }

    setErrorHandle(func: () => void) {
      this.errorHandle = func;
    }

    setFinishHandle(func: () => void) {
      this.finishHandle = func;
    }
  }

  class HttpRequest extends BaseRequest {
    status: number;
    doc: any;
    _sendToken!: number;
    lastStatus!: number;
    lastFinalUrl!: string;
    rawLen!: number;
    rawHead!: string;
    constructor(siteInfo: any) {
      super(siteInfo);
      this.status = RequestStatus.Idle;
      this.doc = null;
    }

    async send(url: string, referer: string) {
      this.status = RequestStatus.Loading;
      this.doc = null;
      // [防并发] 发送令牌：8s 超时兜底会再次 send 重试，若本次请求在完成前被新一轮 send 取代，
      // 旧请求即使稍后成功也放弃 finishHandle，避免与原/重试请求并发完成造成重复 append。
      let tk = (this._sendToken = (this._sendToken || 0) + 1);
      const options = {
        url,
        method: 'GET',
        overrideMimeType: 'text/html;charset=' + document.characterSet,
        timeout: config.xhr_time,
        headers: {}
      };

      if (referer) {
        options.headers = { Referer: referer };
      }

      let retry = 3;
      let error: any = null;

      while (retry--) {
        try {
          const res = await Request(options);
          if (tk !== this._sendToken) return this.doc;  // 已被新一轮 send 取代，放弃本次完成
          this.doc = parseHTML(res.responseText);
          this.lastStatus = res.status;
          this.lastFinalUrl = res.finalUrl;
          this.rawLen = (res.responseText || '').length;
          this.rawHead = (res.responseText || '').replace(/\s+/g,' ').slice(0, 200);
          this.status = RequestStatus.Finish;
          this.finishHandle();
          break
        } catch (e) {
          error = e;
        }
      }

      if (!this.doc) {
        this.status = RequestStatus.Fail;
        this.errorHandle();
      }

      return this.doc
    }

    getDocument() {
      this.status = RequestStatus.Idle;
      return this.doc
    }

    hide() {}
    show() {}
  }

  class IframeRequest extends BaseRequest {
    status: number;
    iframe: any;
    doc: any;
    win: any;
    _onloaded: boolean;
    _loadToken!: number;
    _loadFail!: number;
    _curUrl!: string;
    resolve!: (doc: any) => void;
    constructor(siteInfo: any) {
      super(siteInfo);
      this.status = RequestStatus.Idle;
      this.iframe = null;
      this.doc = null;
      this.win = null;
      this._onloaded = false;   // [修复] 标记 iframe 是否已 onload 且进入正文就绪流程（供 8s 超时兜底判断）
    }

    get display() {
      return this.iframe && !this.iframe.style.display
    }

    async send(url: string) {
      // [架构修复] 每次翻页重建 iframe：同一 iframe 复用来加载多章（跨域 + 多次 setAttribute('src')）后，
      // 浏览器会累积导航状态导致 onload 事件不再可靠触发——「读几章后某章一直加载不完成、卡在正在载入」的
      // 通用根因（所有 useiframe 站点都会中招，故用户反馈「别的网站也一样」）。与同类扩展一致，每次新建 iframe。
      // 重建前清掉旧 onload 引用并移除旧节点，避免旧导航残留的 onload 再次触发新 loaded()。
      if (this.iframe) {
        this.iframe.onload = null;
        this.iframe.remove();
        this.iframe = null;
      }
      this.iframe = createIframe(this.loaded.bind(this), this.siteInfo);
      this.status = RequestStatus.Loading;
      this.doc = this.win = null;

      if (!this.display) {
        this.show();
      }

      this._curUrl = url;
      // [修复] 主动发起/重发请求才递增 token（新的加载标识）：loaded() 用此 token 校验本次加载
      // 是否仍有效。只有「send() 主动重发」（如超时重试、重建 iframe）才应废弃在途的旧 loaded()；
      // 挑战页跳转正文这类被动重复 onload 不应使 token 变化（由 3003/3017 校验原样保留在途流程）。
      this._loadToken = (this._loadToken || 0) + 1;
      const src = url + '#xiaoshuo-reader';

      if (this.iframe.src === src) {
        this.iframe.setAttribute('src', 'about:blank');
        await sleep(100);
        this.iframe.setAttribute('src', src);
      } else {
        this.iframe.setAttribute('src', src);
      }

      return new Promise(resolve => (this.resolve = resolve))
    }

    async loaded() {
      // [修复] token 只在 send()（主动发起/重发请求）时递增；loaded() 这里不自行递增，
      // 避免同源 iframe 因挑战页/正文的被动重复 onload（不经过 send）使 _loadToken 变化、
      // 在 3003/3017 误杀本应在途的正文就绪流程——status 停 Loading、不 finishHandle、不上屏，
      // 表现为「一直载入，往回滚一点才出」（所有 useiframe 站点共用的卡死机制）。
      let myToken = this._loadToken || 0;
      this.doc = this.iframe.contentDocument;
      this.win = this.iframe.contentWindow;

      if (!this.doc) {
        // [修复] iframe 加载偶发失败（contentDocument 为空，多为网站临时拦截/网络抖动）：重建 iframe 自动重试一次，再判 Fail
        this._loadFail = (this._loadFail || 0) + 1;
        if (this._loadFail <= 1 && this._curUrl) {
          this.hide();
          if (this.iframe) { this.iframe.remove(); this.iframe = null; }
          this.status = RequestStatus.Idle;
          this.send(this._curUrl);
          return;
        }
        this.status = RequestStatus.Fail;
        this.hide();
        this.errorHandle();
        this.resolve(null);
        return
      }

      this._onloaded = true;   // [修复] iframe 已 onload 且进入正文就绪流程，供 8s 超时兜底协调
      this.win.dispatchEvent(new WheelEvent('mousewheel', { deltaY: -100 }));
      this.win.scrollTo(0, this.doc.body.scrollHeight - this.win.innerHeight * 2);

      if (this.siteInfo.startLaunch) {
        this.siteInfo.startLaunch(XS(this.doc));
      }

      // 正文就绪等待：同源 iframe 内轮询正文容器（起点 202 JS 挑战需在真实浏览器环境执行后才渲染正文）
      if (this.siteInfo.contentSelector) {
        let cs = this.siteInfo.contentSelector;
        let need = this.siteInfo.waitContentText || 200;
        let dl = Date.now() + (this.siteInfo.waitTimeout || 12000);
        while (Date.now() < dl) {
          if (myToken !== this._loadToken) return;  // 期间发生新导航（挑战自我跳转），放弃本次
          let ce = this.doc.querySelector(cs);
          let cl = ce ? ce.textContent.replace(/\s+/g, '') : '';
          if (ce && cl.length >= need) break;
          await sleep(200);
        }
      } else if (this.siteInfo.mutationSelector) {
        await observeElement(this.doc, this.siteInfo);
      } else {
        const timeout = this.siteInfo.timeout || 0;
        if (timeout) {
          await sleep(timeout);
        }
      }
      if (myToken !== this._loadToken) return;
      this._loadFail = 0;
      this.hide();
      this.status = RequestStatus.Finish;
      this.finishHandle();
      this.resolve(this.doc);
    }

    getDocument() {
      this.status = RequestStatus.Idle;
      return this.doc
    }

    hide() {
      this.iframe.style.display = 'none';
    }

    show() {
      this.iframe.style.display = '';
    }
  }

  function createIframe(onload: any, { iframeSandbox, withReferer }: any) {
    const iframe = document.createElement('iframe');
    iframe.name = 'xiaoshuo-reader-iframe';
    // 预加载 iframe 固定到视口外加载：不占文档流高度、不干扰阅读滚动，同时保持渲染能力
    iframe.style.cssText = `
    position:fixed;
    left:-9999px;
    top:0;
    width:1px;
    height:1px;
    border:0!important;
    margin:0!important;
    padding:0!important;
    visibility:visible;
  `;
    if (Setting.preload_next_page && !withReferer) {
      iframe.referrerPolicy = 'no-referrer';
    }
    if (iframeSandbox !== void 0) {
      iframe.sandbox = iframeSandbox;
    }
    document.body.appendChild(iframe);
    iframe.onload = onload;
    return iframe
  }

  //#endregion
  //#region [M12] 主应用 app

  // =====================================================================
  // [模块 M12] 主应用 app
  // 职责：init / launch / processPage / prepDocument / initDocument /
  //       registerControls / registerKeys / 自动滚动 / doRequest / loaded / addNextPage
  // 依赖：M2-M11 全部模块
  // =====================================================================
  // [索引签名] app 是全局状态容器，运行时动态追加大量字段（_chapterObserver/_requestActive/
  // parsers/menuItems/$chapterList 等），故声明索引签名放行动态访问；
  // 显式列出的核心字段仍保留类型检查。
  let app: { [key: string]: any } = {
      isEnabled: false,
      parsedPages: {},
      pageNum: 1,
      paused: false,
      curPageUrl: location.href,
      requestUrl: null,
      lastRequestUrl: null,
      // 当前正在看的章节原始 URL（滚动同步时写入）；退出阅读模式用它兜底跳转
      _currentExitUrl: '',
      // 退出中标记：退出要走 replace/reload，两条通道（storage.onChanged + popup 消息）
      // 可能同时触发，避免重复调用
      _exiting: false,
      iframe: null,
      remove: [],
      // 滚动激活相关
      curFocusElement: null,
      curFocusIndex: 1,
      // 站点字体信息
      siteFontInfo: null,
      /**@type { HttpRequest | IframeRequest } */
      request: null,
      /**@type { HttpRequest } */
      httpRequest: null,
      /**@type { IframeRequest } */
      iframeRequest: null,
      // 站点规则
      site: null,
      preloadNextPagePromiseResolve: null,
      _reqRetryCount: 0,   // 翻页超时静默重试计数（成功或降级时清零）
      // [全量重应用] 章节缓存：pageNum → Parser 实例（其 _rawHTML/_curInfo 供切优化开关时整章重建）
      _parserByPage: {},

      // ===== [v3.0] 按站点启用 + 黑白名单 =====
      // 内置硬黑名单：URL 特征（登录/后台/视频/支付/后台/空白页等），命中即拦截，不展示阅读按钮。
      // 用户不可删（仅能通过"页面白名单"绕过）。
      _builtinBlacklist: [
        '/login', '/signin', '/register', '/password', '/logout',
        '/admin', '/manage', '/backend', '/console', '/dashboard', '/wp-admin',
        '/video', '/play', '/gallery', '/picture', '/photo',
        '/pay', '/checkout', '/cart', '/order', '/member', '/account', '/vip',
        '/download', '/search', '/about', '/help', '/terms', '/privacy',
        '/contact', '/setting', '/settings', '/edit', '/upload', '/mail',
        '/tag', '/category', '/forum', '/bbs', '/reply', '/comment'
      ],
      // 域名启用列表（持久化）：用户在 popup/油猴菜单开启的域名；未开启域名直接休眠
      getEnabledSites: function () {
        try { let v = Store.get('enabled_sites'); return Array.isArray(v) ? v : []; } catch (e) { return []; }
      },
      // 纯域名根路径（首页/目录入口）：这类页面不显示「阅读模式」悬浮入口，也不自动进入。
      isHomePath: function () {
        let p = location.pathname || '/';
        return p === '/' || p === '/index.html' || p === '/index.htm' ||
               p === '/home' || p === '/main';
      },
      // 域名覆盖判断：t 为已启用域名，h 为当前域名。父域名启用对子域名生效（qidian.com → www.qidian.com）
      _hostCoveredBy: function (h: string, t: string) {
        return t === h || (!!t && h.length > t.length && h.slice(-(t.length + 1)) === '.' + t);
      },
      isSiteEnabled: function (hostname: string) {
        let list = this.getEnabledSites();
        let h = String(hostname || '').toLowerCase();
        let self = this;
        return list.some(function (x: any) {
          return self._hostCoveredBy(h, String(x || '').toLowerCase());
        });
      },
      setSiteEnabled: function (hostname: string, enabled: boolean) {
        let list = this.getEnabledSites();
        let h = String(hostname || '').toLowerCase();
        let self = this;
        if (enabled) {
          // 已被父域名覆盖时不重复写入
          let covered = list.some(function (x: any) { return self._hostCoveredBy(h, String(x || '').toLowerCase()); });
          if (!covered) list.push(h);
        } else {
          // [修复] 原实现只按精确域名删除：列表里存的是父域名（qidian.com）时，
          // 在子域名（www.qidian.com）点「关闭」删不掉任何一条，表现为「点了关闭还是启用状态」。
          // 改为删除所有「覆盖当前域名」的条目，与 isSiteEnabled 的判定口径保持一致。
          list = list.filter(function (x: any) { return !self._hostCoveredBy(h, String(x || '').toLowerCase()); });
        }
        Store.set('enabled_sites', list);
      },
      // 页面白名单（仅用户自定义，URL 粒度）：放行通行证，命中则跳过所有黑名单校验
      isPageWhitelisted: function () {
        try {
          let list = Store.get('page_whitelist');
          if (!Array.isArray(list)) return false;
          let href = location.href;
          return list.some(function (w: any) { return href.indexOf(String(w)) !== -1; });
        } catch (e) { return false; }
      },
      // 页面黑名单（内置硬黑名单 + 用户自定义，合并一层）：命中则拦截，不展示阅读按钮
      isPageBlacklisted: function () {
        let href = (location.href || '').toLowerCase();
        try {
          for (let i = 0; i < this._builtinBlacklist.length; i++) {
            if (href.indexOf(this._builtinBlacklist[i]) !== -1) return true;
          }
          let list = Store.get('custom_page_blacklist');
          if (Array.isArray(list)) {
            for (let i = 0; i < list.length; i++) {
              if (href.indexOf(String(list[i]).toLowerCase()) !== -1) return true;
            }
          }
        } catch (e) {}
        return false;
      },
      // 判断当前页面在"域名已启用"前提下是否放行（白名单跳过黑名单）
      isCurrentPageAllowed: function () {
        let hostname = location.hostname || '';
        if (!this.isSiteEnabled(hostname)) return false;
        if (this.isPageWhitelisted()) return true;
        return !this.isPageBlacklisted();
      },
      // [v3.0] 油猴 GM 菜单：按站点启用/关闭（仅油猴环境存在 GM_registerMenuCommand）
      registerUserscriptMenu: function () {
        let g: any = (typeof GM_registerMenuCommand !== 'undefined') ? GM_registerMenuCommand : null;
        if (!g) return;
        try {
          let hostname = location.hostname || '';
          g('在此网站启用阅读助手', function () {
            app.setSiteEnabled(hostname, true);
            try {
              app.site = app.getCurSiteInfo();
              XS('.reader-enter-wrap').remove();
              if (app.isCurrentPageAllowed()) { UI.showEnterReaderButton(); }
            } catch (e) {}
          });
          g('在此网站关闭阅读助手', function () {
            app.setSiteEnabled(hostname, false);
            try { XS('.reader-enter-wrap').remove(); } catch (e) {}
            // [修复] 与 popup 行为对齐：若当前正处于阅读模式，必须真正退出（恢复原网页）。
            // 原来只改了存储 + 删入口按钮，阅读界面原地不动 → 用户以为关闭没生效。
            let _inReader = !!(document.body && document.body.getAttribute && document.body.getAttribute('name') === '小说阅读助手');
            if (_inReader) { try { app.exitReadingMode(); } catch (e) {} }
          });
        } catch (e) {}
      },

      init: async function() {
          if (["xiaoshuo-reader-iframe", "superpreloader-iframe"].indexOf(window.name) != -1) { // 用于加载下一页的 iframe
              return;
          }

          if (location.href.indexOf('#xiaoshuo-reader') > -1) {
              history.replaceState({}, '', location.href.replace('#xiaoshuo-reader', ''));
              return
          }

          let parent: Window = window;
          let nestCount = 0;

          while (parent !== window.top) {
              nestCount++;
              parent = parent.parent;
          }

          if (nestCount > 2) {
              return
          }

          // 手动调用
          let readx = app.launch;

          try {
              exportFunction(readx, window, {defineAs: "readx"});
          } catch(ex) {
          }


          app.loadCustomSetting();
          app.site = app.getCurSiteInfo();

          // 等待 DOMContentLoaded 事件触发
          if (!app.site.fastboot) {
              await DOMContentLoaded();
          }

          if (app.site.startLaunch) {
              try {
                  app.site.startLaunch(XS(document));
              } catch (e) {
              }
          }

          // [重构 2.1] 对齐主流阅读器：不再按站点白名单自动进入阅读模式。
          // 所有页面保持原网页，仅注册全局「进入阅读模式」入口；由用户手动点击触发 launch()/readx()。
          if (!app.site.fastboot) {
              await domMutation();
          }

          // [v3.2] 已启用站点：打开章节页直接进入阅读模式，不再需要先点悬浮按钮。
          // 只在「已启用 + 非首页 + 探测到正文」时才接管；否则静默降级为悬浮入口，
          // 不弹「未检测到正文」提示（自动流程不该打扰用户）。
          let _isHome = app.isHomePath();
          let _autoEntered = false;
          if (!_isHome) {
              try { _autoEntered = await app.autoEnterReader(); } catch (e) {}
          }

          // [重构 2.1] 「阅读模式」入口：纯域名根路径不显示按钮，有具体路径的页面才显示。
          // 自动进入成功时 processPage 末尾已重建过按钮（「退出阅读」+ 齿轮），不能再建一个。
          if (!_autoEntered && !_isHome) {
              UI.showEnterReaderButton();
          }
      },
      // 已启用站点：打开页面直接进入阅读模式。
      // 返回 true 表示已经接管页面；false 表示按原样保留（调用方补悬浮入口）。
      autoEnterReader: async function (): Promise<boolean> {
          // 与站点准入同口径：域名已启用 + 未被页面黑名单拦截（白名单可跳过黑名单）。
          // init 里已判过一次，这里再判一次是为让本函数自洽——将来从别处调用也不会绕过黑名单。
          if (!app.isCurrentPageAllowed()) return false;
          if (app.isHomePath()) return false;

          // 同一标签页内刚「退出阅读」过 → 这次加载不再自动进入。
          // 退出走的是 replace/reload，不写这个标记会立刻又被送进阅读模式，用户永远退不出去。
          // 标记「读到即删」，只影响紧随其后的这一次加载：即便退出时跳转被站点拦下、标记残留，
          // 也最多让下一个页面少自动进入一次（按钮仍在，点一下即可），不会连带影响后续页面。
          try {
              if (sessionStorage.getItem('xs_skip_auto_enter')) {
                  sessionStorage.removeItem('xs_skip_auto_enter');
                  return false;
              }
          } catch (e) {}

          if (!app.site) { app.site = app.getCurSiteInfo(); }

          // 先做一次纯 DOM 探测（不发请求、不改 DOM）：没正文就什么都不做，
          // 把页面完整留给悬浮入口，避免自动流程在目录页/首页上乱动。
          let _parser: any = null;
          let _has = false;
          try {
              _parser = new (Parser as any)(app.site, document);
              _has = !!_parser.hasContent();
          } catch (e) { _has = false; }
          if (!_has) return false;

          // [详情页排除] 书籍详情页 / 分卷页常常是「几百字简介 + 一长串章节目录」，
          // 简介本身就能通过「中文≥200 字、链接占比<50%」的正文校验，于是整页被接管——
          // 而用户这时往往只是想看看简介、挑一章。判据：正文偏短（<600 字）且页面里能数到
          // 10 条以上「第X章/节/回/卷」链接 → 认定是目录型页面，交给悬浮入口手动进。
          // 真正的章节页正文很长，或有上一章/下一章导航，不会被这条规则误伤。
          try {
              let _el = _parser.$content && _parser.$content[0];
              if (_el) {
                  let _txt = String(_el.textContent || '').replace(/[\s\u3000]+/g, '');
                  let _cn = (_txt.match(/[\u4e00-\u9fff]/g) || []).length;
                  if (_cn < 600) {
                      let _chapterLinks = 0;
                      let _as = document.querySelectorAll('a');
                      for (let _i = 0; _i < _as.length && _chapterLinks < 10; _i++) {
                          let _t = String(_as[_i].textContent || '').trim();
                          if (_t && _t.length <= 40 &&
                              /第\s*[0-9０-９零一二三四五六七八九十百千两]{1,10}\s*[章节節回卷]/.test(_t)) {
                              _chapterLinks++;
                          }
                      }
                      if (_chapterLinks >= 10) return false;
                  }
              }
          } catch (e) {}

          await app.launch();
          if (!app.isEnabled) return false;

          // [兜底] 进入流程跑完却没有阅读界面（processPage 中途失败）：带标记重载一次，
          // 恢复成原网页 + 悬浮入口，避免用户对着空白页无法操作。标记保证只重载一次，不会成环。
          if (!document.querySelector('#xiaoshuo-reader-content')) {
              try {
                  sessionStorage.setItem('xs_skip_auto_enter', String(Date.now()));
                  location.reload();
              } catch (e) {}
              return false;
          }
          return true;
      },
      loadCustomSetting: function() {
          let customRules;
          try {
              customRules = JSON.parse(Setting.custom_siteinfo || '[]');
          } catch (e) {
          }

          // 站点规则只来自两处：①用户设置面板「站点设置」custom_siteinfo（自建规则库，运行时优先）；
          // ②第三方规则库 SiteRules.specialSite（sites.ts）。代码内不再内置任何自建站点规则。
          SiteRules.customRules = Array.isArray(customRules) ? customRules : [];
      },
      getCurSiteInfo: function() {
          let rules = SiteRules.customRules.concat(SiteRules.specialSite);
          let locationHref = location.href;

          let info = rules.find(function (x) {
              return toRE(x.url).test(locationHref);
          });

          if (!info) {
              info = {};
          } else {
          }
          return info;
      },
      launch: async function() {
          // 只解析一次，防止多次重复解析一个页面
          if (document.body && document.body.getAttribute("name") == "小说阅读助手") {
              return await app.toggle();
          }

          if (!app.site) {
              app.site = app.getCurSiteInfo();
          }

          if (app.site.startFilter) {
              try {
                  app.site.startFilter();
              } catch (ex) {
              }
          }

          // 使用站点字体
          if (app.site.useSiteFont) {
              if (typeof app.site.useSiteFont === 'boolean') {
                  app.siteFontInfo = app.getSiteFontInfo();
              } else if (typeof app.site.useSiteFont === 'string') {
                  if (!app.site.useSiteFont.trim().endsWith(',')) {
                      app.site.useSiteFont = app.site.useSiteFont.trim() + ',';
                  }
                  app.siteFontInfo = { siteFontFamily: app.site.useSiteFont.trim() };
              }
          }

          let parser = new (Parser as any)(app.site, document);
          let hasContent = !!parser.hasContent();
          if (hasContent) {
              // [重构 2.1] 对齐主流阅读器：手动调用命中正文 → 直接进入阅读模式
              // 不删除 reader-enter-wrap，让它自动变成「退」+「设」两个按钮
              await app.enterReader(parser);
          } else {
              // [重构 2.3] 非正文页：不接管页面，明确提示未检测到正文。
              // 不再单独造「选择正文」圆球——统一悬浮入口（reader-enter-wrap）在无站点规则时
              // 本就显示「选择正文」并调 selectContentGuide()，此处保留它即为手动入口
              app.isEnabled = false;
              UI.showNoContentTip();
          }

          // 初始化, 取消页面限制等
          if (app.site.fInit)
              app.site.fInit();
      },
      enterReader: async function(parser: Parser) {
          // [修复 2.0.1] 从「进入阅读模式」按钮进入：执行原自动进入的完整逻辑
          if (!parser) return;
          cleanupEvents();
          document.body.setAttribute("name", "小说阅读助手");
          app.parsedPages[window.location.href] = true;
          app.isEnabled = true;
          try { await parser.getAll(); } catch (e) {}
          try {
              await app.processPage(parser);
          } catch (e) {
          } finally {
              // [兜底] processPage 会先清空 body 再重建阅读界面，中途抛错（站点规则/模板异常）时
              // 既没有阅读界面、也没有退出按钮 = 页面白屏且退不出去。
              // 这里保证「只要 body 已标记为阅读态，就一定有一个可点的退出入口」。
              try {
                  if (document.body.getAttribute('name') === '小说阅读助手'
                      && !XS('.reader-enter-wrap').length) {
                      UI.showEnterReaderButton();
                  }
              } catch (e) {}
          }
      },
      saveCurrentSiteRule: function(selector: string, nextSelector: string) {
          try {
              let host = String(location.hostname).replace(/\./g, '\\.');
              let hostRe = '^https?://' + host + '(?::\\d+)?(?:/.*)?$';
              let name = String(location.hostname).replace(/"/g, '');
              let rule: { url: string; contentSelector: string; name: string; nextSelector?: string } = {
                  url: hostRe,
                  contentSelector: String(selector).replace(/"/g, '\\"'),
                  name: name
              };
              if (nextSelector) {
                  rule.nextSelector = String(nextSelector).replace(/"/g, '\\"');
              }

              // 新规则放在最前，并按站点名去重（保持原有"放最前"行为）
              let rules = [rule].concat((SiteRules.customRules || []).filter(function(this: any, r) {
                  return r && r.name !== name;
              }));

              SiteRules.customRules = rules;
              Setting.custom_siteinfo = JSON.stringify(rules);

              UI.notice('已保存本站为阅读站点，刷新后自动识别', 3000);
          } catch (ex) {
          }
      },
      processPage: async function(parser: Parser) {
          // 对 Document 进行处理
          document.body.innerHTML = '';
          app.prepDocument();
          app.initDocument(parser);



          // cache vars
          app.$doc = XS(document);
          app.$menuBar = app.$doc.find("#menu-bar");
          app.$menu = app.$doc.find("#menu");
          app.$content = app.$doc.find("#xiaoshuo-reader-content");
          app.$loading = app.$doc.find("#loading");

          app.$menuHeader = app.$menu.find("#chapter-list");
          app.$chapterList = app.$menu.find("#chapter-list");

          app.indexUrl = parser.indexUrl;
          app.prevUrl = parser.prevUrl; // 第一个上一页

          app.oArticles = [];  // 原始的内容，用于替换的无需刷新
          app.parsers = [];

          // 加入上一章的链接
          if (parser.prevUrl) {
              XS("<li>")
                  .addClass('chapter')
                  .append(
                      XS("<div>")
                      .attr({
                          "realHref": parser.prevUrl,
                          "onclick": "return false;"
                      })
                      .text("上一章")
                  )
                  .prependTo(app.$chapterList);
          }

          // 插入站点样式
          if (app.site.style) {
              addStyle(app.site.style);
          }

          // 插入站点字体样式
          if (app.site.useSiteFont && app.siteFontInfo) {
              const { internal } = app.siteFontInfo;
              if (internal) {
                  XS('<style class="noRemove siteFont">')
                      .text(internal.map((e: { cssText: string }) => e.cssText).join('\n'))
                      .appendTo('head');
              }
              // 插入外部样式表可能会影响阅读界面样式
              //     }
              // }
          }

          app.appendPage(parser, true);

          app.registerControls();

          // UI 的初始化
          UI.init();

          app.curFocusElement = XS("article:first").get(0); // 初始化当前关注的 element
          app.requestUrl = parser.nextUrl;
          app.isTheEnd = parser.isTheEnd;

          app.isEnabled = true;

          // // 如果已经把当前焦点链接添加到历史记录，则滚动到顶部
          // }

          history.scrollRestoration = 'manual';
          window.scrollTo(0, 0);

          // 初始化 request
          app.initRequest();

          // 有些图片网站高度随着图片加载而变长
          setTimeout(app.scroll, 1000);

          app.cleanAgain();

          if (Setting.preload_next_page) {
              await app.doRequest();
          }

          // 进入阅读模式后，DOM 已被替换，需要重新创建悬浮按钮（自动变成「退」+「设」）
          UI.showEnterReaderButton();
      },
      initRequest: function() {
          app.httpRequest = new HttpRequest(app.site);
          app.iframeRequest = new IframeRequest(app.site);

          app.request = app.site.useiframe ? app.iframeRequest : app.httpRequest;
          // 日志：记录站点匹配与翻页请求模式

          app.httpRequest.setErrorHandle(() => app.scrollForce());
          // [架构修复] 请求完成(finishHandle)应「直接上屏」，不能再走 scroll()：
          // scroll() 需满足 getRemain()<remain_height 才调 scrollForce()→Finish 分支→loaded()→appendPage，
          // 请求完成瞬间若滚动余量不满足该门槛，正文便一直 append 不上来，
          // 表现为「正在载入下一页，卡住，回滚一下才出」。改绑定 scrollForce() 后，status=Finish
          // 时无条件走 Finish 分支 appendPage，消除对滚动位置/余量的依赖。
          app.httpRequest.setFinishHandle(() => app.scrollForce());

          app.iframeRequest.setErrorHandle(() => app.scrollForce());
          app.iframeRequest.setFinishHandle(() => app.scrollForce());
      },
      prepDocument: function() {
          window.onload = function() {};

          // 防止阅读模式内元素 focus 导致页面滚动（仅阅读模式激活时生效，避免污染页面全局行为；防重复定义）
          if (!(HTMLElement.prototype.focus as any).__xsFocus) {
            let _focus = HTMLElement.prototype.focus;
            let _focusWrapped = function focus(this: any) { _focus.call(this, { preventScroll: true }); };
            (_focusWrapped as any).__xsFocus = true;
            HTMLElement.prototype.focus = _focusWrapped;
          }

          // 破解右键限制
          let doc: Document = document;
          let bd = doc.body;
          bd.onselectstart = bd.oncopy = bd.onpaste = bd.oncontextmenu = bd.ondragstart = doc.onselectstart = doc.oncopy = doc.onpaste = doc.oncontextmenu = null;
          doc.onselectstart = doc.oncontextmenu = doc.onmousedown = function() {
              return true;
          };

          doc = (document as any).wrappedJSObject || document;
          doc.onmouseup = null;
          doc.onmousedown = null;
          doc.oncontextmenu = null;

          let arAllElements = document.getElementsByTagName('*');
          for (let i = arAllElements.length - 1; i >= 0; i--) {
              let elmOne = arAllElements[i];
              elmOne = (elmOne as any).wrappedJSObject || elmOne;
              (elmOne as HTMLElement).onmouseup = null;
              (elmOne as HTMLElement).onmousedown = null;
          }


          // remove body style
          XS('link[rel="stylesheet"], script').remove();
          XS('html, body')
              .removeAttr('style')
              .removeAttr('bgcolor');

          XS('style:not(.noRemove)').filter(function(this: any) {
              let $style = XS(this);
              if($style.text().indexOf('#cVim-link-container') != -1) {  // chrome 的 cVim 扩展
                  return false;
              }
              return true;
          }).remove();

          // 移除 html 标签中非 head 和 body 的元素
          XS('html').children().filter(function (this: any) {
              let tagName = XS(this).prop('tagName').toLowerCase();
              if (tagName !== 'head' && tagName !== 'body') {
                  return true
              }
              return false
          }).remove();
      },
      initDocument: function(parser: Parser) {
          document.title = parser.docTitle;

          document.body.innerHTML = XS.nano(tpl_mainHtml, parser);
      },
      clean: function() {
          XS('body > *:not("#container, .reader-enter-wrap, .noRemove, #reader-preferences, iframe[name=\'xiaoshuo-reader-iframe\']")').remove();
          XS('link[rel="stylesheet"]:not(.noRemove)').remove();
          XS('body, #container').removeAttr('style').removeAttr('class');

          if (XS && location.host.indexOf('qidian') > 0) {
              XS(document).off("selectstart").off("contextmenu");
          }
      },
      cleanAgain: function() {
          // }

          // 再次移除其它不相关的，起点，纵横中文有时候有问题
          setTimeout(app.clean, 2000);
          setTimeout(app.clean, 5000);
          setTimeout(app.clean, 8000);
          // TM 用 addEventListener('load') 有问题
          window.onload = function() {
              app.clean();
              setTimeout(app.clean, 500);
          };
      },
      // 退出阅读模式：恢复原网页。
      // 三个入口共用这一份实现（页面「退出阅读」按钮、popup 关闭本站、油猴菜单关闭本站），
      // 避免行为分叉——之前 popup / 油猴只改存储、不退出阅读界面，点了像没反应。
      //
      // 退出方式：
      //  1) 优先跳「滚动时记录下来的当前章节 URL」（history.replaceState 被站点拦截时，
      //     地址栏可能还停在旧章节，直接 reload 会跳章）；
      //  2) 否则刷新。刷新后 isSiteEnabled() 为 false（关闭站点时）→ 页面回到原样，
      //     也不会再出现任何入口按钮，也就是真正「禁用」了。
      exitReadingMode: function() {
          if (app._exiting) return;
          app._exiting = true;
          // [兜底] 跳转有可能没发生（beforeunload 被用户取消、站点拦截等）。那种情况下
          // _exiting 会永久为 true，之后点「退出阅读」全部静默失效。3 秒后解锁（页面真跳走则无影响）。
          setTimeout(function () { app._exiting = false; }, 3000);
          // [v3.2] 告诉下一次加载「别再自动进入」——退出就是 replace/reload，
          // 不写这个标记会被 autoEnterReader 立刻又送进阅读模式，等于退不出去。
          try { sessionStorage.setItem('xs_skip_auto_enter', String(Date.now())); } catch (e) {}
          let _exit = app._currentExitUrl;
          if (_exit && _exit !== location.href) {
              try { location.replace(_exit); return; } catch (e) {}
          }
          // 跳转都失败时解除标记，避免之后再也退不出去
          try { location.reload(); } catch (e) { app._exiting = false; }
      },
      toggle: async function() {
          if (app.isEnabled) { // 退出
              // [重构 2.1] 站点白名单已移除：退出阅读模式即恢复原网页，不涉及白名单。
              // 想再进入 → 点页面右下角「进入阅读模式」或扩展图标即可。
              app.exitReadingMode();
          } else {
              app.isEnabled = true;
              await app.launch();
          }
      },
      removeListener: function() {
          app.remove.forEach(function(_remove: any) {
              _remove();
          });
      },
      appendPage: function(parser: Parser, isFirst: any) {
          let chapter = XS("article:last");
          if (chapter.length && parser.isSection) { // 每次获取的不是一章，而是一节
              let lastText = chapter.find("p:last").remove().text().trimRight();
              let newPage = parser.content.replace(/<p>\s+/, "<p>" + lastText);
              // [全量重应用] 该章为多页拼接（每页只取一节），单页 raw 无法整章重建，标记后重应用时跳过
              chapter.attr('data-section', '1');

              chapter.append(newPage);

          } else {
              chapter = XS("<article>")
                  .attr("id", "page-" + app.pageNum)
                  .append(
                      XS("<h1>").addClass("title").text(UI.decodeUnicodeStr(parser.chapterTitle))
                  )

                  .append(parser.content)
                  .appendTo(app.$content);
              // [全量重应用] 记录该页对应 Parser，供 reapplyContentClean 整章重建
              app._parserByPage[app.pageNum] = parser;


              // 添加到章节列表
              let _ct = UI.decodeUnicodeStr(parser.chapterTitle);
              let chapterItem = XS("<li>")
                  .addClass('chapter')
                  .append(
                      XS("<div>")
                      .attr({
                          href: "#page-" + app.pageNum,
                          "realHref": parser.curPageUrl,
                          onclick: "return false;",
                          title: _ct
                      })
                      .text(_ct)
                  )
                  .prependTo(app.$chapterList);

              if (isFirst) {
                  chapterItem.addClass('active');
              }

              app.resetCache();
          }

          // [预加载修复] 翻页成功后不在此处同步标签页 URL/标题，避免预加载时标签页一直跳到最后一章。
          // 标签页标题改为在滚动时根据当前可见章节动态更新（见 updateTabTitleOnScroll）。

          app.pageNum += 1;

          app.oArticles.push(chapter[0].outerHTML);
          app.parsers.push(parser);
          // 日志：记录章节正文追加

      },
      resetCache: function() {  // 更新缓存变量
          app.menuItems = app.$chapterList.find("div");
          app.scrollItems = XS("article[id^=page-]");
          app._initChapterObserver();
      },
      registerControls: function() {
          // [最基础版本] 滚动逻辑：监听 window scroll 事件，直接调用 app.scroll()
          // 没有 throttled 节流，没有其他复杂逻辑
          XS(window).scroll(function() {
              app.scroll();
          });

          app.registerKeys();

          app.$content.on("dblclick", function(this: any) {
              app.toggleAutoScroll();
          });

          // 左侧章节列表

          app.$menuBar.click(function(this: any) {
              UI.hideMenuList();
          });

          app.$doc.on("mousedown", "#chapter-list div", function(this: any, event: any) {
              switch (event.which) {
                  case 1:
                      let href = XS(this).attr("href");
                      if (href) {
                          app.scrollToArticle(XS(href));
                      } else {
                          // [修复] realHref 为空时直接赋值会跳到相对地址 "undefined"（404）
                          let _real = XS(this).attr("realHref");
                          if (_real) location.href = _real;
                      }
                      break;
                  case 2: // middle click
                      app.openUrl(XS(this).attr("realHref"));
                      break;
              }
          });


      },
      registerKeys: function() {
          // 全部快捷键统一为原生 keydown 监听（可改键动态读取当前 Setting 值，改键即时生效）
          XS(document).off('keydown.xsKeys').on('keydown.xsKeys', function(this: any, e: any) {
              let t = e.target;
              if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
              // [跨平台] 带修饰键的组合一律放行，交给浏览器/系统：
              //   Windows 上 Ctrl+O(打开文件) / Ctrl+S(保存) / Ctrl+P(打印)，
              //   Ctrl+[ / Ctrl+](后退/前进)、Alt+← / Alt+→(后退/前进) 都是系统级快捷键，
              //   拦下来会变成"按了毫无反应"。macOS 的 Cmd 组合同理。
              if (e.ctrlKey || e.metaKey || e.altKey) return;
              // [跨平台] 中文输入法组合中（Windows 上更常见）不响应裸键，
              //   否则打拼音时会顺手把设置面板弹出来。keyCode 229 是老内核的组合同义值。
              if (e.isComposing || e.keyCode === 229) return;
              let k = String(e.key || '');

              // 两个可改键（切换章节列表 / 打开设置）
              let hk = String(Setting.hide_menu_list_key || '').trim().toLowerCase();
              let ok = String(Setting.open_preferences_key || '').trim().toLowerCase();
              if (hk && k.toLowerCase() === hk) {
                  // 设置面板打开时不处理章节列表快捷键，避免干扰设置操作
                  if (UI.$prefs) return;
                  UI.hideMenuList(); e.preventDefault(); e.stopPropagation(); return;
              }
              if (ok && k.toLowerCase() === ok) {
                  // 打开设置快捷键作为开关：面板开着则关闭，关着则打开
                  if (UI.$prefs) { UI.hide(); } else { UI.preferencesShow(); }
                  e.preventDefault(); e.stopPropagation(); return;
              }

              switch (k) {
                  case 'Enter': // 打开小说主页
                      if (UI.$prefs) return;
                      app.openUrl(app.indexUrl, "主页链接没有找到");
                      e.preventDefault(); e.stopPropagation();
                      break;
                  case 'ArrowLeft': // 上一章 / 上一段
                      let sp = XS(window).scrollTop();
                      if (sp === 0) {
                          // [修复] prevUrl 为空（第一章 / 规则未匹配到上一页）时直接赋值会让浏览器
                          // 跳到相对地址 "undefined"（404 空白页），改为给出提示、保持当前页
                          if (app.prevUrl) {
                              location.href = app.prevUrl;
                          } else {
                              UI.notice('已经是第一章了');
                          }
                      } else {
                          let ot = XS(app.curFocusElement).offset().top;
                          // 在视野窗口内
                          if (ot > sp && ot < (sp + XS(window).height())) {
                              app.scrollToArticle(app.curFocusElement.previousSibling || 0);
                          } else {
                              app.scrollToArticle(app.curFocusElement);
                          }
                      }
                      e.preventDefault();
                      break;
                  case 'ArrowRight': // 下一章 / 下一段
                      if (app.getRemain() <= 4) {
                          // [修复] 目标为空时不要跳 "undefined" 页面
                          if (app.lastRequestUrl || app.requestUrl) {
                              location.href = app.lastRequestUrl || app.requestUrl;
                          } else {
                              UI.notice('已经是最后一章了');
                          }
                      } else {
                          app.scrollToArticle(app.curFocusElement.nextSibling || app.$doc.height());
                      }
                      e.preventDefault(); e.stopPropagation();
                      break;
                  case 'Escape': // 关闭设置面板
                      if (UI.$prefs) {
                          UI.hide();
                          e.preventDefault();
                      }
                      break;
                  case ',': // PageUp 向上滚动一屏
                      window.scrollTo(window.scrollX, window.scrollY - window.innerHeight * .9);
                      e.preventDefault();
                      break;
                  case '.': // PageDown 向下滚动一屏
                      window.scrollTo(window.scrollX, window.scrollY + window.innerHeight * .9);
                      e.preventDefault();
                      break;
                  case ']': // 下一章（快捷）
                      if (app.getRemain() <= 4) {
                          if (app.lastRequestUrl || app.requestUrl) {
                              location.href = app.lastRequestUrl || app.requestUrl;
                          } else {
                              UI.notice('已经是最后一章了');
                          }
                      } else {
                          app.scrollToArticle(app.curFocusElement.nextSibling || app.$doc.height());
                      }
                      e.preventDefault();
                      break;
                  case '[': // 上一章（快捷）
                      if (app.prevUrl) {
                          location.href = app.prevUrl;
                      }
                      e.preventDefault();
                      break;
                  case ' ': // 空格：保持浏览器默认向下滚动一屏；滚动后主动触发一次上屏/续读检查，
                            // 解决「空格滚到底后不再产生 scroll 事件，下一页已就绪却不 append」的卡住
                            // （空格看书最容易触发，因为一次滚一屏、到底即停）。
                      if (UI.$prefs) break;
                      setTimeout(function() {
                          if (app.request) app.scroll();
                      }, 60);
                      break;
              }
          });
      },
      scrollToArticle: function(elem: HTMLElement) {
          let offsetTop;
          if (typeof elem == "number") {
              offsetTop = elem;
          } else {
              offsetTop = XS(elem).offset().top - parseInt(XS(elem).css("margin-top"), 10);
          }
          // 章节直达滚动：删除开关后固定平滑滚动
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      },
      openUrl: function(url: string, errorMsg: string) {
          if (url) {
              setTimeout(function() {
                  openInTab(url, false);
              }, 0);
          } else if (errorMsg) {
              UI.notice(errorMsg);
          }
      },
      toggleAutoScroll: function() {
          if (app.autoScrolling) {
              app.stopAutoScroll();
          } else {
              app.startAutoScroll();
          }
      },
      startAutoScroll: function() {
          app.autoScrolling = true;
          UI.notice('<b>自动滚动</b>已<span style="color:red!important;"><b>开始</b></span>');
          let speed = Setting.auto_scroll_speed;
          let lastTs: any = null, acc = 0;
          function tick(ts: number) {
              if (!app.autoScrolling) { app.autoScrollTimer = null; return; }
              if (lastTs === null) lastTs = ts;
              let dt = (ts - (lastTs ?? ts)) / 1000;
              lastTs = ts;
              // 接近底部自动加载下一页（方案A：预加载开启时400px预读；关闭时触底0px才加载）
              if (Setting.preload_next_page && app.getRemain() < Setting.remain_height) {
                  app.scrollForce();
              } else if (!Setting.preload_next_page && app.getRemain() <= 4) {
                  app.scrollForce();
              }
              // 按时间差逐帧滚动、像素累加，平滑连续
              acc += speed * dt;
              let whole = Math.floor(acc);
              if (whole > 0) { window.scrollBy(0, whole); acc -= whole; }
              app.autoScrollTimer = requestAnimationFrame(tick);
          }
          app.autoScrollTimer = requestAnimationFrame(tick);
      },
      stopAutoScroll: function() {
          app.autoScrolling = false;
          if (app.autoScrollTimer) {
              cancelAnimationFrame(app.autoScrollTimer);
              app.autoScrollTimer = null;
          }
          UI.notice('<b>自动滚动</b>已<span style="color:red!important;"><b>暂停</b></span>');
      },
      scroll: async function() {
          // 滚动时根据当前可见章节更新标签页标题（避免预加载时标签页跳到最后一章）
          app.updateTabTitleOnScroll();

          if (!app.paused) {
              // [修复] 下一页内容已就绪（请求完成 status=Finish）但尚未上屏：直接加载追加，
              // 不依赖 getRemain<remain_height 的窄门槛。根因：空格(pageDown)是大粒度滚动，
              // 滚到底时 getRemain 可能停在 400px 之上或请求尚在 Loading，导致「内容就绪却不
              // 上屏、需滚轮再触发一下」的卡住。只要请求完成即视为需要上屏，立即追加。
              if (app.request && app.request.status === RequestStatus.Finish && app.request.getDocument) {
                  await app.scrollForce();
                  return;
              }
              // [兜底] 请求标记 Loading，但 iframe 内正文实际已就绪（onload 已渲染、仅因
              // onload/token 竞争让 status 停在 Loading）：直接视为 Finish 上屏。
              // 覆盖「正文就绪却不上屏、需回滚一下才出」：滚动时若 iframe 已渲染出实质正文，
              // 不再死等 status 变 Finish（其可能因挑战页重复 onload / token 竞争永不触发）。
              if (app.request instanceof IframeRequest
                  && app.request.status === RequestStatus.Loading
                  && app.request.doc && app.request.doc.body
                  && app.request.doc.body.textContent.replace(/\s+/g, '').length >= 100) {
                  app.request.status = RequestStatus.Finish;
                  await app.scrollForce();
                  return;
              }
              // 方案A：预加载开启时，滚动接近底部(400px)后台预读下一页；预加载关闭时，触底(0px)才加载下一页
              if (Setting.preload_next_page && app.getRemain() < Setting.remain_height) {
                  // 日志：滚动触发预加载（仅真正触发时记录，避免滚动刷屏）
                  await app.scrollForce();
              } else if (!Setting.preload_next_page && app.getRemain() <= 4) {
                  await app.scrollForce();
              }
          }

          if (app.isTheEnd) {
              app.$loading.html("已到达最后一页...").show();
          }

      },
      scrollForce: async function() {
          // [限深] 不在此重置链式预读额度：scrollForce 会被「加载完成后的自动补位」反复调用，
          // 若在此重置会导致 afterLoad 限深(count<1)每次都被清零、限深失效，
          // 静止时链式预读无限续读到书末、章节列表/正文一路暴涨。
          // 额度仅在「用户真实滚动」(registerControls 的 throttled)时重置。
          switch (app.request.status) {
              case RequestStatus.Idle:
                  await app.doRequest();
                  break;
              case RequestStatus.Loading:
                  // [修复] 翻页请求进行中时滚动触底：不再设「从未被消费的死标志 _pendingResume」，
                  // 而是主动等待在途请求完成（限时约 10s），完成后立即走 Finish 分支追加正文。
                  // 根因：原实现只置 _pendingResume=true（全代码无任何读取处），导致「正在载入
                  // 下一页」期间用户无论怎么滚动都只反复设死标志、永远续接不上，须等请求碰巧完成
                  // 才上屏——表现为「一直载入，往回滚一点才出」。现在滚动会真正等到内容就绪并自动上屏。
                  if (app._waitingLoading) break;   // 已有等待循环在跑，避免并发叠加
                  app._waitingLoading = true;
                  try {
                      for (let wi = 0; wi < 40 && app.request.status === RequestStatus.Loading; wi++) {
                          await sleep(250);
                      }
                      if (app.request.status === RequestStatus.Finish) {
                          await app.scrollForce();   // 递归：走 Finish 分支追加正文
                      }
                      // [修复] 等待的当前章已上屏后，若仍接近底部且可继续翻页，立即续读下一章：
                      // 否则用户「滚到底时当前章尚在 Loading」→ 等待上屏后停在底部、无新滚动事件，
                      // 下一章不来，表现为「正文到底、需往上滚一下才出」。
                      if (!app.paused && !app.isTheEnd && !app.isRequesting
                          && app.request && app.request.status === RequestStatus.Idle
                          && app.getRemain() < Setting.remain_height) {
                          await app.doRequest();
                      }
                  } finally {
                      app._waitingLoading = false;
                  }
                  break;
              case RequestStatus.Finish:
                  await app.loaded(app.request.getDocument());
                  break;
              case RequestStatus.Fail:
                  const nextUrl = app.curPageUrl;
                  app.$loading.html("<a href='" + nextUrl + "'>无法获取下一页，请手动点击</a>").show();
                  break;
          }
      },
      updateCurFocusElement: function(cur: any) { // 滚动激活章节列表（由 IntersectionObserver 提供当前章节）
          if (!cur || !cur.id) return;
          let id = cur.id;

          if (app.lastId !== id) {
              app.lastId = id;

              let activeItem = app.menuItems.filter('[href="#' + id + '"]'),
                  activeUrl = activeItem.attr("realHref");

              // Set/remove active class
              app.menuItems.parent().removeClass("active");
              activeItem.parent().addClass("active");

              app.curFocusElement = cur;
              app.curFocusIndex = app.scrollItems.index(cur);
              app.activeUrl = activeUrl;

          }
      },
      _initChapterObserver: function() { // IntersectionObserver 监听章节，替代 scroll+offsetTop 判定当前章节
          if (app._chapterObserver) app._chapterObserver.disconnect();
          let observer = new IntersectionObserver(function(entries) {
              let cur: any = null, best = Infinity, c = window.innerHeight / 2;
              for (let i = 0; i < entries.length; i++) {
                  let en = entries[i];
                  if (!en.isIntersecting) continue;
                  let rect = en.boundingClientRect;
                  let d = Math.abs((rect.top + rect.height / 2) - c);
                  if (d < best) { best = d; cur = en.target; }
              }
              if (cur) app.updateCurFocusElement(cur);
          });
          app.scrollItems.each(function(this: any) { observer.observe(this); });
          app._chapterObserver = observer;
      },
      getRemain: function() {
          let scrollHeight = Math.max(document.documentElement.scrollHeight,
              document.body.scrollHeight);
          let remain = scrollHeight - window.innerHeight - window.scrollY;
          return remain;
      },
      // 滚动时根据当前可见章节更新标签页标题和章节列表高亮（避免预加载时标签页跳到最后一章）
      updateTabTitleOnScroll: function() {
          let articles = XS("article[id^=page-]");
          if (!articles.length) return;
          let scrollY = window.scrollY;
          let currentChapter = null;
          // 从后往前找，找到第一个 top <= scrollY + 50 的章节（即视口顶部所在的章节）
          for (let i = articles.length - 1; i >= 0; i--) {
              let rect = articles[i].getBoundingClientRect();
              let top = rect.top + scrollY;
              if (top <= scrollY + 50) {
                  currentChapter = articles[i];
                  break;
              }
          }
          if (!currentChapter) currentChapter = articles[0];
          // 获取章节标题
          let titleEl = XS(currentChapter).find("h1.title");
          let chapterTitle = titleEl.text();
          if (!chapterTitle) return;
          // 获取章节URL
          let chapterId = XS(currentChapter).attr("id");
          let pageNum = parseInt(chapterId.replace("page-", ""));
          let parser = app.parsers[pageNum];
          // 更新标签页标题
          if (parser && parser.curPageUrl) {
              // 书名优先取站点规则解析出的 parser.bookTitle（'目录' 是解析失败时的占位），
              // 不再从 document.title 里用 split(' - ') 猜测——无规范书名结构时会猜错（如把「下一章」当书名）。
              let _base = (parser.bookTitle && parser.bookTitle !== '目录') ? parser.bookTitle : '';
              let newTitle = _base ? _base + ' - ' + chapterTitle : chapterTitle;
              if (document.title !== newTitle) {
                  document.title = newTitle;
                  // 同步URL（仅当变化时）
                  if (location.href !== parser.curPageUrl) {
                      try { history.replaceState({}, '', parser.curPageUrl); } catch (e) {}
                  }
              }
              // [修复] 保存当前章节的URL，退出时直接用这个URL（与标签页完全同步）
              app._currentExitUrl = parser.curPageUrl;
          }
          // 更新章节列表高亮
          if (app.$chapterList) {
              app.$chapterList.find('.chapter.active').removeClass('active');
              // 找到对应的章节列表项
              let chapterItems = app.$chapterList.find('.chapter');
              for (let j = 0; j < chapterItems.length; j++) {
                  let itemTitle = XS(chapterItems[j]).find('div').text();
                  if (itemTitle === chapterTitle) {
                      XS(chapterItems[j]).addClass('active');
                      break;
                  }
              }
          }
      },
      doRequest: async function() {
          if (app.isRequesting) {
              // 已有请求在进行：短暂延迟后自动重试，避免请求被静默丢弃
              if (!app._doRequestRetry) {
                  app._doRequestRetry = setTimeout(function() {
                      app._doRequestRetry = null;
                      app.doRequest();
                  }, 600);
              }
              return;
          }
          app.isRequesting = true;

          // [兜底] 翻页请求可能被站点防护/网络挂起（onload 迟迟不来），若 8 秒仍未完成，
          // 首次超时自动静默重试 1 次（重新解析同一目标再发起）；仍超时才释放请求锁、清提示，
          // 避免站点偶尔挂起首跳时只能靠手动滚动才恢复翻页链。
          clearTimeout(app._reqTimer);
          app._requestActive = true;
          let _reqGuard = function() {
              if (!app._requestActive) return;
              // [修复] iframe 翻页请求进行中（无论 onload 是否已触发、正文是否已就绪）时，
              // 不 8s 强断重发：原逻辑会重新 send→iframe 再次 onload→_loadToken 递增
              // →丢弃在途 loaded()，反复如此 status 永远 Loading、永不 Finish——「一直载入」的根因。
              // 起点等站点 onload 或正文渲染可能延迟数秒到十几秒，故给予更长的分段续期等待，
              // 交给 loaded() 的 waitTimeout 自然结束（必会 Finish 上屏或给出明确结果）。
              if (app.request === app.iframeRequest
                  && app.iframeRequest.status === RequestStatus.Loading) {
                  app._reqTimerExtend = (app._reqTimerExtend || 0) + 1;
                  if (app._reqTimerExtend <= 10) {   // 最多再延 10*4=40s，覆盖 onload/正文渲染延迟
                      app._reqTimer = setTimeout(_reqGuard, 4000);
                      return;
                  }
                  app._reqTimerExtend = 0;
              }
              app._requestActive = false;
              if (app._reqRetryCount < 1) {
                  // 首次超时：清锁后重新解析同一目标，自动重试 1 次
                  app._reqRetryCount++;
                  try {
                      let p2 = new (Parser as any)(app.site, document, app.curPageUrl);
                      app.requestUrl = p2.nextUrl;
                      app.isTheEnd = p2.isTheEnd;
                  } catch (e) { app.requestUrl = null; }
                  if (app.requestUrl && !app.isTheEnd) {
                      app.isRequesting = false;
                      app.doRequest();
                      return;
                  }
                  // 无法解析下一页目标：落入下方降级
              }
              app._reqRetryCount = 0;
              app.isRequesting = false;
              clearTimeout(app._loadingHideTimer);
              app.$loading.hide().html("");
              try {
                  let p = new (Parser as any)(app.site, document, app.curPageUrl);
                  app.requestUrl = p.nextUrl;
                  app.isTheEnd = p.isTheEnd;
              } catch (e) { app.requestUrl = null; }
              // [兜底] iframe 请求耗尽续期仍停在 Loading（onload 迟迟不来 / 正文迟迟不渲染）：
              // 强制转为 Fail 并触发 scrollForce，走「无法获取下一页」的明确提示，
              // 避免 UI 永久停在「正在载入下一页」——用户「一直载入、往回滚一点才出」的直接诱因。
              if (app.request === app.iframeRequest
                  && app.iframeRequest.status === RequestStatus.Loading) {
                  app.iframeRequest.status = RequestStatus.Fail;
                  app.scrollForce();
              }
          };
          app._reqTimer = setTimeout(_reqGuard, 8000);

          let nextUrl = app.requestUrl;
          const referer = app.lastRequestUrl || app.curPageUrl;
          app.lastRequestUrl = app.requestUrl;

          if (nextUrl && !app.isTheEnd && !(nextUrl in app.parsedPages)) {
              try {
                  app.curPageUrl = app.requestUrl;
              app.requestUrl = null;

              let useiframe = app.site.useiframe;
              // 日志：记录翻页请求发起（模式/URL/referer）
              clearTimeout(app._loadingHideTimer);   // 清除上一章可能仍在等待的隐藏计时器

              app.$loading
                  .show()
                  .html("")
                  .append('<svg width="18" height="18" viewBox="0 0 18 18" style="vertical-align:-4px;margin-right:6px"><circle cx="9" cy="9" r="7" fill="none" stroke="rgba(120,120,120,0.20)" stroke-width="2"/><circle cx="9" cy="9" r="7" fill="none" stroke="rgba(120,120,120,0.85)" stroke-width="2" stroke-linecap="round" stroke-dasharray="30 44" stroke-dashoffset="0"><animateTransform attributeName="transform" type="rotate" from="0 9 9" to="360 9 9" dur="0.9s" repeatCount="indefinite"/></circle></svg>')
                  .append("<a href='" + nextUrl + "' tabindex='-1'>正在载入下一页" + (useiframe ? "(iframe)" : "") + "...</a>");

              await sleep(app.site.nDelay || 0);

              if (useiframe) {
                  app.request = app.iframeRequest;
              } else {
                  app.request = app.httpRequest;
              }
              
              if (app.site.withReferer) {
                  app.request.send(nextUrl, referer);
              } else {
                  app.request.send(nextUrl);
              }
              } catch (e) {
                  // [修复] 请求体抛异常时也必须释放 isRequesting 锁，否则锁永久卡死，
                  // 导致后续翻页（含手动下一页）全部失效，只能退出阅读模式重进才能恢复。
                  app.$loading.html("<a href='" + nextUrl + "'>翻页请求异常，请点此手动打开</a>").show();
                  // [修复] 真正执行释放：异常路径此前只写了注释却未释放，导致锁永久卡死、后续翻页全部失效
                  app.isRequesting = false;
              }
      
          }

          // [架构修复] 移除「定时器提前释放 isRequesting 锁」：请求未完成时提前解锁，
          // 会允许滚动/预读对同一 iframeRequest 实例重复 send→递增 _loadToken→丢弃在途
          // loaded()→status 停 Loading→正文就绪却不上屏——「一直载入、回滚才出」的真正根源，
          // 也是「同类软件没有此问题、本扩展有」的架构差异所在。
          // 锁现在只在请求终态释放：成功(addNextPage 成功分支)/失败(addNextPage else)/异常(catch)/超时(_reqGuard)。
          // 请求间节流由 afterLoad 预读的 nDelay 间隔与滚动 throttle 承担，不依赖此提前解锁。
      },
      loaded: async function(doc: HTMLElement) {
          let parser = new (Parser as any)(app.site, doc, app.curPageUrl);
          await parser.getAll();
          // 日志：请求加载完成，正文解析结果
          await app.addNextPage(parser);
      },
      addNextPage: async function(parser: Parser) {
          app.lastNextFromReal = !!parser.nextFromReal;   // 供翻页节流自适应
          // 请求已完成，清除超时兜底守卫，并重置超时重试计数
          app._requestActive = false;
          app._reqRetryCount = 0;
          clearTimeout(app._reqTimer);
          if (parser.content) {
              app.appendPage(parser);
              // [兜底] 上屏后强制一次重排：确保新章节高度被浏览器立即识别，
              // 覆盖长章节/懒渲染时重排延迟导致「内容已就绪却仍显示到底、需滚动一下才出」。
              try { window.dispatchEvent(new Event('resize')); } catch (e) {}
              // [恢复可见反馈] 请求成功且正文已上屏后，提示短暂停留再隐藏：
              // 原实现立即 hide，快速上屏/预载就绪时「正在载入下一页」一闪而过甚至不可见，
              // 用户看不到翻页反馈。延迟 600ms 隐藏，既让用户看清加载已完成，
              // 又不至于像旧版那样「正文已就绪但提示一直挂着、误以为卡住」。
              clearTimeout(app._loadingHideTimer);
              app._loadingHideTimer = setTimeout(function () {
                  app.$loading.hide().html("");
              }, 600);


              app.requestUrl = parser.nextUrl;
              app.isTheEnd = parser.isTheEnd;

              // [修复] 正常翻页成功后必须释放 isRequesting 锁：
              // 否则 afterLoad 的链式预读(next)与后续 doRequest 恒被 isRequesting=true 挡住，
              // 导致「读几章后下一页加载不了 / 等待下一页」——重构为自研 DOM 层后此释放丢失。
              app.isRequesting = false;

              await app.afterLoad();
          } else {
              app.removeListener();

              let msg = (parser.isTheEnd == 'vip') ?
                  'vip 章节，需付费。' :
                  '错误：没有找到下一页的内容。';
              clearTimeout(app._loadingHideTimer);
              app.$loading.html(
                  '<a href="' + app.curPageUrl + '">' + msg + '点此打开下一页。</a>')
                  .show();
              // [修复] 翻页失败(无正文)也必须释放锁，否则后续翻页被 isRequesting 永久挡住
              app.isRequesting = false;
          }

      },

      afterLoad: async function() {
          // 懒加载正文修复：网站正文滚动到哪渲染到哪（尤其长章节），滚动渲染的新段落未经净化/优化，
          // 用 MutationObserver 监听正文容器，新段落渲染时重新应用净化+优化（仅首次挂接一次）
          this._initLazyContentFix();

          // [优化·参考 Super-preloader] 受控链式预读下一页：
          // 当前章加载完成后，延迟一小段（走翻页节流间隔）后台预读下一页，使下一页提前就绪。
          // 预读超前上限 1 章：你正在看第5章，后台预读第6章就够了，
          // 预读 2 章反而容易触发站点风控，也浪费流量。
          // 且只要「当前已接近底部(剩余<remain_height)」就继续预读下一章，
          // 保证读到任何一章末尾时下一章已就绪、无缝续读。
          let selectedf = this;
          if (Setting.preload_next_page && !this.isTheEnd && !this._preloadChainPending
              && ((this._preloadChainCount || 0) < 1 || this.getRemain() < Setting.remain_height)) {
              this._preloadChainCount = (this._preloadChainCount || 0) + 1;
              this._preloadChainPending = true;
              setTimeout(function() {
                  // [优化3] 若等待期间用户已滚动离开预读区（外部已取消本预读），跳过不再拉取
                  if (!selectedf._preloadChainPending) return;
                  selectedf._preloadChainPending = false;
                  if (!selectedf.paused && !selectedf.isTheEnd && !selectedf.isRequesting) {
                      selectedf.doRequest();
                  }
              }, selectedf.site.nDelay || (selectedf.lastNextFromReal ? 450 : 1500));
          }
      },

      // [修复] 懒加载正文优化：滚动/按需渲染的新段落未经过 applyContentSettings，需重新应用净化+优化
      _initLazyContentFix: function() {
          let selectedf = this;
          if (selectedf._lazyFixStarted) return;
          let $content = selectedf.$content;
          if (!$content || !$content[0]) return;
          selectedf._lazyFixStarted = true;
          let host = getUrlHost(location.href);
          let optTag = 'data-xs-opt';
          // 完整优化替换器：与首次加载一致（含合并多行引号/按句分段等 getNormalizeMap 规则）
          let fullReplace = function(t: string, map: Record<string,string>) {
              for (let k in map) { t = t.replace(toRE(k), map[k]); }
              return t;
          };
          let obs = new MutationObserver(function(muts) {
              muts.forEach(function(m) {
                  if (m.type !== 'childList' || !m.addedNodes) return;
                  m.addedNodes.forEach(function(node) {
                      if (node.nodeType !== 1) return;
                      let $n = XS(node);
                      if ($n.is('article')) return; // 脚本追加的翻页章节，已优化
                      let $p = $n.is('p') ? $n : $n.find('p').addBack().filter('p');
                      $p.each(function(this: any) {
                          let $this = XS(this);
                          if ($this.attr(optTag)) return; // 已处理过
                          let text = $this.text();
                          if (!text.trim()) return;
                          let processed = applyContentSettings(text, host, fullReplace);
                          if (processed === text) { $this.attr(optTag, '1'); return; }
                          let paras = processed.split('\n').map(function(this: any, s: string){ return s.trim(); }).filter(Boolean);
                          if (paras.length) {
                              let html = paras.map(function(this: any, s: string){ return '<p ' + optTag + '="1">　　' + escapeHtml(s) + '</p>'; }).join('');
                              $this.replaceWith(html);
                          } else {
                              $this.attr(optTag, '1');
                          }
                      });
                  });
              });
          });
          obs.observe($content[0], { childList: true, subtree: true });
      },

      getSiteFontInfo: function () {
          const fonts: { external: any[]; internal: any[]; family: any[] } = { external: [], internal: [], family: [] };
          const { external, internal, family } = fonts;

          // 获取所有的字体名字
          for (const font of document.fonts) {
              family.push(font.family);
          }

          // 获取外部 css 地址和内部 css 样式文本
          for (const styleSheet of document.styleSheets) {
              try {
                  for (const cssRule of styleSheet.cssRules) {
                      if (cssRule instanceof CSSFontFaceRule) {
                          const fontFamily = cssRule.style.fontFamily;
                          const cssText = cssRule.cssText;
                          if (!internal.find(o => o.fontFamily === fontFamily)) {
                              internal.push({ fontFamily, cssText });
                          }
                      }
                  }
              } catch (e) {
                  external.push(styleSheet.href);
              }
          }
          
          // 处理成 font-family 样式格式
          let familyList: string[] = [];

          // 内部样式优先
          internal.forEach(e => {
//#endregion
//#region [M13] 启动注入
              familyList.push(e.fontFamily);
          });

          family.forEach(e => {
              if (!familyList.includes(e)) {
                  familyList.push(e);
              }
          });
          // 含空格字体名补双引号
          familyList = familyList.map(e => {
              if (e.includes(' ')) {
                  return `"${e}"`
              } else {
                  return e
              }
          });

          (fonts as any).siteFontFamily = familyList.join(',') + ',';
          
          return fonts
      }
  };


  // =====================================================================
  // [模块 M13] 启动注入
  // 职责：存储预加载 → app.init() 启动 → 扩展增强监听（设置开关/遮罩关闭/
  //       onMessage）→ 兜底按钮
  // 依赖：M12 app、M10 UI
  // =====================================================================
  (async function(){
    // 预加载 chrome.storage 到 Store 缓存（loadAll 为模块顶层函数，直接调用）
    try { await loadAll(); }  catch(e) {}

    // [v3.0] 按站点启用 + 黑白名单准入：
    //  - 域名未启用 → 页面休眠（不识别、不显示任何阅读按钮），仅 popup/油猴菜单可操作启用
    //  - 域名已启用 → 页面白名单跳过黑名单；否则命中页面黑名单则拦截（不显示按钮）
    let _hostname = location.hostname || '';
    let _siteEnabled = app.isSiteEnabled(_hostname);
    let _blacklisted = _siteEnabled && !app.isPageWhitelisted() && app.isPageBlacklisted();
    let _shouldRun = _siteEnabled && !_blacklisted;

    // 注册油猴 GM 菜单「在此网站启用/关闭阅读助手」（无论休眠与否都注册，供用户手动启用）
    try { app.registerUserscriptMenu(); } catch(e) {}

    if (_shouldRun) {
      // 已启用且未命中黑名单：统一注册「进入阅读模式/尝试解析」入口，用户手动触发对当前页解析
      try { await app.init(); }  catch(e) {}
    }
    // 休眠（未启用）或被黑名单拦截：不创建任何阅读入口；页面保持原样

    // ============ 扩展增强：设置面板的打开/关闭不依赖 app.init 是否完整执行 ============
    // 根因：o 键 keydown 监听在 app.registerControls 里绑定，而 init() 在「站点未启用/
    //       autoLaunch===-1」时会提前 return，导致 keydown 未绑定；但设置面板可通过扩展
    //       图标（message → UI.preferencesShow，绕过 init）打开，于是出现「能开不能关」。
    // 修复：在扩展注入时就绑定独立的 o 键开关监听 + 点遮罩兜底 + Esc 兜底，始终可关。
    try {
      if (typeof window === 'undefined') throw new Error('no window');

      // 打开设置的默认/自定义快捷键（读 Setting，与 registerKeys 一致）
      function getPrefsKey() {
        try {
          let k = String(Setting.open_preferences_key || '').trim().toLowerCase();
          return k || 'o';
        } catch (e) { return 'o'; }
      }

      // 独立 o 键开关监听：面板开→关，关→开（用捕获阶段，优先于 registerKeys，避免重复）
      document.addEventListener('keydown', function (e) {
        let t: any = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
        // [跨平台] 与 registerKeys 同一套护栏：修饰键组合 + 输入法组合态一律放行。
        // 这个监听在捕获阶段且会 stopImmediatePropagation，不挡的话 Ctrl+O 连浏览器都打不开文件。
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.isComposing || e.keyCode === 229) return;
        let k = String(e.key || '').toLowerCase();
        if (k !== getPrefsKey()) return;
        // 未进入阅读模式时不响应设置快捷键（不进阅读模式即不影响当前标签页）
        let _inReader = !!(document.body && document.body.getAttribute && document.body.getAttribute('name') === '小说阅读助手');
        if (!_inReader) return;
        let $prefs = UI.$prefs;
        if ($prefs && $prefs.length) {
          try { UI.hide(); } catch (ex) {}
        } else {
          try { UI.preferencesShow(); } catch (ex) {}
        }
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }, true);

      // 点遮罩(backdrop)关闭兜底：两种情形都关闭——
      //   (a) e.target === dialog（backdrop 正常渲染，点击遮罩 target 为 dialog 自身）
      //   (b) !dialog.contains(e.target)（backdrop 未渲染/透明 dialog 撑满，点击 dialog 外部正文）
      // 点击 dialog 内部子元素（contains=true 且 ≠dialog）不关闭，避免误关设置。
      document.addEventListener('mousedown', function (e) {
        let $prefs = UI.$prefs;
        if (!$prefs || !$prefs.length) return;
        let dialog = $prefs[0];
        if (e.target === dialog || !dialog.contains(e.target)) {
          try { UI.preferencesCloseHandler(); } catch (ex) {}
        }
      }, true);

      // [v3.0] popup / 油猴菜单 切换启用状态、修改黑白名单后，当前页立即响应。
      // 用 chrome.storage.onChanged（油猴经 adapter 垫片为 GM 存储的同步语义，此处仅扩展生效，
      // 油猴菜单回调内直接同步重建按钮，双端行为一致）。
      // [修复] popup 直接写 chrome.storage，不会经过 Store.set；必须把变更同步进 Store 的
      //       内存缓存 __store，否则 isSiteEnabled()/isPageWhitelisted() 永远读到旧值，
      //       表现为「点击启用后毫无反应」。
      function applyEnableChange() {
        let _host = location.hostname || '';
        let _on = app.isSiteEnabled(_host);
        let _block = _on && !app.isPageWhitelisted() && app.isPageBlacklisted();
        let _inReader = !!(document.body && document.body.getAttribute && document.body.getAttribute('name') === '小说阅读助手');

        // [修复] 阅读模式下的处理。
        // 原来这里无条件 return（本意是"别打断正在读的页面"），导致 popup 里点
        // 「在此网站关闭阅读助手」只改了存储、阅读界面纹丝不动，用户以为按钮失效，
        // 而且下次打开 popup 还显示已关闭 —— 存储与界面彻底不一致。
        // 现在只有「仍然启用」才不打断；一旦判定为关闭或被黑名单拦截，立即退出阅读模式。
        if (_inReader) {
          if (_on && !_block) return;
          app.exitReadingMode();
          return;
        }

        try { XS('.reader-enter-wrap').remove(); } catch (e) {}
        if (_on && !_block) {
          try {
            // [修复] 页面加载时若处于休眠状态，app.init() 没跑过 → app.loadCustomSetting()
            // 也没跑过 → SiteRules.customRules 仍是空数组，用户自建的站点规则被忽略，
            // 只能落到通用兜底解析。此处补一次加载，启用后即可按自定义规则进入。
            if (!SiteRules.customRules.length) { app.loadCustomSetting(); }
          } catch (e) {}
          // 首页/入口页与 init 保持同一口径：不显示悬浮入口（否则 popup 在首页启用后
          // 会冒出一个按钮，刷新一下又消失，行为前后不一致）。首页改为给一次轻提示，
          // 避免「点了启用毫无反应」的错觉。
          try {
            app.site = app.getCurSiteInfo();
            if (app.isHomePath()) { UI.showHomeEnabledTip(); }
            else { UI.showEnterReaderButton(); }
          } catch (e) {}
        }
      }

      // popup 写完 chrome.storage 后立刻发消息，此时 storage.onChanged 可能还没派发，
      // __store 里仍是旧值（例如 disabled 站点还在列表里）→ 关闭操作会被判成"仍启用"。
      // 这里先从存储重读三个 key 再判断，让两条通道的到达顺序不影响结果。
      function syncStoreFromStorage(done: () => void) {
        try {
          chrome.storage.local.get(
            { enabled_sites: [], page_whitelist: [], custom_page_blacklist: [] },
            function (items: any) {
              if (items) {
                let _keys = ['enabled_sites', 'page_whitelist', 'custom_page_blacklist'];
                for (let i = 0; i < _keys.length; i++) {
                  let k = _keys[i];
                  if (items[k] === undefined) { delete __store[k]; }
                  else { __store[k] = items[k]; }
                }
              }
              done();
            }
          );
        } catch (e) { done(); }
      }
      try {
        chrome.storage.onChanged.addListener(function (changes: any, area: string) {
          if (area !== 'local') return;
          let touched = false;
          let keys = ['enabled_sites', 'page_whitelist', 'custom_page_blacklist'];
          for (let i = 0; i < keys.length; i++) {
            let k = keys[i];
            if (!changes[k]) continue;
            touched = true;
            if (changes[k].newValue === undefined) { delete __store[k]; }
            else { __store[k] = changes[k].newValue; }
          }
          if (!touched) return;
          applyEnableChange();
        });
      } catch(e) {}

      // [v3.0] popup 双保险消息通道：popup 写完存储后直接 sendMessage 通知本页，
      // 与 onChanged 任一到达都触发 applyEnableChange()（幂等：先移除再按需重建）。
      try {
        chrome.runtime.onMessage.addListener(function (msg: any, sender: any, sendResponse: any) {
          if (!msg || msg.action !== 'xs_site_changed') return;
          // 先从存储重读再判断（见 syncStoreFromStorage 注释），否则关闭动作会被旧缓存挡回去
          syncStoreFromStorage(function () {
            try { applyEnableChange(); } catch (e) {}
            try { sendResponse({ ok: true }); } catch (e) {}
          });
          return true;   // 异步响应，保持消息通道打开
        });
      } catch(e) {}

      // [v3.1] 扩展图标 → 原生 popup（dist/popup.html）：点图标即在图标下方弹出，
      // 位置跟随图标、遮罩、键盘交互均由浏览器提供；窗口四角形状由浏览器决定（CSS 改不了）。
    } catch(e) {}


  })();



}());

//#endregion