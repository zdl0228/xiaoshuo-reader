/* =============================================================
 * 小说阅读助手 自研 DOM 工具层（dom.js）—— 原生 MV3 实现
 * ---------------------------------------------------------------------
 * 本文件是项目的自研 DOM 工具层（轻量链式集合 API）。
 * 全部使用原生 querySelector / createElement / addEventListener 实现，
 * 对外暴露单一入口 XS()，提供轻量链式集合与事件封装。
 *
 * 支持的语义（对齐原 content.js / sites.js 的全部用法）：
 *   - 选择器 / 创建 / 包装：XS('#id')、XS(el)、XS('<div class="x">')、XS(document/window)、
 *     XS(nodelist/array)、XS(fn)（DOM ready 回调）
 *   - 集合方法：each / map / filter / find / first / last / eq / get / length /
 *     closest / is / parent / children / not / addBack / toggle
 *   - 内容与属性：text / html / val / attr / prop / css / removeAttr /
 *     addClass / removeClass / hasClass
 *   - DOM 操作：append / appendTo / prepend / prependTo / remove /
 *     replaceWith / hide / show / fadeIn / fadeOut
 *   - 事件：on / off（含命名空间与委托）/ trigger / click / change / scroll
 *   - 几何：offset / scrollTop / height
 *   - 静态：XS.nano（模板）、XS.expr（扩展选择器注册表）
 *   - 扩展选择器（由底层解析支持）：
 *       :contains('text')  :econtains('text')  :first  :last
 *       :visible  :selected  :not(a, b, …)
 * ============================================================= */

'use strict';

/* ------------------------------------------------------------------
 * 扩展选择器注册表（供自研选择器解析使用）
 * ------------------------------------------------------------------ */
  var expr = {};

  // 判断字符串是否含扩展伪类
  function _hasExtPseudo(selector: string) {
    return /:contains\(|:econtains\(|:first(?!-child)|:last(?!-child)|:visible|:selected|:eq\(|:not\(|:checkbox|:radio|:text|:password|:file|:image|:reset|:submit|:button|:input|:checked|:disabled|:enabled/.test(selector);
  }

  // 将扩展伪类从选择器中提取出来，返回 { cleanSelector, filters }，
  // filters 为应用在匹配元素上的过滤函数列表。
  function _extractExtPseudos(selector: string) {
    var filters: any[] = [];
    var remaining = selector;

    // 表单伪类 → 过滤器（:checkbox / :button 等原生 CSS 不支持，须剥离为过滤器；
    // 不能做字符串替换——"input:checkbox" 若换成 "input[type=checkbox]" 会拼成无效的
    // "inputinput[...]"，剥离为 filter 则与标签前缀正确组合）
    var _formPseudoFilters: { [key: string]: any } = {
      ':checkbox': function (this: any, el: any) { return el.tagName === 'INPUT' && el.type === 'checkbox'; },
      ':radio': function (this: any, el: any) { return el.tagName === 'INPUT' && el.type === 'radio'; },
      ':text': function (this: any, el: any) { return el.tagName === 'INPUT' && el.type === 'text'; },
      ':password': function (this: any, el: any) { return el.tagName === 'INPUT' && el.type === 'password'; },
      ':file': function (this: any, el: any) { return el.tagName === 'INPUT' && el.type === 'file'; },
      ':image': function (this: any, el: any) { return el.tagName === 'INPUT' && el.type === 'image'; },
      ':reset': function (this: any, el: any) { return el.tagName === 'INPUT' && el.type === 'reset'; },
      ':submit': function (this: any, el: any) { return (el.tagName === 'INPUT' && el.type === 'submit') || (el.tagName === 'BUTTON' && el.type === 'submit'); },
      ':button': function (this: any, el: any) { return el.tagName === 'BUTTON' || (el.tagName === 'INPUT' && el.type === 'button'); },
      ':input': function (this: any, el: any) { var t = el.tagName; return t === 'INPUT' || t === 'SELECT' || t === 'TEXTAREA' || t === 'BUTTON'; }
    };
    for (var _fp in _formPseudoFilters) {
      if (Object.prototype.hasOwnProperty.call(_formPseudoFilters, _fp)) {
        (function (fn) {
          remaining = remaining.replace(new RegExp(_fp.replace(':', '\\:') + '(?![\\w-])', 'g'), function () {
            filters.push(fn);
            return '';
          });
        })(_formPseudoFilters[_fp]);
      }
    }

    // 提取 :contains('text') —— 支持中文内容与引号包裹
    remaining = remaining.replace(/:contains\(\s*(['"])(.*?)\1\s*\)/g, function (m: any, q: any, text: any) {
      filters.push(function (el: any) {
        var t = (el.textContent || el.innerText || '').toLowerCase();
        return t.indexOf(text.toLowerCase()) !== -1;
      });
      return '';
    });

    // 提取不带引号的 :contains(text)（如 sites.js 的 :contains(书页)）
    remaining = remaining.replace(/:contains\(\s*([^'"]\S*?)\s*\)/g, function (m: any, text: any) {
      filters.push(function (el: any) {
        var t = (el.textContent || el.innerText || '').toLowerCase();
        return t.indexOf(text.toLowerCase()) !== -1;
      });
      return '';
    });

    // 提取 :econtains('text') —— 完全相等匹配
    remaining = remaining.replace(/:econtains\(\s*(['"])(.*?)\1\s*\)/g, function (m: any, q: any, text: any) {
      filters.push(function (el: any) {
        return (el.textContent || el.innerText || '').toLowerCase() === text.toLowerCase();
      });
      return '';
    });

    // 提取 :visible
    remaining = remaining.replace(/:visible/g, function () {
      filters.push(function (el: any) {
        return _isVisible(el);
      });
      return '';
    });

    // 提取 :selected —— 仅对 option/input 生效
    remaining = remaining.replace(/:selected/g, function () {
      filters.push(function (el: any) {
        if (el.tagName === 'OPTION') return el.selected;
        if (el.tagName === 'INPUT') return el.checked;
        return false;
      });
      return '';
    });

    // 提取 :first / :last（注意排除 :first-child / :last-child，它们原生支持）
    // 把 :first / :last 视作位置过滤（作用于匹配集合内）
    var firstLast: any[] = [];
    remaining = remaining.replace(/:(first|last)(?!-child)/g, function (m: any, w: any) {
      firstLast.push(w);
      return '';
    });

    // 提取 :eq(n)
    remaining = remaining.replace(/:eq\(\s*(-?\d+)\s*\)/g, function (m: any, n: any) {
      firstLast.push('eq:' + n);
      return '';
    });

    // 提取 :not(...) —— 支持多参数（排除匹配任一参数的）
    // 注意：原生 CSS :not(a, b) 也支持多参数，但这里统一自研处理，避免依赖浏览器版本
    var notList: any[] = [];
    remaining = remaining.replace(/:not\(\s*([^)]*)\s*\)/g, function (m: any, inner: any) {
      notList.push(inner);
      return '';
    });

    return {
      cleanSelector: remaining.trim(),
      filters: filters,
      firstLast: firstLast,
      notList: notList
    };
  }

  // 按顶层逗号拆分成多个独立选择器（保留引号/括号结构），用于「或」语义。
  // 原实现把逗号分隔的选择器组整体剥离扩展伪类后 AND 过滤，导致
  // a:contains('下一页'), a:contains('下一章') 被误当成必须同时满足，命中恒为 0。
  function _splitByComma(selector: string) {
    var parts: string[] = [], depth = 0, quote = null, cur = '';
    for (var i = 0; i < selector.length; i++) {
      var c = selector.charAt(i);
      if (quote) {
        if (c === quote) quote = null;
        cur += c;
        continue;
      }
      if (c === "'" || c === '"') { quote = c; cur += c; continue; }
      if (c === '(') depth++;
      else if (c === ')') depth--;
      if (c === ',' && depth === 0) {
        parts.push(cur); cur = '';
        continue;
      }
      cur += c;
    }
    if (cur) parts.push(cur);
    return parts;
  }

  // 执行一条（可能含扩展伪类的）选择器，返回元素数组
  function _queryAll(root: any, selector: any) {
    var elList;

    // 支持元素 / 节点 / QCollection 作为 selector（find(元素) 返回该元素本身）
    if (selector && selector.nodeType) {
      if (!root || !root.querySelectorAll) return [selector];
      return (root === selector || (root.contains ? root.contains(selector) : false)) ? [selector] : [];
    }
    if (selector instanceof QCollection) {
      return selector.get();
    }

    if (root.querySelectorAll) {
      try {
        // 若含扩展伪类，则剥离后原生查询 + 过滤；否则直接原生查询
        if (_hasExtPseudo(selector)) {
          // 逗号分隔的选择器组为「或」关系：
          // 先按顶层逗号拆成独立子选择器，逐段剥离扩展伪类并查询，最后合并去重。
          var subs = _splitByComma(selector);
          var merged: any[] = [];
          for (var si = 0; si < subs.length; si++) {
            var sub = subs[si].trim();
            if (!sub) continue;
            var parsed = _extractExtPseudos(sub);
            var base = parsed.cleanSelector;
            var baseEls: any[] = [];
            if (base) {
              baseEls = Array.prototype.slice.call(root.querySelectorAll(base));
            } else {
              // 纯伪类选择器（如 :visible / :input）—— 以 root 下全部元素为候选，再套用过滤器
              baseEls = Array.prototype.slice.call(root.querySelectorAll('*'));
            }
            // 应用 not 过滤
            if (parsed.notList.length) {
              baseEls = baseEls.filter(function (this: any, el) {
                return !parsed.notList.some(function (sel) {
                  return el.matches && el.matches(sel.trim());
                });
              });
            }
            // 应用内容/可见/选中过滤（同一子选择器内为「且」）
            parsed.filters.forEach(function (f) {
              baseEls = baseEls.filter(f);
            });
            // 应用 first / last / eq 位置过滤
            var posEls = baseEls;
            parsed.firstLast.forEach(function (pos) {
              if (pos === 'first') posEls = posEls.slice(0, 1);
              else if (pos === 'last') posEls = posEls.slice(-1);
              else if (pos.indexOf('eq:') === 0) {
                var i = parseInt(pos.slice(3), 10);
                posEls = i < 0 ? posEls.slice(i) : posEls.slice(i, i + 1);
              }
            });
            for (var mj = 0; mj < posEls.length; mj++) {
              if (merged.indexOf(posEls[mj]) === -1) merged.push(posEls[mj]);
            }
          }
          return merged;
        }
        elList = root.querySelectorAll(selector);
      } catch (e) {
        return [];
      }
    } else {
      return [];
    }
    return Array.prototype.slice.call(elList);
  }

  function _isVisible(el: any) {
    if (!el || el.nodeType !== 1) return false;
    if (el.style && el.style.display === 'none') return false;
    var style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  // [安全] sanitize HTML：清理所有可能的恶意代码，防止 XSS 攻击
  // 功能：删除所有 on* 属性（onclick、onerror、onload 等）、删除 javascript: 协议链接
  function _sanitizeHtml(doc: Document) {
    // 1. 删除所有 on* 属性
    var allElements = doc.querySelectorAll('*');
    for (var i = 0; i < allElements.length; i++) {
      var el = allElements[i];
      var attrs = el.attributes;
      for (var j = attrs.length - 1; j >= 0; j--) {
        var attrName = attrs[j].name.toLowerCase();
        if (attrName.startsWith('on')) {
          el.removeAttribute(attrs[j].name);
        }
      }
    }

    // 2. 删除所有 javascript: 协议的链接
    var links = doc.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (href && href.toLowerCase().startsWith('javascript:')) {
        links[i].removeAttribute('href');
      }
    }

    // 3. 删除所有 script 标签（虽然 innerHTML 插入的 script 不会执行，但是保险起见）
    var scripts = doc.querySelectorAll('script');
    for (var i = 0; i < scripts.length; i++) {
      scripts[i].parentNode?.removeChild(scripts[i]);
    }
  }

  // 由 HTML 字符串创建元素数组（XS('<div>') 创建模式）
  function _createFromHtml(html: any) {
    var doc = document.implementation.createHTMLDocument('');
    doc.body.innerHTML = html.trim();
    // [安全] sanitize HTML，防止 XSS 攻击
    _sanitizeHtml(doc);
    var out: any[] = [];
    for (var i = 0; i < doc.body.childNodes.length; i++) {
      out.push(doc.body.childNodes[i]);
    }
    return out;
  }

  function _wrap(nodes: any, _extra?: any) {
    return new (QCollection as any)(nodes);
  }

  /* ------------------------------------------------------------------
   * 集合类
   * ------------------------------------------------------------------ */
  function QCollection(this: any, elements: any, prevObject?: any) {
    this.length = 0;
    for (var i = 0; i < elements.length; i++) {
      // window 没有 nodeType，须与 document/element 一视同仁
      if (elements[i] && (elements[i].nodeType || elements[i] === window)) {
        this[i] = elements[i];
        this.length++;
      }
    }
    this.prevObject = prevObject || null;
  }

  // 支持数组式 push（content.js 有 _headings.push(this) 用法）
  // push 现定义在下方 QCollection.prototype 字面量内；此处若单独定义会被下方
  // `QCollection.prototype = {...}` 整体覆盖而丢失（历史根因，勿再这样写）。

  QCollection.prototype = {
    // 支持数组式 push（content.js 有 _headings.push(this) 用法）
    // 注意：不可删除。此前在旧 prototype 上单独定义 push，随后本行整体替换
    // prototype 导致 push 丢失 → content.js 标题识别 _headings.push(this) 抛
    // "push is not a function"。push 必须留在本字面量内。
    push: function (this: any, el: any) {
      if (el && el.nodeType) {
        this[this.length] = el;
        this.length++;
      }
      return this.length;
    },
    // 遍历，回调 this 为原生元素
    each: function (this: any, fn: any) {
      for (var i = 0; i < this.length; i++) {
        if (fn.call(this[i], i, this[i]) === false) break;
      }
      return this;
    },
    map: function (this: any, fn: any) {
      var out: any[] = [];
      this.each(function (this: any, i: any, el: any) {
        var r = fn.call(el, i, el);
        if (r !== undefined && r !== null) out.push(r);
      });
      return _wrap(out);
    },
    filter: function (this: any, fnOrSel: any) {
      var out: any[] = [];
      this.each(function (this: any, i: any, el: any) {
        var ok;
        if (typeof fnOrSel === 'function') ok = fnOrSel.call(el, i, el);
        else ok = _matchesSelector(el, fnOrSel);
        if (ok) out.push(el);
      });
      return _wrap(out);
    },
    find: function (this: any, selector: any) {
      var out: any[] = [];
      this.each(function (this: any) {
        var found = _queryAll(this, selector);
        found.forEach(function (el: any) {
          if (out.indexOf(el) === -1) out.push(el);
        });
      });
      return _wrap(out, this);
    },
    first: function (this: any) { return this.eq(0); },
    eq: function (this: any, i: any) {
      if (i < 0) i = this.length + i;
      if (i < 0 || i >= this.length) return _wrap([]);
      return _wrap([this[i]]);
    },
    get: function (this: any, i?: any) {
      if (i === undefined) {
        var arr: any[] = [];
        for (var j = 0; j < this.length; j++) arr.push(this[j]);
        return arr;
      }
      if (i < 0) i = this.length + i;
      return i >= 0 && i < this.length ? this[i] : undefined;
    },
    closest: function (this: any, selector: any) {
      var out: any[] = [];
      this.each(function (this: any) {
        var el = this;
        while (el && el.nodeType === 1) {
          if (_matchesSelector(el, selector)) {
            if (out.indexOf(el) === -1) out.push(el);
            break;
          }
          el = el.parentElement;
        }
      });
      return _wrap(out);
    },
    is: function (this: any, selector: any) {
      if (typeof selector === 'function') {
        var r = false;
        this.each(function (this: any, i: any, el: any) { if (selector.call(el, i, el)) { r = true; return false; } });
        return r;
      }
      return this.length > 0 && _matchesSelector(this[0], selector);
    },
    parent: function (this: any) {
      var out: any[] = [];
      this.each(function (this: any) {
        var p = this.parentElement;
        if (p && out.indexOf(p) === -1) out.push(p);
      });
      return _wrap(out);
    },
    children: function (this: any, selector: any) {
      var out: any[] = [];
      this.each(function (this: any) {
        for (var i = 0; i < this.children.length; i++) {
          var c = this.children[i];
          if (!selector || _matchesSelector(c, selector)) {
            if (out.indexOf(c) === -1) out.push(c);
          }
        }
      });
      return _wrap(out);
    },
    addBack: function (this: any, selector: any) {
      var out: any[] = [];
      this.each(function (this: any) {
        if (out.indexOf(this) === -1) out.push(this);
      });
      // 合并前一个集合（prevObject），可选选择器过滤
      var prev = this.prevObject || _wrap([]);
      prev.each(function (this: any) {
        if (selector && !_matchesSelector(this, selector)) return;
        if (out.indexOf(this) === -1) out.push(this);
      });
      return _wrap(out);
    },
    index: function (this: any, subject: any) {
      var i;
      if (subject === undefined) {
        var first = this[0];
        if (!first || !first.parentNode) return -1;
        var sib = first.parentNode.children;
        for (i = 0; i < sib.length; i++) {
          if (sib[i] === first) return i;
        }
        return -1;
      }
      if (typeof subject === 'string') {
        for (i = 0; i < this.length; i++) {
          if (_matchesSelector(this[i], subject)) return i;
        }
        return -1;
      }
      for (i = 0; i < this.length; i++) {
        if (this[i] === subject) return i;
      }
      return -1;
    },
    toggle: function (this: any) {
      this.each(function (this: any) {
        var d = getComputedStyle(this).display;
        this.style.display = (d === 'none') ? '' : 'none';
      });
      return this;
    },

    /* ---------- 文本 / HTML / 值 ---------- */
    text: function (this: any, v: any) {
      if (v === undefined) {
        if (!this.length) return '';
        return this[0].textContent || '';
      }
      this.each(function (this: any) { this.textContent = String(v); });
      return this;
    },
    html: function (this: any, v: any) {
      if (v === undefined) {
        if (!this.length) return '';
        return this[0].innerHTML || '';
      }
      this.each(function (this: any) { this.innerHTML = String(v); });
      return this;
    },
    val: function (this: any, v: any) {
      if (v === undefined) {
        if (!this.length) return undefined;
        return this[0].value;
      }
      this.each(function (this: any) { this.value = v; });
      return this;
    },

    /* ---------- 属性 ---------- */
    attr: function (this: any, name: any, value: any) {
      if (typeof name === 'object') {
        // attr({a:1, b:2})
        var map = name;
        this.each(function (this: any) {
          for (var k in map) {
            if (Object.prototype.hasOwnProperty.call(map, k)) {
              this.setAttribute(k, String(map[k]));
            }
          }
        });
        return this;
      }
      if (value === undefined) {
        if (!this.length) return undefined;
        var v = this[0].getAttribute(name);
        return v === null ? undefined : v;
      }
      this.each(function (this: any) { this.setAttribute(name, String(value)); });
      return this;
    },
    prop: function (this: any, name: any, value: any) {
      if (value === undefined) {
        if (!this.length) return undefined;
        return this[0][name];
      }
      this.each(function (this: any) { this[name] = value; });
      return this;
    },
    removeAttr: function (this: any, name: any) {
      var names = name.split(/\s+/);
      this.each(function (this: any) {
        names.forEach(function (this: any, n: any) { if (n) this.removeAttribute(n); }.bind(this));
      });
      return this;
    },
    addClass: function (this: any, cls: any) {
      var names = String(cls).split(/\s+/);
      this.each(function (this: any) {
        names.forEach(function (this: any, n: any) { if (n) this.classList.add(n); }.bind(this));
      });
      return this;
    },
    removeClass: function (this: any, cls: any) {
      var names = String(cls).split(/\s+/);
      this.each(function (this: any) {
        names.forEach(function (this: any, n: any) { if (n) this.classList.remove(n); }.bind(this));
      });
      return this;
    },
    hasClass: function (this: any, cls: any) {
      return this.length > 0 && this[0].classList.contains(cls);
    },

    /* ---------- CSS ---------- */
    css: function (this: any, name: any, value: any) {
      // css('cssText', str) —— 设置整段内联样式
      if (name === 'cssText') {
        this.each(function (this: any) { this.style.cssText = String(value); });
        return this;
      }
      if (typeof name === 'object') {
        var map2 = name;
        this.each(function (this: any) {
          for (var k in map2) {
            if (Object.prototype.hasOwnProperty.call(map2, k)) {
              // [修复] setProperty 只认 CSS 属性名（kebab-case）。这里传的是 JS 风格键
              // （zIndex / borderRadius / backdropFilter / WebkitBackdropFilter…），
              // 直接 setProperty('zIndex') 在严格实现下是空操作 → 提示层/面板整块样式丢失。
              // 统一转成 kebab-case；--custom-property 原样保留。
              this.style.setProperty(_cssPropName(k), String(map2[k]));
            }
          }
        });
        return this;
      }
      if (value === undefined) {
        if (!this.length) return undefined;
        return getComputedStyle(this[0]).getPropertyValue(name) || this[0].style[name] || '';
      }
      this.each(function (this: any) {
        if (/^--/.test(name)) this.style.setProperty(name, String(value));
        else this.style[name] = String(value);
      });
      return this;
    },

    /* ---------- DOM 操作 ---------- */
    append: function (this: any, content: any) {
      this.each(function (this: any) {
        _appendContent(this, content);
      });
      return this;
    },
    appendTo: function (this: any, target: any) {
      var t = _resolveTarget(target);
      var self = this;
      t.each(function (this: any) {
        var targetEl = this;
        self.each(function (this: any) {
          targetEl.appendChild(this);
        });
      });
      return this;
    },
    prepend: function (this: any, content: any) {
      this.each(function (this: any) {
        _prependContent(this, content);
      });
      return this;
    },
    prependTo: function (this: any, target: any) {
      var t = _resolveTarget(target);
      var self = this;
      t.each(function (this: any) {
        var targetEl = this;
        self.each(function (this: any) {
          targetEl.insertBefore(this, targetEl.firstChild);
        });
      });
      return this;
    },
    remove: function (this: any) {
      this.each(function (this: any) {
        if (this.parentNode) this.parentNode.removeChild(this);
      });
      return this;
    },

    // DOM 层净化：删除隐藏元素/章节标题/contentRemove 指定元素/整块杂质文本块
    // 供正文提取时统一净化（替代原 applyDomClean），净化逻辑收拢在 dom 层、始终执行，不再由设置开关控制
    // opts: { contentRemove: 选择器(全局规则), extraRemove: 选择器(站点规则), trashReg: 整块杂质文本正则(必传，来自数据层 PurifyRules.trashBlockReg), log: 回调({hide,heading,remove,block}) }
    cleanContent: function (this: any, opts: any) {
      opts = opts || {};
      var _cnt = { hide: 0, heading: 0, remove: 0, block: 0 };
      // 删除不可见/非正文节点：script / style / noscript / template / iframe / svg
      // （parseHTML 现在保留 <script> 供站点规则读取内联参数，这些脚本文本绝不能混进正文）
      var _s = this.find('script, style, noscript, template, iframe, svg');
      _cnt.remove += _s.length; _s.remove();
      // 删除隐藏元素（起点隐藏段评数字/弹幕等用 display:none，CSS 被移除后隐藏失效）
      var _h = this.find('[style*="display:none"], [style*="display: none"], [hidden], [aria-hidden="true"]');
      _cnt.hide = _h.length; _h.remove();
      // 删除章节标题
      var _hd = this.find('h1, h2, h3, h4, h5, h6, [role="heading"]');
      _cnt.heading = _hd.length; _hd.remove();
      // contentRemove：全局规则 + 站点规则
      if (opts.contentRemove) {
        var _r = this.find(opts.contentRemove);
        _cnt.remove += _r.length; _r.remove();
      }
      if (opts.extraRemove) {
        var _r2 = this.find(opts.extraRemove);
        _cnt.remove += _r2.length; _r2.remove();
      }
      // 整块杂质按文本精确删除（本章说/打赏/扫一扫/底部导航等独立成块的控件，先于文本提取移除，避免混入正文）
      // 净化规则数据由调用方经 opts.trashReg 传入（来源：PurifyRules.trashBlockReg），引擎只执行
      var trashReg = opts.trashReg;
      if (trashReg) {
        this.find('div, p, span, a, button, li, section, h4, h5, h6').each(function (this: any) {
          var $t = XS(this);
          var txt = ($t.text() || '').replace(/\s+/g, '');
          if (!txt) return;
          if (trashReg.test(txt)) {
            $t.remove();
            _cnt.block++;
          }
        });
      }
      if (typeof opts.log === 'function') opts.log(_cnt);
      return this;
    },

    replaceWith: function (this: any, content: any) {
      this.each(function (this: any) {
        var els = _contentToElements(content);
        var parent = this.parentNode;
        if (!parent) return;
        var ref = this;
        els.forEach(function (el: any) {
          parent.insertBefore(el, ref);
        });
        parent.removeChild(ref);
      });
      return this;
    },

    /* ---------- 显示 ---------- */
    hide: function (this: any) {
      this.each(function (this: any) {
        this.style.display = 'none';
      });
      return this;
    },
    show: function (this: any) {
      this.each(function (this: any) {
        this.style.display = '';
      });
      return this;
    },
    fadeIn: function (this: any, dur: any) {
      var ms = dur === 'fast' ? 300 : dur === 'slow' ? 600 : (typeof dur === 'number' ? dur : 300);
      this.each(function (this: any) {
        var el = this;
        el.style.opacity = '0';
        el.style.display = '';
        el.style.transition = 'opacity ' + (ms / 1000) + 's ease';
        requestAnimationFrame(function () {
          el.style.opacity = '1';
        });
        setTimeout(function () {
          el.style.transition = '';
        }, ms + 50);
      });
      return this;
    },
    fadeOut: function (this: any, dur: any) {
      var ms = dur === 'fast' ? 300 : dur === 'slow' ? 600 : (typeof dur === 'number' ? dur : 300);
      this.each(function (this: any) {
        var el = this;
        el.style.opacity = '1';
        el.style.transition = 'opacity ' + (ms / 1000) + 's ease';
        el.style.opacity = '0';
        setTimeout(function () {
          el.style.display = 'none';
          el.style.transition = '';
        }, ms + 50);
      });
      return this;
    },

    /* ---------- 几何 ---------- */
    offset: function (this: any) {
      if (!this.length) return { top: 0, left: 0 };
      var el = this[0];
      if (el === window || el === document || el === document.documentElement || el === document.body) {
        return { top: 0, left: 0 };
      }
      var rect = el.getBoundingClientRect();
      return {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset
      };
    },
    scrollTop: function (this: any, v: any) {
      if (v === undefined) {
        if (!this.length) return 0;
        var el = this[0];
        if (el === window || el === document) return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        return el.scrollTop;
      }
      this.each(function (this: any) {
        if (this === window || this === document) {
          window.scrollTo(0, v);
        } else {
          this.scrollTop = v;
        }
      });
      return this;
    },
    height: function (this: any) {
      if (!this.length) return 0;
      var el = this[0];
      if (el === window) return window.innerHeight || document.documentElement.clientHeight;
      if (el === document) return document.documentElement.scrollHeight || document.body.scrollHeight || 0;
      return el.clientHeight || el.offsetHeight || 0;
    },

    /* ---------- 事件 ---------- */
    on: function (this: any, types: any, selectorOrFn: any, fnOrData: any) {
      var self = this;
      var typesArr = String(types).split(/\s+/);
      var selector: any, handler: any;

      // 解析参数：on(type, fn) | on(type, selector, fn)
      if (typeof selectorOrFn === 'string') {
        selector = selectorOrFn;
        handler = fnOrData;
      } else if (typeof selectorOrFn === 'function') {
        handler = selectorOrFn;
      }

      if (typeof handler !== 'function') return this;

      typesArr.forEach(function (typeAndNs) {
        var parsed = _parseEventType(typeAndNs);
        var type = parsed.type;
        var ns = parsed.ns;
        self.each(function (this: any) {
          _addEventListener(this, type, ns, selector, handler);
        });
      });
      return this;
    },
    off: function (this: any, types: any, fnOrSel: any) {
      var self = this;
      var typesArr = types === undefined ? null : String(types).split(/\s+/);
      var handler = (typeof fnOrSel === 'function') ? fnOrSel : null;

      self.each(function (this: any) {
        _removeEventListener(this, typesArr, handler);
      });
      return this;
    },
    trigger: function (this: any, type: any) {
      var parsed = _parseEventType(type);
      this.each(function (this: any) {
        this.dispatchEvent(new Event(parsed.type, { bubbles: true }));
      });
      return this;
    },

    // 简写事件
    click: function (this: any, fn: any) {
      if (fn) return this.on('click', fn);
      this.each(function (this: any) { if (this.click) this.click(); });
      return this;
    },
    change: function (this: any, fn: any) {
      return fn ? this.on('change', fn) : this.trigger('change');
    },
    scroll: function (this: any, fn: any) {
      return fn ? this.on('scroll', fn) : this.trigger('scroll');
    }
  };

  /* ------------------------------------------------------------------
   * 工具函数
   * ------------------------------------------------------------------ */
  // JS 风格样式键 → CSS 属性名：zIndex → z-index，WebkitBackdropFilter → -webkit-backdrop-filter
  function _cssPropName(k: string) {
    if (k.indexOf('--') === 0) return k;           // 自定义属性原样
    if (k.indexOf('-') !== -1) return k;           // 已是 kebab-case
    var out = k.replace(/([A-Z])/g, function (m) { return '-' + m.toLowerCase(); });
    // 浏览器前缀：Webkit Xxx → -webkit-xxx（上面的转换会得到 "-webkit-..."，正好正确）
    return out;
  }

  function _matchesSelector(el: any, selector: any) {
    if (!el || el.nodeType !== 1) return false;
    if (typeof selector === 'string' && _hasExtPseudo(selector)) {
      // 含扩展伪类：按顶层逗号拆成独立子选择器（或关系），每个子选择器内部
      // 须同时满足 cleanSelector 匹配 + filters 过滤 + notList 排除才算命中。
      // 不能只按 cleanSelector 判断——那会丢掉 :contains/:checkbox 等过滤器语义
      // （例如 a:contains(下一页) 会被误当成所有 a 都匹配；input:checkbox 会匹配所有 input）。
      var subs = _splitByComma(selector);
      for (var si = 0; si < subs.length; si++) {
        var sub = subs[si].trim();
        if (!sub) continue;
        var parsed = _extractExtPseudos(sub);
        if (parsed.cleanSelector && !el.matches(parsed.cleanSelector)) continue;
        var hit = true;
        parsed.filters.forEach(function (f) { if (!f(el)) hit = false; });
        if (!hit) continue;
        if (parsed.notList.length && parsed.notList.some(function (s) { return el.matches(s.trim()); })) continue;
        return true;
      }
      return false;
    }
    try {
      return el.matches(selector);
    } catch (e) {
      return false;
    }
  }

  function _parseEventType(typeAndNs: any) {
    var parts = String(typeAndNs).split('.');
    return { type: parts[0], ns: parts.slice(1).filter(Boolean) };
  }

  // 事件注册表（WeakMap 元素 → 处理器数组）
  var eventStore = new WeakMap();

  function _getEventList(el: any) {
    if (!eventStore.has(el)) eventStore.set(el, []);
    return eventStore.get(el);
  }

  function _addEventListener(el: any, type: any, ns: any, selector: any, handler: any) {
    var list = _getEventList(el);
    // 原生监听：若带委托选择器则用匹配代理
    var nativeHandler = function (e: any) {
      if (selector) {
        var t = e.target;
        // 委托：向上找匹配 selector 的目标
        while (t && t.nodeType === 1 && t !== el) {
          if (_matchesSelector(t, selector)) break;
          t = t.parentElement;
        }
        if (!t || t.nodeType !== 1 || t === el) return;
        // 调用时绑定 this 为匹配元素
        return handler.call(t, e);
      }
      return handler.call(el, e);
    };
    var record = { type: type, ns: ns, selector: selector, handler: handler, nativeHandler: nativeHandler };
    el.addEventListener(type, nativeHandler);
    list.push(record);
  }

  function _removeEventListener(el: any, typesArr: any, handler: any) {
    var list = _getEventList(el);
    var kept: any[] = [];
    list.forEach(function (rec: any) {
      // 类型过滤：若指定 types，只处理匹配的类型与命名空间
      if (typesArr) {
        var matched = typesArr.some(function (t: any) {
          var parsed = _parseEventType(t);
          if (parsed.type !== rec.type) return false;
          // 命名空间：off('click.xsSelect') 需匹配 ns 前缀（ns 为 "xxx" 需完全等于）
          if (parsed.ns.length) {
            return parsed.ns.join('.') === rec.ns.join('.');
          }
          return true;
        });
        if (!matched) { kept.push(rec); return; }
      }
      // handler 过滤
      if (handler && rec.handler !== handler) { kept.push(rec); return; }
      // 移除原生监听
      el.removeEventListener(rec.type, rec.nativeHandler);
    });
    eventStore.set(el, kept);
  }

  function _contentToElements(content: any) {
    if (content instanceof QCollection) return content.get();
    if (typeof content === 'string') return _createFromHtml(content);
    if (content instanceof Node) return [content];
    if (Array.isArray(content)) {
      var out: any[] = [];
      content.forEach(function (c) { out.push(c); });
      return out;
    }
    return [];
  }

  function _appendContent(el: any, content: any) {
    var els = _contentToElements(content);
    els.forEach(function (e: any) { el.appendChild(e); });
  }

  function _prependContent(el: any, content: any) {
    var els = _contentToElements(content);
    for (var i = els.length - 1; i >= 0; i--) {
      el.insertBefore(els[i], el.firstChild);
    }
  }

  function _resolveTarget(target: any) {
    if (target instanceof QCollection) return target;
    if (typeof target === 'string') return _wrap(_queryAll(document, target));
    if (target) return _wrap([target]);
    return _wrap([]);
  }

  /* ------------------------------------------------------------------
   * 主入口 XS()
   * ------------------------------------------------------------------ */
  function XS(arg: any) {
    // XS(fn) —— DOM ready 回调
    if (typeof arg === 'function') {
      if (document.readyState !== 'loading') {
        arg(document);
      } else {
        document.addEventListener('DOMContentLoaded', function () { arg(document); });
      }
      return _wrap([]);
    }
    // HTML 字符串创建元素
    if (typeof arg === 'string' && arg.trim().charAt(0) === '<') {
      return _wrap(_createFromHtml(arg));
    }
    // 选择器
    if (typeof arg === 'string') {
      return _wrap(_queryAll(document, arg));
    }
    // 元素 / NodeList / 数组 / QCollection
    if (arg instanceof QCollection) return arg;
    // window 是全局对象，无 nodeType，须单独识别
    if (arg === window) return _wrap([window]);
    if (arg && arg.nodeType) return _wrap([arg]);
    if (arg && (arg instanceof NodeList || arg instanceof HTMLCollection)) {
      return _wrap(Array.prototype.slice.call(arg));
    }
    if (Array.isArray(arg)) return _wrap(arg);
    return _wrap([]);
  }

  XS.nano = function (template: any, data: any) {
    return template.replace(/\{([\w\.]*)\}/g, function (str: any, key: any) {
      var keys = key.split('.'),
        v = data[keys.shift()];
      try {
        for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
      } catch (e) { }
      return (typeof v !== 'undefined' && v !== null) ? v : '';
    });
  };

  XS.expr = { ':': expr };

  XS.each = function (arr: any, fn: any) {
    var wrapped = _wrap(Array.prototype.slice.call(arr || []));
    wrapped.each(fn);
    return wrapped;
  };

  XS.parseHTML = function (html: any) {
    return _createFromHtml(html);
  };

// ---- 工具层导出（ES module：供 content.ts / sites.ts import）----
export { XS, QCollection };

// ---- 正则工具 toRE（原 content.ts 主逻辑迁入；sites.ts 个别第三方书源规则分支也引用）----
const _regexCache: Record<string, any> = {};

export function toRE(obj: any, flag = 'igm') {
  if (obj instanceof RegExp) {
    return obj;
  } else if (_regexCache[obj] && _regexCache[obj][flag]) {
    const re = _regexCache[obj][flag];
    re.lastIndex = 0;
    return re;
  } else if (!_regexCache[obj]) {
    const re = new RegExp(obj, flag);
    _regexCache[obj] = { [flag]: re };
    return re;
  } else if (!_regexCache[obj][flag]) {
    const re = new RegExp(obj, flag);
    _regexCache[obj][flag] = re;
    return re;
  }
}
