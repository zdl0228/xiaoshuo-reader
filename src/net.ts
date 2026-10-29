/* =============================================================
 * 小说阅读助手 网络层（net.ts）—— MV3 ES module
 * ---------------------------------------------------------------------
 * 职责：跨域请求经 background 转发（绕过 CORS）+ Promise 包装。
 * 依赖：chrome.runtime（sendMessage → background 'xs_fetch'）。
 * 被 sites.ts 引用（Request）；content.ts 经此间接使用（主逻辑无直接引用）。
 * 原实现位于 content.ts 运行时库（Net）+ 主逻辑（Request），本文件为归类拆分。
 * ============================================================= */

'use strict';

// ---- 跨域请求（经 background 转发，绕过 CORS） ----
export let Net = {
  fetch: function (details: any) {
    let onload = details.onload, onerror = details.ontimeout || details.onerror;
    chrome.runtime.sendMessage(
      {
        action: 'xs_fetch',
        url: details.url,
        method: details.method || 'GET',
        headers: details.headers || {},
        // [修复] 原实现没转发 body：background / 油猴适配层都支持 POST body，
        // 但这里把它丢了，任何 POST 请求都会变成空 body 发出（站点会返回错误页）。
        body: details.body,
        timeout: details.timeout || 15000
      },
      function (resp) {
        if (chrome.runtime.lastError) {
          if (onerror) onerror({ status: 0, responseText: '', finalUrl: '', error: chrome.runtime.lastError.message });
          return;
        }
        if (resp && resp.ok) {
          if (onload) onload({ status: resp.status, responseText: resp.body, finalUrl: resp.finalUrl, headers: resp.headers, readyState: 4 });
        } else {
          if (onerror) onerror({ status: resp && resp.status || 0, responseText: '', finalUrl: '', error: resp && resp.error });
        }
      }
    );
  }
};

// Net.fetch Promise 版（原 content.ts 主逻辑 Request，sites.ts 个别第三方书源分支引用）
export function Request(options: any) {
  return new Promise<any>((resolve, reject) => {
    options.onerror = options.ontimeout = reject;
    options.onload = resolve;
    Net.fetch(options);
  });
}
