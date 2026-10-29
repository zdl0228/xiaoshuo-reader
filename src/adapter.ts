/* =============================================================
 * 小说阅读助手 油猴兼容层（adapter.ts）
 * 目标：不改一行业务代码，让 dist/content.js 原样运行在 Tampermonkey/Violentmonkey。
 *
 * content/net 仅使用 6 处 chrome.*：
 *   runtime.sendMessage('xs_fetch')     → GM_xmlhttpRequest（原生跨域，无需 background 转发）
 *   runtime.sendMessage('xs_open_tab')  → GM_openInTab
 *   storage.local.get/set/remove        → GM_listValues/GM_getValue/GM_setValue/GM_deleteValue
 *   runtime.lastError                   → 恒 undefined（错误经响应体 ok:false 传递，与 background 语义一致）
 *
 * 注意：普通网页（Chrome/Edge）本身就存在页面自带的 window.chrome（无 storage、无本扩展的
 * action 语义），因此这里必须无条件覆盖，不能 if (!chrome) 才挂载。
 * ============================================================= */

declare const GM_xmlhttpRequest: any;
declare const GM_setValue: any;
declare const GM_getValue: any;
declare const GM_listValues: any;
declare const GM_deleteValue: any;
declare const GM_openInTab: any;
declare const GM_registerMenuCommand: any;   // [v3.0] 油猴菜单：按站点启用/关闭（仅油猴环境存在）

/** 异步安全回调（chrome 回调均为可选，吞掉回调内异常避免中断适配层） */
function _fire(cb: any, ...args: any[]) {
  try { if (typeof cb === 'function') cb(...args); } catch (e) {}
}

const shim: any = {
  runtime: {
    lastError: undefined,
    sendMessage(message: any, callback?: any) {
      if (!message || typeof message.action !== 'string') { _fire(callback, { ok: false }); return; }

      if (message.action === 'xs_fetch') {
        // 仅转发 http(s)，与 background 的 SSRF 白名单保持一致
        let _u: URL | null = null;
        try { _u = new URL(message.url); } catch (e) { _u = null; }
        if (!_u || !/^https?:$/.test(_u.protocol)) {
          _fire(callback, { ok: false, status: 0, error: '拒绝非 http(s) 请求' });
          return;
        }
        const headers: Record<string, string> = { ...(message.headers || {}) };
        if ((message.method || 'GET') === 'POST' && message.body && !headers['Content-Type']) {
          headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        }
        try {
          GM_xmlhttpRequest({
            method: message.method || 'GET',
            url: message.url,
            headers,
            // [修复] 未转发请求体：油猴模式下 POST 会变成空 body，与 background 行为不一致
            data: message.body,
            timeout: message.timeout || 15000,
            anonymous: false,
            onload: (res: any) => _fire(callback, { ok: true, status: res.status, finalUrl: res.finalUrl, body: res.responseText }),
            onerror: (err: any) => _fire(callback, { ok: false, status: 0, error: (err && err.errorText) || '请求失败' }),
            ontimeout: () => _fire(callback, { ok: false, status: 0, error: '请求超时' }),
          });
        } catch (e: any) {
          _fire(callback, { ok: false, status: 0, error: String((e && e.message) || e) });
        }
        return;
      }

      if (message.action === 'xs_open_tab') {
        try { GM_openInTab(message.url, { active: !!message.active, insert: true, setParent: true }); } catch (e) {}
        _fire(callback, { ok: true });
        return;
      }

      _fire(callback, { ok: false, error: '油猴模式不支持的消息: ' + message.action });
    },
  },

  storage: {
    local: {
      /** get(null|key|keys[]|{key:default}, cb) → cb(items) —— 同步语义（GM API 本身同步），与原预加载流程兼容 */
      get(keys: any, callback?: any) {
        let out: Record<string, any> = {};
        try {
          if (keys === null || keys === undefined) {
            const names: string[] = GM_listValues();
            for (let i = 0; i < names.length; i++) out[names[i]] = GM_getValue(names[i]);
          } else if (typeof keys === 'string') {
            out = {}; out[keys] = GM_getValue(keys);
          } else if (Array.isArray(keys)) {
            keys.forEach((k: string) => { out[k] = GM_getValue(k); });
          } else if (typeof keys === 'object') {
            Object.keys(keys).forEach((k) => { out[k] = GM_getValue(k, keys[k]); });
          }
        } catch (e) {}
        _fire(callback, out);
      },
      set(obj: any, callback?: any) {
        try { Object.keys(obj || {}).forEach((k) => GM_setValue(k, obj[k])); } catch (e) {}
        _fire(callback);
      },
      remove(key: any, callback?: any) {
        try {
          const ks: string[] = typeof key === 'string' ? [key] : Array.isArray(key) ? key : Object.keys(key || {});
          ks.forEach((k) => GM_deleteValue(k));
        } catch (e) {}
        _fire(callback);
      },
    },
  },
};

// 无条件覆盖页面自带的 window.chrome（见文件头注释）
const _g: any = typeof globalThis !== 'undefined' ? globalThis : window;
_g.chrome = shim;
try { (window as any).chrome = shim; } catch (e) {}

export {};
