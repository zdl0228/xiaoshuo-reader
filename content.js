/* =============================================================
 * 小说阅读助手 浏览器扩展版 content.js（Manifest V3）
 * 内联合并：jquery.min.js + gm-shim.js + content.js（单文件）
 * ============================================================= */

/* ---- jQuery（内联） ---- */
/*! jQuery v2.1.1 | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license */
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=c.slice,e=c.concat,f=c.push,g=c.indexOf,h={},i=h.toString,j=h.hasOwnProperty,k={},l=a.document,m="2.1.1",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return d.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:d.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return n.each(this,a,b)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){return!n.isArray(a)&&a-parseFloat(a)>=0},isPlainObject:function(a){return"object"!==n.type(a)||a.nodeType||n.isWindow(a)?!1:a.constructor&&!j.call(a.constructor.prototype,"isPrototypeOf")?!1:!0},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?h[i.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=l.createElement("script"),b.text=a,l.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,c){var d,e=0,f=a.length,g=s(a);if(c){if(g){for(;f>e;e++)if(d=b.apply(a[e],c),d===!1)break}else for(e in a)if(d=b.apply(a[e],c),d===!1)break}else if(g){for(;f>e;e++)if(d=b.call(a[e],e,a[e]),d===!1)break}else for(e in a)if(d=b.call(a[e],e,a[e]),d===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c,"string"==typeof a?[a]:a):f.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:g.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,f=0,g=a.length,h=s(a),i=[];if(h)for(;g>f;f++)d=b(a[f],f,c),null!=d&&i.push(d);else for(f in a)d=b(a[f],f,c),null!=d&&i.push(d);return e.apply([],i)},guid:1,proxy:function(a,b){var c,e,f;return"string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a)?(e=d.call(arguments,2),f=function(){return a.apply(b||this,e.concat(d.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f):void 0},now:Date.now,support:k}),n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(a,b){h["[object "+b+"]"]=b.toLowerCase()});function s(a){var b=a.length,c=n.type(a);return"function"===c||n.isWindow(a)?!1:1===a.nodeType&&b?!0:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+-new Date,v=a.document,w=0,x=0,y=gb(),z=gb(),A=gb(),B=function(a,b){return a===b&&(l=!0),0},C="undefined",D=1<<31,E={}.hasOwnProperty,F=[],G=F.pop,H=F.push,I=F.push,J=F.slice,K=F.indexOf||function(a){for(var b=0,c=this.length;c>b;b++)if(this[b]===a)return b;return-1},L="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",N="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",O=N.replace("w","w#"),P="\\["+M+"*("+N+")(?:"+M+"*([*^$|!~]?=)"+M+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+O+"))|)"+M+"*\\]",Q=":("+N+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+P+")*)|.*)\\)|)",R=new RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),S=new RegExp("^"+M+"*,"+M+"*"),T=new RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),U=new RegExp("="+M+"*([^\\]'\"]*?)"+M+"*\\]","g"),V=new RegExp(Q),W=new RegExp("^"+O+"$"),X={ID:new RegExp("^#("+N+")"),CLASS:new RegExp("^\\.("+N+")"),TAG:new RegExp("^("+N.replace("w","w*")+")"),ATTR:new RegExp("^"+P),PSEUDO:new RegExp("^"+Q),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:new RegExp("^(?:"+L+")$","i"),needsContext:new RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},Y=/^(?:input|select|textarea|button)$/i,Z=/^h\d$/i,$=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,ab=/[+~]/,bb=/'|\\/g,cb=new RegExp("\\\\([\\da-f]{1,6}"+M+"?|("+M+")|.)","ig"),db=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)};try{I.apply(F=J.call(v.childNodes),v.childNodes),F[v.childNodes.length].nodeType}catch(eb){I={apply:F.length?function(a,b){H.apply(a,J.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function fb(a,b,d,e){var f,h,j,k,l,o,r,s,w,x;if((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,d=d||[],!a||"string"!=typeof a)return d;if(1!==(k=b.nodeType)&&9!==k)return[];if(p&&!e){if(f=_.exec(a))if(j=f[1]){if(9===k){if(h=b.getElementById(j),!h||!h.parentNode)return d;if(h.id===j)return d.push(h),d}else if(b.ownerDocument&&(h=b.ownerDocument.getElementById(j))&&t(b,h)&&h.id===j)return d.push(h),d}else{if(f[2])return I.apply(d,b.getElementsByTagName(a)),d;if((j=f[3])&&c.getElementsByClassName&&b.getElementsByClassName)return I.apply(d,b.getElementsByClassName(j)),d}if(c.qsa&&(!q||!q.test(a))){if(s=r=u,w=b,x=9===k&&a,1===k&&"object"!==b.nodeName.toLowerCase()){o=g(a),(r=b.getAttribute("id"))?s=r.replace(bb,"\\$&"):b.setAttribute("id",s),s="[id='"+s+"'] ",l=o.length;while(l--)o[l]=s+qb(o[l]);w=ab.test(a)&&ob(b.parentNode)||b,x=o.join(",")}if(x)try{return I.apply(d,w.querySelectorAll(x)),d}catch(y){}finally{r||b.removeAttribute("id")}}}return i(a.replace(R,"$1"),b,d,e)}function gb(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function hb(a){return a[u]=!0,a}function ib(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function jb(a,b){var c=a.split("|"),e=a.length;while(e--)d.attrHandle[c[e]]=b}function kb(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||D)-(~a.sourceIndex||D);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function lb(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function mb(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function nb(a){return hb(function(b){return b=+b,hb(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function ob(a){return a&&typeof a.getElementsByTagName!==C&&a}c=fb.support={},f=fb.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=fb.setDocument=function(a){var b,e=a?a.ownerDocument||a:v,g=e.defaultView;return e!==n&&9===e.nodeType&&e.documentElement?(n=e,o=e.documentElement,p=!f(e),g&&g!==g.top&&(g.addEventListener?g.addEventListener("unload",function(){m()},!1):g.attachEvent&&g.attachEvent("onunload",function(){m()})),c.attributes=ib(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ib(function(a){return a.appendChild(e.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=$.test(e.getElementsByClassName)&&ib(function(a){return a.innerHTML="<div class='a'></div><div class='a i'></div>",a.firstChild.className="i",2===a.getElementsByClassName("i").length}),c.getById=ib(function(a){return o.appendChild(a).id=u,!e.getElementsByName||!e.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if(typeof b.getElementById!==C&&p){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},d.filter.ID=function(a){var b=a.replace(cb,db);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(cb,db);return function(a){var c=typeof a.getAttributeNode!==C&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return typeof b.getElementsByTagName!==C?b.getElementsByTagName(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return typeof b.getElementsByClassName!==C&&p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=$.test(e.querySelectorAll))&&(ib(function(a){a.innerHTML="<select msallowclip=''><option selected=''></option></select>",a.querySelectorAll("[msallowclip^='']").length&&q.push("[*^$]="+M+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+M+"*(?:value|"+L+")"),a.querySelectorAll(":checked").length||q.push(":checked")}),ib(function(a){var b=e.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+M+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=$.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ib(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",Q)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=$.test(o.compareDocumentPosition),t=b||$.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===e||a.ownerDocument===v&&t(v,a)?-1:b===e||b.ownerDocument===v&&t(v,b)?1:k?K.call(k,a)-K.call(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,f=a.parentNode,g=b.parentNode,h=[a],i=[b];if(!f||!g)return a===e?-1:b===e?1:f?-1:g?1:k?K.call(k,a)-K.call(k,b):0;if(f===g)return kb(a,b);c=a;while(c=c.parentNode)h.unshift(c);c=b;while(c=c.parentNode)i.unshift(c);while(h[d]===i[d])d++;return d?kb(h[d],i[d]):h[d]===v?-1:i[d]===v?1:0},e):n},fb.matches=function(a,b){return fb(a,null,null,b)},fb.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(U,"='$1']"),!(!c.matchesSelector||!p||r&&r.test(b)||q&&q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return fb(b,n,null,[a]).length>0},fb.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},fb.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&E.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},fb.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},fb.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=fb.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=fb.selectors={cacheLength:50,createPseudo:hb,match:X,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(cb,db),a[3]=(a[3]||a[4]||a[5]||"").replace(cb,db),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||fb.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&fb.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return X.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&V.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(cb,db).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+M+")"+a+"("+M+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||typeof a.getAttribute!==C&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=fb.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h;if(q){if(f){while(p){l=b;while(l=l[p])if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){k=q[u]||(q[u]={}),j=k[a]||[],n=j[0]===w&&j[1],m=j[0]===w&&j[2],l=n&&q.childNodes[n];while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if(1===l.nodeType&&++m&&l===b){k[a]=[w,n,m];break}}else if(s&&(j=(b[u]||(b[u]={}))[a])&&j[0]===w)m=j[1];else while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if((h?l.nodeName.toLowerCase()===r:1===l.nodeType)&&++m&&(s&&((l[u]||(l[u]={}))[a]=[w,m]),l===b))break;return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||fb.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?hb(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=K.call(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:hb(function(a){var b=[],c=[],d=h(a.replace(R,"$1"));return d[u]?hb(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),!c.pop()}}),has:hb(function(a){return function(b){return fb(a,b).length>0}}),contains:hb(function(a){return function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:hb(function(a){return W.test(a||"")||fb.error("unsupported lang: "+a),a=a.replace(cb,db).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Z.test(a.nodeName)},input:function(a){return Y.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:nb(function(){return[0]}),last:nb(function(a,b){return[b-1]}),eq:nb(function(a,b,c){return[0>c?c+b:c]}),even:nb(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:nb(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:nb(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:nb(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=lb(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=mb(b);function pb(){}pb.prototype=d.filters=d.pseudos,d.setFilters=new pb,g=fb.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){(!c||(e=S.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=T.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(R," ")}),h=h.slice(c.length));for(g in d.filter)!(e=X[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?fb.error(a):z(a,i).slice(0)};function qb(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function rb(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(i=b[u]||(b[u]={}),(h=i[d])&&h[0]===w&&h[1]===f)return j[2]=h[2];if(i[d]=j,j[2]=a(b,c,g))return!0}}}function sb(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function tb(a,b,c){for(var d=0,e=b.length;e>d;d++)fb(a,b[d],c);return c}function ub(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function vb(a,b,c,d,e,f){return d&&!d[u]&&(d=vb(d)),e&&!e[u]&&(e=vb(e,f)),hb(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||tb(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:ub(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=ub(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?K.call(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=ub(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):I.apply(g,r)})}function wb(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=rb(function(a){return a===b},h,!0),l=rb(function(a){return K.call(b,a)>-1},h,!0),m=[function(a,c,d){return!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d))}];f>i;i++)if(c=d.relative[a[i].type])m=[rb(sb(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return vb(i>1&&sb(m),i>1&&qb(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(R,"$1"),c,e>i&&wb(a.slice(i,e)),f>e&&wb(a=a.slice(e)),f>e&&qb(a))}m.push(c)}return sb(m)}function xb(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,m,o,p=0,q="0",r=f&&[],s=[],t=j,u=f||e&&d.find.TAG("*",k),v=w+=null==t?1:Math.random()||.1,x=u.length;for(k&&(j=g!==n&&g);q!==x&&null!=(l=u[q]);q++){if(e&&l){m=0;while(o=a[m++])if(o(l,g,h)){i.push(l);break}k&&(w=v)}c&&((l=!o&&l)&&p--,f&&r.push(l))}if(p+=q,c&&q!==p){m=0;while(o=b[m++])o(r,s,g,h);if(f){if(p>0)while(q--)r[q]||s[q]||(s[q]=G.call(i));s=ub(s)}I.apply(i,s),k&&!f&&s.length>0&&p+b.length>1&&fb.uniqueSort(i)}return k&&(w=v,j=t),r};return c?hb(f):f}return h=fb.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=wb(b[c]),f[u]?d.push(f):e.push(f);f=A(a,xb(e,d)),f.selector=a}return f},i=fb.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(cb,db),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=X.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(cb,db),ab.test(j[0].type)&&ob(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&qb(j),!a)return I.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,ab.test(a)&&ob(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ib(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ib(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||jb("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ib(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||jb("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ib(function(a){return null==a.getAttribute("disabled")})||jb(L,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),fb}(a);n.find=t,n.expr=t.selectors,n.expr[":"]=n.expr.pseudos,n.unique=t.uniqueSort,n.text=t.getText,n.isXMLDoc=t.isXML,n.contains=t.contains;var u=n.expr.match.needsContext,v=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,w=/^.[^:#\[\.,]*$/;function x(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(w.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return g.call(b,a)>=0!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;c>b;b++)if(n.contains(e[b],this))return!0}));for(b=0;c>b;b++)n.find(a,e[b],d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(x(this,a||[],!1))},not:function(a){return this.pushStack(x(this,a||[],!0))},is:function(a){return!!x(this,"string"==typeof a&&u.test(a)?n(a):a||[],!1).length}});var y,z=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,A=n.fn.init=function(a,b){var c,d;if(!a)return this;if("string"==typeof a){if(c="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:z.exec(a),!c||!c[1]&&b)return!b||b.jquery?(b||y).find(a):this.constructor(b).find(a);if(c[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(c[1],b&&b.nodeType?b.ownerDocument||b:l,!0)),v.test(c[1])&&n.isPlainObject(b))for(c in b)n.isFunction(this[c])?this[c](b[c]):this.attr(c,b[c]);return this}return d=l.getElementById(c[2]),d&&d.parentNode&&(this.length=1,this[0]=d),this.context=l,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?"undefined"!=typeof y.ready?y.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};A.prototype=n.fn,y=n(l);var B=/^(?:parents|prev(?:Until|All))/,C={children:!0,contents:!0,next:!0,prev:!0};n.extend({dir:function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&n(a).is(c))break;d.push(a)}return d},sibling:function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}}),n.fn.extend({has:function(a){var b=n(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(n.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=u.test(a)||"string"!=typeof a?n(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?n.unique(f):f)},index:function(a){return a?"string"==typeof a?g.call(n(a),this[0]):g.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.unique(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function D(a,b){while((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return n.dir(a,"parentNode")},parentsUntil:function(a,b,c){return n.dir(a,"parentNode",c)},next:function(a){return D(a,"nextSibling")},prev:function(a){return D(a,"previousSibling")},nextAll:function(a){return n.dir(a,"nextSibling")},prevAll:function(a){return n.dir(a,"previousSibling")},nextUntil:function(a,b,c){return n.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return n.dir(a,"previousSibling",c)},siblings:function(a){return n.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return n.sibling(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d,e)),this.length>1&&(C[a]||n.unique(e),B.test(a)&&e.reverse()),this.pushStack(e)}});var E=/\S+/g,F={};function G(a){var b=F[a]={};return n.each(a.match(E)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?F[a]||G(a):n.extend({},a);var b,c,d,e,f,g,h=[],i=!a.once&&[],j=function(l){for(b=a.memory&&l,c=!0,g=e||0,e=0,f=h.length,d=!0;h&&f>g;g++)if(h[g].apply(l[0],l[1])===!1&&a.stopOnFalse){b=!1;break}d=!1,h&&(i?i.length&&j(i.shift()):b?h=[]:k.disable())},k={add:function(){if(h){var c=h.length;!function g(b){n.each(b,function(b,c){var d=n.type(c);"function"===d?a.unique&&k.has(c)||h.push(c):c&&c.length&&"string"!==d&&g(c)})}(arguments),d?f=h.length:b&&(e=c,j(b))}return this},remove:function(){return h&&n.each(arguments,function(a,b){var c;while((c=n.inArray(b,h,c))>-1)h.splice(c,1),d&&(f>=c&&f--,g>=c&&g--)}),this},has:function(a){return a?n.inArray(a,h)>-1:!(!h||!h.length)},empty:function(){return h=[],f=0,this},disable:function(){return h=i=b=void 0,this},disabled:function(){return!h},lock:function(){return i=void 0,b||k.disable(),this},locked:function(){return!i},fireWith:function(a,b){return!h||c&&!i||(b=b||[],b=[a,b.slice?b.slice():b],d?i.push(b):j(b)),this},fire:function(){return k.fireWith(this,arguments),this},fired:function(){return!!c}};return k},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&n.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=d.call(arguments),e=c.length,f=1!==e||a&&n.isFunction(a.promise)?e:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(e){b[a]=this,c[a]=arguments.length>1?d.call(arguments):e,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(e>1)for(i=new Array(e),j=new Array(e),k=new Array(e);e>b;b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().done(h(b,k,c)).fail(g.reject).progress(h(b,j,i)):--f;return f||g.resolveWith(k,c),g.promise()}});var H;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(H.resolveWith(l,[n]),n.fn.triggerHandler&&(n(l).triggerHandler("ready"),n(l).off("ready"))))}});function I(){l.removeEventListener("DOMContentLoaded",I,!1),a.removeEventListener("load",I,!1),n.ready()}n.ready.promise=function(b){return H||(H=n.Deferred(),"complete"===l.readyState?setTimeout(n.ready):(l.addEventListener("DOMContentLoaded",I,!1),a.addEventListener("load",I,!1))),H.promise(b)},n.ready.promise();var J=n.access=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===n.type(c)){e=!0;for(h in c)n.access(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f};n.acceptData=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function K(){Object.defineProperty(this.cache={},0,{get:function(){return{}}}),this.expando=n.expando+Math.random()}K.uid=1,K.accepts=n.acceptData,K.prototype={key:function(a){if(!K.accepts(a))return 0;var b={},c=a[this.expando];if(!c){c=K.uid++;try{b[this.expando]={value:c},Object.defineProperties(a,b)}catch(d){b[this.expando]=c,n.extend(a,b)}}return this.cache[c]||(this.cache[c]={}),c},set:function(a,b,c){var d,e=this.key(a),f=this.cache[e];if("string"==typeof b)f[b]=c;else if(n.isEmptyObject(f))n.extend(this.cache[e],b);else for(d in b)f[d]=b[d];return f},get:function(a,b){var c=this.cache[this.key(a)];return void 0===b?c:c[b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,n.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=this.key(a),g=this.cache[f];if(void 0===b)this.cache[f]={};else{n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in g?d=[b,e]:(d=e,d=d in g?[d]:d.match(E)||[])),c=d.length;while(c--)delete g[d[c]]}},hasData:function(a){return!n.isEmptyObject(this.cache[a[this.expando]]||{})},discard:function(a){a[this.expando]&&delete this.cache[a[this.expando]]}};var L=new K,M=new K,N=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,O=/([A-Z])/g;function P(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(O,"-$1").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:N.test(c)?n.parseJSON(c):c}catch(e){}M.set(a,b,c)}else c=void 0;return c}n.extend({hasData:function(a){return M.hasData(a)||L.hasData(a)},data:function(a,b,c){return M.access(a,b,c)},removeData:function(a,b){M.remove(a,b)
},_data:function(a,b,c){return L.access(a,b,c)},_removeData:function(a,b){L.remove(a,b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=M.get(f),1===f.nodeType&&!L.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),P(f,d,e[d])));L.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){M.set(this,a)}):J(this,function(b){var c,d=n.camelCase(a);if(f&&void 0===b){if(c=M.get(f,a),void 0!==c)return c;if(c=M.get(f,d),void 0!==c)return c;if(c=P(f,d,void 0),void 0!==c)return c}else this.each(function(){var c=M.get(this,d);M.set(this,d,b),-1!==a.indexOf("-")&&void 0!==c&&M.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){M.remove(this,a)})}}),n.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=L.get(a,b),c&&(!d||n.isArray(c)?d=L.access(a,b,n.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return L.get(a,c)||L.access(a,c,{empty:n.Callbacks("once memory").add(function(){L.remove(a,[b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=L.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var Q=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,R=["Top","Right","Bottom","Left"],S=function(a,b){return a=b||a,"none"===n.css(a,"display")||!n.contains(a.ownerDocument,a)},T=/^(?:checkbox|radio)$/i;!function(){var a=l.createDocumentFragment(),b=a.appendChild(l.createElement("div")),c=l.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),k.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",k.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var U="undefined";k.focusinBubbles="onfocusin"in a;var V=/^key/,W=/^(?:mouse|pointer|contextmenu)|click/,X=/^(?:focusinfocus|focusoutblur)$/,Y=/^([^.]*)(?:\.(.+)|)$/;function Z(){return!0}function $(){return!1}function _(){try{return l.activeElement}catch(a){}}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return typeof n!==U&&n.event.triggered!==b.type?n.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(E)||[""],j=b.length;while(j--)h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(o,g,!1)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.hasData(a)&&L.get(a);if(r&&(i=r.events)){b=(b||"").match(E)||[""],j=b.length;while(j--)if(h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete i[o])}else for(o in i)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(i)&&(delete r.handle,L.remove(a,"events"))}},trigger:function(b,c,d,e){var f,g,h,i,k,m,o,p=[d||l],q=j.call(b,"type")?b.type:b,r=j.call(b,"namespace")?b.namespace.split("."):[];if(g=h=d=d||l,3!==d.nodeType&&8!==d.nodeType&&!X.test(q+n.event.triggered)&&(q.indexOf(".")>=0&&(r=q.split("."),q=r.shift(),r.sort()),k=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=e?2:3,b.namespace=r.join("."),b.namespace_re=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=d),c=null==c?[b]:n.makeArray(c,[b]),o=n.event.special[q]||{},e||!o.trigger||o.trigger.apply(d,c)!==!1)){if(!e&&!o.noBubble&&!n.isWindow(d)){for(i=o.delegateType||q,X.test(i+q)||(g=g.parentNode);g;g=g.parentNode)p.push(g),h=g;h===(d.ownerDocument||l)&&p.push(h.defaultView||h.parentWindow||a)}f=0;while((g=p[f++])&&!b.isPropagationStopped())b.type=f>1?i:o.bindType||q,m=(L.get(g,"events")||{})[b.type]&&L.get(g,"handle"),m&&m.apply(g,c),m=k&&g[k],m&&m.apply&&n.acceptData(g)&&(b.result=m.apply(g,c),b.result===!1&&b.preventDefault());return b.type=q,e||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(),c)!==!1||!n.acceptData(d)||k&&n.isFunction(d[q])&&!n.isWindow(d)&&(h=d[k],h&&(d[k]=null),n.event.triggered=q,d[q](),n.event.triggered=void 0,h&&(d[k]=h)),b.result}},dispatch:function(a){a=n.event.fix(a);var b,c,e,f,g,h=[],i=d.call(arguments),j=(L.get(this,"events")||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())(!a.namespace_re||a.namespace_re.test(g.namespace))&&(a.handleObj=g,a.data=g.data,e=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==e&&(a.result=e)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&(!a.button||"click"!==a.type))for(;i!==this;i=i.parentNode||this)if(i.disabled!==!0||"click"!==a.type){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e,this).index(i)>=0:n.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,d,e,f=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||l,d=c.documentElement,e=c.body,a.pageX=b.clientX+(d&&d.scrollLeft||e&&e.scrollLeft||0)-(d&&d.clientLeft||e&&e.clientLeft||0),a.pageY=b.clientY+(d&&d.scrollTop||e&&e.scrollTop||0)-(d&&d.clientTop||e&&e.clientTop||0)),a.which||void 0===f||(a.which=1&f?1:2&f?3:4&f?2:0),a}},fix:function(a){if(a[n.expando])return a;var b,c,d,e=a.type,f=a,g=this.fixHooks[e];g||(this.fixHooks[e]=g=W.test(e)?this.mouseHooks:V.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new n.Event(f),b=d.length;while(b--)c=d[b],a[c]=f[c];return a.target||(a.target=l),3===a.target.nodeType&&(a.target=a.target.parentNode),g.filter?g.filter(a,f):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==_()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===_()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&n.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return n.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=n.extend(new n.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?n.event.trigger(e,null,b):n.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?Z:$):this.type=a,b&&n.extend(this,b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={isDefaultPrevented:$,isPropagationStopped:$,isImmediatePropagationStopped:$,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=Z,a&&a.preventDefault&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=Z,a&&a.stopPropagation&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=Z,a&&a.stopImmediatePropagation&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return(!e||e!==d&&!n.contains(d,e))&&(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),k.focusinBubbles||n.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a),!0)};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=L.access(d,b);e||d.addEventListener(a,c,!0),L.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=L.access(d,b)-1;e?L.access(d,b,e):(d.removeEventListener(a,c,!0),L.remove(d,b))}}}),n.fn.extend({on:function(a,b,c,d,e){var f,g;if("object"==typeof a){"string"!=typeof b&&(c=c||b,b=void 0);for(g in a)this.on(g,b,c,a[g],e);return this}if(null==c&&null==d?(d=b,c=b=void 0):null==d&&("string"==typeof b?(d=c,c=void 0):(d=c,c=b,b=void 0)),d===!1)d=$;else if(!d)return this;return 1===e&&(f=d,d=function(a){return n().off(a),f.apply(this,arguments)},d.guid=f.guid||(f.guid=n.guid++)),this.each(function(){n.event.add(this,a,d,c,b)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return(b===!1||"function"==typeof b)&&(c=b,b=void 0),c===!1&&(c=$),this.each(function(){n.event.remove(this,a,c,b)})},trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?n.event.trigger(a,b,c,!0):void 0}});var ab=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,bb=/<([\w:]+)/,cb=/<|&#?\w+;/,db=/<(?:script|style|link)/i,eb=/checked\s*(?:[^=]|=\s*.checked.)/i,fb=/^$|\/(?:java|ecma)script/i,gb=/^true\/(.*)/,hb=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,ib={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ib.optgroup=ib.option,ib.tbody=ib.tfoot=ib.colgroup=ib.caption=ib.thead,ib.th=ib.td;function jb(a,b){return n.nodeName(a,"table")&&n.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function kb(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function lb(a){var b=gb.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function mb(a,b){for(var c=0,d=a.length;d>c;c++)L.set(a[c],"globalEval",!b||L.get(b[c],"globalEval"))}function nb(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(L.hasData(a)&&(f=L.access(a),g=L.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)n.event.add(b,e,j[e][c])}M.hasData(a)&&(h=M.access(a),i=n.extend({},h),M.set(b,i))}}function ob(a,b){var c=a.getElementsByTagName?a.getElementsByTagName(b||"*"):a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a,b)?n.merge([a],c):c}function pb(a,b){var c=b.nodeName.toLowerCase();"input"===c&&T.test(a.type)?b.checked=a.checked:("input"===c||"textarea"===c)&&(b.defaultValue=a.defaultValue)}n.extend({clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument,a);if(!(k.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for(g=ob(h),f=ob(a),d=0,e=f.length;e>d;d++)pb(f[d],g[d]);if(b)if(c)for(f=f||ob(a),g=g||ob(h),d=0,e=f.length;e>d;d++)nb(f[d],g[d]);else nb(a,h);return g=ob(h,"script"),g.length>0&&mb(g,!i&&ob(a,"script")),h},buildFragment:function(a,b,c,d){for(var e,f,g,h,i,j,k=b.createDocumentFragment(),l=[],m=0,o=a.length;o>m;m++)if(e=a[m],e||0===e)if("object"===n.type(e))n.merge(l,e.nodeType?[e]:e);else if(cb.test(e)){f=f||k.appendChild(b.createElement("div")),g=(bb.exec(e)||["",""])[1].toLowerCase(),h=ib[g]||ib._default,f.innerHTML=h[1]+e.replace(ab,"<$1></$2>")+h[2],j=h[0];while(j--)f=f.lastChild;n.merge(l,f.childNodes),f=k.firstChild,f.textContent=""}else l.push(b.createTextNode(e));k.textContent="",m=0;while(e=l[m++])if((!d||-1===n.inArray(e,d))&&(i=n.contains(e.ownerDocument,e),f=ob(k.appendChild(e),"script"),i&&mb(f),c)){j=0;while(e=f[j++])fb.test(e.type||"")&&c.push(e)}return k},cleanData:function(a){for(var b,c,d,e,f=n.event.special,g=0;void 0!==(c=a[g]);g++){if(n.acceptData(c)&&(e=c[L.expando],e&&(b=L.cache[e]))){if(b.events)for(d in b.events)f[d]?n.event.remove(c,d):n.removeEvent(c,d,b.handle);L.cache[e]&&delete L.cache[e]}delete M.cache[c[M.expando]]}}}),n.fn.extend({text:function(a){return J(this,function(a){return void 0===a?n.text(this):this.empty().each(function(){(1===this.nodeType||11===this.nodeType||9===this.nodeType)&&(this.textContent=a)})},null,a,arguments.length)},append:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=jb(this,a);b.appendChild(a)}})},prepend:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=jb(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},remove:function(a,b){for(var c,d=a?n.filter(a,this):this,e=0;null!=(c=d[e]);e++)b||1!==c.nodeType||n.cleanData(ob(c)),c.parentNode&&(b&&n.contains(c.ownerDocument,c)&&mb(ob(c,"script")),c.parentNode.removeChild(c));return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(n.cleanData(ob(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return J(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!db.test(a)&&!ib[(bb.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(ab,"<$1></$2>");try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(ob(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=arguments[0];return this.domManip(arguments,function(b){a=this.parentNode,n.cleanData(ob(this)),a&&a.replaceChild(b,this)}),a&&(a.length||a.nodeType)?this:this.remove()},detach:function(a){return this.remove(a,!0)},domManip:function(a,b){a=e.apply([],a);var c,d,f,g,h,i,j=0,l=this.length,m=this,o=l-1,p=a[0],q=n.isFunction(p);if(q||l>1&&"string"==typeof p&&!k.checkClone&&eb.test(p))return this.each(function(c){var d=m.eq(c);q&&(a[0]=p.call(this,c,d.html())),d.domManip(a,b)});if(l&&(c=n.buildFragment(a,this[0].ownerDocument,!1,this),d=c.firstChild,1===c.childNodes.length&&(c=d),d)){for(f=n.map(ob(c,"script"),kb),g=f.length;l>j;j++)h=c,j!==o&&(h=n.clone(h,!0,!0),g&&n.merge(f,ob(h,"script"))),b.call(this[j],h,j);if(g)for(i=f[f.length-1].ownerDocument,n.map(f,lb),j=0;g>j;j++)h=f[j],fb.test(h.type||"")&&!L.access(h,"globalEval")&&n.contains(i,h)&&(h.src?n._evalUrl&&n._evalUrl(h.src):n.globalEval(h.textContent.replace(hb,"")))}return this}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){n.fn[a]=function(a){for(var c,d=[],e=n(a),g=e.length-1,h=0;g>=h;h++)c=h===g?this:this.clone(!0),n(e[h])[b](c),f.apply(d,c.get());return this.pushStack(d)}});var qb,rb={};function sb(b,c){var d,e=n(c.createElement(b)).appendTo(c.body),f=a.getDefaultComputedStyle&&(d=a.getDefaultComputedStyle(e[0]))?d.display:n.css(e[0],"display");return e.detach(),f}function tb(a){var b=l,c=rb[a];return c||(c=sb(a,b),"none"!==c&&c||(qb=(qb||n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=qb[0].contentDocument,b.write(),b.close(),c=sb(a,b),qb.detach()),rb[a]=c),c}var ub=/^margin/,vb=new RegExp("^("+Q+")(?!px)[a-z%]+$","i"),wb=function(a){return a.ownerDocument.defaultView.getComputedStyle(a,null)};function xb(a,b,c){var d,e,f,g,h=a.style;return c=c||wb(a),c&&(g=c.getPropertyValue(b)||c[b]),c&&(""!==g||n.contains(a.ownerDocument,a)||(g=n.style(a,b)),vb.test(g)&&ub.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0!==g?g+"":g}function yb(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}!function(){var b,c,d=l.documentElement,e=l.createElement("div"),f=l.createElement("div");if(f.style){f.style.backgroundClip="content-box",f.cloneNode(!0).style.backgroundClip="",k.clearCloneStyle="content-box"===f.style.backgroundClip,e.style.cssText="border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute",e.appendChild(f);function g(){f.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute",f.innerHTML="",d.appendChild(e);var g=a.getComputedStyle(f,null);b="1%"!==g.top,c="4px"===g.width,d.removeChild(e)}a.getComputedStyle&&n.extend(k,{pixelPosition:function(){return g(),b},boxSizingReliable:function(){return null==c&&g(),c},reliableMarginRight:function(){var b,c=f.appendChild(l.createElement("div"));return c.style.cssText=f.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",f.style.width="1px",d.appendChild(e),b=!parseFloat(a.getComputedStyle(c,null).marginRight),d.removeChild(e),b}})}}(),n.swap=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e};var zb=/^(none|table(?!-c[ea]).+)/,Ab=new RegExp("^("+Q+")(.*)$","i"),Bb=new RegExp("^([+-])=("+Q+")","i"),Cb={position:"absolute",visibility:"hidden",display:"block"},Db={letterSpacing:"0",fontWeight:"400"},Eb=["Webkit","O","Moz","ms"];function Fb(a,b){if(b in a)return b;var c=b[0].toUpperCase()+b.slice(1),d=b,e=Eb.length;while(e--)if(b=Eb[e]+c,b in a)return b;return d}function Gb(a,b,c){var d=Ab.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function Hb(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=n.css(a,c+R[f],!0,e)),d?("content"===c&&(g-=n.css(a,"padding"+R[f],!0,e)),"margin"!==c&&(g-=n.css(a,"border"+R[f]+"Width",!0,e))):(g+=n.css(a,"padding"+R[f],!0,e),"padding"!==c&&(g+=n.css(a,"border"+R[f]+"Width",!0,e)));return g}function Ib(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=wb(a),g="border-box"===n.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=xb(a,b,f),(0>e||null==e)&&(e=a.style[b]),vb.test(e))return e;d=g&&(k.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Hb(a,b,c||(g?"border":"content"),d,f)+"px"}function Jb(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=L.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&S(d)&&(f[g]=L.access(d,"olddisplay",tb(d.nodeName)))):(e=S(d),"none"===c&&e||L.set(d,"olddisplay",e?c:n.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}n.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=xb(a,"opacity");return""===c?"1":c}}}},cssNumber:{columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=n.camelCase(b),i=a.style;return b=n.cssProps[h]||(n.cssProps[h]=Fb(i,h)),g=n.cssHooks[b]||n.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=Bb.exec(c))&&(c=(e[1]+1)*e[2]+parseFloat(n.css(a,b)),f="number"),null!=c&&c===c&&("number"!==f||n.cssNumber[h]||(c+="px"),k.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=Fb(a.style,h)),g=n.cssHooks[b]||n.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=xb(a,b,d)),"normal"===e&&b in Db&&(e=Db[b]),""===c||c?(f=parseFloat(e),c===!0||n.isNumeric(f)?f||0:e):e}}),n.each(["height","width"],function(a,b){n.cssHooks[b]={get:function(a,c,d){return c?zb.test(n.css(a,"display"))&&0===a.offsetWidth?n.swap(a,Cb,function(){return Ib(a,b,d)}):Ib(a,b,d):void 0},set:function(a,c,d){var e=d&&wb(a);return Gb(a,c,d?Hb(a,b,d,"border-box"===n.css(a,"boxSizing",!1,e),e):0)}}}),n.cssHooks.marginRight=yb(k.reliableMarginRight,function(a,b){return b?n.swap(a,{display:"inline-block"},xb,[a,"marginRight"]):void 0}),n.each({margin:"",padding:"",border:"Width"},function(a,b){n.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+R[d]+b]=f[d]||f[d-2]||f[0];return e}},ub.test(a)||(n.cssHooks[a+b].set=Gb)}),n.fn.extend({css:function(a,b){return J(this,function(a,b,c){var d,e,f={},g=0;if(n.isArray(b)){for(d=wb(a),e=b.length;e>g;g++)f[b[g]]=n.css(a,b[g],!1,d);return f}return void 0!==c?n.style(a,b,c):n.css(a,b)},a,b,arguments.length>1)},show:function(){return Jb(this,!0)},hide:function(){return Jb(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){S(this)?n(this).show():n(this).hide()})}});function Kb(a,b,c,d,e){return new Kb.prototype.init(a,b,c,d,e)}n.Tween=Kb,Kb.prototype={constructor:Kb,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?"":"px")},cur:function(){var a=Kb.propHooks[this.prop];return a&&a.get?a.get(this):Kb.propHooks._default.get(this)},run:function(a){var b,c=Kb.propHooks[this.prop];return this.pos=b=this.options.duration?n.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Kb.propHooks._default.set(this),this}},Kb.prototype.init.prototype=Kb.prototype,Kb.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=n.css(a.elem,a.prop,""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[n.cssProps[a.prop]]||n.cssHooks[a.prop])?n.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},Kb.propHooks.scrollTop=Kb.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},n.fx=Kb.prototype.init,n.fx.step={};var Lb,Mb,Nb=/^(?:toggle|show|hide)$/,Ob=new RegExp("^(?:([+-])=|)("+Q+")([a-z%]*)$","i"),Pb=/queueHooks$/,Qb=[Vb],Rb={"*":[function(a,b){var c=this.createTween(a,b),d=c.cur(),e=Ob.exec(b),f=e&&e[3]||(n.cssNumber[a]?"":"px"),g=(n.cssNumber[a]||"px"!==f&&+d)&&Ob.exec(n.css(c.elem,a)),h=1,i=20;if(g&&g[3]!==f){f=f||g[3],e=e||[],g=+d||1;do h=h||".5",g/=h,n.style(c.elem,a,g+f);while(h!==(h=c.cur()/d)&&1!==h&&--i)}return e&&(g=c.start=+g||+d||0,c.unit=f,c.end=e[1]?g+(e[1]+1)*e[2]:+e[2]),c}]};function Sb(){return setTimeout(function(){Lb=void 0}),Lb=n.now()}function Tb(a,b){var c,d=0,e={height:a};for(b=b?1:0;4>d;d+=2-b)c=R[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ub(a,b,c){for(var d,e=(Rb[b]||[]).concat(Rb["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function Vb(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},o=a.style,p=a.nodeType&&S(a),q=L.get(a,"fxshow");c.queue||(h=n._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,n.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=n.css(a,"display"),k="none"===j?L.get(a,"olddisplay")||tb(a.nodeName):j,"inline"===k&&"none"===n.css(a,"float")&&(o.display="inline-block")),c.overflow&&(o.overflow="hidden",l.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Nb.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}m[d]=q&&q[d]||n.style(a,d)}else j=void 0;if(n.isEmptyObject(m))"inline"===("none"===j?tb(a.nodeName):j)&&(o.display=j);else{q?"hidden"in q&&(p=q.hidden):q=L.access(a,"fxshow",{}),f&&(q.hidden=!p),p?n(a).show():l.done(function(){n(a).hide()}),l.done(function(){var b;L.remove(a,"fxshow");for(b in m)n.style(a,b,m[b])});for(d in m)g=Ub(p?q[d]:0,d,l),d in q||(q[d]=g.start,p&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function Wb(a,b){var c,d,e,f,g;for(c in a)if(d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=n.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function Xb(a,b,c){var d,e,f=0,g=Qb.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=Lb||Sb(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:n.extend({},b),opts:n.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:Lb||Sb(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;for(Wb(k,j.opts.specialEasing);g>f;f++)if(d=Qb[f].call(j,a,k,j.opts))return d;return n.map(k,Ub,j),n.isFunction(j.opts.start)&&j.opts.start.call(a,j),n.fx.timer(n.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend(Xb,{tweener:function(a,b){n.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for(var c,d=0,e=a.length;e>d;d++)c=a[d],Rb[c]=Rb[c]||[],Rb[c].unshift(b)},prefilter:function(a,b){b?Qb.unshift(a):Qb.push(a)}}),n.speed=function(a,b,c){var d=a&&"object"==typeof a?n.extend({},a):{complete:c||!c&&b||n.isFunction(a)&&a,duration:a,easing:c&&b||b&&!n.isFunction(b)&&b};return d.duration=n.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,(null==d.queue||d.queue===!0)&&(d.queue="fx"),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&&d.old.call(this),d.queue&&n.dequeue(this,d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(S).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b,c,d),g=function(){var b=Xb(this,n.extend({},a),f);(e||L.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=n.timers,g=L.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Pb.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));(b||!c)&&n.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=L.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=n.timers,g=d?d.length:0;for(c.finish=!0,n.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),n.each(["toggle","show","hide"],function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Tb(b,!0),a,d,e)}}),n.each({slideDown:Tb("show"),slideUp:Tb("hide"),slideToggle:Tb("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){n.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),n.timers=[],n.fx.tick=function(){var a,b=0,c=n.timers;for(Lb=n.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||n.fx.stop(),Lb=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){Mb||(Mb=setInterval(n.fx.tick,n.fx.interval))},n.fx.stop=function(){clearInterval(Mb),Mb=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(a,b){return a=n.fx?n.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},function(){var a=l.createElement("input"),b=l.createElement("select"),c=b.appendChild(l.createElement("option"));a.type="checkbox",k.checkOn=""!==a.value,k.optSelected=c.selected,b.disabled=!0,k.optDisabled=!c.disabled,a=l.createElement("input"),a.value="t",a.type="radio",k.radioValue="t"===a.value}();var Yb,Zb,$b=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return J(this,n.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(a&&3!==f&&8!==f&&2!==f)return typeof a.getAttribute===U?n.prop(a,b,c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),d=n.attrHooks[b]||(n.expr.match.bool.test(b)?Zb:Yb)),void 0===c?d&&"get"in d&&null!==(e=d.get(a,b))?e:(e=n.find.attr(a,b),null==e?void 0:e):null!==c?d&&"set"in d&&void 0!==(e=d.set(a,c,b))?e:(a.setAttribute(b,c+""),c):void n.removeAttr(a,b))
},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(E);if(f&&1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)},attrHooks:{type:{set:function(a,b){if(!k.radioValue&&"radio"===b&&n.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}}}),Zb={set:function(a,b,c){return b===!1?n.removeAttr(a,c):a.setAttribute(c,c),c}},n.each(n.expr.match.bool.source.match(/\w+/g),function(a,b){var c=$b[b]||n.find.attr;$b[b]=function(a,b,d){var e,f;return d||(f=$b[b],$b[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,$b[b]=f),e}});var _b=/^(?:input|select|textarea|button)$/i;n.fn.extend({prop:function(a,b){return J(this,n.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(a,b,c){var d,e,f,g=a.nodeType;if(a&&3!==g&&8!==g&&2!==g)return f=1!==g||!n.isXMLDoc(a),f&&(b=n.propFix[b]||b,e=n.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){return a.hasAttribute("tabindex")||_b.test(a.nodeName)||a.href?a.tabIndex:-1}}}}),k.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this});var ac=/[\t\r\n\f]/g;n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h="string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ac," "):" ")){f=0;while(e=b[f++])d.indexOf(" "+e+" ")<0&&(d+=e+" ");g=n.trim(d),c.className!==g&&(c.className=g)}return this},removeClass:function(a){var b,c,d,e,f,g,h=0===arguments.length||"string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ac," "):"")){f=0;while(e=b[f++])while(d.indexOf(" "+e+" ")>=0)d=d.replace(" "+e+" "," ");g=a?n.trim(d):"",c.className!==g&&(c.className=g)}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):this.each(n.isFunction(a)?function(c){n(this).toggleClass(a.call(this,c,this.className,b),b)}:function(){if("string"===c){var b,d=0,e=n(this),f=a.match(E)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else(c===U||"boolean"===c)&&(this.className&&L.set(this,"__className__",this.className),this.className=this.className||a===!1?"":L.get(this,"__className__")||"")})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;d>c;c++)if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(ac," ").indexOf(b)>=0)return!0;return!1}});var bc=/\r/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e,function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(bc,""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,"value");return null!=b?b:n.trim(n.text(a))}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],!(!c.selected&&i!==e||(k.optDisabled?c.disabled:null!==c.getAttribute("disabled"))||c.parentNode.disabled&&n.nodeName(c.parentNode,"optgroup"))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=n.inArray(d.value,f)>=0)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(a,b){return n.isArray(b)?a.checked=n.inArray(n(a).val(),b)>=0:void 0}},k.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}});var cc=n.now(),dc=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(a){var b,c;if(!a||"string"!=typeof a)return null;try{c=new DOMParser,b=c.parseFromString(a,"text/xml")}catch(d){b=void 0}return(!b||b.getElementsByTagName("parsererror").length)&&n.error("Invalid XML: "+a),b};var ec,fc,gc=/#.*$/,hc=/([?&])_=[^&]*/,ic=/^(.*?):[ \t]*([^\r\n]*)$/gm,jc=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,kc=/^(?:GET|HEAD)$/,lc=/^\/\//,mc=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,nc={},oc={},pc="*/".concat("*");try{fc=location.href}catch(qc){fc=l.createElement("a"),fc.href="",fc=fc.href}ec=mc.exec(fc.toLowerCase())||[];function rc(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(E)||[];if(n.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function sc(a,b,c,d){var e={},f=a===oc;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function tc(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0,a,d),a}function uc(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function vc(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:fc,type:"GET",isLocal:jc.test(ec[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":pc,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?tc(tc(a,n.ajaxSettings),b):tc(n.ajaxSettings,a)},ajaxPrefilter:rc(nc),ajaxTransport:rc(oc),ajax:function(a,b){"object"==typeof a&&(b=a,a=void 0),b=b||{};var c,d,e,f,g,h,i,j,k=n.ajaxSetup({},b),l=k.context||k,m=k.context&&(l.nodeType||l.jquery)?n(l):n.event,o=n.Deferred(),p=n.Callbacks("once memory"),q=k.statusCode||{},r={},s={},t=0,u="canceled",v={readyState:0,getResponseHeader:function(a){var b;if(2===t){if(!f){f={};while(b=ic.exec(e))f[b[1].toLowerCase()]=b[2]}b=f[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===t?e:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return t||(a=s[c]=s[c]||a,r[a]=b),this},overrideMimeType:function(a){return t||(k.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>t)for(b in a)q[b]=[q[b],a[b]];else v.always(a[v.status]);return this},abort:function(a){var b=a||u;return c&&c.abort(b),x(0,b),this}};if(o.promise(v).complete=p.add,v.success=v.done,v.error=v.fail,k.url=((a||k.url||fc)+"").replace(gc,"").replace(lc,ec[1]+"//"),k.type=b.method||b.type||k.method||k.type,k.dataTypes=n.trim(k.dataType||"*").toLowerCase().match(E)||[""],null==k.crossDomain&&(h=mc.exec(k.url.toLowerCase()),k.crossDomain=!(!h||h[1]===ec[1]&&h[2]===ec[2]&&(h[3]||("http:"===h[1]?"80":"443"))===(ec[3]||("http:"===ec[1]?"80":"443")))),k.data&&k.processData&&"string"!=typeof k.data&&(k.data=n.param(k.data,k.traditional)),sc(nc,k,b,v),2===t)return v;i=k.global,i&&0===n.active++&&n.event.trigger("ajaxStart"),k.type=k.type.toUpperCase(),k.hasContent=!kc.test(k.type),d=k.url,k.hasContent||(k.data&&(d=k.url+=(dc.test(d)?"&":"?")+k.data,delete k.data),k.cache===!1&&(k.url=hc.test(d)?d.replace(hc,"$1_="+cc++):d+(dc.test(d)?"&":"?")+"_="+cc++)),k.ifModified&&(n.lastModified[d]&&v.setRequestHeader("If-Modified-Since",n.lastModified[d]),n.etag[d]&&v.setRequestHeader("If-None-Match",n.etag[d])),(k.data&&k.hasContent&&k.contentType!==!1||b.contentType)&&v.setRequestHeader("Content-Type",k.contentType),v.setRequestHeader("Accept",k.dataTypes[0]&&k.accepts[k.dataTypes[0]]?k.accepts[k.dataTypes[0]]+("*"!==k.dataTypes[0]?", "+pc+"; q=0.01":""):k.accepts["*"]);for(j in k.headers)v.setRequestHeader(j,k.headers[j]);if(k.beforeSend&&(k.beforeSend.call(l,v,k)===!1||2===t))return v.abort();u="abort";for(j in{success:1,error:1,complete:1})v[j](k[j]);if(c=sc(oc,k,b,v)){v.readyState=1,i&&m.trigger("ajaxSend",[v,k]),k.async&&k.timeout>0&&(g=setTimeout(function(){v.abort("timeout")},k.timeout));try{t=1,c.send(r,x)}catch(w){if(!(2>t))throw w;x(-1,w)}}else x(-1,"No Transport");function x(a,b,f,h){var j,r,s,u,w,x=b;2!==t&&(t=2,g&&clearTimeout(g),c=void 0,e=h||"",v.readyState=a>0?4:0,j=a>=200&&300>a||304===a,f&&(u=uc(k,v,f)),u=vc(k,u,v,j),j?(k.ifModified&&(w=v.getResponseHeader("Last-Modified"),w&&(n.lastModified[d]=w),w=v.getResponseHeader("etag"),w&&(n.etag[d]=w)),204===a||"HEAD"===k.type?x="nocontent":304===a?x="notmodified":(x=u.state,r=u.data,s=u.error,j=!s)):(s=x,(a||!x)&&(x="error",0>a&&(a=0))),v.status=a,v.statusText=(b||x)+"",j?o.resolveWith(l,[r,x,v]):o.rejectWith(l,[v,x,s]),v.statusCode(q),q=void 0,i&&m.trigger(j?"ajaxSuccess":"ajaxError",[v,k,j?r:s]),p.fireWith(l,[v,x]),i&&(m.trigger("ajaxComplete",[v,k]),--n.active||n.event.trigger("ajaxStop")))}return v},getJSON:function(a,b,c){return n.get(a,b,c,"json")},getScript:function(a,b){return n.get(a,void 0,b,"script")}}),n.each(["get","post"],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax({url:a,type:b,dataType:e,data:c,success:d})}}),n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},n.fn.extend({wrapAll:function(a){var b;return n.isFunction(a)?this.each(function(b){n(this).wrapAll(a.call(this,b))}):(this[0]&&(b=n(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return this.each(n.isFunction(a)?function(b){n(this).wrapInner(a.call(this,b))}:function(){var b=n(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=n.isFunction(a);return this.each(function(c){n(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){n.nodeName(this,"body")||n(this).replaceWith(this.childNodes)}).end()}}),n.expr.filters.hidden=function(a){return a.offsetWidth<=0&&a.offsetHeight<=0},n.expr.filters.visible=function(a){return!n.expr.filters.hidden(a)};var wc=/%20/g,xc=/\[\]$/,yc=/\r?\n/g,zc=/^(?:submit|button|image|reset|file)$/i,Ac=/^(?:input|select|textarea|keygen)/i;function Bc(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||xc.test(a)?d(a,e):Bc(a+"["+("object"==typeof e?b:"")+"]",e,c,d)});else if(c||"object"!==n.type(b))d(a,b);else for(e in b)Bc(a+"["+e+"]",b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)Bc(c,a[c],b,e);return d.join("&").replace(wc,"+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,"elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&Ac.test(this.nodeName)&&!zc.test(a)&&(this.checked||!T.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(yc,"\r\n")}}):{name:b.name,value:c.replace(yc,"\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try{return new XMLHttpRequest}catch(a){}};var Cc=0,Dc={},Ec={0:200,1223:204},Fc=n.ajaxSettings.xhr();a.ActiveXObject&&n(a).on("unload",function(){for(var a in Dc)Dc[a]()}),k.cors=!!Fc&&"withCredentials"in Fc,k.ajax=Fc=!!Fc,n.ajaxTransport(function(a){var b;return k.cors||Fc&&!a.crossDomain?{send:function(c,d){var e,f=a.xhr(),g=++Cc;if(f.open(a.type,a.url,a.async,a.username,a.password),a.xhrFields)for(e in a.xhrFields)f[e]=a.xhrFields[e];a.mimeType&&f.overrideMimeType&&f.overrideMimeType(a.mimeType),a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for(e in c)f.setRequestHeader(e,c[e]);b=function(a){return function(){b&&(delete Dc[g],b=f.onload=f.onerror=null,"abort"===a?f.abort():"error"===a?d(f.status,f.statusText):d(Ec[f.status]||f.status,f.statusText,"string"==typeof f.responseText?{text:f.responseText}:void 0,f.getAllResponseHeaders()))}},f.onload=b(),f.onerror=b("error"),b=Dc[g]=b("abort");try{f.send(a.hasContent&&a.data||null)}catch(h){if(b)throw h}},abort:function(){b&&b()}}:void 0}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(d,e){b=n("<script>").prop({async:!0,charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&e("error"===a.type?404:200,a.type)}),l.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Gc=[],Hc=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Gc.pop()||n.expando+"_"+cc++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Hc.test(b.url)?"url":"string"==typeof b.data&&!(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Hc.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Hc,"$1"+e):b.jsonp!==!1&&(b.url+=(dc.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Gc.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),n.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||l;var d=v.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=n.buildFragment([a],b,e),e&&e.length&&n(e).remove(),n.merge([],d.childNodes))};var Ic=n.fn.load;n.fn.load=function(a,b,c){if("string"!=typeof a&&Ic)return Ic.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>=0&&(d=n.trim(a.slice(h)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e,dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).complete(c&&function(a,b){g.each(c,f||[a.responseText,b,a])}),this},n.expr.filters.animated=function(a){return n.grep(n.timers,function(b){return a===b.elem}).length};var Jc=a.document.documentElement;function Kc(a){return n.isWindow(a)?a:9===a.nodeType&&a.defaultView}n.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=n.css(a,"position"),l=n(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=n.css(a,"top"),i=n.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),n.isFunction(b)&&(b=b.call(a,c,h)),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},n.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){n.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,n.contains(b,d)?(typeof d.getBoundingClientRect!==U&&(e=d.getBoundingClientRect()),c=Kc(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===n.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),n.nodeName(a[0],"html")||(d=a.offset()),d.top+=n.css(a[0],"borderTopWidth",!0),d.left+=n.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-n.css(c,"marginTop",!0),left:b.left-d.left-n.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||Jc;while(a&&!n.nodeName(a,"html")&&"static"===n.css(a,"position"))a=a.offsetParent;return a||Jc})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(b,c){var d="pageYOffset"===c;n.fn[b]=function(e){return J(this,function(b,e,f){var g=Kc(b);return void 0===f?g?g[c]:b[e]:void(g?g.scrollTo(d?a.pageXOffset:f,d?f:a.pageYOffset):b[e]=f)},b,e,arguments.length,null)}}),n.each(["top","left"],function(a,b){n.cssHooks[b]=yb(k.pixelPosition,function(a,c){return c?(c=xb(a,b),vb.test(c)?n(a).position()[b]+"px":c):void 0})}),n.each({Height:"height",Width:"width"},function(a,b){n.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){n.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return J(this,function(b,c,d){var e;return n.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?n.css(b,c,g):n.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),n.fn.size=function(){return this.length},n.fn.andSelf=n.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return n});var Lc=a.jQuery,Mc=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=Mc),b&&a.jQuery===n&&(a.jQuery=Lc),n},typeof b===U&&(a.jQuery=a.$=n),n});
//# sourceMappingURL=jquery.min.map

/* ---- GM shim（内联） ---- */
/* =============================================================
 * gm-shim.js — 小说阅读助手 扩展版 GM API 适配层（Manifest V3）
 * 把脚本依赖的同步 GM_* API 映射到 chrome 扩展 API。
 *
 * 关键策略：
 *  1. GM_getValue/setValue/listValues/deleteValue → chrome.storage.local
 *     启动时一次性预加载全部配置到内存 __store，后续同步读内存、异步写回，
 *     保证 content.js 主体（大量同步读取）几乎不用改。
 *  2. GM_xmlhttpRequest → 经 background 转发（content script 受 CORS 限制）
 *  3. GM_addStyle → 直接注入 <style>
 *  4. GM_openInTab → 经 background chrome.tabs.create
 *  5. unsafeWindow → content script 隔离世界中映射为 window
 * ============================================================= */
(function () {
  'use strict';

  // ---- 存储层：内存缓存 + 异步落盘 ----
  var __store = {};
  var __loaded = false;
  var __loadPromise = null;

  function loadAll() {
    if (__loadPromise) return __loadPromise;
    // chrome.storage 读取可能较慢或被延迟；加超时兜底，避免 content.js 的
    // await __loadAll() 长期挂起（挂起会导致扩展版不自动进入阅读模式、净化/翻页全失效）。
    __loadPromise = new Promise(function (resolve) {
      var done = false;
      function finish(store) {
        if (done) return;
        done = true;
        __store = store || {};
        __loaded = true;
        resolve(__store);
      }
      try {
        chrome.storage.local.get(null, function (items) {
          finish(items);
        });
      } catch (e) {
        finish(null);
      }
      // 超时兜底：2.5s 内读取未完成也视为"已加载"，后续 GM_setValue 写入的值仍可读
      setTimeout(function () { finish(__store); }, 2500);
    });
    return __loadPromise;
  }

  // ---- 全局 GM API（同步外观） ----
  function GM_getValue(key, def) {
    // 优先返回 __store 中已有的值（包括本会话内 GM_setValue 已写入、但存储尚未
    // 完成预加载的值）。这修复了"注入块 GM_setValue('launchMode','auto') 后，
    // isAutoLaunch 仍读回默认 'memory' → 不自动进入阅读模式"的根因。
    if (key in __store) return __store[key];
    if (!__loaded) {
      // 极端情况：脚本在预加载完成前调用且从未写入过该 key——同步返回默认值
      return def;
    }
    return def;
  }

  function GM_setValue(key, value) {
    __store[key] = value;
    try {
      chrome.storage.local.set({ [key]: value }, function () {});
    } catch (e) {}
  }

  function GM_deleteValue(key) {
    delete __store[key];
    try {
      chrome.storage.local.remove(key, function () {});
    } catch (e) {}
  }

  function GM_listValues() {
    return Object.keys(__store);
  }

  // ---- 样式注入 ----
  function GM_addStyle(css) {
    var style = document.createElement('style');
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
    return style;
  }

  // ---- 跨域请求（经 background 转发，绕过 CORS） ----
  function GM_xmlhttpRequest(details) {
    var onload = details.onload, onerror = details.ontimeout || details.onerror;
    chrome.runtime.sendMessage(
      {
        action: 'mnr_fetch',
        url: details.url,
        method: details.method || 'GET',
        headers: details.headers || {},
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

  // ---- 打开新标签 ----
  function GM_openInTab(url, active) {
    chrome.runtime.sendMessage({ action: 'mnr_open_tab', url: url, active: !!active });
  }

  // ---- GM_info ----
  var GM_info = {
    script: {
      name: '小说阅读助手',
      version: '3.3',
      description: '小说阅读助手：统一阅读样式、去广告、段落整理、自动翻页、进度记忆、快捷键',
      includes: ['*://*/*'],
      excludes: []
    }
  };

  // ---- unsafeWindow：content script 隔离世界中，window 即页面 DOM 环境，映射为 window ----
  var unsafeWindow = window;

  // 以真实全局变量形式暴露（content.js 为 'use strict'，引用未声明变量会抛错）
  this.GM_getValue = GM_getValue;
  this.GM_setValue = GM_setValue;
  this.GM_deleteValue = GM_deleteValue;
  this.GM_listValues = GM_listValues;
  this.GM_addStyle = GM_addStyle;
  this.GM_xmlhttpRequest = GM_xmlhttpRequest;
  this.GM_openInTab = GM_openInTab;
  this.GM_info = GM_info;
  this.unsafeWindow = unsafeWindow;
  this.jQuery = this.$ = window.jQuery;
  // 注：document/location/history/navigator/localStorage 在 content script 隔离
  // 世界里本就作为全局可用，且为浏览器定义的只读属性（getter），在此重新赋值
  // 会抛 "Cannot set property document of #<Window> which has only a getter"，
  // 导致 __GM_shim 无法暴露、存储预加载从不执行。故不再重复赋值。
  // content.js 直接引用这些全局即可。

  // ---- 暴露到全局供 content.js 使用 ----
  window.__GM_shim = {
    GM_getValue: GM_getValue,
    GM_setValue: GM_setValue,
    GM_deleteValue: GM_deleteValue,
    GM_listValues: GM_listValues,
    GM_addStyle: GM_addStyle,
    GM_xmlhttpRequest: GM_xmlhttpRequest,
    GM_openInTab: GM_openInTab,
    GM_info: GM_info,
    unsafeWindow: unsafeWindow,
    __loadAll: loadAll,
    __loaded: function () { return __loaded; }
  };

  // 立即开始预加载存储
  loadAll();
}).call(window);

/* ---- 主逻辑 ---- */
/* =============================================================
 * 小说阅读助手 浏览器扩展版 content.js（Manifest V3）
 * 由 小说阅读助手.js 改造生成，核心阅读逻辑复用。
 * GM_* API 由 gm-shim.js 提供；jQuery 由 jquery.min.js 提供。
 * ============================================================= */

(function () {


  'use strict';

  // 扩展版无油猴 unsafeWindow 全局：映射到隔离世界 window（自用脚本可满足 innerHeight / jQuery 等需求）
  var unsafeWindow = window;

  /* global $, jQuery, _, key, document, window, location, history, localStorage,
  setTimeout, clearTimeout, console, Promise, Set, WeakMap, prompt, MutationObserver,
  DOMParser, NodeFilter, WheelEvent, MouseEvent, getComputedStyle, CSSFontFaceRule,
  Blob, URL, FileReader,
  GM_info, GM_getValue, GM_setValue, GM_addStyle, GM_xmlhttpRequest,
  GM_openInTab, GM_listValues, GM_deleteValue,
  unsafeWindow, exportFunction */

  /* =====================================================================
   * 模块导航索引（单文件内结构化模块化，逻辑零改动）
   * ---------------------------------------------------------------------
   * M0  运行时与全局     IIFE / 'use strict' / unsafeWindow 映射
   * M1  基础配置与常量   config / logStore / C
   * M2  通用工具函数     本地存储 L_* / parseHTML / toRE / wildcard /
   *                     getUrlHost / sleep / DOMContentLoaded / Request /
   *                     getTextNodesIn / getBooleanConfig
   * M3  设置对象 Setting 全部可读写设置项 + 快捷键 + 站点启用
   * M4  站点规则与映射   sites / CHAR_ALIAS / Rule / trashLineRules
   * M5  正文处理工具     tpl_mainHtml / 书名识别 / 归一化 / HTML清洗 /
   *                     渲染 / 字体 / 观察器
   * M6  内容净化         applyContentSettings（文本层）/ applyDomClean（DOM层）
   * M7  正文解析器       Parser：章节/正文提取与站点规则执行
   * M8  样式与面板模板   tpl_mainCss / tpl_preferencesHTML / tpl_preferencesCSS
   * M9  资源常量         Res
   * M10 界面 UI          阅读界面 / 设置面板 / reapplyContentClean
   * M11 事件清理与翻页辅  cleanupEvents / RequestStatus / iframeHeight
   * M12 主应用 App$1     init / launch / processPage / registerControls /
   *                     registerKeys / 自动滚动 / doRequest / addNextPage
   * M13 启动注入         注入块 / 扩展增强监听 / 兜底按钮
   * ===================================================================== */

  
  // =====================================================================
  // [模块 M1] 基础配置与常量
  // 职责：脚本运行常量 config、日志写入 logStore、错误处理对象 C
  // =====================================================================
  const config = {

    soduso: false,                  // www.sodu.so 跳转
    // content_replacements: true,     // 小说屏蔽字修复

    xhr_time: 15 * 1000,
  };


  //------------------- 辅助函数 ----------------------------------------


  if (typeof window.exportFunction == 'undefined') {
      // For GM 1.x backward compatibility, should work.
      window.exportFunction = (function(foo, scope, defAs) {
          scope[defAs.defineAs] = foo;
      }).bind(unsafeWindow);
  }

  // 日志：写入浏览器扩展存储（GM_setValue），上限 100 条，不占脚本体积
  function logStore(level, msg, err) {
      try {
          var logs = GM_getValue('mnr_logs', []) || [];
          logs.push({ t: Date.now(), l: level, m: String(msg), e: err ? String(err && err.message || err) : '' });
          if (logs.length > 500) logs = logs.slice(-500);
          GM_setValue('mnr_logs', logs);
      } catch (e) {}
  }
  var C = {
      error: function(msg, err) { logStore('error', msg, err); },
      warn: function(msg) { logStore('warn', msg); }
  };

  // =====================================================================
  // [模块 M2] 通用工具函数
  // 职责：本地存储 L_* / parseHTML / toRE / wildcard / getUrlHost /
  //       sleep / DOMContentLoaded / Request / getTextNodesIn / getBooleanConfig
  // 依赖：无（仅用原生 + jQuery）
  // =====================================================================
  function L_getValue(key) { // 个别用户禁用本地存储会报错
      try {
          return localStorage.getItem(key);
      } catch (e) {}
  }

  function L_setValue(key, value) {
      try {
          localStorage.setItem(key, value);
      } catch (e) {}
  }

  function L_removeValue(key) {
      try {
          localStorage.removeItem(key);
      } catch (e) {}
  }


  function parseHTML(str) {
      var doc;
      try {
          // firefox and chrome 30+，Opera 12 会报错
          doc = new DOMParser().parseFromString(str, "text/html");
      } catch (ex) {}

      if (!doc) {
          doc = document.implementation.createHTMLDocument("");
          doc.querySelector("html").innerHTML = str;
      }
      return doc;
  }

  const _regexCache = {};

  function toRE(obj, flag = 'igm') {
      if (obj instanceof RegExp) {
          return obj;
      } else if (_regexCache[obj] && _regexCache[obj][flag]) {
          const re = _regexCache[obj][flag];
          re.lastIndex = 0;
          return re
      } else if (!_regexCache[obj]) {
          const re = new RegExp(obj, flag);
          _regexCache[obj] = { [flag]: re };
          return re
      } else if (!_regexCache[obj][flag]) {
          const re = new RegExp(obj, flag);
          _regexCache[obj][flag] = re;
          return re
      }
  }

  function toReStr(str) {  // 处理字符串，否则可能会无法用正则替换
      return str.replace(/[()\[\]{}|+.,^$?\\*]/g, "\\$&");
  }

  function wildcardToRegExpStr(urlstr) {
      if (urlstr.source) return urlstr.source;
      var reg = urlstr.replace(/[()\[\]{}|+.,^$?\\]/g, "\\$&").replace(/\*+/g, function(str){
          return str === "*" ? ".*" : "[^/]*";
      });
      return "^" + reg + "$";
  }

  function getUrlHost(url) {
      var a = document.createElement('a');
      a.href = url;
      return a.host;
  }

  function sleep(timeout) {
      return new Promise(resolve => setTimeout(resolve, timeout))
  }

  // 等待 DOMContentLoaded 事件触发
  function DOMContentLoaded(){
      return new Promise(resolve => $(resolve))
  }

  // GM_xmlhttpRequest Promise 版
  function Request(options) {
      return new Promise((resolve, reject) => {
          options.onerror = options.ontimeout = reject;
          options.onload = resolve;
          GM_xmlhttpRequest(options);
      })
  }


  // https://stackoverflow.com/a/4399718
  // 获取所有文本节点
  function getTextNodesIn(node, includeWhitespaceNodes) {
      var textNodes = [],
          nonWhitespaceMatcher = /\S/;

      function getTextNodes(node) {
          if (node.nodeType == 3) {
              if (includeWhitespaceNodes || nonWhitespaceMatcher.test(node.nodeValue)) {
                  textNodes.push(node);
              }
          } else {
              for (var i = 0, len = node.childNodes.length; i < len; ++i) {
                  getTextNodes(node.childNodes[i]);
              }
          }
      }
      node.normalize();
      getTextNodes(node);
      return textNodes
  }


  // 模板
  $.nano = function(template, data) {
      return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
          var keys = key.split("."),
              v = data[keys.shift()];
          try {
              for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
          } catch (e) {}
          return (typeof v !== "undefined" && v !== null) ? v : "";
      });
  };

  // jQuery text 完全匹配. e.g. a:econtains('最新章节')
  $.expr[":"].econtains = function(obj, index, meta) {
      return (obj.textContent || obj.innerText || $(obj).text() || "").toLowerCase() == meta[3].toLowerCase();
  };

  /* jshint ignore: start */


  if (typeof String.prototype.startsWith != 'function') {
      String.prototype.startsWith = function(str) {
          return this.slice(0, str.length) == str;
      };
  }

  if (typeof String.prototype.endsWith != 'function') {
      String.prototype.endsWith = function(str) {
          return this.slice(-str.length) == str;
      };
  }

  if (!String.prototype.includes) {
      String.prototype.includes = function(search, start) {
          if (typeof start !== 'number') {
              start = 0;
          }
          if (start + search.length > this.length) {
              return false;
          } else {
              return this.indexOf(search, start) !== -1;
          }
      };
  }


  /*
   * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
   */
  jQuery.easing.jswing=jQuery.easing.swing,jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(a,b,c,d,e){return jQuery.easing[jQuery.easing.def](a,b,c,d,e)},easeInQuad:function(a,b,c,d,e){return d*(b/=e)*b+c},easeOutQuad:function(a,b,c,d,e){return -d*(b/=e)*(b-2)+c},easeInOutQuad:function(a,b,c,d,e){return (b/=e/2)<1?d/2*b*b+c:-d/2*(--b*(b-2)-1)+c},easeInCubic:function(a,b,c,d,e){return d*(b/=e)*b*b+c},easeOutCubic:function(a,b,c,d,e){return d*((b=b/e-1)*b*b+1)+c},easeInOutCubic:function(a,b,c,d,e){return (b/=e/2)<1?d/2*b*b*b+c:d/2*((b-=2)*b*b+2)+c},easeInQuart:function(a,b,c,d,e){return d*(b/=e)*b*b*b+c},easeOutQuart:function(a,b,c,d,e){return -d*((b=b/e-1)*b*b*b-1)+c},easeInOutQuart:function(a,b,c,d,e){return (b/=e/2)<1?d/2*b*b*b*b+c:-d/2*((b-=2)*b*b*b-2)+c},easeInQuint:function(a,b,c,d,e){return d*(b/=e)*b*b*b*b+c},easeOutQuint:function(a,b,c,d,e){return d*((b=b/e-1)*b*b*b*b+1)+c},easeInOutQuint:function(a,b,c,d,e){return (b/=e/2)<1?d/2*b*b*b*b*b+c:d/2*((b-=2)*b*b*b*b+2)+c},easeInSine:function(a,b,c,d,e){return -d*Math.cos(b/e*(Math.PI/2))+d+c},easeOutSine:function(a,b,c,d,e){return d*Math.sin(b/e*(Math.PI/2))+c},easeInOutSine:function(a,b,c,d,e){return -d/2*(Math.cos(Math.PI*b/e)-1)+c},easeInExpo:function(a,b,c,d,e){return 0==b?c:d*Math.pow(2,10*(b/e-1))+c},easeOutExpo:function(a,b,c,d,e){return b==e?c+d:d*(-Math.pow(2,-10*b/e)+1)+c},easeInOutExpo:function(a,b,c,d,e){return 0==b?c:b==e?c+d:(b/=e/2)<1?d/2*Math.pow(2,10*(b-1))+c:d/2*(-Math.pow(2,-10*--b)+2)+c},easeInCirc:function(a,b,c,d,e){return -d*(Math.sqrt(1-(b/=e)*b)-1)+c},easeOutCirc:function(a,b,c,d,e){return d*Math.sqrt(1-(b=b/e-1)*b)+c},easeInOutCirc:function(a,b,c,d,e){return (b/=e/2)<1?-d/2*(Math.sqrt(1-b*b)-1)+c:d/2*(Math.sqrt(1-(b-=2)*b)+1)+c},easeInElastic:function(a,b,c,d,e){var f=1.70158,g=0,h=d;return 0==b?c:1==(b/=e)?c+d:(g||(g=.3*e),h<Math.abs(d)?(h=d,f=g/4):f=g/(2*Math.PI)*Math.asin(d/h),-(h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g))+c)},easeOutElastic:function(a,b,c,d,e){var f=1.70158,g=0,h=d;return 0==b?c:1==(b/=e)?c+d:(g||(g=.3*e),h<Math.abs(d)?(h=d,f=g/4):f=g/(2*Math.PI)*Math.asin(d/h),h*Math.pow(2,-10*b)*Math.sin((b*e-f)*2*Math.PI/g)+d+c)},easeInOutElastic:function(a,b,c,d,e){var f=1.70158,g=0,h=d;return 0==b?c:2==(b/=e/2)?c+d:(g||(g=e*.3*1.5),h<Math.abs(d)?(h=d,f=g/4):f=g/(2*Math.PI)*Math.asin(d/h),1>b?-.5*h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)+c:.5*h*Math.pow(2,-10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)+d+c)},easeInBack:function(a,b,c,d,e,f){return void 0==f&&(f=1.70158),d*(b/=e)*b*((f+1)*b-f)+c},easeOutBack:function(a,b,c,d,e,f){return void 0==f&&(f=1.70158),d*((b=b/e-1)*b*((f+1)*b+f)+1)+c},easeInOutBack:function(a,b,c,d,e,f){return void 0==f&&(f=1.70158),(b/=e/2)<1?d/2*b*b*(((f*=1.525)+1)*b-f)+c:d/2*((b-=2)*b*(((f*=1.525)+1)*b+f)+2)+c},easeInBounce:function(a,b,c,d,e){return d-jQuery.easing.easeOutBounce(a,e-b,0,d,e)+c},easeOutBounce:function(a,b,c,d,e){return (b/=e)<1/2.75?d*7.5625*b*b+c:2/2.75>b?d*(7.5625*(b-=1.5/2.75)*b+.75)+c:2.5/2.75>b?d*(7.5625*(b-=2.25/2.75)*b+.9375)+c:d*(7.5625*(b-=2.625/2.75)*b+.984375)+c},easeInOutBounce:function(a,b,c,d,e){return e/2>b?.5*jQuery.easing.easeInBounce(a,2*b,0,d,e)+c:.5*jQuery.easing.easeOutBounce(a,2*b-e,0,d,e)+.5*d+c}});

  /* jshint ignore: end */

  var getBooleanConfig = function(configName, defaultValue) {
      var config = GM_getValue(configName);
      if(config === undefined) {
          GM_setValue(configName, defaultValue);
          config = defaultValue;
      }
      return config;
  };

  // =====================================================================
  // [模块 M3] 设置对象 Setting
  // 职责：全部可读写设置项（皮肤/字体/排版/净化/翻页/快捷键/站点启用等）
  // 依赖：GM_getValue/GM_setValue、config
  // =====================================================================
  const Setting = {
      // },

      get addToHistory() {
          if (this._addToHistory === void 0) {
              this._addToHistory = getBooleanConfig("add_nextpage_to_history", true);
          }
          return this._addToHistory;
      },
      set addToHistory(bool) {
          this._addToHistory = bool;
          GM_setValue("add_nextpage_to_history", bool);
      },

      // 自动滚动阅读速度（像素/秒，20-300，默认60）
      get autoScrollSpeed() {
          return parseInt(GM_getValue('auto_scroll_speed', 20), 10) || 20;
      },
      set autoScrollSpeed(speed) {
          GM_setValue('auto_scroll_speed', parseInt(speed, 10));
      },

      get remain_height() {  // 距离底部多少高度（px）开始加载下一页
          if(this._remain_height === void 0){
              this._remain_height = parseInt(GM_getValue("remain_height"), 10) || 400;
          }
          return this._remain_height;
      },
      set remain_height(val) {
          this._remain_height = val;
          GM_setValue("remain_height", val);
      },


      get font_family() {
          var saved = GM_getValue("font_family");
          if (saved) return saved;
          // 平台自适应默认字体：macOS 优先苹方 PingFang SC，Windows 优先微软雅黑（各 4 种）
          var isMac = /Macintosh|Mac OS X/.test(navigator.userAgent);
          return isMac ? "PingFang SC,苹方-简,宋体,楷体"
                       : "微软雅黑,宋体,黑体,楷体";
      },
      set font_family(val) {
          GM_setValue("font_family", val);
      },

      get font_size() {  // 字体大小
          return GM_getValue("font_size") || "20px";
      },
      set font_size(val) {
          GM_setValue("font_size", val);
      },

      get text_line_height(){
          return GM_getValue("text_line_height") || "1.5em";
      },
      set text_line_height(val){
          GM_setValue("text_line_height", val);
      },

      get paragraph_height(){
          return GM_getValue("paragraph_height") || "0.5em";
      },
      set paragraph_height(val){
          GM_setValue("paragraph_height", val);
      },

      get content_width() {  // 内容宽度
          return GM_getValue("content_width") || "1000px";
      },
      set content_width(val) {
          GM_setValue("content_width", val);
      },


      get customSiteinfo() {
          return GM_getValue('custom_siteinfo', '[]');
      },
      set customSiteinfo(val) {
          GM_setValue('custom_siteinfo', val);
      },


      get skin_name() {
          return GM_getValue("skin_name") || "浅色";
      },
      set skin_name(val) {
          GM_setValue("skin_name", val);
      },

      get menu_list_hiddden() {
          return getBooleanConfig("menu_list_hiddden", true);
      },
      set menu_list_hiddden(bool) {
          GM_setValue("menu_list_hiddden", bool);
      },


      


      // === 快捷键

      // 打开设置窗口的快捷键
      get openPreferencesKey() {
          if (this._openPreferencesKey) {
              return this._openPreferencesKey;
          }
          this._openPreferencesKey = GM_getValue('open_preferences_key') || 'o';

          return this._openPreferencesKey;
      },
      set openPreferencesKey(keyCode) {
          this._openPreferencesKey = keyCode;
          GM_setValue('open_preferences_key', keyCode);
      },

      // 隐藏左侧章节列表的快捷键
      get hideMenuListKey() {  // 默认为 c
          // 'C'.charCodeAt(0) = 67
          if (this._hideMenuListKey) {
              return this._hideMenuListKey;
          }
          this._hideMenuListKey = GM_getValue('hide_menulist_key') || 'c';

          return this._hideMenuListKey;
      },
      set hideMenuListKey(key) {
          this._hideMenuListKey = key;
          GM_setValue("hide_menulist_key", key);
      },


      get scrollAnimate() {
          return GM_getValue('scrollAnimate', true);
      },
      set scrollAnimate(bool) {
          GM_setValue('scrollAnimate', bool);
      },

      get preloadNextPage() {
          return GM_getValue('preloadNextPage', false);
      },
      set preloadNextPage(bool) {
          GM_setValue('preloadNextPage', bool);
      },

      get smartNextPage() {  // 智能下一页：找不到下一页链接时按网址页码规律递增
          return GM_getValue('smartNextPage', true);
      },
      set smartNextPage(bool) {
          GM_setValue('smartNextPage', bool);
      },


      // 内容标准化
      get contentNormalize() {
          // 内存缓存：启动后首次读取时从 GM 载入一次，之后用缓存值，避免翻页等场景下 GM_getValue 回落默认值导致开关失效
          if (this._contentNormalize === void 0) {
              this._contentNormalize = GM_getValue('contentNormalize', true);
          }
          return this._contentNormalize;
      },
      set contentNormalize(bool) {
          this._contentNormalize = bool;
          GM_setValue('contentNormalize', bool);
      },

      // 内容优化：合并多行引号/标点清洗/全半角转换/自动强制分段（会调整原文排版，默认关，需时再开）
      get contentOptimize() {
          // 内存缓存：与 contentNormalize 同理，防止翻页时开关回落默认 false 导致「翻页后优化失效」
          if (this._contentOptimize === void 0) {
              this._contentOptimize = GM_getValue('contentOptimize', false);
          }
          return this._contentOptimize;
      },
      set contentOptimize(bool) {
          this._contentOptimize = bool;
          GM_setValue('contentOptimize', bool);
      },

      // 快速启动

      
  };


  // 一次性迁移：正文内容净化默认开启。升级时把旧的关闭存储值覆盖为开启（仅执行一次，之后尊重手动开关）
  if (GM_getValue('cn_default_on_migrated', false) === false) {
      GM_setValue('contentNormalize', true);
      GM_setValue('cn_default_on_migrated', true);
  }

  // 站点白名单：判断当前站点是否已启用阅读器（读 mnr_enabled_sites，未启用返回 false）
  function isSiteEnabled(host) {
      try {
          var list = GM_getValue('mnr_enabled_sites', []) || [];
          if (!Array.isArray(list)) list = [];
          if (!host) host = location.hostname;
          return list.indexOf(host) >= 0;
      } catch (e) { return false; }
  }

  // ===== 自定义站点规则 =====

  /**@typedef { import("../../typings/小说阅读助手").SiteConfigs } SiteConfigs */

  /**@type {SiteConfigs} */
  // =====================================================================
  // [模块 M4] 站点规则与字符映射
  // 职责：内置站点规则 sites / 字符别名 CHAR_ALIAS / 通用规则 Rule（含 trashLineRules 文本净化规则）
  // 依赖：Setting
  // =====================================================================
  const sites = [
      {
          // 起点新版章节页：脚本后台请求会被 202 JS 挑战拦截（返回空），改用同源 iframe 导航加载
          url: /^https:\/\/www\.qidian\.com\/chapter\//i,
          name: "起点中文网",
          useiframe: true,
          contentSelector: "[aria-label='主体内容'], [title='主体内容']",
          waitContentText: 200,      // 正文容器纯文本达到 200 字视为渲染完成
          waitTimeout: 12000         // 单次加载最长等待 12s
      }
  ];


  // 广告过滤已移除（统一交由浏览器广告拦截扩展处理，脚本不再内置）

  // Unicode/2000-2FFF：http://zh.wikibooks.org/wiki/Unicode/2000-2FFF
  // Unicode/F000-FFFF：https://zh.wikibooks.org/wiki/Unicode/F000-FFFF

  // replace 中的简写
  var CHAR_ALIAS = {
    '\\P': '[\\u2000-\\u2FFF\\u3004-\\u303F\\uFE00-\\uFF60\\uFFC0-\\uFFFF]',  // 小说中添加的特殊符号
  };

  // ===== 自动尝试的规则 =====
  var Rule = {
    titleRegExp: /第?\s*[一二两三四五六七八九十○零百千万亿0-9１２３４５６７８９０〇]{1,6}\s*[章回卷节折篇幕集话話]/i,
    titleReplace: /^章节目录|^文章正文|^正文卷?|全文免费阅读|最新章节|\(文\)/,

    // nextRegExp: /[上前下后][一]?[页张个篇章节步]/,
    nextSelector: "a[rel='next'], a:contains('下一页'), a:contains('下一頁'), a:contains('下一章'), a:contains('下一节'), a:contains('下页'), a:contains('下章')",
    prevSelector: "a[rel='prev'], a:contains('上一页'), a:contains('上一頁'), a:contains('上一章'), a:contains('上一节'), a:contains('上页'), a:contains('上章')",
    // 忽略的下一页链接，匹配 href
    nextUrlIgnore: [
        /(?:(?:index|list|last|LastPage|end)\.)|BuyChapterUnLogin|^javascript:/i,

        // qidian
        // /BookReader\/LastPageNew\.aspx/i,
        // /read\.qidian\.com\/BookReader\/\d+,0\.aspx$/i,
        /read\.qidian\.com\/$/i,

        /book\.zongheng\.com\/readmore/i,
        /www\.shumilou\.com\/to-n-[a-z]+-\d+\.html/i,
        /\/0\.html$/i,
    ],
    nextUrlCompare: /\/\d+([_-]\d+)?\.html?$|\/wcxs-\d+-\d+\/$|chapter-\d+\.html$|\/\d+_\d+\/$|\/\d+\/\d+$/i,  // 忽略的下一页链接（特殊），跟上一页比较

    // 按顺序匹配，匹配到则停止。econtains 完全相等
    indexSelectors: ["a[href='index.html']", "a:contains('返回书目')", "a:contains('章节目录')", "a:contains('章节列表')",
        "a:econtains('最新章节')", "a:contains('回目录')","a:contains('回书目')", "a:contains('目 录')", "a:contains('目录')"],

    contentSelectors: ["#nr_content", ".nr_content", "#nr", ".nr_nr", "#nr1",
        "#reader-content", "#pagecontent", "#contentbox", "#bmsy_content", "#bookpartinfo", "#htmlContent",
        "#text_area", "#chapter_content", "#chapterContent", "#chaptercontent", "#partbody", "#BookContent", "#read-content",
        "#article_content", "#BookTextRead", "#booktext", "#book_text", "#BookText", "#BookTextt", "#readtext", "#readcon", "#read",
        "#TextContent", "#txtContent" , "#text_c", "#txt_td", "#TXT", "#txt", "#zjneirong",
        "#contentTxt", "#oldtext", "#a_content", "#contents", "#content2", "#contentts", "#content1", "#content", 
        "#booktxt", "#nr", "#rtext", "#articlecontent", "#novelcontent", "#text-content", "#articlebody",
        "#ChapterContents", "#acontent", "#chapterinfo", "#read_content", "#chapter-content",
        ".novel_content", ".readmain_inner", ".noveltext", ".booktext", ".yd_text2",
        ".articlecontent", ".readcontent", ".txtnav", ".content", ".art_con", ".article",
        "article",
    ],

    // 尝试查找书名。顶部章节导航的最后一个链接可能是书名。
    bookTitleSelector: [
      '.h1title > .shuming > a[title]',
      '.chapter_nav > div:first > a:last',
      '#header > .readNav > span > a:last',
      'div[align="center"] > .border_b > a:last',
      '.ydselect > .weizhi > a:last',
      '.bdsub > .bdsite > a:last',
      '#sitebar > a:last',
      '.con_top > a:eq(1)',
      '.con_top > a:last',
      '.breadCrumb > a:last',
      '.breadcrumb > a:last',
      '.bookNav > a:last',
      '.srcbox > a:last',
      '.con_top > .nr_s1 > a:last',
      '.location > a:last',
      '.nav > a:last',
      '.DivCurrentPos > a:last',
      '.layout-tit > a:last',
      '.ymdz > a:last',
      '.articletitle > a',
      '.chepnav > a:last',
      '.bread_crumbs a:last',
      '.weizhi a:last',
      '.breadcrumbs a:last',
      '.cover-nav a:last',
      '.path > .p > a:last',
      '.headlink > .linkleft > a:last',
      '.path a:last',
      '.readNav a:last',
      '.chapter-nav a:last',
      '.bread > a:nth-child(3)',
      '.bread a:last',
    ],
    bookTitleReplace: [
        '全文阅读$', '在线阅读$', '最新章节$', '^正文卷',
    ],

    contentRemove: "script, iframe, a, audio, style, button",          // 内容移除选择器
    specialSite: sites,

    // 文本层整行净化规则：净化开关开启时，仅丢弃「整行完全匹配」的杂质行，绝不修改小说原文文字/缩进/空行
    trashLineRules: [
        // ===== 双保险说明 =====
        // 以下与 handleContentText2 的 DOM 层整块删除构成「双保险」：DOM 层删独立控件块，
        // 文本层删混入正文的独立行。二者刻意重复覆盖（打赏/上一章下一章/目录/下载App/
        // 扫一扫/添加书签/本章说/作者作家说/字数行/纯数字行等），即使某层因站点改版失效，
        // 另一层仍能兜底。请勿当作冗余清理删除。
        '^[()]$',
        '^正文$',
        '^登录$',
        '^讨论热烈[^\\n]{0,30}段评',
        '^[^\\n]{0,40}?\\d+字\\s*\\d{4}年\\d{1,2}月\\d{1,2}日[^\\n]{0,20}$',
        '^本章(含|共)\\d+条(评|段评)',
        '^\\d+字 \\d{2}:\\d{2}',
        '^[^\\n]{0,15}?\\d{4}[-年]\\d{1,2}[-月]\\d{1,2}日?[^\\n]{0,20}$',
        '^(作者有话说|作者留言|作者的话|PS|Ps|ps)[:：]?[^\\n]{0,50}',
        '^(本章感言|感言|小编说|编者按|未完待续|待续|下章预告)[^\\n]{0,40}',
        '^(\\[|【)\\s*第?\\d+页\\s*(\\]|】)',
        '^(分页阅读|上一页|下一页|>>>翻到下一页|翻页阅读)[^\\n]*',
        '^(投月票|投推荐票|打赏作者|打赏本书|推荐本书|点击收藏|加入书架|点击解锁|开通VIP|VIP章节|本章付费)[^\\n]*',
        '^(推荐阅读|点击阅读|同类小说|更多好书|作者还写过)[^\\n]{0,40}',
        '^\\s*(\\S+·)?(作者|作家)说\\s*$',
        '^\\s*上起点中文网支持我[^\\n]*$',
        '^\\s*[^\\n]{0,40}?打赏了\\d+(万|千)?(起点)?(点?币|点)$',
        '^\\s*添加书签$',
        '^\\s*扫一扫，手机接着读$',
        '^\\s*本章说\\s*\\d{0,6}\\s*$',
        '^\\s*(下载App|下载APP|下载客户端|打开App|立即下载)\\s*$',
        '^\\s*打赏\\s*[⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉\\d]{0,4}\\s*$',
        '^\\s*(打赏榜|打赏列表|最近打赏|本章打赏|打赏记录)\\s*$',
        '^\\s*(上一章|下一章|目录|章节目录|章节列表|回目录)\\s*$',
        '^\\s*\\d{1,8}字\\s*$',
        '^\\s*\\d{1,5}\\s*$',
        '^先定个小目标，比如1秒记住： .*',
        '^热门推荐：.*',
        '^猜您喜欢：.*',
        '^.*请你先收藏此页吧，方便等下阅读咯……',
        '^.*更新中……努力更新中…….*',
        '^本站已更改域名，最新域名：.*',
        '^.*正在手打中，请稍等片刻[，。].*',
        '^.*全文字更新,牢记网址:.*',
        '^小说分类：.*',
        '^本书来源.*',
        '^本书来自.*',
        '^.*欢迎广大书友光临阅读，最新、最快、最火的连载作品尽在.*',
        '^恋上你看书网.*',
        '^.*手机阅读地址.*',
        '^.*为你提供最快的.*?更新，.*',
        '^.*最新章节 请关注\\(\\)',
        '^.*老域名(?:\\(.*?\\))?被墙，请您牢记本站最新域名(?:\\(.*?\\))?',
        '^作者：.*?分类：.*',
        '^@@\\?\\s*',
        '^txt下载地址：.*',
        '^.*手机版阅读网址：.*',
        '^(?:本书)?手机阅读：.*',
        '^.*\\(?https?://.*',
        '^\\s*(?:下载|打开|安装|前往|使用)(?:APP|app|客户端|应用|起点读书).{0,20}$',
        '^\\s*[^\\n]{0,25}?(?:前往|请|去|点击|观看|阅读全文|看完整版|下载)(?:APP|客户端|应用|起点读书)[^\\n]{0,20}\\s*$',
        '^\\s*(?:本章)?未完[^\\n]{0,20}?(?:前往|请|点击|阅读)(?:APP|客户端|应用)[^\\n]{0,20}\\s*$',
        '^\\s*(?:求月票|求推荐票|求推荐|求订阅|求收藏|求票|求更新|催更|追更|投票支持|点赞支持|投出你宝贵的一票)[^\\n]{0,30}\\s*$',
        '^\\s*(?:版权所有|盗版必究|请勿转载|禁止转载|谢绝转载|侵权必究|未经授权)[^\\n]{0,20}\\s*$',
        '^\\s*[【\\[（(]\\s*(?:首发|独家|来源|转载|版权|正版)[^\\n]{0,30}\\s*[】\\]）)]\\s*$',
        '^\\s*(?:本站|网站|本书)?(?:地址|网址|域名|来源|首发)[:：]?[^\\n]{0,40}\\s*$',
    ],

    customRules: [],


  };


  // =====================================================================
  // [模块 M5] 正文处理与 DOM 工具
  // 职责：阅读界面模板 tpl_mainHtml / 书名识别 / 字符归一化（toCDB·toDBC /
  //       getNormalizeMap）/ DOM 观察器 / HTML 清洗渲染（htmlFmt·cleanHTML·
  //       renderHTML·escapeHtml）/ 字体尺寸
  // 依赖：M4 Rule、M2 工具
  // =====================================================================
  var tpl_mainHtml = "<div id=\"container\">\r\n    <div id=\"menu-bar\" title=\"点击切换显示/隐藏左侧章节列表\"></div>\r\n    <div id=\"menu\">\r\n        <div id=\"header\">\r\n            <a href=\"{indexUrl}\" target=\"_blank\">{bookTitle}</a>\r\n        </div>\r\n        <div id=\"divider\"></div>\r\n        <ul id=\"chapter-list\" title=\"左键点击跳转到该章节；中键在新标签页打开章节\">\r\n        </ul>\r\n    </div>\r\n    <div id=\"mynovelreader-content\"></div>\r\n    <div id=\"loading\" style=\"display:none\"></div>\r\n    <div id=\"alert\" style=\"display: none;\">\r\n        <p id=\"App-notice\"></p>\r\n    </div>\r\n\r\n    <div id=\"mynovelreader-app\">\r\n\r\n    </div>\r\n</div>";

  const autoBookTitleSelector = Rule.bookTitleSelector;

  function autoGetBookTitle($doc) {
      let bookTitle = '';
      // 依次获取
      for (let s of autoBookTitleSelector) {
          let $node = $doc.find(s);
          if ($node.length === 1) {
              bookTitle = $node.text();
              break
          }
      }

      // 排除一些无效的？

      return bookTitle
  }

  // 正文内容标准化替换

  let replaceNormalizeMap = null;
  let replaceNormalizeMapForOpt = null; // 记录构建 map 时的 contentOptimize 开关值

  function getNormalizeMap() {
    // map 内「合并跨行引号」规则依赖 contentOptimize 开关；开关变化时需重建，否则切开关不生效
    if (replaceNormalizeMap && replaceNormalizeMapForOpt === Setting.contentOptimize) {
      return replaceNormalizeMap
    }
    const rule = {
      '[,，]\\s*': '，', // 合并每一行以"，"结束的段落和去除"，"后的空格
      '\\s^，': '，', // 合并每一行以"，"开头的段落
      '\\s^”': '”', // 合并每一行以右引号开头的段落
      '\\. *$': '。',
      '\\.([”"])': '。$1',
      '([。！？”]) +': '$1',
      '，+': '，',
      '"(.*?)"': '“$1”',
      '”“': '”\n“', // 将一段中的相邻的对话分段
      // 将一段中的含多个句号、感叹号、问号的句子每句分为多段
      '([。！？])([\\u4e00-\\u9fa5“][\\u4e00-\\u9fa5“，]{20,})': '$1\n$2',
      // 将一段中的第一句后接对话（引号）句子的第一句话分段
      '(^.*?[.。])(“.*?”)': '$1\n$2',
      // 将一段中的右引号后面的内容分为一段
      '([。！？])”(?![\\u4e00-\\u9fa5，]+，“)([\\u4e00-\\u9fa5“，]{20,})':
        '$1”\n$2',
      '“([\\s\\S]*?)”': Setting.contentOptimize
        ? match => match.replace(toRE('\n'), '')
        : undefined,
      '「(.*?)」': '“$1”',
      '『(.)』': '$1',
      '[┅。…·.]{3,20}': '……',
      '[~－]{3,50}': '——'
    };
    Object.keys(rule).forEach(key => !rule[key] && delete rule[key]);
    replaceNormalizeMap = rule;
    replaceNormalizeMapForOpt = Setting.contentOptimize;
    return rule
  }

  // 不转换 ，？：；（）！
  const excludeCharCode = new Set([
    65292, 65311, 65306, 65307, 65288, 65289, 65281
  ]);

  // 全角转半角
  function toCDB(str) {
    let tmp = '',
      charCode;
    for (let i = 0; i < str.length; i++) {
      charCode = str.charCodeAt(i);
      if (
        charCode > 65248 &&
        charCode < 65375 &&
        !excludeCharCode.has(charCode)
      ) {
        tmp += String.fromCharCode(charCode - 65248);
      } else {
        tmp += str.charAt(i);
      }
    }
    return tmp
  }

  const includeCharCode = new Set([44, 63, 58, 59, 40, 41, 33]);

  // 半角转全角
  // 只转换，？：；（）！
  function toDBC(str) {
    let tmp = '',
      charCode;
    for (let i = 0; i < str.length; i++) {
      charCode = str.charCodeAt(i);
      if (includeCharCode.has(charCode)) {
        tmp += String.fromCharCode(charCode + 65248);
      } else {
        tmp += str.charAt(i);
      }
    }
    return tmp
  }

  // 等待页面上的元素出现
  function observeElement(
    doc,
    {
      contentSelector,
      mutationSelector,
      mutationChildText,
      mutationChildCount,
      mutationCheck
    }
  ) {
    var $doc = $(doc);

    var contentSize = $doc.find(contentSelector).size();

    if (contentSize && !mutationSelector) {
      return
    }

    var target = $doc.find(mutationSelector)[0];

    if (!target) {
      return
    }

    var check = true;

    if (typeof mutationCheck === 'function') {
      check = mutationCheck($doc);
    }

    var beforeTargetChilren = target.children.length;

    // 未找到加载中标志文本
    const textNotFound = mutationChildText && !target.textContent.includes(mutationChildText);

    if (textNotFound && check) {
      return
    }

    // 节点孩子数量足够多（一般正文的节点数量会多于加载时）
    const childCountEnough = mutationChildCount !== undefined && target.children.length > mutationChildCount;

    if (childCountEnough && check) {
      return
    }

    if ((textNotFound || childCountEnough) && !check) {
      // 正文已生成，但检查函数还未通过，设置为 0 使得 nodeAdded 始终为 true
      beforeTargetChilren = 0;
    }

    return new Promise(resolve => {
      var observer = new MutationObserver(function () {
        const target = $doc.find(mutationSelector)[0];
        var nodeAdded = target.children.length > beforeTargetChilren;
        var check = true;
        if (nodeAdded && typeof mutationCheck === 'function') {
          check = mutationCheck($doc);
        }

        if (nodeAdded && check) {
          observer.disconnect();
          resolve();
        }
      });

      observer.observe(document, {
        childList: true,
        subtree: true
      });

    })
  }

  // 等待 DOM 稳定
  function domMutation() {
    return new Promise(resolve => {
      const fn = () => {
        clearTimeout(fn._t);
        fn._t = setTimeout(() => {
          observer.disconnect();
          resolve();
        }, 100);
      };
      const observer = new MutationObserver(fn);
      observer.observe(document, {
        childList: true,
        subtree: true
      });
      fn();
    })
  }

  const r$1 = String.raw;
  const spaceRegex = toRE(r$1`&nbsp;|&ensp;|&emsp;`),
    noPrintRegex = toRE(r$1`&thinsp;|&zwnj;|&zwj;`),
    wrapHtmlRegex = toRE(r$1`</?(?:div|p|br|hr|h\d|article|dd|dl)[^>]*>`),
    indent1Regex = toRE(r$1`\s*\n+\s*`),
    indent2Regex = toRE(r$1`^[\n\s]+`),
    lastRegex = toRE(r$1`[\n\s]+$`),
    otherHtmlRegex = toRE(r$1`</?[a-zA-Z]+(?=[ >])[^<>]*>`);

  function htmlFmt(text, otherRegex = otherHtmlRegex) {
    text = text.replace(toRE('\ufeff|\u200b'), '');
    text = text.replace(spaceRegex, ' ');
    text = text.replace(noPrintRegex, '');
    text = text.replace(wrapHtmlRegex, '\n');
    text = text.replace(otherRegex, '');
    text = text.replace(indent1Regex, '\n');
    text = text.replace(indent2Regex, '');
    text = text.replace(lastRegex, '');
    // Unescape HTML entities
    text = parseHTML(text).documentElement.textContent;

    return text
  }

  /**
   * 清除 HTML 代码，保留格式
   * @param {Document} doc
   * @returns {string}
   */
  function cleanHTML(doc) {
    const treeWalker = document.createTreeWalker(doc, NodeFilter.SHOW_COMMENT);
    while (treeWalker.nextNode()) {
      treeWalker.currentNode.remove();
    }

    // 模拟渲染文本节点
    getTextNodesIn(doc, true)
      .filter(n => n.data !== '\n')
      .forEach(n => (n.data = n.data
          .replace(/[\u2000-\u200F\u2028\u2029\uFEFF]/g, '')   // 清理零宽空白/U+20系列残码
          .trim()
          .replace(/\s+/g, ' ')));

    return htmlFmt(doc.outerHTML)
  }

  // 文本层净化：仅丢弃「整行完全匹配」杂质规则的行，绝不修改小说原文文字/缩进/空行
  const _trashLineRegs = new WeakMap();  // 按规则数组缓存编译后的正则，避免每次净化重建
  function filterTrashLines(text, rules) {
    if (!text) return text
    // 按原换行符切分；逐行判断：仅整行命中杂质规则才丢弃，未命中行原样保留（不 trim、不改字符、不改换行、不删空行）
    const lines = text.split(/\r?\n/);
    let res = _trashLineRegs.get(rules);
    if (!res) { res = rules.map(rs => new RegExp(rs, 'im')); _trashLineRegs.set(rules, res); }
    const kept = [];
    for (const line of lines) {
      let trash = false;
      for (const re of res) {
        if (re.test(line)) { trash = true; break }
      }
      if (!trash) kept.push(line)
    }
    return kept.join('\n')
  }

  function renderHTML(text) {
    text = text
      .split('\n')
      .filter(t => !!t.trim())
      // 4.5: 清除独立成行的段评点赞数/楼号标记（整行仅1-5位数字）
      .filter(t => !/^\s*\d{1,5}\s*$/.test(t))
      // 4.7: 清除段尾的段评数字标记（起点段评数，如 "……情绪。58" → "……情绪。"）
      .map(t => t.replace(/([\u4e00-\u9fa5。！？…」』”"）:：,，;；])\s*\d{1,5}$/, '$1'))
      .map(t => `<p>　　${escapeHtml(t)}</p>`)
      .join('\n');

    return `<div class="content">${text}</div>`
  }

  // https://stackoverflow.com/a/22706073
  const p = document.createElement("p");
  function escapeHtml(text) {
    p.textContent = text;
    return p.innerHTML
  }

  function getElemFontSize(_heading) {
      var fontSize = 0;
      var _heading_style = window.getComputedStyle(_heading, null);
      if (_heading_style) {
          // firefox57 2017年9月10日 会错误
          try {
              var str = _heading_style.getPropertyValue("font-size") || 0;
              fontSize = parseInt(str, 10);
          } catch(e) { }
      }

      return fontSize
  }

  // ================================================
  // [04.5] 正文文本净化/优化（开关即时重应用共用）
  // 输入「净化/优化前」的原始正文文本，按当前开关状态返回处理后的文本
  // 供 handleContentText2（首次加载）与 reapplyContentClean（切开关即时还原/重应用）复用
  // ================================================
  // =====================================================================
  // [模块 M6] 内容净化（文本层 + DOM 层）
  // 职责：applyContentSettings（正文文本净化/优化，随【净化】【优化】开关）、
  //       applyDomClean（DOM 层净化：隐藏元素/章节标题/contentRemove/杂质块）
  // 依赖：M4 Rule、M5 归一化与清洗工具
  // =====================================================================
  function applyContentSettings(content, host, replaceText) {
      // 净化：仅丢弃「整行完全匹配」杂质规则的行，绝不修改小说原文文字/缩进/空行
      if (Setting.contentNormalize) {
          // 删除含网站域名行（整行丢弃）；host 为空时跳过，避免误删
          if (host) {
              const hostEsc = toReStr(host);
              const hostVariant = hostEsc.replace(/^www\./i, '');
              const hostRe = toRE(`^.*?(?:${hostEsc}|${hostVariant}).*?$`);
              content = content.replace(hostRe, () => '');
          }
          // 按整行过滤杂质行
          content = filterTrashLines(content, Rule.trashLineRules);
          // 移除正文行尾的分页标记：章节标题后的 " (第1/2页)" / "（第1/2页）"（保留章节名，去掉页码后缀）
          content = content.replace(/^([^\n]{0,60}?)\s*[（(]\s*第\s*\d+\s*\/\s*\d+\s*页\s*[)）]\s*$/gm, '$1');
      }

      // 内容优化（独立开关，默认关）：移除不可见字符/修剪行首尾空格/规整全半角标点/修复引号配对/压缩连续空行/合并多行引号
      if (Setting.contentOptimize) {
          content = content.replace(/[\u200B-\u200D\uFEFF\u2060\u00AD\u200E\u200F\u061C\u202A-\u202E]/g, '');
          content = content.split('\n').map(line => line.replace(/^[ \t\u3000]+|[ \t\u3000]+$/g, '')).join('\n');
          content = toDBC(toCDB(content));
          // 完整标点/引号规整（与首次加载一致，含合并多行引号/按句分段等）
          if (typeof replaceText === 'function') {
              content = replaceText(content, getNormalizeMap());
          } else {
              content = content.replace(/「(.*?)」/g, '“$1”').replace(/『(.)』/g, '$1');
              content = content.replace(/[┅。…·.]{3,20}/g, '……').replace(/[~－]{3,50}/g, '——');
              content = content.replace(/\s*[,，]\s*/g, '，').replace(/,+/g, '，');
              content = content.replace(/([。！？])\s*/g, '$1');
          }
          content = content.replace(/\n[ \t]*\n(?:\n[ \t]*)+/g, '\n\n');
      }
      return content;
  }

  // DOM 层净化：全部跟随【正文内容净化】开关（隐藏元素/章节标题/contentRemove/整块杂质块）
  // 供首次加载（handleContentText2）与切开关重建（reapplyContentClean）共用，保证「关=原书」开/关完全一致
  function applyDomClean($div, info) {
      if (!Setting.contentNormalize) return;  // 关闭净化：保留全部 DOM 结构，还原原书
      // 删除隐藏元素（起点隐藏段评数字/弹幕等用 display:none，CSS 被移除后隐藏失效）
      $div.find('[style*="display:none"], [style*="display: none"], [hidden], [aria-hidden="true"]').remove();
      // 删除章节标题
      $div.find('h1, h2, h3').remove();
      // contentRemove
      $div.find(Rule.contentRemove).remove();
      if (info && info.contentRemove) {
          $div.find(info.contentRemove).remove();
      }
      // 整块杂质按文本精确删除（起点作家说/打赏/扫一扫/底部导航等独立成块的控件，先于 cleanHTML 移除，避免混入正文）
      $div.find('div, p, span, a, button, li, section, h4, h5, h6').each(function () {
          var $t = $(this);
          var txt = ($t.text() || '').replace(/\s+/g, '');
          if (!txt) return;
          if (/^(?:本章说\d{0,6}|(?:\S+·)?(?:作者|作家)说|上起点中文网支持我[^\n]*|下载App|下载APP|下载客户端|打开App|立即下载|打赏(?:了)?\d{0,8}(?:万|千)?(?:起点)?(?:点|币)?|打赏榜|打赏列表|最近打赏|本章打赏|打赏记录|扫一扫，手机接着读|上一章|下一章|目录|章节目录|章节列表|回目录|添加书签|\d{1,8}字|\d{1,5})$/.test(txt)) {
              $t.remove();
          }
      });
  }

  // =====================================================================
  // [模块 M7] 正文解析器 Parser
  // 职责：章节/正文提取与站点规则执行，产出标准正文结构供渲染
  // 依赖：M4 Rule / sites、M5 工具、M6 净化
  // =====================================================================
  function Parser(){
      this.init.apply(this, arguments);
  }

  Parser.prototype = {
      constructor: Parser,

      init: function (info, doc, curPageUrl) {
          // 站点规则
          this.info = info || {};
          this.doc = (info.cloneNode && doc.defaultView) ? doc.cloneNode(true) : doc;
          this.$doc = $(this.doc);
          this.curPageUrl = curPageUrl || doc.URL;
          this._curPageHost = getUrlHost(this.curPageUrl);  // 当前页的 host，后面用到

          // 设置初始值
          this.isTheEnd = false;
          this.isSection = false;

          if (doc.defaultView && doc.defaultView.$cleanupEvents) {
              doc.defaultView.$cleanupEvents(true);
          }
          
      },
      applyPatch: function(){
          var contentPatch = this.info.contentPatch;
          if(contentPatch){
              try {
                  contentPatch.call(this, this.$doc);
              } catch (e) {
              }
          }
      },
      applyAsyncPatch: async function() {
          var contentPatch = this.info.contentPatchAsync;
          if(contentPatch){
              try {
                  await contentPatch.call(this, this.$doc);
              } catch (e) {
              }
          }
      },
      getAll: async function(){

          this.applyPatch();

          await this.applyAsyncPatch();

          await this.preProcessDoc();

          this.parse();

          return this;
      },
      preProcessDoc: async function() {
          let data;

          if (!this.hasContent() && this.info.getContent) {
              data = await this.info.getContent.call(this, this.$doc);
              this.$content = null;
          } 
          if (data) {
              var div;
              if (data.content) {
                  div = $('<div id="content"></div>').html(data.content);
              } else if (data.html) {
                  div = $('<div></div>').html(data.html);
              }

              this.$doc.find('body').prepend(div);
          }

      },
      parse: function() {
          this.getPrevUrl();
          this.getIndexUrl();
          this.getNextUrl();

          this.getTitles();

          this.getContent();
      },

      hasContent: function() {
          if (this.$content) {
              return this.$content.size() > 0;
          }

          var $content;

          // }

          // 排除 qidian 需付费的页面
          if (this.info.isVipChapter) {
              if (this.info.isVipChapter(this.$doc)) {
                  this.isTheEnd = 'vip';
                  return false;
              }
          }

          if(this.info.contentSelector){
              $content = this.$doc.find(this.info.contentSelector);
          }

          if (!$content || !$content.length) {
              // 按照顺序选取
              var selectors = Rule.contentSelectors;
              for(var i = 0, l = selectors.length; i < l; i++){
                  $content = this.$doc.find(selectors[i]);
                  if($content.length){
                      break;
                  }
              }
          }

          // ---- 兜底启发式正文识别：所有规则未命中时，自动选取中文文本量最大的正文容器 ----
          if (!$content || !$content.length) {
              var _maxNode = null, _maxLen = 0;
              this.$doc.find('div,section,article,td,li,blockquote').each(function(){
                  var _el = this;
                  // 只取最内层正文容器：容器内部不再嵌套同类块容器
                  if (_el.querySelector('div,section,article,td,li,blockquote')) return;
                  var _txt = (_el.textContent || '').replace(/[\s\u3000]+/g, '');
                  if (!_txt) return;
                  var _cn = (_txt.match(/[\u4e00-\u9fff]/g) || []).length;
                  if (_cn > _maxLen) { _maxLen = _cn; _maxNode = _el; }
              });
              if (_maxNode) {
                  $content = this.$doc.find(_maxNode);
              }
          }

          this.$content = $content;

          return $content.size() > 0;
      },
      // 获取书名和章节标题
      getTitles: function(){
          var info = this.info,
              chapterTitle,
              bookTitle,
              docTitle = this.$doc.find("title").text();

          // 获取章节标题
          if (info.titleReg){
              var matches = docTitle.match(toRE(info.titleReg, 'i'));
              if(matches && matches.length >= 2){
                  var titlePos = ( info.titlePos || 0 ) + 1;
                  var chapterPos = (titlePos == 1) ? 2 : 1;

                  bookTitle = matches[titlePos];
                  chapterTitle = matches[chapterPos];
              }

          }

          // 如果有 titleSelector 则覆盖从 titleReg 中获取的
          var tmpChapterTitle = this.getTitleFromRule(info.titleSelector);
          if (tmpChapterTitle) {
              chapterTitle = tmpChapterTitle;
          }

          if(!chapterTitle){
              chapterTitle = this.autoGetChapterTitle(this.doc);
          }
          if (info.chapterTitleReplace) {
              chapterTitle = chapterTitle.replace(toRE(info.chapterTitleReplace), '');
          }

          // get bookTitle
          if (!bookTitle && info.bookTitleSelector) {
              bookTitle = this.getTitleFromRule(info.bookTitleSelector);
          }
          if (!bookTitle) {
              bookTitle = autoGetBookTitle(this.$doc);
              bookTitle = this.replaceText(bookTitle, Rule.bookTitleReplace);
          }
          if (info.bookTitleReplace) {
              bookTitle = bookTitle.replace(toRE(info.bookTitleReplace), '');
          }

          // 标题间增加一个空格，不准确，已注释
          chapterTitle = chapterTitle
                  .replace(/[\u2000-\u200F\u2028\u2029\uFEFF]/g, "")   // 清理零宽空白/U+20系列残码（修复目录标题 u20 乱码）
                  .replace(Rule.titleReplace, "")
                  .replace(/([\u4e00-\u9fa5。！？…」』”"）:：,，;；])\s*\d{1,5}$/, "$1")   // 4.7: 清除标题尾部段评数字标记
                  .trim();

          if (chapterTitle.startsWith(bookTitle)) {
              var _chapterTitle = chapterTitle.replace(bookTitle, '').trim();
              if (_chapterTitle.length > 0) {
                  chapterTitle = _chapterTitle;
              }
          }

          bookTitle = bookTitle.replace(/(?:最新章节|章节目录)$/, '');

          docTitle = bookTitle ?
                  bookTitle + ' - ' + chapterTitle :
                  docTitle;


          this.originChapterTitle = chapterTitle;

          this.bookTitle = (bookTitle || '目录').trim();
          this.chapterTitle = chapterTitle;
          this.docTitle = docTitle;
      },
      getTitleFromRule: function(selectorOrArray) {
          var title = '';
          if (!selectorOrArray) {
              return '';
          }

          if (typeof selectorOrArray === 'function') {
              try {
                  title = selectorOrArray(this.$doc);
              } catch (e) {
                  C.error("执行获取标题函数规则出错", e);
              }
              if (!title) {
                  C.error('无法找到标题', selectorOrArray, this.doc);
                  return ''
              }
              return title
          }

          var selector,
              replace;

          if (Array.isArray(selectorOrArray)) {
              selector = selectorOrArray[0];
              replace = selectorOrArray[1];
          } else {
              selector = selectorOrArray;
          }

          var $title = this.$doc.find(selector);
          if (!$title.length) {
              C.error('无法找到标题', selector, this.doc);
              return '';
          }

          title = $title.remove().first().text().trim();

          if (replace) {
              title = title.replace(toRE(replace), '');
          }

          return title;
      },
      // 智能获取章节标题
      autoGetChapterTitle: function (document) {
          var
              _main_selector = "h1, h2, h3",
              _second_selector = "#TextTitle, #title, .ChapterName, #lbChapterName, div.h1, #nr_title",
              _positive_regexp = Rule.titleRegExp,
              _title_remove_regexp = /最新章节|书书网/,
              $doc = $(document),
              _document_title = document.title || $doc.find("title").text(),
              _search_document_title = ' ' + _document_title.replace(/\s+/gi, ' ') + ' '
          ;

          var _headings = $doc.find(_main_selector);
          // 加上 second selector 并去除包含的
          $doc.find(_second_selector).each(function(){
              if($(this).find(_main_selector).length === 0){
                  _headings.push(this);
              }
          });

          var possibleTitles = {},
              _heading_text;


          $(_headings).each(function(){
              var _heading = this,
                  _heading_text = _heading.textContent.trim();

              if (!_heading_text || _heading_text in possibleTitles) {
                  return;
              }


              // h1 为 1， h2 为 2
              var
                  nodeNum = parseInt(_heading.nodeName.slice(1), 10) || 10,
                  score = 10 / nodeNum,
                  _heading_words = _heading_text.replace(/\s+/g, " ").split(" "),
                  _matched_words = ""
              ;

              // 后面这种是特殊的判断
              if (_positive_regexp.test(_heading_text) || /\d{2,4}/.test(_heading_text)) {
                  score += 50;
              }
              // }

              //  count words present in title
              for (var j = 0, _j = _heading_words.length; j < _j; j++) {
                  if (_search_document_title.indexOf(_heading_words[j]) > -1) {
                      _matched_words += _heading_words[j] + ' ';
                  }
              }
              score += _matched_words.length * 1.5;

              var _font_size_add_score = getElemFontSize(_heading) * 1.5;
              score +=  _font_size_add_score;

              possibleTitles[_heading_text] = score;

          });

          // 找到分数最高的值
          var topScoreTitle,
              score_tmp = 0;
          for (_heading_text in possibleTitles) {
              if (possibleTitles[_heading_text] > score_tmp) {
                  topScoreTitle = _heading_text;
                  score_tmp = possibleTitles[_heading_text];
              }
          }

          var curTitle = topScoreTitle;
          if (!curTitle) {
              curTitle = _document_title;

              // 下面的正则从
              //     Firefox-Firefox浏览器论坛-卡饭论坛 - 互助分享 - 大气谦和!
              // 变为
              //     Firefox-Firefox浏览器论坛-卡饭论坛
              curTitle = curTitle.replace(/\s-\s.*/i, "")
                  .replace(/_[^\[\]【】]+$/, "");
              curTitle = curTitle.trim();
              curTitle = curTitle.replace(_title_remove_regexp, '');
          }

          curTitle = curTitle.replace(Rule.titleReplace, "");


          return curTitle;
      },

      // 获取和处理内容
      getContent: function(){

          this.hasContent();

          if (!this.$content || this.$content.size() <= 0) {
              C.error('没有找到内容', this.$doc);
              return;
          }

          if (typeof this.info.handleContentText === 'function') {
              try {
                  this.content = this.info.handleContentText.call(this, this.$content[0], this.info);
              } catch (e) {
                  this.content = this.handleContentText2(this.$content[0], this.info);
                  C.error("执行内容处理函数规则出错，使用默认函数处理", e);
              }
          } else {
              this.content = this.handleContentText2(this.$content[0], this.info);
          }

      },
      handleContentText2(node, info) {
          if(!node) return null;

          if (info.useRawContent) {
              return node.outerHTML
          }


          var $div = $(node.cloneNode(true));

          // [v2.0] 缓存「完全原始」HTML（任何 DOM 删除/清理之前，用 outerHTML 保留结构），供切开关时完整还原原书效果
          // （含隐藏元素/章节标题/contentRemove 内容/杂质块）；reapplyContentClean 据此重建 DOM 并按当前开关净化
          App$1._rawContentCache = $div[0].outerHTML;
          // 记录当前章节站点规则，供 reapplyContentClean 复用 info.contentRemove
          App$1._curInfo = info;

          // DOM 层净化：全部跟随【正文内容净化】开关（隐藏元素/章节标题/contentRemove/整块杂质块）
          // 关闭净化时连这些结构也保留，彻底实现「关 = 原书」
          applyDomClean($div, info);

          let content = cleanHTML($div[0]);

          // 去重
          const contents = content.split('\n');
          const deDupeConetents = [...new Set(contents)];

          // 查重率超过 10% 则使用去重后内容
          const dupeRate = (contents.length - deDupeConetents.length) / contents.length;
          if (dupeRate > 0.1) {
              content = deDupeConetents.join('\n');
          }


          // 去除内容中的标题
          if (this.originChapterTitle) {
              try {
                  var reg = toReStr(this.originChapterTitle.trim()).replace(/\s+/g, '\\s*');
                  reg = "(" + this.bookTitle.trim() + "\\s*)*" + "\\s*" + "(" + reg + ")*";
                  content = content.replace(toRE(`^${reg}$`), '');
              } catch (e) {
                  C.error(e);
              }
          }


          // ===== 文本层净化：全部受【正文内容净化】开关控制 =====
          // （原始正文缓存已在「整块杂质删除前」完成：App$1._rawContentCache 含杂质块，供切开关还原原书）

          // 开关关闭：不做任何文本处理，直接输出网页原始文本（保留杂质行，即「原看书效果」）
          // 开关开启：仅丢弃「整行完全匹配」杂质规则的行，绝不修改小说原文文字/缩进/空行
          content = applyContentSettings(content, this._curPageHost, this.replaceText.bind(this));

          // 站点自定义规则替换（Rule.specialSite 单独配置的站点专属规则，不受净化开关控制）
          if (info.contentReplace) {
              content = this.replaceText(content, info.contentReplace);
          }


          const contentHTML = renderHTML(content);


          return contentHTML

      },
      replaceText: function(text, rule){
          var self = this;
          switch(true) {
              case rule instanceof RegExp:
                  text = text.replace(rule, '');
                  break;
              case typeof rule === 'string':
                  // 还原简写
                  Object.keys(CHAR_ALIAS).forEach(function(key) {
                      rule = rule.replace(key, CHAR_ALIAS[key]);
                  });
                  text = text.replace(toRE(rule), '');
                  break;
              case Array.isArray(rule):
                  rule.forEach(function(r){
                      text = self.replaceText(text, r);
                  });
                  break;
              case (rule !== null && typeof rule === 'object'):
                  var key;
                  for(key in rule){
                      text = text.replace(toRE(key), rule[key]);
                  }
                  break;
          }
          return text;
      },

      getIndexUrl: function(){
          var url = '',
              selector = this.info.indexSelector || this.info.indexUrl;

          if (selector === false) {
              this.indexUrl = url;
              return url;
          }

          // 先尝试站点规则
          if (selector && typeof selector === 'function') {
              try {
                  url = selector(this.$doc);
              } catch (e) {
                  C.error("执行获取目录链接函数规则出错", e);
              }
          } else if(this.info.indexSelector){
              url = this.$doc.find(this.info.indexSelector);
          }

          // 再尝试通用规则
          if (!url || !url.length) {
              var selectors = Rule.indexSelectors;
              var _indexLink;
              // 按照顺序选取目录链接
              for(var i = 0, l = selectors.length; i < l; i++){
                  _indexLink = this.$doc.find(selectors[i]);
                  if(_indexLink.length > 0){
                      url = _indexLink;
                      break;
                  }
              }
          }

          if(url){
              url = this.checkLinks(url);
          }

          if (!url) {
          }

          this.indexUrl = url;
          return url;
      },
      getNextUrl: function(){
          var url = '',
              selector = this.info.nextSelector || this.info.nextUrl,
              noSection = this.info.noSection;

          if (selector === false) {
              this.nextUrl = url;
              return url;
          }

          var urlElement, isSectionUrl = false;

          // 先尝试站点规则
          if (selector) {
              if (typeof selector === 'function') {
                  try {
                      urlElement = selector(this.$doc);
                  } catch (e) {
                      C.error("执行获取下一页链接函数规则出错", e);
                  }
              } else {
                  urlElement = this.$doc.find(selector);
              }

              url = this.checkLinks(urlElement);
          }

          // 4.4: 站点规则 nextPageText —— 按链接文字匹配下一章
          if (!url && this.info.nextPageText) {
              var matchText = this.info.nextPageText;
              var links = this.$doc.find('a');
              for (var i = 0; i < links.length; i++) {
                  var a = links.eq(i);
                  if (a.text().indexOf(matchText) != -1) {
                      urlElement = a;
                      url = this.checkLinks(urlElement);
                      if (url) break;
                  }
              }
          }

          // 再尝试通用规则
          if (!url) {
              urlElement = this.$doc.find(Rule.nextSelector);
              url = this.checkLinks(urlElement);
          }

          if (!noSection && url && urlElement && typeof urlElement !== 'string') {
              // 一般第一页下一章按钮文本含页就是多页章节
              // 判断是否分页章节在获取上一页链接函数中处理
              // 这里如果是分页章节则跳过下一页地址的检查
              var t = urlElement.text();
              if (!this.isSection && (t.includes('页') || t.includes('頁'))) {
                  isSectionUrl = true;
              }
          }

          if (!url && Setting.smartNextPage) { url = this.guessNextUrl(); }

          this.nextUrl = url || '';

          if (!isSectionUrl) {
              this.isTheEnd = !this.checkNextUrl(url);
              if (this.isTheEnd) {
              }
          }
          
          return url;
      },
      // 智能下一页：找不到「下一页」链接时，按网址页码规律自动递增构造下一页（借鉴 AutoPager 思路）
      guessNextUrl: function() {
          var href = location.href, url = '';
          // ① 网址参数页码：?page=2 / &pageNum=3 / &p=5 / &pageNo=6 / &pageindex=2
          var qm = href.match(/[?&](page|pageNum|p|pageNo|pageindex)=(\d+)([^&#]*)$/i);
          if (qm) {
              var next = parseInt(qm[2], 10) + 1;
              if (next > 999999999) return '';
              url = href.replace(qm[0], (qm[0].charAt(0) === '?' ? '?' : '&') + qm[1] + '=' + next + (qm[3] || ''));
          }
          // ② 路径分页格式：12345_2.html / chapter-3.html / book_2/
          if (!url) {
              var pm = href.match(/([_-])(\d+)(\.\w+)?(?:\?.*)?$/);
              if (pm) {
                  var next2 = parseInt(pm[2], 10) + 1;
                  if (next2 > 999999999) return '';
                  url = href.slice(0, pm.index) + pm[1] + next2 + (pm[3] || '');
              }
          }
          // ③ 纯数字路径：/txt/89959/40941338 → /txt/89959/40941339（69书吧等章节ID自增站，无后缀）
          if (!url) {
              var dm = href.match(/(\/\d+)\/(\d+)(\.htm[l]?)?(?:[?#].*)?$/);
              if (dm) {
                  var next3 = parseInt(dm[2], 10) + 1;
                  if (next3 > 999999999) return '';
                  url = href.slice(0, dm.index) + dm[1] + '/' + next3 + (dm[3] || '');
              }
          }
          if (url && url !== href) return url;
          return '';
      },
      // 获取上下页及目录页链接
      getPrevUrl: function(){
          var url = '',
              selector = this.info.prevSelector || this.info.prevUrl,
              noSection = this.info.noSection;

          if (selector === false) {
              this.prevUrl = url;
              return url;
          }

          var urlElement;

          // 先尝试站点规则
          if (selector) {
              if (typeof selector === 'function') {
                  try {
                      urlElement = selector(this.$doc);
                  } catch (e) {
                      C.error("执行获取上一页链接函数规则出错", e);
                  }
              } else {
                  urlElement = this.$doc.find(selector);
              }

              url = this.checkLinks(urlElement);
          }

          // 再尝试通用规则
          if (!url) {
              urlElement = this.$doc.find(Rule.prevSelector);
              url = this.checkLinks(urlElement);
          }

          if (!noSection && url && urlElement && typeof urlElement !== 'string') {
              // 一般第二页的上一章按钮文本含页就是多页章节
              // 这里如果判断成功则是第二页之后的内容
              // 设置 isSection 为 true 就可以将第二页之后的内容合并到第一页里面
              var t = urlElement.text();
              if (url && !this.isSection && (t.includes('页') || t.includes('頁'))) {
                  this.isSection = true;
              }
          }

          if (url) {
          } else {
          }

          this.prevUrl = url || '';
          return url;
      },
      checkNextUrl: function (url) {
          const sectionUrlRegex = /\/\d+([_-]\d+|\/\d)\.html?$/;
          if (url && this.info.checkSection) {
              // 如果第一页的下一页地址和第二页（当前解析页）的上一页地址都不能通过分页地址正则的检测，则不是分页章节
              if (!sectionUrlRegex.test(this.curPageUrl) &&
                  !sectionUrlRegex.test(this.prevUrl)) {
                  this.isSection = false;
              } else if (sectionUrlRegex.test(this.curPageUrl)) {
                  this.isSection = true;
              } else {
                  this.isSection = false;
              }
          }

          // 跟 include 比较
          var includeUrl = this.info.includeUrl || this.getIncludeUrl();
          if (!toRE(includeUrl).test(url))
              return false;

          switch(true){
              case url === '':
                  return false
              case this.info.exclude && toRE(this.info.exclude).test(url):
                  return false
              case Rule.nextUrlIgnore.some(function(re) { return toRE(re).test(url) }):
                  return false
              case url === this.indexUrl:
                  return false
              case url === this.prevUrl:
                  return false
              case url === this.curPageUrl:
                  return false
              // 分页章节不能比较、第一章的上一页如果是目录页，也不能比较
              case !this.isSection && this.prevUrl !== this.indexUrl && Rule.nextUrlCompare.test(this.prevUrl.split('?')[0]) && !Rule.nextUrlCompare.test(url.split('?')[0]):
                  return false
              default:
                  return true
          }
      },
      getIncludeUrl: function() {
          var includeUrl = this.info.url;

          if (!includeUrl && typeof GM_info !== 'undefined') {
              var locationHref = location.href;
              GM_info.script.includes.some(function(includeStr) {
                  var iUrl = wildcardToRegExpStr(includeStr);
                  if (toRE(iUrl).test(locationHref)) {
                      includeUrl = iUrl;
                      return true;
                  }
              });
          }

          this.info.includeUrl = includeUrl;
          return includeUrl;
      },
      checkLinks: function(links){
          var self = this;
          var url = '';

          if (!links) return ''

          if (typeof links === 'string') {
              return this.getFullHref(links);
          }

          links && links.each(function(){
              url = $(this).attr("href");
              if(!url || url.indexOf("#") === 0 || url.indexOf("javascript:") === 0)
                  return;

              url = self.getFullHref(this);
              return false;
          });

          return url;
      },
      getFullHref: function(href) {
          if(!href) return '';

          if (typeof href !== 'string') {
              href = href.getAttribute('href');
          }

          if (/^https?:\/\//.test(href)) {
              return href;
          }

          var a = this.a;
          if (!a) {
              this.a = a = document.createElement('a');
          }
          a.href = href.trim();

          // // 检测 host 是否和 当前页的一致
          // }

          return a.href;
      },
  };

  // =====================================================================
  // [模块 M8] 样式与面板模板
  // 职责：阅读界面样式 tpl_mainCss / 设置面板 HTML tpl_preferencesHTML /
  //       设置面板 CSS tpl_preferencesCSS
  // 依赖：config（{uiFont} 等占位符在运行时替换）
  // =====================================================================
  var tpl_mainCss = "body > a { display:none !important; }\r\n.hidden {\r\n    display: none;\r\n}\r\n.quiet-mode {\r\n    display: none;\r\n}\r\nbody {\r\n    background: #F3F2EE;\r\n    color: #1F0909;\r\n    padding: 0px;\r\n    margin: 0px;\r\n    font-family: {uiFont};\r\n}\r\na { color: #065488; }\r\na:link { text-decoration: none; }\r\n\r\n#mynovelreader-content {\r\n    width: auto;\r\n    max-width: {content_width};\r\n    font-size: {font_size};\r\n    font-family: {font_family};\r\n    line-height: {text_line_height};\r\n    margin-left:auto;\r\n    margin-right:auto;\r\n    padding-bottom: 15px;\r\n}\r\n#mynovelreader-content img{\r\n    max-width: 100%;\r\n}\r\n\r\narticle {\r\n    margin-top: 55px;\r\n    word-wrap: break-word;\r\n}\r\n\r\narticle p {\r\n    margin: {paragraph_height} 0;\r\n}\r\n\r\narticle h1 {\r\n    clear: both;\r\n    line-height: 50px;\r\n    font-size: {title_font_size};\r\n    font-weight: normal;\r\n    margin: 25px -20px;\r\n    padding: 0 20px 10px;\r\n    border-bottom: 1px solid rgba(0,0,0,.25);\r\n    font-weight: normal;\r\n    text-transform: none;\r\n}\r\n\r\narticle li {\r\n    list-style: none;\r\n}\r\n\r\n#loading {\r\n    text-align: center;\r\n    font: 12px -apple-system, \"PingFang SC\", \"Microsoft YaHei\", sans-serif;\r\n    margin-top: 20px;\r\n    margin-left: auto;\r\n    margin-right: auto;\r\n    padding: 8px 18px;\r\n    border-radius: 10px;\r\n    background: rgba(255,255,255,.78);\r\n    -webkit-backdrop-filter: blur(20px) saturate(1.8);\r\n    backdrop-filter: blur(20px) saturate(1.8);\r\n    border: 0.5px solid rgba(0,0,0,.1);\r\n    box-shadow: 0 10px 40px rgba(0,0,0,.12), 0 1px 3px rgba(0,0,0,.06);\r\n    color: #1D1D1F;\r\n    line-height: 1.6;\r\n}\r\n#loading img {\r\n    vertical-align: middle;\r\n}\r\n#loading a {\r\n    color: #007AFF;\r\n}\r\n\r\n#alert {\r\n    position: fixed;\r\n    z-index: 2247483647;\r\n    width: auto;\r\n    max-width: 70%;\r\n    height: auto;\r\n    top: 30px;\r\n    left: 50%;\r\n    transform: translateX(-50%);\r\n    padding: 9px 18px;\r\n    border-radius: 10px;\r\n    background: rgba(255,255,255,.78);\r\n    -webkit-backdrop-filter: blur(20px) saturate(1.8);\r\n    backdrop-filter: blur(20px) saturate(1.8);\r\n    border: 0.5px solid rgba(0,0,0,.1);\r\n    box-shadow: 0 10px 40px rgba(0,0,0,.12), 0 1px 3px rgba(0,0,0,.06);\r\n    color: #1D1D1F;\r\n    font-size: 13px;\r\n    line-height: 1.6;\r\n}\r\n#alert p {\r\n    margin: 0;\r\n}\r\n\r\n#message {\r\n    position: fixed;\r\n    z-index: 1010;\r\n    width: auto;\r\n    height: auto;\r\n    top: 30px;\r\n    left: 50%;\r\n    transform: translateX(-50%);\r\n\r\n    padding: 9px 18px;\r\n    border-radius: 12px;\r\n    box-shadow: 0 10px 30px rgba(0,0,0,.18), 0 1px 3px rgba(0,0,0,.1);\r\n    background: rgba(255,255,255,.78);\r\n    \r\n    \r\n    border: 1px solid rgba(255,255,255,.5);\r\n    display: inline-block;\r\n    pointer-events: all;\r\n\r\n    font-size: 12px;\r\n}\r\n#message p {\r\n    margin: 0;\r\n}\r\n\r\nimg.blockImage {clear: both;float: none;display: block;margin-left: auto;margin-right: auto;}\r\n\r\n#menu-bar {\r\n    border: solid rgba(0, 100, 255, .9);\r\n    border-width: 3px 2px 3px 0px;\r\n    position: fixed;\r\n    left: 0px;\r\n    top: 40%;\r\n    height: 100px;\r\n    width: 2px;\r\n    z-index: 199;\r\n    {menu-bar-hidden}\r\n}\r\n#menu-bar {\r\n    top: 0px;\r\n    height: 100%;\r\n    width: 1px;\r\n    background: transparent;\r\n    border: none;\r\n}\r\n#menu {\r\n    position: fixed;\r\n    top: 0;\r\n    bottom: 0;\r\n    left: 0;\r\n    z-index: 100;\r\n    width: 280px;\r\n    max-width: 60%;\r\n    background: var(--panel-glass, rgba(248,248,248,1));\r\n    \r\n    \r\n    border-right: 1px solid rgba(0,0,0,.08);\r\n    overflow-y: auto;\r\n    padding: 10px 0;\r\n}\r\n#header{\r\n    color: #1D1D1F;\r\n    margin: 0 18px 4px;\r\n    background: transparent;\r\n    padding: 6px 0;\r\n    text-transform: none;\r\n    font-weight: 600;\r\n    font-size: 15px;\r\n    letter-spacing: .4px;\r\n    border-bottom: 1px solid rgba(0,0,0,.06);\r\n}\r\n#header a {\r\n    color: #888;\r\n}\r\n#chapter-list {\r\n    margin: 0;\r\n    padding: 0;\r\n    cursor: pointer;\r\n    list-style: none;\r\n}\r\n.chapter {\r\n    list-style: none;\r\n}\r\n.chapter div {\r\n    color: #1D1D1F;\r\n    font-size: 13px;\r\n    padding: 8px 18px;\r\n    display: block;\r\n    text-decoration: none;\r\n    text-overflow: ellipsis;\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    cursor: pointer;\r\n}\r\n.chapter div:hover {\r\n    background: rgba(0,0,0,.05);\r\n    color: #1D1D1F;\r\n}\r\n.chapter.active div {\r\n    background: rgba(6,84,136,.12);\r\n    color: #065488;\r\n    font-weight: 600;\r\n}\r\n::-webkit-scrollbar {\r\n    height: 9px !important;\r\n    width: 9px !important;\r\n}\r\n::-webkit-scrollbar-thumb {\r\n    background-color: #7D7D7D !important;\r\n    border-radius: 3px !important;\r\n}\r\n::-webkit-scrollbar-track-piece {\r\n    background-color: rgba(0,0,0,.25) !important;\r\n}\r\n";

  // ---------- M8 设置面板模板（HTML / CSS）----------
  var tpl_preferencesHTML = "<form id='preferences' name='preferences'>\r\n    <div class='prefs-header prefs-dragbar'>\r\n        <div class='prefs-head-title'>阅读设置</div>\r\n    </div>\r\n    <div class='prefs-body'>\r\n\r\n<div class='prefs-sec'>外观设置</div>\r\n<div class='prefs-group'>\r\n        <div class='prefs-row prefs-label-row'>\r\n            <span class='prefs-label'>皮肤</span>\r\n        <div class='skin-row'>\r\n            <label class='skin-item' data-skin='浅色' title='暖纸白 · 适合白天正常光线长时间阅读'><span class='skin-swatch is-light'>Aa</span>浅色</label>\r\n            <label class='skin-item' data-skin='深色' title='深灰底 · 适合低光/夜间，关灯不刺眼'><span class='skin-swatch is-dark'>Aa</span>深色</label>\r\n            <label class='skin-item' data-skin='护眼' title='豆沙绿 · 低对比柔和，长时间护眼'><span class='skin-swatch is-eye'>Aa</span>护眼</label>\r\n            <label class='skin-item' data-skin='自动' title='跟随系统外观，在浅色/深色间自动切换'><span class='skin-swatch is-auto'>Aa</span>自动</label>\r\n        </div>\r\n        </div>\r\n        <select id='skin' style='display:none'></select>\r\n        <div class='prefs-row prefs-label-row'>\r\n            <span class='prefs-label' title='正文字体，选择后即时预览'>字体</span>\r\n            <select id='font-family' class='prefs-select' title='正文字体，选择后即时预览'>\r\n                <option value='PingFang SC,苹方-简,宋体,楷体' data-def='mac'>苹方（macOS 默认）</option>\r\n                <option value='微软雅黑,宋体,黑体,楷体' data-def='win'>微软雅黑（Windows 默认）</option>\r\n                <option value='宋体,SimSun,\"Songti SC\",宋体-简'>宋体</option>\r\n                <option value='楷体,楷体_GB2312,\"Kaiti SC\",楷体-简'>楷体</option>\r\n                <option value='黑体,SimHei,\"Heiti SC\",黑体-简'>黑体</option>\r\n            </select>\r\n        </div>\r\n        <div class='prefs-grid'>\r\n        <div class='prefs-slider'>\r\n            <div class='slider-head'><span title='正文字号大小（像素，范围12-40）'>字号</span><span class='slider-val' id='val-font-size'></span></div>\r\n            <input type='range' id='font-size' min='12' max='40' step='1'/>\r\n        </div>\r\n        <div class='prefs-slider'>\r\n            <div class='slider-head'><span title='行与行之间的间距（倍数，越大行越疏）'>行高</span><span class='slider-val' id='val-text_line_height'></span></div>\r\n            <input type='range' id='text_line_height' min='1.2' max='2.6' step='0.1'/>\r\n        </div>\r\n        <div class='prefs-slider'>\r\n            <div class='slider-head'><span title='段落之间的间距（倍数，越大段落间隔越大）'>段距</span><span class='slider-val' id='val-paragraph_height'></span></div>\r\n            <input type='range' id='paragraph_height' min='0' max='2' step='0.1'/>\r\n        </div>\r\n        <div class='prefs-slider'>\r\n            <div class='slider-head'><span title='正文内容的最大宽度（像素，范围600-1400）'>正文宽</span><span class='slider-val' id='val-content_width'></span></div>\r\n            <input type='range' id='content_width' min='600' max='1400' step='10'/>\r\n        </div>\r\n        </div>\r\n</div>\r\n\r\n<div class='prefs-sec'>内容设置</div>\r\n<div class='prefs-group'>\r\n        <div class='prefs-row prefs-switch-row'>\r\n            <label class='prefs-switch' title='删除正文中的杂质行（本章说/打赏/导航等），保留原文文字与排版，默认开启'><input type='checkbox' id='enable-content-normalize'/>正文内容净化<span class='track'><span class='thumb'></span></span></label>\r\n            <label class='prefs-switch' title='排版优化：合并引号、清洗标点、全半角、自动分段，会调整排版，需时再开'><input type='checkbox' id='enable-content-optimize'/>正文内容优化<span class='track'><span class='thumb'></span></span></label>\r\n        </div>\r\n</div>\r\n\r\n<div class='prefs-sec'>阅读行为</div>\r\n<div class='prefs-group'>\r\n        <div class='prefs-row prefs-switch-row'>\r\n            <label class='prefs-switch' title='找不到下一页链接时，按网址页码规律自动递增'><input type='checkbox' id='smart-next-page'/>智能自动翻页<span class='track'><span class='thumb'></span></span></label>\r\n            <label class='prefs-switch' title='滚动近底部自动预读下一章，翻页更流畅'><input type='checkbox' id='preload-next-page'/>预加载下一页<span class='track'><span class='thumb'></span></span></label>\r\n        </div>\r\n        <div class='prefs-row prefs-switch-row'>\r\n            <label class='prefs-switch' title='翻页写入浏览器历史，可回退'><input type='checkbox' id='add-nextpage-to-history'/>加入翻页历史<span class='track'><span class='thumb'></span></span></label>\r\n            <label class='prefs-switch' title='隐藏左侧章节列表；需要时按快捷键（c）可临时呼出'><input type='checkbox' id='hide-menu-list'/>隐藏章节列表<span class='track'><span class='thumb'></span></span></label>\r\n        </div>\r\n        <div class='prefs-row prefs-switch-row'>\r\n            <label class='prefs-switch' title='从目录点击章节时，页面平滑滚动到对应段落，不会突然跳转'><input type='checkbox' id='scroll_animate'/>章节直达滚动<span class='track'><span class='thumb'></span></span></label>\r\n            <span class='prefs-switch-space'></span>\r\n        </div>\r\n        <div class='prefs-row prefs-slider-row'>\r\n            <div class='slider-head'><span title='自动滚动阅读时的滚动速度（1-100像素/秒），开启自动滚动（双击页面）后生效'>滚动速度</span><span class='slider-val' id='val-auto-scroll-speed'></span></div>\r\n            <input type='range' id='auto-scroll-speed' min='1' max='100' step='1' title='自动滚动阅读时的滚动速度（1-100像素/秒）'/>\r\n        </div>\r\n</div>\r\n\r\n<div class='prefs-sec'>站点设置</div>\r\n<div class='prefs-group'>\r\n        <div class='prefs-row'>\r\n            <textarea id='custom_siteinfo' class='prefs_textarea' placeholder='自定义站点规则 JSON，详见脚本代码 Rule.specialSite'></textarea>\r\n        </div>\r\n</div>\r\n\r\n<div class='prefs-sec'>热键配置</div>\r\n<div class='prefs-group'>\r\n        <div class='prefs-row prefs-key-hint'>前两行可点击按键修改，其余基础导航键默认折叠，点击查看</div>\r\n        <table class='prefs-key-table'>\r\n            <tr><td>切换章节列表</td><td><button type='button' class='key-btn' id='setHideMenuListKey' title='点击后按键盘新按键设置'>c</button></td></tr>\r\n            <tr><td>打开设置</td><td><button type='button' class='key-btn' id='openPreferencesKey' title='点击后按键盘新按键设置'>o</button></td></tr>\r\n        </table>\r\n        <details class='prefs-key-more'>\r\n            <summary>查看其他快捷键</summary>\r\n            <table class='prefs-key-table'>\r\n                <tr><td>打开小说主页</td><td>Enter</td></tr>\r\n                <tr><td>上一章 / 上一段</td><td>← Left</td></tr>\r\n                <tr><td>下一章 / 下一段</td><td>→ Right</td></tr>\r\n                <tr><td>关闭设置面板</td><td>Esc</td></tr>\r\n                <tr><td>向上滚动一屏</td><td>, 逗号</td></tr>\r\n                <tr><td>向下滚动一屏</td><td>. 句点</td></tr>\r\n                <tr><td>上一章（快捷）</td><td>[</td></tr>\r\n                <tr><td>下一章（快捷）</td><td>]</td></tr>\r\n                <tr><td>启动 / 暂停自动滚动（鼠标，不可改）</td><td>双击页面</td></tr>\r\n            </table>\r\n        </details>\r\n</div>\r\n\r\n<div class='prefs-sec'>数据管理</div>\r\n<div class='prefs-group'>\r\n        <div class='prefs-row prefs-config-row'>\r\n            <input type='button' id='data-more-btn' value='数据管理' class='btn-plain' title='恢复/清除数据：点开后勾选要执行的操作，点确定执行'/>\r\n            <input type='button' id='export-config' value='导出数据' class='btn-plain' title='导出所有已加载设置、站点规则与阅读进度为JSON备份'/>\r\n            <input type='button' id='import-config' value='导入数据' class='btn-plain' title='读取备份文件，自动识别并覆盖对应数据'/>\r\n            <input type='button' id='export-logs' value='导出日志' class='btn-plain' title='将脚本运行日志（错误/操作/翻页，最近500条）导出为txt文件下载'/>\r\n        </div>\r\n        <div class='prefs-data-win' id='data-more-win' hidden>\r\n            <div class='prefs-data-win-card'>\r\n                <div class='prefs-data-win-title'>数据管理</div>\r\n                <div class='prefs-data-win-body'>\r\n                    <label class='prefs-data-opt' title='将全部设置恢复为默认值，保留阅读进度和已启用站点，适合设置被调乱时一键复原'><input type='checkbox' id='opt-reset-config'/>恢复默认设置</label>\r\n                    <label class='prefs-data-opt' title='仅清空当前网站（这本书）的阅读进度记录，其他网站不受影响'><input type='checkbox' id='opt-clear-site-progress'/>清除本站进度</label>\r\n                    <label class='prefs-data-opt' title='清空所有网站的阅读进度记录，不影响其他设置，此操作不可撤销'><input type='checkbox' id='opt-clear-progress'/>清除全部进度</label>\r\n                </div>\r\n                <div class='prefs-data-win-actions'>\r\n                    <button type='button' id='data-more-ok' class='btn-plain btn-primary'>确定</button>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        </div>\r\n        <div class='prefs-config-hint'>导出数据将包含全部设置、站点规则与阅读进度；导入数据会覆盖本机对应数据。</div>\r\n</div>\r\n\r\n    </div>\r\n    </form>";

  var tpl_preferencesCSS = ".body {\r\n    color: #1c1c1e; margin: 0 auto;\r\n    background: var(--prefs-bg, rgba(255,255,255,1));\r\n    padding: 0; border-radius: 16px; overflow: hidden;\r\n    font-size: 13px;\r\n    font-family: {uiFont};\r\n    -webkit-font-smoothing: antialiased;\r\n    border: 1px solid rgba(255,255,255,.5);\r\n    box-shadow: none;\r\n}\r\n.prefs-header { padding: 12px 20px 12px; border-bottom: 1px solid rgba(60,60,67,.14); cursor: default; }\r\n.prefs-head-title { font-size: 15px; font-weight: 600; font-family: {uiFont}; color: #1c1c1e; letter-spacing: .2px; }\r\n.prefs-body { padding: 4px 20px 18px; max-height: 72vh; overflow-y: auto; }\r\n\r\n.prefs-sec {\r\n    font-size: 13px; font-weight: 600; color: #6e6e73;\r\n    margin: 22px 2px 8px;\r\n}\r\n.prefs-sec:first-child { margin-top: 8px; }\r\n.prefs-group {\r\n    background: var(--panel-card, rgba(245,245,247,1));\r\n    border: 1px solid rgba(60,60,67,.1);\r\n    border-radius: 12px;\r\n    padding: 2px 16px;\r\n    margin-bottom: 20px;\r\n    box-shadow: 0 1px 4px rgba(0,0,0,.04);\r\n}\r\n.prefs-group > * + * { border-top: 1px solid rgba(60,60,67,.1); margin-top: 12px; padding-top: 12px; }\r\n.prefs-row { display: flex; align-items: center; gap: 10px; margin: 12px 0; }\r\n.prefs-row.prefs-switch-row { gap: 14px; }\r\n.prefs-row.prefs-slider-row { flex-direction: column; align-items: stretch; }\r\n.prefs-label { flex-shrink: 0; width: 28px; font-size: 13px; color: #1c1c1e; }.prefs-label-row { display: flex; align-items: center; gap: 10px; }.prefs-label-row .skin-row { flex: 1; }\r\n\r\n.skin-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }\r\n.skin-item {\r\n    flex: 1; min-width: 0; border: 1px solid rgba(0,0,0,.12); border-radius: 8px;\r\n    padding: 8px 6px; text-align: center; font-size: 12px; color: #6e6e73; cursor: pointer;\r\n    background: rgba(255,255,255,.5); transition: background .12s, border-color .12s;\r\n}\r\n.skin-item:hover { background: rgba(255,255,255,.8); }\r\n.skin-item.sel { border-color: #007aff; color: #007aff; background: rgba(0,122,255,.09); }\r\n.skin-swatch {\r\n    display: flex; align-items: center; justify-content: center;\r\n    height: 26px; border-radius: 6px; margin-bottom: 6px;\r\n    font-family: {uiFont};\r\n    font-weight: 600; font-size: 13px; line-height: 1; letter-spacing: .5px;\r\n    border: 1px solid rgba(0,0,0,.1);\r\n}\r\n.skin-swatch.is-light { background: #FAF9F8; color: #1D1D1F; }\r\n.skin-swatch.is-dark  { background: #1E1E1E; color: #F5F5F7; }\r\n.skin-swatch.is-eye   { background: #E8F5E9; color: #263238; }\r\n.skin-swatch.is-auto  { background: #FAF9F8; color: #1D1D1F; }\r\n\r\nselect, .prefs-select {\r\n    flex: 1; min-width: 0; padding: 5px 9px; border: 1px solid rgba(0,0,0,.14); border-radius: 6px;\r\n    font-size: 13px; background: rgba(255,255,255,.7); color: #1c1c1e;\r\n    -webkit-appearance: none; appearance: none;\r\n    background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888888' stroke-width='1.6' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\");\r\n    background-repeat: no-repeat; background-position: right 9px center; background-size: 10px 6px; padding-right: 26px;\r\n}\r\nselect:focus, .prefs-select:focus { outline: none; border-color: #007aff; }\r\n\r\n.prefs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 22px; margin: 14px 0; }\r\n.prefs-slider { display: flex; flex-direction: column; gap: 6px; }\r\n.slider-head { display: flex; justify-content: space-between; font-size: 13px; color: #1c1c1e; }\r\n.slider-val { font-size: 11px; color: #8e8e93; font-variant-numeric: tabular-nums; }\r\ninput[type=range] {\r\n    width: 100%; -webkit-appearance: none; appearance: none;\r\n    height: 5px; border-radius: 3px; cursor: default; background: linear-gradient(to right, #007aff 0%, #007aff var(--val), rgba(0,0,0,.14) var(--val), rgba(0,0,0,.14) 100%);\r\n}\r\ninput[type=range]::-webkit-slider-thumb {\r\n    -webkit-appearance: none; appearance: none;\r\n    width: 20px; height: 20px; border-radius: 50%;\r\n    background: #fff; border: 1px solid rgba(0,0,0,.18);\r\n    box-shadow: 0 1px 4px rgba(0,0,0,.22), 0 2px 8px rgba(0,0,0,.14);\r\n}\r\n\r\n.prefs-switch { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #1c1c1e; cursor: pointer; flex: 1; min-width: 0; }\r\n.prefs-switch input { display: none; }\r\n.prefs-switch .track {\r\n    width: 38px; height: 22px; border-radius: 12px; background: rgba(0,0,0,.18);\r\n    position: relative; flex-shrink: 0; transition: background .18s; order: 2;\r\n}\r\n.prefs-switch .track .thumb {\r\n    width: 18px; height: 18px; border-radius: 50%;\r\n    background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,.25);\r\n    position: absolute; top: 2px; left: 2px; transition: transform .18s;\r\n}\r\n.prefs-switch input:checked ~ .track { background: #007aff; }\r\n.prefs-switch input:checked ~ .track .thumb { transform: translateX(16px); }\r\n.prefs-switch-space { flex: 1; }\r\n\r\n.prefs_textarea {\r\n    width: 100%; height: 64px; padding: 9px 12px; border: 1px solid rgba(0,0,0,.14);\r\n    border-radius: 8px; background: rgba(255,255,255,.65); font-size: 13px; color: #1c1c1e;\r\n    resize: vertical; font-family: inherit; box-sizing: border-box;\r\n}\r\n.prefs_textarea:focus { outline: none; border-color: #007aff; }\r\n\r\n.prefs-key-hint { font-size: 12px; color: #8e8e93; margin: 12px 2px 4px; }\r\n.prefs-key-more > summary { list-style: none; cursor: pointer; padding: 6px 4px; font-size: 13px; font-weight: 600; color: #007aff; user-select: none; }\r\n.prefs-key-more > summary::-webkit-details-marker { display: none; }\r\n.prefs-key-more > summary::before { content: \"▶\"; font-size: 9px; color: #007aff; display: inline-block; transition: transform .18s; }\r\n.prefs-key-more[open] > summary::before { transform: rotate(90deg); }\r\n.prefs-key-table { width: 100%; border-collapse: collapse; font-size: 13px; }\r\n.prefs-key-table td { padding: 7px 6px; border-bottom: 1px solid rgba(0,0,0,.12); color: #8e8e93; }\r\n.prefs-key-table td:first-child { color: #1c1c1e; text-align: left; }\r\n.prefs-key-table td:last-child { color: #1c1c1e; font-size: 12px; font-family: {monoFont}; font-weight: 600; text-align: right; width: 110px; white-space: nowrap; }\r\n.prefs-key-table .key-btn {\r\n    display: inline-block; min-width: 46px; padding: 3px 10px; border: 1px solid rgba(0,0,0,.12);\r\n    border-radius: 7px; background: rgba(255,255,255,.75); font-family: {monoFont};\r\n    font-weight: 600; font-size: 12px; color: #1c1c1e; cursor: pointer; text-align: center;\r\n}\r\n.prefs-key-table .key-btn:hover { border-color: #007aff; color: #007aff; background: #fff; }\r\n\r\n.btn-plain {\r\n    padding: 6px 14px; border: 1px solid rgba(0,0,0,.14); border-radius: 6px;\r\n    font-size: 13px; color: #1c1c1e; background: rgba(255,255,255,.75); cursor: pointer;\r\n}\r\n.btn-plain:hover { background: rgba(255,255,255,.9); }\r\n.btn-danger { color: #ff3b30; }\r\n.prefs-config-row { flex-wrap: wrap; gap: 8px; }.prefs-config-row .btn-plain { flex: 1 1 0; min-width: 0; }.prefs-data-more { flex: 1; min-width: 0; }.prefs-data-win[hidden] { display: none; }.prefs-data-win { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; }.prefs-data-win-card { width: 300px; max-width: 92%; background: #fff; border-radius: 14px; box-shadow: 0 14px 40px rgba(0,0,0,.22); overflow: hidden; }.prefs-data-win-title { font-size: 15px; font-weight: 600; padding: 14px 16px; color: #1c1c1e; border-bottom: 1px solid rgba(0,0,0,.08); }.prefs-data-win-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }.prefs-data-opt { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #1c1c1e; cursor: pointer; }.prefs-data-opt input { accent-color: #007aff; }.prefs-data-win-actions { padding: 12px 16px; border-top: 1px solid rgba(0,0,0,.08); display: flex; justify-content: flex-end; gap: 8px; }.btn-primary { background: #007aff; border-color: #007aff; color: #fff; }.btn-primary:hover { background: #3395ff; }.body.prefs-dark .prefs-data-win-card { background: #2a2a2e; }.body.prefs-dark .prefs-data-win-title { color: #f2f2f7; border-color: rgba(255,255,255,.12); }.body.prefs-dark .prefs-data-opt { color: #f2f2f7; }.body.prefs-dark .prefs-data-win-actions { border-color: rgba(255,255,255,.12); }.body.prefs-dark .btn-primary { background: #0a84ff; border-color: #0a84ff; }.body.prefs-dark .btn-primary:hover { background: #3b8fff; }.body.prefs-eye .prefs-data-win-card { background: #eef4ec; }.body.prefs-eye .prefs-data-win-title { color: #263238; border-color: rgba(0,0,0,.08); }.body.prefs-eye .prefs-data-opt { color: #263238; }.body.prefs-eye .prefs-data-win-actions { border-color: rgba(0,0,0,.08); }\r\n.prefs-config-hint { font-size: 12px; color: #8e8e93; margin: 6px 2px 12px; line-height: 1.4; }\r\n\r\n\r\n#reader_preferences { padding: 0; border: 0; background: transparent; }\r\n#reader_preferences::backdrop { background-color: rgba(0,0,0,.3); }\r\n\r\n.body.prefs-dark { background: rgba(30,30,30,1); border: 1px solid rgba(255,255,255,.12); color: #f2f2f7; }\r\n.body.prefs-dark .prefs-head-title { color: #f2f2f7; }\r\n.body.prefs-dark .prefs-header { border-bottom: 1px solid rgba(255,255,255,.14); }\r\n.body.prefs-dark .prefs-sec { color: #98989d; }\r\n.body.prefs-dark .prefs-group { background: var(--panel-card, rgba(44,44,46,1)); border-color: rgba(255,255,255,.12); }\r\n.body.prefs-dark .prefs-group > * + * { border-top-color: rgba(255,255,255,.1); }\r\n.body.prefs-dark select, .body.prefs-dark .prefs-select { background-color: rgba(40,40,42,.85); color: #f2f2f7; border-color: rgba(255,255,255,.16); }\r\n.body.prefs-dark input[type=range] { background: linear-gradient(to right, #0a84ff 0%, #0a84ff var(--val), rgba(255,255,255,.2) var(--val), rgba(255,255,255,.2) 100%); }\r\n.body.prefs-dark input[type=range]::-webkit-slider-thumb { background: #d1d1d6; border-color: rgba(255,255,255,.25); }\r\n.body.prefs-dark .prefs-switch { color: #f2f2f7; }\r\n.body.prefs-dark .prefs-switch .track { background: rgba(118,118,128,.45); }\r\n.body.prefs-dark .prefs-switch input:checked ~ .track { background: #0a84ff; }\r\n.body.prefs-dark .skin-item { background: rgba(50,50,52,.6); border-color: rgba(255,255,255,.14); color: #98989d; }\r\n.body.prefs-dark .skin-item:hover { background: rgba(70,70,72,.8); }\r\n.body.prefs-dark .skin-item.sel { background: rgba(10,132,255,.2); border-color: #0a84ff; color: #6bb8ff; }\r\n.body.prefs-dark .skin-swatch { border-color: rgba(255,255,255,.2); }\r\n.body.prefs-dark .slider-head { color: #f2f2f7; }\r\n.body.prefs-dark .slider-val { color: #98989d; }\r\n.body.prefs-dark .prefs_textarea { background: rgba(40,40,42,.7); color: #f2f2f7; border-color: rgba(255,255,255,.16); }\r\n.body.prefs-dark .prefs-key-hint { color: #98989d; }\r\n.body.prefs-dark .prefs-key-table td { color: #98989d; border-bottom-color: rgba(255,255,255,.14); }\r\n.body.prefs-dark .prefs-key-table td:first-child { color: #98989d; }\r\n.body.prefs-dark .prefs-key-table td:last-child { color: #f2f2f7; }\r\n.body.prefs-dark .prefs-key-more > summary { color: #6e9eff; }\r\n.body.prefs-dark .prefs-key-table .key-btn { background: rgba(255,255,255,.12); color: #f2f2f7; border-color: rgba(255,255,255,.2); }\r\n.body.prefs-dark .prefs-key-table .key-btn:hover { border-color: #0a84ff; color: #0a84ff; background: rgba(255,255,255,.2); }\r\n.body.prefs-dark .btn-plain { background: rgba(120,120,128,.3); color: #f2f2f7; border-color: rgba(255,255,255,.16); }\r\n.body.prefs-dark .btn-danger { color: #ff453a; }\r\n.body.prefs-dark .prefs-config-hint { color: #98989d; }\r\n.body.prefs-dark .prefs-label { color: #f2f2f7; }\r\n.body.prefs-eye { border-color: rgba(0,0,0,.08); box-shadow: 0 18px 48px rgba(0,0,0,.12), 0 1px 6px rgba(0,0,0,.05); }\r\n.body.prefs-eye .prefs-head-title { color: #263238; }\r\n.body.prefs-eye .prefs-header { border-bottom: 1px solid rgba(0,0,0,.08); }\r\n.body.prefs-eye .prefs-sec { color: #5b6e60; }\r\n.body.prefs-eye .prefs-group { background: var(--panel-card, #eef7f0); border-color: rgba(0,0,0,.08); }\r\n.body.prefs-eye .prefs-group > * + * { border-top-color: rgba(0,0,0,.08); }\r\n.body.prefs-eye select, .body.prefs-eye .prefs-select { background-color: rgba(255,255,255,.65); color: #263238; border-color: rgba(0,0,0,.12); }\r\n.body.prefs-eye input[type=range] { background: linear-gradient(to right, #34c759 0%, #34c759 var(--val), rgba(0,0,0,.12) var(--val), rgba(0,0,0,.12) 100%); }\r\n.body.prefs-eye input[type=range]::-webkit-slider-thumb { background: #fff; border-color: rgba(0,0,0,.16); }\r\n.body.prefs-eye .prefs-switch { color: #263238; }\r\n.body.prefs-eye .prefs-switch .track { background: rgba(0,0,0,.18); }\r\n.body.prefs-eye .prefs-switch input:checked ~ .track { background: #34c759; }\r\n.body.prefs-eye .skin-item { background: rgba(255,255,255,.6); border-color: rgba(0,0,0,.12); color: #5b6e60; }\r\n.body.prefs-eye .skin-item.sel { background: rgba(52,199,89,.16); border-color: #34c759; color: #1f7a3d; }\r\n.body.prefs-eye .slider-head { color: #263238; }\r\n.body.prefs-eye .slider-val { color: #5b6e60; }\r\n.body.prefs-eye .prefs_textarea { background: rgba(255,255,255,.65); color: #263238; border-color: rgba(0,0,0,.12); }\r\n.body.prefs-eye .prefs-key-hint { color: #5b6e60; }\r\n.body.prefs-eye .prefs-key-table td { color: #5b6e60; border-bottom-color: rgba(0,0,0,.08); }\r\n.body.prefs-eye .prefs-key-table td:first-child { color: #3a3a3c; }\r\n.body.prefs-eye .prefs-key-table td:last-child { color: #263238; }\r\n.body.prefs-eye .prefs-key-more > summary { color: #34c759; }\r\n.body.prefs-eye .prefs-key-table .key-btn { background: rgba(255,255,255,.7); color: #263238; border-color: rgba(0,0,0,.12); }\r\n.body.prefs-eye .prefs-key-table .key-btn:hover { border-color: #34c759; color: #1f7a3d; background: #fff; }\r\n.body.prefs-eye .btn-plain { background: rgba(255,255,255,.75); color: #263238; border-color: rgba(0,0,0,.12); }\r\n.body.prefs-eye .btn-danger { color: #ff3b30; }\r\n.body.prefs-eye .prefs-config-hint { color: #5b6e60; }\r\n.body.prefs-eye .prefs-label { color: #263238; }\r\n\r\n/* 防站点覆盖：面板容器及内容禁用外部边框/outline，杜绝“整块黑框” */\r\n#reader_preferences form#preferences, #reader_preferences .prefs-body, #reader_preferences .prefs-group { outline: none !important; }\r\n#reader_preferences form#preferences, #reader_preferences .prefs-body { border: none !important; box-shadow: none !important; }\r\n#reader_preferences select:focus, #reader_preferences input:focus, #reader_preferences textarea:focus, #reader_preferences button:focus { outline: none !important; }\r\n";

  // =====================================================================
  // [模块 M9] 资源常量 Res
  // 职责：图标/素材等资源常量
  // =====================================================================
  var Res = {
    CSS_MAIN: tpl_mainCss,

    preferencesHTML: tpl_preferencesHTML
        .replace(/\\n/g, '\n'),

    preferencesCSS: tpl_preferencesCSS,
  };


  // =====================================================================
  // [模块 M10] 界面 UI
  // 职责：皮肤应用 / 阅读界面按钮 / 设置面板（含数据管理）/ reapplyContentClean
  // 依赖：M3 Setting、M8 模板、M6 净化
  // =====================================================================
  var UI = {
    fontStack: /Macintosh|Mac OS X/.test(navigator.userAgent)
        ? '-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Helvetica Neue", sans-serif'
        : '"Segoe UI Variable", "Segoe UI", "Microsoft YaHei", "微软雅黑", sans-serif',
    monoStack: /Macintosh|Mac OS X/.test(navigator.userAgent)
        ? '"SF Mono", Menlo, Consolas, monospace'
        : 'Consolas, "Courier New", monospace',
      skins: {},
      // 站点字体
      siteFontFamily: '',

      init: function(){
          UI.refreshMainStyle();

          UI.refreshSkinStyle(Setting.skin_name, true);


          UI.fixMobile();

          // 初始变量
          UI.$menu = $('#menu');
          UI.$menuBar = $('#menu-bar');
          UI.$content = $('#mynovelreader-content');


          UI.hideMenuList(Setting.menu_list_hiddden);  // 初始化章节列表是否隐藏

          // 目录侧边栏打开时，点击侧边栏外（阅读区）即关闭 —— 与设置面板点击遮罩关闭一致
          document.addEventListener('click', function(e){
              if(!UI.$menu || UI.$menu.length === 0) return;
              if(UI.menu_list_hiddden) return;  // 侧边栏已隐藏，不处理
              var t = e.target;
              if(t && t.closest && !t.closest('#menu') && !t.closest('#menu-bar')){
                  UI.hideMenuList(true);
              }
          }, true);
      },
      _sheetFor: function(id){
          if (UI._sheets && UI._sheets[id]) return UI._sheets[id];
          var rec;
          // 优先原生 adoptedStyleSheets（constructable stylesheet），不支持则回退 <style> 标签
          if (document.adoptedStyleSheets && typeof CSSStyleSheet !== 'undefined' && typeof CSSStyleSheet.prototype.replaceSync === 'function') {
              rec = { sheet: new CSSStyleSheet() };
              document.adoptedStyleSheets.push(rec.sheet);
          } else {
              rec = { el: $('<style>').appendTo('head') };
          }
          if (!UI._sheets) UI._sheets = {};
          UI._sheets[id] = rec;
          return rec;
      },
      _applySheet: function(id, css){
          var rec = UI._sheetFor(id);
          if (rec.sheet) {
              try { rec.sheet.replaceSync(css); } catch(e) {}
          } else {
              rec.el.text(css);
          }
      },
      refreshMainStyle: function(){
          // 添加站点字体到样式中
          if (App$1.site.useSiteFont && App$1.siteFontInfo) {
              UI.siteFontFamily = App$1.siteFontInfo.siteFontFamily;
          }

          var mainCss = Res.CSS_MAIN
                  .replace("{font_family}", UI.siteFontFamily + Setting.font_family)
                  .replace("{font_size}", UI.calcContentFontSize(Setting.font_size))
                  .replace("{title_font_size}", UI.calcTitleFontSize(Setting.font_size))
                  .replace("{content_width}", Setting.content_width)
                  .replace("{text_line_height}", Setting.text_line_height)
                  .replace("{paragraph_height}", Setting.paragraph_height)
                  .replace("{menu-bar-hidden}", Setting.menu_bar_hidden ? "display:none;" : "")
                  .replace(/\{uiFont\}/g, UI.fontStack)
                  .replace(/\{monoFont\}/g, UI.monoStack);

          UI._applySheet('main', mainCss);
      },
      hideMenuList: function(hidden){
          if(typeof(hidden) === "undefined"){
              hidden = !UI.menu_list_hiddden;
          }

          // 悬浮目录：呼出只显隐浮层，正文布局完全不动（不再改 margin）
          if(hidden){
              UI.$menu.addClass('hidden');
          }else {
              UI.$menu.removeClass('hidden');
          }
          UI.menu_list_hiddden = hidden;
      },
      getSkinCss: function(skin_name) {
          var css = UI.skins[skin_name] || "";

          return css;
      },
          // 目录面板跟随皮肤（覆盖硬编码 #333 黑底）
            getMenuSkinCss: function(skin_name){
        if(skin_name == '深色'){ return '\n#menu{background:var(--panel-glass);border-right:1px solid rgba(255,255,255,.1);}' + '\n#menu #header{color:#F5F5F7;border-bottom:1px solid rgba(255,255,255,.1);}' + '\n#menu #header a{color:#9c9c9f;}' + '\n#menu .chapter div{color:#F5F5F7;}' + '\n#menu .chapter div:hover{background:rgba(255,255,255,.06);color:#F5F5F7;}' + '\n#menu .chapter.active div{background:rgba(6,84,136,.28);color:#8ab4f8;font-weight:600;}'; }
        if(skin_name == '护眼'){ return '\n#menu{background:var(--panel-glass);border-right:1px solid rgba(0,0,0,.08);}' + '\n#menu #header{color:#263238;border-bottom:1px solid rgba(0,0,0,.08);}' + '\n#menu #header a{color:#5b6e60;}' + '\n#menu .chapter div{color:#263238;}' + '\n#menu .chapter div:hover{background:rgba(0,0,0,.05);color:#263238;}' + '\n#menu .chapter.active div{background:rgba(6,84,136,.12);color:#065488;font-weight:600;}'; }
        if(skin_name == '自动'){ return '\n@media (prefers-color-scheme: light){#menu{background:var(--panel-glass);border-right:1px solid rgba(0,0,0,.08);} #menu #header{color:#1D1D1F;border-bottom:1px solid rgba(0,0,0,.06);} #menu #header a{color:#888;} #menu .chapter div{color:#1D1D1F;} #menu .chapter div:hover{background:rgba(0,0,0,.05);color:#1D1D1F;} #menu .chapter.active div{background:rgba(6,84,136,.12);color:#065488;font-weight:600;}}' + '\n@media (prefers-color-scheme: dark){#menu{background:var(--panel-glass);border-right:1px solid rgba(255,255,255,.1);} #menu #header{color:#C9C9C9;border-bottom:1px solid rgba(255,255,255,.1);} #menu #header a{color:#9c9c9f;} #menu .chapter div{color:#C9C9C9;} #menu .chapter div:hover{background:rgba(255,255,255,.06);color:#C9C9C9;} #menu .chapter.active div{background:rgba(6,84,136,.28);color:#8ab4f8;font-weight:600;}}'; }
        return '\n#menu{background:var(--panel-glass);border-right:1px solid rgba(0,0,0,.08);}' + '\n#menu #header{color:#1D1D1F;border-bottom:1px solid rgba(0,0,0,.06);}' + '\n#menu #header a{color:#888;}' + '\n#menu .chapter div{color:#1D1D1F;}' + '\n#menu .chapter div:hover{background:rgba(0,0,0,.05);color:#1D1D1F;}' + '\n#menu .chapter.active div{background:rgba(6,84,136,.12);color:#065488;font-weight:600;}';
    },
refreshSkinStyle: function(skin_name, isFirst){
          var skinCss = UI.getSkinCss(skin_name);
          // 目录面板跟随皮肤
          skinCss += UI.getMenuSkinCss(skin_name);

          UI._applySheet('skin', skinCss);
          // 统一玻璃变量：无条件设根，目录侧边栏与设置面板共用 --panel-glass（刷新后即使面板未打开也设好，保证深色皮肤下打开面板即深色）
          var isDarkSkin = (skin_name == '深色') || (skin_name == '自动' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
          var panelGlass = 'rgba(248,248,248,1)';
          if(isDarkSkin){ panelGlass = 'rgba(44,44,46,1)'; }
          else if(skin_name.indexOf('护眼') != -1){ panelGlass = 'rgba(238,247,240,1)'; }
          if(document.documentElement){ document.documentElement.style.setProperty('--panel-glass', panelGlass); }
          // 皮肤面板卡片底色跟随
          // 面板卡片/背景底色：无条件设到根变量（面板未打开时也保证正确，打开即用 CSS 变量）
          var cardColor, prefsBg;
          if(isDarkSkin){ cardColor = '#2c2c2e'; prefsBg = 'rgba(30,30,30,1)'; }
          else if(skin_name.indexOf('护眼') != -1){ cardColor = '#eef7f0'; prefsBg = 'rgba(238,247,240,1)'; }
          else { cardColor = '#f5f5f7'; prefsBg = 'rgba(255,255,255,1)'; }
          if(document.documentElement){
              document.documentElement.style.setProperty('--panel-card', cardColor);
              document.documentElement.style.setProperty('--prefs-bg', prefsBg);
          }
          // 面板已打开时同步皮肤类与局部变量
          if(UI.$prefs && UI.$prefs.find('.body').length){
              var pb = UI.$prefs.find('.body')[0];
              if(isDarkSkin){ UI.$prefs.find('.body').addClass('prefs-dark').removeClass('prefs-eye'); }
              else {
                  UI.$prefs.find('.body').removeClass('prefs-dark');
                  if(skin_name.indexOf('护眼') != -1){ UI.$prefs.find('.body').addClass('prefs-eye'); }
                  else { UI.$prefs.find('.body').removeClass('prefs-eye'); }
              }
              pb.style.setProperty('--panel-card', cardColor);
              pb.style.setProperty('--prefs-bg', prefsBg);
          }
          // 自动皮肤：跟随系统主题实时切换（正文CSS由浏览器media query自动处理，此处刷新面板底色）
          if(skin_name == '自动' && window.matchMedia && !UI._autoSkinMedia){
              UI._autoSkinMedia = window.matchMedia('(prefers-color-scheme: dark)');
              var _al = UI._autoSkinMedia;
              if(_al.addListener){ _al.addListener(function(){ if(Setting.skin_name == '自动') UI.refreshSkinStyle('自动'); }); }
              else if(_al.addEventListener){ _al.addEventListener('change', function(){ if(Setting.skin_name == '自动') UI.refreshSkinStyle('自动'); }); }
          }
      },
            selectButton: async function(){
          GM_addStyle('\
            .readerbtn {\
                position: fixed;\
                right: 10px;\
                bottom: 10px;\
                z-index: 2247483648;\
                padding: 20px 5px!important;\
                width: 50px;\
                height: 20px;\
                line-height: 20px!important;\
                text-align: center;\
                border: 1px solid;\
                border-color: #888;\
                border-radius: 50%;\
                background: rgba(0,0,0,.5);\
                color: #FFF;\
                font: 12px/1.5 "微软雅黑","宋体",Arial;\
                cursor: pointer;\
                box-sizing: content-box;\
                letter-spacing: normal;\
            }\
        ');

          $("<div>")
              .addClass("readerbtn")
              .attr("title", "选择正文区域")
              .text("选择正文")
              .on("mousedown", function(ev){
                  ev.preventDefault();
                  ev.stopPropagation();
                  UI.selectContentGuide();
              })
              .appendTo('body');
      },
      selectContentGuide: function() {
          if (App$1._selectingContent) return;
          App$1._selectingContent = true;

          var step = 1;               // 1=选正文  2=选下一页按钮
          var contentSelector = '';
          var nextSelector = '';

          var $tip = $('<div id="mnr-select-tip">').css({
              position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)',
              zIndex: 2247483647, background: 'rgba(28,28,30,.78)', color: '#fff',
                  WebkitBackdropFilter: 'blur(14px) saturate(1.6)', backdropFilter: 'blur(14px) saturate(1.6)',
              padding: '10px 18px', borderRadius: '10px', fontSize: '13px',
              fontFamily: '-apple-system, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif',
              boxShadow: '0 10px 30px rgba(0,0,0,.28), 0 1px 4px rgba(0,0,0,.15)',
              border: '1px solid rgba(255,255,255,.12)',
              lineHeight: '1.8', textAlign: 'center'
          }).appendTo('body');

          // 根据点击的元素生成稳定选择器（优先 id，其次第一个 class，再向上找祖先，最后用标签+位置）
          function genSelector(el) {
              var node = el;
              for (var i = 0; node && node.nodeType === 1 && i < 6; i++) {
                  if (node.id) return '#' + node.id;
                  if (node.className && typeof node.className === 'string' && node.className.trim()) {
                      return '.' + node.className.trim().split(/\s+/)[0];
                  }
                  node = node.parentElement;
              }
              if (el && el.tagName) {
                  var tag = el.tagName.toLowerCase();
                  var parent = el.parentElement;
                  var idx = parent ? Array.prototype.indexOf.call(parent.children, el) + 1 : 1;
                  return tag + ':nth-child(' + idx + ')';
              }
              return '';
          }

          function updateTip() {
              if (step === 1) {
                  $tip.html('已进入「选择正文」模式：请<b>点击页面中的正文区域</b>（按 <b>Esc</b> 取消）');
              } else {
                  $tip.html('正文已选中：<code>' + contentSelector + '</code><br>'
                      + '如果页面有「下一页 / 下一章」链接或按钮，请<b>点击它</b>（用于自动翻页）<br>'
                      + '<a id="mnr-skip-next" href="javascript:void(0)" style="color:#7ecb5f">[没有，跳过]</a>　按 <b>Esc</b> 取消');
                  // 绑定跳过按钮
                  $tip.find('#mnr-skip-next').click(function(ev) {
                      ev.preventDefault();
                      ev.stopPropagation();
                      finish();
                  });
              }
          }

          function finish() {
              $(document).off('click.mnrSelect', clickHandler);
              $(document).off('keydown.mnrSelect', escHandler);
              $tip.remove();
              App$1._selectingContent = false;
              $('.readerbtn').remove();

              // 保存规则（正文 + 可选的下一页选择器），然后立即用新规则重新启动阅读模式
              App$1.saveCurrentSiteRule(contentSelector, nextSelector);
              App$1.site = null;
              App$1.launch();
          }

          var clickHandler = function(e) {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              var target = e.target;
              if (!target || !target.nodeType || target.nodeType !== 1) target = target.parentElement;
              // 忽略提示层与阅读按钮自身
              if ($(target).closest('#mnr-select-tip, .readerbtn, #reader_preferences').length) return;

              if (step === 1) {
                  contentSelector = genSelector(target);
                  if (!contentSelector) return;
                  step = 2;
                  updateTip();
              } else {
                  // 第二步：尽量命中链接/按钮元素本身
                  var link = $(target).closest('a,button,area')[0] || target;
                  nextSelector = genSelector(link);
                  if (!nextSelector) return;
                  finish();
              }
          };
          var escHandler = function(ev) {
              if (ev.keyCode === 27) {
                  $(document).off('click.mnrSelect', clickHandler);
                  $(document).off('keydown.mnrSelect', escHandler);
                  $tip.remove();
                  App$1._selectingContent = false;
                  $('.readerbtn').text('选择正文');
              }
          };

          updateTip();
          $(document).on('click.mnrSelect', clickHandler);
          $(document).on('keydown.mnrSelect', escHandler);
      },
      calcContentFontSize: function(fontSizeStr) {
          var m = fontSizeStr.match(/([\d\.]+)(px|r?em|pt)/);
          if(m) {
              var size = m[1],
                  type = m[2];
              return parseFloat(size, 10) + type;
          }

          m = fontSizeStr.match(/([\d\.]+)/);
          if (m) {
              return parseFloat(m[1], 10) + 'px';
          }

          return "";
      },
      calcTitleFontSize: function(fontSizeStr){
          var m = fontSizeStr.match(/([\d\.]+)(px|r?em|pt)/);
          if(m) {
              var size = m[1],
                  type = m[2];
              return parseFloat(size, 10) * 1.8 + type;
          }

          m = fontSizeStr.match(/([\d\.]+)/);
          if (m) {
              return parseFloat(m[1], 10) * 1.8 + 'px';
          }

          return "";
      },
      fixMobile: function(){  // 自适应网页设计
          var meta = document.createElement("meta");
          meta.setAttribute("name", "viewport");
          meta.setAttribute("content", "width=device-width, initial-scale=1");
          document.head.appendChild(meta);
      },
      

    // 解码 unicode 转义（修复章节标题 \u20 等残码）
    decodeUnicodeStr: function(str){
        if(typeof str !== 'string') return str;
        try{
            var r = str
                .replace(/\\u[0-9a-fA-F]{1,6}/g, '')
                .replace(/&(?:#\d+|#x[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, '')
                .replace(/&[a-zA-Z#][a-zA-Z0-9]{0,10}/g, '')
                .replace(/(^|[^a-zA-Z0-9])u[0-9a-fA-F]{1,4}(?![0-9a-fA-F])/gi, '$1')
                .replace(/^[\s\u00a0\-&:;.]+/, '')
                .replace(/[ \t]{2,}/g, ' ')
                .trim();
            return r;
        }
        catch(e){ return str; }
    },
preferencesShow: function(event){
          if($("#reader_preferences").length){
              return;
          }

          UI.$prefs = $('<dialog id="reader_preferences">')
              .css('cssText', UI._prefsPanelCssText())
              .append(
                  $('<style>').text(Res.preferencesCSS.replace(/\{uiFont\}/g, UI.fontStack).replace(/\{monoFont\}/g, UI.monoStack)))
              .append(
                  $('<div class="body">').html(Res.preferencesHTML))
              .appendTo('body');

          var _isDark = (Setting.skin_name == '深色' || (Setting.skin_name == '自动' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches));
          // 打开面板保险设根 --panel-glass（若此前 refreshSkinStyle 未执行过，深色皮肤也能拿到深色底）
          if(document.documentElement){
              var _pg = _isDark ? 'rgba(44,44,46,1)' : (Setting.skin_name.indexOf('护眼') != -1 ? 'rgba(238,247,240,1)' : 'rgba(248,248,248,1)');
              document.documentElement.style.setProperty('--panel-glass', _pg);
          }
          if(_isDark){
              UI.$prefs.find('.body').addClass('prefs-dark').removeClass('prefs-eye');
              var _pb = UI.$prefs.find('.body')[0]; _pb.style.setProperty('--panel-card','#2c2c2e'); _pb.style.setProperty('--prefs-bg','rgba(30,30,30,1)');
          }else{
              UI.$prefs.find('.body').removeClass('prefs-dark');
              var _pb = UI.$prefs.find('.body')[0];
              if(Setting.skin_name.indexOf('护眼') != -1){ UI.$prefs.find('.body').addClass('prefs-eye'); _pb.style.setProperty('--panel-card','#eef7f0'); _pb.style.setProperty('--prefs-bg','rgba(238,247,240,1)'); }
              else { UI.$prefs.find('.body').removeClass('prefs-eye'); _pb.style.setProperty('--panel-card','#f5f5f7'); _pb.style.setProperty('--prefs-bg','rgba(255,255,255,1)'); }
          }
          UI.preferencesLoadHandler();
          UI._enablePrefsDragResize();
          // 打开面板时滚动区置顶，避免残留滚动位置导致顶部内容（标题/外观设置/启动模式）不可见
          UI.$prefs.find('.prefs-body').scrollTop(0);
          // 阻止点击开关时 prefs-body 自动滚动定位：浏览器 focus 会把滚动区滚到开关处（面板中部），
          // 导致顶部内容整体滚出、界面“跳变/拉宽”感；preventDefault 仅阻止 focus 定位，开关仍可正常切换
          UI.$prefs.find('.prefs-switch, .skin-item').on('mousedown.preventScroll', function(e){ e.preventDefault(); });
          // 捕获阶段阻止 checkbox/radio 获得焦点：浏览器在控件获得焦点时会把滚动区滚到控件处（面板中部，
          // 即“段落首行缩进”以下的可视区外开关），导致顶部内容滚出、界面跳变；阻止 focus 后点击切换仍正常
          var pbEl = UI.$prefs.find('.prefs-body')[0];
          if (pbEl) {
              pbEl.addEventListener('focus', function(e){
                  var t = e.target;
                  if (t && t.tagName === 'INPUT' && (t.type === 'checkbox' || t.type === 'radio')) {
                      e.preventDefault();
                  }
              }, true);
          }
          // 【根因修复】label 在 click 默认行为里激活 checkbox/radio 时，浏览器强制把控件滚进 prefs-body 视野
          // （即“段落首行缩进”以下开关点击后顶部内容滚出）；mousedown/focus 阻止拦不住 label 激活。
          // 改为捕获 click：阻止默认激活与传播，手动切换 checked，再调用原点击处理（视觉/功能一致，不滚动）
          if (pbEl) {
              pbEl.addEventListener('click', function(e){
                  var t = e.target;
                  if (!t || !t.closest) return;
                  var sw = t.closest('.prefs-switch');
                  if (sw) {
                      var cb = sw.querySelector('input[type=checkbox]');
                      if (cb) {
                          e.preventDefault();
                          e.stopPropagation();
                          cb.checked = !cb.checked;
                          // 手动切换后需主动触发 change，否则 saveHandler（依赖 change）不会执行、设置不保存
                          $(cb).trigger('change');
                          UI.preferencesClickHandler(cb);
                      }
                  }
              }, true);
          }

          // 原生 dialog：showModal 顶层展示；点遮罩(::backdrop，target=dialog 自身)与 Esc(原生 close) 关闭，均走统一清理
          UI.$prefs[0].showModal();
          UI.$prefs.on('click', function(e){ if(e.target === this){ UI.preferencesCloseHandler(); } });
          UI.$prefs.on('close', function(){ UI.preferencesCloseHandler(); });
      },
      hide: function(){
          if(UI.$prefs) UI.$prefs.remove();
          UI.$prefs = null;
      },
      // 5.1: 读取记忆的面板位置尺寸
      _prefsPanelCssText: function(){
          // 面板完全固定：默认居中，不可缩放、不可拖动（位置/尺寸记忆已停用）
          return 'width:min(92vw,480px); min-width:320px; max-height:94vh; overflow:hidden; margin:auto; border-radius:16px;';
      },
      // 面板已固定（不可缩放/移动），仅保留阻止正文文本被拖拽选中
      _enablePrefsDragResize: function(){
          var $panel = UI.$prefs;
          if(!$panel || !$panel.length) return;
          var $body = $panel.find('.body');
          $body.on('dragstart.pre', function(e){ e.preventDefault(); });
      },
      preferencesLoadHandler: function(){
          var $form = $("#preferences");

          // checkbox


          $form.find("#hide-menu-list").get(0).checked = Setting.menu_list_hiddden;

          $form.find("#add-nextpage-to-history").get(0).checked = Setting.addToHistory;
          

          var _ff = Setting.font_family;
          // 旧版字体值兼容映射：宋体/楷体/黑体原只有 Windows 字体名，映射到跨平台栈
          var _ffMap = {
              "宋体,SimSun": "宋体,SimSun,\"Songti SC\",宋体-简",
              "楷体,楷体_GB2312": "楷体,楷体_GB2312,\"Kaiti SC\",楷体-简",
              "黑体,SimHei": "黑体,SimHei,\"Heiti SC\",黑体-简"
          };
          if (_ffMap[_ff]) _ff = _ffMap[_ff];
          // 字体下拉按平台显示：macOS 保留苹方、隐藏微软雅黑；Windows 相反
          var _isMac = /Macintosh|Mac OS X/.test(navigator.userAgent);
          $form.find("#font-family option[data-def]").each(function(){
              var _d = $(this).attr('data-def');
              if((_d === 'mac' && !_isMac) || (_d === 'win' && _isMac)) $(this).remove();
          });
          var _$ff = $form.find("#font-family");
          if (!_$ff.find('option').filter(function(){ return $(this).attr('value') === _ff; }).length) {
              $('<option>').attr('value', _ff).text('自定义字体').appendTo(_$ff);
          }
          _$ff.val(_ff);
          $form.find("#font-size").get(0).value = parseFloat(Setting.font_size) || 20;
          $form.find("#content_width").get(0).value = parseFloat(Setting.content_width) || 1000;
          $form.find("#text_line_height").get(0).value = parseFloat(Setting.text_line_height) || 1.8;
          $form.find("#paragraph_height").get(0).value = parseFloat(Setting.paragraph_height) || 0.5;
          $form.find("#scroll_animate").get(0).checked = Setting.scrollAnimate;

          $form.find("#auto-scroll-speed").get(0).value = Setting.autoScrollSpeed;
          $form.find("#val-auto-scroll-speed").text(Setting.autoScrollSpeed + ' px/s');
          $form.find("#custom_siteinfo").get(0).value = Setting.customSiteinfo;

          $form.find("#smart-next-page").get(0).checked = Setting.smartNextPage;
          $form.find('#preload-next-page').get(0).checked = Setting.preloadNextPage;

          // 内容标准化
          $form.find('#enable-content-normalize').get(0).checked = Setting.contentNormalize;
          $form.find('#enable-content-optimize').get(0).checked = Setting.contentOptimize;

          

          // 皮肤
          var $skin = $form.find("#skin");
          for(var key in UI.skins){
              $("<option>").text(key).appendTo($skin);
          }
          $skin.val(Setting.skin_name).change(function(){
              var key = $(this).find("option:selected").text();
              UI.refreshSkinStyle(key);
              Setting.skin_name = key;
              $form.find('.skin-item').removeClass('sel');
              $form.find('.skin-item[data-skin="' + key + '"]').addClass('sel');
          });
          $form.find('.skin-item').click(function(){
              var key = $(this).attr('data-skin');
              $form.find('#skin').val(key).trigger('change');
          });
          // 打开面板时同步皮肤选中框：.val() 不会触发 change，需手动补 active 高亮
          $form.find('.skin-item').removeClass('sel');
          $form.find('.skin-item[data-skin="' + Setting.skin_name + '"]').addClass('sel');

          // 字体大小等预览
          var preview = (function(){
              var _t = null;
              function _orig(){
                  switch(this.id){
                      case "font-size":
                          var contentFontSize = UI.calcContentFontSize(this.value);
                          var titleFontSize = UI.calcTitleFontSize(this.value);
                          if(titleFontSize) {
                              UI.$content.css("font-size", contentFontSize);
                              UI.$content.find("h1").css("font-size", titleFontSize);
                          }
                          break;
                      case "font-family":
                          UI.$content.css("font-family", UI.siteFontFamily + this.value);
                          break;
                      case "content_width":
                          UI.$content.css("width", this.value + 'px');
                          break;
                      case "text_line_height":
                          UI.$content.css("line-height", this.value);
                          break;
                      case "paragraph_height":
                          $(App$1.curFocusElement).find('p').css("margin", this.value + 'em 0');
                          break;
                  }
              }
              return function(){
                  var _s = this, _a = arguments;
                  clearTimeout(_t);
                  _t = setTimeout(function(){ _orig.apply(_s, _a); }, 300);
              };
          })();
          $form.on("input", "input", preview);

          // 滑块数值实时显示
          $form.find('input[type=range]').each(function(){
              var $val = $form.find('#val-' + this.id);
              if (!$val.length) return;
              var self = this;
              var upd = function(){
                  var v = self.value;
                  if (self.id === 'paragraph_height') $val.text(v + 'em');
                  else if (self.id === 'content_width') $val.text(v + 'px');
                  else if (self.id === 'text_line_height') $val.text(v);
                  else if (self.id === 'auto-scroll-speed') $val.text(v + ' px/s');
                  else $val.text(v + 'px');
                  // 4.9: 滑轨蓝色进度填充（对齐macOS滑块）
                  var _min = parseFloat(self.min)||0, _max = parseFloat(self.max)||100;
                  var _pct = ((v-_min)/(_max-_min))*100;
                  if(_pct<0)_pct=0; if(_pct>100)_pct=100;
                  self.style.setProperty('--val', _pct+'%');
              };
              upd();
              $(this).on('input', upd);
          });

          // 字体下拉即时预览
          $form.find("#font-family").on('change', function(){
              UI.$content.css("font-family", UI.siteFontFamily + this.value);
          });

          // 初始化设置按键（按钮文字显示当前键值）
          $form.find("#openPreferencesKey").text(Setting.openPreferencesKey);
          $form.find("#setHideMenuListKey").text(Setting.hideMenuListKey);

          // 点击事件
          $form.on('click', 'input:checkbox, input:button, button', function(event){
              UI.preferencesClickHandler(event.target); // 不用 await
          });

          // 数据恢复浮层：点击遮罩空白处关闭
          $form.find('#data-more-win').on('click', function(e){
              if (e.target === this) this.hidden = true;
          });

          // macOS 即时生效：任何设置改动立即保存并应用，无确定按钮
          var _applyTimer = null;
          var _scheduleApply = function(){ clearTimeout(_applyTimer); _applyTimer = setTimeout(function(){ UI.preferencesSaveHandler(); }, 60); };
          $form.on('change', 'input, select, textarea', _scheduleApply);
          $form.on('input', 'input[type=range]', _scheduleApply);
      },
      cleanPreview: function() {
          UI.$content.find("h1").css("font-size", "");

          // 恢复初始设置（有误操作）
      },
      preferencesClickHandler: async function(target){
          var key;
          switch (target.id) {
              case 'close_button':
                  UI.preferencesCloseHandler();
                  break;
              case 'reset-config':
                  UI.resetConfig();
                  break;
              case 'hide-menu-list':
                  UI.hideMenuList(target.checked);
                  break;
              
              case 'clear-site-progress':
                  if (confirm('确定清除当前网站的阅读进度吗？')) {
                      GM_deleteValue('mnr_read_progress');
                      UI.notice('已清除本站阅读进度', 2000);
                  }
                  break;
              case 'clear-progress':
                  if (confirm('确定清除全部阅读进度吗？')) {
                      GM_deleteValue('mnr_read_progress');
                      UI.notice('已清除阅读进度', 2000);
                  }
                  break;
              case 'data-more-btn':
                  document.getElementById('data-more-win').hidden = false;
                  break;
              case 'data-more-win':
                  document.getElementById('data-more-win').hidden = true;
                  break;
              case 'data-more-ok':
                  var $da = $("#preferences");
                  if ($da.find('#opt-reset-config').get(0).checked) UI.resetConfig();
                  if ($da.find('#opt-clear-site-progress').get(0).checked && confirm('确定清除当前网站的阅读进度吗？')) { GM_deleteValue('mnr_read_progress'); UI.notice('已清除本站阅读进度', 2000); }
                  if ($da.find('#opt-clear-progress').get(0).checked && confirm('确定清除全部阅读进度吗？')) { GM_deleteValue('mnr_read_progress'); UI.notice('已清除阅读进度', 2000); }
                  document.getElementById('data-more-win').hidden = true;
                  break;
              case 'export-config':
                  UI.exportConfig();
                  break;
              case 'import-config':
                  UI.importConfig();
                  break;
              case 'export-logs':
                  UI.exportLogs();
                  break;
              case 'openPreferencesKey':
                  key = prompt('请输入打开设置的快捷键：', Setting.openPreferencesKey);
                  if (key) {
                      if (UI.keyConflict('openPreferencesKey', key)) {
                          UI.notice('按键冲突：该键已被其他功能使用');
                          break;
                      }
                      Setting.openPreferencesKey = key;
                      $(target).text(key);
                  }
                  break;
              case 'setHideMenuListKey':
                  key = prompt('请输入切换左侧章节列表的快捷键：', Setting.hideMenuListKey);
                  if (key) {
                      if (UI.keyConflict('setHideMenuListKey', key)) {
                          UI.notice('按键冲突：该键已被其他功能使用');
                          break;
                      }
                      Setting.hideMenuListKey = key;
                      $(target).text(key);
                  }
                  break;
          }
      },

      // 检测快捷键冲突：key 是否已被其他固定功能或另一个自定义键占用
      keyConflict: function(curId, key) {
          if (!key) return false;
          key = String(key).trim().toLowerCase();
          // 固定快捷键集合（基础导航键）
          var fixedKeys = ["enter", "left", "right", "esc", ",", ".", "[", "]"];
          if (fixedKeys.indexOf(key) !== -1) return true;
          // 另一个自定义键是否占用（排除自身）
          var other = curId === "openPreferencesKey" ? Setting.hideMenuListKey : Setting.openPreferencesKey;
          if (other && String(other).trim().toLowerCase() === key) return true;
          return false;
      },
      exportConfig: function() {
          // 导出全部数据：设置 + 站点规则 + 阅读进度 + 启用站点（完整备份）
          var data = { app: "小说阅读助手", export_version: "1.4", exportDataType: "full", config: {} };
          GM_listValues().forEach(function(key) {
              data.config[key] = GM_getValue(key);
          });
          var json = JSON.stringify(data, null, 2);
          try {
              var blob = new Blob([json], {type: "application/json"});
              var url = URL.createObjectURL(blob);
              var a = document.createElement("a");
              a.href = url;
              a.download = "小说阅读助手-data-" + new Date().toISOString().slice(0,10) + ".json";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
          } catch(e) {
              UI.notice("导出失败，请使用较新浏览器");
              return;
          }
          UI.notice("<b>数据已导出</b>（设置、站点规则、阅读进度）");
      },
      importConfig: function() {
          var json = prompt("请粘贴导出的数据JSON（含设置、站点规则与阅读进度）：", "");
          if (!json) return;
          var data;
          try {
              data = JSON.parse(json);
          } catch(e) {
              UI.notice("导入失败：不是有效的JSON");
              return;
          }
          if (!data || (data.app !== "小说阅读助手" && data.app !== "MyNovelReader" && data.app !== "小说阅读器") || !data.config) {
              UI.notice("导入失败：不是本脚本的备份文件");
              return;
          }
          // 版本校验（仅提示，不强挡低版本，避免导入不了旧备份）
          if (!data.export_version) {
              if (!confirm("此备份文件无版本号，可能来自旧版脚本，仍要继续导入吗？")) return;
          }
          // 自动识别备份类型：
          //  - exportDataType === "full"：新版完整备份，覆盖设置、站点规则、阅读进度
          //  - 无标记（旧版配置备份）：仅导入设置与站点规则，保留本地阅读进度
          var isFull = data.exportDataType === "full";
          if (isFull && !confirm("导入完整备份将覆盖本机全部数据（含阅读进度），确定继续吗？")) return;
          Object.keys(data.config).forEach(function(key) {
              // 旧版备份跳过阅读进度，保持与旧行为一致
              if (!isFull && key === "mnr_read_progress") return;
              GM_setValue(key, data.config[key]);
          });
          if (isFull) {
              UI.notice("数据导入成功（设置、站点规则、阅读进度），刷新页面生效");
          } else {
              UI.notice("配置导入成功（设置与站点规则，阅读进度保留本地），刷新页面生效");
          }
          setTimeout(function() { location.reload(); }, 1200);
      },
      exportLogs: function() {
          var logs = GM_getValue('mnr_logs', []) || [];
          if (!logs.length) { UI.notice('暂无日志记录'); return; }
          var txt = logs.map(function(x) {
              var d = new Date(x.t), p = function(n){ return (n < 10 ? '0' : '') + n; };
              return '[' + x.l + '] ' + d.getFullYear() + '-' + p(d.getMonth()+1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) + ' ' + x.m + (x.e ? ' | ' + x.e : '');
          }).join('\n');
          var a = document.createElement('a');
          a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' }));
          a.download = '小说阅读助手 日志.txt';
          a.click();
          URL.revokeObjectURL(a.href);
          UI.notice('已导出日志（' + logs.length + ' 条）');
      },
      resetConfig: function() {
          if (!confirm('确定恢复全部设置为默认值吗？\n阅读进度将保留。')) return;
          var keep = ['mnr_read_progress'];
          var keys = GM_listValues();
          keys.forEach(function(key) {
              if (keep.indexOf(key) === -1) GM_deleteValue(key);
          });
          UI.notice('<b>已恢复默认设置</b>，即将刷新页面生效');
          setTimeout(function() { location.reload(); }, 1200);
      },
      preferencesCloseHandler: function(){
          UI.cleanPreview();

          UI.hide();
      },
      preferencesSaveHandler: function(){
          var $form = $("#preferences");


          Setting.addToHistory = $form.find("#add-nextpage-to-history").get(0).checked;
          

          var skinName = $form.find("#skin").find("option:selected").text();
          Setting.skin_name = skinName;
          
          
          UI.refreshSkinStyle(skinName);

          Setting.font_family = $form.find("#font-family").get(0).value;
          UI.refreshMainStyle();  // 刷新主样式表，字体即时生效（含站点字体前缀）

          Setting.font_size = $form.find("#font-size").get(0).value;
          Setting.text_line_height = $form.find("#text_line_height").get(0).value;
          Setting.paragraph_height = $form.find("#paragraph_height").get(0).value + 'em';
          Setting.content_width = $form.find("#content_width").get(0).value + 'px';
          Setting.autoScrollSpeed = $form.find("#auto-scroll-speed").get(0).value;
          // 自动滚动运行时实时应用新速度
          if (App$1.autoScrolling) {
              App$1.stopAutoScroll();
              App$1.startAutoScroll();
          }
          Setting.scrollAnimate = $form.find("#scroll_animate").get(0).checked;

          Setting.menu_list_hiddden = $form.find("#hide-menu-list").get(0).checked;
          UI.hideMenuList(Setting.menu_list_hiddden);



          Setting.customSiteinfo = $form.find("#custom_siteinfo").get(0).value;

          Setting.smartNextPage = $form.find("#smart-next-page").get(0).checked;
          Setting.preloadNextPage = $form.find("#preload-next-page").get(0).checked;


          // 内容标准化（总开关：分段/合并引号/删域名行/首行缩进均跟随此开关）
          var _oldNorm = Setting.contentNormalize;
          var _oldOpt = Setting.contentOptimize;
          Setting.contentNormalize = $form.find('#enable-content-normalize').get(0).checked;
          Setting.contentOptimize = $form.find('#enable-content-optimize').get(0).checked;

          // 仅当净化/优化开关之一实际变化时，才即时重应用净化/优化（避免改动其他开关时也重复处理并弹提示）
          if (Setting.contentNormalize !== _oldNorm || Setting.contentOptimize !== _oldOpt) {
              UI.reapplyContentClean();
          }

          // 重新载入样式
          UI.cleanPreview();
          UI.refreshMainStyle();

          // 操作日志：记录本次设置更新（功能开关变化，便于日后回溯）
          logStore('op', '设置已更新：皮肤=' + skinName +
              '，字号=' + Setting.font_size +
              '，净化=' + (Setting.contentNormalize ? '开' : '关') +
              '，优化=' + (Setting.contentOptimize ? '开' : '关') +
              '，智能翻页=' + (Setting.smartNextPage ? '开' : '关') +
              '，预加载=' + (Setting.preloadNextPage ? '开' : '关'));
      },
      // 切「正文内容净化/优化」开关后，从缓存的原始正文文本按当前开关状态重新生成并替换当前章节，无需刷新
      // 开关开/关均可逆：关闭净化/优化即恢复原始正文（有杂质行/未优化排版），打开即重新应用
      reapplyContentClean: function() {
          // 用缓存的「完全原始」HTML 重建正文，按当前开关状态重新走 DOM 层净化 + 文本层净化/优化
          // （与首次加载同源，保证开/关完全一致）
          logStore('op', '正文内容重应用：净化=' + (Setting.contentNormalize ? '开' : '关') + '，优化=' + (Setting.contentOptimize ? '开' : '关'));
          var raw = App$1._rawContentCache;
          var $content = App$1.$content;
          if (!raw || !$content || $content.size() <= 0) { return; }

          // 取当前活动章节的 .content 容器
          var $target = $content.find('article').last().find('.content');
          if (!$target.length) $target = $content.find('article .content').first();
          if (!$target.length) { return; }

          // 从原始 HTML 重建 DOM，先做 DOM 层净化（跟随净化开关：隐藏元素/章节标题/contentRemove/整块杂质块）
          var $div = $(raw);
          applyDomClean($div, App$1._curInfo || null);
          var content = cleanHTML($div[0]);

          // host 用当前页 URL 计算，与首次加载的 Parser._curPageHost 一致
          var curHost = App$1._curPageHost || getUrlHost(App$1.curPageUrl || location.href);
          var processed = applyContentSettings(content, curHost || '', App$1.replaceText ? App$1.replaceText.bind(App$1) : undefined);

          // 统计净化移除的杂质行数（对比 DOM 层净化后的行集合）
          var normOn = Setting.contentNormalize, optOn = Setting.contentOptimize;
          var removed = 0;
          if (normOn) {
              var rawLines = content.split('\n').filter(function(l){ return l.trim(); });
              var proLines = processed.split('\n').filter(function(l){ return l.trim(); });
              var rawSet = {}, proSet = {};
              rawLines.forEach(function(l){ rawSet[l] = (rawSet[l]||0)+1; });
              proLines.forEach(function(l){ proSet[l] = (proSet[l]||0)+1; });
              Object.keys(rawSet).forEach(function(l){ var d=(rawSet[l]||0)-(proSet[l]||0); if(d>0) removed += d; });
          }

          // 重新生成 HTML 并替换（renderHTML 内含清纯数字行/段尾段评数字，与首次加载一致）
          var newHtml = renderHTML(processed);
          $target.replaceWith(newHtml);

          // 反馈
          if (normOn || optOn) {
              var msg = '净化/优化已应用';
              if (normOn) msg += '：净化移除 ' + removed + ' 行';
              if (optOn) msg += (msg.indexOf('：') !== -1 ? '，' : '：') + '优化已生效';
              UI.notice(msg, 1800);
          }
      },
      notice: function (htmlText, ms){
          var $noticeDiv = $("#alert");
          if (!ms) {
              ms = 1666;
          }

          clearTimeout(UI.noticeDivto);
          $noticeDiv.find("p").html(htmlText);
          $noticeDiv.fadeIn("fast");

          UI.noticeDivto = setTimeout(function(){
              $noticeDiv.fadeOut(500);
          }, ms);

          return $noticeDiv;
      }
  };

  UI.skins["浅色"] = "body { color: #1D1D1F; background-color: #FAF9F8; } #mynovelreader-content { letter-spacing: 0.05em; line-height: 1.9; } .chapter.active div { color: #1D1D1F; } #alert { background: rgba(255,255,255,.78); color:#1D1D1F; border-color:rgba(0,0,0,.1); } #loading { background: rgba(255,255,255,.78); color:#1D1D1F; border-color:rgba(0,0,0,.1); }";
  UI.skins["深色"] = "body { color: #F5F5F7; background-color: #1E1E1E; } #mynovelreader-content { color: #F5F5F7; letter-spacing: 0.04em; line-height: 1.9; } .title { color: #8ab4f8; } body a { color: #8ab4f8; } #alert { background: rgba(28,28,30,.78); color:#F5F5F7; border-color:rgba(255,255,255,.1); } #loading { background: rgba(28,28,30,.78); color:#F5F5F7; border-color:rgba(255,255,255,.1); }";
  UI.skins["护眼"] = "body { color: #263238; background-color: #E8F5E9; } #mynovelreader-content { letter-spacing: 0.05em; line-height: 1.9; } .chapter.active div { color: #263238; } #alert { background: rgba(232,245,233,.85); color:#263238; border-color:rgba(0,0,0,.08); } #loading { background: rgba(232,245,233,.85); color:#263238; border-color:rgba(0,0,0,.08); }";
  UI.skins["自动"] = "@media (prefers-color-scheme: light){ body { color: #1D1D1F; background-color: #FAF9F8; } #mynovelreader-content { letter-spacing: 0.05em; line-height: 1.9; } .chapter.active div { color: #1D1D1F; } #alert { background: rgba(255,255,255,.78); color:#1D1D1F; border-color:rgba(0,0,0,.1); } #loading { background: rgba(255,255,255,.78); color:#1D1D1F; border-color:rgba(0,0,0,.1); } } @media (prefers-color-scheme: dark){ body { color: #C9C9C9; background-color: #1E1E1E; } #mynovelreader-content { color: #C9C9C9; letter-spacing: 0.04em; line-height: 1.9; } .title { color: #8ab4f8; } body a { color: #8ab4f8; } #alert { background: rgba(28,28,30,.78); color:#C9C9C9; border-color:rgba(255,255,255,.1); } #loading { background: rgba(28,28,30,.78); color:#C9C9C9; border-color:rgba(255,255,255,.1); } }";


  /**
   * 获取 substring 在 string 所有位置的数组
   *
   * @param {string} substring
   * @param {string} string
   * @returns {number[]}
   */

  /**
   * 22000 毫秒 => 00:00:02
   *
   * @param {number} distanceMillis
   * @returns {string}
   */


  const {
    HTMLElement,
    EventTarget,
    MutationObserver: MutationObserver$1,
    Navigator,
    Proxy,
    Reflect,
    Object: Object$1,
    setTimeout: setTimeout$1,
    clearTimeout: clearTimeout$1,
    console: console$1
  } = unsafeWindow;

  // 防止 iframe 中的脚本调用 focus 方法导致页面发生滚动
  // =====================================================================
  // [模块 M11] 事件清理与翻页辅助
  // 职责：cleanupEvents / cleanupEventArray / RequestStatus / iframeHeight
  // 依赖：M2 工具
  // =====================================================================
  const clenaupEventArray = [];

  // 事件/观察器代理仅用于 iframe 沙箱内的事件清理（cleanupEvents 只在 iframe 调用），
  // 不再全局替换，避免侵入页面所有 addEventListener：非 iframe 主文档完全不受影响，也不累积记录
  if (window.name === 'mynovelreader-iframe') {
    const _addEventListener = EventTarget.prototype.addEventListener;
    const addEventListenerProxy = new Proxy(_addEventListener, {
      apply(target, thisArg, argumentsList) {
        Reflect.apply(target, thisArg, argumentsList);
        clenaupEventArray.push(() => {
          try {
            thisArg.removeEventListener(...argumentsList);
          } catch (e) {}
        });
      }
    });
    EventTarget.prototype.addEventListener = addEventListenerProxy;
    document.addEventListener = addEventListenerProxy;

    const _observe = MutationObserver$1.prototype.observe;
    const _disconnect = MutationObserver$1.prototype.disconnect;
    const observeProxy = new Proxy(_observe, {
      apply(target, thisArg, argumentsList) {
        Reflect.apply(target, thisArg, argumentsList);
        clenaupEventArray.push(() => {
          try {
            _disconnect.apply(thisArg, argumentsList);
          } catch (e) {}
        });
      }
    });
    MutationObserver$1.prototype.observe = observeProxy;
  }

  function cleanupEvents(iframe) {
    let func;
    const length = clenaupEventArray.length;
    while ((func = clenaupEventArray.pop())) func();

    // 注：不再使用 setTimeout(';') + 全量 clearTimeout 的「清空全部定时器」写法——
    // 它违反 MV3 扩展 CSP（unsafe-eval），会被阻止并抛错；且翻页 iframe 每次重建，
    // 其内部定时器随 iframe 销毁自然失效，无需全量清除。

    try {
      unsafeWindow.$(unsafeWindow).off();
      unsafeWindow.$(document).off();
    } catch (e) {}
  }

  if (window.name === 'mynovelreader-iframe') {
    unsafeWindow.$cleanupEvents = cleanupEvents;
  }

  Object$1.defineProperty(Navigator.prototype, 'platform', {
    get: function platform() {
      return ''
    }
  });

  console$1.clear = () => {};

  /** @enum {number} */
  const RequestStatus = {
    Idle: 0,
    Loading: 1,
    Finish: 2,
    Fail: 3
  };

  const iframeHeight = unsafeWindow.innerHeight;

  class BaseRequest {
    /**@param { import("../typings/小说阅读助手").SiteConfig } siteInfo */
    constructor(siteInfo) {
      this.errorHandle = () => {};
      this.finishHandle = () => {};
      // 站点规则
      this.siteInfo = siteInfo;
    }

    setErrorHandle(func) {
      this.errorHandle = func;
    }

    setFinishHandle(func) {
      this.finishHandle = func;
    }
  }

  class HttpRequest extends BaseRequest {
    constructor(siteInfo) {
      super(siteInfo);
      this.status = RequestStatus.Idle;
      this.doc = null;
    }

    async send(url, referer) {
      this.status = RequestStatus.Loading;
      this.doc = null;
      const options = {
        url,
        method: 'GET',
        overrideMimeType: 'text/html;charset=' + document.characterSet,
        timeout: config.xhr_time
      };

      if (referer) {
        options.headers = { Referer: referer };
      }

      let retry = 3;
      let error = null;

      while (retry--) {
        try {
          const res = await Request(options);
          this.doc = parseHTML(res.responseText);
          this.lastStatus = res.status;
          this.lastFinalUrl = res.finalUrl;
          this.rawLen = (res.responseText || '').length;
          this.rawHead = (res.responseText || '').replace(/\s+/g,' ').slice(0, 200);
          this.status = RequestStatus.Finish;
          this.finishHandle();
          break
        } catch (e) {
          error = e;
          C.error(`HttpRequest 请求过程出现异常，第 ${3 - retry} 次请求`, error);
        }
      }

      if (!this.doc) {
        this.status = RequestStatus.Fail;
        this.errorHandle();
        C.error('HttpRequest 请求失败', error);
      }

      return this.doc
    }

    getDocument() {
      this.status = RequestStatus.Idle;
      return this.doc
    }

    hide() {}
    show() {}
  }

  class IframeRequest extends BaseRequest {
    constructor(siteInfo) {
      super(siteInfo);
      this.status = RequestStatus.Idle;
      this.iframe = null;
      this.doc = null;
      this.win = null;
    }

    get display() {
      return this.iframe && !this.iframe.style.display
    }

    async send(url) {
      if (!this.iframe) {
        this.iframe = createIframe(this.loaded.bind(this), this.siteInfo);
      }
      this.status = RequestStatus.Loading;
      this.doc = this.win = null;

      if (!this.display) {
        this.show();
      }

      const src = url + '#mynovelreader';

      if (this.iframe.src === src) {
        this.iframe.setAttribute('src', 'about:blank');
        await sleep(100);
        this.iframe.setAttribute('src', src);
      } else {
        this.iframe.setAttribute('src', src);
      }

      return new Promise(resolve => (this.resolve = resolve))
    }

    async loaded() {
      var myToken = (this._loadToken = (this._loadToken || 0) + 1);
      this.doc = this.iframe.contentDocument;
      this.win = this.iframe.contentWindow;

      if (!this.doc) {
        this.status = RequestStatus.Fail;
        this.hide();
        this.errorHandle();
        this.resolve(null);
        C.error('IframeRequest 请求过程出现异常');
        return
      }

      this.win.dispatchEvent(new WheelEvent('mousewheel', { deltaY: -100 }));
      this.win.scrollTo(0, this.doc.body.scrollHeight - this.win.innerHeight * 2);

      if (this.siteInfo.startLaunch) {
        this.siteInfo.startLaunch($(this.doc));
      }

      // 正文就绪等待：同源 iframe 内轮询正文容器（起点 202 JS 挑战需在真实浏览器环境执行后才渲染正文）
      if (this.siteInfo.contentSelector) {
        var cs = this.siteInfo.contentSelector;
        var need = this.siteInfo.waitContentText || 200;
        var dl = Date.now() + (this.siteInfo.waitTimeout || 12000);
        while (Date.now() < dl) {
          if (myToken !== this._loadToken) return;  // 期间发生新导航（挑战自我跳转），放弃本次
          var ce = this.doc.querySelector(cs);
          var cl = ce ? ce.textContent.replace(/\s+/g, '') : '';
          if (ce && cl.length >= need) break;
          await sleep(200);
        }
      } else if (this.siteInfo.mutationSelector) {
        await observeElement(this.doc, this.siteInfo);
      } else {
        const timeout = this.siteInfo.timeout || 0;
        if (timeout) {
          await sleep(timeout);
        }
      }
      if (myToken !== this._loadToken) return;
      this.hide();
      this.status = RequestStatus.Finish;
      this.finishHandle();
      this.resolve(this.doc);
    }

    getDocument() {
      this.status = RequestStatus.Idle;
      return this.doc
    }

    hide() {
      this.iframe.style.display = 'none';
    }

    show() {
      this.iframe.style.display = '';
    }
  }

  function createIframe(onload, { iframeSandbox, withReferer }) {
    const iframe = document.createElement('iframe');
    iframe.name = 'mynovelreader-iframe';
    iframe.style.cssText = `
    width:100%;
    height:${iframeHeight}px;
    border:0!important;
    margin:0!important;
    padding:0!important;
    visibility:hidden!important;
    display:none;
  `;
    if (Setting.preloadNextPage && !withReferer) {
      iframe.referrerPolicy = 'no-referrer';
    }
    if (iframeSandbox !== void 0) {
      iframe.sandbox = iframeSandbox;
    }
    document.body.appendChild(iframe);
    iframe.onload = onload;
    return iframe
  }

  function mousedownEventTest() {
    let clicked;
    const $div = $('<div>')
      .on('mousedown', () => (clicked = true))
      .appendTo('html');
    $div[0].dispatchEvent(new MouseEvent('mousedown'));
    $div.remove();
    if (!clicked) {
      C.error(
        'mousedown 事件测试失败，请检查浏览器是否有扩展或脚本（尤其是右键/复制限制解除类）与 小说阅读助手 冲突！'
      );
    }
  }

  function minFontSizeTest() {
    const $div = $('<div>')
      .text('阅读模式')
      .css('font-size', '12px')
      .appendTo('html');
    const fontSize = +getComputedStyle($div[0]).fontSize.slice(0, -2);
    $div.remove();
    if (fontSize > 12) {
      C.warn('浏览器最小字号超过 12px ，将会导致阅读模式按钮文字显示位置异常！');
    }
  }


  function envCheckInit() {
    mousedownEventTest();
    minFontSizeTest();
  }

  // =====================================================================
  // [模块 M12] 主应用 App$1
  // 职责：init / launch / processPage / prepDocument / initDocument /
  //       registerControls / registerKeys / 自动滚动 / doRequest / loaded / addNextPage
  // 依赖：M2-M11 全部模块
  // =====================================================================
  var App$1 = {
      isEnabled: false,
      parsedPages: {},
      pageNum: 1,
      paused: false,
      curPageUrl: location.href,
      requestUrl: null,
      lastRequestUrl: null,
      iframe: null,
      remove: [],
      // 滚动激活相关
      curFocusElement: null,
      curFocusIndex: 1,
      // 站点字体信息
      siteFontInfo: null,
      /**@type { HttpRequest | IframeRequest } */
      request: null,
      /**@type { HttpRequest } */
      httpRequest: null,
      /**@type { IframeRequest } */
      iframeRequest: null,
      // 站点规则
      site: null,
      preloadNextPagePromiseResolve: null,

      init: async function() {
          if (["mynovelreader-iframe", "superpreloader-iframe"].indexOf(window.name) != -1) { // 用于加载下一页的 iframe
              return;
          }

          if (location.href.indexOf('#mynovelreader') > -1) {
              history.replaceState({}, '', location.href.replace('#mynovelreader', ''));
              return
          }

          let parent = window;
          let nestCount = 0;

          while (parent !== window.top) {
              nestCount++;
              parent = parent.parent;
          }

          if (nestCount > 2) {
              C.error('窗口的嵌套层级过深。');
              return
          }

          // 浏览器环境自检
          envCheckInit();

          // 手动调用
          var readx = App$1.launch;

          try {
              exportFunction(readx, unsafeWindow, {defineAs: "readx"});
          } catch(ex) {
              C.error('无法定义 readx 函数');
          }


          App$1.loadCustomSetting();
          App$1.site = App$1.getCurSiteInfo();

          // 等待 DOMContentLoaded 事件触发
          if (!App$1.site.fastboot) {
              await DOMContentLoaded();
          }

          if (App$1.site.startLaunch) {
              try {
                  App$1.site.startLaunch($(document));
              } catch (e) {
                  C.error("执行startLaunch函数出错", e);
              }
          }

          var autoLaunch = App$1.isAutoLaunch();

          if (autoLaunch === -1) {
              return;
          } else if (autoLaunch) {
              if (App$1.site.mutationSelector) { // 特殊的启动：等待js把内容生成完毕
                  await observeElement(document, App$1.site);
              } else if (App$1.site.timeout) { // 延迟启动
                  await sleep(App$1.site.timeout);
              }
              if (!App$1.site.fastboot) {
                  await domMutation();
              }
              await App$1.launch();
          } else {
              await domMutation();
          }
      },
      loadCustomSetting: function() {
          var customRules;
          try {
              customRules = JSON.parse(Setting.customSiteinfo || '[]');
          } catch (e) {
              C.error('载入自定义站点配置错误', e);
          }

          // 内置常见小说站保底规则（自用扩展；用户自定义规则优先，置于其后，getCurSiteInfo 按 find 顺序匹配）
          var builtinRules = [
              {
                  url: /^https?:\/\/([a-z0-9-]+\.)*weimangguo\.com\//i,
                  name: "微妙看书",
                  contentSelector: "#nr_content, .nr_content, #nr, .nr_nr, #chaptercontent, #booktxt, #htmlContent, .txtnav, #pagecontent, #content, .content",
                  nextSelector: "a:contains('下一页'), a:contains('下一章'), a:contains('下页'), a:contains('下章'), a[rel='next']"
              }
          ];

          if (Array.isArray(customRules)) {
              Rule.customRules = customRules.concat(builtinRules);
          } else {
              Rule.customRules = builtinRules;
          }
      },
      getCurSiteInfo: function() {
          var rules = Rule.customRules.concat(Rule.specialSite);
          var locationHref = location.href;

          var info = rules.find(function(x) {
              return toRE(x.url).test(locationHref);
          });

          if (!info) {
              info = {};
          } else {
          }
          return info;
      },
      isAutoLaunch: function() {
          // 站点级白名单模型：未启用该站阅读器 → 完全不处理（不进入、不显示按钮，保持原网页）
          if (!isSiteEnabled()) return -1;
          // 已启用 → 自动进入阅读模式；想退出/停用 → 点「退出」后该站移出白名单
          return true;
      },
      launch: async function() {
          // 只解析一次，防止多次重复解析一个页面
          if (document.body && document.body.getAttribute("name") == "小说阅读助手") {
              return await App$1.toggle();
          }

          if (!App$1.site) {
              App$1.site = App$1.getCurSiteInfo();
          }

          if (App$1.site.startFilter) {
              try {
                  App$1.site.startFilter();
              } catch (ex) {
                  C.error('运行 startFilter function 错误', ex);
              }
          }

          // 使用站点字体
          if (App$1.site.useSiteFont) {
              if (typeof App$1.site.useSiteFont === 'boolean') {
                  App$1.siteFontInfo = App$1.getSiteFontInfo();
              } else if (typeof App$1.site.useSiteFont === 'string') {
                  if (!App$1.site.useSiteFont.trim().endsWith(',')) {
                      App$1.site.useSiteFont = App$1.site.useSiteFont.trim() + ',';
                  }
                  App$1.siteFontInfo = { siteFontFamily: App$1.site.useSiteFont.trim() };
              }
          }

          var parser = new Parser(App$1.site, document);
          var hasContent = !!parser.hasContent();
          if (hasContent) {
              cleanupEvents();
              document.body.setAttribute("name", "小说阅读助手");
              App$1.parsedPages[window.location.href] = true;
              await parser.getAll();
              await App$1.processPage(parser);
          } else {
              App$1.isEnabled = true;
              $('.readerbtn').remove();
              await UI.selectButton();
              C.error("当前页面没有找到内容，可点击「选择正文」添加本站规则");
          }

          // 初始化, 取消页面限制等
          if (App$1.site.fInit)
              App$1.site.fInit();
      },
      saveCurrentSiteRule: function(selector, nextSelector) {
          try {
              var host = String(location.hostname).replace(/\./g, '\\.');
              var hostRe = '^https?://' + host + '(?::\\d+)?(?:/.*)?$';
              var name = String(location.hostname).replace(/"/g, '');
              var rule = {
                  url: hostRe,
                  contentSelector: String(selector).replace(/"/g, '\\"'),
                  name: name
              };
              if (nextSelector) {
                  rule.nextSelector = String(nextSelector).replace(/"/g, '\\"');
              }

              // 新规则放在最前，并按站点名去重（保持原有"放最前"行为）
              var rules = [rule].concat((Rule.customRules || []).filter(function(r) {
                  return r && r.name !== name;
              }));

              Rule.customRules = rules;
              Setting.customSiteinfo = JSON.stringify(rules);

              UI.notice('已保存本站为阅读站点，刷新后自动识别', 3000);
          } catch (ex) {
              C.error('保存本站规则失败', ex);
          }
      },
      processPage: async function(parser) {
          // 对 Document 进行处理
          document.body.innerHTML = '';
          App$1.prepDocument();
          App$1.initDocument(parser);



          // cache vars
          App$1.$doc = $(document);
          App$1.$menuBar = App$1.$doc.find("#menu-bar");
          App$1.$menu = App$1.$doc.find("#menu");
          App$1.$content = App$1.$doc.find("#mynovelreader-content");
          App$1.$loading = App$1.$doc.find("#loading");

          App$1.$menuHeader = App$1.$menu.find("#chapter-list");
          App$1.$chapterList = App$1.$menu.find("#chapter-list");

          App$1.indexUrl = parser.indexUrl;
          App$1.prevUrl = parser.prevUrl; // 第一个上一页

          App$1.oArticles = [];  // 原始的内容，用于替换的无需刷新
          App$1.parsers = [];

          // 加入上一章的链接
          if (parser.prevUrl) {
              $("<li>")
                  .addClass('chapter')
                  .append(
                      $("<div>")
                      .attr({
                          "realHref": parser.prevUrl,
                          "onclick": "return false;"
                      })
                      .text("上一章")
                  )
                  .prependTo(App$1.$chapterList);
          }

          // 插入站点样式
          if (App$1.site.style) {
              GM_addStyle(App$1.site.style);
          }

          // 插入站点字体样式
          if (App$1.site.useSiteFont && App$1.siteFontInfo) {
              const { internal } = App$1.siteFontInfo;
              if (internal) {
                  $('<style class="noRemove siteFont">')
                      .text(internal.map(e => e.cssText).join('\n'))
                      .appendTo('head');
              }
              // 插入外部样式表可能会影响阅读界面样式
              //     }
              // }
          }

          App$1.appendPage(parser, true);

          App$1.registerControls();

          // UI 的初始化
          UI.init();

          App$1.curFocusElement = $("article:first").get(0); // 初始化当前关注的 element
          App$1.requestUrl = parser.nextUrl;
          App$1.isTheEnd = parser.isTheEnd;

          App$1.isEnabled = true;
          logStore('info', '启动：站点 ' + location.hostname + '，进入阅读模式');

          // // 如果已经把当前焦点链接添加到历史记录，则滚动到顶部
          // }

          history.scrollRestoration = 'manual';
          window.scrollTo(0, 0);

          // 初始化 request
          App$1.initRequest();

          // 有些图片网站高度随着图片加载而变长
          setTimeout(App$1.scroll, 1000);

          App$1.cleanAgain();

          if (Setting.preloadNextPage) {
              await App$1.doRequest();
          }
      },
      initRequest: function() {
          App$1.httpRequest = new HttpRequest(App$1.site);
          App$1.iframeRequest = new IframeRequest(App$1.site);

          App$1.request = App$1.site.useiframe ? App$1.iframeRequest : App$1.httpRequest;

          App$1.httpRequest.setErrorHandle(() => App$1.scrollForce());
          App$1.httpRequest.setFinishHandle(() => App$1.scroll());

          App$1.iframeRequest.setErrorHandle(() => App$1.scrollForce());
          App$1.iframeRequest.setFinishHandle(() => App$1.scroll());
      },
      prepDocument: function() {
          window.onload = function() {};

          // 防止阅读模式内元素 focus 导致页面滚动（仅阅读模式激活时生效，避免污染页面全局行为；防重复定义）
          if (!HTMLElement.prototype.focus.__mnrFocus) {
            var _focus = HTMLElement.prototype.focus;
            var _focusWrapped = function focus() { _focus.call(this, { preventScroll: true }); };
            _focusWrapped.__mnrFocus = true;
            HTMLElement.prototype.focus = _focusWrapped;
          }

          // 破解右键限制
          var doc = document;
          var bd = doc.body;
          bd.onselectstart = bd.oncopy = bd.onpaste = bd.oncontextmenu = bd.ondragstart = doc.onselectstart = doc.oncopy = doc.onpaste = doc.oncontextmenu = null;
          doc.onselectstart = doc.oncontextmenu = doc.onmousedown = function() {
              return true;
          };

          doc = document.wrappedJSObject || document;
          doc.onmouseup = null;
          doc.onmousedown = null;
          doc.oncontextmenu = null;

          var arAllElements = document.getElementsByTagName('*');
          for (var i = arAllElements.length - 1; i >= 0; i--) {
              var elmOne = arAllElements[i];
              elmOne = elmOne.wrappedJSObject || elmOne;
              elmOne.onmouseup = null;
              elmOne.onmousedown = null;
          }


          // remove body style
          $('link[rel="stylesheet"], script').remove();
          $('html, body')
              .removeAttr('style')
              .removeAttr('bgcolor');

          $('style:not(.noRemove)').filter(function() {
              var $style = $(this);
              if($style.text().indexOf('#cVim-link-container') != -1) {  // chrome 的 cVim 扩展
                  return false;
              }
              return true;
          }).remove();

          // 移除 html 标签中非 head 和 body 的元素
          $('html').children().filter(function () {
              let tagName = $(this).prop('tagName').toLowerCase();
              if (tagName !== 'head' && tagName !== 'body') {
                  return true
              }
              return false
          }).remove();
      },
      initDocument: function(parser) {
          document.title = parser.docTitle;

          document.body.innerHTML = $.nano(tpl_mainHtml, parser);
      },
      clean: function() {
          $('body > *:not("#container, .readerbtn, .noRemove, #reader_preferences, iframe[name=\'mynovelreader-iframe\']")').remove();
          $('link[rel="stylesheet"]:not(.noRemove)').remove();
          $('body, #container').removeAttr('style').removeAttr('class');

          if (unsafeWindow.jQuery && location.host.indexOf('qidian') > 0) {
              unsafeWindow.jQuery(document).off("selectstart").off("contextmenu");
          }
      },
      cleanAgain: function() {
          // }

          // 再次移除其它不相关的，起点，纵横中文有时候有问题
          setTimeout(App$1.clean, 2000);
          setTimeout(App$1.clean, 5000);
          setTimeout(App$1.clean, 8000);
          // TM 用 addEventListener('load') 有问题
          window.onload = function() {
              App$1.clean();
              setTimeout(App$1.clean, 500);
          };
      },
      toggle: async function() {
          if (App$1.isEnabled) { // 退出
              logStore('info', '退出阅读模式');
              // 站点级白名单模型：退出 = 将该站点移出白名单。之后该站默认保持原网页，
              // 页面内不再显示「阅读模式」/「设置」按钮；想再进入 → 点扩展图标重新启用。
              try {
                  var _en = GM_getValue('mnr_enabled_sites', []) || [];
                  if (!Array.isArray(_en)) _en = [];
                  var _i = _en.indexOf(location.hostname);
                  if (_i >= 0) {
                      _en.splice(_i, 1);
                      GM_setValue('mnr_enabled_sites', _en);
                  }
              } catch (e) {}

              location.href = App$1.activeUrl || App$1.curPageUrl;
              location.reload();
          } else {
              App$1.isEnabled = true;
              await App$1.launch();
          }
      },
      removeListener: function() {
          App$1.remove.forEach(function(_remove) {
              _remove();
          });
      },
      appendPage: function(parser, isFirst) {
          var chapter = $("article:last");
          if (chapter.length && parser.isSection) { // 每次获取的不是一章，而是一节
              var lastText = chapter.find("p:last").remove().text().trimRight();
              var newPage = parser.content.replace(/<p>\s+/, "<p>" + lastText);

              chapter.append(newPage);

          } else {
              chapter = $("<article>")
                  .attr("id", "page-" + App$1.pageNum)
                  .append(
                      $("<h1>").addClass("title").text(UI.decodeUnicodeStr(parser.chapterTitle))
                  )

                  .append(parser.content)
                  .appendTo(App$1.$content);


              // 添加到章节列表
              var _ct = UI.decodeUnicodeStr(parser.chapterTitle);
              var chapterItem = $("<li>")
                  .addClass('chapter')
                  .append(
                      $("<div>")
                      .attr({
                          href: "#page-" + App$1.pageNum,
                          "realHref": parser.curPageUrl,
                          onclick: "return false;",
                          title: _ct
                      })
                      .text(_ct)
                  )
                  .prependTo(App$1.$chapterList);

              if (isFirst) {
                  chapterItem.addClass('active');
              }

              App$1.resetCache();
          }

          App$1.pageNum += 1;

          App$1.oArticles.push(chapter[0].outerHTML);
          App$1.parsers.push(parser);

      },
      resetCache: function() {  // 更新缓存变量
          App$1.menuItems = App$1.$chapterList.find("div");
          App$1.scrollItems = $("article[id^=page-]");
          App$1._initChapterObserver();
      },
      // 4.4: 站点规则 bookIdPattern —— 同一本书不同章节共用一条阅读进度
      getBookKey: function(){
          var info = App$1.site || {};
          if (info.bookIdPattern) {
              try {
                  var m = location.href.match(toRE(info.bookIdPattern));
                  if (m && m[1]) return m[1];
              } catch (e) {}
          }
          return location.href;
      },
      registerControls: function() {
          // 内容滚动
          var _scrollTick = false;
          var throttled = function() {
              if (_scrollTick) return;
              _scrollTick = true;
              setTimeout(function() { _scrollTick = false; }, 200);
              App$1.scroll();
          };
          $(window).scroll(throttled);

          // [新增] 阅读进度记忆：滚动时（原生 scroll + rAF 节流）保存当前章节位置（同名 URL 刷新/重开后自动回到上次位置）
          var _progressTick = false;
          var saveProgress = function() {
              if (_progressTick || !App$1.isEnabled) return;
              _progressTick = true;
              requestAnimationFrame(function() {
                  _progressTick = false;
                  try {
                      GM_setValue('mnr_read_progress', { url: App$1.getBookKey(),
                          top: window.scrollY || window.pageYOffset || document.documentElement.scrollTop });
                  } catch (e) {}
              });
          };
          window.addEventListener('scroll', saveProgress);

          // [新增] 阅读进度记忆：恢复上次阅读位置
          try {
              var progress = GM_getValue('mnr_read_progress', null);
              if (progress && progress.url === App$1.getBookKey() && progress.top > 0) {
                  logStore('info', '恢复阅读进度：位置 ' + progress.top);
                  setTimeout(function() {
                      window.scrollTo(0, progress.top);
                  }, 50);
              }
          } catch (e) {}

          App$1.registerKeys();

          App$1.$content.on("dblclick", function() {
              App$1.toggleAutoScroll();
          });

          // 左侧章节列表

          App$1.$menuBar.click(function() {
              UI.hideMenuList();
          });

          App$1.$doc.on("mousedown", "#chapter-list div", function(event) {
              switch (event.which) {
                  case 1:
                      var href = $(this).attr("href");
                      if (href) {
                          App$1.scrollToArticle($(href));
                      } else {
                          logStore('info', '章节切换：' + $(this).attr("realHref"));
                          location.href = $(this).attr("realHref");
                      }
                      break;
                  case 2: // middle click
                      App$1.openUrl($(this).attr("realHref"));
                      break;
              }
          });


      },
      registerKeys: function() {
          // 全部快捷键统一为原生 keydown 监听（替代 keymaster；可改键动态读取当前 Setting 值，改键即时生效）
          $(document).off('keydown.mnrKeys').on('keydown.mnrKeys', function(e) {
              var t = e.target;
              if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
              var k = String(e.key || '');

              // 两个可改键（切换章节列表 / 打开设置）
              var hk = String(Setting.hideMenuListKey || '').trim().toLowerCase();
              var ok = String(Setting.openPreferencesKey || '').trim().toLowerCase();
              if (hk && k.toLowerCase() === hk) {
                  // 设置面板打开时不处理章节列表快捷键，避免干扰设置操作
                  if (UI.$prefs) return;
                  UI.hideMenuList(); e.preventDefault(); e.stopPropagation(); return;
              }
              if (ok && k.toLowerCase() === ok) {
                  // 打开设置快捷键作为开关：面板开着则关闭，关着则打开
                  if (UI.$prefs) { UI.hide(); } else { UI.preferencesShow(); }
                  e.preventDefault(); e.stopPropagation(); return;
              }

              switch (k) {
                  case 'Enter': // 打开小说主页
                      if (UI.$prefs) return;
                      App$1.openUrl(App$1.indexUrl, "主页链接没有找到");
                      e.preventDefault(); e.stopPropagation();
                      break;
                  case 'ArrowLeft': // 上一章 / 上一段
                      var sp = $(window).scrollTop();
                      if (sp === 0) {
                          location.href = App$1.prevUrl;
                      } else {
                          var ot = $(App$1.curFocusElement).offset().top;
                          // 在视野窗口内
                          if (ot > sp && ot < (sp + $(window).height())) {
                              App$1.scrollToArticle(App$1.curFocusElement.previousSibling || 0);
                          } else {
                              App$1.scrollToArticle(App$1.curFocusElement);
                          }
                      }
                      e.preventDefault();
                      break;
                  case 'ArrowRight': // 下一章 / 下一段
                      if (App$1.getRemain() <= 4) {
                          location.href = App$1.lastRequestUrl || App$1.requestUrl;
                      } else {
                          App$1.scrollToArticle(App$1.curFocusElement.nextSibling || App$1.$doc.height());
                      }
                      e.preventDefault(); e.stopPropagation();
                      break;
                  case 'Escape': // 关闭设置面板
                      if (UI.$prefs) {
                          UI.hide();
                          e.preventDefault();
                      }
                      break;
                  case ',': // PageUp 向上滚动一屏
                      window.scrollTo(window.scrollX, window.scrollY - window.innerHeight * .9);
                      e.preventDefault();
                      break;
                  case '.': // PageDown 向下滚动一屏
                      window.scrollTo(window.scrollX, window.scrollY + window.innerHeight * .9);
                      e.preventDefault();
                      break;
                  case ']': // 下一章（快捷）
                      if (App$1.getRemain() <= 4) {
                          location.href = App$1.lastRequestUrl || App$1.requestUrl;
                      } else {
                          App$1.scrollToArticle(App$1.curFocusElement.nextSibling || App$1.$doc.height());
                      }
                      e.preventDefault();
                      break;
                  case '[': // 上一章（快捷）
                      if (App$1.prevUrl) {
                          location.href = App$1.prevUrl;
                      }
                      e.preventDefault();
                      break;
              }
          });
      },
      scrollToArticle: function(elem) {
          var offsetTop;
          if (typeof elem == "number") {
              offsetTop = elem;
          } else {
              offsetTop = $(elem).offset().top - parseInt($(elem).css("margin-top"), 10);
          }

          if (Setting.scrollAnimate) {
              window.scrollTo({ top: offsetTop, behavior: 'smooth' });
          } else {
              window.scrollTo({ top: offsetTop, behavior: 'auto' });
          }
      },
      openUrl: function(url, errorMsg) {
          if (url) {
              setTimeout(function() {
                  GM_openInTab(url, false);
              }, 0);
          } else if (errorMsg) {
              UI.notice(errorMsg);
          }
      },
      toggleAutoScroll: function() {
          if (App$1.autoScrolling) {
              App$1.stopAutoScroll();
          } else {
              App$1.startAutoScroll();
          }
      },
      startAutoScroll: function() {
          App$1.autoScrolling = true;
          logStore('info', '自动滚动：启动（速度 ' + Setting.autoScrollSpeed + ' px/s）');
          UI.notice('<b>自动滚动</b>已<span style="color:red!important;"><b>开始</b></span>');
          var speed = Setting.autoScrollSpeed;
          var lastTs = null, acc = 0;
          function tick(ts) {
              if (!App$1.autoScrolling) { App$1.autoScrollTimer = null; return; }
              if (lastTs === null) lastTs = ts;
              var dt = (ts - lastTs) / 1000;
              lastTs = ts;
              // 接近底部自动加载下一页（方案A：预加载开启时400px预读；关闭时触底0px才加载）
              if (Setting.preloadNextPage && App$1.getRemain() < Setting.remain_height) {
                  App$1.scrollForce();
              } else if (!Setting.preloadNextPage && App$1.getRemain() <= 4) {
                  App$1.scrollForce();
              }
              // 按时间差逐帧滚动、像素累加，平滑连续
              acc += speed * dt;
              var whole = Math.floor(acc);
              if (whole > 0) { window.scrollBy(0, whole); acc -= whole; }
              App$1.autoScrollTimer = requestAnimationFrame(tick);
          }
          App$1.autoScrollTimer = requestAnimationFrame(tick);
      },
      stopAutoScroll: function() {
          App$1.autoScrolling = false;
          if (App$1.autoScrollTimer) {
              cancelAnimationFrame(App$1.autoScrollTimer);
              App$1.autoScrollTimer = null;
          }
          logStore('info', '自动滚动：停止');
          UI.notice('<b>自动滚动</b>已<span style="color:red!important;"><b>暂停</b></span>');
      },
      scroll: async function() {
          if (App$1.request.display && Math.floor(App$1.getRemain() - iframeHeight) < 0) {
              window.scrollTo(0, document.body.scrollHeight - window.innerHeight - iframeHeight  + 51);
          }

          if (!App$1.paused) {
              // 方案A：预加载开启时，滚动接近底部(400px)后台预读下一页；预加载关闭时，触底(0px)才加载下一页
              if (Setting.preloadNextPage && App$1.getRemain() < Setting.remain_height) {
                  await App$1.scrollForce();
              } else if (!Setting.preloadNextPage && App$1.getRemain() <= 4) {
                  await App$1.scrollForce();
              }
          }

          if (App$1.isTheEnd) {
              App$1.$loading.html("已到达最后一页...").show();
          }

      },
      scrollForce: async function() {
          switch (App$1.request.status) {
              case RequestStatus.Idle:
                  await App$1.doRequest();
                  break;
              case RequestStatus.Finish:
                  await App$1.loaded(App$1.request.getDocument());
                  break;
              case RequestStatus.Fail:
                  const nextUrl = App$1.curPageUrl;
                  logStore('error', '翻页失败：无法获取下一页（' + nextUrl + '）');
                  App$1.$loading.html("<a href='" + nextUrl + "'>无法获取下一页，请手动点击</a>").show();
                  break;
          }
      },
      updateCurFocusElement: function(cur) { // 滚动激活章节列表（由 IntersectionObserver 提供当前章节）
          if (!cur || !cur.id) return;
          var id = cur.id;

          if (App$1.lastId !== id) {
              App$1.lastId = id;

              var activeItem = App$1.menuItems.filter("[href=#" + id + "]"),
                  activeUrl = activeItem.attr("realHref");

              // Set/remove active class
              App$1.menuItems.parent().removeClass("active");
              activeItem.parent().addClass("active");

              App$1.curFocusElement = cur;
              App$1.curFocusIndex = App$1.scrollItems.index(cur);
              App$1.activeUrl = activeUrl;

              if (Setting.addToHistory) {
                  var idm = id.match(/\d+/);
                  var curParser = idm ? App$1.parsers[idm[0] - 1] : null;  // 当前是第几个
                  if (curParser && curParser.docTitle && activeUrl) {
                      var curTitle = curParser.docTitle;
                      // 有域名的限制，起点过渡到 vip 章节无法生效
                      var url = activeUrl.replace('http://read.qidian.com', '');
                      try {
                          history.pushState(null, curTitle, url);
                      } catch (e) {
                          C.error('添加下一页到历史记录失败', e);
                      }
                      document.title = curTitle;
                  }
              }
          }
      },
      _initChapterObserver: function() { // IntersectionObserver 监听章节，替代 scroll+offsetTop 判定当前章节
          if (App$1._chapterObserver) App$1._chapterObserver.disconnect();
          var observer = new IntersectionObserver(function(entries) {
              var cur = null, best = Infinity, c = window.innerHeight / 2;
              for (var i = 0; i < entries.length; i++) {
                  var en = entries[i];
                  if (!en.isIntersecting) continue;
                  var rect = en.boundingClientRect;
                  var d = Math.abs((rect.top + rect.height / 2) - c);
                  if (d < best) { best = d; cur = en.target; }
              }
              if (cur) App$1.updateCurFocusElement(cur);
          });
          App$1.scrollItems.each(function() { observer.observe(this); });
          App$1._chapterObserver = observer;
      },
      getRemain: function() {
          var scrollHeight = Math.max(document.documentElement.scrollHeight,
              document.body.scrollHeight);
          var remain = scrollHeight - window.innerHeight - window.scrollY;
          return remain;
      },
      doRequest: async function() {
          if (App$1.isRequesting) {
              // 已有请求在进行：短暂延迟后自动重试，避免请求被静默丢弃
              if (!App$1._doRequestRetry) {
                  App$1._doRequestRetry = setTimeout(function() {
                      App$1._doRequestRetry = null;
                      App$1.doRequest();
                  }, 600);
              }
              return;
          }
          App$1.isRequesting = true;

          var nextUrl = App$1.requestUrl;
          const referer = App$1.lastRequestUrl || App$1.curPageUrl;
          App$1.lastRequestUrl = App$1.requestUrl;

          if (nextUrl && !App$1.isTheEnd && !(nextUrl in App$1.parsedPages)) {
              App$1.curPageUrl = App$1.requestUrl;
              App$1.requestUrl = null;

              var useiframe = App$1.site.useiframe;

              App$1.$loading
                  .show()
                  .html("")
                  .append($("<img>").attr("src", "data:image/gif;base64,R0lGODlhEAAQAMQAAPf39+/v7+bm5t7e3tbW1s7OzsXFxb29vbW1ta2traWlpZycnJSUlIyMjISEhHt7e3Nzc2tra2NjY1paWlJSUkpKSkJCQjo6OjExMSkpKSEhIRkZGRAQEAgICAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJBQAeACwAAAEADwAOAAAFdaAnet20GAUCceN4LQlyFMRATC3GLEqM1gIc6dFgPDCii6I2YF0eDkinxUkMBBAPBfLItESW2sEjiWS/ItqALJGgRZrNRtvWoDlxFqZdmbY0cVMdbRMWcx54eSMZExQVFhcYGBmBfxWPkZQbfi0dGpIYGiwjIQAh+QQJBQAeACwAAAEADwAOAAAFeKAnep0FLQojceOYQU6DIsdhtVoEywptEBRRZyKBQDKii+JHYGEkxE6LkyAMIB6KRKJpJQuDg2cr8Y7AgjHULCoQ0pUJZWO+uBGeDIVikbYyDgRYHRUVFhcsHhwaGhsYfhuHFxgZGYwbHH4iHBiUlhuYmlMbjZktIQAh+QQFBQAeACwAAAEADwAOAAAFe6Aneh1GQU9UdeOoTVIEOQ2zWG0mSVP0ODYF4iLq7HgaEaaRQCA4HsyOwhp1FgdDxFOZTDYt0cVQSHgo6PCIPOBWKmpRgdDGWCzQ8KUwOHg2FxcYYRwJdBAiGRgZGXkcC3MEjhkalZYTfBMtHRudnhsKcGodHKUcHVUeIQAh+QQJBQAeACwAAAEADwAOAAAFbKAnjp4kURiplmYEQemoTZMpuY/TkBVFVRtRJtJgMDoejaViWT0WiokHc2muMIoEY0pdiRCIgyeDia0OhoJnk8l4PemEh6OprxQFQkS02WiCIhd4HmoiHRx9ImkEA14ciISMBFJeSAQIEBwjIQAh+QQJBQAeACwAAAEADwAOAAAFd6Anel1WTRKFdeO4WRWFStKktdwFU3JNZ6MM5nLZiDQTCCTC4ghXrU7k4bB4NpoMpyXKNBqQa5Y7YiwWHg6WLFK4SWoW95JAMOAbI05xOEhEHWoaFyJ0BgYHWyIcHA4Fj48EBFYtGJKSAwMFFGQdEAgCAgcQih4hACH5BAkFAB4ALAAAAQAPAA4AAAV0oCeKG2ZVFtaNY6dh10lNU8Z2WwbLkyRpI85Gk+GQKr7JqiME3mYSjIe5WbE8GkhkMhVeR48HpLv5ihoOB9l4xTAYYw9nomCLOgzFoiJSEAoIFiIXCwkJC1YVAwMEfwUGBgeBLBMEAouOBxdfHA8HlwgRdiEAIfkECQUAHgAsAAABAA8ADgAABXOgJ4rdpmWZ1o0sZ2YYdlka63XuKVsVVZOuzcrDufQoQxzH1rFMJJiba8jaPCnSjW30lHgGhMJWBIl4D2DLNvOATDwPwSCxHHUgjseFOJAn1B4YDgwND0MTAWAFBgcICgsMUVwDigYICQt7NhwQCGELE1QhACH5BAkFAB4ALAAAAQAPAA4AAAV4oCeOHWdyY+p1JbdpWoam7fZmGYZtYoeZm46Ik7kYhZBBQ6PyWSoZj0FAuKg8mwrF4glQryIKZdL9gicTiVQw4Ko2aYrnwUbMehGJBOPhDAYECVYeGA8PEBNCHhOABgcJCgwNh0wjFQaOCAoLk1EqHBILmg8Vih4hACH5BAkFAB4ALAAAAQAPAA4AAAV6oCd6Hdmd5ThWCee+XCpOwTBteL6lnCAMLVFHQ9SIHgHBgaPyZDKYjcfwszQ9HMwl40kOriKLuDsggD2VtOcwKFibGwrFCiEUEjJSZTLhcgwGBwsYIhkUEhITKRYGCAkKDA0PiBJcKwoKCwwODxETRk0dFA8NDhIYMiEAIfkECQUAHgAsAAABAA8ADgAABXmgJ3rcYwhcN66eJATCsHEpOwXwQGw8rZKDGMIi6vBmokcswWFtNBvVQUdkcTJQj67AGmEyGU+hYOiKMGiP4oC4dDmXS1iCSDR+xYvFovF0FAoLDxgiGxYUFRY/FwsMDQ4PEhOTFH0jFw6QEBKcE5YrHRcTERIUGHghACH5BAkFAB4ALAAAAQAPAA4AAAV4oCd63GMAgfF04zgNQixjrVcJQz4QRLNxI06Bh7CILpkf0CMpGBLL0ebHWhwOl5qno/l5EGCtqAtUmMWeTNfzWCxoNU4maWs0Vq0OBpMBdh4ODxEaIhsXhxkjGRAQEhITExQVFhdRHhoTjo8UFBYbWnoUjhUZLCIhACH5BAkFAB4ALAAAAQAPAA4AAAV5oCd6HIQIgfFw42gZBDEMgjBMbXUYRlHINEFF1FEgEIqLyHKQJToeikLBgI44iskG+mAsMC0RR7NhNRqM8IjMejgcahHbM4E8Mupx2YOJSCZWIxlkUB0TEhIUG2IYg4tyiH8UFRaNGoEeGYgTkxYXGZhEGBWTGI8iIQA7"))
                  .append("<a href='" + nextUrl + "' tabindex='-1'>正在载入下一页" + (useiframe ? "(iframe)" : "") + "...</a>");

              await sleep(App$1.site.nDelay || 0);

              if (useiframe) {
                  App$1.request = App$1.iframeRequest;
              } else {
                  App$1.request = App$1.httpRequest;
              }
              
              if (App$1.site.withReferer) {
                  App$1.request.send(nextUrl, referer);
              } else {
                  App$1.request.send(nextUrl);
              }
      
          }

          // 延迟释放锁：保证相邻两次请求有最小间隔（1500ms，降低连续预加载触发站点风控的概率）
          setTimeout(function() {
              App$1.isRequesting = false;
          }, App$1.site.nDelay || 1500);
      },
      loaded: async function(doc) {
          var parser = new Parser(App$1.site, doc, App$1.curPageUrl);
          await parser.getAll();
          await App$1.addNextPage(parser);
      },
      addNextPage: async function(parser) {
          if (parser.content) {
              App$1.appendPage(parser);

              logStore('info', '翻页成功：' + App$1.curPageUrl + ' → ' + parser.nextUrl);

              App$1.requestUrl = parser.nextUrl;
              App$1.isTheEnd = parser.isTheEnd;

              await App$1.afterLoad();
          } else {
              App$1.removeListener();

              var msg = (parser.isTheEnd == 'vip') ?
                  'vip 章节，需付费。' :
                  '错误：没有找到下一页的内容。';
              logStore('error', '翻页失败：' + msg + '（' + App$1.curPageUrl + '）');
              App$1.$loading.html(
                  '<a href="' + App$1.curPageUrl + '">' + msg + '点此打开下一页。</a>')
                  .show();
          }

      },

      afterLoad: async function() {
          // 方案A：不再链式自动预载下一章——预加载改由滚动接近底部(400px)时触发一次，
          // 避免连续快速预载触发站点风控（起点等）；滚动触底时若已预载则直接续读
          // [修复] 懒加载正文：网站正文滚动到哪渲染到哪（尤其长章节），滚动渲染的新段落未经净化/优化，
          // 用 MutationObserver 监听正文容器，新段落渲染时重新应用净化+优化（仅首次挂接一次）
          this._initLazyContentFix();
      },

      // [修复] 懒加载正文优化：滚动/按需渲染的新段落未经过 applyContentSettings，需重新应用净化+优化
      _initLazyContentFix: function() {
          var self = this;
          if (self._lazyFixStarted) return;
          var $content = self.$content;
          if (!$content || !$content[0]) return;
          self._lazyFixStarted = true;
          var host = getUrlHost(location.href);
          var optTag = 'data-mnr-opt';
          // 完整优化替换器：与首次加载一致（含合并多行引号/按句分段等 getNormalizeMap 规则）
          var fullReplace = function(t, map) {
              for (var k in map) { t = t.replace(toRE(k), map[k]); }
              return t;
          };
          var obs = new MutationObserver(function(muts) {
              muts.forEach(function(m) {
                  if (m.type !== 'childList' || !m.addedNodes) return;
                  m.addedNodes.forEach(function(node) {
                      if (node.nodeType !== 1) return;
                      var $n = $(node);
                      if ($n.is('article')) return; // 脚本追加的翻页章节，已优化
                      var $p = $n.is('p') ? $n : $n.find('p').addBack().filter('p');
                      $p.each(function() {
                          var $this = $(this);
                          if ($this.attr(optTag)) return; // 已处理过
                          var text = $this.text();
                          if (!text.trim()) return;
                          var processed = applyContentSettings(text, host, fullReplace);
                          if (processed === text) { $this.attr(optTag, '1'); return; }
                          var paras = processed.split('\n').map(function(s){ return s.trim(); }).filter(Boolean);
                          if (paras.length) {
                              var html = paras.map(function(s){ return '<p ' + optTag + '="1">　　' + escapeHtml(s) + '</p>'; }).join('');
                              $this.replaceWith(html);
                          } else {
                              $this.attr(optTag, '1');
                          }
                      });
                  });
              });
          });
          obs.observe($content[0], { childList: true, subtree: true });
      },

      getSiteFontInfo: function () {
          const fonts = { external: [], internal: [], family: [] };
          const { external, internal, family } = fonts;

          // 获取所有的字体名字
          for (const font of document.fonts) {
              family.push(font.family);
          }

          // 获取外部 css 地址和内部 css 样式文本
          for (const styleSheet of document.styleSheets) {
              try {
                  for (const cssRule of styleSheet.cssRules) {
                      if (cssRule instanceof CSSFontFaceRule) {
                          const fontFamily = cssRule.style.fontFamily;
                          const cssText = cssRule.cssText;
                          if (!internal.find(o => o.fontFamily === fontFamily)) {
                              internal.push({ fontFamily, cssText });
                          }
                      }
                  }
              } catch (e) {
                  external.push(styleSheet.href);
              }
          }
          
          // 处理成 font-family 样式格式
          let familyList = [];

          // 内部样式优先
          internal.forEach(e => {
              familyList.push(e.fontFamily);
          });

          family.forEach(e => {
              if (!familyList.includes(e)) {
                  familyList.push(e);
              }
          });
          // 含空格字体名补双引号
          familyList = familyList.map(e => {
              if (e.includes(' ')) {
                  return `"${e}"`
              } else {
                  return e
              }
          });

          fonts.siteFontFamily = familyList.join(',') + ',';
          
          return fonts
      }
  };


  // =====================================================================
  // [模块 M13] 启动注入
  // 职责：存储预加载 → App$1.init() 启动 → 扩展增强监听（设置开关/遮罩关闭/
  //       onMessage）→ 兜底按钮
  // 依赖：M12 App$1、M10 UI
  // =====================================================================
  (async function(){
    // 预加载 chrome.storage 到 GM shim
    try { if (window.__GM_shim && window.__GM_shim.__loadAll) await window.__GM_shim.__loadAll(); }  catch(e){ try { logStore('error', '存储预加载失败', e); } catch (_) {} }

    // 启动模式：默认 auto（首次自动进入），用户可在设置面板选择 auto/manual 并持久化。
    // 不再每次注入强制覆盖（此前覆盖导致启动模式无法记忆）。
    try { await App$1.init(); }  catch(e){ try { logStore('error', '初始化失败', e); } catch (_) {} }

    // ============ 扩展增强：设置面板的打开/关闭不依赖 App$1.init 是否完整执行 ============
    // 根因：o 键 keydown 监听在 App$1.registerControls 里绑定，而 init() 在「站点未启用/
    //       autoLaunch===-1」时会提前 return，导致 keydown 未绑定；但设置面板可通过扩展
    //       图标（message → UI.preferencesShow，绕过 init）打开，于是出现「能开不能关」。
    // 修复：在扩展注入时就绑定独立的 o 键开关监听 + 点遮罩兜底 + Esc 兜底，始终可关。
    try {
      if (typeof window === 'undefined') throw new Error('no window');

      // 打开设置的默认/自定义快捷键（读 Setting，与 registerKeys 一致）
      function getPrefsKey() {
        try {
          var k = String(Setting.openPreferencesKey || '').trim().toLowerCase();
          return k || 'o';
        } catch (e) { return 'o'; }
      }

      // 独立 o 键开关监听：面板开→关，关→开（用捕获阶段，优先于 registerKeys，避免重复）
      document.addEventListener('keydown', function (e) {
        var t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
        var k = String(e.key || '').toLowerCase();
        if (k !== getPrefsKey()) return;
        // 未进入阅读模式时不响应设置快捷键（不进阅读模式即不影响当前标签页）
        var _inReader = !!(document.body && document.body.getAttribute && document.body.getAttribute('name') === '小说阅读助手');
        if (!_inReader) return;
        var $prefs = UI.$prefs;
        if ($prefs && $prefs.length) {
          try { UI.hide(); } catch (ex) { logStore('error', '关闭设置失败', ex); }
        } else {
          try { UI.preferencesShow(); } catch (ex) { logStore('error', '打开设置失败', ex); }
        }
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }, true);

      // 点遮罩(backdrop)关闭兜底：两种情形都关闭——
      //   (a) e.target === dialog（backdrop 正常渲染，点击遮罩 target 为 dialog 自身）
      //   (b) !dialog.contains(e.target)（backdrop 未渲染/透明 dialog 撑满，点击 dialog 外部正文）
      // 点击 dialog 内部子元素（contains=true 且 ≠dialog）不关闭，避免误关设置。
      document.addEventListener('mousedown', function (e) {
        var $prefs = UI.$prefs;
        if (!$prefs || !$prefs.length) return;
        var dialog = $prefs[0];
        if (e.target === dialog || !dialog.contains(e.target)) {
          try { UI.hide(); } catch (ex) { logStore('error', '点遮罩关闭失败', ex); }
        }
      }, true);

      // 扩展图标 popup「设置」→ 打开设置面板（始终可开：未启用站点也可在此配置全局设置）
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
          if (msg && msg.action === 'mnr_open_preferences') {
            try { UI.preferencesShow(); sendResponse({ ok: true }); } catch (e) { sendResponse({ ok: false }); }
          }
        });
      }
    } catch(e){ logStore('error', '扩展增强监听注册失败', e); }


  })();



}());
