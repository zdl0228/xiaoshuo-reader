
/* =============================================================
 * popup.js — 小说阅读助手 扩展图标弹菜单
 *  1. 显示当前站点，判断是否已启用阅读器
 *  2. 「在此网站启用阅读器」：把 host 加入 mnr_enabled_sites 并刷新页面
 *  3. 「在此网站禁用阅读器」：把 host 移出名单并刷新页面
 *  4. 「设置」：通知 content script 打开设置面板
 *
 *  注意：事件绑定放在脚本顶层立即执行，不依赖任何异步回调，
 *  避免「回调未完成导致按钮看着能点、点了没反应」。
 * ============================================================= */

var ENABLED_KEY = 'mnr_enabled_sites';
var host = '';
var tabId = null;

var btnEnable = document.getElementById('btn-enable');
var btnDisable = document.getElementById('btn-disable');
var btnSettings = document.getElementById('btn-settings');

/* 启用 / 禁用 */
function toggle(on) {
  if (!host || tabId == null) return;
  chrome.storage.local.get(ENABLED_KEY, function (data) {
    var list = data[ENABLED_KEY];
    // 兼容历史脏数据：存储值可能不是数组（旧格式对象/其他类型），先判类型再处理
    if (!Array.isArray(list)) list = [];
    else list = list.slice();
    var i = list.indexOf(host);
    if (on && i < 0) list.push(host);
    if (!on && i >= 0) list.splice(i, 1);
    chrome.storage.local.set({ 'mnr_enabled_sites': list }, function () {
      chrome.tabs.reload(tabId);
      window.close();
    });
  });
}

/* 根据白名单状态切换「启用 / 禁用」按钮的显示 */
function refreshButtons() {
  if (!host) return;
  chrome.storage.local.get(ENABLED_KEY, function (data) {
    var list = data[ENABLED_KEY] || [];
    if (!Array.isArray(list)) list = [];
    var enabled = list.indexOf(host) >= 0;
    btnEnable.style.display = enabled ? 'none' : 'flex';
    btnDisable.style.display = enabled ? 'flex' : 'none';
  });
}

/* 事件绑定：顶层立即生效，不依赖异步回调 */
btnEnable.addEventListener('click', function () { toggle(true); });
btnDisable.addEventListener('click', function () { toggle(false); });
btnSettings.addEventListener('click', function () {
  if (tabId == null) return;
  chrome.tabs.sendMessage(tabId, { action: 'mnr_open_preferences' }, function () {
    void chrome.runtime.lastError;
  });
  window.close();
});

/* 读取当前活动标签页的站点 */
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var tab = tabs && tabs[0];
  if (!tab || !tab.url || !/^https?:/.test(tab.url)) {
    document.getElementById('site').textContent = '当前页面不可用';
    return;
  }
  try { host = new URL(tab.url).hostname; } catch (e) { host = ''; }
  document.getElementById('site').textContent = host || tab.url;
  tabId = tab.id;
  refreshButtons();
});

