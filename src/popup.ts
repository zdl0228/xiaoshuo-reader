/* =============================================================
 * popup.ts — 小说阅读助手 扩展版 popup（Manifest V3）
 * 职责：按站点启用/关闭阅读助手。
 *
 * 样式：完全自包含（见 src/popup.html），不再内联设置面板的 preferences.css。
 *       preferences.css 是给「页面内全屏浮层」用的，套进 popup 独立文档会引入
 *       独立 body{} 根规则 / 圆角卡片 / 半透明底色 / 浮层投影，导致方形窗口里
 *       再套一张圆角卡片（外层白、内层绿）等叠层问题。
 *       皮肤跟随改为只读 skin_name，在 <body> 上挂 .dark / .eye 类，切换几组 CSS 变量。
 *
 * 逻辑：
 *  - 显示当前活动标签页域名
 *  - 读取 chrome.storage.local['enabled_sites'] 判断该域名是否已启用
 *  - 「在此网站启用阅读助手」→ 写入 enabled_sites → content 端经 storage.onChanged
 *    与 xs_site_changed 消息双通道立即响应
 * 存储键与 content.ts 完全一致（enabled_sites，域名粒度，持久化=下次访问自动激活）
 * ============================================================= */

(function () {
  'use strict';

  // ---- 皮肤跟随：与设置面板 skin_name 取值一致（默认 / 深色 / 护眼 / 自动） ----
  function applySkin(skinName: string) {
    const skin = String(skinName || '默认');
    const dark = skin === '深色' ||
      (skin === '自动' && !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches));
    const eye = !dark && skin.indexOf('护眼') !== -1;
    // [修复] 皮肤变量原来只挂在 <body> 上：<html> 仍取 :root 的浅色 --bg，
    // 深色/护眼下弹窗底部与右侧（body 只有 186px 宽/内容高度）会露出浅色窗口底。
    // 同时挂到 documentElement，html 与 body 都变成皮肤色，整窗铺满不留白。
    const roots = [document.documentElement, document.body];
    for (const root of roots) {
      if (!root) continue;
      root.classList.toggle('dark', dark);
      root.classList.toggle('eye', eye);
    }
  }

  function $(id: string): HTMLElement | null { return document.getElementById(id); }

  // 先按默认皮肤渲染，storage 读回后立即纠正（避免闪烁）
  applySkin('默认');

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs && tabs[0];
    const url = tab && tab.url ? tab.url : '';
    let hostname = '';
    try { hostname = new URL(url).hostname; } catch (e) {}

    try {
      chrome.storage.local.get({ skin_name: '默认' }, function (items: any) {
        applySkin(items && items.skin_name);
      });
    } catch (e) {}

    const $site = $('site');
    const $enable = $('item-enable');
    const $disable = $('item-disable');
    if (!$site || !$enable || !$disable) return;

    if (!hostname) {
      $site.textContent = '无法获取当前页面地址';
      $enable.classList.add('disabled');
      $disable.classList.add('disabled');
      return;
    }
    $site.textContent = hostname;
    $site.title = hostname;

    function render(en: boolean) {
      $enable!.classList.toggle('selected', en);
      $disable!.classList.toggle('selected', !en);
    }

    // 域名覆盖判断，与 content.ts 的 app.isSiteEnabled 口径完全一致：
    // 已启用列表里可能是父域名（qidian.com），它能覆盖子域名（www.qidian.com）。
    // [修复] 原实现只做精确字符串比较：父域名启用时 popup 会显示「未启用」，
    // 且点「关闭」删不到任何条目 → 看着像按钮点了没反应。
    function covers(h: string, t: string) {
      return t === h || (!!t && h.length > t.length && h.slice(-(t.length + 1)) === '.' + t);
    }
    function isEnabledInList(list: string[]) {
      const h = hostname.toLowerCase();
      return list.some(function (x: any) { return covers(h, String(x || '').toLowerCase()); });
    }

    function readEnabled(cb: (en: boolean) => void) {
      chrome.storage.local.get({ enabled_sites: [] }, function (items: any) {
        const list: string[] = (items && items.enabled_sites) || [];
        cb(isEnabledInList(list));
      });
    }

    function setEnabled(on: boolean) {
      chrome.storage.local.get({ enabled_sites: [] }, function (items: any) {
        let list: string[] = (items && items.enabled_sites) || [];
        const h = hostname.toLowerCase();
        if (on) {
          if (!isEnabledInList(list)) list.push(h);
        } else {
          // 删除所有覆盖当前域名的条目（父域名启用时也能真正关掉）
          list = list.filter(function (x: any) { return !covers(h, String(x || '').toLowerCase()); });
        }
        chrome.storage.local.set({ enabled_sites: list }, function () {
          render(on);
          // 双保险：直接通知本页 content script 立即刷新（storage.onChanged 兜底）
          try {
            if (tab && tab.id) {
              chrome.tabs.sendMessage(tab.id, { action: 'xs_site_changed' }, function () {
                void chrome.runtime.lastError; // 无接收端（页面未注入）时静默，刷新页面即可
              });
            }
          } catch (e) {}
          // [修复] 点完不关窗，popup 一直盖在页面上，用户看不到页面发生了什么，
          // 会误以为「点了没反应」。留一帧渲染对勾后自动收起，让页面变化直接可见。
          setTimeout(function () {
            try { window.close(); } catch (e) {}
          }, 120);
        });
      });
    }

    readEnabled(render);

    $enable.addEventListener('click', function () { setEnabled(true); });
    $disable.addEventListener('click', function () { setEnabled(false); });
  });
})();
