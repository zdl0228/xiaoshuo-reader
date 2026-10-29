/* =============================================================
 * test.js — 小说阅读助手 自动化校验（npm test）
 * 覆盖：构建产物完整性 / content↔background action 一致 /
 *       无 MNR 血统残留 / 站点规则库完整性 / MD5 标准向量
 * 架构：content 为唯一 content script 入口（内联 dom/sites/net），background 独立 esm。
 * 用法：先 node build.js，再 node test.js（或 npm test）
 * ============================================================= */
const fs = require('fs');
const path = require('path');

let passed = 0, failed = 0;
function ok(cond, msg) {
  if (cond) { passed++; console.log('  ✓ ' + msg); }
  else { failed++; console.error('  ✗ ' + msg); }
}
function read(p) { return fs.readFileSync(path.join(__dirname, p), 'utf8'); }

console.log('【1】构建产物完整性');
['dist/background.js', 'dist/content.js'].forEach((f) => {
  const p = path.join(__dirname, f);
  const exists = fs.existsSync(p);
  ok(exists && fs.statSync(p).size > 0, `${f} 存在且非空`);
});

console.log('【2】content↔background 通信 action 一致');
const content = read('dist/content.js');
const bg = read('dist/background.js');
ok(content.includes('xs_fetch') && bg.includes('xs_fetch'), 'content 发 xs_fetch + background 监听 xs_fetch');
ok(content.includes('xs_open_tab') && bg.includes('xs_open_tab'), 'content 发 xs_open_tab + background 监听 xs_open_tab');
ok(!bg.includes('mnr_fetch'), 'background 无 mnr_fetch 残留');

console.log('【3】无 MNR/mnr 血统残留');
['dist/content.js', 'dist/background.js'].forEach((f) => {
  const c = read(f);
  ok(!c.includes('MNR') && !c.includes('mnr'), `${f} 无 MNR/mnr`);
});

console.log('【4】站点规则库完整性（SITE_RULES 内联于 content.js）');
const c4 = read('dist/content.js');
ok(c4.includes('SITE_RULES'), 'content.js 内联规则库标识 SITE_RULES');
const ruleCount = (c4.match(/contentSelector\s*:/g) || []).length;
ok(ruleCount > 100, `规则条数抽样 ${ruleCount}（>100）`);

console.log('【5】MD5 标准向量');
const src = read('dist/content.js');
const m = src.match(/var CryptoJS = \/\* @__PURE__ \*\/ \(function\(\) \{[\s\S]*?\}\)\(\);/);
let md5ok = false;
if (m) {
  eval(m[0] + ';globalThis.CryptoJS=CryptoJS;');
  md5ok =
    CryptoJS.MD5('').toString(CryptoJS.enc.Hex) === 'd41d8cd98f00b204e9800998ecf8427e' &&
    CryptoJS.MD5('hello').toString(CryptoJS.enc.Hex) === '5d41402abc4b2a76b9719d911017c592';
}
ok(md5ok, 'MD5("")/MD5("hello") 标准向量正确');

console.log(`\n结果: ${passed} 通过, ${failed} 失败`);
process.exit(failed ? 1 : 0);
