"use strict";
(() => {
  // src/adapter.ts
  function _fire(cb, ...args) {
    try {
      if (typeof cb === "function") cb(...args);
    } catch (e) {
    }
  }
  var shim = {
    runtime: {
      lastError: void 0,
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
            if (keys === null || keys === void 0) {
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
})();
