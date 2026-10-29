/* =============================================================
 * background.js — 小说阅读助手 扩展版后台服务（Manifest V3）
 *  1. 跨域请求转发：content script 受 CORS 限制，经此 fetch 任意小说站
 *  2. 打开新标签（经 openInTab 转发）
 *  注：图标点击打开原生 popup（dist/popup.html，manifest 里 default_popup 声明），
 *      由浏览器负责定位到图标下方；background 不参与，content 端经 xs_fetch / xs_open_tab 与此通信。
 * ============================================================= */

// ---- 跨域 fetch 转发 ----
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (!request || typeof request.action !== 'string') return;

  if (request.action === 'xs_fetch') {
    var url = request.url;
    // 安全：只转发 http/https 请求。拒绝 file://、chrome://、data: 等协议，
    // 防止被劫持的 content script 用它读取本地文件或扩展内部资源（Chromium 官方建议）
    try {
      var _u = new URL(url);
      if (!/^https?:$/.test(_u.protocol)) {
        sendResponse({ ok: false, status: 0, error: '拒绝非 http(s) 请求' });
        return false;
      }
    } catch (e) {
      sendResponse({ ok: false, status: 0, error: 'URL 无效' });
      return false;
    }
    var method = request.method || 'GET';
    var headers = request.headers || {};
    var timeout = request.timeout || 15000;

    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, timeout);

    var opts: RequestInit = {
      method: method,
      redirect: 'follow',
      credentials: 'include',
      signal: controller.signal,
      // [修复] 转发请求头（content 端设置的 Referer 等此前因 opts 未含 headers 从未生效）
      headers: headers as HeadersInit
    };
    if (method === 'POST' && request.body) {
      opts.body = request.body;
      if (!headers['Content-Type']) headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    }

    fetch(url, opts)
      .then(function (resp) {
        var status = resp.status;
        var finalUrl = resp.url;
        return resp.text().then(function (body) {
          return { status: status, finalUrl: finalUrl, body: body };
        });
      })
      .then(function (data) {
        clearTimeout(timer);
        sendResponse({ ok: true, status: data.status, finalUrl: data.finalUrl, body: data.body });
      })
      .catch(function (err) {
        clearTimeout(timer);
        var msg = (err && err.name === 'AbortError') ? '请求超时' : (err && err.message || String(err));
        sendResponse({ ok: false, status: 0, error: msg });
      });
    return true; // 保持异步通道
  }

  if (request.action === 'xs_open_tab') {
    chrome.tabs.create({ url: request.url, active: !!request.active });
    sendResponse({ ok: true });
    return false;
  }
});
