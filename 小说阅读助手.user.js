// ==UserScript==
// @name         小说阅读助手
// @namespace    https://github.com/local/小说阅读助手
// @version      1.3
// @description  小说阅读助手：统一阅读样式，提供纯净，舒适的小说阅读体验。
// @match        *://*/*
// @exclude      *://*/List.htm
// @exclude      *://*/List.html
// @exclude      *://*/List.shtml
// @exclude      *://*/index.htm
// @exclude      *://*/index.html
// @exclude      *://*/index.shtml
// @exclude      *://*/Default.htm
// @exclude      *://*/Default.html
// @exclude      *://*/Default.shtml
// @exclude-match *://*/List.htm
// @exclude-match *://*/List.html
// @exclude-match *://*/List.shtml
// @exclude-match *://*/index.htm
// @exclude-match *://*/index.html
// @exclude-match *://*/index.shtml
// @exclude-match *://*/Default.htm
// @exclude-match *://*/Default.html
// @exclude-match *://*/Default.shtml
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @connect      *
// @run-at       document_end
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  // ── 油猴环境适配：把 GM_* 包装成 chrome.* 接口，业务代码无需改动 ──
  function _fire(cb, ...args) {
    try {
      if (typeof cb === "function") cb(...args);
    } catch (e) {
    }
  }
  var shim = {
    runtime: {
      lastError: undefined,
      sendMessage(message, callback) {
        if (!message || typeof message.action !== "string") {
          _fire(callback, { ok: false });
          return;
        }
        if (message.action === "xs_fetch") {
          let _u = null;
          try {
            _u = new URL(message.url);
          } catch (e) {
            _u = null;
          }
          if (!_u || !/^https?:$/.test(_u.protocol)) {
            _fire(callback, { ok: false, status: 0, error: "拒绝非 http(s) 请求" });
            return;
          }
          const headers = { ...message.headers || {} };
          if ((message.method || "GET") === "POST" && message.body && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
          }
          try {
            GM_xmlhttpRequest({
              method: message.method || "GET",
              url: message.url,
              headers,
              // [修复] 未转发请求体：油猴模式下 POST 会变成空 body，与 background 行为不一致
              data: message.body,
              timeout: message.timeout || 15e3,
              anonymous: false,
              onload: (res) => _fire(callback, { ok: true, status: res.status, finalUrl: res.finalUrl, body: res.responseText }),
              onerror: (err) => _fire(callback, { ok: false, status: 0, error: err && err.errorText || "请求失败" }),
              ontimeout: () => _fire(callback, { ok: false, status: 0, error: "请求超时" })
            });
          } catch (e) {
            _fire(callback, { ok: false, status: 0, error: String(e && e.message || e) });
          }
          return;
        }
        if (message.action === "xs_open_tab") {
          try {
            GM_openInTab(message.url, { active: !!message.active, insert: true, setParent: true });
          } catch (e) {
          }
          _fire(callback, { ok: true });
          return;
        }
        _fire(callback, { ok: false, error: "油猴模式不支持的消息: " + message.action });
      }
    },
    storage: {
      local: {
        /** get(null|key|keys[]|{key:default}, cb) → cb(items) —— 同步语义（GM API 本身同步），与原预加载流程兼容 */
        get(keys, callback) {
          let out = {};
          try {
            if (keys === null || keys === undefined) {
              const names = GM_listValues();
              for (let i = 0; i < names.length; i++) out[names[i]] = GM_getValue(names[i]);
            } else if (typeof keys === "string") {
              out = {};
              out[keys] = GM_getValue(keys);
            } else if (Array.isArray(keys)) {
              keys.forEach((k) => {
                out[k] = GM_getValue(k);
              });
            } else if (typeof keys === "object") {
              Object.keys(keys).forEach((k) => {
                out[k] = GM_getValue(k, keys[k]);
              });
            }
          } catch (e) {
          }
          _fire(callback, out);
        },
        set(obj, callback) {
          try {
            Object.keys(obj || {}).forEach((k) => GM_setValue(k, obj[k]));
          } catch (e) {
          }
          _fire(callback);
        },
        remove(key, callback) {
          try {
            const ks = typeof key === "string" ? [key] : Array.isArray(key) ? key : Object.keys(key || {});
            ks.forEach((k) => GM_deleteValue(k));
          } catch (e) {
          }
          _fire(callback);
        }
      }
    }
  };
  var _g = typeof globalThis !== "undefined" ? globalThis : window;
  _g.chrome = shim;
  try {
    window.chrome = shim;
  } catch (e) {
  }

  // ── 主程序 ──
  var mainHtml = `<div id="container">
    <div id="menu-bar" title="点击切换显示/隐藏左侧章节列表"></div>
    <div id="menu">
        <div id="header">
            <a href="{indexUrl}" target="_blank">{bookTitle}</a>
        </div>
        <div id="divider"></div>
        <ul id="chapter-list" title="左键点击跳转到该章节；中键在新标签页打开章节">
        </ul>
    </div>
    <div id="xiaoshuo-reader-content"></div>
    <div id="loading" style="display:none"></div>
    <div id="alert" style="display: none;">
        <p id="App-notice"></p>
    </div>

    <div id="xiaoshuo-reader-app">

    </div>
</div>`;

  var mainCss = `body > a { display:none !important; }
.hidden {
    display: none;
}
.quiet-mode {
    display: none;
}
body {
    background: #F3F2EE;
    color: #1F0909;
    padding: 0px;
    margin: 0px;
    font-family: {uiFont};
}
a { color: #065488; }
a:link { text-decoration: none; }

#xiaoshuo-reader-content {
    width: auto;
    max-width: {content_width};
    font-size: {font_size};
    font-family: {font_family};
    /* 行高与字间距属于正文排版，只在这里出：皮肤样式表不再重复声明，
       否则会盖掉设置面板里用户选的行高 */
    line-height: {text_line_height};
    letter-spacing: 0.05em;
    margin-left:auto;
    margin-right:auto;
    padding-bottom: 15px;
}
#xiaoshuo-reader-content img{
    max-width: 100%;
}

article {
    margin-top: 55px;
    word-wrap: break-word;
}

article p {
    margin: {paragraph_height} 0;
}

article h1 {
    clear: both;
    line-height: 50px;
    font-size: {title_font_size};
    font-weight: normal;
    margin: 25px -20px;
    padding: 0 20px 10px;
    border-bottom: 1px solid rgba(0,0,0,.12);
    font-weight: normal;
    text-transform: none;
}

article li {
    list-style: none;
}

#loading {
    text-align: center;
    font: 12px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
    padding: 8px 18px;
    border-radius: 10px;
    background: rgba(255,255,255,.78);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    backdrop-filter: blur(20px) saturate(1.8);
    border: 0.5px solid rgba(0,0,0,.1);
    box-shadow: 0 10px 40px rgba(0,0,0,.12), 0 1px 3px rgba(0,0,0,.06);
    color: #1D1D1F;
    line-height: 1.6;
}
#loading img {
    vertical-align: middle;
}
#loading a {
    color: #007AFF;
}

#alert {
    position: fixed;
    /* 层级档位：面板 2147483647 > 通知/提示 2147483646 > 悬浮按钮 2147483645。
       z-index 超出 int32(2147483647) 会被钳制，同值时靠 DOM 顺序侥幸排序，故显式分档 */
    z-index: 2147483646;
    width: auto;
    max-width: 70%;
    height: auto;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    padding: 9px 18px;
    border-radius: 10px;
    background: rgba(255,255,255,.78);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    backdrop-filter: blur(20px) saturate(1.8);
    border: 0.5px solid rgba(0,0,0,.1);
    box-shadow: 0 10px 40px rgba(0,0,0,.12), 0 1px 3px rgba(0,0,0,.06);
    color: #1D1D1F;
    font-size: 13px;
    line-height: 1.6;
}
#alert p {
    margin: 0;
}

img.blockImage {clear: both;float: none;display: block;margin-left: auto;margin-right: auto;}

#menu-bar {
    position: fixed;
    left: 0px;
    top: 0px;
    height: 100%;
    width: 1px;
    background: transparent;
    border: none;
    z-index: 199;
}
#menu {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 100;
    width: 280px;
    max-width: 60%;
    background: var(--panel-glass, rgba(248,248,248,1));
    
    
    border-right: 1px solid rgba(0,0,0,.08);
    overflow-y: auto;
    padding: 10px 0;
}
#header{
    color: #1D1D1F;
    margin: 0 18px 4px;
    background: transparent;
    padding: 6px 0;
    text-transform: none;
    font-weight: 600;
    font-size: 15px;
    letter-spacing: .4px;
    border-bottom: 1px solid rgba(0,0,0,.06);
}
#header a {
    color: #888;
}
#chapter-list {
    margin: 0;
    padding: 0;
    cursor: pointer;
    list-style: none;
}
.chapter {
    list-style: none;
}
.chapter div {
    color: #1D1D1F;
    font-size: 13px;
    padding: 8px 18px;
    display: block;
    text-decoration: none;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    cursor: pointer;
}
.chapter div:hover {
    background: rgba(0,0,0,.05);
    color: #1D1D1F;
}
.chapter.active div {
    background: rgba(0,122,255,.12);
    color: #007AFF;
    font-weight: 600;
}
/* macOS 覆盖式滚动条：轨道透明、无箭头、胶囊 thumb 内缩留白 */
::-webkit-scrollbar {
    height: 10px !important;
    width: 10px !important;
}
::-webkit-scrollbar-track,
::-webkit-scrollbar-track-piece {
    background: transparent !important;
    border: none !important;
}
::-webkit-scrollbar-thumb {
    background-color: rgba(0,0,0,.26) !important;
    border: 2px solid transparent !important;
    background-clip: content-box !important;
    border-radius: 100px !important;
}
::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0,0,0,.42) !important;
}
::-webkit-scrollbar-corner {
    background: transparent !important;
}
`;

  var prefsHtml = `<form id='preferences' name='preferences'>\r
    <div class='prefs-header prefs-dragbar'>\r
        <div class='prefs-head-title'>阅读设置</div>\r
    </div>\r
    <div class='prefs-body'>\r
\r
<div class='prefs-sec'>外观设置</div>\r
<div class='prefs-group'>\r
        <div class='prefs-row prefs-label-row'>\r
            <span class='prefs-label'>皮肤</span>\r
        <div class='skin-row'>\r
            <label class='skin-item' data-skin='浅色' title='暖纸白 · 适合白天正常光线长时间阅读'><span class='skin-swatch is-light'>Aa</span>浅色</label>\r
            <label class='skin-item' data-skin='深色' title='深灰底 · 适合低光/夜间，关灯不刺眼'><span class='skin-swatch is-dark'>Aa</span>深色</label>\r
            <label class='skin-item' data-skin='护眼' title='豆沙绿 · 低对比柔和，长时间护眼'><span class='skin-swatch is-eye'>Aa</span>护眼</label>\r
            <label class='skin-item' data-skin='自动' title='跟随系统外观，在浅色/深色间自动切换'><span class='skin-swatch is-auto'><i>A</i><i>a</i></span>自动</label>\r
        </div>\r
        </div>\r
        <select id='skin' style='display:none'></select>\r
        <div class='prefs-row prefs-label-row'>\r
            <span class='prefs-label' title='正文字体，选择后即时预览'>字体</span>\r
            <select id='font-family' class='prefs-select' title='正文字体，选择后即时预览'>\r
                <option value='PingFang SC,苹方-简,宋体,楷体' data-def='mac'>苹方（macOS 默认）</option>\r
                <option value='微软雅黑,宋体,黑体,楷体' data-def='win'>微软雅黑（Windows 默认）</option>\r
                <option value='宋体,SimSun,"Songti SC",宋体-简'>宋体</option>\r
                <option value='楷体,楷体_GB2312,"Kaiti SC",楷体-简'>楷体</option>\r
                <option value='黑体,SimHei,"Heiti SC",黑体-简'>黑体</option>\r
            </select>\r
        </div>\r
        <div class='prefs-grid'>\r
        <div class='prefs-slider'>\r
            <div class='slider-head'><span title='正文字号大小（像素，范围12-40）'>字号</span><span class='slider-val' id='val-font-size'></span></div>\r
            <input type='range' id='font-size' min='12' max='40' step='1'/>\r
        </div>\r
        <div class='prefs-slider'>\r
            <div class='slider-head'><span title='行与行之间的间距（倍数，越大行越疏）'>行高</span><span class='slider-val' id='val-text_line_height'></span></div>\r
            <input type='range' id='text_line_height' min='1.2' max='2.6' step='0.1'/>\r
        </div>\r
        <div class='prefs-slider'>\r
            <div class='slider-head'><span title='段落之间的间距（倍数，越大段落间隔越大）'>段距</span><span class='slider-val' id='val-paragraph_height'></span></div>\r
            <input type='range' id='paragraph_height' min='0' max='2' step='0.1'/>\r
        </div>\r
        <div class='prefs-slider'>\r
            <div class='slider-head'><span title='正文内容的最大宽度（像素，范围600-1400）'>正文宽</span><span class='slider-val' id='val-content_width'></span></div>\r
            <input type='range' id='content_width' min='600' max='1400' step='10'/>\r
        </div>\r
        </div>\r
</div>\r
\r
<div class='prefs-sec'>阅读行为</div>\r
<div class='prefs-group'>\r
        <div class='prefs-row prefs-switch-row'>\r
            <label class='prefs-switch' title='找不到下一页链接时，按网址页码规律自动递增'><input type='checkbox' id='smart-next-page'/>智能自动翻页<span class='track'><span class='thumb'></span></span></label>\r
            <label class='prefs-switch' title='滚动近底部自动预读下一章，翻页更流畅'><input type='checkbox' id='preload-next-page'/>预加载下一页<span class='track'><span class='thumb'></span></span></label>\r
        </div>\r
        <div class='prefs-row prefs-switch-row'>\r
            <label class='prefs-switch' title='隐藏左侧章节列表；需要时按快捷键（c）可临时呼出'><input type='checkbox' id='hide-menu-list'/>隐藏章节列表<span class='track'><span class='thumb'></span></span></label>\r
            <label class='prefs-switch' title='排版优化：合并引号、清洗标点、全半角、自动分段，会调整排版，需时再开'><input type='checkbox' id='enable-content-optimize'/>正文内容优化<span class='track'><span class='thumb'></span></span></label>\r
        </div>\r
        <div class='prefs-row prefs-slider-row'>\r
            <div class='slider-head'><span title='自动滚动阅读时的滚动速度（1-100像素/秒），开启自动滚动（双击页面）后生效'>滚动速度</span><span class='slider-val' id='val-auto-scroll-speed'></span></div>\r
            <input type='range' id='auto-scroll-speed' min='1' max='100' step='1' title='自动滚动阅读时的滚动速度（1-100像素/秒）'/>\r
        </div>\r
</div>\r
\r
<div class='prefs-sec'>站点设置</div>\r
<div class='prefs-group'>\r
        <div class='prefs-row'>\r
            <div class='siteinfo-box'>\r
                <div class='siteinfo-bar'>\r
                    <span class='siteinfo-tag'>JSON</span>\r
                    <span class='siteinfo-count' id='siteinfo-count'>0 条规则</span>\r
                    <input type='button' id='format-siteinfo' value='整理排版' class='btn-plain btn-mini' title='把规则排成缩进对齐格式，每条站点规则之间空一行，便于逐条查看'/>\r
                    <input type='button' id='copy-siteinfo' value='复制' class='btn-plain btn-mini' title='复制全部规则文本'/>\r
                </div>\r
                <textarea id='custom_siteinfo' class='prefs_textarea' spellcheck='false' placeholder='暂无站点规则'></textarea>\r
            </div>\r
        </div>\r
</div>\r
\r
<div class='prefs-sec'>热键配置</div>\r
<div class='prefs-group'>\r
        <div class='prefs-row prefs-key-hint'>前两行可点击按键修改，其余基础导航键默认折叠，点击查看</div>\r
        <table class='prefs-key-table'>\r
            <tr><td>切换章节列表</td><td><button type='button' class='key-btn' id='setHideMenuListKey' title='点击后按键盘新按键设置'>c</button></td></tr>\r
            <tr><td>打开设置</td><td><button type='button' class='key-btn' id='openPreferencesKey' title='点击后按键盘新按键设置'>o</button></td></tr>\r
        </table>\r
        <details class='prefs-key-more'>\r
            <summary>查看其他快捷键</summary>\r
            <table class='prefs-key-table'>\r
                <tr><td>打开小说主页</td><td>Enter</td></tr>\r
                <tr><td>上一章 / 上一段</td><td>← Left</td></tr>\r
                <tr><td>下一章 / 下一段</td><td>→ Right</td></tr>\r
                <tr><td>关闭设置面板</td><td>Esc</td></tr>\r
                <tr><td>向上滚动一屏</td><td>, 逗号</td></tr>\r
                <tr><td>向下滚动一屏</td><td>. 句点</td></tr>\r
                <tr><td>上一章（快捷）</td><td>[</td></tr>\r
                <tr><td>下一章（快捷）</td><td>]</td></tr>\r
                <tr><td>启动 / 暂停自动滚动（鼠标，不可改）</td><td>双击页面</td></tr>\r
            </table>\r
        </details>\r
</div>\r
\r
<div class='prefs-sec'>数据管理</div>\r
<div class='prefs-group'>\r
        <div class='prefs-row prefs-config-row'>\r
            <input type='button' id='reset-config' value='恢复默认' class='btn-plain' title='将全部设置恢复为默认值，保留已启用站点，适合设置被调乱时一键复原'/>\r
            <input type='button' id='export-config' value='导出数据' class='btn-plain' title='导出所有已加载设置与站点规则为JSON备份'/>\r
            <input type='button' id='import-config' value='导入数据' class='btn-plain' title='读取备份文件，自动识别并覆盖对应数据'/>\r
        </div>\r
</div>\r
\r
    </div>\r
    </form>`;

  var prefsCss = `.body {
    color: #1c1c1e; margin: 0 auto;
    background: var(--prefs-bg, rgba(250,249,248,.92));
    padding: 0; border-radius: 16px; overflow: hidden;
    font-size: 13px;
    font-family: {uiFont};
    -webkit-font-smoothing: antialiased;
    border: 1px solid rgba(255,255,255,.5);
    box-shadow: none;
    /* 面板保留半透明（~92% 不透明度）但不做毛玻璃模糊：blur 会虚化透出网页文字，
       与面板内文字混叠；纯半透明且透明度足够高时，背景只隐约透出氛围，文字仍清晰 */
}
.prefs-header { padding: 12px 20px 12px; border-bottom: 1px solid rgba(60,60,67,.14); cursor: default; }
.prefs-head-title { font-size: 15px; font-weight: 600; font-family: {uiFont}; color: #1c1c1e; letter-spacing: .2px; }
.prefs-body { padding: 4px 20px 18px; max-height: 72vh; overflow-y: auto; }

.prefs-sec {
    font-size: 13px; font-weight: 600; color: #007aff;
    margin: 10px 0 4px; padding-top: 10px;
    border-top: 1px solid rgba(60,60,67,.16);
}
.prefs-sec:first-child { margin-top: 4px; padding-top: 0; border-top: none; }
.prefs-group {
    /* 删除卡片视觉：无背景/边框/阴影/圆角，毛玻璃由 .body 整体透出；
       保留原 padding 与 margin-bottom，开关与分行布局完全不变 */
    background: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
    padding: 2px 16px;
    margin-bottom: 6px;
}
.prefs-group > * + * { border-top: 1px solid rgba(60,60,67,.1); margin-top: 12px; padding-top: 12px; }
.prefs-row { display: flex; align-items: center; gap: 10px; margin: 12px 0; }
.prefs-row.prefs-switch-row { gap: 14px; }
.prefs-row.prefs-slider-row { flex-direction: column; align-items: stretch; }
.prefs-label { flex-shrink: 0; width: 28px; font-size: 13px; color: #1c1c1e; }.prefs-label-row { display: flex; align-items: center; gap: 10px; }.prefs-label-row .skin-row { flex: 1; }

.skin-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
.skin-item {
    flex: 1; min-width: 0; border: 1px solid rgba(0,0,0,.12); border-radius: 8px;
    padding: 8px 6px; text-align: center; font-size: 12px; color: #6e6e73; cursor: pointer;
    background: rgba(255,255,255,.5); transition: background .12s, border-color .12s;
}
.skin-item:hover { background: rgba(255,255,255,.8); }
.skin-item.selected { border-color: #007aff; color: #007aff; background: rgba(0,122,255,.09); }
.skin-swatch {
    display: flex; align-items: center; justify-content: center;
    height: 26px; border-radius: 6px; margin-bottom: 6px;
    font-family: {uiFont};
    font-weight: 600; font-size: 13px; line-height: 1; letter-spacing: .5px;
    border: 1px solid rgba(0,0,0,.1);
}
.skin-swatch.is-light { background: #FAF9F8; color: #1D1D1F; }
.skin-swatch.is-dark  { background: #1E1E1E; color: #F5F5F7; }
.skin-swatch.is-eye   { background: #E8F5E9; color: #263238; }
.skin-swatch.is-auto {
    /* 自动皮肤：预览块左半浅色、右半深色（用渐变切分，一条硬边） */
    background: linear-gradient(to right, #FAF9F8 0 50%, #1E1E1E 50% 100%);
    color: #1D1D1F;
}
.skin-swatch.is-auto i { font-style: normal; }
/* 「Aa」双色：左边深色字落在浅底上，右边浅色字落在深底上，两边都清晰 */
.skin-swatch.is-auto i:nth-child(1) { color: #1D1D1F; }
.skin-swatch.is-auto i:nth-child(2) { color: #F5F5F7; }

select, .prefs-select {
    flex: 1; min-width: 0; padding: 5px 9px; border: 1px solid rgba(0,0,0,.14); border-radius: 6px;
    font-size: 13px; background: rgba(255,255,255,.7); color: #1c1c1e;
    -webkit-appearance: none; appearance: none;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888888' stroke-width='1.6' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 9px center; background-size: 10px 6px; padding-right: 26px;
}
select:focus, .prefs-select:focus { outline: none; border-color: #007aff; }

.prefs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 22px; margin: 14px 0; }
.prefs-slider { display: flex; flex-direction: column; gap: 6px; }
.slider-head { display: flex; justify-content: space-between; font-size: 13px; color: #1c1c1e; }
.slider-val { font-size: 11px; color: #8e8e93; font-variant-numeric: tabular-nums; }
input[type=range] {
    width: 100%; -webkit-appearance: none; appearance: none;
    height: 5px; border-radius: 3px; cursor: default; background: linear-gradient(to right, #007aff 0%, #007aff var(--val), rgba(0,0,0,.14) var(--val), rgba(0,0,0,.14) 100%);
}
input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 20px; height: 20px; border-radius: 50%;
    background: #fff; border: 1px solid rgba(0,0,0,.18);
    box-shadow: 0 1px 4px rgba(0,0,0,.22), 0 2px 8px rgba(0,0,0,.14);
}

.prefs-switch { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #1c1c1e; cursor: pointer; flex: 1; min-width: 0; }
.prefs-switch input { display: none; }
.prefs-switch .track {
    width: 38px; height: 22px; border-radius: 12px; background: rgba(0,0,0,.18);
    position: relative; flex-shrink: 0; transition: background .18s; order: 2;
}
.prefs-switch .track .thumb {
    width: 18px; height: 18px; border-radius: 50%;
    background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,.25);
    position: absolute; top: 2px; left: 2px; transition: transform .18s;
}
.prefs-switch input:checked ~ .track { background: #007aff; }
.prefs-switch input:checked ~ .track .thumb { transform: translateX(16px); }
.prefs-switch-space { flex: 1; }

.prefs_textarea {
    width: 100%; height: 64px; padding: 9px 12px; border: 1px solid rgba(0,0,0,.14);
    border-radius: 8px; background: rgba(255,255,255,.65); font-size: 13px; color: #1c1c1e;
    resize: vertical; font-family: inherit; box-sizing: border-box;
}
.prefs_textarea:focus { outline: none; border-color: #007aff; }

/* ===== 站点规则：代码编辑器风格（等宽 + 每条规则独立成块，一眼看清） ===== */
/* .prefs-row 是 flex 布局，siteinfo-box 作为子项必须 flex:1 才会撑满整行，
   否则按内容收缩成半宽，textarea 的 width:100% 只相对收缩后的盒子生效 */
.siteinfo-box { display: block; flex: 1; min-width: 0; }
.siteinfo-bar {
    display: flex; align-items: center; gap: 8px; margin-bottom: 7px;
}
.siteinfo-tag {
    font-family: {monoFont}; font-size: 11px; font-weight: 700; letter-spacing: .5px;
    color: #007aff; background: rgba(0,122,255,.1); border-radius: 5px; padding: 2px 7px;
}
.siteinfo-count { font-size: 11px; color: #8e8e93; font-variant-numeric: tabular-nums; flex: 1; min-width: 0; }
.btn-mini { padding: 3px 10px; font-size: 12px; border-radius: 6px; flex-shrink: 0; }

#custom_siteinfo {
    /* 高度减半（180 → 90）；min-height 与 height 相同，配合 resize:vertical
       只能往上拉高、不能往回收（拖到底也停在 90px） */
    height: 90px;
    min-height: 90px;
    font-family: {monoFont};
    font-size: 12.5px;
    line-height: 1.75;
    letter-spacing: 0;
    tab-size: 2;
    /* 长行（如 url 正则）自动折回，不再横向截断；pre-wrap 保留行首缩进层级 */
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: normal;
    overflow-x: hidden;
    overflow-y: auto;
    background: #FAFAFC;
    color: #24292F;
    border-color: rgba(0,0,0,.12);
}
#custom_siteinfo::placeholder { color: #9AA4AE; }
#custom_siteinfo:focus { background: #fff; }
.body.prefs-dark #custom_siteinfo { background: #1B1B1D; color: #E6E6EA; border-color: rgba(255,255,255,.16); }
.body.prefs-dark #custom_siteinfo::placeholder { color: #6C7080; }
.body.prefs-dark #custom_siteinfo:focus { background: #232326; }
.body.prefs-dark .siteinfo-tag { color: #6bb8ff; background: rgba(10,132,255,.18); }
.body.prefs-dark .siteinfo-count { color: #8E929C; }
.body.prefs-eye #custom_siteinfo { background: #F2F7F3; color: #263238; }
/* 缺此行会命中基础态 :focus{background:#fff}，点击输入时淡绿底跳成纯白 */
.body.prefs-eye #custom_siteinfo:focus { background: #EAF3EC; }
.body.prefs-eye #custom_siteinfo::placeholder { color: #7A8C80; }
.body.prefs-eye .siteinfo-tag { color: #1f7a3d; background: rgba(52,199,89,.14); }
.body.prefs-eye .siteinfo-count { color: #5b6e60; }

.prefs-key-hint { font-size: 12px; color: #8e8e93; margin: 12px 2px 4px; }
.prefs-key-more > summary { list-style: none; cursor: pointer; padding: 6px 4px; font-size: 13px; font-weight: 600; color: #007aff; user-select: none; }
.prefs-key-more > summary::-webkit-details-marker { display: none; }
.prefs-key-more > summary::before { content: "▶"; font-size: 9px; color: #007aff; display: inline-block; transition: transform .18s; }
.prefs-key-more[open] > summary::before { transform: rotate(90deg); }
.prefs-key-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.prefs-key-table td { padding: 7px 6px; border-bottom: 1px solid rgba(0,0,0,.12); color: #8e8e93; }
.prefs-key-table td:first-child { color: #1c1c1e; text-align: left; }
.prefs-key-table td:last-child { color: #1c1c1e; font-size: 12px; font-family: {monoFont}; font-weight: 600; text-align: right; width: 110px; white-space: nowrap; }
.prefs-key-table .key-btn {
    display: inline-block; min-width: 46px; padding: 3px 10px; border: 1px solid rgba(0,0,0,.12);
    border-radius: 7px; background: rgba(255,255,255,.75); font-family: {monoFont};
    font-weight: 600; font-size: 12px; color: #1c1c1e; cursor: pointer; text-align: center;
}
.prefs-key-table .key-btn:hover { border-color: #007aff; color: #007aff; background: #fff; }

.btn-plain {
    padding: 6px 14px; border: 1px solid rgba(0,0,0,.14); border-radius: 6px;
    font-size: 13px; color: #1c1c1e; background: rgba(255,255,255,.75); cursor: pointer;
}
.btn-plain:hover { background: rgba(255,255,255,.9); }
.btn-danger { color: #ff3b30; }
.prefs-config-row { flex-wrap: wrap; gap: 8px; }.prefs-config-row .btn-plain { flex: 1 1 0; min-width: 0; }

/* 面板容器 = 全屏蒙层（flex 居中 .body 面板）。仅半透明压暗，不做虚化（blur 已移除） */
#reader-preferences { position: fixed; inset: 0; z-index: 2147483647; display: none; align-items: center; justify-content: center; padding: 0; border: 0; background: rgba(0,0,0,0.28); }
#reader-preferences.open { display: flex; }

.body.prefs-dark { background: rgba(44,44,46,.92); border: 1px solid rgba(255,255,255,.12); color: #f2f2f7; }
.body.prefs-dark .prefs-head-title { color: #f2f2f7; }
.body.prefs-dark .prefs-header { border-bottom: 1px solid rgba(255,255,255,.14); }
.body.prefs-dark .prefs-sec { color: #98989d; }
.body.prefs-dark .prefs-group { background: transparent; border-color: transparent; }
.body.prefs-dark .prefs-group > * + * { border-top-color: rgba(255,255,255,.1); }
.body.prefs-dark select, .body.prefs-dark .prefs-select { background-color: rgba(40,40,42,.85); color: #f2f2f7; border-color: rgba(255,255,255,.16); }
.body.prefs-dark input[type=range] { background: linear-gradient(to right, #0a84ff 0%, #0a84ff var(--val), rgba(255,255,255,.2) var(--val), rgba(255,255,255,.2) 100%); }
.body.prefs-dark input[type=range]::-webkit-slider-thumb { background: #d1d1d6; border-color: rgba(255,255,255,.25); }
.body.prefs-dark .prefs-switch { color: #f2f2f7; }
.body.prefs-dark .prefs-switch .track { background: rgba(118,118,128,.45); }
.body.prefs-dark .prefs-switch input:checked ~ .track { background: #0a84ff; }
.body.prefs-dark .skin-item { background: rgba(50,50,52,.6); border-color: rgba(255,255,255,.14); color: #98989d; }
.body.prefs-dark .skin-item:hover { background: rgba(70,70,72,.8); }
.body.prefs-dark .skin-item.selected { background: rgba(10,132,255,.2); border-color: #0a84ff; color: #6bb8ff; }
.body.prefs-dark .skin-swatch { border-color: rgba(255,255,255,.2); }
.body.prefs-dark .slider-head { color: #f2f2f7; }
.body.prefs-dark .slider-val { color: #98989d; }
.body.prefs-dark .prefs_textarea { background: rgba(40,40,42,.7); color: #f2f2f7; border-color: rgba(255,255,255,.16); }
.body.prefs-dark .prefs-key-hint { color: #98989d; }
.body.prefs-dark .prefs-key-table td { color: #98989d; border-bottom-color: rgba(255,255,255,.14); }
.body.prefs-dark .prefs-key-table td:first-child { color: #98989d; }
.body.prefs-dark .prefs-key-table td:last-child { color: #f2f2f7; }
.body.prefs-dark .prefs-key-more > summary { color: #6e9eff; }
.body.prefs-dark .prefs-key-table .key-btn { background: rgba(255,255,255,.12); color: #f2f2f7; border-color: rgba(255,255,255,.2); }
.body.prefs-dark .prefs-key-table .key-btn:hover { border-color: #0a84ff; color: #0a84ff; background: rgba(255,255,255,.2); }
.body.prefs-dark .btn-plain { background: rgba(120,120,128,.3); color: #f2f2f7; border-color: rgba(255,255,255,.16); }
.body.prefs-dark .btn-danger { color: #ff453a; }
.body.prefs-dark .prefs-label { color: #f2f2f7; }
.body.prefs-eye { border-color: rgba(0,0,0,.08); box-shadow: 0 18px 48px rgba(0,0,0,.12), 0 1px 6px rgba(0,0,0,.05); }
.body.prefs-eye .prefs-head-title { color: #263238; }
.body.prefs-eye .prefs-header { border-bottom: 1px solid rgba(0,0,0,.08); }
.body.prefs-eye .prefs-sec { color: #5b6e60; }
.body.prefs-eye .prefs-group { background: transparent; border-color: transparent; }
.body.prefs-eye .prefs-group > * + * { border-top-color: rgba(0,0,0,.08); }
.body.prefs-eye select, .body.prefs-eye .prefs-select { background-color: rgba(255,255,255,.65); color: #263238; border-color: rgba(0,0,0,.12); }
.body.prefs-eye input[type=range] { background: linear-gradient(to right, #34c759 0%, #34c759 var(--val), rgba(0,0,0,.12) var(--val), rgba(0,0,0,.12) 100%); }
.body.prefs-eye input[type=range]::-webkit-slider-thumb { background: #fff; border-color: rgba(0,0,0,.16); }
.body.prefs-eye .prefs-switch { color: #263238; }
.body.prefs-eye .prefs-switch .track { background: rgba(0,0,0,.18); }
.body.prefs-eye .prefs-switch input:checked ~ .track { background: #34c759; }
.body.prefs-eye .skin-item { background: rgba(255,255,255,.6); border-color: rgba(0,0,0,.12); color: #5b6e60; }
.body.prefs-eye .skin-item.selected { background: rgba(52,199,89,.16); border-color: #34c759; color: #1f7a3d; }
.body.prefs-eye .slider-head { color: #263238; }
.body.prefs-eye .slider-val { color: #5b6e60; }
.body.prefs-eye .prefs_textarea { background: rgba(255,255,255,.65); color: #263238; border-color: rgba(0,0,0,.12); }
.body.prefs-eye .prefs-key-hint { color: #5b6e60; }
.body.prefs-eye .prefs-key-table td { color: #5b6e60; border-bottom-color: rgba(0,0,0,.08); }
.body.prefs-eye .prefs-key-table td:first-child { color: #3a3a3c; }
.body.prefs-eye .prefs-key-table td:last-child { color: #263238; }
.body.prefs-eye .prefs-key-more > summary { color: #34c759; }
.body.prefs-eye .prefs-key-table .key-btn { background: rgba(255,255,255,.7); color: #263238; border-color: rgba(0,0,0,.12); }
.body.prefs-eye .prefs-key-table .key-btn:hover { border-color: #34c759; color: #1f7a3d; background: #fff; }
.body.prefs-eye .btn-plain { background: rgba(255,255,255,.75); color: #263238; border-color: rgba(0,0,0,.12); }
.body.prefs-eye .btn-danger { color: #ff3b30; }
.body.prefs-eye .prefs-label { color: #263238; }

/* 防站点覆盖：面板容器及内容禁用外部边框/outline，杜绝“整块黑框” */
#reader-preferences form#preferences, #reader-preferences .prefs-body, #reader-preferences .prefs-group { outline: none !important; }
#reader-preferences form#preferences, #reader-preferences .prefs-body { border: none !important; box-shadow: none !important; }
#reader-preferences select:focus, #reader-preferences input:focus, #reader-preferences textarea:focus, #reader-preferences button:focus { outline: none !important; }

/* 面板内隐藏滚动条但保留滚动（滚轮/触摸板/键盘照常）。
   main.css 的 ::-webkit-scrollbar{width:9px !important} 是全局规则，
   此处用 #reader-preferences 前缀提高特异性 + !important 才能压过 */
#reader-preferences .prefs-body, #reader-preferences #custom_siteinfo { scrollbar-width: none; -ms-overflow-style: none; }
#reader-preferences .prefs-body::-webkit-scrollbar, #reader-preferences #custom_siteinfo::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none; }
/* 滚动条隐藏后补少量内边距，末行不紧贴圆角边框；末组自带 margin 由 :last-child 归零，消除底部死区 */
#reader-preferences .prefs-body { padding-bottom: 10px; }
#reader-preferences .prefs-body .prefs-group:last-of-type { margin-bottom: 0; }
`;

  var expr = {};
  function _hasExtPseudo(selector) {
    return /:contains\(|:econtains\(|:first(?!-child)|:last(?!-child)|:visible|:selected|:eq\(|:not\(|:checkbox|:radio|:text|:password|:file|:image|:reset|:submit|:button|:input|:checked|:disabled|:enabled/.test(selector);
  }
  function _extractExtPseudos(selector) {
    var filters = [];
    var remaining = selector;
    var _formPseudoFilters = {
      ":checkbox": function(el) {
        return el.tagName === "INPUT" && el.type === "checkbox";
      },
      ":radio": function(el) {
        return el.tagName === "INPUT" && el.type === "radio";
      },
      ":text": function(el) {
        return el.tagName === "INPUT" && el.type === "text";
      },
      ":password": function(el) {
        return el.tagName === "INPUT" && el.type === "password";
      },
      ":file": function(el) {
        return el.tagName === "INPUT" && el.type === "file";
      },
      ":image": function(el) {
        return el.tagName === "INPUT" && el.type === "image";
      },
      ":reset": function(el) {
        return el.tagName === "INPUT" && el.type === "reset";
      },
      ":submit": function(el) {
        return el.tagName === "INPUT" && el.type === "submit" || el.tagName === "BUTTON" && el.type === "submit";
      },
      ":button": function(el) {
        return el.tagName === "BUTTON" || el.tagName === "INPUT" && el.type === "button";
      },
      ":input": function(el) {
        var t = el.tagName;
        return t === "INPUT" || t === "SELECT" || t === "TEXTAREA" || t === "BUTTON";
      }
    };
    for (var _fp in _formPseudoFilters) {
      if (Object.prototype.hasOwnProperty.call(_formPseudoFilters, _fp)) {
        (function(fn) {
          remaining = remaining.replace(new RegExp(_fp.replace(":", "\\:") + "(?![\\w-])", "g"), function() {
            filters.push(fn);
            return "";
          });
        })(_formPseudoFilters[_fp]);
      }
    }
    remaining = remaining.replace(/:contains\(\s*(['"])(.*?)\1\s*\)/g, function(m, q, text) {
      filters.push(function(el) {
        var t = (el.textContent || el.innerText || "").toLowerCase();
        return t.indexOf(text.toLowerCase()) !== -1;
      });
      return "";
    });
    remaining = remaining.replace(/:contains\(\s*([^'"]\S*?)\s*\)/g, function(m, text) {
      filters.push(function(el) {
        var t = (el.textContent || el.innerText || "").toLowerCase();
        return t.indexOf(text.toLowerCase()) !== -1;
      });
      return "";
    });
    remaining = remaining.replace(/:econtains\(\s*(['"])(.*?)\1\s*\)/g, function(m, q, text) {
      filters.push(function(el) {
        return (el.textContent || el.innerText || "").toLowerCase() === text.toLowerCase();
      });
      return "";
    });
    remaining = remaining.replace(/:visible/g, function() {
      filters.push(function(el) {
        return _isVisible(el);
      });
      return "";
    });
    remaining = remaining.replace(/:selected/g, function() {
      filters.push(function(el) {
        if (el.tagName === "OPTION") return el.selected;
        if (el.tagName === "INPUT") return el.checked;
        return false;
      });
      return "";
    });
    var firstLast = [];
    remaining = remaining.replace(/:(first|last)(?!-child)/g, function(m, w) {
      firstLast.push(w);
      return "";
    });
    remaining = remaining.replace(/:eq\(\s*(-?\d+)\s*\)/g, function(m, n) {
      firstLast.push("eq:" + n);
      return "";
    });
    var notList = [];
    remaining = remaining.replace(/:not\(\s*([^)]*)\s*\)/g, function(m, inner) {
      notList.push(inner);
      return "";
    });
    return {
      cleanSelector: remaining.trim(),
      filters,
      firstLast,
      notList
    };
  }
  function _splitByComma(selector) {
    var parts = [], depth = 0, quote = null, cur = "";
    for (var i = 0; i < selector.length; i++) {
      var c = selector.charAt(i);
      if (quote) {
        if (c === quote) quote = null;
        cur += c;
        continue;
      }
      if (c === "'" || c === '"') {
        quote = c;
        cur += c;
        continue;
      }
      if (c === "(") depth++;
      else if (c === ")") depth--;
      if (c === "," && depth === 0) {
        parts.push(cur);
        cur = "";
        continue;
      }
      cur += c;
    }
    if (cur) parts.push(cur);
    return parts;
  }
  function _queryAll(root, selector) {
    var elList;
    if (selector && selector.nodeType) {
      if (!root || !root.querySelectorAll) return [selector];
      return root === selector || (root.contains ? root.contains(selector) : false) ? [selector] : [];
    }
    if (selector instanceof QCollection) {
      return selector.get();
    }
    if (root.querySelectorAll) {
      try {
        if (_hasExtPseudo(selector)) {
          var subs = _splitByComma(selector);
          var merged = [];
          for (var si = 0; si < subs.length; si++) {
            var sub = subs[si].trim();
            if (!sub) continue;
            var parsed = _extractExtPseudos(sub);
            var base = parsed.cleanSelector;
            var baseEls = [];
            if (base) {
              baseEls = Array.prototype.slice.call(root.querySelectorAll(base));
            } else {
              baseEls = Array.prototype.slice.call(root.querySelectorAll("*"));
            }
            if (parsed.notList.length) {
              baseEls = baseEls.filter(function(el) {
                return !parsed.notList.some(function(sel) {
                  return el.matches && el.matches(sel.trim());
                });
              });
            }
            parsed.filters.forEach(function(f) {
              baseEls = baseEls.filter(f);
            });
            var posEls = baseEls;
            parsed.firstLast.forEach(function(pos) {
              if (pos === "first") posEls = posEls.slice(0, 1);
              else if (pos === "last") posEls = posEls.slice(-1);
              else if (pos.indexOf("eq:") === 0) {
                var i = parseInt(pos.slice(3), 10);
                posEls = i < 0 ? posEls.slice(i) : posEls.slice(i, i + 1);
              }
            });
            for (var mj = 0; mj < posEls.length; mj++) {
              if (merged.indexOf(posEls[mj]) === -1) merged.push(posEls[mj]);
            }
          }
          return merged;
        }
        elList = root.querySelectorAll(selector);
      } catch (e) {
        return [];
      }
    } else {
      return [];
    }
    return Array.prototype.slice.call(elList);
  }
  function _isVisible(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.style && el.style.display === "none") return false;
    var style = getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
  }
  function _sanitizeHtml(doc) {
    var _a;
    var allElements = doc.querySelectorAll("*");
    for (var i = 0; i < allElements.length; i++) {
      var el = allElements[i];
      var attrs = el.attributes;
      for (var j = attrs.length - 1; j >= 0; j--) {
        var attrName = attrs[j].name.toLowerCase();
        if (attrName.startsWith("on")) {
          el.removeAttribute(attrs[j].name);
        }
      }
    }
    var links = doc.querySelectorAll("a[href]");
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href");
      if (href && href.toLowerCase().startsWith("javascript:")) {
        links[i].removeAttribute("href");
      }
    }
    var scripts = doc.querySelectorAll("script");
    for (var i = 0; i < scripts.length; i++) {
      (_a = scripts[i].parentNode) == null ? undefined : _a.removeChild(scripts[i]);
    }
  }
  function _createFromHtml(html) {
    var doc = document.implementation.createHTMLDocument("");
    doc.body.innerHTML = html.trim();
    _sanitizeHtml(doc);
    var out = [];
    for (var i = 0; i < doc.body.childNodes.length; i++) {
      out.push(doc.body.childNodes[i]);
    }
    return out;
  }
  function _wrap(nodes, _extra) {
    return new QCollection(nodes);
  }
  function QCollection(elements, prevObject) {
    this.length = 0;
    for (var i = 0; i < elements.length; i++) {
      if (elements[i] && (elements[i].nodeType || elements[i] === window)) {
        this[i] = elements[i];
        this.length++;
      }
    }
    this.prevObject = prevObject || null;
  }
  QCollection.prototype = {
    // 支持数组式 push（content.js 有 _headings.push(this) 用法）
    // 注意：不可删除。此前在旧 prototype 上单独定义 push，随后本行整体替换
    // prototype 导致 push 丢失 → content.js 标题识别 _headings.push(this) 抛
    // "push is not a function"。push 必须留在本字面量内。
    push: function(el) {
      if (el && el.nodeType) {
        this[this.length] = el;
        this.length++;
      }
      return this.length;
    },
    // 遍历，回调 this 为原生元素
    each: function(fn) {
      for (var i = 0; i < this.length; i++) {
        if (fn.call(this[i], i, this[i]) === false) break;
      }
      return this;
    },
    map: function(fn) {
      var out = [];
      this.each(function(i, el) {
        var r = fn.call(el, i, el);
        if (r !== undefined && r !== null) out.push(r);
      });
      return _wrap(out);
    },
    filter: function(fnOrSel) {
      var out = [];
      this.each(function(i, el) {
        var ok;
        if (typeof fnOrSel === "function") ok = fnOrSel.call(el, i, el);
        else ok = _matchesSelector(el, fnOrSel);
        if (ok) out.push(el);
      });
      return _wrap(out);
    },
    find: function(selector) {
      var out = [];
      this.each(function() {
        var found = _queryAll(this, selector);
        found.forEach(function(el) {
          if (out.indexOf(el) === -1) out.push(el);
        });
      });
      return _wrap(out, this);
    },
    first: function() {
      return this.eq(0);
    },
    eq: function(i) {
      if (i < 0) i = this.length + i;
      if (i < 0 || i >= this.length) return _wrap([]);
      return _wrap([this[i]]);
    },
    get: function(i) {
      if (i === undefined) {
        var arr = [];
        for (var j = 0; j < this.length; j++) arr.push(this[j]);
        return arr;
      }
      if (i < 0) i = this.length + i;
      return i >= 0 && i < this.length ? this[i] : undefined;
    },
    closest: function(selector) {
      var out = [];
      this.each(function() {
        var el = this;
        while (el && el.nodeType === 1) {
          if (_matchesSelector(el, selector)) {
            if (out.indexOf(el) === -1) out.push(el);
            break;
          }
          el = el.parentElement;
        }
      });
      return _wrap(out);
    },
    is: function(selector) {
      if (typeof selector === "function") {
        var r = false;
        this.each(function(i, el) {
          if (selector.call(el, i, el)) {
            r = true;
            return false;
          }
        });
        return r;
      }
      return this.length > 0 && _matchesSelector(this[0], selector);
    },
    parent: function() {
      var out = [];
      this.each(function() {
        var p = this.parentElement;
        if (p && out.indexOf(p) === -1) out.push(p);
      });
      return _wrap(out);
    },
    children: function(selector) {
      var out = [];
      this.each(function() {
        for (var i = 0; i < this.children.length; i++) {
          var c = this.children[i];
          if (!selector || _matchesSelector(c, selector)) {
            if (out.indexOf(c) === -1) out.push(c);
          }
        }
      });
      return _wrap(out);
    },
    addBack: function(selector) {
      var out = [];
      this.each(function() {
        if (out.indexOf(this) === -1) out.push(this);
      });
      var prev = this.prevObject || _wrap([]);
      prev.each(function() {
        if (selector && !_matchesSelector(this, selector)) return;
        if (out.indexOf(this) === -1) out.push(this);
      });
      return _wrap(out);
    },
    index: function(subject) {
      var i;
      if (subject === undefined) {
        var first = this[0];
        if (!first || !first.parentNode) return -1;
        var sib = first.parentNode.children;
        for (i = 0; i < sib.length; i++) {
          if (sib[i] === first) return i;
        }
        return -1;
      }
      if (typeof subject === "string") {
        for (i = 0; i < this.length; i++) {
          if (_matchesSelector(this[i], subject)) return i;
        }
        return -1;
      }
      for (i = 0; i < this.length; i++) {
        if (this[i] === subject) return i;
      }
      return -1;
    },
    toggle: function() {
      this.each(function() {
        var d = getComputedStyle(this).display;
        this.style.display = d === "none" ? "" : "none";
      });
      return this;
    },
    /* ---------- 文本 / HTML / 值 ---------- */
    text: function(v) {
      if (v === undefined) {
        if (!this.length) return "";
        return this[0].textContent || "";
      }
      this.each(function() {
        this.textContent = String(v);
      });
      return this;
    },
    html: function(v) {
      if (v === undefined) {
        if (!this.length) return "";
        return this[0].innerHTML || "";
      }
      this.each(function() {
        this.innerHTML = String(v);
      });
      return this;
    },
    val: function(v) {
      if (v === undefined) {
        if (!this.length) return undefined;
        return this[0].value;
      }
      this.each(function() {
        this.value = v;
      });
      return this;
    },
    /* ---------- 属性 ---------- */
    attr: function(name, value) {
      if (typeof name === "object") {
        var map = name;
        this.each(function() {
          for (var k in map) {
            if (Object.prototype.hasOwnProperty.call(map, k)) {
              this.setAttribute(k, String(map[k]));
            }
          }
        });
        return this;
      }
      if (value === undefined) {
        if (!this.length) return undefined;
        var v = this[0].getAttribute(name);
        return v === null ? undefined : v;
      }
      this.each(function() {
        this.setAttribute(name, String(value));
      });
      return this;
    },
    prop: function(name, value) {
      if (value === undefined) {
        if (!this.length) return undefined;
        return this[0][name];
      }
      this.each(function() {
        this[name] = value;
      });
      return this;
    },
    removeAttr: function(name) {
      var names = name.split(/\s+/);
      this.each(function() {
        names.forEach(function(n) {
          if (n) this.removeAttribute(n);
        }.bind(this));
      });
      return this;
    },
    addClass: function(cls) {
      var names = String(cls).split(/\s+/);
      this.each(function() {
        names.forEach(function(n) {
          if (n) this.classList.add(n);
        }.bind(this));
      });
      return this;
    },
    removeClass: function(cls) {
      var names = String(cls).split(/\s+/);
      this.each(function() {
        names.forEach(function(n) {
          if (n) this.classList.remove(n);
        }.bind(this));
      });
      return this;
    },
    hasClass: function(cls) {
      return this.length > 0 && this[0].classList.contains(cls);
    },
    /* ---------- CSS ---------- */
    css: function(name, value) {
      if (name === "cssText") {
        this.each(function() {
          this.style.cssText = String(value);
        });
        return this;
      }
      if (typeof name === "object") {
        var map2 = name;
        this.each(function() {
          for (var k in map2) {
            if (Object.prototype.hasOwnProperty.call(map2, k)) {
              this.style.setProperty(_cssPropName(k), String(map2[k]));
            }
          }
        });
        return this;
      }
      if (value === undefined) {
        if (!this.length) return undefined;
        return getComputedStyle(this[0]).getPropertyValue(name) || this[0].style[name] || "";
      }
      this.each(function() {
        if (/^--/.test(name)) this.style.setProperty(name, String(value));
        else this.style[name] = String(value);
      });
      return this;
    },
    /* ---------- DOM 操作 ---------- */
    append: function(content) {
      this.each(function() {
        _appendContent(this, content);
      });
      return this;
    },
    appendTo: function(target) {
      var t = _resolveTarget(target);
      var self = this;
      t.each(function() {
        var targetEl = this;
        self.each(function() {
          targetEl.appendChild(this);
        });
      });
      return this;
    },
    prepend: function(content) {
      this.each(function() {
        _prependContent(this, content);
      });
      return this;
    },
    prependTo: function(target) {
      var t = _resolveTarget(target);
      var self = this;
      t.each(function() {
        var targetEl = this;
        self.each(function() {
          targetEl.insertBefore(this, targetEl.firstChild);
        });
      });
      return this;
    },
    remove: function() {
      this.each(function() {
        if (this.parentNode) this.parentNode.removeChild(this);
      });
      return this;
    },
    // DOM 层净化：删除隐藏元素/章节标题/contentRemove 指定元素/整块杂质文本块
    // 供正文提取时统一净化（替代原 applyDomClean），净化逻辑收拢在 dom 层、始终执行，不再由设置开关控制
    // opts: { contentRemove: 选择器(全局规则), extraRemove: 选择器(站点规则), trashReg: 整块杂质文本正则(必传，来自数据层 PurifyRules.trashBlockReg), log: 回调({hide,heading,remove,block}) }
    cleanContent: function(opts) {
      opts = opts || {};
      var _cnt = { hide: 0, heading: 0, remove: 0, block: 0 };
      var _s = this.find("script, style, noscript, template, iframe, svg");
      _cnt.remove += _s.length;
      _s.remove();
      var _h = this.find('[style*="display:none"], [style*="display: none"], [hidden], [aria-hidden="true"]');
      _cnt.hide = _h.length;
      _h.remove();
      var _hd = this.find('h1, h2, h3, h4, h5, h6, [role="heading"]');
      _cnt.heading = _hd.length;
      _hd.remove();
      if (opts.contentRemove) {
        var _r = this.find(opts.contentRemove);
        _cnt.remove += _r.length;
        _r.remove();
      }
      if (opts.extraRemove) {
        var _r2 = this.find(opts.extraRemove);
        _cnt.remove += _r2.length;
        _r2.remove();
      }
      var trashReg = opts.trashReg;
      if (trashReg) {
        this.find("div, p, span, a, button, li, section, h4, h5, h6").each(function() {
          var $t = XS(this);
          var txt = ($t.text() || "").replace(/\s+/g, "");
          if (!txt) return;
          if (trashReg.test(txt)) {
            $t.remove();
            _cnt.block++;
          }
        });
      }
      if (typeof opts.log === "function") opts.log(_cnt);
      return this;
    },
    replaceWith: function(content) {
      this.each(function() {
        var els = _contentToElements(content);
        var parent = this.parentNode;
        if (!parent) return;
        var ref = this;
        els.forEach(function(el) {
          parent.insertBefore(el, ref);
        });
        parent.removeChild(ref);
      });
      return this;
    },
    /* ---------- 显示 ---------- */
    hide: function() {
      this.each(function() {
        this.style.display = "none";
      });
      return this;
    },
    show: function() {
      this.each(function() {
        this.style.display = "";
      });
      return this;
    },
    fadeIn: function(dur) {
      var ms = dur === "fast" ? 300 : dur === "slow" ? 600 : typeof dur === "number" ? dur : 300;
      this.each(function() {
        var el = this;
        el.style.opacity = "0";
        el.style.display = "";
        el.style.transition = "opacity " + ms / 1e3 + "s ease";
        requestAnimationFrame(function() {
          el.style.opacity = "1";
        });
        setTimeout(function() {
          el.style.transition = "";
        }, ms + 50);
      });
      return this;
    },
    fadeOut: function(dur) {
      var ms = dur === "fast" ? 300 : dur === "slow" ? 600 : typeof dur === "number" ? dur : 300;
      this.each(function() {
        var el = this;
        el.style.opacity = "1";
        el.style.transition = "opacity " + ms / 1e3 + "s ease";
        el.style.opacity = "0";
        setTimeout(function() {
          el.style.display = "none";
          el.style.transition = "";
        }, ms + 50);
      });
      return this;
    },
    /* ---------- 几何 ---------- */
    offset: function() {
      if (!this.length) return { top: 0, left: 0 };
      var el = this[0];
      if (el === window || el === document || el === document.documentElement || el === document.body) {
        return { top: 0, left: 0 };
      }
      var rect = el.getBoundingClientRect();
      return {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset
      };
    },
    scrollTop: function(v) {
      if (v === undefined) {
        if (!this.length) return 0;
        var el = this[0];
        if (el === window || el === document) return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        return el.scrollTop;
      }
      this.each(function() {
        if (this === window || this === document) {
          window.scrollTo(0, v);
        } else {
          this.scrollTop = v;
        }
      });
      return this;
    },
    height: function() {
      if (!this.length) return 0;
      var el = this[0];
      if (el === window) return window.innerHeight || document.documentElement.clientHeight;
      if (el === document) return document.documentElement.scrollHeight || document.body.scrollHeight || 0;
      return el.clientHeight || el.offsetHeight || 0;
    },
    /* ---------- 事件 ---------- */
    on: function(types, selectorOrFn, fnOrData) {
      var self = this;
      var typesArr = String(types).split(/\s+/);
      var selector, handler;
      if (typeof selectorOrFn === "string") {
        selector = selectorOrFn;
        handler = fnOrData;
      } else if (typeof selectorOrFn === "function") {
        handler = selectorOrFn;
      }
      if (typeof handler !== "function") return this;
      typesArr.forEach(function(typeAndNs) {
        var parsed = _parseEventType(typeAndNs);
        var type = parsed.type;
        var ns = parsed.ns;
        self.each(function() {
          _addEventListener(this, type, ns, selector, handler);
        });
      });
      return this;
    },
    off: function(types, fnOrSel) {
      var self = this;
      var typesArr = types === undefined ? null : String(types).split(/\s+/);
      var handler = typeof fnOrSel === "function" ? fnOrSel : null;
      self.each(function() {
        _removeEventListener(this, typesArr, handler);
      });
      return this;
    },
    trigger: function(type) {
      var parsed = _parseEventType(type);
      this.each(function() {
        this.dispatchEvent(new Event(parsed.type, { bubbles: true }));
      });
      return this;
    },
    // 简写事件
    click: function(fn) {
      if (fn) return this.on("click", fn);
      this.each(function() {
        if (this.click) this.click();
      });
      return this;
    },
    change: function(fn) {
      return fn ? this.on("change", fn) : this.trigger("change");
    },
    scroll: function(fn) {
      return fn ? this.on("scroll", fn) : this.trigger("scroll");
    }
  };
  function _cssPropName(k) {
    if (k.indexOf("--") === 0) return k;
    if (k.indexOf("-") !== -1) return k;
    var out = k.replace(/([A-Z])/g, function(m) {
      return "-" + m.toLowerCase();
    });
    return out;
  }
  function _matchesSelector(el, selector) {
    if (!el || el.nodeType !== 1) return false;
    if (typeof selector === "string" && _hasExtPseudo(selector)) {
      var subs = _splitByComma(selector);
      for (var si = 0; si < subs.length; si++) {
        var sub = subs[si].trim();
        if (!sub) continue;
        var parsed = _extractExtPseudos(sub);
        if (parsed.cleanSelector && !el.matches(parsed.cleanSelector)) continue;
        var hit = true;
        parsed.filters.forEach(function(f) {
          if (!f(el)) hit = false;
        });
        if (!hit) continue;
        if (parsed.notList.length && parsed.notList.some(function(s) {
          return el.matches(s.trim());
        })) continue;
        return true;
      }
      return false;
    }
    try {
      return el.matches(selector);
    } catch (e) {
      return false;
    }
  }
  function _parseEventType(typeAndNs) {
    var parts = String(typeAndNs).split(".");
    return { type: parts[0], ns: parts.slice(1).filter(Boolean) };
  }
  var eventStore = new WeakMap();
  function _getEventList(el) {
    if (!eventStore.has(el)) eventStore.set(el, []);
    return eventStore.get(el);
  }
  function _addEventListener(el, type, ns, selector, handler) {
    var list = _getEventList(el);
    var nativeHandler = function(e) {
      if (selector) {
        var t = e.target;
        while (t && t.nodeType === 1 && t !== el) {
          if (_matchesSelector(t, selector)) break;
          t = t.parentElement;
        }
        if (!t || t.nodeType !== 1 || t === el) return;
        return handler.call(t, e);
      }
      return handler.call(el, e);
    };
    var record = { type, ns, selector, handler, nativeHandler };
    el.addEventListener(type, nativeHandler);
    list.push(record);
  }
  function _removeEventListener(el, typesArr, handler) {
    var list = _getEventList(el);
    var kept = [];
    list.forEach(function(rec) {
      if (typesArr) {
        var matched = typesArr.some(function(t) {
          var parsed = _parseEventType(t);
          if (parsed.type !== rec.type) return false;
          if (parsed.ns.length) {
            return parsed.ns.join(".") === rec.ns.join(".");
          }
          return true;
        });
        if (!matched) {
          kept.push(rec);
          return;
        }
      }
      if (handler && rec.handler !== handler) {
        kept.push(rec);
        return;
      }
      el.removeEventListener(rec.type, rec.nativeHandler);
    });
    eventStore.set(el, kept);
  }
  function _contentToElements(content) {
    if (content instanceof QCollection) return content.get();
    if (typeof content === "string") return _createFromHtml(content);
    if (content instanceof Node) return [content];
    if (Array.isArray(content)) {
      var out = [];
      content.forEach(function(c) {
        out.push(c);
      });
      return out;
    }
    return [];
  }
  function _appendContent(el, content) {
    var els = _contentToElements(content);
    els.forEach(function(e) {
      el.appendChild(e);
    });
  }
  function _prependContent(el, content) {
    var els = _contentToElements(content);
    for (var i = els.length - 1; i >= 0; i--) {
      el.insertBefore(els[i], el.firstChild);
    }
  }
  function _resolveTarget(target) {
    if (target instanceof QCollection) return target;
    if (typeof target === "string") return _wrap(_queryAll(document, target));
    if (target) return _wrap([target]);
    return _wrap([]);
  }
  function XS(arg) {
    if (typeof arg === "function") {
      if (document.readyState !== "loading") {
        arg(document);
      } else {
        document.addEventListener("DOMContentLoaded", function() {
          arg(document);
        });
      }
      return _wrap([]);
    }
    if (typeof arg === "string" && arg.trim().charAt(0) === "<") {
      return _wrap(_createFromHtml(arg));
    }
    if (typeof arg === "string") {
      return _wrap(_queryAll(document, arg));
    }
    if (arg instanceof QCollection) return arg;
    if (arg === window) return _wrap([window]);
    if (arg && arg.nodeType) return _wrap([arg]);
    if (arg && (arg instanceof NodeList || arg instanceof HTMLCollection)) {
      return _wrap(Array.prototype.slice.call(arg));
    }
    if (Array.isArray(arg)) return _wrap(arg);
    return _wrap([]);
  }
  XS.nano = function(template, data) {
    return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
      var keys = key.split("."), v = data[keys.shift()];
      try {
        for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
      } catch (e) {
      }
      return typeof v !== "undefined" && v !== null ? v : "";
    });
  };
  XS.expr = { ":": expr };
  XS.each = function(arr, fn) {
    var wrapped = _wrap(Array.prototype.slice.call(arr || []));
    wrapped.each(fn);
    return wrapped;
  };
  XS.parseHTML = function(html) {
    return _createFromHtml(html);
  };
  var _regexCache = {};
  function toRE(obj, flag = "igm") {
    if (obj instanceof RegExp) {
      return obj;
    } else if (_regexCache[obj] && _regexCache[obj][flag]) {
      const re = _regexCache[obj][flag];
      re.lastIndex = 0;
      return re;
    } else if (!_regexCache[obj]) {
      const re = new RegExp(obj, flag);
      _regexCache[obj] = { [flag]: re };
      return re;
    } else if (!_regexCache[obj][flag]) {
      const re = new RegExp(obj, flag);
      _regexCache[obj][flag] = re;
      return re;
    }
  }

  var Net = {
    fetch: function(details) {
      let onload = details.onload, onerror = details.ontimeout || details.onerror;
      chrome.runtime.sendMessage(
        {
          action: "xs_fetch",
          url: details.url,
          method: details.method || "GET",
          headers: details.headers || {},
          // [修复] 原实现没转发 body：background / 油猴适配层都支持 POST body，
          // 但这里把它丢了，任何 POST 请求都会变成空 body 发出（站点会返回错误页）。
          body: details.body,
          timeout: details.timeout || 15e3
        },
        function(resp) {
          if (chrome.runtime.lastError) {
            if (onerror) onerror({ status: 0, responseText: "", finalUrl: "", error: chrome.runtime.lastError.message });
            return;
          }
          if (resp && resp.ok) {
            if (onload) onload({ status: resp.status, responseText: resp.body, finalUrl: resp.finalUrl, headers: resp.headers, readyState: 4 });
          } else {
            if (onerror) onerror({ status: resp && resp.status || 0, responseText: "", finalUrl: "", error: resp && resp.error });
          }
        }
      );
    }
  };
  function Request(options) {
    return new Promise((resolve, reject) => {
      options.onerror = options.ontimeout = reject;
      options.onload = resolve;
      Net.fetch(options);
    });
  }

  function getMiddleStr(str, beginStr, endStr) {
    var i = str.indexOf(beginStr);
    if (i < 0) return "";
    var s = i + beginStr.length;
    var e = str.indexOf(endStr, s);
    return e < 0 ? str.slice(s) : str.slice(s, e);
  }
  var CryptoJS = (function() {
    function safeAdd(x, y) {
      var l = (x & 65535) + (y & 65535), m = (x >> 16) + (y >> 16) + (l >> 16);
      return m << 16 | l & 65535;
    }
    function rotl(num, cnt) {
      return num << cnt | num >>> 32 - cnt;
    }
    function cmn(q, a, b, x, s, t) {
      return safeAdd(rotl(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
    }
    function ff(a, b, c, d, x, s, t) {
      return cmn(b & c | ~b & d, a, b, x, s, t);
    }
    function gg(a, b, c, d, x, s, t) {
      return cmn(b & d | c & ~d, a, b, x, s, t);
    }
    function hh(a, b, c, d, x, s, t) {
      return cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function ii(a, b, c, d, x, s, t) {
      return cmn(c ^ (b | ~d), a, b, x, s, t);
    }
    function core(x, len) {
      x[len >> 5] |= 128 << len % 32;
      x[(len + 64 >>> 9 << 4) + 14] = len;
      var i, oa, ob, oc, od, a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
      for (i = 0; i < x.length; i += 16) {
        oa = a;
        ob = b;
        oc = c;
        od = d;
        a = ff(a, b, c, d, x[i], 7, -680876936);
        d = ff(d, a, b, c, x[i + 1], 12, -389564586);
        c = ff(c, d, a, b, x[i + 2], 17, 606105819);
        b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
        a = ff(a, b, c, d, x[i + 4], 7, -176418897);
        d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
        c = ff(c, d, a, b, x[i + 6], 17, -1473231341);
        b = ff(b, c, d, a, x[i + 7], 22, -45705983);
        a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
        d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
        c = ff(c, d, a, b, x[i + 10], 17, -42063);
        b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
        a = ff(a, b, c, d, x[i + 12], 7, 1804603682);
        d = ff(d, a, b, c, x[i + 13], 12, -40341101);
        c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
        b = ff(b, c, d, a, x[i + 15], 22, 1236535329);
        a = gg(a, b, c, d, x[i + 1], 5, -165796510);
        d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
        c = gg(c, d, a, b, x[i + 11], 14, 643717713);
        b = gg(b, c, d, a, x[i], 20, -373897302);
        a = gg(a, b, c, d, x[i + 5], 5, -701558691);
        d = gg(d, a, b, c, x[i + 10], 9, 38016083);
        c = gg(c, d, a, b, x[i + 15], 14, -660478335);
        b = gg(b, c, d, a, x[i + 4], 20, -405537848);
        a = gg(a, b, c, d, x[i + 9], 5, 568446438);
        d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
        c = gg(c, d, a, b, x[i + 3], 14, -187363961);
        b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
        a = gg(a, b, c, d, x[i + 13], 5, -1444681467);
        d = gg(d, a, b, c, x[i + 2], 9, -51403784);
        c = gg(c, d, a, b, x[i + 7], 14, 1735328473);
        b = gg(b, c, d, a, x[i + 12], 20, -1926607734);
        a = hh(a, b, c, d, x[i + 5], 4, -378558);
        d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
        c = hh(c, d, a, b, x[i + 11], 16, 1839030562);
        b = hh(b, c, d, a, x[i + 14], 23, -35309556);
        a = hh(a, b, c, d, x[i + 1], 4, -1530992060);
        d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
        c = hh(c, d, a, b, x[i + 7], 16, -155497632);
        b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
        a = hh(a, b, c, d, x[i + 13], 4, 681279174);
        d = hh(d, a, b, c, x[i], 11, -358537222);
        c = hh(c, d, a, b, x[i + 3], 16, -722521979);
        b = hh(b, c, d, a, x[i + 6], 23, 76029189);
        a = hh(a, b, c, d, x[i + 9], 4, -640364487);
        d = hh(d, a, b, c, x[i + 12], 11, -421815835);
        c = hh(c, d, a, b, x[i + 15], 16, 530742520);
        b = hh(b, c, d, a, x[i + 2], 23, -995338651);
        a = ii(a, b, c, d, x[i], 6, -198630844);
        d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
        c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
        b = ii(b, c, d, a, x[i + 5], 21, -57434055);
        a = ii(a, b, c, d, x[i + 12], 6, 1700485571);
        d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
        c = ii(c, d, a, b, x[i + 10], 15, -1051523);
        b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
        a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
        d = ii(d, a, b, c, x[i + 15], 10, -30611744);
        c = ii(c, d, a, b, x[i + 6], 15, -1560198380);
        b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
        a = ii(a, b, c, d, x[i + 4], 6, -145523070);
        d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
        c = ii(c, d, a, b, x[i + 2], 15, 718787259);
        b = ii(b, c, d, a, x[i + 9], 21, -343485551);
        a = safeAdd(a, oa);
        b = safeAdd(b, ob);
        c = safeAdd(c, oc);
        d = safeAdd(d, od);
      }
      return [a, b, c, d];
    }
    function hex(bin) {
      var t = "0123456789abcdef", o = "", i;
      for (i = 0; i < bin.length * 4; i++) o += t.charAt(bin[i >> 2] >> i % 4 * 8 + 4 & 15) + t.charAt(bin[i >> 2] >> i % 4 * 8 & 15);
      return o;
    }
    function toBin(str) {
      var n = (str.length + 8 >> 6) + 1, b = new Array(n * 16), i;
      for (i = 0; i < n * 16; i++) b[i] = 0;
      for (i = 0; i < str.length; i++) b[i >> 2] |= str.charCodeAt(i) << i % 4 * 8;
      return b;
    }
    function md5(str) {
      var s = unescape(encodeURIComponent(String(str)));
      return hex(core(toBin(s), s.length * 8));
    }
    return { MD5: function(input) {
      return { toString: function(fmt) {
        return md5(input);
      } };
    }, enc: { Hex: "hex" } };
  })();
  var SITE_RULES = [
    // ============ 通用站点规则 ============
    {
      siteName: "起点新版-阅文",
      url: "^https?://(?:read|vipreader)\\.qidian\\.com/chapter/.*",
      exclude: " /lastpage/",
      bookTitleSelector: "#bookImg",
      titleSelector: "h3.j_chapterName",
      prevSelector: "#j_chapterPrev",
      nextSelector: "#j_chapterNext",
      indexSelector: '.chapter-control a:contains("目录"), #my_index',
      // indexSelector: function(obj) {
      //     var url = obj.find(".chapter-control a:contains('目录')").attr('href');
      //     return url;
      // },
      contentSelector: ".read-content.j_readContent",
      // contentHandle: false,
      contentRemove: "",
      // fastboot: true,
      contentReplace: [
        "手机用户请到m.qidian.com阅读。",
        "起点中文网www.qidian.com欢迎广大书友光临阅读，最新、最快、最火的连载作品尽在起点原创！.*"
      ],
      isVipChapter: function($doc) {
        if ($doc.find(".vip-limit-wrap").length) {
          return true;
        }
      },
      contentPatch: function($doc) {
        $doc.find(".review-count").remove();
        if ($doc.find("#j_chapterPrev").length === 0) {
          var $node = $doc.find('div[id^="chapter-"]');
          const prevUrl = $node.attr("data-purl").replace("www", "read");
          const nextUrl = $node.attr("data-nurl").replace("www", "read");
          XS('<div id="j_chapterPrev">').attr("href", prevUrl).appendTo($doc.find("body"));
          XS('<div id="j_chapterNext">').attr("href", nextUrl).appendTo($doc.find("body"));
          var indexUrl = XS("#bookImg").attr("href") + "#Catalog";
          XS('<div id="my_index">目录</div>').attr("href", indexUrl).appendTo($doc.find("body"));
        }
      },
      startLaunch($doc) {
        const win = $doc[0].defaultView;
        if (win.g_data.chapter.vipStatus === 1) {
          this.useiframe = true;
          this.mutationSelector = ".read-content.j_readContent";
          this.mutationChildCount = 0;
        }
        if (win.g_data.chapter.cES === 2) {
          this.contentSelector = "";
          this.isVipChapter = () => true;
        }
      }
    },
    {
      siteName: "起点新版-20230517",
      url: "^https?://(www|m)\\.qidian\\.com/chapter/.*",
      //bookTitleSelector: ".bookTitle",
      titleReg: "(.*?)《(.*?)》(.*?)",
      titlePos: 1,
      titleSelector: "h1.text-1\\.3em",
      prevSelector: ".prev_chapter",
      nextSelector: ".next_chapter",
      indexSelector: ".catalog",
      useiframe: true,
      // [修复] 起点翻页必须带 referer：若走默认的 no-referrer（预加载下一页开启时），
      // 起点会对无 referer 的章节 iframe 请求反爬/返回 202 挑战，导致 onload 不来、
      // 正文拿不到、翻页请求反复超时——「一直载入，往回滚才出」的根因之一。
      withReferer: true,
      contentSelector: ".content",
      mutationSelector: "main.content",
      mutationChildCount: 0,
      isVipChapter($doc) {
        const json = $doc.find("#vite-plugin-ssr_pageContext").text();
        const { pageContext } = JSON.parse(json);
        const { vipStatus, isBuy } = pageContext.pageProps.pageData.chapterInfo;
        if (vipStatus && !isBuy) {
          return true;
        }
      },
      contentPatch($doc) {
        $doc.find(".review").remove();
        const json = $doc.find("#vite-plugin-ssr_pageContext").text();
        const { pageContext } = JSON.parse(json);
        const { next, prev } = pageContext.pageProps.pageData.chapterInfo;
        const { bookId } = pageContext.pageProps.pageData.bookInfo;
        const $body = $doc.find("body");
        const chapterUrl = `/chapter/${bookId}/`;
        const catalogUrl = `/book/${bookId}/catalog/`;
        const prevUrl = prev !== -1 ? `${chapterUrl}${prev}/` : "";
        const nextUrl = next !== -1 ? `${chapterUrl}${next}/` : "";
        XS('<div class="catalog">').attr("href", catalogUrl).appendTo($body);
        XS('<div class="prev_chapter">').attr("href", prevUrl).appendTo($body);
        XS('<div class="next_chapter">').attr("href", nextUrl).appendTo($body);
      },
      startLaunch($doc) {
        const json = $doc.find("#vite-plugin-ssr_pageContext").text();
        const { pageContext } = JSON.parse(json);
        const { chapterInfo } = pageContext.pageProps.pageData;
        if (chapterInfo.cES === 2) {
          this.isVipChapter = () => true;
        }
      }
    },
    {
      siteName: "创世中文网",
      url: "^https?://(?:chuangshi|yunqi)\\.qq\\.com/|^http://dushu\\.qq\\.com/read.html\\?bid=",
      bookTitleSelector: ".bookNav > a:last()",
      titleSelector: ".story_title > h1",
      nextSelector: "#rightFloatBar_nextChapterBtn",
      prevSelector: "#rightFloatBar_preChapterBtn",
      indexSelector: function() {
        var m = location.href.match(/\/bk\/\w+\/(.*?)-r-\d+.html/);
        if (m) {
          return "http://chuangshi.qq.com/bk/ls/" + m[1] + "-l.html";
        } else {
          return "http://chuangshi.qq.com/bk/ls/" + window.bid + "-l.html";
        }
      },
      contentSelector: ".bookreadercontent",
      contentHandle: false,
      mutationSelector: "#chaptercontainer",
      // 内容生成监视器，第一次运行用到，以后用下面的 getContent 函数
      mutationChildCount: 1,
      useSiteFont: true,
      startFilter: function() {
        window.uuid = parseInt(window.uuid || "0", 10) + 1 + "";
      }
      // [修复] 原 getContent 依赖 Firefox 专属 exportFunction 与页面全局 window.CS
      //       （MV3 隔离世界读不到），在 Chromium/Edge 必然 ReferenceError/TypeError 崩；
      //       已移除，创世中文网改走默认 contentSelector('#readerFt') 获取正文。
    },
    {
      siteName: "纵横中文网",
      url: "^https?://book\\.zongheng\\.com/\\S+\\/\\d+\\.html$",
      contentHandle: false,
      // titleReg: "(.*?)-(.*)",
      titleSelector: "em[itemprop='headline']",
      bookTitleSelector: ".tc h2",
      contentSelector: "#readerFt",
      contentPatch: function(fakeStub) {
        fakeStub.find(".watermark").remove();
        var chapterTitle = fakeStub.find(".tc > h2").text();
        var chapterTitle1 = fakeStub.find(".tc > h2 em").text();
        if (chapterTitle1) {
          chapterTitle = chapterTitle.replace(chapterTitle1, " ") + chapterTitle1;
        }
        fakeStub.find("title").text(
          fakeStub.find(".tc > h1").text() + "-" + chapterTitle
        );
      }
    },
    {
      siteName: "纵横中文网",
      url: "https?://read\\.zongheng\\.com/chapter/\\d+\\/\\d+\\.html",
      exampleUrl: "https://read.zongheng.com/chapter/1251858/72302352.html",
      titleSelector: ".title_txtbox",
      contentSelector: ".content",
      contentPatch($doc) {
        $doc.find(".Jfcounts").remove();
      }
    },
    {
      siteName: "晋江文学网",
      url: /^https?:\/\/(www|my)\.jjwxc\.net\/onebook(|_vip)\.php\S*/,
      titleReg: /《(.*?)》.*[ˇ^](.*?)[ˇ^].*/,
      titlePos: 0,
      //   titleSelector: 'h2',
      titleSelector: "#chapter_list > option:first",
      // bookTitleSelector: 'h1 .bigtext',
      indexSelector: ".noveltitle > h1 > a",
      contentSelector: ".novelbody",
      contentHandle: false,
      contentRemove: "font[color], hr",
      contentPatchAsync: async function($doc) {
        $doc.find("div:has(>#yrt3)").remove();
        $doc.find("div:has(>h2)").remove();
        $doc.find("#six_list, #sendKingTickets").parent().remove();
        $doc.find("div.noveltext").find("div:first, h1").remove();
        $doc.find("div[align=right], .readsmall").remove();
        $doc.find("script").remove();
      },
      contentReplace: [
        "@无限好文，尽在晋江文学城"
      ],
      startLaunch($doc) {
        const win = $doc[0].defaultView;
        if (win.location.href.includes("onebook_vip")) {
          this.useiframe = true;
          this.mutationSelector = "div[id^=content]";
          this.mutationChildCount = 0;
          this.iframeSandbox = "allow-same-origin allow-scripts";
        }
      }
    },
    {
      siteName: "晋江文学城_手机版",
      url: "^https?://(?:wap|m)\\.jjwxc\\.(?:net|com)/(?:book2|vip)/\\d+/\\d+",
      titleReg: /《(.*?)》.*[ˇ^](.*?)[ˇ^].*/,
      titlePos: 0,
      titleSelector: "h2",
      contentSelector: "div.grid-c > div > .b.module > div:first"
    },
    {
      siteName: "潇湘书院",
      url: "^https?://www\\.xxsy\\.net/chapter/.*\\.html",
      titleReg: "(.*?)_(.*)_全文阅读",
      nextSelector: ".chapter-next",
      indexSelector: ".bread > a:last()",
      contentSelector: "#auto-chapter",
      contentHandle: false,
      contentReplace: "本书由潇湘书院首发，请勿转载！"
    },
    {
      siteName: "逐浪",
      url: /^https?:\/\/book\.zhulang\.com\/.*\.html/,
      titleReg: /(.*?)-(.*)/,
      contentSelector: "#readpage_leftntxt",
      contentHandle: false,
      contentPatch: function(fakeStub) {
        var title = fakeStub.find(".readpage_leftnzgx a:first").text() + "-" + fakeStub.find(".readpage_leftntit").text();
        fakeStub.find("title").html(title);
      }
    },
    {
      siteName: "小说阅读网",
      url: "^https?://www\\.readnovel\\.com/novel/.*\\.html",
      titleSelector: ".bgtop > h1",
      bookTitleSelector: ".nownav > a:eq(4)",
      contentSelector: "#article, .zhangjie",
      contentRemove: "div[style], .miaoshu, .zhichi, .bottomAdbanner",
      contentPatch: function(fakeStub) {
        fakeStub.find(".bgtop > h1 > span").remove();
      }
    },
    {
      siteName: "百度贴吧（手动启用）",
      enable: false,
      url: /^https?:\/\/tieba\.baidu.com\/p\//,
      titleSelector: "h1.core_title_txt",
      bookTitleSelector: ".card_title_fname",
      nextSelector: false,
      indexSelector: "a.card_title_fname",
      prevSelector: false,
      contentSelector: "#j_p_postlist",
      contentRemove: "#sofa_post, .d_author, .share_btn_wrapper, .core_reply, .j_user_sign",
      style: ".clear { border-top:1px solid #cccccc; margin-bottom: 50px; visibility: visible !important;}"
      // 显示楼层的分割线
    },
    {
      siteName: "17k小说网",
      url: /^https?:\/\/\S+\.17k\.com\/chapter\/\S+\/\d+\.html$/,
      titleReg: /(.*?)-(.*?)-.*/,
      contentSelector: "#chapterContent",
      contentRemove: ".chapter_update_time, h1, .qrcode, #authorSpenk, .like_box, #hotRecommend, .ct0416, .recent_read, #miniVoteBox, .copy"
    },
    {
      siteName: "塔读文学",
      url: "^https?://www\\.tadu\\.com/book/\\d+/\\d+/?",
      bookTitleSelector: ".chapter_details > span",
      bookTitleReplace: "书名：",
      titleSelector: "h4",
      useiframe: true,
      //   nDelay: 2000,  // 延迟2秒加载下一页
      contentSelector: "#partContent",
      mutationSelector: "#partContent",
      mutationChildCount: 0
      //   contentPatch: function(fakeStub){
      //       var m = fakeStub.find("body").html().match(/\.html\(unescape\("(.*)"\)/);
      //       if(m){
      //           var unescapeContent = m[1];
      //           fakeStub.find("#partContent").html(unescape(unescapeContent));
      //       }
      //   }
    },
    {
      siteName: "SF 轻小说",
      url: "^https?://book.sfacg.com/Novel/\\d+/\\d+/\\d+/",
      exampleUrl: "https://book.sfacg.com/Novel/601991/795722/7137683/",
      titleReg: "(.*?)-(.*?)-.*",
      contentSelector: "#ChapterBody"
    },
    // === 内容补丁
    //   {siteName: "给力文学小说阅读网",
    //       url: "^https?://www\\.geiliwx\\.com/.*\\.shtml",
    //       titleReg: "-?(.*)_(.*)最新章节_给力",
    //       titlePos: 1,
    //       contentRemove: 'h1, font[color], center',
    //       contentReplace: [
    //           "网站升级完毕！感谢对给力文学网的支持！",
    //           "（百度搜索给力文学网更新最快最稳定\\)",
    //           "【sogou,360,soso搜免费下载小说】",
    //           "\\[乐\\]\\[读\\]小说.２3.[Ｃc]m",
    //           "给力文学网",
    //           "看最快更新",
    //           "小说网不跳字",
    //           "\\.com",
    //           "BAIDU_CLB_fillSlot\\(.*",
    //           "--小-说-www-23wx-com",
    //           "&nbsp;&nbsp;，请",
    //           '\\.www\\.GEILIWX开心阅读每一天',
    //       ],
    //       contentPatch: function(d) {
    //           if (!d.find('#content').length) {
    //               var html = d.find('body').html();
    //               var content = html.match(/<!--go-->([\s\S]*?)<!--over-->/i)[1];
    //               content = XS('<div id="content">').html(content);
    //               if (content.find('#adright').size()) {
    //                   content = content.find('#adright');
    //               }
    //               content.appendTo(d.find('body'));
    //           }
    //       }
    //   },
    // ================== 采用 iframe 方式获取的 ====================
    //   {siteName: "16K小说网",
    //       url: "^https?://www\\.16kbook\\.org/Html/Book/\\d+/\\d+/\\d+\\.shtml$",
    //       titleReg: '(\\S+) (.*)- 16K小说网',
    //       useiframe: true,
    //       contentRemove: '.bdlikebutton',
    //       contentReplace: {
    //           '(<center>)?<?img src..(http://www.16kbook.org)?(/tu/\\S+\\.jpg).(>| alt."\\d+_\\d+_\\d*\\.jpg" />)(</center>)?': "$3",
    //           "/tu/shijie.jpg":"世界", "/tu/xiangdao.jpg":"想到", "/tu/danshi.jpg":"但是", "/tu/huilai.jpg":"回来", "/tu/yijing.jpg":"已经", "/tu/zhende.jpg":"真的", "/tu/liliang.jpg":"力量", "/tu/le.jpg":"了", "/tu/da.jpg":"大", "/tu/shengli.jpg":"胜利", "/tu/xiwang.jpg":"希望", "/tu/wandan.jpg":"完蛋", "/tu/de.jpg":"的",
    //           "16kbook\\s*(首发更新|小说网)": "",
    //       }
    //   },
    //   {siteName: "读读看",
    //       url: "^https?://www\\.dudukan\\.net/html/.*\\.html$",
    //       contentReplace: "看小说“就爱读书”|binhuo|www\\.92to\\.com",
    //       useiframe: true,
    //       mutationSelector: "#main",
    //       mutationChildCount: 0,
    //   },
    // 2页合并一章
    //   {siteName: "读零零（有问题，只显示一半内容）",
    //       url: "https?://www\\.du00\\.(?:com|cc)/read/\\d+/\\d+/[\\d_]+\\.html",
    //       exampleUrl: 'https://du00.com/Read/0/1/17.html',
    //       titleReg: "(.*?)(?:第\\d+段)?,(.*) - 读零零小说网",
    //       titlePos: 1,
    //       // prevSelector: "#footlink a:first",
    //       // indexSelector: "#footlink a:contains('目录')",
    //       // nextSelector: "#footlink a:last",
    //       // 内容
    //       contentSelector: "#pagecontent, .divimage",
    //       // useiframe: true,
    //       // mutationSelector: "#pagecontent",
    //       // mutationChildCount: 2,
    //       contentRemove: "font",
    //       contentReplace: [
    //           "读零零小说网欢迎您的光临.*?txt格式下载服务",
    //           "，好看的小说:|本书最新免费章节请访问。",
    //           "\\*文學馆\\*",
    //           "\\(未完待续请搜索，小说更好更新更快!",
    //           "www\\.DU00\\.com",
    //       ],
    //       checkSection: true
    //   },
    // ================== 采用 iframe 并存在 mutationSelector 的 ====================
    {
      siteName: "全本小说网",
      exampleUrl: "http://www.quanben.io/n/wuxianwanxiangtongminglu/1.html",
      url: "^https?://www\\.quanben\\.io/.*?/.*?/\\d+\\.html",
      bookTitleSelector: ".name",
      useiframe: true,
      mutationSelector: "#content",
      // 内容生成监视器
      // mutationChildCount: 5,
      mutationChildText: "请到 quanben.io阅读完整章节内容"
    },
    {
      siteName: "刺猬猫",
      exampleUrl: "https://www.ciweimao.com/chapter/102930784",
      url: "^https?://www\\.ciweimao\\.com/chapter/\\d+",
      bookTitleSelector: ".breadcrumb > a:last()",
      useiframe: true,
      mutationSelector: "#J_BookRead",
      // 内容生成监视器
      mutationChildCount: 1,
      contentSelector: "#J_BookRead",
      contentRemove: "i.J_Num, .chapter span"
    },
    // 上下页链接难搞
    {
      siteName: "长佩文学网",
      exampleUrl: "https://www.gongzicp.com/read-246381.html",
      url: "^https?://www\\.gongzicp\\.com/read-\\d+\\.html",
      bookTitleSelector: ".novel",
      useiframe: true,
      contentSelector: ".content",
      mutationSelector: ".novel",
      mutationChildCount: 2,
      contentReplace: [
        "来源长佩文学网（https://www.gongzicp.com）"
      ]
    },
    // ===========================================================
    {
      siteName: "E品中文网",
      url: "^https?://www\\.epzww\\.com/book/\\d+/\\d+",
      exampleUrl: "http://www.epzww.com/book/0/1/4.html",
      titleReg: "(.*?),(.*?),",
      contentSelector: "#showcontent"
    },
    {
      siteName: "飘天文学",
      url: "^https?://www\\.piaotia\\.com/html/\\d+/\\d+/\\d+\\.html",
      exampleUrl: "https://www.piaotia.com/html/15/15083/10323993.html",
      // titleReg: "(.*)最新章节,(.*),飘天文学",
      bookTitleSelector: "#content > h1 > a",
      contentSelector: "#content",
      useiframe: true,
      // 否则 content 在 body 下面
      contentRemove: "h1, table, .toplink",
      contentReplace: [
        /[{〖]请在百度搜索.*[}〗]|.(?:百度搜索飄天|无弹窗小说网).*\.Net.|\[飄天.*无弹窗小说网\]/ig,
        "\\{飘天文学www.piaotian.net感谢各位书友的支持，您的支持就是我们最大的动力\\}",
        "章节更新最快",
        "支持网站发展，逛淘宝买东西.*",
        "天才壹秒記住，為您提供精彩閱讀。.*"
      ]
    },
    {
      siteName: "努努书坊",
      url: "^https?://(?:book\\.kanunu\\.org|www\\.kanunu8\\.com)/.*/\\d+\\.html",
      exampleUrl: "https://www.kanunu8.com/book3/7748/170164.html",
      titleReg: /(.*) - (.*) - 小说在线阅读 - .* - 努努书坊/,
      titlePos: 1,
      contentSelector: "table:eq(4) p",
      indexSelector: "a[href^='./']",
      noSection: true
    },
    {
      siteName: "找书苑",
      url: "^https?://www\\.zhaoshuyuan\\.com/.*/\\d+/\\d+.html.*",
      exampleUrl: "https://www.zhaoshuyuan.com/b/174835/10801.html",
      contentReplace: [
        "找书苑\\s*[wｗ]+.[zｚ][hｈ][aａ][oｏ][sｓ][hｈ][uｕ][yｙ][uｕ][aａ][nｎ].[cｃ][oｏ][mｍ]\\s*"
      ]
    },
    {
      siteName: "黄金屋中文网",
      url: /tw\.hjwzw\.com\/Book\/Read\/\d+[,_]\d+$/,
      exampleUrl: "https://tw.hjwzw.com/Book/Read/1889,577987",
      titleSelector: "h1",
      indexSelector: "td a[href='./']",
      contentSelector: "#AllySite+div",
      contentRemove: "b, b+p",
      contentReplace: [
        "请记住本站域名:"
      ]
    },
    // ===== 特殊的获取下一页链接
    //   {siteName: "看书啦",
    //       url: "^https?://www.kanshu.la/book/\\w+/\\d+\\.shtml",
    //       titleReg: "(.*)-(.*)-看书啦",
    //       titlePos: 1,
    //       nextUrl: function($doc){
    //           var html = $doc.find('script:contains(next_page = ")').html();
    //           var m = html.match(/next_page = "(.*?)";/);
    //           if (m) return m[1];
    //       },
    //       prevUrl: function($doc){
    //           var html = $doc.find('script:contains(preview_page = ")').html();
    //           var m = html.match(/preview_page = "(.*?)";/);
    //           if (m) return m[1];
    //       }
    //   },
    {
      siteName: "书海小说",
      url: "^https?://www\\.shuhai\\.com/read/\\d+/\\d+\\.html",
      exampleUrl: "http://www.shuhai.com/read/110773/1.html",
      contentRemove: ".chaper-info",
      bookTitleSelector: ".tip > a:last",
      titleSelector: ".chapter-name",
      withReferer: true,
      prevSelector($doc) {
        return $doc.find("#pre").attr("data-url");
      },
      indexSelector: ".tip > a:last",
      nextSelector($doc) {
        return $doc.find("#next").attr("data-url");
      },
      contentSelector: ".chapter-item"
    },
    {
      siteName: "露西弗俱乐部",
      exampleUrl: "https://www.lucifer-club.com/chapter-83716-1.html",
      url: /^https:\/\/www\.lucifer\-club\.com\/.*\.html/,
      bookTitleSelector: "#luf_local > a:nth-child(3)",
      indexSelector: '.luf_news_title > a:contains("目录")',
      contentSelector: "#luf_news_contents",
      contentHandle: false,
      contentRemove: "> form, #luf_local, .luf_top_ad, .luf_news_title, .luf_page_control, .luf_comment",
      contentReplace: [
        "保护版权 尊重作者 @ 露西弗俱乐部 www.lucifer-club.com"
      ]
    },
    {
      siteName: "英文小说网",
      url: "^https?://novel\\.tingroom\\.com/.*/\\d+/\\d+\\.html",
      bookTitleSelector: ".gundong1  a:nth-child(3)",
      titleSelector: "#tt_text p:nth-child(2)",
      indexSelector: ".book_showtitle",
      prevSelector: "#zhang_top",
      nextSelector: "#zhang_down",
      contentSelector: "#tt_text",
      contentRemove: "#tt_text tbody tr",
      contentReplace: [
        "欢迎访问英文小说网http://novel.tingroom.com"
      ]
    },
    {
      siteName: "笔趣阁 nuanyuehanxing",
      url: "^https?://www\\.nuanyuehanxing\\.cc/\\w+/\\d+/\\d+\\.html",
      exampleUrl: "https://www.nuanyuehanxing.cc/shu/56388575/111040667.html",
      bookTitleSelector: ".bookname",
      timeout: 500,
      useiframe: true,
      contentRemove: "a"
    },
    // 这网站为了防抓取，内容顺序都是不对的，只好采用 iframe 方式
    {
      siteName: "和图书",
      exampleUrl: "http://www.hetushu.com/book/1421/964983.html",
      url: "^https?://www.hetushu.com/book/\\d+/\\d+.html",
      bookTitleSelector: "#left h3",
      nextSelector: "a#next",
      prevSelector: "a#pre",
      indexSelector: "#left h3 a",
      useiframe: true,
      // 后面的是 和图书 的干扰码
      contentRemove: "h2, acronym, bdo, big, cite, code, dfn, kbd, q, s, samp, strike, tt, u, var, ins",
      contentPatch: function($doc) {
        $doc.find("#content div").each(function() {
          let html = XS(this).html();
          XS(this).replaceWith(
            XS("<p>").html(html)
          );
        });
      }
    },
    {
      siteName: "69书吧",
      // www.69shu.com
      // www.69shuba.com
      // www.69xinshu.com
      // www.69shu.pro
      // www.69shu.top
      // www.69shuba.pro
      // www.69shu.cx
      // www.69shuba.cx
      // www.69shu.me
      // www.69shuba.me
      // www.69shu.ac
      // www.69yuedu.net
      // www.69yuedu.pro
      // www.69yuedu.co
      // www.69shu.biz
      // www.69shuba.biz
      url: "https?://www.69shuba\\.com/txt/\\d+/\\d+",
      exampleUrl: "https://www.69shuba.com/txt/46867/31307961",
      // contentHandle: false,
      titleSelector: "h1",
      contentSelector: ".txtnav",
      contentRemove: ".txtinfo.hide720, #txtright, .bottom-ad, .bottom-ad2",
      nextSelector: ".page1 a:nth-child(4)",
      prevSelector: ".page1 a:nth-child(1)",
      indexSelector: ".page1 a:nth-child(3)",
      useiframe: true,
      withReferer: true
    },
    {
      siteName: "台湾小说网",
      url: "https?://twkan\\.com/txt/\\d+/\\d+",
      exampleUrl: "https://twkan.com/txt/78813/47726772",
      // contentHandle: false,
      titleSelector: "h1",
      contentSelector: ".txtnav",
      contentRemove: ".txtinfo.hide720, #txtright, .bottom-ad, .bottom-ad2",
      nextSelector: ".page1 a:nth-child(4)",
      prevSelector: ".page1 a:nth-child(1)",
      indexSelector: ".page1 a:nth-child(3)",
      useiframe: true,
      withReferer: true
    },
    {
      siteName: "101看书",
      // 101kan.com
      url: "https?://101kks\\.com/txt/\\d+/\\d+",
      exampleUrl: "https://101kks.com/txt/21088/9051062.html",
      // contentHandle: false,
      titleSelector: "h1",
      contentSelector: ".txtnav",
      contentRemove: ".txtinfo.hide720, #txtright, .bottom-ad, .bottom-ad2",
      nextSelector: ".page1 a:nth-child(4)",
      prevSelector: ".page1 a:nth-child(1)",
      indexSelector: ".page1 a:nth-child(3)",
      useiframe: true,
      iframeSandbox: "allow-same-origin allow-scripts",
      withReferer: true
    },
    {
      siteName: "书山中文网",
      url: "https?://shushan\\.zhangyue\\.net/book/\\d+/\\d+/",
      exampleUrl: "https://shushan.zhangyue.net/book/105835/15038074/",
      contentSelector: ".art_con",
      nextSelector: ".next-cha",
      prevSelector: ".last-cha",
      indexSelector: "a:contains(书页)"
    },
    {
      siteName: "微信读书",
      url: "https?://weread\\.qq\\.com/web/reader/.*?",
      contentSelector: ".wr_canvasContainer",
      nextSelector: "#nextchapter",
      prevSelector: "#prevchapter",
      indexSelector: "#bookindex",
      titleSelector: ".chapterTitle",
      contentHandle: false,
      useRawContent: true,
      // 完全关闭 handleContentText 内容处理函数，使用原始内容
      useiframe: true,
      mutationSelector: ".wr_canvasContainer",
      mutationChildCount: 1,
      contentPatchAsync: async function($doc) {
        function encode(plainText) {
          if ("number" == typeof plainText && (plainText = plainText.toString()), "string" != typeof plainText)
            return plainText;
          var md5Hash = CryptoJS.MD5(plainText).toString(CryptoJS.enc.Hex), _0xf208b6 = md5Hash.substr(0, 3), _0x2045c1 = (function(plainText2) {
            if (/^\d*$/.test(plainText2)) {
              for (var _0x1c7c70 = plainText2.length, _0x9fd207 = [], _0x2fd6ee = 0; _0x2fd6ee < _0x1c7c70; _0x2fd6ee += 9) {
                var _0x4089d1 = plainText2.slice(_0x2fd6ee, Math.min(_0x2fd6ee + 9, _0x1c7c70));
                _0x9fd207.push(parseInt(_0x4089d1).toString(16));
              }
              return ["3", _0x9fd207];
            }
            for (var _0x4b46c9 = "", _0x1f2538 = 0; _0x1f2538 < plainText2.length; _0x1f2538++)
              _0x4b46c9 += plainText2.charCodeAt(_0x1f2538).toString(16);
            return ["4", [_0x4b46c9]];
          })(plainText);
          _0xf208b6 += _0x2045c1[0], _0xf208b6 += 2 + md5Hash.substr(md5Hash.length - 2, 2);
          for (var _0x59bebd = _0x2045c1[1], _0x1aafd3 = 0; _0x1aafd3 < _0x59bebd.length; _0x1aafd3++) {
            var _0x1af4ac = _0x59bebd[_0x1aafd3].length.toString(16);
            1 === _0x1af4ac.length && (_0x1af4ac = "0" + _0x1af4ac), _0xf208b6 += _0x1af4ac, _0xf208b6 += _0x59bebd[_0x1aafd3], _0x1aafd3 < _0x59bebd.length - 1 && (_0xf208b6 += "g");
          }
          return _0xf208b6.length < 20 && (_0xf208b6 += md5Hash.substr(0, 20 - _0xf208b6.length)), _0xf208b6 += CryptoJS.MD5(_0xf208b6).toString(CryptoJS.enc.Hex).substr(0, 3);
        }
        function decode(encodedText) {
          if ("string" != typeof encodedText || encodedText.length <= 3) return "";
          for (var _0x25eace = encodedText.charAt(3), _0x6aad1d = 5 + parseInt(encodedText.charAt(4)), _0x23fa2c = encodedText.length - 3, _0xb4db26 = "", _0x2bf2ee = _0x6aad1d; _0x2bf2ee < _0x23fa2c && (_0x2bf2ee === _0x6aad1d || "g" === encodedText.charAt(_0x2bf2ee)); ) {
            if (_0x2bf2ee !== _0x6aad1d && _0x2bf2ee++, _0x2bf2ee + 2 > _0x23fa2c) return "";
            var _0x436006 = parseInt(encodedText.substr(_0x2bf2ee, 2), 16);
            if (_0x2bf2ee + 2 + _0x436006 > _0x23fa2c) return "";
            var _0x3f72db = encodedText.substr(_0x2bf2ee + 2, _0x436006), _0x41cdae = "";
            if ("3" === _0x25eace) {
              var _0x3c987c = parseInt(_0x3f72db, 16);
              if (isNaN(_0x3c987c)) return "";
              _0x41cdae = "" + _0x3c987c;
            } else
              for (var _0x293868 = 0, _0x14b43a = _0x3f72db.length; _0x293868 < _0x14b43a; _0x293868 += 2) {
                var _0x4f2610 = parseInt(_0x3f72db.substr(_0x293868, 2), 16);
                _0x41cdae += String.fromCharCode(_0x4f2610);
              }
            _0xb4db26 += _0x41cdae, _0x2bf2ee = _0x2bf2ee + 2 + _0x436006;
          }
          return _0xb4db26;
        }
        if (!this.__weReadJson) {
          var reqObj = {
            url: this.curPageUrl,
            method: "GET",
            overrideMimeType: "text/html;charset=utf-8",
            headers: {}
          };
          const res = await Request(reqObj);
          var text = res.responseText;
          this.__weReadJson = JSON.parse(getMiddleStr(text, "window.__INITIAL_STATE__=", ";"));
        }
        var chapterList = this.__weReadJson.reader.chapterInfos;
        const re = /\/web\/reader\/([0-9a-f]+)k?([0-9a-f]+)?/g;
        const matchs = [...this.curPageUrl.matchAll(re)];
        let bookId = "", chapterUid = null;
        if (matchs) {
          bookId = decode(matchs[0][1]);
          if (matchs[0].length === 3) {
            chapterUid = parseInt(decode(matchs[0][2]));
          }
        }
        var currentChapter = chapterList.find((e) => e.chapterUid === chapterUid);
        var { chapterIdx } = currentChapter || { chapterIdx: 1 };
        var nextUrl, prevUrl, indexUrl;
        indexUrl = "/web/reader/" + encode(bookId);
        if (chapterIdx === chapterList.length) {
          nextUrl = "";
        } else {
          var nextChapterUid = chapterList[chapterIdx].chapterUid;
          nextUrl = indexUrl + "k" + encode(nextChapterUid);
        }
        if (chapterUid && chapterUid > 1) {
          var prevChapterUid = chapterList[chapterIdx - 2].chapterUid;
          prevUrl = indexUrl + "k" + encode(prevChapterUid);
        } else {
          prevUrl = "";
        }
        var dataUrls = [];
        $doc.find(".wr_canvasContainer canvas").each(function() {
          dataUrls.push(this.toDataURL());
          XS(this).remove();
        });
        var $body = $doc.find("body");
        if (nextUrl) {
          XS('<div id="nextchapter">').attr("href", nextUrl).appendTo($body);
        }
        if (prevUrl) {
          XS('<div id="prevchapter">').attr("href", prevUrl).appendTo($body);
        }
        XS('<div id="bookindex">目录</div>').attr("href", indexUrl).appendTo($body);
        var $container = $doc.find(".wr_canvasContainer");
        for (const dataUrl of dataUrls) {
          XS("<img>").attr("src", dataUrl).appendTo($container);
        }
      }
    },
    {
      siteName: "飞卢小说网",
      url: "^https?://b\\.faloo\\.com/\\d+_\\d+\\.html",
      titleSelector: "h1",
      bookTitleSelector: "#novelName",
      nextSelector: "a#next_page",
      prevSelector: "a#pre_page",
      indexSelector: "a#huimulu",
      contentSelector: ".noveContent",
      contentReplace: [
        "飞卢小说网 b.faloo.com 欢迎广大书友光临阅读，最新、最快、最火的连载作品尽在飞卢小说网！"
      ]
    },
    {
      siteName: "小说321",
      url: "https?://www\\.xs321\\.net/book/\\d+/\\d+/\\d+(_\\d+)?.html",
      exampleUrl: "http://www.xs321.net/book/671/671539/1.html",
      useSiteFont: true,
      checkSection: true,
      contentReplace: [
        ".*www\\.xs321\\.net.*",
        "本章未完，请点击下一页继续阅读！",
        "^.*?提示您：看后求收藏（小说321xs321.net），接着再看更方便。",
        ".*xs321.net.*"
      ]
    },
    {
      siteName: "斋书院",
      url: "https?://www\\.zhaishuyuan\\.org/book/\\d+/\\d+(_\\d+)?.html",
      exampleUrl: "https://www.zhaishuyuan.org/book/4985/4553175.html",
      checkSection: true
    },
    {
      siteName: "YY文轩",
      url: "https?://www\\.xiyuwx\\.com/\\d+/.*?\\.html",
      exampleUrl: "http://www.xiyuwx.com/523903/13063045.html",
      useiframe: true,
      contentSelector: "#ad"
    },
    {
      siteName: "飞速中文",
      url: "https://(?:www.)?(?:feiazw|feibzw|xn--fiq228cu93a4kh).com/Html/\\d+/\\d+.html",
      exampleUrl: "https://www.feiazw.com/Html/21975/18399024.html",
      contentRemove: "p[style], .l",
      noSection: true
    },
    {
      siteName: "顶点小说",
      url: "https?://www\\.ddxs\\.com/.*?/\\d+.html",
      exampleUrl: "http://www.ddxs.com/yuanzun/1.html",
      contentSelector: "#contents",
      bookTitleSelector: "dl > dt > a:last",
      noSection: true
    },
    {
      siteName: "铅笔小说",
      url: "https?://www.23qb.com/book/\\d+/\\d+(?:_\\d+)?.html",
      exampleUrl: "https://www.23qb.com/book/187203/70954846.html",
      contentPatch($doc) {
        const re = toRE("\\{url_previous:'(.*?)',url_next:'(.*?)',url_index:'(.*?)',\\}");
        const ReadParams = $doc.find("script:contains(ReadParams)").text();
        const [_, url_previous, url_next, url_index] = re.exec(ReadParams) || [];
        const nextName = url_next.includes("_") ? "下一页" : "下一章";
        const body = $doc.find("body");
        $doc.find("p:contains(（继续下一页）)").remove();
        XS("<a>").attr("href", url_previous).text("上一章").appendTo(body);
        XS("<a>").attr("href", url_next).text(nextName).appendTo(body);
        XS("<a>").attr("href", url_index).text("目录").appendTo(body);
      },
      contentReplace: ["铅笔小说 23qb.com"]
    },
    {
      siteName: "爱尚小说",
      url: "https://www.asxs.com/view/\\d+/\\d+.html",
      exampleUrl: "https://www.asxs.com/view/174811/2330811.html",
      noSection: true
    },
    {
      siteName: "legado-webui",
      url: "http://localhost:5000/bookshelf/\\d+/\\d+/",
      githubRepo: "https://github.com/letterk/legado-webui",
      contentPatch($doc) {
        const js = $doc.find("script:contains(saveMark)").text();
        const hostIP = document.cookie.replace(
          /(?:(?:^|.*;\s*)hostip\s*\=\s*([^;]*).*$)|^.*$/,
          "$1"
        );
        const body = getMiddleStr(js, 'var str = "', '";').replace(/&#39;|&#34;/gi, '"');
        fetch(`http://${hostIP}/saveBookProgress`, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json"
          },
          body
        });
      }
    },
    {
      siteName: "有度中文网",
      url: "https://www.yodu.org/book/\\d+/\\d+.html",
      exampleUrl: "https://www.yodu.org/book/11542/1472213.html",
      useSiteFont: true,
      // style: '@font-face{font-family:read;font-display:block;src:url(/en/common/read.ttf);}#xiaoshuo-reader-content{font-family: "read" !important;}',
      contentPatch($doc) {
        const re = toRE("\\{t\\d+_0:'(.*?)',t\\d+_1:'(.*?)',t\\d+_index:'(.*?)',\\}");
        const ReadParams = $doc.find("script:contains(fuck)").text();
        const [_, url_previous, url_next, url_index] = re.exec(ReadParams) || [];
        let previousName = $doc.find("#readbg > p > a:nth-child(1)").text();
        let nextName = $doc.find("#readbg > p > a:nth-child(5)").text();
        previousName = previousName === "<--" ? "上一页" : "上一章";
        nextName = nextName === "-->" ? "下一页" : "下一章";
        const body = $doc.find("body");
        $doc.find("a:contains(目录)").remove();
        $doc.find("p:contains(（本章未完）)").remove();
        XS("<a>").attr("href", url_previous).text(previousName).appendTo(body);
        XS("<a>").attr("href", url_next).text(nextName).appendTo(body);
        XS("<a>").attr("href", url_index).text("目录").appendTo(body);
      }
    },
    {
      siteName: "小书亭",
      url: "https://www.xiaoshuting.la/\\d+/\\d+/\\d+.html",
      exampleUrl: "https://www.xiaoshuting.la/4/4325/72082213.html",
      noSection: true
    },
    {
      siteName: "小书亭",
      url: "https://www.xiaoshutingapp.com/html/\\d+/\\d+.html",
      exampleUrl: "https://www.xiaoshutingapp.com/html/11341/151211.html",
      noSection: true
    },
    {
      siteName: "饭团看书",
      url: "https://www.fantuankanshu.com/html/\\d+/\\d+/\\d+.html",
      exampleUrl: "https://www.fantuankanshu.com/html/6/6286/83813065.html",
      noSection: true
    },
    {
      siteName: "E品中文",
      url: "https://www.epzw.com/html/\\d+/\\d+/\\d+.html",
      exampleUrl: "https://www.epzw.com/html/92/92675/1.html",
      noSection: true
    },
    {
      siteName: "第一小说",
      url: "https://www.01xs.com/xiaoshuo/\\d+/\\d+.html",
      exampleUrl: "https://www.01xs.com/xiaoshuo/120924/1.html",
      noSection: true
    },
    {
      siteName: "思路客",
      url: "https://www.slkslk.com/\\d+/\\d+/\\d+/\\d+.html",
      exampleUrl: "https://www.slkslk.com/0/8/8342/139031.html",
      noSection: true
    },
    {
      siteName: "思路客",
      url: "https://www.siluke.com/\\d+/\\d+/\\d+/\\d+.html",
      exampleUrl: "https://www.siluke.com/0/112/112444/1874061.html",
      noSection: true
    },
    {
      siteName: "小书亭",
      url: "https://www.xiaoshuting.cc/xiaoshuo/\\d+/\\d+/\\d+.html",
      exampleUrl: "https://www.xiaoshuting.cc/xiaoshuo/4/4469/62562.html",
      contentSelector: ".Text",
      bookTitleSelector: ".summary a"
    },
    {
      siteName: "2k小说网",
      url: "https://www.2kxiaoshuo.com/xiaoshuo/\\d+/\\d+/\\d+.html",
      exampleUrl: "https://www.2kxiaoshuo.com/xiaoshuo/18/18207/254891.html",
      contentSelector: ".Text",
      bookTitleSelector: ".summary a"
    },
    {
      siteName: "2k小说网",
      url: "https://www.2kxs.la/xiaoshuo/\\d+/\\d+/\\d+.html",
      exampleUrl: "https://www.2kxs.la/xiaoshuo/11/11245/202411.html",
      contentSelector: ".Text",
      bookTitleSelector: ".summary a"
    },
    {
      siteName: "镇魂",
      url: "https://www.zhenhunxiaoshuo.com/\\d+.html",
      exampleUrl: "https://www.zhenhunxiaoshuo.com/1.html",
      contentSelector: ".article-content",
      bookTitleSelector: "a[rel~=category]",
      indexUrl: "a[rel~=category]",
      nextUrl: "a[rel=next]",
      prevUrl: "a[rel=prev]"
    },
    {
      siteName: "精华书阁",
      // url: 'https?://(?:www.)?(?:2ksk|jhssd|xbyuan|richvv).com/\\d+/.*?.html',
      url: "https?://www.babahome.net/\\d+/.*?.html",
      exampleUrl: "https://www.richvv.com/172/652.html",
      contentSelector: "#nr_content, #hp_coonten, #jb_contsen, #wr_consten",
      contentReplace: [
        // '温馨提示:为防止/内容/获取不/全和文/字乱序，请勿使用浏览器(A/p/p)阅.读.模.式。',
        // '温馨告知：为防止\\内容\\获取不全和文字\\乱序，请勿使用浏览器(A\\p\\p)阅\\读\\模\\式。',
        // '提示:如果内*容获取*不全和文字*乱*序，请退出浏览器(A*p*p)阅/读/模/式。',
        // '告示：如果.内容获.取.不全和文.字乱序，请退出浏览器(A.p.p)阅-读-模-式。',
        "^.*阅.读.模.式.*$",
        String.raw`\(本章未完，请点击下一页继续阅读\)`,
        "^.*?提醒您：看完记得收藏【精华书阁】w w w.jhssd.com，下次我更新您才方便继续阅读哦，期待精彩继续！您也可以用手机版: wap.jhssd.com，随时随地都可以畅阅无阻....",
        "【讲真，最近一直用@精华书阁@看书追更，换源切换，朗读音色多，.安卓苹果均可。】",
        "【认识十年的老书友给我推荐的追书，@精华书阁@！真特么好用，开车、睡前都靠这个朗读听书打发时间，这里可以下载\\.?】",
        "【推荐下，@精华书阁@追书真的好用，大家去快可以试试吧。】",
        "【新章节更新迟缓的问题，在能精华书阁的上终于有了解决之道，这里下载精华书阁.精华书阁，同时查看本书在多个站点的最新章节。】",
        "【.*?精华书阁.*?】",
        "^…\\.",
        { "「": "“", "」": "”" }
      ]
      // contentRemove: '.txtinfos, .textinfo, .infotext, .infostet',
      // handleContentText ($content, info) {
      //     const $html = XS('<div>').html(this.handleContentText($content, info))
      //     const style = this.$doc.find('style').filter(function () {
      //         return XS(this).text().indexOf("@font-face") > -1
      //     })
      //     $html.prepend(style)
      //     const contentReplace = [
      //         '无../错../更../新`.j`.h`.s`.s`.d`.c`.o`.m',
      //         'j._/h._/s._/s._/d._/.._/c._/o._/m',
      //         '精../华../书../阁../无../错../首../发~~',
      //         '首../发../更../新`.精`.华`.书`.阁',
      //         '精../华../书../阁../首../发../更../新~~',
      //         '@精华书阁首发',
      //         {'「': '“', '」': '”'}
      //     ]
      //     return this.replaceText($html[0].outerHTML, contentReplace)
      // }
    },
    {
      siteName: "天天看小说",
      url: "https?://(?:www|cn|tw).(?:bg3.co|wa01.com)/novel/pagea/.*?.html",
      exampleUrl: "https://www.bg3.co/novel/pagea/lingjingxingzhe-maibaoxiaolangjun_1.html",
      nextSelector($doc) {
        if ($doc.find(".novel_end").length) {
          return null;
        }
        return $doc.find(".next_page_links > a:first").attr("href");
      },
      indexSelector: ".bread_crumbs a:last",
      prevSelector: ".prev_page > a:first",
      contentReplace: [
        /*
        www¸t tkan¸Сo
        щшш◆ t t k a n◆ C 〇
        щшш◆ttκǎ n◆C○
        WWW⊕ тTk án⊕ ￠O
        Wшw ●ttκǎ n ●Сo
        шшш¸Tтkan¸C〇
        шшш. t tkan. c ○
        ωωω• ttκan• c○
        шωш¸ т tκa n¸ CΟ
        www＿тtkan＿℃O
        ¸ тt kǎn¸ C〇
        wWW¤ тt kдn¤ ￠O
        */
        "[wWщшω]{0,3} ?[¸◆⊕●.•＿¤☢⊙▲✿★▪]? ?(?:[tTтⓣ] ?){2}[kKκКⓚ] ?[aAǎáдāΛⓐ] ?[nNⓝ] ?[¸◆⊕●.•＿¤☢⊙▲✿★▪]? ?[cCС￠℃] ?[oO〇○Ο] ?"
      ],
      contentRemove: ".div_feedback, .social_share_frame"
    },
    {
      siteName: "无防盗小说网",
      url: "https://wufangdao\\.com/html/\\d+/\\d+/\\d+\\.html",
      exampleUrl: "https://wufangdao.com/html/17/17078/455411.html",
      noSection: true
    },
    {
      siteName: "ESJ",
      url: "^https?://www\\.esjzone\\.(?:me|cc)/forum/\\d+/\\d+\\.html",
      exampleUrl: "https://www.esjzone.cc/forum/1677032544/162585.html",
      titleSelector: "h2",
      contentSelector: ".mt-3.forum-content",
      indexSelector: ".view-all.btn-outline-secondary.btn",
      prevSelector: ".btn-prev.btn-sm.btn-outline-secondary.btn",
      nextSelector: ".btn-next.btn-sm.btn-outline-secondary.btn"
    },
    {
      siteName: "真白萌",
      url: "^https?://masiro\\.me/admin/novelReading*",
      contentSelector: ".nvl-content.box-body",
      prevSelector: "a:contains('上一话')",
      nextSelector: "a:contains('下一话')"
    },
    {
      siteName: "独步小说网",
      url: "https?://www.dbxsc.com/book/.*?/.*?\\.html",
      exampleUrl: "https://www.dbxsc.com/book/p1693/565590.html",
      contentSelector: "#cont-body",
      prevSelector: ".col-md-6.text-center a:first",
      nextSelector: ".col-md-6.text-center a:last"
    },
    {
      siteName: "123读",
      url: "https?://www\\.123dua?\\.(com|vip)/dudu-\\d+/\\d+/\\d+(-\\d+)?.html",
      checkSection: true,
      contentSelector: "#content",
      nextSelector: '#PageSet a:contains("下一页"), .bottem2 a:contains("下一章")',
      contentReplace: ["…。。\\s本章未完，请点击下一页继续阅读！", '^"$']
    },
    {
      siteName: "阿拉法小说网",
      url: "https?://www.alafaxs.com/du/\\d+/\\d+.html",
      exampleUrl: "https://www.alafaxs.com/du/80/856585.html",
      bookTitleSelector: ".chapter-nav > p:first > a:last()",
      useiframe: true,
      mutationSelector: "#txt",
      mutationChildCount: 0,
      contentSelector: "#txt"
    },
    {
      siteName: "梦远书城",
      url: /www\.my285\.com(?:\/\w+){3,5}\/\d+\.htm$/,
      useiframe: true,
      noSection: true,
      titleSelector: ".t50",
      contentSelector: "table tr:nth-child(4) > td"
    },
    {
      siteName: "飞翔鸟中文网",
      url: "https?://www\\.fxnzw\\.com/fxnread/\\d+_\\d+.html",
      exampleUrl: "https://www.fxnzw.com/fxnread/50217_11878551.html",
      bookTitleSelector: "#breadCrumb a:nth-child(2)",
      contentSelector: "#content > div[style]:last"
    },
    {
      siteName: "三优小说网",
      url: "https?://www\\.(?:3uxiaoshuo|zrfsxs)\\.com/xiaoshuo/\\d+/\\d+.html",
      titleReg: "(.*?)-(.*?)-",
      titlePos: 1,
      contentSelector: ".con",
      contentReplace: [
        "^必.?应.?搜.?索.?:.?三.?优.?小.?说.?网.?,.?最.?快.?更.?新.?,.?无.?弹.?窗。",
        "^必.?应.?搜.?索.?:.?择.?日.?小.?说.?网.?,.?最.?快.?更.?新.?,.?无.?弹.?窗。"
      ]
    },
    {
      siteName: "奇书网",
      url: "https://www.qisxs.com/.*?/\\d+.html",
      exampleUrl: "https://www.qisxs.com/shenhaiyujin/7570735.html",
      bookTitleSelector: ".info a",
      contentSelector: ".box_box"
    },
    {
      siteName: "622中文",
      url: "https://www.622zw.com/books/\\d+/\\d+(_)?\\d+.html",
      exampleUrl: "https://www.622zw.com/books/175956/57627355.html",
      checkSection: true,
      titleSelector: ".reader-main h1.title",
      contentReplace: ["(www.)?622zw.com"]
    },
    {
      siteName: "东流小说",
      url: "https://www.zfxwx.com/read/.*/\\d+(_)?\\d+.html",
      exampleUrl: "https://www.zfxwx.com/read/AgVVAApc/1644315500.html",
      titleSelector: "h1",
      bookTitleSelector: ".breadcrumb > li:nth-child(2) > a",
      contentSelector: ".content"
    },
    {
      siteName: "UU看书网",
      url: "https://www.uuks.org/b/\\d+/\\d+.html",
      exampleUrl: "https://www.uuks.org/b/73675/920931.html",
      bookTitleSelector: function() {
        return window.booktitle;
      },
      contentSelector: "#content"
    },
    {
      siteName: "123读书网-手机站",
      url: "https://m.123duw?.(com|vip)/dudu-\\d+/\\d+/\\d+(-\\d+)?.html",
      exampleUrl: "https://m.123dua.com/dudu-31/8452541/55196666.html",
      titleReg: "(.*?)-(.*?)-(.*?)",
      titlePos: 1,
      checkSection: true,
      prevSelector: "#PageSet a:contains('上'):contains('页')",
      nextSelector: "#PageSet a:contains('下'):contains('页')",
      contentSelector: ".TxtContent",
      contentReplace: [
        "本章没完，请点击下.?页继续阅读！如果被转码了请退出转码或者更换.?.?器即可。",
        "….$",
        "^.*提醒您：看完记得收藏【123读书网】 123duw.com，下次我更新您才方便继续阅读哦，期待精彩继续！$",
        '^"$'
      ]
    },
    {
      siteName: "宙斯小说",
      url: "https?://www.zhswx.com/read/\\d+_\\d+.html",
      exampleUrl: "http://www.zhswx.com/read/63755_22738751.html",
      bookTitleSelector: "#form1 > table > tbody > tr > td > div[align='center'] > a:last-child",
      contentSelector: "#form1 > table > tbody > tr > td > div:has(p)",
      contentReplace: [
        "^新书(、)*$",
        "^本站(、)*$"
      ]
    },
    {
      siteName: "得奇小说网",
      url: "https://www.deqixs.com/xiaoshuo/\\d+/\\d+(-\\d+)?.html",
      exampleUrl: "https://www.deqixs.com/xiaoshuo/4/74219.html",
      bookTitleSelector: function($doc) {
        return window.Title;
      },
      titleReg: "(.*?)-(.*?)-(.*?)",
      titlePos: 1,
      useiframe: true,
      contentSelector: ".con",
      contentReplace: [
        { "II": "二" },
        { "壹": "一" }
      ]
    },
    {
      siteName: "逛笔趣阁小说网",
      url: "https?://www\\.fkxs\\.net/.*?/.*?\\.html",
      exampleUrl: "https://www.fkxs.net/241_241951/117822179.html",
      checkSection: true,
      titleSelector: ".bookname h1",
      contentSelector: ".content",
      nextSelector: ".bottem2 a:nth-child(4)",
      prevSelector: ".bottem2 a:nth-child(2)",
      indexSelector: ".bottem2 a:nth-child(3)"
    },
    {
      siteName: "永久看小说",
      url: "https://www.09k.net/kkb/\\d+/\\d+(-\\d+)?.html",
      exampleUrl: "https://www.09k.net/kkb/021338893523/56870262.html",
      checkSection: true,
      prevSelector: "#PageSet a:contains('上'):contains('页')",
      nextSelector: "#PageSet a:contains('下'):contains('页')",
      contentReplace: [
        "…\\."
      ]
    },
    {
      siteName: "息壤中文网",
      url: "https://xrzww.com/bookread",
      titleSelector: ".chapter_name",
      contentSelector: ".novel_box",
      mutationSelector: ".novel_box",
      mutationChildCount: 1,
      nextUrl($doc) {
        return `https://xrzww.com/bookread#${(new Date()).getTime()}`;
      },
      contentPatch($doc) {
        $doc.find(".chapter_name span").remove();
        $doc.find(".novel_box div span").remove();
        $doc.find(".novel_box .others").remove();
      },
      async getContent($doc) {
        if (!this.info.readinfo) {
          this.info.readinfo = JSON.parse(localStorage.getItem("readinfo") || "null");
          let { next_chapter: next_chapter2, next_chapter_order: next_chapter_order2, chapter_ispay: chapter_ispay2 } = await this.info._getChapterData();
          if (chapter_ispay2 === 1) {
            this.info.isVipChapter = () => true;
            return;
          }
          this.info.readinfo.chapter_id = next_chapter2;
          this.info.readinfo.chapter_order = next_chapter_order2;
        }
        const { next_chapter, next_chapter_order, chapter_ispay, chapter_name, content } = await this.info._getChapterData();
        if (chapter_ispay === 1) {
          this.info.isVipChapter = () => true;
          return;
        }
        const contentHtml = content.split("\n").map((s) => `<p>${s}</p>`).join("\n");
        const html = `<h1>${chapter_name}</h1><div class="content">${contentHtml}</div>`;
        this.info.readinfo.chapter_id = next_chapter;
        this.info.readinfo.chapter_order = next_chapter_order;
        return {
          html
        };
      },
      async _getChapterData({ nid, vid, chapter_id, chapter_order, showpic } = this.readinfo) {
        const options = {
          url: `https://pre-api.xrzww.com/api/readNovelByWeb?nid=${nid}&vid=${vid}&chapter_id=${chapter_id}&chapter_order=${chapter_order}&showpic=${showpic}`,
          method: "GET",
          overrideMimeType: "text/html;charset=utf-8",
          headers: {}
        };
        const res = await Request(options);
        return JSON.parse(res.responseText).data;
      }
    },
    {
      siteName: "独阅读|深度阅读",
      url: "^https?://www\\.(duread\\.cn|duyuedu\\.net)/chapter/book_chapter_detail/\\d+$",
      exampleUrl: "https://www.duread.cn/chapter/book_chapter_detail/100081563",
      useiframe: true,
      titleSelector: ".article-title",
      contentSelector: ".article-content",
      indexSelector: ".btn-group-vertical a:nth-child(1)",
      prevSelector($doc) {
        return $doc.find("#J_BtnPagePrev").attr("data-href");
      },
      nextSelector($doc) {
        return $doc.find("#J_BtnPageNext").attr("data-href");
      },
      contentPatch($doc) {
        $doc.find(".J_Num").remove();
      }
    },
    {
      siteName: "笔趣阁",
      url: "http://m.biquxs.com/book/\\d+/.*?.html",
      exampleUrl: "http://m.biquxs.com/book/13516/9382746.html",
      checkSection: true,
      contentSelector: "#chaptercontent",
      contentPatch($doc) {
        $doc.find("#chaptercontent p:not(.content_detail)").remove();
      }
    },
    {
      siteName: "语录书院",
      url: "https://www.yulusy.com/yulus/\\d+/.*?.html",
      exampleUrl: "https://www.yulusy.com/yulus/17410287770/59700783-2.html",
      checkSection: true,
      prevSelector: "#PageSet a:contains('上'):contains('页')",
      nextSelector: "#PageSet a:contains('下'):contains('页')",
      contentSelector: "#content"
    },
    {
      siteName: "语录书院-移动版",
      url: "https://m.yulusy.com/yulus/\\d+/.*?.html",
      exampleUrl: "https://m.yulusy.com/yulus/17710148533/59468382-2.html",
      checkSection: true,
      prevSelector: "#PageSet a:contains('上'):contains('页')",
      nextSelector: "#PageSet a:contains('下'):contains('页')",
      contentSelector: ".TxtContent",
      contentReplace: [
        "…..*$",
        "^.*本章没完，请点击下—页继续阅读！如果被转码了请退出转码或者更换浏揽器即可。.*$",
        "^\\d+.$"
      ]
    },
    {
      siteName: "Sangtacviet",
      url: "https://sangtacviet.vip/truyen/.*?/1/\\d+/\\d+/",
      exampleUrl: "https://sangtacviet.vip/truyen/faloo/1/1361906/",
      prevSelector: "#navprevtop",
      nextSelector: "#navnexttop",
      indexSelector: "#navcentertop",
      titleSelector($doc) {
        return $doc.find("#bookchapnameholder").text() || "No Title";
      },
      bookTitleSelector: "#booknameholder",
      contentSelector: "#content-container > .contentbox",
      contentReplace: ["@Bạn đang đọc bản lưu trong hệ thống"],
      useiframe: true,
      contentHandle: false,
      mutationSelector: "#content-container > .contentbox",
      mutationChildText: "Đang tải nội dung chương...",
      mutationCheck($doc) {
        const href = $doc.find("#navnexttop").attr("href");
        return !href.endsWith("/0/");
      }
    },
    {
      siteName: "手机小说",
      url: "https://www.shoujix.com/shoujixs_\\d+_\\d+.html",
      exampleUrl: "https://www.shoujix.com/shoujixs_199607_47546183.html",
      contentSelector: "#zjny"
    },
    {
      siteName: "言情小说阁-移动版",
      url: "http://m.xianqihaotianmi.org/book_\\d+/\\d+(_\\d+)?.html",
      exampleUrl: "http://m.xianqihaotianmi.org/book_86899/47598965_2.html",
      checkSection: true,
      titleReg: "(.*?)_(.*?)_(.*?)",
      titlePos: 1,
      prevSelector: "#pt_prev",
      nextSelector: "#pt_next",
      contentSelector: "#chaptercontent",
      contentPatch($doc) {
        $doc.find("#chaptercontent p").remove();
        $doc.find("#chaptercontent a").remove();
        const _title = $doc.find("title").text().match(/(第\d+章\s+[\u4e00-\u9fa5]+)/)[0];
        $doc.find("#chaptercontent").contents().filter(function() {
          return this.nodeType === 3 && new RegExp(_title.replace(/\s+/g, "\\s+")).test(XS(this).text());
        }).remove();
      }
    },
    {
      siteName: "哔哩轻小说",
      url: "https://(www|tw).(bilinovel|linovelib).com/novel/\\d+/\\d+(_\\d+)?.html",
      exampleUrl: "https://www.bilinovel.com/novel/4048/227859.html",
      useiframe: true,
      checkSection: true,
      bookTitleSelector: function() {
        return window.ReadParams.articlename;
      },
      titleSelector: "#atitle",
      prevSelector: "#footlink > a:nth-child(1)",
      nextSelector: "#footlink > a:nth-child(4)",
      indexSelector: "#footlink > a:nth-child(2)",
      contentSelector: ".acontent, .bcontent",
      contentPatch($doc) {
        const scriptText = $doc.find("body > script:nth-child(1)").text();
        const urls = scriptText.match(/url_(previous|index|articleinfo|next):'([^']+)'/g).map((url) => url.split(":")[1].slice(1, -1));
        const footlinkAnchors = $doc.find("#footlink a");
        const anchorIndex = [0, 2, 3, 1];
        footlinkAnchors.each(function(index) {
          XS(this).removeAttr("onclick").attr("href", urls[anchorIndex[index]]);
        });
      }
    },
    {
      siteName: "轻小说文库",
      url: "https://www.wenku8.net/novel/\\d+/\\d+/\\d+.htm",
      exampleUrl: "https://www.wenku8.net/novel/2/2449/91347.htm",
      noSection: true,
      bookTitleSelector: "#linkleft > a:nth-child(3)",
      titleSelector: "#title",
      prevSelector: "#foottext > a:nth-child(3)",
      nextSelector: "#footlink > a:nth-child(4)",
      indexSelector: "#footlink > a:nth-child(5)",
      contentSelector: "#content"
    },
    {
      siteName: "UU看书",
      url: "https://www.uuread.tw/chapter/\\d+/\\d+(_\\d+)?.html",
      exampleUrl: "https://www.uuread.tw/chapter/11681/3006418.html",
      checkSection: true,
      bookTitleSelector: ".bread > li:nth-child(4) > a:nth-child(1)",
      titleSelector: [".chatit", "（.*）$"],
      prevSelector: "a.btn-primary:nth-child(1)",
      nextSelector: "a.btn-primary:nth-child(4)",
      indexSelector: "a.btn-primary:nth-child(3)",
      contentSelector: ".txt_tcontent"
    },
    {
      siteName: "69shux",
      url: "https://69shux.com/txt/\\d+/\\d+",
      exampleUrl: "https://69shux.com/txt/59608/41087519",
      titleSelector: "h1",
      contentSelector: ".txtnav",
      contentRemove: ".txtinfo.hide720, #txtright, .err_tips",
      nextSelector: ".page1 a:nth-child(4)",
      prevSelector: ".page1 a:nth-child(1)",
      indexSelector: ".page1 a:nth-child(3)",
      useiframe: true,
      iframeSandbox: "allow-same-origin allow-scripts"
    },
    {
      siteName: "笔趣阁",
      url: "http://www.biquxs.com/book/\\d+/\\d+.html",
      exampleUrl: "http://www.biquxs.com/book/17539/9351052.html",
      titleReg: "(.*?)_(.*?)_",
      titlePos: 1,
      contentSelector: "#content",
      nextSelector: ".page_chapter .next",
      prevSelector: ".page_chapter .pre",
      indexSelector: ".page_chapter .back"
    },
    {
      siteName: "微风小说",
      url: "https?://(?:m|www).wfxs.tw/xiaoshuo/\\d+/\\d+/",
      exampleUrl: "https://m.wfxs.tw/xiaoshuo/22454/7990959/",
      contentReplace: ["本章尚未完結,請點擊下一頁繼續閱讀---->>>", "本章已閱讀完畢\\(請點擊下一章繼續閱讀!\\)"]
    },
    {
      siteName: "新笔趣阁",
      url: "http://www.xsbiquge.la/book/\\d+/\\d+.html",
      exampleUrl: "http://www.xsbiquge.la/book/2066/1417147.html",
      titleReg: "(.*?)_(.*?)_",
      titlePos: 1,
      contentSelector: "#content",
      nextSelector: ".page_chapter .next",
      prevSelector: ".page_chapter .pre",
      indexSelector: ".page_chapter .back"
    },
    // 需要配合 ignore-x-frame-headers 扩展使用
    // https://chromewebstore.google.com/detail/ignore-x-frame-headers/ohgdnhkppgeemnmjebhedjneajcedppf
    // https://addons.mozilla.org/firefox/addon/ignore-x-frame-options-header/
    {
      siteName: "笔趣阁",
      url: "http://www.bqgege.com/reader/.*?/",
      exampleUrl: "http://www.bqgege.com/reader/mXEmgH8/",
      bookTitleSelector: ".breadcrumb ol li a:last",
      titleSelector: ".breadcrumb ol li:last",
      contentSelector: ".__b",
      mutationSelector: ".__b",
      mutationChildCount: 1,
      useiframe: true,
      contentPatch($doc) {
        var sectionEls = Array.from($doc.find(".page a")).reverse();
        var foundActive = false;
        var nextSectionEl, prevSectionEl;
        for (const el of sectionEls) {
          var $el = XS(el);
          if (foundActive) {
            nextSectionEl = $el;
            break;
          }
          foundActive = $el.hasClass("active");
          if (!foundActive) {
            prevSectionEl = $el;
          }
        }
        if (nextSectionEl) {
          nextSectionEl.text("下一页");
        }
        if (prevSectionEl) {
          prevSectionEl.text("上一页");
        }
      }
    },
    {
      siteName: "大熊猫文学网",
      url: "https://www.dxmwx.org/read/\\d+_\\d+.html",
      exampleUrl: "https://www.dxmwx.org/read/40004_9947948.html",
      contentSelector: "#Lab_Contents"
    },
    {
      siteName: "爱下电子书",
      url: "https://ixdzs8.com/read/\\d+/p\\d+.html",
      exampleUrl: "https://ixdzs8.com/read/42730/p1.html",
      prevSelector: ".chapter-pre",
      nextSelector: ".chapter-next",
      indexSelector: "a:contains(书籍页)",
      contentSelector: ".page-content section"
    },
    // ============ Legado 书源移植（精选主流站 42 个） ============
    {
      siteName: "起点中文",
      // Legado 书源移植
      url: /^https?:\/\/(?:www|m)\.qidian\.com\/chapter\//i,
      contentSelector: ".read-content"
    },
    {
      siteName: "番茄小说",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*fanqianxs\.com(?:\/|$)/i,
      contentSelector: "#htmlContent"
    },
    {
      siteName: "69书吧",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*69shuba\.cx(?:\/|$)/i,
      contentSelector: ".txtnav"
    },
    {
      siteName: "69书吧",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*69shuba\.com(?:\/|$)/i,
      contentSelector: ".txtnav"
    },
    {
      siteName: "速读谷",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*sudugu\.co(?:\/|$)/i,
      contentSelector: ".con"
    },
    {
      siteName: "快书网",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*kuaishu5\.com(?:\/|$)/i,
      contentSelector: "#booktxt p"
    },
    {
      siteName: "天天看小说",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*ttkan\.co(?:\/|$)/i,
      contentSelector: ".content p"
    },
    {
      siteName: "独步小说网",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*dbxsd\.com(?:\/|$)/i,
      contentSelector: "#cont-body",
      nextSelector: ".page a"
    },
    {
      siteName: "大文学无错小说网",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*wcxsw\.org(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "顶点小说 ddxs",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*ddxs\.com(?:\/|$)/i,
      contentSelector: "#contents"
    },
    {
      siteName: "顶点小说",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*znxdxs\.com(?:\/|$)/i,
      contentSelector: "#htmlContent"
    },
    {
      siteName: "阅友小说",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*suixkan\.com(?:\/|$)/i,
      contentSelector: ".con"
    },
    {
      siteName: "就爱文学",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*92xs\.info(?:\/|$)/i,
      contentSelector: "#ccontent"
    },
    {
      siteName: "八一中文",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*81zw2\.com(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "八一中文",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*zwduxs\.com(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "武林中文网",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*50zw\.so(?:\/|$)/i,
      contentSelector: ".word_read p"
    },
    {
      siteName: "无错小说",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*wucuoxs\.com(?:\/|$)/i,
      contentSelector: "#htmlContent"
    },
    {
      siteName: "燃文小说",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*ranwen\.org(?:\/|$)/i,
      contentSelector: "#htmlContent"
    },
    {
      siteName: "全本小说",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*qbtxt\.net(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "笔趣阁",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*bqg6\.com(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "笔趣阁",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*biqukun\.com(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "笔趣阁",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*biquge2023\.com(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "笔趣阁",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*biquge5200\.com(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "六九中文",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*liujiuzw\.com(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "趣书吧",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*39shuwu\.com(?:\/|$)/i,
      contentSelector: "#htmlContent"
    },
    {
      siteName: "大文学",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*dawenxue\.net(?:\/|$)/i,
      contentSelector: "#htmlContent"
    },
    {
      siteName: "书趣阁",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*ishuquge\.la(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "选书网",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*ixuanshu\.net(?:\/|$)/i,
      contentSelector: "#content1"
    },
    {
      siteName: "天域小说网",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*tycqzw\.la(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "恋上你看书",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*630book\.io(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "文学迷",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*juzixs\.vip(?:\/|$)/i,
      contentSelector: "#nr1",
      nextSelector: "#pt_next"
    },
    {
      siteName: "蚂蚁阅读",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*xmayitxt\.com(?:\/|$)/i,
      contentSelector: ".page-content"
    },
    {
      siteName: "飘天文学",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*piaotian\.so(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "UU小说",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*uuxs\.info(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "乐阅读",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*27k\.net(?:\/|$)/i,
      contentSelector: ".txtnav"
    },
    {
      siteName: "四三中文",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*zw43\.com(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "御书房",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*ysfwxc\.com(?:\/|$)/i,
      contentSelector: ".content"
    },
    {
      siteName: "三一小说",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*31xs\.com(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "落秋中文",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*luoqiu\.cc(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "香书小说",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*ibiquges\.org(?:\/|$)/i,
      contentSelector: "#content"
    },
    {
      siteName: "书旗小说",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*shuq\.net(?:\/|$)/i,
      contentSelector: "#htmlContent"
    },
    {
      siteName: "一读小说",
      // Legado 书源移植
      url: /^https?:\/\/(?:[a-z0-9-]+\.)*121du\.net(?:\/|$)/i,
      contentSelector: "#BookText"
    }
  ];

  var __store = {};
  var __loaded = false;
  var __loadTimedOut = false;
  var __loadPromise = null;
  function loadAll() {
    if (__loadPromise) return __loadPromise;
    __loadPromise = new Promise(function(resolve) {
      let done = false;
      function finish(store) {
        if (done) return;
        done = true;
        __store = store || {};
        __loaded = true;
        resolve(__store);
      }
      try {
        chrome.storage.local.get(null, function(items) {
          finish(items);
        });
      } catch (e) {
        finish(null);
      }
      setTimeout(function() {
        if (!done) __loadTimedOut = true;
        finish(__store);
      }, 2500);
    });
    return __loadPromise;
  }
  var Store = {
    get: function(key, def) {
      if (key in __store) return __store[key];
      if (!__loaded) return def;
      return def;
    },
    set: function(key, value) {
      __store[key] = value;
      try {
        chrome.storage.local.set({ [key]: value }, function() {
        });
      } catch (e) {
      }
    },
    remove: function(key) {
      delete __store[key];
      try {
        chrome.storage.local.remove(key, function() {
        });
      } catch (e) {
      }
    },
    list: function() {
      return Object.keys(__store);
    }
  };
  function addStyle(css) {
    let style = document.createElement("style");
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
    return style;
  }
  function openInTab(url, active) {
    chrome.runtime.sendMessage({ action: "xs_open_tab", url, active: !!active });
  }
  var appInfo = {
    script: {
      name: "小说阅读助手",
      description: "小说阅读助手：统一阅读样式、去广告、段落整理、自动翻页、进度记忆、快捷键",
      includes: ["*://*/*"],
      excludes: []
    }
  };
  loadAll();
  (function() {
    "use strict";
    const config = {
      soduso: false,
      // www.sodu.so 跳转
      // content_replacements: true,     // 小说屏蔽字修复
      xhr_time: 15 * 1e3
    };
    if (typeof window.exportFunction == "undefined") {
      window.exportFunction = (function(foo, scope, defAs) {
        scope[defAs.defineAs] = foo;
      }).bind(window);
    }
    function parseHTML(str) {
      let doc;
      try {
        doc = new DOMParser().parseFromString(str, "text/html");
      } catch (ex) {
      }
      if (!doc) {
        doc = document.implementation.createHTMLDocument("");
        doc.querySelector("html").innerHTML = str;
      }
      var allElements = doc.querySelectorAll("*");
      for (var i = 0; i < allElements.length; i++) {
        var el = allElements[i];
        var attrs = el.attributes;
        for (var j = attrs.length - 1; j >= 0; j--) {
          var attrName = attrs[j].name.toLowerCase();
          if (attrName.startsWith("on")) {
            el.removeAttribute(attrs[j].name);
          }
        }
      }
      var links = doc.querySelectorAll("a[href]");
      for (var i = 0; i < links.length; i++) {
        var href = links[i].getAttribute("href");
        if (href && href.toLowerCase().startsWith("javascript:")) {
          links[i].removeAttribute("href");
        }
      }
      return doc;
    }
    function toReStr(str) {
      return str.replace(/[()\[\]{}|+.,^$?\\*]/g, "\\$&");
    }
    function wildcardToRegExpStr(urlstr) {
      if (urlstr.source) return urlstr.source;
      let reg = urlstr.replace(/[()\[\]{}|+.,^$?\\]/g, "\\$&").replace(/\*+/g, function(str) {
        return str === "*" ? ".*" : "[^/]*";
      });
      return "^" + reg + "$";
    }
    function getUrlHost(url) {
      let a = document.createElement("a");
      a.href = url;
      return a.host;
    }
    function sleep(timeout) {
      return new Promise((resolve) => setTimeout(resolve, timeout));
    }
    function DOMContentLoaded() {
      return new Promise((resolve) => XS(resolve));
    }
    function getTextNodesIn(node, includeWhitespaceNodes) {
      let textNodes = [], nonWhitespaceMatcher = /\S/;
      function getTextNodes(node2) {
        if (node2.nodeType == 3) {
          if (includeWhitespaceNodes || nonWhitespaceMatcher.test(node2.nodeValue)) {
            textNodes.push(node2);
          }
        } else {
          for (let i = 0, len = node2.childNodes.length; i < len; ++i) {
            getTextNodes(node2.childNodes[i]);
          }
        }
      }
      node.normalize();
      getTextNodes(node);
      return textNodes;
    }
    if (typeof String.prototype.startsWith != "function") {
      String.prototype.startsWith = function(str) {
        return this.slice(0, str.length) == str;
      };
    }
    if (typeof String.prototype.endsWith != "function") {
      String.prototype.endsWith = function(str) {
        return this.slice(-str.length) == str;
      };
    }
    if (!String.prototype.includes) {
      String.prototype.includes = function(search, start) {
        if (typeof start !== "number") {
          start = 0;
        }
        if (start + search.length > this.length) {
          return false;
        } else {
          return this.indexOf(search, start) !== -1;
        }
      };
    }
    let getBooleanConfig = function(configName, defaultValue) {
      let config2 = Store.get(configName);
      if (config2 === undefined) {
        if (__loaded && !__loadTimedOut) {
          Store.set(configName, defaultValue);
        }
        config2 = defaultValue;
      }
      return config2;
    };
    const Setting = {
      // },
      // 自动滚动阅读速度（像素/秒，1-100，默认 20）——与设置面板滑块 min/max 保持一致
      get auto_scroll_speed() {
        let v = parseInt(Store.get("auto_scroll_speed", 20), 10);
        if (isNaN(v)) return 20;
        return Math.min(100, Math.max(1, v));
      },
      set auto_scroll_speed(speed) {
        let v = parseInt(String(speed), 10);
        if (isNaN(v)) v = 20;
        Store.set("auto_scroll_speed", String(Math.min(100, Math.max(1, v))));
      },
      get remain_height() {
        if (this._remain_height === undefined) {
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
        let isMac = /Macintosh|Mac OS X/.test(navigator.userAgent);
        return isMac ? "PingFang SC,苹方-简,宋体,楷体" : "微软雅黑,宋体,黑体,楷体";
      },
      set font_family(val) {
        Store.set("font_family", val);
      },
      get font_size() {
        return Store.get("font_size") || "20px";
      },
      set font_size(val) {
        Store.set("font_size", val);
      },
      get text_line_height() {
        return Store.get("text_line_height") || "1.5em";
      },
      set text_line_height(val) {
        Store.set("text_line_height", val);
      },
      get paragraph_height() {
        return Store.get("paragraph_height") || "0.5em";
      },
      set paragraph_height(val) {
        Store.set("paragraph_height", val);
      },
      get content_width() {
        return Store.get("content_width") || "1000px";
      },
      set content_width(val) {
        Store.set("content_width", val);
      },
      get custom_siteinfo() {
        return Store.get("custom_siteinfo", "[]");
      },
      set custom_siteinfo(val) {
        Store.set("custom_siteinfo", val);
      },
      get skin_name() {
        return Store.get("skin_name") || "自动";
      },
      set skin_name(val) {
        Store.set("skin_name", val);
      },
      get menu_list_hidden() {
        if (this._menu_list_hidden === undefined) {
          let oldVal = Store.get("menu_list_hiddden");
          if (oldVal !== undefined) {
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
        this._open_preferences_key = Store.get("open_preferences_key") || "o";
        return this._open_preferences_key;
      },
      set open_preferences_key(keyCode) {
        this._open_preferences_key = keyCode;
        Store.set("open_preferences_key", keyCode);
      },
      // 隐藏左侧章节列表的快捷键
      get hide_menu_list_key() {
        if (this._hide_menu_list_key) {
          return this._hide_menu_list_key;
        }
        if (this._hide_menu_list_key === undefined) {
          let oldVal = Store.get("hide_menulist_key");
          if (oldVal !== undefined) {
            Store.set("hide_menu_list_key", oldVal);
            Store.remove("hide_menulist_key");
            this._hide_menu_list_key = oldVal;
          } else {
            this._hide_menu_list_key = Store.get("hide_menu_list_key") || "c";
          }
        }
        return this._hide_menu_list_key;
      },
      set hide_menu_list_key(key) {
        this._hide_menu_list_key = key;
        Store.set("hide_menu_list_key", key);
      },
      get preload_next_page() {
        if (this._preload_next_page === undefined) {
          let oldVal = Store.get("preloadNextPage");
          if (oldVal !== undefined) {
            Store.set("preload_next_page", oldVal);
            Store.remove("preloadNextPage");
            this._preload_next_page = oldVal;
          } else {
            this._preload_next_page = Store.get("preload_next_page", false);
          }
        }
        return this._preload_next_page;
      },
      set preload_next_page(bool) {
        this._preload_next_page = bool;
        Store.set("preload_next_page", bool);
      },
      get smart_next_page() {
        if (this._smart_next_page === undefined) {
          let oldVal = Store.get("smartNextPage");
          if (oldVal !== undefined) {
            Store.set("smart_next_page", oldVal);
            Store.remove("smartNextPage");
            this._smart_next_page = oldVal;
          } else {
            this._smart_next_page = Store.get("smart_next_page", true);
          }
        }
        return this._smart_next_page;
      },
      set smart_next_page(bool) {
        this._smart_next_page = bool;
        Store.set("smart_next_page", bool);
      },
      // 内容优化：合并多行引号/标点清洗/全半角转换/自动强制分段（会调整原文排版，默认关，需时再开）
      get content_optimize() {
        if (this._content_optimize === undefined) {
          let oldVal = Store.get("contentOptimize");
          if (oldVal !== undefined) {
            Store.set("content_optimize", oldVal);
            Store.remove("contentOptimize");
            this._content_optimize = oldVal;
          } else {
            this._content_optimize = Store.get("content_optimize", false);
          }
        }
        return this._content_optimize;
      },
      set content_optimize(bool) {
        this._content_optimize = bool;
        Store.set("content_optimize", bool);
      }
      // 快速启动
    };
    Store.remove("contentNormalize");
    Store.remove("cn_default_on_migrated");
    Store.remove("xs_logs");
    const sites = Array.isArray(SITE_RULES) && SITE_RULES.length ? SITE_RULES : [
      /* 兜底：规则未注入时为空规则集，走通用/启发式匹配 */
    ];
    let CHAR_ALIAS = {
      "\\P": "[\\u2000-\\u2FFF\\u3004-\\u303F\\uFE00-\\uFF60\\uFFC0-\\uFFFF]"
      // 小说中添加的特殊符号
    };
    let ParseDefaults = {
      titleRegExp: /第?\s*[一二两三四五六七八九十○零百千万亿0-9１２３４５６７８９０〇]{1,6}\s*[章回卷节折篇幕集话話]/i,
      titleReplace: /^章节目录|^文章正文|^正文卷?|全文免费阅读|最新章节|\(文\)/,
      // nextRegExp: /[上前下后][一]?[页张个篇章节步]/
      nextSelector: "a[rel='next'], a:contains('下一页'), a:contains('下一頁'), a:contains('下一章'), a:contains('下一节'), a:contains('下页'), a:contains('下章')",
      prevSelector: "a[rel='prev'], a:contains('上一页'), a:contains('上一頁'), a:contains('上一章'), a:contains('上一节'), a:contains('上页'), a:contains('上章')",
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
        "a:contains('返回书目')",
        "a:contains('章节目录')",
        "a:contains('章节列表')",
        "a:econtains('最新章节')",
        "a:contains('回目录')",
        "a:contains('回书目')",
        "a:contains('目 录')",
        "a:contains('目录')"
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
        "全文阅读$",
        "在线阅读$",
        "最新章节$",
        "^正文卷"
      ]
    };
    let PurifyRules = {
      contentRemove: "script, iframe, a, audio, style, button",
      // 内容移除选择器
      // 文本层整行净化规则：净化始终执行，仅丢弃「整行完全匹配」的杂质行，绝不修改小说原文文字/缩进/空行
      trashLineRules: [
        // ===== 双保险说明 =====
        // 以下与 handleContentText2 的 DOM 层整块删除构成「双保险」：DOM 层删独立控件块，
        // 文本层删混入正文的独立行。二者刻意重复覆盖（打赏/上一章下一章/目录/下载App/
        // 扫一扫/添加书签/本章说/作者作家说/字数行/纯数字行等），即使某层因站点改版失效，
        // 另一层仍能兜底。请勿当作冗余清理删除。
        "^[()]$",
        "^正文$",
        "^登录$",
        "^讨论热烈[^\\n]{0,30}段评",
        "^[^\\n]{0,40}?\\d+字\\s*\\d{4}年\\d{1,2}月\\d{1,2}日[^\\n]{0,20}$",
        "^本章(含|共)\\d+条(评|段评)",
        "^\\d+字 \\d{2}:\\d{2}",
        "^[^\\n]{0,15}?\\d{4}[-年]\\d{1,2}[-月]\\d{1,2}日?[^\\n]{0,20}$",
        "^(作者有话说|作者留言|作者的话|PS|Ps|ps)[:：]?[^\\n]{0,50}",
        "^(本章感言|感言|小编说|编者按|未完待续|待续|下章预告)[^\\n]{0,40}",
        "^(\\[|【)\\s*第?\\d+页\\s*(\\]|】)",
        "^(分页阅读|上一页|下一页|>>>翻到下一页|翻页阅读)[^\\n]*",
        "^(投月票|投推荐票|打赏作者|打赏本书|推荐本书|点击收藏|加入书架|点击解锁|开通VIP|VIP章节|本章付费)[^\\n]*",
        "^(推荐阅读|点击阅读|同类小说|更多好书|作者还写过)[^\\n]{0,40}",
        "^\\s*(\\S+·)?(作者|作家)说\\s*$",
        "^\\s*上起点中文网支持我[^\\n]*$",
        "^\\s*[^\\n]{0,40}?打赏了\\d+(万|千)?(起点)?(点?币|点)$",
        "^\\s*添加书签$",
        "^\\s*扫一扫，手机接着读$",
        "^\\s*本章说\\s*\\d{0,6}\\s*$",
        "^\\s*(下载App|下载APP|下载客户端|打开App|立即下载)\\s*$",
        "^\\s*打赏\\s*[⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉\\d]{0,4}\\s*$",
        "^\\s*(打赏榜|打赏列表|最近打赏|本章打赏|打赏记录)\\s*$",
        "^\\s*(上一章|下一章|目录|章节目录|章节列表|回目录)\\s*$",
        "^\\s*\\d{1,8}字\\s*$",
        "^\\s*\\d{1,5}\\s*$",
        "^先定个小目标，比如1秒记住： .*",
        "^热门推荐：.*",
        "^猜您喜欢：.*",
        "^.*请你先收藏此页吧，方便等下阅读咯……",
        "^.*更新中……努力更新中…….*",
        "^本站已更改域名，最新域名：.*",
        "^.*正在手打中，请稍等片刻[，。].*",
        "^.*全文字更新,牢记网址:.*",
        "^小说分类：.*",
        "^本书来源.*",
        "^本书来自.*",
        "^.*欢迎广大书友光临阅读，最新、最快、最火的连载作品尽在.*",
        "^恋上你看书网.*",
        "^.*手机阅读地址.*",
        "^.*为你提供最快的.*?更新，.*",
        "^.*最新章节 请关注\\(\\)",
        "^.*老域名(?:\\(.*?\\))?被墙，请您牢记本站最新域名(?:\\(.*?\\))?",
        "^作者：.*?分类：.*",
        "^@@\\?\\s*",
        "^txt下载地址：.*",
        "^.*手机版阅读网址：.*",
        "^(?:本书)?手机阅读：.*",
        "^.*\\(?https?://.*",
        "^\\s*(?:下载|打开|安装|前往|使用)(?:APP|app|客户端|应用|起点读书).{0,20}$",
        "^\\s*[^\\n]{0,25}?(?:前往|请|去|点击|观看|阅读全文|看完整版|下载)(?:APP|客户端|应用|起点读书)[^\\n]{0,20}\\s*$",
        "^\\s*(?:本章)?未完[^\\n]{0,20}?(?:前往|请|点击|阅读)(?:APP|客户端|应用)[^\\n]{0,20}\\s*$",
        "^\\s*(?:求月票|求推荐票|求推荐|求订阅|求收藏|求票|求更新|催更|追更|投票支持|点赞支持|投出你宝贵的一票)[^\\n]{0,30}\\s*$",
        "^\\s*(?:版权所有|盗版必究|请勿转载|禁止转载|谢绝转载|侵权必究|未经授权)[^\\n]{0,20}\\s*$",
        "^\\s*[【\\[（(]\\s*(?:首发|独家|来源|转载|版权|正版)[^\\n]{0,30}\\s*[】\\]）)]\\s*$",
        "^\\s*(?:本站|网站|本书)?(?:地址|网址|域名|来源|首发)[:：]?[^\\n]{0,40}\\s*$"
      ],
      // DOM 层整块杂质净化正则（原 dom.ts cleanContent 内嵌默认值，收拢为数据；引擎只执行）
      trashBlockReg: /^(?:本章说\d{0,6}|(?:\S+·)?(?:作者|作家)说|上起点中文网支持我[^\n]*|下载App|下载APP|下载客户端|打开App|立即下载|打赏(?:了)?\d{0,8}(?:万|千)?(?:起点)?(?:点|币)?|打赏榜|打赏列表|最近打赏|本章打赏|打赏记录|扫一扫，手机接着读|上一章|下一章|目录|章节目录|章节列表|回目录|添加书签|\d{1,8}字|\d{1,5}|讨论热烈[^\n]{0,30}段评|阅文集团|本作品由起点中文网进行电子制作与发行|@版权所有侵权必究|与[0-9.]+万?位书友[^\n]{0,40}|「盟主」[^\n]{0,30}(?:「堂主」[^\n]{0,30})?|第[0-9一二三四五六七八九十百千]+章[^\n]{0,40}|类型|上架|连载中\(字\)|都市|[^\n]*◎著|反馈|指南|举报|旧版|著|请记住[\s\S]{0,120}唯一[\s\S]{0,10}网[\s\S]{0,4}址[\s\S]{0,80}站[\s\S]{0,4}长[\s\S]{0,60}其它[\s\S]{0,12}网[\s\S]{0,4}站[\s\S]{0,20}断[\s\S]{0,4}更[\s\S]{0,6}|\d{1,6}(?:\.\d{1,2})?万)$/,
      // 渲染层净化：整行仅 1-5 位数字（段评点赞数/楼号标记）
      trashLineNumReg: /^\s*\d{1,5}\s*$/,
      // 渲染层净化：段尾段评数字（起点段评数，如 "……情绪。58" → "……情绪。"）
      trashTailNumReg: /([\u4e00-\u9fa5。！？…」』”"）:：,，;；])\s*\d{1,5}$/,
      // 文本层净化：章节标题后的分页标记 " (第1/2页)" / "（第1/2页）"（保留章节名，去页码后缀）
      pageMarkReg: /^([^\n]{0,60}?)\s*[（(]\s*第\s*\d+\s*\/\s*\d+\s*页\s*[)）]\s*$/gm
    };
    let SiteRules = {
      specialSite: sites,
      customRules: []
    };
    let tpl_mainHtml = mainHtml;
    const autoBookTitleSelector = ParseDefaults.bookTitleSelector;
    function autoGetBookTitle($doc) {
      let bookTitle = "";
      for (let s of autoBookTitleSelector) {
        let $node = $doc.find(s);
        if ($node.length === 1) {
          bookTitle = $node.text();
          break;
        }
      }
      return bookTitle;
    }
    let replaceNormalizeMap = null;
    let replaceNormalizeMapForOpt = null;
    function getNormalizeMap() {
      if (replaceNormalizeMap && replaceNormalizeMapForOpt === Setting.content_optimize) {
        return replaceNormalizeMap;
      }
      const rule = {
        "[,，]\\s*": "，",
        // 合并每一行以"，"结束的段落和去除"，"后的空格
        "\\s^，": "，",
        // 合并每一行以"，"开头的段落
        "\\s^”": "”",
        // 合并每一行以右引号开头的段落
        "\\. *$": "。",
        '\\.([”"])': "。$1",
        "([。！？”]) +": "$1",
        "，+": "，",
        '"(.*?)"': "“$1”",
        "”“": "”\n“",
        // 将一段中的相邻的对话分段
        // 将一段中的含多个句号、感叹号、问号的句子每句分为多段
        "([。！？])([\\u4e00-\\u9fa5“][\\u4e00-\\u9fa5“，]{20,})": "$1\n$2",
        // 将一段中的第一句后接对话（引号）句子的第一句话分段
        "(^.*?[.。])(“.*?”)": "$1\n$2",
        // 将一段中的右引号后面的内容分为一段
        "([。！？])”(?![\\u4e00-\\u9fa5，]+，“)([\\u4e00-\\u9fa5“，]{20,})": "$1”\n$2",
        "“([\\s\\S]*?)”": Setting.content_optimize ? (match) => match.replace(toRE("\n"), "") : undefined,
        "「(.*?)」": "“$1”",
        "『(.)』": "$1",
        "[┅。…·.]{3,20}": "……",
        "[~－]{3,50}": "——"
      };
      Object.keys(rule).forEach((key) => !rule[key] && delete rule[key]);
      replaceNormalizeMap = rule;
      replaceNormalizeMapForOpt = Setting.content_optimize;
      return rule;
    }
    const excludeCharCode = new Set([
      65292,
      65311,
      65306,
      65307,
      65288,
      65289,
      65281
    ]);
    function toCDB(str) {
      let tmp = "", charCode;
      for (let i = 0; i < str.length; i++) {
        charCode = str.charCodeAt(i);
        if (charCode > 65248 && charCode < 65375 && !excludeCharCode.has(charCode)) {
          tmp += String.fromCharCode(charCode - 65248);
        } else {
          tmp += str.charAt(i);
        }
      }
      return tmp;
    }
    const includeCharCode = new Set([44, 63, 58, 59, 40, 41, 33]);
    function toDBC(str) {
      let tmp = "", charCode;
      for (let i = 0; i < str.length; i++) {
        charCode = str.charCodeAt(i);
        if (includeCharCode.has(charCode)) {
          tmp += String.fromCharCode(charCode + 65248);
        } else {
          tmp += str.charAt(i);
        }
      }
      return tmp;
    }
    function observeElement(doc, {
      contentSelector,
      mutationSelector,
      mutationChildText,
      mutationChildCount,
      mutationCheck
    }) {
      let $doc = XS(doc);
      let contentSize = $doc.find(contentSelector).length;
      if (contentSize && !mutationSelector) {
        return;
      }
      let target = $doc.find(mutationSelector)[0];
      if (!target) {
        return;
      }
      let check = true;
      if (typeof mutationCheck === "function") {
        check = mutationCheck($doc);
      }
      let beforeTargetChilren = target.children.length;
      const textNotFound = mutationChildText && !target.textContent.includes(mutationChildText);
      if (textNotFound && check) {
        return;
      }
      const childCountEnough = mutationChildCount !== undefined && target.children.length > mutationChildCount;
      if (childCountEnough && check) {
        return;
      }
      if ((textNotFound || childCountEnough) && !check) {
        beforeTargetChilren = 0;
      }
      return new Promise((resolve) => {
        let observer = new MutationObserver(function() {
          const t = $doc.find(mutationSelector)[0];
          if (!t) return;
          let nodeAdded = t.children.length > beforeTargetChilren;
          let check2 = true;
          if (nodeAdded && typeof mutationCheck === "function") {
            check2 = mutationCheck($doc);
          }
          if (nodeAdded && check2) {
            observer.disconnect();
            resolve();
          }
        });
        observer.observe(doc && doc.nodeType ? doc : document, {
          childList: true,
          subtree: true
        });
      });
    }
    function domMutation() {
      return new Promise((resolve) => {
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          try {
            observer.disconnect();
          } catch (e) {
          }
          clearTimeout(hardTimer);
          resolve();
        };
        const fn = () => {
          clearTimeout(fn._t);
          fn._t = setTimeout(finish, 100);
        };
        const observer = new MutationObserver(fn);
        observer.observe(document, {
          childList: true,
          subtree: true
        });
        const hardTimer = setTimeout(finish, 5e3);
        fn();
      });
    }
    const r$1 = String.raw;
    const spaceRegex = toRE(r$1`&nbsp;|&ensp;|&emsp;`), noPrintRegex = toRE(r$1`&thinsp;|&zwnj;|&zwj;`), wrapHtmlRegex = toRE(r$1`</?(?:div|p|br|hr|h\d|article|dd|dl)[^>]*>`), indent1Regex = toRE(r$1`\s*\n+\s*`), indent2Regex = toRE(r$1`^[\n\s]+`), lastRegex = toRE(r$1`[\n\s]+$`), otherHtmlRegex = toRE(r$1`</?[a-zA-Z]+(?=[ >])[^<>]*>`);
    function htmlFmt(text, otherRegex = otherHtmlRegex) {
      text = text.replace(toRE("\uFEFF|​"), "");
      text = text.replace(spaceRegex, " ");
      text = text.replace(noPrintRegex, "");
      text = text.replace(wrapHtmlRegex, "\n");
      text = text.replace(otherRegex, "");
      text = text.replace(indent1Regex, "\n");
      text = text.replace(indent2Regex, "");
      text = text.replace(lastRegex, "");
      text = parseHTML(text).documentElement.textContent;
      return text;
    }
    function cleanHTML(doc) {
      const treeWalker = document.createTreeWalker(doc, NodeFilter.SHOW_COMMENT);
      while (treeWalker.nextNode()) {
        treeWalker.currentNode.remove();
      }
      getTextNodesIn(doc, true).filter((n) => n.data !== "\n").forEach((n) => n.data = n.data.replace(/[\u2000-\u200F\u2028\u2029\uFEFF]/g, "").trim().replace(/\s+/g, " "));
      return htmlFmt(doc.outerHTML);
    }
    const _trashLineRegs = new WeakMap();
    function filterTrashLines(text, rules) {
      if (!text) return text;
      const lines = text.split(/\r?\n/);
      let res = _trashLineRegs.get(rules);
      if (!res) {
        res = rules.map((rs) => new RegExp(rs, "im"));
        _trashLineRegs.set(rules, res);
      }
      const kept = [];
      for (const line of lines) {
        let trash = false;
        for (const re of res) {
          if (re.test(line)) {
            trash = true;
            break;
          }
        }
        if (!trash) kept.push(line);
      }
      return kept.join("\n");
    }
    function renderHTML(text) {
      text = text.split("\n").filter((t) => !!t.trim()).filter((t) => !PurifyRules.trashLineNumReg.test(t)).map((t) => t.replace(PurifyRules.trashTailNumReg, "$1")).map((t) => `<p>　　${escapeHtml(t)}</p>`).join("\n");
      return `<div class="content">${text}</div>`;
    }
    const p = document.createElement("p");
    function escapeHtml(text) {
      p.textContent = text;
      return p.innerHTML;
    }
    function getElemFontSize(_heading) {
      let fontSize = 0;
      let _heading_style = window.getComputedStyle(_heading, null);
      if (_heading_style) {
        try {
          let str = _heading_style.getPropertyValue("font-size") || 0;
          fontSize = parseInt(String(str), 10);
        } catch (e) {
        }
      }
      return fontSize;
    }
    function applyContentSettings(content, host, replaceText) {
      if (host) {
        const hostEsc = toReStr(host);
        const hostVariant = hostEsc.replace(/^www\./i, "");
        const hostRe = toRE(`^.*?(?:${hostEsc}|${hostVariant}).*?$`);
        content = content.replace(hostRe, () => "");
      }
      content = filterTrashLines(content, PurifyRules.trashLineRules);
      content = content.replace(PurifyRules.pageMarkReg, "$1");
      if (Setting.content_optimize) {
        content = content.replace(/[\u200B-\u200D\uFEFF\u2060\u00AD\u200E\u200F\u061C\u202A-\u202E]/g, "");
        content = content.split("\n").map((line) => line.replace(/^[ \t\u3000]+|[ \t\u3000]+$/g, "")).join("\n");
        content = toDBC(toCDB(content));
        if (typeof replaceText === "function") {
          content = replaceText(content, getNormalizeMap());
        } else {
          content = content.replace(/「(.*?)」/g, "“$1”").replace(/『(.)』/g, "$1");
          content = content.replace(/[┅。…·.]{3,20}/g, "……").replace(/[~－]{3,50}/g, "——");
          content = content.replace(/\s*[,，]\s*/g, "，").replace(/,+/g, "，");
          content = content.replace(/([。！？])\s*/g, "$1");
        }
        content = content.replace(/\n[ \t]*\n(?:\n[ \t]*)+/g, "\n\n");
      }
      return content;
    }
    function applyDomClean($div, info) {
      $div.cleanContent({
        contentRemove: PurifyRules.contentRemove,
        extraRemove: info && info.contentRemove || null,
        trashReg: PurifyRules.trashBlockReg
      });
    }
    function Parser(...args) {
      this.init.apply(this, arguments);
    }
    Parser.prototype = {
      constructor: Parser,
      init: function(info, doc, curPageUrl) {
        this.info = info || {};
        this.doc = info.cloneNode && doc.defaultView ? doc.cloneNode(true) : doc;
        this.$doc = XS(this.doc);
        this.curPageUrl = curPageUrl || doc.URL;
        this._curPageHost = getUrlHost(this.curPageUrl);
        this.isTheEnd = false;
        this.isSection = false;
        if (doc.defaultView && doc.defaultView.$cleanupEvents) {
          doc.defaultView.$cleanupEvents(true);
        }
      },
      applyPatch: function() {
        let contentPatch = this.info.contentPatch;
        if (contentPatch) {
          try {
            contentPatch.call(this, this.$doc);
          } catch (e) {
          }
        }
      },
      applyAsyncPatch: async function() {
        let contentPatch = this.info.contentPatchAsync;
        if (contentPatch) {
          try {
            await contentPatch.call(this, this.$doc);
          } catch (e) {
          }
        }
      },
      getAll: async function() {
        this.applyPatch();
        await this.applyAsyncPatch();
        await this.preProcessDoc();
        this.parse();
        return this;
      },
      preProcessDoc: async function() {
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
            div = XS("<div></div>").html(data.html);
          }
          this.$doc.find("body").prepend(div);
        }
      },
      parse: function() {
        this.getPrevUrl();
        this.getIndexUrl();
        this.getNextUrl();
        this.getTitles();
        this.getContent();
      },
      hasContent: function() {
        if (this.$content) {
          return this.$content.length > 0;
        }
        let $content;
        if (this.info.isVipChapter) {
          if (this.info.isVipChapter(this.$doc)) {
            this.isTheEnd = "vip";
            return false;
          }
        }
        let _cnLen = function(el) {
          let _txt = (el.textContent || "").replace(/[\s\u3000]+/g, "");
          return { txt: _txt, cn: (_txt.match(/[\u4e00-\u9fff]/g) || []).length };
        };
        let _isContentNode = function(el) {
          if (!el || el.nodeType !== 1) return false;
          let _m = _cnLen(el);
          if (_m.cn < 200) return false;
          let _links = el.querySelectorAll("a");
          let _linkLen = 0;
          for (let _li = 0; _li < _links.length; _li++) {
            _linkLen += (_links[_li].textContent || "").replace(/[\s\u3000]+/g, "").length;
          }
          if (_m.txt.length > 0 && _linkLen / _m.txt.length > 0.5) return false;
          return true;
        };
        let _contentScore = function(el) {
          let _m = _cnLen(el);
          return _m.cn - el.querySelectorAll("a").length * 10;
        };
        let _pickValid = function($cand) {
          let _best = null, _bestScore = null;
          for (let _ci = 0; _ci < $cand.length; _ci++) {
            if (!_isContentNode($cand[_ci])) continue;
            let _s = _contentScore($cand[_ci]);
            if (_best === null || _s > _bestScore) {
              _best = $cand[_ci];
              _bestScore = _s;
            }
          }
          return _best ? XS(_best) : null;
        };
        if (this.info.contentSelector) {
          let $cand = this.$doc.find(this.info.contentSelector);
          if ($cand && $cand.length) {
            $content = _pickValid($cand);
          }
        }
        if (!$content || !$content.length) {
          let selectors = ParseDefaults.contentSelectors;
          for (let i = 0, l = selectors.length; i < l; i++) {
            let $cand = this.$doc.find(selectors[i]);
            if (!$cand.length) {
              continue;
            }
            $content = _pickValid($cand);
            if ($content && $content.length) {
              break;
            }
          }
        }
        if (!$content || !$content.length) {
          let _maxNode = null, _maxLen = 0;
          let _MIN_CN = 200;
          let _MAX_LINK_RATIO = 0.5;
          this.$doc.find("div,section,article,td,li,blockquote").each(function() {
            let _el = this;
            if (_el.querySelector("div,section,article,td,li,blockquote")) return;
            let _txt = (_el.textContent || "").replace(/[\s\u3000]+/g, "");
            if (!_txt) return;
            let _cn = (_txt.match(/[\u4e00-\u9fff]/g) || []).length;
            if (_cn < _MIN_CN) return;
            let _linkLen = 0;
            let _links = _el.querySelectorAll("a");
            for (let _li = 0; _li < _links.length; _li++) {
              _linkLen += (_links[_li].textContent || "").replace(/[\s\u3000]+/g, "").length;
            }
            if (_txt.length > 0 && _linkLen / _txt.length > _MAX_LINK_RATIO) return;
            if (_cn > _maxLen) {
              _maxLen = _cn;
              _maxNode = _el;
            }
          });
          if (_maxNode) {
            $content = this.$doc.find(_maxNode);
          }
        }
        this.$content = $content;
        return $content.length > 0;
      },
      // 获取书名和章节标题
      getTitles: function() {
        let info = this.info, chapterTitle, bookTitle, docTitle = this.$doc.find("title").text();
        if (info.titleReg) {
          let matches = docTitle.match(toRE(info.titleReg, "i"));
          if (matches && matches.length >= 2) {
            let titlePos = (info.titlePos || 0) + 1;
            let chapterPos = titlePos == 1 ? 2 : 1;
            bookTitle = matches[titlePos];
            chapterTitle = matches[chapterPos];
          }
        }
        let tmpChapterTitle = this.getTitleFromRule(info.titleSelector);
        if (tmpChapterTitle) {
          chapterTitle = tmpChapterTitle;
        }
        if (!chapterTitle) {
          chapterTitle = this.autoGetChapterTitle(this.doc);
        }
        if (info.chapterTitleReplace) {
          chapterTitle = chapterTitle.replace(toRE(info.chapterTitleReplace), "");
        }
        if (!bookTitle && info.bookTitleSelector) {
          bookTitle = this.getTitleFromRule(info.bookTitleSelector);
        }
        if (!bookTitle) {
          bookTitle = autoGetBookTitle(this.$doc);
          bookTitle = this.replaceText(bookTitle, ParseDefaults.bookTitleReplace);
        }
        if (info.bookTitleReplace) {
          bookTitle = bookTitle.replace(toRE(info.bookTitleReplace), "");
        }
        chapterTitle = chapterTitle.replace(/[\u2000-\u200F\u2028\u2029\uFEFF]/g, "").replace(ParseDefaults.titleReplace, "").replace(/([\u4e00-\u9fa5。！？…」』”"）:：,，;；])\s*\d{1,5}$/, "$1").trim();
        if (chapterTitle.startsWith(bookTitle)) {
          let _chapterTitle = chapterTitle.replace(bookTitle, "").trim();
          if (_chapterTitle.length > 0) {
            chapterTitle = _chapterTitle;
          }
        }
        bookTitle = bookTitle.replace(/(?:最新章节|章节目录)$/, "");
        docTitle = bookTitle ? bookTitle + " - " + chapterTitle : docTitle;
        this.originChapterTitle = chapterTitle;
        this.bookTitle = (bookTitle || "目录").trim();
        this.chapterTitle = chapterTitle;
        this.docTitle = docTitle;
      },
      getTitleFromRule: function(selectorOrArray) {
        let title = "";
        if (!selectorOrArray) {
          return "";
        }
        if (typeof selectorOrArray === "function") {
          try {
            title = selectorOrArray(this.$doc);
          } catch (e) {
          }
          if (!title) {
            return "";
          }
          return title;
        }
        let selector, replace;
        if (Array.isArray(selectorOrArray)) {
          selector = selectorOrArray[0];
          replace = selectorOrArray[1];
        } else {
          selector = selectorOrArray;
        }
        let $title = this.$doc.find(selector);
        if (!$title.length) {
          return "";
        }
        title = $title.remove().first().text().trim();
        if (replace) {
          title = title.replace(toRE(replace), "");
        }
        return title;
      },
      // 智能获取章节标题
      autoGetChapterTitle: function(document2) {
        var _main_selector = "h1, h2, h3", _second_selector = "#TextTitle, #title, .ChapterName, #lbChapterName, div.h1, #nr_title", _positive_regexp = ParseDefaults.titleRegExp, _title_remove_regexp = /最新章节|书书网/, $doc = XS(document2), _document_title = document2.title || $doc.find("title").text(), _search_document_title = " " + _document_title.replace(/\s+/gi, " ") + " ";
        let _headings = $doc.find(_main_selector);
        $doc.find(_second_selector).each(function() {
          if (XS(this).find(_main_selector).length === 0) {
            _headings.push(this);
          }
        });
        let possibleTitles = {}, _heading_text;
        XS(_headings).each(function() {
          let _heading = this, _heading_text2 = _heading.textContent.trim();
          if (!_heading_text2 || _heading_text2 in possibleTitles) {
            return;
          }
          var nodeNum = parseInt(_heading.nodeName.slice(1), 10) || 10, score = 10 / nodeNum, _heading_words = _heading_text2.replace(/\s+/g, " ").split(" "), _matched_words = "";
          if (_positive_regexp.test(_heading_text2) || /\d{2,4}/.test(_heading_text2)) {
            score += 50;
          }
          for (let j = 0, _j = _heading_words.length; j < _j; j++) {
            if (_search_document_title.indexOf(_heading_words[j]) > -1) {
              _matched_words += _heading_words[j] + " ";
            }
          }
          score += _matched_words.length * 1.5;
          let _font_size_add_score = getElemFontSize(_heading) * 1.5;
          score += _font_size_add_score;
          possibleTitles[_heading_text2] = score;
        });
        let topScoreTitle, score_tmp = 0;
        for (_heading_text in possibleTitles) {
          if (possibleTitles[_heading_text] > score_tmp) {
            topScoreTitle = _heading_text;
            score_tmp = possibleTitles[_heading_text];
          }
        }
        let curTitle = topScoreTitle;
        if (!curTitle) {
          curTitle = _document_title;
          curTitle = curTitle.replace(/\s-\s.*/i, "").replace(/_[^\[\]【】]+$/, "");
          curTitle = curTitle.trim();
          curTitle = curTitle.replace(_title_remove_regexp, "");
        }
        curTitle = curTitle.replace(ParseDefaults.titleReplace, "");
        return curTitle;
      },
      // 获取和处理内容
      getContent: function() {
        this.hasContent();
        if (!this.$content || this.$content.length <= 0) {
          return;
        }
        if (typeof this.info.handleContentText === "function") {
          try {
            this.content = this.info.handleContentText.call(this, this.$content[0], this.info);
          } catch (e) {
            this.content = this.handleContentText2(this.$content[0], this.info);
          }
        } else {
          this.content = this.handleContentText2(this.$content[0], this.info);
        }
      },
      handleContentText2(node, info) {
        if (!node) return null;
        if (info.useRawContent) {
          return node.outerHTML;
        }
        let $div = XS(node.cloneNode(true));
        app._rawContentCache = $div[0].outerHTML;
        this._rawHTML = $div[0].outerHTML;
        this._curInfo = info;
        app._curInfo = info;
        applyDomClean($div, info);
        let content = cleanHTML($div[0]);
        const contents = content.split("\n");
        const deDupeConetents = [...new Set(contents)];
        const dupeRate = (contents.length - deDupeConetents.length) / contents.length;
        if (dupeRate > 0.1) {
          content = deDupeConetents.join("\n");
        }
        if (this.originChapterTitle) {
          try {
            let reg = toReStr(this.originChapterTitle.trim()).replace(/\s+/g, "\\s*");
            reg = "(" + this.bookTitle.trim() + "\\s*)*\\s*(" + reg + ")*";
            content = content.replace(toRE(`^${reg}$`), "");
          } catch (e) {
          }
        }
        content = applyContentSettings(content, this._curPageHost, this.replaceText.bind(this));
        if (info.contentReplace) {
          content = this.replaceText(content, info.contentReplace);
        }
        const contentHTML = renderHTML(content);
        return contentHTML;
      },
      replaceText: function(text, rule) {
        let selectedf = this;
        switch (true) {
          case rule instanceof RegExp:
            text = text.replace(rule, "");
            break;
          case typeof rule === "string":
            Object.keys(CHAR_ALIAS).forEach(function(key2) {
              rule = rule.replace(key2, CHAR_ALIAS[key2]);
            });
            text = text.replace(toRE(rule), "");
            break;
          case Array.isArray(rule):
            rule.forEach(function(r) {
              text = selectedf.replaceText(text, r);
            });
            break;
          case (rule !== null && typeof rule === "object"):
            let key;
            for (key in rule) {
              text = text.replace(toRE(key), rule[key]);
            }
            break;
        }
        return text;
      },
      getIndexUrl: function() {
        let url = "", selector = this.info.indexSelector || this.info.indexUrl;
        if (selector === false) {
          this.indexUrl = url;
          return url;
        }
        if (selector && typeof selector === "function") {
          try {
            url = selector(this.$doc);
          } catch (e) {
          }
        } else if (this.info.indexSelector) {
          url = this.$doc.find(this.info.indexSelector);
        }
        if (!url || !url.length) {
          let selectors = ParseDefaults.indexSelectors;
          let _indexLink;
          for (let i = 0, l = selectors.length; i < l; i++) {
            _indexLink = this.$doc.find(selectors[i]);
            if (_indexLink.length > 0) {
              url = _indexLink;
              break;
            }
          }
        }
        if (url) {
          url = this.checkLinks(url);
        }
        if (!url) {
        }
        this.indexUrl = url;
        return url;
      },
      getNextUrl: function() {
        let url = "", selector = this.info.nextSelector || this.info.nextUrl, noSection = this.info.noSection;
        this.nextFromReal = false;
        if (selector === false) {
          this.nextUrl = url;
          return url;
        }
        let urlElement, isSectionUrl = false;
        if (selector) {
          if (typeof selector === "function") {
            try {
              urlElement = selector(this.$doc);
            } catch (e) {
            }
          } else {
            urlElement = this.$doc.find(selector);
          }
          url = this.checkLinks(urlElement);
        }
        if (!url) {
          urlElement = this.$doc.find(ParseDefaults.nextSelector);
          url = this.checkLinks(urlElement);
        }
        if (!url) {
          let extraSel = "button:contains('下一页'),button:contains('下一章'),button:contains('下一頁'),button:contains('下页'),button:contains('下章'),a.next,a.next-page,a.page-next,a[data-next],a[data-url],a[data-href],a[data-link],#next,#nextPage,#next_page,.next-page,.next_page,.pager-next,.page-next,.page_next,.next-btn,.btn-next,input[type='button'][value*='下一页'],input[type='button'][value*='下一章'],div[data-next],span[data-next],div[data-url],span[data-url]";
          let $extra = this.$doc.find(extraSel);
          for (let ei = 0; ei < $extra.length && !url; ei++) {
            let $el = $extra.eq(ei);
            if (!$el.is(":visible")) continue;
            let h = $el.attr("href") || $el.attr("data-url") || $el.attr("data-href") || $el.attr("data-link") || $el.attr("data-next");
            if (!h && $el.closest("a").length) h = $el.closest("a").attr("href");
            if (h && h !== location.href) {
              urlElement = $el;
              url = h;
            }
          }
        }
        if (!noSection && url && urlElement && typeof urlElement !== "string") {
          let t = urlElement.text();
          if (!this.isSection && (t.includes("页") || t.includes("頁"))) {
            isSectionUrl = true;
          }
        }
        if (url && urlElement && urlElement.length) this.nextFromReal = true;
        if (!url && Setting.smart_next_page) {
          url = this.smartFindNext();
        }
        if (!url && Setting.smart_next_page) {
          url = this.guessNextUrl();
        }
        this.nextUrl = url || "";
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
      smartFindNext: function() {
        let selectedf = this, url = "";
        let nextTextReg = /下一页|下一頁|下页|下頁|下一章|下一话|下一節|下章|下节|翻下一页/;
        let nextTextRegEn = /^next\b/i;
        let prevTextReg = /上一页|上一頁|上页|上頁|上一章|上一话|上一節|上章|上节|prev|previous|last|end|目录|回目录|返回|首页|封面/;
        let $a = this.$doc.find("a");
        let list = [];
        for (let i = 0; i < $a.length; i++) list.push($a.eq(i));
        for (let n = list.length - 1; n >= 0; n--) {
          let a = list[n];
          let text = (a.text() || "").trim().replace(/\s+/g, "");
          if (!text || text.length > 30) continue;
          if (prevTextReg.test(text)) continue;
          if (!nextTextReg.test(text) && !nextTextRegEn.test(text)) continue;
          url = selectedf.checkLinks(a);
          if (!url || url === location.href) {
            url = "";
            continue;
          }
          if (selectedf.checkNextUrl(url)) {
            selectedf.nextFromReal = true;
            return url;
          }
          url = "";
        }
        return "";
      },
      // 智能下一页：找不到「下一页」链接时，按网址页码规律自动递增构造下一页（借鉴 AutoPager 思路）
      guessNextUrl: function() {
        let href = location.href, url = "";
        let qm = href.match(/[?&](page|pageNum|p|pageNo|pageindex)=(\d+)([^&#]*)$/i);
        if (qm) {
          let next = parseInt(qm[2], 10) + 1;
          if (next > 999999999) return "";
          url = href.replace(qm[0], (qm[0].charAt(0) === "?" ? "?" : "&") + qm[1] + "=" + next + (qm[3] || ""));
        }
        if (!url) {
          let pm = href.match(/([_-])(\d+)(\.\w+)?(?:\?.*)?$/);
          if (pm) {
            let next2 = parseInt(pm[2], 10) + 1;
            if (next2 > 999999999) return "";
            url = href.slice(0, pm.index) + pm[1] + next2 + (pm[3] || "");
          }
        }
        if (!url) {
          let dm = href.match(/(\/\d+)\/(\d+)(\.htm[l]?)?(?:[?#].*)?$/);
          if (dm) {
            let next3 = parseInt(dm[2], 10) + 1;
            if (next3 > 999999999) return "";
            url = href.slice(0, dm.index) + dm[1] + "/" + next3 + (dm[3] || "");
          }
        }
        if (url && url !== href) return url;
        return "";
      },
      // 获取上下页及目录页链接
      getPrevUrl: function() {
        let url = "", selector = this.info.prevSelector || this.info.prevUrl, noSection = this.info.noSection;
        if (selector === false) {
          this.prevUrl = url;
          return url;
        }
        let urlElement;
        if (selector) {
          if (typeof selector === "function") {
            try {
              urlElement = selector(this.$doc);
            } catch (e) {
            }
          } else {
            urlElement = this.$doc.find(selector);
          }
          url = this.checkLinks(urlElement);
        }
        if (!url) {
          urlElement = this.$doc.find(ParseDefaults.prevSelector);
          url = this.checkLinks(urlElement);
        }
        if (!noSection && url && urlElement && typeof urlElement !== "string") {
          let t = urlElement.text();
          if (url && !this.isSection && (t.includes("页") || t.includes("頁"))) {
            this.isSection = true;
          }
        }
        if (url) {
        } else {
        }
        this.prevUrl = url || "";
        return url;
      },
      checkNextUrl: function(url) {
        const sectionUrlRegex = /\/\d+([_-]\d+|\/\d)\.html?$/;
        if (url && this.info.checkSection) {
          if (!sectionUrlRegex.test(this.curPageUrl) && !sectionUrlRegex.test(this.prevUrl)) {
            this.isSection = false;
          } else if (sectionUrlRegex.test(this.curPageUrl)) {
            this.isSection = true;
          } else {
            this.isSection = false;
          }
        }
        let includeUrl = this.info.includeUrl || this.getIncludeUrl();
        if (!toRE(includeUrl).test(url))
          return false;
        switch (true) {
          case url === "":
            return false;
          case (this.info.exclude && toRE(this.info.exclude).test(url)):
            return false;
          case ParseDefaults.nextUrlIgnore.some(function(re) {
            return toRE(re).test(url);
          }):
            return false;
          case url === this.indexUrl:
            return false;
          case url === this.prevUrl:
            return false;
          case url === this.curPageUrl:
            return false;
          // 分页章节不能比较、第一章的上一页如果是目录页，也不能比较
          case (!this.isSection && this.prevUrl !== this.indexUrl && ParseDefaults.nextUrlCompare.test(this.prevUrl.split("?")[0]) && !ParseDefaults.nextUrlCompare.test(url.split("?")[0])):
            return false;
          default:
            return true;
        }
      },
      getIncludeUrl: function() {
        let includeUrl = this.info.url;
        if (!includeUrl && typeof appInfo !== "undefined") {
          let locationHref = location.href;
          appInfo.script.includes.some(function(includeStr) {
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
      checkLinks: function(links) {
        let selectedf = this;
        let url = "";
        if (!links) return "";
        if (typeof links === "string") {
          return this.getFullHref(links);
        }
        links && links.each(function() {
          url = XS(this).attr("href");
          if (!url || url.indexOf("#") === 0 || url.indexOf("javascript:") === 0)
            return;
          url = selectedf.getFullHref(this);
          return false;
        });
        return url;
      },
      getFullHref: function(href) {
        if (!href) return "";
        if (typeof href !== "string") {
          href = href.getAttribute("href") || "";
        }
        if (/^https?:\/\//.test(href)) {
          return href;
        }
        let a = this.a;
        if (!a) {
          this.a = a = document.createElement("a");
        }
        a.href = href.trim();
        return a.href;
      }
    };
    let tpl_mainCss = mainCss;
    let tpl_preferencesHTML = prefsHtml;
    let tpl_preferencesCSS = prefsCss;
    let Res = {
      CSS_MAIN: tpl_mainCss,
      preferencesHTML: tpl_preferencesHTML.replace(/\\n/g, "\n"),
      preferencesCSS: tpl_preferencesCSS
    };
    let UI = {
      fontStack: /Macintosh|Mac OS X/.test(navigator.userAgent) ? '-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Helvetica Neue", sans-serif' : '"Segoe UI Variable", "Segoe UI", "Microsoft YaHei", "微软雅黑", sans-serif',
      monoStack: /Macintosh|Mac OS X/.test(navigator.userAgent) ? '"SF Mono", Menlo, Consolas, monospace' : 'Consolas, "Courier New", monospace',
      skins: {},
      // 站点字体
      siteFontFamily: "",
      init: function() {
        UI.refreshMainStyle();
        UI.refreshSkinStyle(Setting.skin_name, true);
        UI.fixMobile();
        UI.$menu = XS("#menu");
        UI.$menuBar = XS("#menu-bar");
        UI.$content = XS("#xiaoshuo-reader-content");
        UI.hideMenuList(Setting.menu_list_hidden);
        document.addEventListener("click", function(e) {
          if (!UI.$menu || UI.$menu.length === 0) return;
          if (UI.menu_list_hidden) return;
          let t = e.target;
          if (t && t.closest && !t.closest("#menu") && !t.closest("#menu-bar")) {
            UI.hideMenuList(true);
          }
        }, true);
      },
      _sheetFor: function(id) {
        if (UI._sheets && UI._sheets[id]) return UI._sheets[id];
        let rec;
        if (document.adoptedStyleSheets && typeof CSSStyleSheet !== "undefined" && typeof CSSStyleSheet.prototype.replaceSync === "function") {
          rec = { sheet: new CSSStyleSheet() };
          document.adoptedStyleSheets.push(rec.sheet);
        } else {
          rec = { el: XS("<style>").appendTo("head") };
        }
        if (!UI._sheets) UI._sheets = {};
        UI._sheets[id] = rec;
        return rec;
      },
      _applySheet: function(id, css) {
        let rec = UI._sheetFor(id);
        if (rec.sheet) {
          try {
            rec.sheet.replaceSync(css);
          } catch (e) {
          }
        } else {
          rec.el.text(css);
        }
      },
      refreshMainStyle: function() {
        if (app.site.useSiteFont && app.siteFontInfo) {
          UI.siteFontFamily = app.siteFontInfo.siteFontFamily;
        }
        let mainCss = Res.CSS_MAIN.replace("{font_family}", UI.siteFontFamily + Setting.font_family).replace("{font_size}", UI.calcContentFontSize(Setting.font_size)).replace("{title_font_size}", UI.calcTitleFontSize(Setting.font_size)).replace("{content_width}", Setting.content_width).replace("{text_line_height}", Setting.text_line_height).replace("{paragraph_height}", Setting.paragraph_height).replace(/\{uiFont\}/g, UI.fontStack).replace(/\{monoFont\}/g, UI.monoStack);
        UI._applySheet("main", mainCss);
      },
      hideMenuList: function(hidden) {
        if (typeof hidden === "undefined") {
          hidden = !UI.menu_list_hidden;
        }
        if (!UI.$menu || !UI.$menu.length) {
          UI.menu_list_hidden = hidden;
          return;
        }
        if (hidden) {
          UI.$menu.addClass("hidden");
        } else {
          UI.$menu.removeClass("hidden");
        }
        UI.menu_list_hidden = hidden;
      },
      getSkinCss: function(skin_name) {
        let css = UI.skins[skin_name] || "";
        return css;
      },
      // 目录面板跟随皮肤（覆盖硬编码 #333 黑底）
      getMenuSkinCss: function(skin_name) {
        if (skin_name == "深色") {
          return "\n#menu{background:var(--panel-glass);border-right:1px solid rgba(255,255,255,.1);}\n#menu #header{color:#F5F5F7;border-bottom:1px solid rgba(255,255,255,.1);}\n#menu #header a{color:#9c9c9f;}\n#menu .chapter div{color:#F5F5F7;}\n#menu .chapter div:hover{background:rgba(255,255,255,.06);color:#F5F5F7;}\n#menu .chapter.active div{background:rgba(10,132,255,.22);color:#0A84FF;font-weight:600;}";
        }
        if (skin_name == "护眼") {
          return "\n#menu{background:var(--panel-glass);border-right:1px solid rgba(0,0,0,.08);}\n#menu #header{color:#263238;border-bottom:1px solid rgba(0,0,0,.08);}\n#menu #header a{color:#5b6e60;}\n#menu .chapter div{color:#263238;}\n#menu .chapter div:hover{background:rgba(0,0,0,.05);color:#263238;}\n#menu .chapter.active div{background:rgba(0,122,255,.12);color:#007AFF;font-weight:600;}";
        }
        if (skin_name == "自动") {
          return "\n@media (prefers-color-scheme: light){#menu{background:var(--panel-glass);border-right:1px solid rgba(0,0,0,.08);} #menu #header{color:#1D1D1F;border-bottom:1px solid rgba(0,0,0,.06);} #menu #header a{color:#888;} #menu .chapter div{color:#1D1D1F;} #menu .chapter div:hover{background:rgba(0,0,0,.05);color:#1D1D1F;} #menu .chapter.active div{background:rgba(0,122,255,.12);color:#007AFF;font-weight:600;}}\n@media (prefers-color-scheme: dark){#menu{background:var(--panel-glass);border-right:1px solid rgba(255,255,255,.1);} #menu #header{color:#C9C9C9;border-bottom:1px solid rgba(255,255,255,.1);} #menu #header a{color:#9c9c9f;} #menu .chapter div{color:#C9C9C9;} #menu .chapter div:hover{background:rgba(255,255,255,.06);color:#C9C9C9;} #menu .chapter.active div{background:rgba(10,132,255,.22);color:#0A84FF;font-weight:600;}}";
        }
        return "\n#menu{background:var(--panel-glass);border-right:1px solid rgba(0,0,0,.08);}\n#menu #header{color:#1D1D1F;border-bottom:1px solid rgba(0,0,0,.06);}\n#menu #header a{color:#888;}\n#menu .chapter div{color:#1D1D1F;}\n#menu .chapter div:hover{background:rgba(0,0,0,.05);color:#1D1D1F;}\n#menu .chapter.active div{background:rgba(0,122,255,.12);color:#007AFF;font-weight:600;}";
      },
      refreshSkinStyle: function(skin_name, isFirst) {
        skin_name = String(skin_name == null ? "" : skin_name);
        let skinCss = UI.getSkinCss(skin_name);
        skinCss += UI.getMenuSkinCss(skin_name);
        UI._applySheet("skin", skinCss);
        let isDarkSkin = skin_name == "深色" || skin_name == "自动" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        let panelGlass = "rgba(248,248,248,1)";
        if (isDarkSkin) {
          panelGlass = "rgba(44,44,46,1)";
        } else if (skin_name.indexOf("护眼") != -1) {
          panelGlass = "rgba(238,247,240,1)";
        }
        if (document.documentElement) {
          document.documentElement.style.setProperty("--panel-glass", panelGlass);
        }
        let cardColor, prefsBg;
        if (isDarkSkin) {
          cardColor = "rgba(44,44,46,.92)";
          prefsBg = "rgba(44,44,46,.92)";
        } else if (skin_name.indexOf("护眼") != -1) {
          cardColor = "rgba(238,247,240,.92)";
          prefsBg = "rgba(238,247,238,.92)";
        } else {
          cardColor = "rgba(245,245,247,.92)";
          prefsBg = "rgba(250,249,248,.92)";
        }
        if (document.documentElement) {
          document.documentElement.style.setProperty("--panel-card", cardColor);
          document.documentElement.style.setProperty("--prefs-bg", prefsBg);
        }
        let btnBg, btnBgHover, btnBorder, btnText;
        if (isDarkSkin) {
          btnBg = "rgba(255,255,255,0.18)";
          btnBgHover = "rgba(255,255,255,0.28)";
          btnBorder = "rgba(255,255,255,0.2)";
          btnText = "rgba(255,255,255,0.92)";
        } else {
          btnBg = "rgba(255,255,255,0.62)";
          btnBgHover = "rgba(255,255,255,0.78)";
          btnBorder = "rgba(0,0,0,0.08)";
          btnText = "rgba(60,60,67,0.92)";
        }
        if (document.documentElement) {
          document.documentElement.style.setProperty("--reader-btn-bg", btnBg);
          document.documentElement.style.setProperty("--reader-btn-bg-hover", btnBgHover);
          document.documentElement.style.setProperty("--reader-btn-border", btnBorder);
          document.documentElement.style.setProperty("--reader-btn-text", btnText);
        }
        if (UI.$prefs && UI.$prefs.find(".body").length) {
          let pb = UI.$prefs.find(".body")[0];
          if (isDarkSkin) {
            UI.$prefs.find(".body").addClass("prefs-dark").removeClass("prefs-eye");
          } else {
            UI.$prefs.find(".body").removeClass("prefs-dark");
            if (skin_name.indexOf("护眼") != -1) {
              UI.$prefs.find(".body").addClass("prefs-eye");
            } else {
              UI.$prefs.find(".body").removeClass("prefs-eye");
            }
          }
          pb.style.setProperty("--panel-card", cardColor);
          pb.style.setProperty("--prefs-bg", prefsBg);
        }
        if (skin_name == "自动" && window.matchMedia && !UI._autoSkinMedia) {
          UI._autoSkinMedia = window.matchMedia("(prefers-color-scheme: dark)");
          let _al = UI._autoSkinMedia;
          if (_al.addListener) {
            _al.addListener(function() {
              if (Setting.skin_name == "自动") UI.refreshSkinStyle("自动");
            });
          } else if (_al.addEventListener) {
            _al.addEventListener("change", function() {
              if (Setting.skin_name == "自动") UI.refreshSkinStyle("自动");
            });
          }
        }
      },
      showNoContentTip: function() {
        let $tip = XS('<div id="xs-notip">').css({
          position: "fixed",
          top: "70px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2147483646,
          background: "rgba(28,28,30,.82)",
          color: "#fff",
          WebkitBackdropFilter: "blur(14px) saturate(1.6)",
          backdropFilter: "blur(14px) saturate(1.6)",
          padding: "12px 20px",
          borderRadius: "12px",
          fontSize: "13px",
          fontFamily: '-apple-system, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif',
          boxShadow: "0 10px 30px rgba(0,0,0,.28), 0 1px 4px rgba(0,0,0,.15)",
          border: "1px solid rgba(255,255,255,.12)",
          lineHeight: "1.9",
          textAlign: "center",
          maxWidth: "520px"
        }).html('未检测到小说正文：<b>请打开小说的章节正文页</b>再进入阅读模式。<br><a id="xs-notip-retry" href="javascript:void(0)" style="color:#7ecb5f;margin-right:12px">尝试解析</a><a id="xs-notip-select" href="javascript:void(0)" style="color:#7ecb5f;margin-right:12px">选择正文</a><a id="xs-notip-close" href="javascript:void(0)" style="color:#98989d">知道了</a>').appendTo("body");
        XS("#xs-notip-retry").on("click", function() {
          $tip.remove();
          try {
            app.launch();
          } catch (e) {
          }
        });
        XS("#xs-notip-select").on("click", function() {
          $tip.remove();
          try {
            UI.selectContentGuide();
          } catch (e) {
          }
        });
        XS("#xs-notip-close").on("click", function() {
          $tip.remove();
        });
        window.setTimeout(function() {
          try {
            $tip.remove();
          } catch (e) {
          }
        }, 6e3);
      },
      // 首页/入口页启用站点后的轻提示。
      // 首页按设计不显示悬浮入口（避免在书城/榜单页上多一个无用按钮），但「点了启用什么都没发生」
      // 很容易被当成失效，这里给一次 4 秒自动消失的提示说明后续行为。
      showHomeEnabledTip: function() {
        try {
          XS("#xs-home-tip").remove();
        } catch (e) {
        }
        let $tip = XS('<div id="xs-home-tip">').css({
          position: "fixed",
          top: "70px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2147483646,
          background: "rgba(28,28,30,.82)",
          color: "#fff",
          WebkitBackdropFilter: "blur(14px) saturate(1.6)",
          backdropFilter: "blur(14px) saturate(1.6)",
          padding: "10px 18px",
          borderRadius: "12px",
          fontSize: "13px",
          fontFamily: '-apple-system, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif',
          boxShadow: "0 10px 30px rgba(0,0,0,.28), 0 1px 4px rgba(0,0,0,.15)",
          border: "1px solid rgba(255,255,255,.12)",
          lineHeight: "1.8",
          textAlign: "center",
          maxWidth: "520px"
        }).html("已启用本站：<b>打开章节页会自动进入阅读模式</b>").appendTo("body");
        window.setTimeout(function() {
          try {
            $tip.remove();
          } catch (e) {
          }
        }, 4e3);
      },
      showEnterReaderButton: function() {
        if (XS(".reader-enter-wrap").length) {
          try {
            if (app.onEnterReader) app.onEnterReader();
          } catch (e) {
          }
          return;
        }
        addStyle('            .reader-enter-wrap {                position: fixed;                right: 20px;                bottom: 20px;                /* 层级档位：面板 2147483647 > 通知/提示 2147483646 > 悬浮按钮 2147483645 */                z-index: 2147483645;            }            .reader-enter-main {                width: 54px;                height: 54px;                border-radius: 50%;                display: flex;                align-items: center;                justify-content: center;                background: var(--reader-btn-bg, rgba(255,255,255,0.62));                /* 玻璃配方与 #alert/#loading/首页提示条同一套：半透明底 + 磨砂 + 细描边 + 双层柔影 */                -webkit-backdrop-filter: blur(20px) saturate(1.8);                backdrop-filter: blur(20px) saturate(1.8);                border: 1px solid var(--reader-btn-border, rgba(0,0,0,0.08));                box-shadow: 0 6px 20px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06);                color: var(--reader-btn-text, rgba(60,60,67,0.92));                font-size: 11px;                font-weight: 500;                cursor: pointer;                transition: transform .15s ease, background .15s ease;                box-sizing: border-box;                user-select: none;                font-family: -apple-system, "SF Pro Text", "PingFang SC", sans-serif;                text-align: center;                line-height: 1.2;            }            .reader-enter-main:hover {                transform: scale(1.05);                background: var(--reader-btn-bg-hover, rgba(255,255,255,0.78));            }            .reader-enter-set {                position: absolute;                top: -5px;                right: -5px;                width: 22px;                height: 22px;                border-radius: 50%;                display: flex;                align-items: center;                justify-content: center;                background: var(--reader-btn-bg, rgba(255,255,255,0.62));                -webkit-backdrop-filter: blur(20px) saturate(1.8);                backdrop-filter: blur(20px) saturate(1.8);                border: 1px solid var(--reader-btn-border, rgba(0,0,0,0.08));                box-shadow: 0 2px 8px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06);                cursor: pointer;                transition: transform .15s ease, background .15s ease;                box-sizing: border-box;                user-select: none;            }            .reader-enter-set:hover {                transform: scale(1.1);                background: var(--reader-btn-bg-hover, rgba(255,255,255,0.78));            }            .reader-enter-set svg {                width: 12px;                height: 12px;                fill: var(--reader-btn-text, rgba(60,60,67,0.92));            }        ');
        function updateBtn() {
          let $wrap2 = XS(".reader-enter-wrap");
          if (!$wrap2.length) return;
          let inReader = !!(document.body && document.body.getAttribute && document.body.getAttribute("name") === "小说阅读助手");
          let siteMatched = !!(app.site && app.site.url);
          let $btn2 = $wrap2.find(".reader-enter-main");
          let $btnSet2 = $wrap2.find(".reader-enter-set");
          if (inReader) {
            $btn2.text("退出阅读").attr("title", "退出阅读模式");
            $btnSet2.css("display", "flex");
          } else if (siteMatched) {
            $btn2.text("阅读模式").attr("title", "进入阅读模式");
            $btnSet2.css("display", "none");
          } else {
            $btn2.text("尝试解析").attr("title", "尝试解析阅读模式");
            $btnSet2.css("display", "none");
          }
        }
        let $wrap = XS("<div>").addClass("reader-enter-wrap");
        let $btn = XS("<div>").addClass("reader-enter-main").text("阅读模式").on("mousedown", function(ev) {
          ev.preventDefault();
          ev.stopPropagation();
          let inReader = !!(document.body && document.body.getAttribute && document.body.getAttribute("name") === "小说阅读助手");
          let siteMatched = !!(app.site && app.site.url);
          if (inReader) {
            try {
              app.toggle && app.toggle();
            } catch (e) {
            }
          } else if (siteMatched) {
            try {
              app.launch();
            } catch (e) {
            }
          } else {
            try {
              app.launch();
            } catch (e) {
            }
          }
          setTimeout(updateBtn, 300);
        });
        let $btnSet = XS("<div>").addClass("reader-enter-set").attr("title", "阅读设置").html('<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.14,12.94a7.51,7.51,0,0,0,0-1.88l2.03-1.58a.49.49,0,0,0,.12-.61l-1.92-3.32a.48.48,0,0,0-.59-.22l-2.39.96a7.03,7.03,0,0,0-1.62-.94L14.4,2.81a.5.5,0,0,0-.5-.25H10.1a.5.5,0,0,0-.5.25L8.99,5.34a7.03,7.03,0,0,0-1.62.94L4.98,5.32a.48.48,0,0,0-.59.22L2.47,8.86A.49.49,0,0,0,2.59,9.47l2.03,1.58a7.51,7.51,0,0,0,0,1.88L2.59,14.46a.49.49,0,0,0-.12.61l1.92,3.32a.48.48,0,0,0,.59.22l2.39-.96a7.03,7.03,0,0,0,1.62.94l.36,2.53a.5.5,0,0,0,.5.25h3.8a.5.5,0,0,0,.5-.25l.36-2.53a7.03,7.03,0,0,0,1.62-.94l2.39.96a.48.48,0,0,0,.59-.22l1.92-3.32a.49.49,0,0,0-.12-.61ZM12,15.5A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>').on("mousedown", function(ev) {
          ev.preventDefault();
          ev.stopPropagation();
          try {
            UI.preferencesShow();
          } catch (e) {
          }
        }).css("display", "none");
        $wrap.append($btn).append($btnSet).appendTo("body");
        app.onEnterReader = updateBtn;
        app.onExitReader = updateBtn;
        updateBtn();
      },
      selectContentGuide: function() {
        if (app._selectingContent) return;
        app._selectingContent = true;
        let step = 1;
        let contentSelector = "";
        let nextSelector = "";
        let $tip = XS('<div id="xs-select-tip">').css({
          position: "fixed",
          top: "70px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2147483646,
          background: "rgba(28,28,30,.78)",
          color: "#fff",
          WebkitBackdropFilter: "blur(14px) saturate(1.6)",
          backdropFilter: "blur(14px) saturate(1.6)",
          padding: "10px 18px",
          borderRadius: "10px",
          fontSize: "13px",
          fontFamily: '-apple-system, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif',
          boxShadow: "0 10px 30px rgba(0,0,0,.28), 0 1px 4px rgba(0,0,0,.15)",
          border: "1px solid rgba(255,255,255,.12)",
          lineHeight: "1.8",
          textAlign: "center"
        }).appendTo("body");
        function genSelector(el) {
          let node = el;
          for (let i = 0; node && node.nodeType === 1 && i < 6; i++) {
            if (node.id) return "#" + node.id;
            if (node.className && typeof node.className === "string" && node.className.trim()) {
              return "." + node.className.trim().split(/\s+/)[0];
            }
            node = node.parentElement;
          }
          if (el && el.tagName) {
            let tag = el.tagName.toLowerCase();
            let parent = el.parentElement;
            let idx = parent ? Array.prototype.indexOf.call(parent.children, el) + 1 : 1;
            return tag + ":nth-child(" + idx + ")";
          }
          return "";
        }
        function updateTip() {
          if (step === 1) {
            $tip.html("已进入「选择正文」模式：请<b>点击页面中的正文区域</b>（按 <b>Esc</b> 取消）");
          } else {
            $tip.html("正文已选中：<code>" + contentSelector + '</code><br>如果页面有「下一页 / 下一章」链接或按钮，请<b>点击它</b>（用于自动翻页）<br><a id="xs-skip-next" href="javascript:void(0)" style="color:#7ecb5f">[没有，跳过]</a>　按 <b>Esc</b> 取消');
            $tip.find("#xs-skip-next").click(function(ev) {
              ev.preventDefault();
              ev.stopPropagation();
              finish();
            });
          }
        }
        function finish() {
          XS(document).off("click.xsSelect", clickHandler);
          XS(document).off("keydown.xsSelect", escHandler);
          $tip.remove();
          app._selectingContent = false;
          app.saveCurrentSiteRule(contentSelector, nextSelector);
          app.site = null;
          app.launch();
        }
        let clickHandler = function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          let target = e.target;
          if (!target || !target.nodeType || target.nodeType !== 1) target = target.parentElement;
          if (XS(target).closest("#xs-select-tip, .reader-enter-wrap, #reader-preferences").length) return;
          if (step === 1) {
            contentSelector = genSelector(target);
            if (!contentSelector) return;
            step = 2;
            updateTip();
          } else {
            let link = XS(target).closest("a,button,area")[0] || target;
            nextSelector = genSelector(link);
            if (!nextSelector) return;
            finish();
          }
        };
        let escHandler = function(ev) {
          if (ev.keyCode === 27) {
            XS(document).off("click.xsSelect", clickHandler);
            XS(document).off("keydown.xsSelect", escHandler);
            $tip.remove();
            app._selectingContent = false;
          }
        };
        updateTip();
        XS(document).on("click.xsSelect", clickHandler);
        XS(document).on("keydown.xsSelect", escHandler);
      },
      calcContentFontSize: function(fontSizeStr) {
        let _s = String(fontSizeStr == null ? "" : fontSizeStr);
        let m = _s.match(/([\d\.]+)(px|r?em|pt)/);
        if (m) {
          let size = m[1], type = m[2];
          return parseFloat(size) + type;
        }
        m = _s.match(/([\d\.]+)/);
        if (m) {
          return parseFloat(m[1]) + "px";
        }
        return "";
      },
      calcTitleFontSize: function(fontSizeStr) {
        let _s = String(fontSizeStr == null ? "" : fontSizeStr);
        let m = _s.match(/([\d\.]+)(px|r?em|pt)/);
        if (m) {
          let size = m[1], type = m[2];
          return parseFloat(size) * 1.8 + type;
        }
        m = _s.match(/([\d\.]+)/);
        if (m) {
          return parseFloat(m[1]) * 1.8 + "px";
        }
        return "";
      },
      fixMobile: function() {
        let meta = document.createElement("meta");
        meta.setAttribute("name", "viewport");
        meta.setAttribute("content", "width=device-width, initial-scale=1");
        document.head.appendChild(meta);
      },
      // 解码 unicode 转义（修复章节标题 \u7b2c\u4e00\u7ae0 这类残码）
      // 策略：能还原的一律还原成字符，只有「不完整的残码」才删除，避免误伤正常标题。
      decodeUnicodeStr: function(str) {
        if (typeof str !== "string") return str;
        let _tidy = function(s) {
          return s.replace(/^[\s\u00a0]+/, "").replace(/[\s\u00a0]+$/, "").replace(/[ \t]{2,}/g, " ");
        };
        if (str.indexOf("\\") < 0 && str.indexOf("&") < 0) return _tidy(str);
        try {
          let r = str;
          r = r.replace(/\\u([0-9a-fA-F]{4})/g, function(_m, hex) {
            let code = parseInt(hex, 16);
            if (isNaN(code) || code === 0) return "";
            return String.fromCharCode(code);
          });
          r = r.replace(/\\u[0-9a-fA-F]{0,3}(?![0-9a-fA-F])/g, "");
          let _ents = {
            nbsp: " ",
            amp: "&",
            lt: "<",
            gt: ">",
            quot: '"',
            apos: "'",
            ldquo: "“",
            rdquo: "”",
            lsquo: "‘",
            rsquo: "’",
            hellip: "…",
            mdash: "—",
            ndash: "–",
            middot: "·",
            emsp: " ",
            ensp: " ",
            thinsp: " "
          };
          r = r.replace(/&(#[0-9]{1,7}|#x[0-9a-fA-F]{1,6}|[a-zA-Z][a-zA-Z0-9]{1,9});/g, function(m, body) {
            if (body.charAt(0) === "#") {
              let code = body.charAt(1) === "x" || body.charAt(1) === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
              if (!isNaN(code) && code >= 32 && code <= 1114111) {
                try {
                  return String.fromCodePoint(code);
                } catch (e) {
                  return "";
                }
              }
              return "";
            }
            let key = body.toLowerCase();
            return Object.prototype.hasOwnProperty.call(_ents, key) ? _ents[key] : "";
          });
          r = r.replace(/&(nbsp|amp|lt|gt|quot|apos|emsp|ensp|thinsp)(?![a-zA-Z0-9])/gi, function(m, name) {
            return _ents[String(name).toLowerCase()] || "";
          });
          r = r.replace(/^[\s\u00a0\-&:;.]+/, "").replace(/[\s\u00a0]+$/, "");
          r = r.replace(/[ \t]{2,}/g, " ");
          return r;
        } catch (e) {
          return str;
        }
      },
      preferencesShow: function(event) {
        if (XS("#reader-preferences").length) {
          return;
        }
        UI.$prefs = XS('<div id="reader-preferences">').append(
          XS("<style>").text(Res.preferencesCSS.replace(/\{uiFont\}/g, UI.fontStack).replace(/\{monoFont\}/g, UI.monoStack))
        ).append(
          XS('<div class="body">').attr("style", UI._prefsPanelCssText()).html(Res.preferencesHTML)
        ).appendTo("body");
        let _isDark = Setting.skin_name == "深色" || Setting.skin_name == "自动" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (document.documentElement) {
          let _pg = _isDark ? "rgba(44,44,46,1)" : Setting.skin_name.indexOf("护眼") != -1 ? "rgba(238,247,240,1)" : "rgba(248,248,248,1)";
          document.documentElement.style.setProperty("--panel-glass", _pg);
        }
        if (_isDark) {
          UI.$prefs.find(".body").addClass("prefs-dark").removeClass("prefs-eye");
          let _pb = UI.$prefs.find(".body")[0];
          _pb.style.setProperty("--panel-card", "rgba(44,44,46,.92)");
          _pb.style.setProperty("--prefs-bg", "rgba(44,44,46,.92)");
        } else {
          UI.$prefs.find(".body").removeClass("prefs-dark");
          let _pb = UI.$prefs.find(".body")[0];
          if (Setting.skin_name.indexOf("护眼") != -1) {
            UI.$prefs.find(".body").addClass("prefs-eye");
            _pb.style.setProperty("--panel-card", "rgba(238,247,240,.92)");
            _pb.style.setProperty("--prefs-bg", "rgba(238,247,238,.92)");
          } else {
            UI.$prefs.find(".body").removeClass("prefs-eye");
            _pb.style.setProperty("--panel-card", "rgba(245,245,247,.92)");
            _pb.style.setProperty("--prefs-bg", "rgba(250,249,248,.92)");
          }
        }
        UI.preferencesLoadHandler();
        UI._enablePrefsDragResize();
        UI.$prefs.find(".prefs-body").scrollTop(0);
        UI.$prefs.find(".prefs-switch, .skin-item").on("mousedown.preventScroll", function(e) {
          e.preventDefault();
        });
        let pbEl = UI.$prefs.find(".prefs-body")[0];
        if (pbEl) {
          pbEl.addEventListener("focus", function(e) {
            let t = e.target;
            if (t && t.tagName === "INPUT" && (t.type === "checkbox" || t.type === "radio")) {
              e.preventDefault();
            }
          }, true);
        }
        if (pbEl) {
          pbEl.addEventListener("click", function(e) {
            let t = e.target;
            if (!t || !t.closest) return;
            let sw = t.closest(".prefs-switch");
            if (sw) {
              let cb = sw.querySelector("input[type=checkbox]");
              if (cb) {
                e.preventDefault();
                e.stopPropagation();
                cb.checked = !cb.checked;
                XS(cb).trigger("change");
                UI.preferencesClickHandler(cb);
              }
            }
          }, true);
        }
        UI.$prefs[0].classList.add("open");
        UI.$prefs.on("click", function(e) {
          if (e.target === this) {
            UI.preferencesCloseHandler();
          }
        });
      },
      hide: function() {
        if (UI.$prefs) UI.$prefs.remove();
        UI.$prefs = null;
      },
      // 5.1: 读取记忆的面板位置尺寸
      _prefsPanelCssText: function() {
        return "width:min(92vw,480px); min-width:320px; max-height:94vh; overflow:hidden; margin:auto; border-radius:16px;";
      },
      // 面板已固定（不可缩放/移动），仅保留阻止正文文本被拖拽选中
      _enablePrefsDragResize: function() {
        let $panel = UI.$prefs;
        if (!$panel || !$panel.length) return;
        let $body = $panel.find(".body");
        $body.on("dragstart.pre", function(e) {
          e.preventDefault();
        });
      },
      // ===== 站点规则：代码编辑器式排版 =====
      // 把紧凑 JSON 规整成「缩进对齐 + 每条规则之间空一行」，让每条站点规则一眼分开。
      // 解析失败时原样返回，绝不破坏用户已写内容。
      formatSiteinfoText: function(txt) {
        let src = (txt || "").trim();
        if (!src) return "";
        let rules;
        try {
          rules = JSON.parse(src);
        } catch (e) {
          return src;
        }
        if (!Array.isArray(rules)) return src;
        let blocks = rules.map(function(r) {
          return JSON.stringify(r, null, 2).split("\n").map(function(ln) {
            return "  " + ln;
          }).join("\n");
        });
        if (!blocks.length) return "[]";
        return "[\n" + blocks.join(",\n\n") + "\n]";
      },
      // 顶部计数：显示规则条数；JSON 无效时标红提示，便于发现写坏
      updateSiteinfoCount: function() {
        let $ta = XS("#custom_siteinfo"), $cnt = XS("#siteinfo-count");
        if (!$ta.length || !$cnt.length) return;
        let src = ($ta.get(0).value || "").trim();
        if (!src) {
          $cnt.text("0 条规则").css("color", "");
          return;
        }
        let rules;
        try {
          rules = JSON.parse(src);
        } catch (e) {
          rules = null;
        }
        if (!Array.isArray(rules)) {
          $cnt.text("JSON 格式有误，请检查").css("color", "#ff3b30");
          return;
        }
        $cnt.text(rules.length + " 条规则").css("color", "");
      },
      preferencesLoadHandler: function() {
        let $form = XS("#preferences");
        $form.find("#hide-menu-list").get(0).checked = Setting.menu_list_hidden;
        let _ff = Setting.font_family;
        let _ffMap = {
          "宋体,SimSun": '宋体,SimSun,"Songti SC",宋体-简',
          "楷体,楷体_GB2312": '楷体,楷体_GB2312,"Kaiti SC",楷体-简',
          "黑体,SimHei": '黑体,SimHei,"Heiti SC",黑体-简'
        };
        if (_ffMap[_ff]) _ff = _ffMap[_ff];
        let _isMac = /Macintosh|Mac OS X/.test(navigator.userAgent);
        $form.find("#font-family option[data-def]").each(function() {
          let _d = XS(this).attr("data-def");
          if (_d === "mac" && !_isMac || _d === "win" && _isMac) XS(this).remove();
        });
        let _$ff = $form.find("#font-family");
        if (!_$ff.find("option").filter(function() {
          return XS(this).attr("value") === _ff;
        }).length) {
          XS("<option>").attr("value", _ff).text("自定义字体").appendTo(_$ff);
        }
        _$ff.val(_ff);
        $form.find("#font-size").get(0).value = parseFloat(Setting.font_size) || 20;
        $form.find("#content_width").get(0).value = parseFloat(Setting.content_width) || 1e3;
        $form.find("#text_line_height").get(0).value = parseFloat(Setting.text_line_height) || 1.5;
        $form.find("#paragraph_height").get(0).value = parseFloat(Setting.paragraph_height) || 0.5;
        $form.find("#auto-scroll-speed").get(0).value = Setting.auto_scroll_speed;
        $form.find("#val-auto-scroll-speed").text(Setting.auto_scroll_speed + " px/s");
        let _csInfo = Setting.custom_siteinfo;
        let _csText = _csInfo === "[]" || _csInfo === "" || _csInfo === "null" ? "" : String(_csInfo);
        $form.find("#custom_siteinfo").get(0).value = UI.formatSiteinfoText(_csText);
        UI.updateSiteinfoCount();
        $form.find("#smart-next-page").get(0).checked = Setting.smart_next_page;
        $form.find("#preload-next-page").get(0).checked = Setting.preload_next_page;
        $form.find("#enable-content-optimize").get(0).checked = Setting.content_optimize;
        let $skin = $form.find("#skin");
        for (let key in UI.skins) {
          XS("<option>").text(key).appendTo($skin);
        }
        $skin.val(Setting.skin_name).change(function() {
          let key = XS(this).find("option:selected").text();
          UI.refreshSkinStyle(key);
          Setting.skin_name = key;
          $form.find(".skin-item").removeClass("selected");
          $form.find('.skin-item[data-skin="' + key + '"]').addClass("selected");
        });
        $form.find(".skin-item").click(function() {
          let key = XS(this).attr("data-skin");
          $form.find("#skin").val(key).trigger("change");
        });
        $form.find(".skin-item").removeClass("selected");
        $form.find('.skin-item[data-skin="' + Setting.skin_name + '"]').addClass("selected");
        let preview = (function() {
          let _t = null;
          function _orig() {
            switch (this.id) {
              case "font-size":
                let contentFontSize = UI.calcContentFontSize(this.value);
                let titleFontSize = UI.calcTitleFontSize(this.value);
                if (titleFontSize) {
                  UI.$content.css("font-size", contentFontSize);
                  UI.$content.find("h1").css("font-size", titleFontSize);
                }
                break;
              case "font-family":
                UI.$content.css("font-family", UI.siteFontFamily + this.value);
                break;
              case "content_width":
                UI.$content.css("width", this.value + "px");
                break;
              case "text_line_height":
                UI.$content.css("line-height", this.value);
                break;
              case "paragraph_height":
                XS(app.curFocusElement).find("p").css("margin", this.value + "em 0");
                break;
            }
          }
          return function() {
            let _s = this, _a = arguments;
            clearTimeout(_t);
            _t = setTimeout(function() {
              _orig.apply(_s, _a);
            }, 300);
          };
        })();
        $form.on("input", "input", preview);
        $form.find("input[type=range]").each(function() {
          let $val = $form.find("#val-" + this.id);
          if (!$val.length) return;
          let selectedf = this;
          let upd = function() {
            let v = selectedf.value;
            if (selectedf.id === "paragraph_height") $val.text(v + "em");
            else if (selectedf.id === "content_width") $val.text(v + "px");
            else if (selectedf.id === "text_line_height") $val.text(v);
            else if (selectedf.id === "auto-scroll-speed") $val.text(v + " px/s");
            else $val.text(v + "px");
            let _min = parseFloat(selectedf.min) || 0, _max = parseFloat(selectedf.max) || 100;
            let _pct = (v - _min) / (_max - _min) * 100;
            if (_pct < 0) _pct = 0;
            if (_pct > 100) _pct = 100;
            selectedf.style.setProperty("--val", _pct + "%");
          };
          upd();
          XS(this).on("input", upd);
        });
        $form.find("#font-family").on("change", function() {
          UI.$content.css("font-family", UI.siteFontFamily + this.value);
        });
        $form.find("#openPreferencesKey").text(Setting.open_preferences_key);
        $form.find("#setHideMenuListKey").text(Setting.hide_menu_list_key);
        $form.on("click", "input:checkbox, input:button, button", function(event) {
          UI.preferencesClickHandler(event.target);
        });
        let _applyTimer = null;
        let _scheduleApply = function() {
          clearTimeout(_applyTimer);
          _applyTimer = setTimeout(function() {
            UI.preferencesSaveHandler();
          }, 60);
        };
        $form.on("change", "input, select, textarea", _scheduleApply);
        $form.on("input", "input[type=range]", _scheduleApply);
        $form.on("input", "#custom_siteinfo", function() {
          UI.updateSiteinfoCount();
        });
      },
      cleanPreview: function() {
        UI.$content.find("h1").css("font-size", "");
      },
      preferencesClickHandler: async function(target) {
        let key;
        switch (target.id) {
          case "reset-config":
            UI.resetConfig();
            break;
          case "hide-menu-list":
            UI.hideMenuList(target.checked);
            break;
          case "export-config":
            UI.exportConfig();
            break;
          case "import-config":
            UI.importConfig();
            break;
          case "format-siteinfo": {
            let $ta = XS("#custom_siteinfo");
            if (!$ta.length) break;
            let fmt = UI.formatSiteinfoText($ta.get(0).value);
            $ta.get(0).value = fmt;
            UI.updateSiteinfoCount();
            XS($ta.get(0)).trigger("change");
            UI.notice(fmt ? "排版已整理" : "暂无规则可整理");
            break;
          }
          case "copy-siteinfo": {
            let $ta2 = XS("#custom_siteinfo");
            if (!$ta2.length) break;
            let txt = $ta2.get(0).value || "";
            if (!txt) {
              UI.notice("没有内容可复制");
              break;
            }
            try {
              navigator.clipboard.writeText(txt).then(function() {
                UI.notice("规则已复制到剪贴板");
              }, function() {
                UI.copySiteinfoFallback(txt);
              });
            } catch (e) {
              UI.copySiteinfoFallback(txt);
            }
            break;
          }
          case "openPreferencesKey":
            key = prompt("请输入打开设置的快捷键：", Setting.open_preferences_key);
            if (key) {
              if (UI.keyConflict("openPreferencesKey", key)) {
                UI.notice("按键冲突：该键已被其他功能使用");
                break;
              }
              Setting.open_preferences_key = key;
              XS(target).text(key);
            }
            break;
          case "setHideMenuListKey":
            key = prompt("请输入切换左侧章节列表的快捷键：", Setting.hide_menu_list_key);
            if (key) {
              if (UI.keyConflict("setHideMenuListKey", key)) {
                UI.notice("按键冲突：该键已被其他功能使用");
                break;
              }
              Setting.hide_menu_list_key = key;
              XS(target).text(key);
            }
            break;
        }
      },
      // 复制兜底：navigator.clipboard 不可用（非安全上下文/旧内核）时用 textarea + execCommand
      copySiteinfoFallback: function(txt) {
        try {
          let ta = document.createElement("textarea");
          ta.value = txt;
          ta.style.cssText = "position:fixed;left:-9999px;top:0";
          document.body.appendChild(ta);
          ta.select();
          let ok = document.execCommand("copy");
          document.body.removeChild(ta);
          UI.notice(ok ? "规则已复制到剪贴板" : "复制失败，请手动全选复制");
        } catch (e) {
          UI.notice("复制失败，请手动全选复制");
        }
      },
      // 检测快捷键冲突：key 是否已被其他固定功能或另一个自定义键占用
      keyConflict: function(curId, key) {
        if (!key) return false;
        key = String(key).trim().toLowerCase();
        let fixedKeys = ["enter", "left", "right", "esc", ",", ".", "[", "]"];
        if (fixedKeys.indexOf(key) !== -1) return true;
        let other = curId === "openPreferencesKey" ? Setting.hide_menu_list_key : Setting.open_preferences_key;
        if (other && String(other).trim().toLowerCase() === key) return true;
        return false;
      },
      // 导出/导入白名单：只包含真正的用户数据（阅读设置、站点规则）。站点白名单已移除。
      // 排除日志(xs_logs)等内部/历史残留 key，避免备份文件混入调试数据。
      _exportKeys: [
        "auto_scroll_speed",
        "remain_height",
        "font_family",
        "font_size",
        "text_line_height",
        "paragraph_height",
        "content_width",
        "skin_name",
        "menu_list_hidden",
        "hide_menu_list_key",
        "open_preferences_key",
        "content_optimize",
        "smart_next_page",
        "preload_next_page",
        "custom_siteinfo"
      ],
      exportConfig: function() {
        let data = { app: "小说阅读助手", export_version: "1.4", exportDataType: "full", config: {} };
        UI._exportKeys.forEach(function(key) {
          let val = Store.get(key);
          if (val !== undefined && val !== null) data.config[key] = val;
        });
        let json = JSON.stringify(data, null, 2);
        try {
          let blob = new Blob([json], { type: "application/json" });
          let url = URL.createObjectURL(blob);
          let a = document.createElement("a");
          a.href = url;
          a.download = "小说阅读助手-data-" + (new Date()).toISOString().slice(0, 10) + ".json";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function() {
            URL.revokeObjectURL(url);
          }, 1e3);
        } catch (e) {
          UI.notice("导出失败，请使用较新浏览器");
          return;
        }
        UI.notice("<b>数据已导出</b>（设置、站点规则）");
      },
      importConfig: function() {
        let input = document.createElement("input");
        input.type = "file";
        input.accept = ".json,application/json";
        input.onchange = function() {
          let file = input.files && input.files[0];
          if (!file) return;
          let reader = new FileReader();
          reader.onerror = function() {
            UI.notice("读取备份文件失败", 2e3);
          };
          reader.onload = function() {
            UI.doImport(reader.result);
          };
          reader.readAsText(file);
        };
        input.click();
      },
      doImport: function(jsonText) {
        let data;
        try {
          data = JSON.parse(jsonText);
        } catch (e) {
          UI.notice("导入失败：不是有效的JSON");
          return;
        }
        if (!data || data.app !== "小说阅读助手" && data.app !== "MyNovelReader" && data.app !== "小说阅读器" || !data.config) {
          UI.notice("导入失败：不是本脚本的备份文件");
          return;
        }
        if (!data.export_version) {
          if (!confirm("此备份文件无版本号，可能来自旧版脚本，仍要继续导入吗？")) return;
        }
        if (data.exportDataType === "full" && !confirm("导入完整备份将覆盖本机全部数据，确定继续吗？")) return;
        Object.keys(data.config).forEach(function(key) {
          if (UI._exportKeys.indexOf(key) === -1) return;
          Store.set(key, data.config[key]);
        });
        UI.notice("数据导入成功（设置、站点规则），刷新页面生效");
        setTimeout(function() {
          location.reload();
        }, 1200);
      },
      resetConfig: function() {
        if (!confirm("确定恢复全部设置为默认值吗？（站点设置会保留）")) return;
        let _keep = ["custom_siteinfo", "enabled_sites", "page_whitelist", "custom_page_blacklist"];
        let keys = Store.list();
        keys.forEach(function(key) {
          if (_keep.indexOf(key) !== -1) return;
          Store.remove(key);
        });
        UI.notice("<b>已恢复默认设置</b>（站点设置已保留），即将刷新页面生效");
        setTimeout(function() {
          location.reload();
        }, 1200);
      },
      preferencesCloseHandler: function() {
        try {
          UI.preferencesSaveHandler();
        } catch (ex) {
        }
        try {
          UI.cleanPreview();
        } catch (ex) {
        }
        UI.hide();
      },
      preferencesSaveHandler: function() {
        let $form = XS("#preferences");
        if (!$form || $form.length === 0) return;
        let _val = function(id, def) {
          let el = $form.find(id).get(0);
          return el ? el.value : def;
        };
        let _chk = function(id) {
          let el = $form.find(id).get(0);
          return el ? !!el.checked : false;
        };
        let _skin = $form.find("#skin").get(0);
        let skinName = _skin ? $form.find("#skin").find("option:selected").text() : "";
        Setting.skin_name = skinName;
        UI.refreshSkinStyle(skinName);
        Setting.font_family = _val("#font-family", Setting.font_family);
        UI.refreshMainStyle();
        Setting.font_size = _val("#font-size", Setting.font_size);
        Setting.text_line_height = _val("#text_line_height", Setting.text_line_height);
        Setting.paragraph_height = (_val("#paragraph_height", "") || "1") + "em";
        Setting.content_width = (_val("#content_width", "") || "") + "px";
        Setting.auto_scroll_speed = _val("#auto-scroll-speed", Setting.auto_scroll_speed);
        if (app.autoScrolling) {
          app.stopAutoScroll();
          app.startAutoScroll();
        }
        Setting.menu_list_hidden = _chk("#hide-menu-list");
        UI.hideMenuList(Setting.menu_list_hidden);
        let _csInfoVal = (_val("#custom_siteinfo", "") || "").trim();
        Setting.custom_siteinfo = _csInfoVal && _csInfoVal !== "[]" ? _csInfoVal : "[]";
        Setting.smart_next_page = _chk("#smart-next-page");
        Setting.preload_next_page = _chk("#preload-next-page");
        let _oldOpt = Setting.content_optimize;
        Setting.content_optimize = _chk("#enable-content-optimize");
        if (Setting.content_optimize !== _oldOpt) {
          UI.reapplyContentClean();
        }
        UI.cleanPreview();
        UI.refreshMainStyle();
        Store.set("font_family", Setting.font_family);
        Store.set("font_size", Setting.font_size);
        Store.set("text_line_height", Setting.text_line_height);
        Store.set("paragraph_height", Setting.paragraph_height);
        Store.set("content_width", Setting.content_width);
        Store.set("auto_scroll_speed", Setting.auto_scroll_speed);
        Store.set("skin_name", Setting.skin_name);
        Store.set("menu_list_hidden", Setting.menu_list_hidden);
        Store.set("custom_siteinfo", Setting.custom_siteinfo);
        Store.set("smart_next_page", Setting.smart_next_page);
        Store.set("preload_next_page", Setting.preload_next_page);
        Store.set("content_optimize", Setting.content_optimize);
      },
      // 切「正文内容优化」开关后，遍历所有已加载章节，用每章缓存的原始正文按当前开关状态重建，无需刷新
      // 开关可逆：关闭优化即恢复原排版，打开即重新应用；净化始终执行
      reapplyContentClean: function() {
        let $content = app.$content;
        if (!$content || $content.length <= 0) {
          return;
        }
        let curHost = app._curPageHost || getUrlHost(app.curPageUrl || location.href);
        let fullReplace = function(t, map) {
          for (let k in map) {
            t = t.replace(toRE(k), map[k]);
          }
          return t;
        };
        let normOn = true, optOn = Setting.content_optimize;
        let applied = 0, skipped = 0, removedTotal = 0;
        let articles = $content.find("article[id^=page-]");
        articles.each(function(i, el) {
          let $el = XS(el);
          if ($el.attr("data-section")) {
            skipped++;
            return;
          }
          let pageN = (el.id || "").replace(/^page-/, "");
          let parser = app._parserByPage[pageN];
          let raw = parser && parser._rawHTML;
          if (!raw) return;
          let $div = XS(raw);
          applyDomClean($div, parser._curInfo || null);
          let content = cleanHTML($div[0]);
          let processed = applyContentSettings(content, curHost || "", fullReplace);
          let rawLines = content.split("\n").filter(function(l) {
            return l.trim();
          });
          let proLines = processed.split("\n").filter(function(l) {
            return l.trim();
          });
          let rawSet = {}, proSet = {};
          rawLines.forEach(function(l) {
            rawSet[l] = (rawSet[l] || 0) + 1;
          });
          proLines.forEach(function(l) {
            proSet[l] = (proSet[l] || 0) + 1;
          });
          Object.keys(rawSet).forEach(function(l) {
            let d = (rawSet[l] || 0) - (proSet[l] || 0);
            if (d > 0) removedTotal += d;
          });
          let newHtml = renderHTML(processed);
          let $target = $el.find(".content");
          if ($target.length) {
            $target.replaceWith(newHtml);
            applied++;
          }
        });
        if (normOn || optOn) {
          let msg = "正文处理已应用：" + applied + " 章";
          if (skipped > 0) msg += "（" + skipped + " 章为多页拼接，跳过）";
          if (normOn) msg += "，去杂质移除 " + removedTotal + " 行";
          if (optOn) msg += (msg.indexOf("，") !== -1 ? "" : "，") + "优化已生效";
          UI.notice(msg, 2200);
        }
      },
      notice: function(htmlText, ms) {
        let $noticeDiv = XS("#alert");
        if (!ms) {
          ms = 1666;
        }
        clearTimeout(UI.noticeDivto);
        $noticeDiv.find("p").html(htmlText);
        $noticeDiv.fadeIn("fast");
        UI.noticeDivto = setTimeout(function() {
          $noticeDiv.fadeOut(500);
        }, ms);
        return $noticeDiv;
      }
    };
    UI.skins["浅色"] = "body { color: #1D1D1F; background-color: #FAF9F8; } #alert { background: rgba(255,255,255,.78); color:#1D1D1F; border-color:rgba(0,0,0,.1); } #loading { background: rgba(255,255,255,.78); color:#1D1D1F; border-color:rgba(0,0,0,.1); }";
    UI.skins["深色"] = "body { color: #F5F5F7; background-color: #1E1E1E; } #xiaoshuo-reader-content { color: #F5F5F7; } .title { color: #8ab4f8; } body a { color: #8ab4f8; } ::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,.3) !important; } #alert { background: rgba(28,28,30,.78); color:#F5F5F7; border-color:rgba(255,255,255,.1); } #loading { background: rgba(28,28,30,.78); color:#F5F5F7; border-color:rgba(255,255,255,.1); }";
    UI.skins["护眼"] = "body { color: #263238; background-color: #E8F5E9; } #alert { background: rgba(232,245,233,.85); color:#263238; border-color:rgba(0,0,0,.08); } #loading { background: rgba(232,245,233,.85); color:#263238; border-color:rgba(0,0,0,.08); }";
    UI.skins["自动"] = "@media (prefers-color-scheme: light){ body { color: #1D1D1F; background-color: #FAF9F8; } #alert { background: rgba(255,255,255,.78); color:#1D1D1F; border-color:rgba(0,0,0,.1); } #loading { background: rgba(255,255,255,.78); color:#1D1D1F; border-color:rgba(0,0,0,.1); } } @media (prefers-color-scheme: dark){ body { color: #C9C9C9; background-color: #1E1E1E; } #xiaoshuo-reader-content { color: #C9C9C9; } .title { color: #8ab4f8; } body a { color: #8ab4f8; } ::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,.3) !important; } #alert { background: rgba(28,28,30,.78); color:#C9C9C9; border-color:rgba(255,255,255,.1); } #loading { background: rgba(28,28,30,.78); color:#C9C9C9; border-color:rgba(255,255,255,.1); } }";
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
    const clenaupEventArray = [];
    if (window.name === "xiaoshuo-reader-iframe") {
      const _addEventListener2 = EventTarget.prototype.addEventListener;
      const addEventListenerProxy = new Proxy(_addEventListener2, {
        apply(target, thisArg, argumentsList) {
          Reflect.apply(target, thisArg, argumentsList);
          clenaupEventArray.push(() => {
            try {
              thisArg.removeEventListener(...argumentsList);
            } catch (e) {
            }
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
              _disconnect.apply(thisArg, argumentsList);
            } catch (e) {
            }
          });
        }
      });
      MutationObserver$1.prototype.observe = observeProxy;
    }
    function cleanupEvents() {
      let func;
      while (func = clenaupEventArray.pop()) func();
      try {
        XS(window).off();
        XS(document).off();
      } catch (e) {
      }
    }
    Object$1.defineProperty(Navigator.prototype, "platform", {
      get: function platform() {
        return "";
      }
    });
    console$1.clear = () => {
    };
    const RequestStatus = {
      Idle: 0,
      Loading: 1,
      Finish: 2,
      Fail: 3
    };
    class BaseRequest {
      /**@param { import("../typings/小说阅读助手").SiteConfig } siteInfo */
      constructor(siteInfo) {
        this.errorHandle = () => {
        };
        this.finishHandle = () => {
        };
        this.siteInfo = siteInfo;
      }
      setErrorHandle(func) {
        this.errorHandle = func;
      }
      setFinishHandle(func) {
        this.finishHandle = func;
      }
    }
    class HttpRequest extends BaseRequest {
      constructor(siteInfo) {
        super(siteInfo);
        this.status = RequestStatus.Idle;
        this.doc = null;
      }
      async send(url, referer) {
        this.status = RequestStatus.Loading;
        this.doc = null;
        let tk = this._sendToken = (this._sendToken || 0) + 1;
        const options = {
          url,
          method: "GET",
          overrideMimeType: "text/html;charset=" + document.characterSet,
          timeout: config.xhr_time,
          headers: {}
        };
        if (referer) {
          options.headers = { Referer: referer };
        }
        let retry = 3;
        let error = null;
        while (retry--) {
          try {
            const res = await Request(options);
            if (tk !== this._sendToken) return this.doc;
            this.doc = parseHTML(res.responseText);
            this.lastStatus = res.status;
            this.lastFinalUrl = res.finalUrl;
            this.rawLen = (res.responseText || "").length;
            this.rawHead = (res.responseText || "").replace(/\s+/g, " ").slice(0, 200);
            this.status = RequestStatus.Finish;
            this.finishHandle();
            break;
          } catch (e) {
            error = e;
          }
        }
        if (!this.doc) {
          this.status = RequestStatus.Fail;
          this.errorHandle();
        }
        return this.doc;
      }
      getDocument() {
        this.status = RequestStatus.Idle;
        return this.doc;
      }
      hide() {
      }
      show() {
      }
    }
    class IframeRequest extends BaseRequest {
      constructor(siteInfo) {
        super(siteInfo);
        this.status = RequestStatus.Idle;
        this.iframe = null;
        this.doc = null;
        this.win = null;
        this._onloaded = false;
      }
      get display() {
        return this.iframe && !this.iframe.style.display;
      }
      async send(url) {
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
        this._loadToken = (this._loadToken || 0) + 1;
        const src = url + "#xiaoshuo-reader";
        if (this.iframe.src === src) {
          this.iframe.setAttribute("src", "about:blank");
          await sleep(100);
          this.iframe.setAttribute("src", src);
        } else {
          this.iframe.setAttribute("src", src);
        }
        return new Promise((resolve) => this.resolve = resolve);
      }
      async loaded() {
        let myToken = this._loadToken || 0;
        this.doc = this.iframe.contentDocument;
        this.win = this.iframe.contentWindow;
        if (!this.doc) {
          this._loadFail = (this._loadFail || 0) + 1;
          if (this._loadFail <= 1 && this._curUrl) {
            this.hide();
            if (this.iframe) {
              this.iframe.remove();
              this.iframe = null;
            }
            this.status = RequestStatus.Idle;
            this.send(this._curUrl);
            return;
          }
          this.status = RequestStatus.Fail;
          this.hide();
          this.errorHandle();
          this.resolve(null);
          return;
        }
        this._onloaded = true;
        this.win.dispatchEvent(new WheelEvent("mousewheel", { deltaY: -100 }));
        this.win.scrollTo(0, this.doc.body.scrollHeight - this.win.innerHeight * 2);
        if (this.siteInfo.startLaunch) {
          this.siteInfo.startLaunch(XS(this.doc));
        }
        if (this.siteInfo.contentSelector) {
          let cs = this.siteInfo.contentSelector;
          let need = this.siteInfo.waitContentText || 200;
          let dl = Date.now() + (this.siteInfo.waitTimeout || 12e3);
          while (Date.now() < dl) {
            if (myToken !== this._loadToken) return;
            let ce = this.doc.querySelector(cs);
            let cl = ce ? ce.textContent.replace(/\s+/g, "") : "";
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
        return this.doc;
      }
      hide() {
        this.iframe.style.display = "none";
      }
      show() {
        this.iframe.style.display = "";
      }
    }
    function createIframe(onload, { iframeSandbox, withReferer }) {
      const iframe = document.createElement("iframe");
      iframe.name = "xiaoshuo-reader-iframe";
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
        iframe.referrerPolicy = "no-referrer";
      }
      if (iframeSandbox !== undefined) {
        iframe.sandbox = iframeSandbox;
      }
      document.body.appendChild(iframe);
      iframe.onload = onload;
      return iframe;
    }
    let app = {
      isEnabled: false,
      parsedPages: {},
      pageNum: 1,
      paused: false,
      curPageUrl: location.href,
      requestUrl: null,
      lastRequestUrl: null,
      // 当前正在看的章节原始 URL（滚动同步时写入）；退出阅读模式用它兜底跳转
      _currentExitUrl: "",
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
      _reqRetryCount: 0,
      // 翻页超时静默重试计数（成功或降级时清零）
      // [全量重应用] 章节缓存：pageNum → Parser 实例（其 _rawHTML/_curInfo 供切优化开关时整章重建）
      _parserByPage: {},
      // ===== [v3.0] 按站点启用 + 黑白名单 =====
      // 内置硬黑名单：URL 特征（登录/后台/视频/支付/后台/空白页等），命中即拦截，不展示阅读按钮。
      // 用户不可删（仅能通过"页面白名单"绕过）。
      _builtinBlacklist: [
        "/login",
        "/signin",
        "/register",
        "/password",
        "/logout",
        "/admin",
        "/manage",
        "/backend",
        "/console",
        "/dashboard",
        "/wp-admin",
        "/video",
        "/play",
        "/gallery",
        "/picture",
        "/photo",
        "/pay",
        "/checkout",
        "/cart",
        "/order",
        "/member",
        "/account",
        "/vip",
        "/download",
        "/search",
        "/about",
        "/help",
        "/terms",
        "/privacy",
        "/contact",
        "/setting",
        "/settings",
        "/edit",
        "/upload",
        "/mail",
        "/tag",
        "/category",
        "/forum",
        "/bbs",
        "/reply",
        "/comment"
      ],
      // 域名启用列表（持久化）：用户在 popup/油猴菜单开启的域名；未开启域名直接休眠
      getEnabledSites: function() {
        try {
          let v = Store.get("enabled_sites");
          return Array.isArray(v) ? v : [];
        } catch (e) {
          return [];
        }
      },
      // 纯域名根路径（首页/目录入口）：这类页面不显示「阅读模式」悬浮入口，也不自动进入。
      isHomePath: function() {
        let p2 = location.pathname || "/";
        return p2 === "/" || p2 === "/index.html" || p2 === "/index.htm" || p2 === "/home" || p2 === "/main";
      },
      // 域名覆盖判断：t 为已启用域名，h 为当前域名。父域名启用对子域名生效（qidian.com → www.qidian.com）
      _hostCoveredBy: function(h, t) {
        return t === h || !!t && h.length > t.length && h.slice(-(t.length + 1)) === "." + t;
      },
      isSiteEnabled: function(hostname) {
        let list = this.getEnabledSites();
        let h = String(hostname || "").toLowerCase();
        let self = this;
        return list.some(function(x) {
          return self._hostCoveredBy(h, String(x || "").toLowerCase());
        });
      },
      setSiteEnabled: function(hostname, enabled) {
        let list = this.getEnabledSites();
        let h = String(hostname || "").toLowerCase();
        let self = this;
        if (enabled) {
          let covered = list.some(function(x) {
            return self._hostCoveredBy(h, String(x || "").toLowerCase());
          });
          if (!covered) list.push(h);
        } else {
          list = list.filter(function(x) {
            return !self._hostCoveredBy(h, String(x || "").toLowerCase());
          });
        }
        Store.set("enabled_sites", list);
      },
      // 页面白名单（仅用户自定义，URL 粒度）：放行通行证，命中则跳过所有黑名单校验
      isPageWhitelisted: function() {
        try {
          let list = Store.get("page_whitelist");
          if (!Array.isArray(list)) return false;
          let href = location.href;
          return list.some(function(w) {
            return href.indexOf(String(w)) !== -1;
          });
        } catch (e) {
          return false;
        }
      },
      // 页面黑名单（内置硬黑名单 + 用户自定义，合并一层）：命中则拦截，不展示阅读按钮
      isPageBlacklisted: function() {
        let href = (location.href || "").toLowerCase();
        try {
          for (let i = 0; i < this._builtinBlacklist.length; i++) {
            if (href.indexOf(this._builtinBlacklist[i]) !== -1) return true;
          }
          let list = Store.get("custom_page_blacklist");
          if (Array.isArray(list)) {
            for (let i = 0; i < list.length; i++) {
              if (href.indexOf(String(list[i]).toLowerCase()) !== -1) return true;
            }
          }
        } catch (e) {
        }
        return false;
      },
      // 判断当前页面在"域名已启用"前提下是否放行（白名单跳过黑名单）
      isCurrentPageAllowed: function() {
        let hostname = location.hostname || "";
        if (!this.isSiteEnabled(hostname)) return false;
        if (this.isPageWhitelisted()) return true;
        return !this.isPageBlacklisted();
      },
      // [v3.0] 油猴 GM 菜单：按站点启用/关闭（仅油猴环境存在 GM_registerMenuCommand）
      registerUserscriptMenu: function() {
        let g = typeof GM_registerMenuCommand !== "undefined" ? GM_registerMenuCommand : null;
        if (!g) return;
        try {
          let hostname = location.hostname || "";
          g("在此网站启用阅读助手", function() {
            app.setSiteEnabled(hostname, true);
            try {
              app.site = app.getCurSiteInfo();
              XS(".reader-enter-wrap").remove();
              if (app.isCurrentPageAllowed()) {
                UI.showEnterReaderButton();
              }
            } catch (e) {
            }
          });
          g("在此网站关闭阅读助手", function() {
            app.setSiteEnabled(hostname, false);
            try {
              XS(".reader-enter-wrap").remove();
            } catch (e) {
            }
            let _inReader = !!(document.body && document.body.getAttribute && document.body.getAttribute("name") === "小说阅读助手");
            if (_inReader) {
              try {
                app.exitReadingMode();
              } catch (e) {
              }
            }
          });
        } catch (e) {
        }
      },
      init: async function() {
        if (["xiaoshuo-reader-iframe", "superpreloader-iframe"].indexOf(window.name) != -1) {
          return;
        }
        if (location.href.indexOf("#xiaoshuo-reader") > -1) {
          history.replaceState({}, "", location.href.replace("#xiaoshuo-reader", ""));
          return;
        }
        let parent = window;
        let nestCount = 0;
        while (parent !== window.top) {
          nestCount++;
          parent = parent.parent;
        }
        if (nestCount > 2) {
          return;
        }
        let readx = app.launch;
        try {
          exportFunction(readx, window, { defineAs: "readx" });
        } catch (ex) {
        }
        app.loadCustomSetting();
        app.site = app.getCurSiteInfo();
        if (!app.site.fastboot) {
          await DOMContentLoaded();
        }
        if (app.site.startLaunch) {
          try {
            app.site.startLaunch(XS(document));
          } catch (e) {
          }
        }
        if (!app.site.fastboot) {
          await domMutation();
        }
        let _isHome = app.isHomePath();
        let _autoEntered = false;
        if (!_isHome) {
          try {
            _autoEntered = await app.autoEnterReader();
          } catch (e) {
          }
        }
        if (!_autoEntered && !_isHome) {
          UI.showEnterReaderButton();
        }
      },
      // 已启用站点：打开页面直接进入阅读模式。
      // 返回 true 表示已经接管页面；false 表示按原样保留（调用方补悬浮入口）。
      autoEnterReader: async function() {
        if (!app.isCurrentPageAllowed()) return false;
        if (app.isHomePath()) return false;
        try {
          if (sessionStorage.getItem("xs_skip_auto_enter")) {
            sessionStorage.removeItem("xs_skip_auto_enter");
            return false;
          }
        } catch (e) {
        }
        if (!app.site) {
          app.site = app.getCurSiteInfo();
        }
        let _parser = null;
        let _has = false;
        try {
          _parser = new Parser(app.site, document);
          _has = !!_parser.hasContent();
        } catch (e) {
          _has = false;
        }
        if (!_has) return false;
        try {
          let _el = _parser.$content && _parser.$content[0];
          if (_el) {
            let _txt = String(_el.textContent || "").replace(/[\s\u3000]+/g, "");
            let _cn = (_txt.match(/[\u4e00-\u9fff]/g) || []).length;
            if (_cn < 600) {
              let _chapterLinks = 0;
              let _as = document.querySelectorAll("a");
              for (let _i = 0; _i < _as.length && _chapterLinks < 10; _i++) {
                let _t = String(_as[_i].textContent || "").trim();
                if (_t && _t.length <= 40 && /第\s*[0-9０-９零一二三四五六七八九十百千两]{1,10}\s*[章节節回卷]/.test(_t)) {
                  _chapterLinks++;
                }
              }
              if (_chapterLinks >= 10) return false;
            }
          }
        } catch (e) {
        }
        await app.launch();
        if (!app.isEnabled) return false;
        if (!document.querySelector("#xiaoshuo-reader-content")) {
          try {
            sessionStorage.setItem("xs_skip_auto_enter", String(Date.now()));
            location.reload();
          } catch (e) {
          }
          return false;
        }
        return true;
      },
      loadCustomSetting: function() {
        let customRules;
        try {
          customRules = JSON.parse(Setting.custom_siteinfo || "[]");
        } catch (e) {
        }
        SiteRules.customRules = Array.isArray(customRules) ? customRules : [];
      },
      getCurSiteInfo: function() {
        let rules = SiteRules.customRules.concat(SiteRules.specialSite);
        let locationHref = location.href;
        let info = rules.find(function(x) {
          return toRE(x.url).test(locationHref);
        });
        if (!info) {
          info = {};
        } else {
        }
        return info;
      },
      launch: async function() {
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
        if (app.site.useSiteFont) {
          if (typeof app.site.useSiteFont === "boolean") {
            app.siteFontInfo = app.getSiteFontInfo();
          } else if (typeof app.site.useSiteFont === "string") {
            if (!app.site.useSiteFont.trim().endsWith(",")) {
              app.site.useSiteFont = app.site.useSiteFont.trim() + ",";
            }
            app.siteFontInfo = { siteFontFamily: app.site.useSiteFont.trim() };
          }
        }
        let parser = new Parser(app.site, document);
        let hasContent = !!parser.hasContent();
        if (hasContent) {
          await app.enterReader(parser);
        } else {
          app.isEnabled = false;
          UI.showNoContentTip();
        }
        if (app.site.fInit)
          app.site.fInit();
      },
      enterReader: async function(parser) {
        if (!parser) return;
        cleanupEvents();
        document.body.setAttribute("name", "小说阅读助手");
        app.parsedPages[window.location.href] = true;
        app.isEnabled = true;
        try {
          await parser.getAll();
        } catch (e) {
        }
        try {
          await app.processPage(parser);
        } catch (e) {
        } finally {
          try {
            if (document.body.getAttribute("name") === "小说阅读助手" && !XS(".reader-enter-wrap").length) {
              UI.showEnterReaderButton();
            }
          } catch (e) {
          }
        }
      },
      saveCurrentSiteRule: function(selector, nextSelector) {
        try {
          let host = String(location.hostname).replace(/\./g, "\\.");
          let hostRe = "^https?://" + host + "(?::\\d+)?(?:/.*)?$";
          let name = String(location.hostname).replace(/"/g, "");
          let rule = {
            url: hostRe,
            contentSelector: String(selector).replace(/"/g, '\\"'),
            name
          };
          if (nextSelector) {
            rule.nextSelector = String(nextSelector).replace(/"/g, '\\"');
          }
          let rules = [rule].concat((SiteRules.customRules || []).filter(function(r) {
            return r && r.name !== name;
          }));
          SiteRules.customRules = rules;
          Setting.custom_siteinfo = JSON.stringify(rules);
          UI.notice("已保存本站为阅读站点，刷新后自动识别", 3e3);
        } catch (ex) {
        }
      },
      processPage: async function(parser) {
        document.body.innerHTML = "";
        app.prepDocument();
        app.initDocument(parser);
        app.$doc = XS(document);
        app.$menuBar = app.$doc.find("#menu-bar");
        app.$menu = app.$doc.find("#menu");
        app.$content = app.$doc.find("#xiaoshuo-reader-content");
        app.$loading = app.$doc.find("#loading");
        app.$menuHeader = app.$menu.find("#chapter-list");
        app.$chapterList = app.$menu.find("#chapter-list");
        app.indexUrl = parser.indexUrl;
        app.prevUrl = parser.prevUrl;
        app.oArticles = [];
        app.parsers = [];
        if (parser.prevUrl) {
          XS("<li>").addClass("chapter").append(
            XS("<div>").attr({
              "realHref": parser.prevUrl,
              "onclick": "return false;"
            }).text("上一章")
          ).prependTo(app.$chapterList);
        }
        if (app.site.style) {
          addStyle(app.site.style);
        }
        if (app.site.useSiteFont && app.siteFontInfo) {
          const { internal } = app.siteFontInfo;
          if (internal) {
            XS('<style class="noRemove siteFont">').text(internal.map((e) => e.cssText).join("\n")).appendTo("head");
          }
        }
        app.appendPage(parser, true);
        app.registerControls();
        UI.init();
        app.curFocusElement = XS("article:first").get(0);
        app.requestUrl = parser.nextUrl;
        app.isTheEnd = parser.isTheEnd;
        app.isEnabled = true;
        history.scrollRestoration = "manual";
        window.scrollTo(0, 0);
        app.initRequest();
        setTimeout(app.scroll, 1e3);
        app.cleanAgain();
        if (Setting.preload_next_page) {
          await app.doRequest();
        }
        UI.showEnterReaderButton();
      },
      initRequest: function() {
        app.httpRequest = new HttpRequest(app.site);
        app.iframeRequest = new IframeRequest(app.site);
        app.request = app.site.useiframe ? app.iframeRequest : app.httpRequest;
        app.httpRequest.setErrorHandle(() => app.scrollForce());
        app.httpRequest.setFinishHandle(() => app.scrollForce());
        app.iframeRequest.setErrorHandle(() => app.scrollForce());
        app.iframeRequest.setFinishHandle(() => app.scrollForce());
      },
      prepDocument: function() {
        window.onload = function() {
        };
        if (!HTMLElement.prototype.focus.__xsFocus) {
          let _focus = HTMLElement.prototype.focus;
          let _focusWrapped = function focus() {
            _focus.call(this, { preventScroll: true });
          };
          _focusWrapped.__xsFocus = true;
          HTMLElement.prototype.focus = _focusWrapped;
        }
        let doc = document;
        let bd = doc.body;
        bd.onselectstart = bd.oncopy = bd.onpaste = bd.oncontextmenu = bd.ondragstart = doc.onselectstart = doc.oncopy = doc.onpaste = doc.oncontextmenu = null;
        doc.onselectstart = doc.oncontextmenu = doc.onmousedown = function() {
          return true;
        };
        doc = document.wrappedJSObject || document;
        doc.onmouseup = null;
        doc.onmousedown = null;
        doc.oncontextmenu = null;
        let arAllElements = document.getElementsByTagName("*");
        for (let i = arAllElements.length - 1; i >= 0; i--) {
          let elmOne = arAllElements[i];
          elmOne = elmOne.wrappedJSObject || elmOne;
          elmOne.onmouseup = null;
          elmOne.onmousedown = null;
        }
        XS('link[rel="stylesheet"], script').remove();
        XS("html, body").removeAttr("style").removeAttr("bgcolor");
        XS("style:not(.noRemove)").filter(function() {
          let $style = XS(this);
          if ($style.text().indexOf("#cVim-link-container") != -1) {
            return false;
          }
          return true;
        }).remove();
        XS("html").children().filter(function() {
          let tagName = XS(this).prop("tagName").toLowerCase();
          if (tagName !== "head" && tagName !== "body") {
            return true;
          }
          return false;
        }).remove();
      },
      initDocument: function(parser) {
        document.title = parser.docTitle;
        document.body.innerHTML = XS.nano(tpl_mainHtml, parser);
      },
      clean: function() {
        XS(`body > *:not("#container, .reader-enter-wrap, .noRemove, #reader-preferences, iframe[name='xiaoshuo-reader-iframe']")`).remove();
        XS('link[rel="stylesheet"]:not(.noRemove)').remove();
        XS("body, #container").removeAttr("style").removeAttr("class");
        if (XS && location.host.indexOf("qidian") > 0) {
          XS(document).off("selectstart").off("contextmenu");
        }
      },
      cleanAgain: function() {
        setTimeout(app.clean, 2e3);
        setTimeout(app.clean, 5e3);
        setTimeout(app.clean, 8e3);
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
        setTimeout(function() {
          app._exiting = false;
        }, 3e3);
        try {
          sessionStorage.setItem("xs_skip_auto_enter", String(Date.now()));
        } catch (e) {
        }
        let _exit = app._currentExitUrl;
        if (_exit && _exit !== location.href) {
          try {
            location.replace(_exit);
            return;
          } catch (e) {
          }
        }
        try {
          location.reload();
        } catch (e) {
          app._exiting = false;
        }
      },
      toggle: async function() {
        if (app.isEnabled) {
          app.exitReadingMode();
        } else {
          app.isEnabled = true;
          await app.launch();
        }
      },
      removeListener: function() {
        app.remove.forEach(function(_remove) {
          _remove();
        });
      },
      appendPage: function(parser, isFirst) {
        let chapter = XS("article:last");
        if (chapter.length && parser.isSection) {
          let lastText = chapter.find("p:last").remove().text().trimRight();
          let newPage = parser.content.replace(/<p>\s+/, "<p>" + lastText);
          chapter.attr("data-section", "1");
          chapter.append(newPage);
        } else {
          chapter = XS("<article>").attr("id", "page-" + app.pageNum).append(
            XS("<h1>").addClass("title").text(UI.decodeUnicodeStr(parser.chapterTitle))
          ).append(parser.content).appendTo(app.$content);
          app._parserByPage[app.pageNum] = parser;
          let _ct = UI.decodeUnicodeStr(parser.chapterTitle);
          let chapterItem = XS("<li>").addClass("chapter").append(
            XS("<div>").attr({
              href: "#page-" + app.pageNum,
              "realHref": parser.curPageUrl,
              onclick: "return false;",
              title: _ct
            }).text(_ct)
          ).prependTo(app.$chapterList);
          if (isFirst) {
            chapterItem.addClass("active");
          }
          app.resetCache();
        }
        app.pageNum += 1;
        app.oArticles.push(chapter[0].outerHTML);
        app.parsers.push(parser);
      },
      resetCache: function() {
        app.menuItems = app.$chapterList.find("div");
        app.scrollItems = XS("article[id^=page-]");
        app._initChapterObserver();
      },
      registerControls: function() {
        XS(window).scroll(function() {
          app.scroll();
        });
        app.registerKeys();
        app.$content.on("dblclick", function() {
          app.toggleAutoScroll();
        });
        app.$menuBar.click(function() {
          UI.hideMenuList();
        });
        app.$doc.on("mousedown", "#chapter-list div", function(event) {
          switch (event.which) {
            case 1:
              let href = XS(this).attr("href");
              if (href) {
                app.scrollToArticle(XS(href));
              } else {
                let _real = XS(this).attr("realHref");
                if (_real) location.href = _real;
              }
              break;
            case 2:
              app.openUrl(XS(this).attr("realHref"));
              break;
          }
        });
      },
      registerKeys: function() {
        XS(document).off("keydown.xsKeys").on("keydown.xsKeys", function(e) {
          let t = e.target;
          if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
          let k = String(e.key || "");
          let hk = String(Setting.hide_menu_list_key || "").trim().toLowerCase();
          let ok = String(Setting.open_preferences_key || "").trim().toLowerCase();
          if (hk && k.toLowerCase() === hk) {
            if (UI.$prefs) return;
            UI.hideMenuList();
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          if (ok && k.toLowerCase() === ok) {
            if (UI.$prefs) {
              UI.hide();
            } else {
              UI.preferencesShow();
            }
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          switch (k) {
            case "Enter":
              if (UI.$prefs) return;
              app.openUrl(app.indexUrl, "主页链接没有找到");
              e.preventDefault();
              e.stopPropagation();
              break;
            case "ArrowLeft":
              let sp = XS(window).scrollTop();
              if (sp === 0) {
                if (app.prevUrl) {
                  location.href = app.prevUrl;
                } else {
                  UI.notice("已经是第一章了");
                }
              } else {
                let ot = XS(app.curFocusElement).offset().top;
                if (ot > sp && ot < sp + XS(window).height()) {
                  app.scrollToArticle(app.curFocusElement.previousSibling || 0);
                } else {
                  app.scrollToArticle(app.curFocusElement);
                }
              }
              e.preventDefault();
              break;
            case "ArrowRight":
              if (app.getRemain() <= 4) {
                if (app.lastRequestUrl || app.requestUrl) {
                  location.href = app.lastRequestUrl || app.requestUrl;
                } else {
                  UI.notice("已经是最后一章了");
                }
              } else {
                app.scrollToArticle(app.curFocusElement.nextSibling || app.$doc.height());
              }
              e.preventDefault();
              e.stopPropagation();
              break;
            case "Escape":
              if (UI.$prefs) {
                UI.hide();
                e.preventDefault();
              }
              break;
            case ",":
              window.scrollTo(window.scrollX, window.scrollY - window.innerHeight * 0.9);
              e.preventDefault();
              break;
            case ".":
              window.scrollTo(window.scrollX, window.scrollY + window.innerHeight * 0.9);
              e.preventDefault();
              break;
            case "]":
              if (app.getRemain() <= 4) {
                if (app.lastRequestUrl || app.requestUrl) {
                  location.href = app.lastRequestUrl || app.requestUrl;
                } else {
                  UI.notice("已经是最后一章了");
                }
              } else {
                app.scrollToArticle(app.curFocusElement.nextSibling || app.$doc.height());
              }
              e.preventDefault();
              break;
            case "[":
              if (app.prevUrl) {
                location.href = app.prevUrl;
              }
              e.preventDefault();
              break;
            case " ":
              if (UI.$prefs) break;
              setTimeout(function() {
                if (app.request) app.scroll();
              }, 60);
              break;
          }
        });
      },
      scrollToArticle: function(elem) {
        let offsetTop;
        if (typeof elem == "number") {
          offsetTop = elem;
        } else {
          offsetTop = XS(elem).offset().top - parseInt(XS(elem).css("margin-top"), 10);
        }
        window.scrollTo({ top: offsetTop, behavior: "smooth" });
      },
      openUrl: function(url, errorMsg) {
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
        let lastTs = null, acc = 0;
        function tick(ts) {
          if (!app.autoScrolling) {
            app.autoScrollTimer = null;
            return;
          }
          if (lastTs === null) lastTs = ts;
          let dt = (ts - (lastTs ?? ts)) / 1e3;
          lastTs = ts;
          if (Setting.preload_next_page && app.getRemain() < Setting.remain_height) {
            app.scrollForce();
          } else if (!Setting.preload_next_page && app.getRemain() <= 4) {
            app.scrollForce();
          }
          acc += speed * dt;
          let whole = Math.floor(acc);
          if (whole > 0) {
            window.scrollBy(0, whole);
            acc -= whole;
          }
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
        app.updateTabTitleOnScroll();
        if (!app.paused) {
          if (app.request && app.request.status === RequestStatus.Finish && app.request.getDocument) {
            await app.scrollForce();
            return;
          }
          if (app.request instanceof IframeRequest && app.request.status === RequestStatus.Loading && app.request.doc && app.request.doc.body && app.request.doc.body.textContent.replace(/\s+/g, "").length >= 100) {
            app.request.status = RequestStatus.Finish;
            await app.scrollForce();
            return;
          }
          if (Setting.preload_next_page && app.getRemain() < Setting.remain_height) {
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
        switch (app.request.status) {
          case RequestStatus.Idle:
            await app.doRequest();
            break;
          case RequestStatus.Loading:
            if (app._waitingLoading) break;
            app._waitingLoading = true;
            try {
              for (let wi = 0; wi < 40 && app.request.status === RequestStatus.Loading; wi++) {
                await sleep(250);
              }
              if (app.request.status === RequestStatus.Finish) {
                await app.scrollForce();
              }
              if (!app.paused && !app.isTheEnd && !app.isRequesting && app.request && app.request.status === RequestStatus.Idle && app.getRemain() < Setting.remain_height) {
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
      updateCurFocusElement: function(cur) {
        if (!cur || !cur.id) return;
        let id = cur.id;
        if (app.lastId !== id) {
          app.lastId = id;
          let activeItem = app.menuItems.filter('[href="#' + id + '"]'), activeUrl = activeItem.attr("realHref");
          app.menuItems.parent().removeClass("active");
          activeItem.parent().addClass("active");
          app.curFocusElement = cur;
          app.curFocusIndex = app.scrollItems.index(cur);
          app.activeUrl = activeUrl;
        }
      },
      _initChapterObserver: function() {
        if (app._chapterObserver) app._chapterObserver.disconnect();
        let observer = new IntersectionObserver(function(entries) {
          let cur = null, best = Infinity, c = window.innerHeight / 2;
          for (let i = 0; i < entries.length; i++) {
            let en = entries[i];
            if (!en.isIntersecting) continue;
            let rect = en.boundingClientRect;
            let d = Math.abs(rect.top + rect.height / 2 - c);
            if (d < best) {
              best = d;
              cur = en.target;
            }
          }
          if (cur) app.updateCurFocusElement(cur);
        });
        app.scrollItems.each(function() {
          observer.observe(this);
        });
        app._chapterObserver = observer;
      },
      getRemain: function() {
        let scrollHeight = Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight
        );
        let remain = scrollHeight - window.innerHeight - window.scrollY;
        return remain;
      },
      // 滚动时根据当前可见章节更新标签页标题和章节列表高亮（避免预加载时标签页跳到最后一章）
      updateTabTitleOnScroll: function() {
        let articles = XS("article[id^=page-]");
        if (!articles.length) return;
        let scrollY = window.scrollY;
        let currentChapter = null;
        for (let i = articles.length - 1; i >= 0; i--) {
          let rect = articles[i].getBoundingClientRect();
          let top = rect.top + scrollY;
          if (top <= scrollY + 50) {
            currentChapter = articles[i];
            break;
          }
        }
        if (!currentChapter) currentChapter = articles[0];
        let titleEl = XS(currentChapter).find("h1.title");
        let chapterTitle = titleEl.text();
        if (!chapterTitle) return;
        let chapterId = XS(currentChapter).attr("id");
        let pageNum = parseInt(chapterId.replace("page-", ""));
        let parser = app.parsers[pageNum];
        if (parser && parser.curPageUrl) {
          let _base = parser.bookTitle && parser.bookTitle !== "目录" ? parser.bookTitle : "";
          let newTitle = _base ? _base + " - " + chapterTitle : chapterTitle;
          if (document.title !== newTitle) {
            document.title = newTitle;
            if (location.href !== parser.curPageUrl) {
              try {
                history.replaceState({}, "", parser.curPageUrl);
              } catch (e) {
              }
            }
          }
          app._currentExitUrl = parser.curPageUrl;
        }
        if (app.$chapterList) {
          app.$chapterList.find(".chapter.active").removeClass("active");
          let chapterItems = app.$chapterList.find(".chapter");
          for (let j = 0; j < chapterItems.length; j++) {
            let itemTitle = XS(chapterItems[j]).find("div").text();
            if (itemTitle === chapterTitle) {
              XS(chapterItems[j]).addClass("active");
              break;
            }
          }
        }
      },
      doRequest: async function() {
        if (app.isRequesting) {
          if (!app._doRequestRetry) {
            app._doRequestRetry = setTimeout(function() {
              app._doRequestRetry = null;
              app.doRequest();
            }, 600);
          }
          return;
        }
        app.isRequesting = true;
        clearTimeout(app._reqTimer);
        app._requestActive = true;
        let _reqGuard = function() {
          if (!app._requestActive) return;
          if (app.request === app.iframeRequest && app.iframeRequest.status === RequestStatus.Loading) {
            app._reqTimerExtend = (app._reqTimerExtend || 0) + 1;
            if (app._reqTimerExtend <= 10) {
              app._reqTimer = setTimeout(_reqGuard, 4e3);
              return;
            }
            app._reqTimerExtend = 0;
          }
          app._requestActive = false;
          if (app._reqRetryCount < 1) {
            app._reqRetryCount++;
            try {
              let p2 = new Parser(app.site, document, app.curPageUrl);
              app.requestUrl = p2.nextUrl;
              app.isTheEnd = p2.isTheEnd;
            } catch (e) {
              app.requestUrl = null;
            }
            if (app.requestUrl && !app.isTheEnd) {
              app.isRequesting = false;
              app.doRequest();
              return;
            }
          }
          app._reqRetryCount = 0;
          app.isRequesting = false;
          clearTimeout(app._loadingHideTimer);
          app.$loading.hide().html("");
          try {
            let p2 = new Parser(app.site, document, app.curPageUrl);
            app.requestUrl = p2.nextUrl;
            app.isTheEnd = p2.isTheEnd;
          } catch (e) {
            app.requestUrl = null;
          }
          if (app.request === app.iframeRequest && app.iframeRequest.status === RequestStatus.Loading) {
            app.iframeRequest.status = RequestStatus.Fail;
            app.scrollForce();
          }
        };
        app._reqTimer = setTimeout(_reqGuard, 8e3);
        let nextUrl = app.requestUrl;
        const referer = app.lastRequestUrl || app.curPageUrl;
        app.lastRequestUrl = app.requestUrl;
        if (nextUrl && !app.isTheEnd && !(nextUrl in app.parsedPages)) {
          try {
            app.curPageUrl = app.requestUrl;
            app.requestUrl = null;
            let useiframe = app.site.useiframe;
            clearTimeout(app._loadingHideTimer);
            app.$loading.show().html("").append('<svg width="18" height="18" viewBox="0 0 18 18" style="vertical-align:-4px;margin-right:6px"><circle cx="9" cy="9" r="7" fill="none" stroke="rgba(120,120,120,0.20)" stroke-width="2"/><circle cx="9" cy="9" r="7" fill="none" stroke="rgba(120,120,120,0.85)" stroke-width="2" stroke-linecap="round" stroke-dasharray="30 44" stroke-dashoffset="0"><animateTransform attributeName="transform" type="rotate" from="0 9 9" to="360 9 9" dur="0.9s" repeatCount="indefinite"/></circle></svg>').append("<a href='" + nextUrl + "' tabindex='-1'>正在载入下一页" + (useiframe ? "(iframe)" : "") + "...</a>");
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
            app.$loading.html("<a href='" + nextUrl + "'>翻页请求异常，请点此手动打开</a>").show();
            app.isRequesting = false;
          }
        }
      },
      loaded: async function(doc) {
        let parser = new Parser(app.site, doc, app.curPageUrl);
        await parser.getAll();
        await app.addNextPage(parser);
      },
      addNextPage: async function(parser) {
        app.lastNextFromReal = !!parser.nextFromReal;
        app._requestActive = false;
        app._reqRetryCount = 0;
        clearTimeout(app._reqTimer);
        if (parser.content) {
          app.appendPage(parser);
          try {
            window.dispatchEvent(new Event("resize"));
          } catch (e) {
          }
          clearTimeout(app._loadingHideTimer);
          app._loadingHideTimer = setTimeout(function() {
            app.$loading.hide().html("");
          }, 600);
          app.requestUrl = parser.nextUrl;
          app.isTheEnd = parser.isTheEnd;
          app.isRequesting = false;
          await app.afterLoad();
        } else {
          app.removeListener();
          let msg = parser.isTheEnd == "vip" ? "vip 章节，需付费。" : "错误：没有找到下一页的内容。";
          clearTimeout(app._loadingHideTimer);
          app.$loading.html(
            '<a href="' + app.curPageUrl + '">' + msg + "点此打开下一页。</a>"
          ).show();
          app.isRequesting = false;
        }
      },
      afterLoad: async function() {
        this._initLazyContentFix();
        let selectedf = this;
        if (Setting.preload_next_page && !this.isTheEnd && !this._preloadChainPending && ((this._preloadChainCount || 0) < 1 || this.getRemain() < Setting.remain_height)) {
          this._preloadChainCount = (this._preloadChainCount || 0) + 1;
          this._preloadChainPending = true;
          setTimeout(function() {
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
        let optTag = "data-xs-opt";
        let fullReplace = function(t, map) {
          for (let k in map) {
            t = t.replace(toRE(k), map[k]);
          }
          return t;
        };
        let obs = new MutationObserver(function(muts) {
          muts.forEach(function(m) {
            if (m.type !== "childList" || !m.addedNodes) return;
            m.addedNodes.forEach(function(node) {
              if (node.nodeType !== 1) return;
              let $n = XS(node);
              if ($n.is("article")) return;
              let $p = $n.is("p") ? $n : $n.find("p").addBack().filter("p");
              $p.each(function() {
                let $this = XS(this);
                if ($this.attr(optTag)) return;
                let text = $this.text();
                if (!text.trim()) return;
                let processed = applyContentSettings(text, host, fullReplace);
                if (processed === text) {
                  $this.attr(optTag, "1");
                  return;
                }
                let paras = processed.split("\n").map(function(s) {
                  return s.trim();
                }).filter(Boolean);
                if (paras.length) {
                  let html = paras.map(function(s) {
                    return "<p " + optTag + '="1">　　' + escapeHtml(s) + "</p>";
                  }).join("");
                  $this.replaceWith(html);
                } else {
                  $this.attr(optTag, "1");
                }
              });
            });
          });
        });
        obs.observe($content[0], { childList: true, subtree: true });
      },
      getSiteFontInfo: function() {
        const fonts = { external: [], internal: [], family: [] };
        const { external, internal, family } = fonts;
        for (const font of document.fonts) {
          family.push(font.family);
        }
        for (const styleSheet of document.styleSheets) {
          try {
            for (const cssRule of styleSheet.cssRules) {
              if (cssRule instanceof CSSFontFaceRule) {
                const fontFamily = cssRule.style.fontFamily;
                const cssText = cssRule.cssText;
                if (!internal.find((o) => o.fontFamily === fontFamily)) {
                  internal.push({ fontFamily, cssText });
                }
              }
            }
          } catch (e) {
            external.push(styleSheet.href);
          }
        }
        let familyList = [];
        internal.forEach((e) => {
          familyList.push(e.fontFamily);
        });
        family.forEach((e) => {
          if (!familyList.includes(e)) {
            familyList.push(e);
          }
        });
        familyList = familyList.map((e) => {
          if (e.includes(" ")) {
            return `"${e}"`;
          } else {
            return e;
          }
        });
        fonts.siteFontFamily = familyList.join(",") + ",";
        return fonts;
      }
    };
    (async function() {
      try {
        await loadAll();
      } catch (e) {
      }
      let _hostname = location.hostname || "";
      let _siteEnabled = app.isSiteEnabled(_hostname);
      let _blacklisted = _siteEnabled && !app.isPageWhitelisted() && app.isPageBlacklisted();
      let _shouldRun = _siteEnabled && !_blacklisted;
      try {
        app.registerUserscriptMenu();
      } catch (e) {
      }
      if (_shouldRun) {
        try {
          await app.init();
        } catch (e) {
        }
      }
      try {
        let getPrefsKey = function() {
          try {
            let k = String(Setting.open_preferences_key || "").trim().toLowerCase();
            return k || "o";
          } catch (e) {
            return "o";
          }
        }, applyEnableChange = function() {
          let _host = location.hostname || "";
          let _on = app.isSiteEnabled(_host);
          let _block = _on && !app.isPageWhitelisted() && app.isPageBlacklisted();
          let _inReader = !!(document.body && document.body.getAttribute && document.body.getAttribute("name") === "小说阅读助手");
          if (_inReader) {
            if (_on && !_block) return;
            app.exitReadingMode();
            return;
          }
          try {
            XS(".reader-enter-wrap").remove();
          } catch (e) {
          }
          if (_on && !_block) {
            try {
              if (!SiteRules.customRules.length) {
                app.loadCustomSetting();
              }
            } catch (e) {
            }
            try {
              app.site = app.getCurSiteInfo();
              if (app.isHomePath()) {
                UI.showHomeEnabledTip();
              } else {
                UI.showEnterReaderButton();
              }
            } catch (e) {
            }
          }
        }, syncStoreFromStorage = function(done) {
          try {
            chrome.storage.local.get(
              { enabled_sites: [], page_whitelist: [], custom_page_blacklist: [] },
              function(items) {
                if (items) {
                  let _keys = ["enabled_sites", "page_whitelist", "custom_page_blacklist"];
                  for (let i = 0; i < _keys.length; i++) {
                    let k = _keys[i];
                    if (items[k] === undefined) {
                      delete __store[k];
                    } else {
                      __store[k] = items[k];
                    }
                  }
                }
                done();
              }
            );
          } catch (e) {
            done();
          }
        };
        if (typeof window === "undefined") throw new Error("no window");
        document.addEventListener("keydown", function(e) {
          let t = e.target;
          if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
          let k = String(e.key || "").toLowerCase();
          if (k !== getPrefsKey()) return;
          let _inReader = !!(document.body && document.body.getAttribute && document.body.getAttribute("name") === "小说阅读助手");
          if (!_inReader) return;
          let $prefs = UI.$prefs;
          if ($prefs && $prefs.length) {
            try {
              UI.hide();
            } catch (ex) {
            }
          } else {
            try {
              UI.preferencesShow();
            } catch (ex) {
            }
          }
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }, true);
        document.addEventListener("mousedown", function(e) {
          let $prefs = UI.$prefs;
          if (!$prefs || !$prefs.length) return;
          let dialog = $prefs[0];
          if (e.target === dialog || !dialog.contains(e.target)) {
            try {
              UI.preferencesCloseHandler();
            } catch (ex) {
            }
          }
        }, true);
        try {
          chrome.storage.onChanged.addListener(function(changes, area) {
            if (area !== "local") return;
            let touched = false;
            let keys = ["enabled_sites", "page_whitelist", "custom_page_blacklist"];
            for (let i = 0; i < keys.length; i++) {
              let k = keys[i];
              if (!changes[k]) continue;
              touched = true;
              if (changes[k].newValue === undefined) {
                delete __store[k];
              } else {
                __store[k] = changes[k].newValue;
              }
            }
            if (!touched) return;
            applyEnableChange();
          });
        } catch (e) {
        }
        try {
          chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
            if (!msg || msg.action !== "xs_site_changed") return;
            syncStoreFromStorage(function() {
              try {
                applyEnableChange();
              } catch (e) {
              }
              try {
                sendResponse({ ok: true });
              } catch (e) {
              }
            });
            return true;
          });
        } catch (e) {
        }
      } catch (e) {
      }
    })();
  })();
})();
