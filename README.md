安装地址：
http://adclear.fanjs.net

全局属性：
_showADClearLog = true; // 增加全局配置参数可输出更多日志

浏览器标签：
javascript:(function(){var t=new Date().getTime(),a=new XMLHttpRequest();a.open('GET','//raw.githubusercontent.com/diky87688973/adclear/11ad4aa20f9cbefc4cbe767a9232d9e2b259ca5b/adclear.1.3.js',true);a.onreadystatechange=function(){if(this.readyState==4&&(this.status>=200&&this.status<300||this.status===304||this.status===0||this.status===1223)){window.console&&console.log('Loading AdClear Plugin...\tused '+(new Date().getTime()-t)+'ms');eval(this.responseText);}};a.send(null);})();
