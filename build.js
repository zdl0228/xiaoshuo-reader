/* =============================================================
 * build.js — 小说阅读助手 TS 构建脚本
 * 用 esbuild 打包 src/*.ts → dist/*.js
 * （content 作为唯一 content script 入口：dom/sites/net 经 import 由 esbuild
 *   内联为单个 dist/content.js；不再单独产出 dom.js/sites.js/net.js）
 *
 * 构建格式说明（Chrome MV3 标准）：
 *  - background：service worker 声明了 type:"module"，必须打为 ES module（esm）
 *  - content：content script 不允许 ES module，打为 IIFE（iife）
 *
 * 油猴同步输出：content 仅依赖 6 处 chrome.*（storage.local / runtime.sendMessage），
 * 由 src/adapter.ts 将 window.chrome 垫片为 GM_* 实现，与 dist/content.js 拼接为
 * 根目录 小说阅读助手.user.js。脚本头（version/matches/excludes）从 manifest.json 派生。
 *
 * 用法：node build.js
 * ============================================================= */
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const ESM = new Set(['background']);   // service worker → ES module
const FORMATS = { background: 'esm' };

const FILES = ['background', 'content', 'adapter', 'popup'];   // content 单文件 bundle dom/sites/net；popup 为扩展专用面板（不进入 user.js）

// manifest 的 all_urls 通配 → userscript 的 http(s) 通配；其余同格式直接沿用
function toMatchPattern(p) { return p === '<all_urls>' ? '*://*/*' : p; }

function userscriptHeader() {
  const root = __dirname;
  const mf = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const cs = mf.content_scripts[0];
  const L = [];
  L.push('// ==UserScript==');
  L.push(`// @name         ${mf.name}`);
  L.push(`// @namespace    https://github.com/local/${mf.name}`);
  L.push(`// @version      ${mf.version}`);
  L.push(`// @description  ${mf.description}`);
  (cs.matches || []).forEach(m => L.push(`// @match        ${toMatchPattern(m)}`));
  // [修复] 原来只输出 @exclude-match（Chrome 原生 userscript API 的写法），
  // Tampermonkey / Violentmonkey 的标准键是 @exclude，两者都输出才能保证
  // List.htm / index.html 这类目录页在油猴里也被排除（否则脚本会在目录页跑起来）。
  (cs.exclude_matches || []).forEach(m => L.push(`// @exclude      ${toMatchPattern(m)}`));
  (cs.exclude_matches || []).forEach(m => L.push(`// @exclude-match ${toMatchPattern(m)}`));
  L.push('// @grant        GM_xmlhttpRequest');
  L.push('// @grant        GM_openInTab');
  L.push('// @grant        GM_setValue');
  L.push('// @grant        GM_getValue');
  L.push('// @grant        GM_listValues');
  L.push('// @grant        GM_deleteValue');
  L.push('// @grant        GM_registerMenuCommand');   // [v3.0] 油猴菜单：按站点启用/关闭
  L.push('// @connect      *');
  L.push(`// @run-at       ${cs.run_at || 'document-end'}`);
  L.push('// @noframes');
  L.push('// ==/UserScript==');
  return L.join('\n');
}

/* ---------------- 油猴产物整形 ----------------
 * esbuild 的 iife 产物自带一批「构建痕迹」，单独分发时一眼能看出是打包出来的：
 *   ① 模块路径注释 `// src/tpl/main.html` —— 直接把 TS 源码结构摊开
 *   ② `/* @__PURE__ *​/` 压缩器标记
 *   ③ 每个 bundle 自带 `"use strict"; (() => { ... })();` 外壳，拼在一起就成了三层 IIFE
 *   ④ 模板默认导出被命名为 main_default / main_default2
 * 这里统一抹平：拆掉各自外壳、合成单层 IIFE、清注释、变量换成可读名。
 * 业务代码一行未改，语义等价（两个 bundle 的顶层标识符已确认没有重名）。
 * ---------------------------------------------------------------- */

// 拆掉 esbuild 的 `"use strict";\n(() => { ... })();` 外壳，只留函数体
function unwrapIife(code, name) {
  const s = code.replace(/^\s*"use strict";\r?\n/, '');
  const m = s.match(/^\(\(\)\s*=>\s*\{\r?\n([\s\S]*?)\r?\n\}\)\(\);\s*$/);
  if (!m) throw new Error(`[${name}] IIFE 外壳与预期不符，已中止（避免产出半成品脚本）`);
  return m[1];
}

// 去构建注释、变量改可读名、压掉多余空行
const RENAME = {
  main_default2: 'mainCss',
  main_default: 'mainHtml',
  preferences_default2: 'prefsCss',
  preferences_default: 'prefsHtml',
};
function tidyBody(body) {
  let s = body
    .replace(/^[ \t]*\/\/ src\/[^\n]*?\.(?:ts|html|css)[ \t]*\r?\n/gm, '')
    .replace(/\/\* @__PURE__ \*\/ ?/g, '')
    .replace(/\bvoid 0\b/g, 'undefined');   // 打包器惯用的 void 0 → 手写习惯的 undefined（严格模式下等价）
  for (const from of Object.keys(RENAME)) {
    s = s.replace(new RegExp('\\b' + from + '\\b', 'g'), RENAME[from]);
  }
  return s.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n');
}

/* 打包器把 html/css 文本压成一行 'a\r\nb'；这里还原成多行模板字符串，
 * 只有「单引号包裹 + 除 \r\n 外无其他转义 + 无反引号或 ${」时才改写，其余原样保留。
 * 内容零改动（\r\n → 换行，对 html/css 语义等价），构建后有一致性校验。 */
function readableTemplates(code) {
  return code.replace(
    /^( {2})var (mainHtml|mainCss|prefsHtml|prefsCss) = '((?:[^'\\]|\\.)*)';$/gm,
    (whole, indent, name, lit) => {
      if (lit.includes('`') || lit.includes('${')) return whole;
      if (/\\(?!r|n)/.test(lit)) return whole;
      const text = lit.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');
      return `${indent}var ${name} = \`${text}\`;`;
    }
  );
}

// [跨平台] 模板统一 LF：Windows 上检出的是 CRLF，esbuild 会把 \r\n 原样编进字符串，
// 导致 CSS/HTML 内容多出 \r、产物与 macOS 构建字节不一致，且 readableTemplates 的多行
// 还原会因含 \r 转义而放弃。这里在读取阶段就归一化，产物因此与平台无关。
const lfTemplates = [{
  name: 'lf-templates',
  setup(build) {
    build.onLoad({ filter: /\.(css|html)$/ }, async (args) => {
      const text = await fs.promises.readFile(args.path, 'utf8');
      return { contents: text.replace(/\r\n/g, '\n'), loader: 'text' };
    });
  },
}];

(async () => {
  for (const name of FILES) {
    const format = FORMATS[name] || 'iife';
    await esbuild.build({
      entryPoints: [`src/${name}.ts`],
      outfile: `dist/${name}.js`,
      bundle: true,
      format,                          // background=esm，其余=iife
      platform: 'browser',
      target: 'chrome88',              // 与 manifest minimum_chrome_version=88 一致
      sourcemap: false,
      legalComments: 'none',
      charset: 'utf8',                 // 中文字符串原样输出（默认 ascii 会转成 \u4E2D\u6587 转义）
      loader: { '.css': 'text', '.html': 'text' }, // 模板文件内联为字符串
      plugins: lfTemplates,            // 模板换行符归一化（跨平台产物一致）
    });
    console.log(`  ✔ dist/${name}.js  [${format}]`);
  }

  // ---- 复制 popup.html → dist/popup.html（扩展专用面板，不进 user.js） ----
  // 同样归一化换行符，保证 macOS / Windows 构建产物字节一致
  fs.writeFileSync(
    path.join(__dirname, 'dist/popup.html'),
    fs.readFileSync(path.join(__dirname, 'src/popup.html'), 'utf8').replace(/\r\n/g, '\n'),
    'utf8'
  );
  console.log('  ✔ dist/popup.html');

  // ---- 油猴同步输出：header + 单层 IIFE( adapter 兼容层 + content 主逻辑 ) ----
  const root = __dirname;
  const adapterBody = tidyBody(unwrapIife(fs.readFileSync(path.join(root, 'dist/adapter.js'), 'utf8'), 'adapter'));
  const contentBody = readableTemplates(tidyBody(unwrapIife(fs.readFileSync(path.join(root, 'dist/content.js'), 'utf8'), 'content')));
  const userscript = [
    userscriptHeader(),
    '',
    '(function () {',
    '  "use strict";',
    '',
    '  // ── 油猴环境适配：把 GM_* 包装成 chrome.* 接口，业务代码无需改动 ──',
    adapterBody,
    '',
    '  // ── 主程序 ──',
    contentBody,
    '})();',
    '',
  ].join('\n');
  const outName = '小说阅读助手.user.js';
  fs.writeFileSync(path.join(root, outName), userscript, 'utf8');
  console.log(`  ✔ ${outName}  [userscript, ${(Buffer.byteLength(userscript) / 1024).toFixed(0)} KB]`);

  console.log('\n✅ 构建完成，产物在 dist/ + 根目录油猴脚本');
})().catch((e) => {
  console.error('❌ 构建失败');
  console.error(e);
  process.exit(1);
});
