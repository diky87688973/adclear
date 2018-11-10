/*!
 * Browser AdClear Plugin 1.3
 * https://github.com/diky87688973/adclear
 * 
 * Includes jQuery MD5 Plugin 1.2.1
 * https://github.com/blueimp/jQuery-MD5
 * 
 * Date: 2018-10-11T11:07:42.680Z
 */
(function(){function Q(a,l){if(!(0>=l)&&a&&1==a.nodeType)for(var h=0,m=a.childNodes.length;h<m;h++){var q=a.childNodes[h];if(1==q.nodeType&&null==q.getAttribute("_ad_box_wrap_cleaned_")&&!pa.test(q.tagName)&&!qa.test(q.className)){a:{var g=q;for(var r=0;r<u.length;r++){var n=u[r];null==y[n]&&(y[n]=0);y[n]++;if(R(g,n.toLowerCase())){g.setAttribute("_domain_rules_",n);z.push(g);null==A[n]&&(A[n]=0);A[n]++;g=!0;break a}}g=!1}if(g)S++;else{if(g=ra.test(q.nodeName))a:{g=q;for(r=0;r<H.length;r++){var p=
H[r];n="_box_rules_"+r;switch(p.type){case "css":null==B[n]&&(B[n]=0);B[n]++;var k=!1,w;for(w in p)if(w&&!/^type|position|positionReg$/.test(w)&&p.hasOwnProperty(w)){if(p.positionReg||p.position){var t=x(g,"position");if(p.positionReg&&!p.positionReg.test(t)||p.position&&p.position!=t){k=!1;break}}t=x(g,w);if(null==t){k=!1;break}t=parseFloat(t);if(isNaN(t)){k=!1;break}for(var v=p[w].split(/;/),c=!1,b=0;b<v.length;b++){var e=v[b].split(/,/);if(t>=parseFloat(e[0])&&t<=parseFloat(e[1])){c=k=!0;break}}if(!c){k=
!1;break}}if(p=k){p=g;k=!1;switch(T(p)){case 1:if((t=p.parentNode)&&/^body$/i.test(t.nodeName)||t.parentNode&&/^body$/i.test(t.parentNode.nodeName))k=!0;break;case 2:k=!0}k?(z.push(p),p=!0):p=!1}if(p){g.setAttribute("_box_rules_",r);null==C[n]&&(C[n]=0);C[n]++;g=!0;break a}}}g=!1}if(g)U++;else{a:{g=q;for(r=0;r<V.length;r++)switch(n=V[r],p="_attr_rules_"+r,n.type){case "attr":case "attr=":case "attrContain":case "attr~=":case "attrPrefix":case "attr^=":case "attrSuffix":case "attr$=":null==D[p]&&(D[p]=
0);D[p]++;for(var d in n)if(d&&!/^(?:type|useMd5)$/.test(d)&&n.hasOwnProperty(d)){k=g.getAttribute(d);if(null==k)break;k=n.md5?L.md5(k):k;t=n[d];switch(!0){case /^(?:attr|attr=)$/.test(n.type)&&k==t:case /^(?:attrContain|attr~=)$/.test(n.type)&&0<=k.indexOf(t):case /^(?:attrPrefix|attr\^=)$/.test(n.type)&&0==k.indexOf(t):case /^(?:attrSuffix|attr\$=)$/.test(n.type)&&k.length-k.lastIndexOf(t)==t.length:g.setAttribute("_attr_rules_",r);z.push(g);null==E[p]&&(E[p]=0);E[p]++;g=!0;break a}}}g=!1}g?W++:
Q(q,l-1)}}}}}function F(a,l){a=a.split("//");l=l.split("//");if(a[1]&&l[1]){a=a[1].split(/[?.:/]/);l=l[1].split(/[?.:/]/);try{for(var h=0;h<l.length;h++)if(a[h]!=l[h]&&"*"!=l[h]&&!eval("/^"+l[h].replace(/\*/g,".*")+"$/i").test(a[h]))return!1}catch(m){return k(m),!1}return!0}return!1}function T(a){a=x(a,"position")+"";return/^absolute$/i.test(a)?1:/^fixed$/i.test(a)?2:0}function x(a,l){var h;(h=a.style[l])||(document.defaultView&&document.defaultView.getComputedStyle?(l=l.replace(/([A-Z])/g,"-$1").toLowerCase(),
h=(h=document.defaultView.getComputedStyle(a,null))?h.getPropertyValue(l):null):a.currentStyle&&(h=a.currentStyle[l]));if(/^auto$/i.test(h))switch(l){case "top":h=I(a).y+"px";break;case "left":h=I(a).x+"px";break;case "right":l=I(a);h=X();h=h.w-l.x-a.offsetWidth+"px";break;case "bottom":l=I(a);h=X();h=h.h-l.y-a.offsetHeight+"px";break;case "width":h=a.offsetWidth+"px";break;case "height":h=a.offsetHeight+"px"}return h}function I(a,l){for(var h=a.offsetLeft,m=h,q=/\babsolute\b|\brelative\b/i,g=1,k=
a.offsetParent;null!=k;){if(g&&k.style&&q.test(x(k,"position"))&&(g=0,m=h,l)){h=0;break}h+=k.offsetLeft;k=k.offsetParent}g=1;var n=a.offsetTop,p=n;for(k=a.offsetParent;null!=k;){if(g&&k.style&&q.test(x(k,"position"))&&(g=0,p=n,l)){n=0;break}n+=k.offsetTop;k=k.offsetParent}return{x:h,y:n,xx:m,yy:p}}function X(){var a=document.body,l=document.documentElement;return{w:Math.max(a.scrollWidth,a.clientWidth,l.scrollWidth,l.scrollWidth),h:Math.max(a.scrollHeight,a.clientHeight,l.scrollHeight,l.clientHeight)}}
function R(a,l){var h=!1,m="//"+l;switch(a.nodeName.toLowerCase()){case "iframe":try{h=Y(a,l)}catch(q){h=!1}break;case "a":a=(a.href+"").toLowerCase();h=F(a,m);Z++;h&&aa++;break;case "object":a=(a.data+"").toLowerCase();h=F(a,m);ba++;h&&ca++;break;case "img":a=(a.src+"").toLowerCase();h=F(a,m);da++;h&&ea++;break;case "embed":a=(a.src+"").toLowerCase();h=F(a,m);fa++;h&&ha++;break;default:50<=a.offsetWidth&&50<=a.offsetHeight?(h=(a=(a=(a=x(a,"background-image"))?a.match(/url\((["'])((?:https?:)?\/\/[\s\S]+)\1\)$/i):
null)?a[2]:null)?F(a.toLowerCase(),m):!1,ia++,h&&ja++):ka++}return h}function Y(a,l){la++;var h=!1;try{if(url=(a.src+"").toLowerCase(),(h=F(url,"//"+l))&&ma++,!h&&!a[".ad.iframe.checked."]){var m=!1;try{m=!!a.contentWindow.location.href}catch(r){m=!1}if(m){var k=a.contentWindow.document.getElementsByTagName("iframe");for(m=0;m<k.length;m++)if(Y(k[m],l)){h=!0;break}if(!h){var g=a.contentWindow.document.getElementsByTagName("a");for(m=0;m<g.length;m++)if(R(g[m],l)){h=!0;break}}}else a[".ad.iframe.checked."]=
1}}catch(r){h=!1}finally{}return h}function sa(a,l){if(!a||!l)return!1;if(/^body|html$/i.test(a.nodeName))return!0;for(var h=!1,m=0,k=0,g=0,r=a.children.length;g<r;g++){var n=a.children[g];if(/^title|meta$/i.test(n.nodeName))return!1;if(1==n.nodeType&&n!==l&&!/^script|link|style$/i.test(n.nodeName)){var p=50>n.offsetWidth||30>n.offsetHeight||"hidden"==x(n,"visibility");p||m++;/^li$/i.test(n.nodeName)&&30<n.offsetWidth&&30<n.offsetHeight&&k++;if(!p&&(50<=n.offsetWidth||30<=n.offsetHeight||0<(n.textContent||
n.innerText).replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"").length||!(1>=n.children.length&&/^img$/i.test(n.children[0].nodeName)&&50>n.children[0].offsetWidth&&30>n.children[0].offsetHeight))||p&&/(?:^|[-_\s])tab(?:[-_\s]|$)/i.test(a.id+" "+a.className)||3<k){h=!0;break}}}return h||0<m}function ta(a){if(a.nextElementSibling)return a.nextElementSibling;for(a=a.nextSibling;a&&1!==a.nodeType;)a=a.nextSibling;return a&&1===a.nodeType?a:null}function G(){window.console&&console.log.apply(console,arguments)}
function k(){window._showADClearLog&&G.apply(G,arguments)}var pa=/^h[1-6]|input|textarea|select|script|link|style$/i,qa=/\b_YWF_ADBOX\b/i,ra=/^div|a|img|table|iframe|span|ul|ins|em$/i,U=0,W=0,S=0,M=location.hostname.toLowerCase(),z=[],H=[{type:"css",positionReg:/^fixed|absolute$/,bottom:"-10,50",right:"-10,50",width:"200,500",height:"200,400"},{type:"css",positionReg:/^fixed|absolute$/,bottom:"-10,50",left:"-10,50",width:"200,500",height:"200,400"},{type:"css",position:"fixed",left:"-10,50",width:"100,200",
height:"200,500"},{type:"css",position:"fixed",right:"-10,50",width:"100,200",height:"200,500"},{type:"css",position:"fixed",width:"100,200",height:"200,500"},{type:"css",position:"fixed",width:"150,500",height:"150,300"}],V=[{type:"attr^=",id:"tanx"},{type:"attr^=",id:"adContent-"},{type:"attr~=",flashvars:"saxn.sina.com.cn%2Fmfp%2Fclick"},{type:"attr",md5:!0,src:"4307047f7d98e054912130c794d7078d"},{type:"attr",md5:!0,src:"226f3b9ff1d0f1fc465991b291e49c08"}],u=[],N={};(function(){var a=(new Date).getTime(),
l=new XMLHttpRequest;l.open("GET","//raw.githubusercontent.com/diky87688973/adclear/master/ad_black_list.json",!1);l.send(null);(function(){if(4==l.readyState&&(200<=l.status&&300>l.status||304===l.status||0===l.status||1223===l.status)){k("Loading AD Black List \tused "+((new Date).getTime()-a)+"ms");var h=eval("("+l.responseText+"\n)");u=u.concat(h.blackList||[]);N=h.filterList||N}})()})();(function(){for(var a=0;a<u.length;a++){var l=u[a];F(location.href.toLowerCase(),"//"+l.toLowerCase())&&(u[a--]=
u[u.length-1],--u.length,k("\u8fc7\u6ee4:"+M+" \u57df\u540d\u4e0b\u7684:"+l))}if(l=N[M])for(var h=0;h<l.length;h++){var m=l[h].toLowerCase();for(a=0;a<u.length;a++)m==u[a].toLowerCase()&&(u[a--]=u[u.length-1],--u.length,k("\u8fc7\u6ee4:"+M+" \u57df\u540d\u4e0b\u7684:"+m))}})();var B={},C={},D={},E={},y={},A={},Z=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,O,na=[],J=[],oa=0,K=0,P=0;(new Date).getTime();setTimeout(function(){K++;G("[\u5e7f\u544a\u6e05\u7406 v1.3] - \u6b63\u5728\u6e05\u7406\u5e7f\u544a... "+
K+" \u6b21");var a=(new Date).getTime();if(window.top==window){z=[];Q(document.body,20);for(var l=0,h=Math.round(100*z.length/100);l<h;l++){for(var m=z[l],q=m.parentNode;q&&m&&!/^body|html$/i.test(q.nodeName)&&(1==q.children.length||!sa(q,m));)m=q,q=m.parentNode;q="auto";if(m){"auto"==q&&(q=T(m)?"movehide":/^none$/i.test(x(ta(m)||m,"float"))?"hide":"invisible");switch(q){case "invisible":m.style.cssText+=";opacity:0 !important;visibility: hidden !important;pointer-events: none !important;";break;
case "hide":m.style.cssText+=";display:none !important;opacity:0 !important;height:0 !important;width:0 !important;pointer-events:none !important;";break;case "movehide":m.style.cssText+=";filter:alpha(opacity=0) !important;opacity:0 !important;display:none !important;height:0 !important;bottom:auto !important;top:-99999px !important;left:-99999px !important;z-index:-100 !important;pointer-events:none !important;";break;case "remove":m.parentNode&&m.parentNode.removeChild&&m.parentNode.removeChild(m)}m.setAttribute("_ad_box_wrap_cleaned_",
q);m=!0}else m=!1;m&&oa++}J=J.concat(z);O="[\u5e7f\u544a\u6e05\u7406 v1.3] - \u67e5\u51fa\u5e7f\u544a\u5143\u7d20 %c"+J.length+" %c\u4e2a\uff1a\u5339\u914dBox\u5e7f\u544a %c"+U+" %c\u4e2a\u3001\u5339\u914d\u5c5e\u6027\u5e7f\u544a %c"+W+" %c\u4e2a\u3001\u5339\u914d\u57df\u540d\u5e7f\u544a %c"+S+" %c\u4e2a\uff0c\u6210\u529f\u6e05\u7406 %c"+oa+" %c\u4e2a\u5e7f\u544a\uff0c\u6e05\u7406\u7387 %c100 %c%";na="color:red color:#000 color:red color:#000 color:red color:#000 color:red color:#000 color:red color:#000 color:red color:#000".split(" ")}a=
(new Date).getTime()-a;P+=a;if(window.console){k(J);O&&G.apply(G,[O].concat(na));G("[\u5e7f\u544a\u6e05\u7406 v1.3] - \u6e05\u7406\u5b8c\u6bd5\uff0c\u5171\u6e05\u7406\u5e7f\u544a "+K+" \u6b21\uff0c\u603b\u8017\u65f6\uff1a"+P+"ms\uff0c\u5355\u6b21\u5e73\u5747\u8017\u65f6\uff1a"+(P/K>>0)+"ms");k("[\u57df\u540d\u89c4\u5219\u65e5\u5fd7] -----");a=0;for(var g in y)g&&y.hasOwnProperty(g)&&(a+=y[g],k("%c\u57df\u540d\u89c4\u5219 - \u68c0\u7d22\u6b21\u6570\uff1a"+y[g]+"\t- "+g,"color:gray"));domainRulesHitTotalCount=
l=0;for(g in A)g&&A.hasOwnProperty(g)&&(l++,domainRulesHitTotalCount+=A[g],k("%c\u57df\u540d\u89c4\u5219 - \u547d\u4e2d\u6b21\u6570\uff1a"+A[g]+"\t- "+g,"color:red"));k("a     \t\u547d\u4e2d\u6b21\u6570\uff1a"+aa+"\t\u68c0\u7d22\u6b21\u6570\uff1a"+Z);k("bg-img\t\u547d\u4e2d\u6b21\u6570\uff1a"+ja+"\t\u68c0\u7d22\u6b21\u6570\uff1a"+ia);k("img   \t\u547d\u4e2d\u6b21\u6570\uff1a"+ea+"\t\u68c0\u7d22\u6b21\u6570\uff1a"+da);k("iframe\t\u547d\u4e2d\u6b21\u6570\uff1a"+ma+"\t\u68c0\u7d22\u6b21\u6570\uff1a"+
la);k("object\t\u547d\u4e2d\u6b21\u6570\uff1a"+ca+"\t\u68c0\u7d22\u6b21\u6570\uff1a"+ba);k("embed \t\u547d\u4e2d\u6b21\u6570\uff1a"+ha+"\t\u68c0\u7d22\u6b21\u6570\uff1a"+fa);k("bg-img\t\u5ffd\u7565\u68c0\u7d22\u6b21\u6570\uff1a"+ka);k("\u603b\u5e7f\u544a\u57df\u540d\uff1a"+u.length+"\u4e2a\uff0c\u57df\u540d\u89c4\u5219\u68c0\u7d22\u6b21\u6570\uff1a"+a+"\uff0c\u547d\u4e2d\u6b21\u6570\uff1a"+domainRulesHitTotalCount+"\uff0c\u547d\u4e2d\u57df\u540d\u4e2a\u6570\uff1a"+l);k("[box\u89c4\u5219\u65e5\u5fd7] -----");
a=0;for(g in B)g&&B.hasOwnProperty(g)&&(a+=B[g],k("%cbox\u89c4\u5219 - \u68c0\u7d22\u6b21\u6570\uff1a"+B[g]+"\t- "+g,"color:gray"));boxRulesHitTotalCount=l=0;for(g in C)g&&C.hasOwnProperty(g)&&(l++,boxRulesHitTotalCount+=C[g],k("%cbox\u89c4\u5219 - \u547d\u4e2d\u6b21\u6570\uff1a"+C[g]+"\t- "+g,"color:red"));k("\u603bbox\u89c4\u5219\uff1a"+H.length+"\u4e2a\uff0cbox\u89c4\u5219\u68c0\u7d22\u6b21\u6570\uff1a"+a+"\uff0c\u547d\u4e2d\u6b21\u6570\uff1a"+boxRulesHitTotalCount+"\uff0c\u547d\u4e2d\u57df\u540d\u4e2a\u6570\uff1a"+
l);k("[attr\u89c4\u5219\u65e5\u5fd7] -----");a=0;for(g in D)g&&D.hasOwnProperty(g)&&(a+=D[g],k("%cattr\u89c4\u5219 - \u68c0\u7d22\u6b21\u6570\uff1a"+D[g]+"\t- "+g,"color:gray"));attrRulesHitTotalCount=l=0;for(g in E)g&&E.hasOwnProperty(g)&&(l++,attrRulesHitTotalCount+=E[g],k("%cattr\u89c4\u5219 - \u547d\u4e2d\u6b21\u6570\uff1a"+E[g]+"\t- "+g,"color:red"));k("\u603battr\u89c4\u5219\uff1a"+H.length+"\u4e2a\uff0cattr\u89c4\u5219\u68c0\u7d22\u6b21\u6570\uff1a"+a+"\uff0c\u547d\u4e2d\u6b21\u6570\uff1a"+
attrRulesHitTotalCount+"\uff0c\u547d\u4e2d\u57df\u540d\u4e2a\u6570\uff1a"+l)}},10);var L=function(){};(function(a){function l(v,c){var b=(v&65535)+(c&65535);return(v>>16)+(c>>16)+(b>>16)<<16|b&65535}function h(v,c,b,a,d,f){v=l(l(c,v),l(a,f));return l(v<<d|v>>>32-d,b)}function m(a,c,b,e,d,f,g){return h(c&b|~c&e,a,c,d,f,g)}function k(a,c,b,e,d,f,g){return h(c&e|b&~e,a,c,d,f,g)}function g(a,c,b,e,d,f,g){return h(b^(c|~e),a,c,d,f,g)}function r(a,c){a[c>>5]|=128<<c%32;a[(c+64>>>9<<4)+14]=c;var b=1732584193,
e=-271733879,d=-1732584194,f=271733878;for(c=0;c<a.length;c+=16){var n=b;var v=e;var p=d;var q=f;b=m(b,e,d,f,a[c],7,-680876936);f=m(f,b,e,d,a[c+1],12,-389564586);d=m(d,f,b,e,a[c+2],17,606105819);e=m(e,d,f,b,a[c+3],22,-1044525330);b=m(b,e,d,f,a[c+4],7,-176418897);f=m(f,b,e,d,a[c+5],12,1200080426);d=m(d,f,b,e,a[c+6],17,-1473231341);e=m(e,d,f,b,a[c+7],22,-45705983);b=m(b,e,d,f,a[c+8],7,1770035416);f=m(f,b,e,d,a[c+9],12,-1958414417);d=m(d,f,b,e,a[c+10],17,-42063);e=m(e,d,f,b,a[c+11],22,-1990404162);b=
m(b,e,d,f,a[c+12],7,1804603682);f=m(f,b,e,d,a[c+13],12,-40341101);d=m(d,f,b,e,a[c+14],17,-1502002290);e=m(e,d,f,b,a[c+15],22,1236535329);b=k(b,e,d,f,a[c+1],5,-165796510);f=k(f,b,e,d,a[c+6],9,-1069501632);d=k(d,f,b,e,a[c+11],14,643717713);e=k(e,d,f,b,a[c],20,-373897302);b=k(b,e,d,f,a[c+5],5,-701558691);f=k(f,b,e,d,a[c+10],9,38016083);d=k(d,f,b,e,a[c+15],14,-660478335);e=k(e,d,f,b,a[c+4],20,-405537848);b=k(b,e,d,f,a[c+9],5,568446438);f=k(f,b,e,d,a[c+14],9,-1019803690);d=k(d,f,b,e,a[c+3],14,-187363961);
e=k(e,d,f,b,a[c+8],20,1163531501);b=k(b,e,d,f,a[c+13],5,-1444681467);f=k(f,b,e,d,a[c+2],9,-51403784);d=k(d,f,b,e,a[c+7],14,1735328473);e=k(e,d,f,b,a[c+12],20,-1926607734);b=h(e^d^f,b,e,a[c+5],4,-378558);f=h(b^e^d,f,b,a[c+8],11,-2022574463);d=h(f^b^e,d,f,a[c+11],16,1839030562);e=h(d^f^b,e,d,a[c+14],23,-35309556);b=h(e^d^f,b,e,a[c+1],4,-1530992060);f=h(b^e^d,f,b,a[c+4],11,1272893353);d=h(f^b^e,d,f,a[c+7],16,-155497632);e=h(d^f^b,e,d,a[c+10],23,-1094730640);b=h(e^d^f,b,e,a[c+13],4,681279174);f=h(b^e^
d,f,b,a[c],11,-358537222);d=h(f^b^e,d,f,a[c+3],16,-722521979);e=h(d^f^b,e,d,a[c+6],23,76029189);b=h(e^d^f,b,e,a[c+9],4,-640364487);f=h(b^e^d,f,b,a[c+12],11,-421815835);d=h(f^b^e,d,f,a[c+15],16,530742520);e=h(d^f^b,e,d,a[c+2],23,-995338651);b=g(b,e,d,f,a[c],6,-198630844);f=g(f,b,e,d,a[c+7],10,1126891415);d=g(d,f,b,e,a[c+14],15,-1416354905);e=g(e,d,f,b,a[c+5],21,-57434055);b=g(b,e,d,f,a[c+12],6,1700485571);f=g(f,b,e,d,a[c+3],10,-1894986606);d=g(d,f,b,e,a[c+10],15,-1051523);e=g(e,d,f,b,a[c+1],21,-2054922799);
b=g(b,e,d,f,a[c+8],6,1873313359);f=g(f,b,e,d,a[c+15],10,-30611744);d=g(d,f,b,e,a[c+6],15,-1560198380);e=g(e,d,f,b,a[c+13],21,1309151649);b=g(b,e,d,f,a[c+4],6,-145523070);f=g(f,b,e,d,a[c+11],10,-1120210379);d=g(d,f,b,e,a[c+2],15,718787259);e=g(e,d,f,b,a[c+9],21,-343485551);b=l(b,n);e=l(e,v);d=l(d,p);f=l(f,q)}return[b,e,d,f]}function n(a){var c,b="";for(c=0;c<32*a.length;c+=8)b+=String.fromCharCode(a[c>>5]>>>c%32&255);return b}function p(a){var c,b=[];b[(a.length>>2)-1]=void 0;for(c=0;c<b.length;c+=
1)b[c]=0;for(c=0;c<8*a.length;c+=8)b[c>>5]|=(a.charCodeAt(c/8)&255)<<c%32;return b}function u(a){return n(r(p(a),8*a.length))}function w(a,c){var b=p(a),e=[],d=[];e[15]=d[15]=void 0;16<b.length&&(b=r(b,8*a.length));for(a=0;16>a;a+=1)e[a]=b[a]^909522486,d[a]=b[a]^1549556828;c=r(e.concat(p(c)),512+8*c.length);return n(r(d.concat(c),640))}function t(a){var c="",b;for(b=0;b<a.length;b+=1){var e=a.charCodeAt(b);c+="0123456789abcdef".charAt(e>>>4&15)+"0123456789abcdef".charAt(e&15)}return c}a.md5=function(a,
c,b){c?b?a=w(unescape(encodeURIComponent(c)),unescape(encodeURIComponent(a))):(a=w(unescape(encodeURIComponent(c)),unescape(encodeURIComponent(a))),a=t(a)):a=b?u(unescape(encodeURIComponent(a))):t(u(unescape(encodeURIComponent(a))));return a}})("function"===typeof L?L:this)})();
