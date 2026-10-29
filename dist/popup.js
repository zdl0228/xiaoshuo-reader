"use strict";
(() => {
  // src/popup.ts
  (function() {
    "use strict";
    function applySkin(skinName) {
      const skin = String(skinName || "默认");
      const dark = skin === "深色" || skin === "自动" && !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
      const eye = !dark && skin.indexOf("护眼") !== -1;
      const roots = [document.documentElement, document.body];
      for (const root of roots) {
        if (!root) continue;
        root.classList.toggle("dark", dark);
        root.classList.toggle("eye", eye);
      }
    }
    function $(id) {
      return document.getElementById(id);
    }
    applySkin("默认");
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const tab = tabs && tabs[0];
      const url = tab && tab.url ? tab.url : "";
      let hostname = "";
      try {
        hostname = new URL(url).hostname;
      } catch (e) {
      }
      try {
        chrome.storage.local.get({ skin_name: "默认" }, function(items) {
          applySkin(items && items.skin_name);
        });
      } catch (e) {
      }
      const $site = $("site");
      const $enable = $("item-enable");
      const $disable = $("item-disable");
      if (!$site || !$enable || !$disable) return;
      if (!hostname) {
        $site.textContent = "无法获取当前页面地址";
        $enable.classList.add("disabled");
        $disable.classList.add("disabled");
        return;
      }
      $site.textContent = hostname;
      $site.title = hostname;
      function render(en) {
        $enable.classList.toggle("selected", en);
        $disable.classList.toggle("selected", !en);
      }
      function covers(h, t) {
        return t === h || !!t && h.length > t.length && h.slice(-(t.length + 1)) === "." + t;
      }
      function isEnabledInList(list) {
        const h = hostname.toLowerCase();
        return list.some(function(x) {
          return covers(h, String(x || "").toLowerCase());
        });
      }
      function readEnabled(cb) {
        chrome.storage.local.get({ enabled_sites: [] }, function(items) {
          const list = items && items.enabled_sites || [];
          cb(isEnabledInList(list));
        });
      }
      function setEnabled(on) {
        chrome.storage.local.get({ enabled_sites: [] }, function(items) {
          let list = items && items.enabled_sites || [];
          const h = hostname.toLowerCase();
          if (on) {
            if (!isEnabledInList(list)) list.push(h);
          } else {
            list = list.filter(function(x) {
              return !covers(h, String(x || "").toLowerCase());
            });
          }
          chrome.storage.local.set({ enabled_sites: list }, function() {
            render(on);
            try {
              if (tab && tab.id) {
                chrome.tabs.sendMessage(tab.id, { action: "xs_site_changed" }, function() {
                  void chrome.runtime.lastError;
                });
              }
            } catch (e) {
            }
            setTimeout(function() {
              try {
                window.close();
              } catch (e) {
              }
            }, 120);
          });
        });
      }
      readEnabled(render);
      $enable.addEventListener("click", function() {
        setEnabled(true);
      });
      $disable.addEventListener("click", function() {
        setEnabled(false);
      });
    });
  })();
})();
