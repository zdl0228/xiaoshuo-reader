// src/background.ts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (!request || typeof request.action !== "string") return;
  if (request.action === "xs_fetch") {
    var url = request.url;
    try {
      var _u = new URL(url);
      if (!/^https?:$/.test(_u.protocol)) {
        sendResponse({ ok: false, status: 0, error: "拒绝非 http(s) 请求" });
        return false;
      }
    } catch (e) {
      sendResponse({ ok: false, status: 0, error: "URL 无效" });
      return false;
    }
    var method = request.method || "GET";
    var headers = request.headers || {};
    var timeout = request.timeout || 15e3;
    var controller = new AbortController();
    var timer = setTimeout(function() {
      controller.abort();
    }, timeout);
    var opts = {
      method,
      redirect: "follow",
      credentials: "include",
      signal: controller.signal,
      // [修复] 转发请求头（content 端设置的 Referer 等此前因 opts 未含 headers 从未生效）
      headers
    };
    if (method === "POST" && request.body) {
      opts.body = request.body;
      if (!headers["Content-Type"]) headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
    }
    fetch(url, opts).then(function(resp) {
      var status = resp.status;
      var finalUrl = resp.url;
      return resp.text().then(function(body) {
        return { status, finalUrl, body };
      });
    }).then(function(data) {
      clearTimeout(timer);
      sendResponse({ ok: true, status: data.status, finalUrl: data.finalUrl, body: data.body });
    }).catch(function(err) {
      clearTimeout(timer);
      var msg = err && err.name === "AbortError" ? "请求超时" : err && err.message || String(err);
      sendResponse({ ok: false, status: 0, error: msg });
    });
    return true;
  }
  if (request.action === "xs_open_tab") {
    chrome.tabs.create({ url: request.url, active: !!request.active });
    sendResponse({ ok: true });
    return false;
  }
});
