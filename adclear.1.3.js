/**
 * Browser AdClear Plugin 1.3
 * 广告清理-PC版 v1.3
 * 
 * v1.3 增加属性规则
 * v1.2 清理内容广告
 * v1.1 清理浮动广告
 * 
 * @author Fan
 * @lastModify 2018-09-27
 * 
 * 全局属性:
 * _showADClearLog = true; // 增加全局配置参数可输出更多日志
 * 浏览器标签:
 * javascript:(function(){var a=new XMLHttpRequest();a.open('GET','//raw.githubusercontent.com/diky87688973/adclear/11ad4aa20f9cbefc4cbe767a9232d9e2b259ca5b/adclear.1.3.js',true);a.onreadystatechange=function(){if(this.readyState==4&&(this.status>=200&&this.status<300||this.status===304||this.status===0||this.status===1223)){eval(this.responseText);}};a.send(null);})();
 */

( function() {
    
    var
    _version = '1.3',

    // # 当前站点域名
    _currDomain = location.hostname.toLowerCase(),
    // 确定的广告元素
    _adElems = [],
    // 临时存放已经检测过的域名, 便于快速检测
    _tempFilterDomains = {},
    
    // 被清理的广告元素标识
    _clearProperty = '_a' + 'd_bo' + 'x_wr' + 'ap_cle' + 'aned_',
    
    // # 检索可能是广告元素的正则
    _tagNamesReg_pos = /^div|a|img|table|iframe|span|ul|ins|em$/i,  // 通过定位判定
    _tagNamesReg_url = /^iframe|embed|object|a|img$/i,              // 通过路径判定

    // 记录查到的数量, 仅用于输出调试
    _findBoxRuleCount = 0,
    _findAttrRuleCount = 0,
    _findDomainRuleCount = 0,
    
    
    // # 广告box模型规则(适用于浮动层广告)
    // type         - box模型的匹配类型,目前css模式,未来可扩展更多的box模型描述方式
    // positionReg  - 定位样式position的正则匹配方式
    // position     - 定位样式position的全等文本匹配方式
    _boxRules = [ {
        // css 规则, 边距范围, 适用[右下角弹窗]
        type : 'css',
        positionReg : /fixed|absolute/,
        bottom : '-10,50', // 区间[0,30],或者[-10,20],或-10,50;10,30，多个组合用;号隔开
        right : '-10,50',
        width : '200,500',
        height : '200,400'
    }, {
        type : 'css',   // 左下角,方形
        positionReg : /fixed|absolute/,
        bottom : '-10,50',
        left : '-10,50',
        width : '200,500',
        height : '200,400'
    }, {
        type : 'css',   // 左,长方形
        position : 'fixed',
        left : '-10,50',
        width : '100,200',
        height : '200,500'
    }, {
        type : 'css',   // 右,长方形
        position : 'fixed',
        right : '-10,50',
        width : '100,200',
        height : '200,500'
    }, {
        type : 'css',   // 任意固定位置(存在误删), 长方形
        position : 'fixed',
        width : '100,200',
        height : '200,500'
    }, {
        type : 'css',   // 任意固定位置(存在误删), 约4:3
        position : 'fixed',
        width : '150,500',
        height : '150,300'
    } ],
    
    // # 属性匹配规则, 适用[适用于嵌入在页面内容中的广告,常用广告平台]
    // type                  - 指定使用的匹配规则
    // md5                   - 进行md5转换之后再匹配,通常用于超长内容匹配,仅适用于全等匹配规则(attr|attr=)
    // attr        | attr=   - 相等
    // attrPrefix  | attr^=  - 起始匹配,例如:id="tanx...",表示id值以tanx打头的所有元素
    // attrSuffix  | attr$=  - 结尾匹配
    // attrContain | attr~=  - 包含
    _attrRules = [ {
        type : 'attr^=',
        id : 'tanx'
    }, {
        type : 'attr^=',
        id : 'adContent-'
    }, {
        type : 'attr~=',
        flashvars : 'saxn.sina.com.cn%2Fmfp%2Fclick'
    }, {
        // [广告]小图标
        type : 'attr',
        md5 : true,
        src : '4307047f7d98e054912130c794d7078d'
    }, {
        // [广告]小图标
        type : 'attr',
        md5 : true,
        src : '226f3b9ff1d0f1fc465991b291e49c08'
    } ],
    
    // # 常见广告域名(适用于内容嵌入广告)
    _adDomains = [
            // 百度
            'pos.baidu.com',
            'static.pay.baidu.com/baichuan/adp',
            'entry.baidu.com/rp/home',
            'ubmcmm.baidustatic.com/media/v1',
            'www.baidu.com/cb.php',
            // 百度贴吧嵌入式广告
            'www.baidu.com/baidu.php?url=',
            
            // bilibili
            'cm.bilibili.com/cm/api/fees/pc',
            
            // 360搜索
            'api.so.lianmeng.360.cn/searchthrow/api/ads/throw',

            // 爱搜网
            'nads.wuaiso.com',
            
            // 阿里
            'a1.alicdn.com/creation',
            'afptrack.alimama.com/clk',
            'afp.alicdn.com/afp-creative',
            'click.aliyun.com/m',
            'click.tanx.com/ct',
            's.click.taobao.com/t',
            'render.alipay.com/p/s/taobaonpm_click',
            
            // 网易
            'img1.126.net/channel',
            'img1.126.net/advertisement/contract',
            'popme.163.com',
            'g.163.com/r',
            
            'strip.taobaocdn.com',                  // 淘宝
            'inte.sogou.com/ct',                    // 搜狗
            'x.jd.com/exsites',                     // 京东
            'g.fastapi.net/qa',                     // 互众广告
            'g.ggxt.net/qa',                        // 蘑菇街?
            'c.l.qq.com/lclick',                    // 腾讯广告
            'd1.sina.com.cn/litong/zhitou/sinaads', // 新浪
            'saxn.sina.com.cn/dsp/click',
            'saxn.sina.com.cn/mfp/click',
            'ads.vamaker.com',                      // 万流客
            'same.chinadaily.com.cn/s?',            // 中国日报网
            'img-ads.csdn.net',                     // csdn
            
            // google
            'www.googleadservices.com',
            'googleads.g.doubleclick.net/pagead',
            'googleads.g.doubleclick.net/aclk',
            'tpc.googlesyndication.com/safeframe',
            
            // 西部数码
            'www.west.cn/services/CloudHost/?ads=',
            // 火蓝
            'www.nas.net.cn',
            // 奇异互动
            'www.7e.hk',
            // 创速传媒网络
            'www.37cs.com/html/click',
            
            // ifeng
            'www.ifeng.com/a_if',
            'www.ifeng.com/ssi-incs',
            'y1.ifengimg.com',
            'y2.ifengimg.com/mappa',
            'c1.ifengimg.com',
            'games.ifeng.com/bcs/games',
            'games.ifeng.com/1403m',
            'dol.deliver.ifeng.com/c',
            
            // 其他
            'wa.gtimg.com',
            'www.cokolo.cn',
            'swa.gtimg.com/web/snswin',
            'show.g.mediav.com/s',
            'topic.cokolo.cn',
            'd.admx.baixing.com',
            'tr.mjoys.com/tanxopen',
            'click.tanx.com/cc',
            'material.istreamsche.com'
    ],
   
    // # 过滤域名, 针对_adDomains配置中的广告域名过滤, 可以让指定站点忽略检索指定的广告域名
    // 规则数据格式: key-站点域名,value-该站点域名下不屏蔽的广告地址,url必须与域名列表中的一致才能被过滤(包括大小写也要一样)
    _filterDomains = {
            // 百度
            'www.baidu.com' : [
                // 'pos.baidu.com',
                // 'static.pay.baidu.com/baichuan/adp'
            ],
            
            // 网易
            'www.163.com' : [
                //'img1.126.net/channel',
                //'popme.163.com',
                //'g.163.com/r'
            ],
            
            // ifeng
            'www.ifeng.com' : [
                //'dol.deliver.ifeng.com/c',
                'y1.ifengimg.com'
                /*'www.ifeng.com/a_if',
                'www.ifeng.com/ssi-incs',
                'y1.ifengimg.com',
                'c1.ifengimg.com',
                'games.ifeng.com/bcs/games',
                'games.ifeng.com/1403m'*/
            ]
    };
    
    // # 去掉过滤出的广告域名, 从过滤列表中取得当前域名下需要过滤的域名
    ( function() {
        // 当前域名正是广告域名,则忽视该广告域名
        for ( var j = 0; j < _adDomains.length; j++ ) {
            var adDomain = _adDomains[ j ];
            if ( location.href.indexOf( '//' + adDomain.toLowerCase() ) > -1 ) {
                // 把数组最后一个覆盖j索引位置, 并让数组长度减1
                _adDomains[ j-- ] = _adDomains[ _adDomains.length - 1 ];
                _adDomains.length -= 1;
                window.console && console.log( '过滤:' + _currDomain + ' 域名下的:' + adDomain );
            }
        }

        // 忽视过滤名单中的域名
        var fds = _filterDomains[ _currDomain ];
        if ( fds ) {
            for ( var i = 0; i < fds.length; i++ ) {
                // 需要过滤的域名
                var fd = fds[ i ].toLowerCase();
                
                for ( var j = 0; j < _adDomains.length; j++ ) {
                    if ( fd == _adDomains[ j ].toLowerCase() ) {
                        // 把数组最后一个覆盖j索引位置, 并让数组长度减1
                        _adDomains[ j-- ] = _adDomains[ _adDomains.length - 1 ];
                        _adDomains.length -= 1;
                        
                        window.console && console.log( '过滤:' + _currDomain + ' 域名下的:' + fd );
                    }
                }
            }
        }
    } )();
    
    
    // # 特定域名下的广告(适用于特定站点过滤出广告,暂未实现)
    // 如百度贴吧的自定义广告,外表看似一条帖子
    
    
    
    // # 分析页面元素,查找可疑的广告元素, findDepth - 检索深度,从根节点开始,缺省深度20
    function findSuspiciousAdElem( findDepth ) {
        findDepth = findDepth >> 0 || 20;
        _adElems = [];
        
        findAll( document.body, findDepth );
    }
    
    // 递归查询dom,可指定检索深度
    function findAll( dom, depth ) {
        if ( depth <= 0 || !dom || dom.nodeType != 1 )
            return;
        
        for ( var i = 0, l = dom.childNodes.length; i < l; i++ ) {
            var elem = dom.childNodes[ i ];
            
            // 是否已被检索出是广告容器, 且已被清理, 则不处理
            if ( elem.nodeType != 1 || '1' == elem.getAttribute( _clearProperty ) )
                continue;
            
            // 排除自己的广告(含有_YWF_,或含有_YWF_ADBOX的样式名) 
            if ( !(elem._YWF_ || /\b_YWF_ADBOX\b/i.test( elem.className )) ) {

                var finded = false;
                
                // 域名检测
                if ( _tagNamesReg_url.test( elem.nodeName ) && checkAdDomain( elem ) ) {
                    _findDomainRuleCount++; // 符合域名规则的统计数量+1
                    finded = true;
                }
                
                // 定位检测, 若使用了定位, 且属于指定的标签
                else if ( usePosition( elem ) > 0 && _tagNamesReg_pos.test( elem.nodeName ) && (checkBoxRule( elem ) || checkAttrRule( elem )) ) {
                    _findBoxRuleCount++; // 符合规则的统计数量+1
                    finded = true;
                }
                
                // 属性检测
                else if ( usePosition( elem ) == 0 && checkAttrRule( elem ) ) {
                    _findAttrRuleCount++; // 符合规则的统计数量+1
                    finded = true;
                }
                
                // 未找到, 检索下一级
                else
                    findAll( elem, depth - 1 );
                
            }
        }
    }
    
    
    // # utils
    
    // 定位检测 - 是否使用了绝对定位或固定定位,1-absolute,2-fixed,0-其他
    function usePosition( elem ) {
        var style = currCss( elem, 'position' ) + '';
        
        // 绝对定位或固定定位:absolute,fixed
        if ( /^absolute$/i.test( style ) ) {
            return 1;
        } else if ( /^fixed$/i.test( style ) ) {
            return 2;
        }
        return 0;
    }
    
    // 获取样式值 - 获取当前使用的样式值, 样式名需遵守驼峰风格
    function currCss( elem, styleName ) {
        var style;
        if ( (style = elem.style[ styleName ]) ) {
        } else if ( document.defaultView && document.defaultView.getComputedStyle ) {
            styleName = styleName.replace( /([A-Z])/g, '-$1' ).toLowerCase();
            style = document.defaultView.getComputedStyle( elem, null );
            style = style ? style.getPropertyValue( styleName ) : null;
        } else if ( elem.currentStyle ) {
            style = elem.currentStyle[ styleName ];
        }
        
        // auto 样式取值
        if ( /^auto$/i.test( style ) ) {
            switch ( styleName ) {
            case 'top' :
                //style = elem.offsetTop + 'px';
                style = getXY( elem ).y + 'px';
                break;
            case 'left' :
                //style = elem.offsetLeft + 'px';
                style = getXY( elem ).x + 'px';
                break;
            case 'right' :
                var xy = getXY( elem ), wh = getBodyAndScrollWH();
                style = (wh.w - xy.x - elem.offsetWidth) + 'px';
                // style = (elem.parentNode.offsetWidth - elem.offsetLeft - elem.offsetWidth) + 'px';
                break;
            case 'bottom' :
                var xy = getXY( elem ), wh = getBodyAndScrollWH();
                style = (wh.h - xy.y - elem.offsetHeight) + 'px';
                // style = (elem.parentNode.offsetHeight - elem.offsetTop - elem.offsetHeight) + 'px';
                break;
            case 'width' :
                    style = elem.offsetWidth + 'px';
                break;
            case 'height' :
                    style = elem.offsetHeight + 'px';
                break;
            }
        }
        
        return style;
    }
    
    // 获取元素位置{x, y, xx, yy}
    function getXY( el, relative ) {
        // 取得x坐标
        var x = el.offsetLeft, xx = x, r = /\babsolute\b|\brelative\b/i, flg = 1;
        var tmp = el.offsetParent;
        while ( null != tmp ) {
            if ( flg && tmp.style && r.test( currCss( tmp, 'position' ) ) ) {
                flg = 0;
                xx = x;
                if ( relative ) {
                    x = 0;
                    break;
                }
            }
            x += tmp.offsetLeft;
            tmp = tmp.offsetParent;
        }
        flg = 1;
        // 取得y坐标
        var y = el.offsetTop, yy = y;
        tmp = el.offsetParent;
        while ( null != tmp ) {
            if ( flg && tmp.style && r.test( currCss( tmp, 'position' ) ) ) {
                flg = 0;
                yy = y;
                if ( relative ) {
                    y = 0;
                    break;
                }
            }
            y += tmp.offsetTop;
            tmp = tmp.offsetParent;
        }
        return {
            x : x,
            y : y,
            xx : xx,
            yy : yy
        };
    }
    
    // 获取文档总高度，包含滚动区域 {w,h}
    function getBodyAndScrollWH() {
        var body = document.body, html = document.documentElement;
        return {
            w : Math.max( body.scrollWidth, body.clientWidth, html.scrollWidth, html.scrollWidth ),
            h : Math.max( body.scrollHeight, body.clientHeight, html.scrollHeight, html.clientHeight )
        };
    };
    
    // Box检测 - 检测可疑的广告元素是否匹配规则, 匹配的列入确定广告元素列表
    function checkBoxRule( sAdElem ) {
        for ( var i = 0; i < _boxRules.length; i++ ) {
            var rule = _boxRules[ i ];
            
            switch ( rule.type ) {
            // css 规则
            case 'css' :
                var isAd = false, flg = true;
                for ( var s in rule ) {
                    if ( !flg ) break;
                    if ( s && !/^(?:type|position)$/.test( s ) && rule.hasOwnProperty( s ) ) {
                        // 若规则中要求有定位样式, 则必须符合定位样式
                        if ( rule.positionReg && !rule.positionReg.test( currCss( sAdElem, 'position' ) ) ) {
                            isAd = false;
                            flg = false;
                            break;
                        } else if ( rule.position && rule.position != currCss( sAdElem, 'position' ) ) {
                            isAd = false;
                            flg = false;
                            break;
                        }
                        
                        var style = currCss( sAdElem, s );
                        
                        // 没有匹配的样式值,直接视为不匹配终止校验
                        if ( style == null ) {
                            isAd = false;
                            flg = false;
                            break;
                        }
                        
                        var val = parseFloat( style );
                        if ( isNaN( val ) ) {
                            isAd = false;
                            flg = false;
                            break;
                        }
                        
                        // 0px,30px;0%,30%
                        var ruleStyleText = rule[ s ];
                        var ruleStyles = ruleStyleText.split( /;/ );
                        var inScope = false; // 在范围内
                        for ( var j = 0; j < ruleStyles.length; j++ ) {
                            var rs = ruleStyles[ j ].split( /,/ );
                            if ( val >= parseFloat( rs[ 0 ] ) && val <= parseFloat( rs[ 1 ] ) ) {
                                isAd = true;
                                inScope = true;
                                break;
                            }
                        }
                        // 不在范围内
                        if ( !inScope ) {
                            isAd = false;
                            flg = false;
                            break;
                        }
                    }
                }
                // 符合规则
                if ( isAd && pushAdElems( sAdElem ) ) {
                    // 设置所匹配的规则下标,便于排查
                    sAdElem.setAttribute( '_box_rules_', i );
                    return true;
                }
                break;
            }
        }
        
        return false;
    }
    
    // 属性检测 - 检测可疑的广告元素是否匹配规则, 匹配的列入确定广告元素列表
    function checkAttrRule( sAdElem ) {
        for ( var i = 0; i < _attrRules.length; i++ ) {
            var rule = _attrRules[ i ];
            
            switch ( rule.type ) {
            case 'attr'         : case 'attr='  :
            case 'attrContain'  : case 'attr~=' :
            case 'attrPrefix'   : case 'attr^=' :
            case 'attrSuffix'   : case 'attr$=' :
                for ( var s in rule ) {
                    if ( s && !/^(?:type|useMd5)$/.test( s ) && rule.hasOwnProperty( s ) ) {
                        var attr = sAdElem.getAttribute( s );
                        
                        // 没有匹配的值,直接视为不匹配终止校验
                        if ( attr == null )
                            break;
                        
                        // 转换成md5之后匹配
                        attr = rule.md5 ? jQuery.md5( attr ) : attr;
                        var ruleValue = rule[ s ];
                        
                        switch ( true ) {
                        case /^(?:attr|attr=)$/.test( rule.type )         && attr == ruleValue :
                        case /^(?:attrContain|attr~=)$/.test( rule.type ) && attr.indexOf( ruleValue ) >= 0 :
                        case /^(?:attrPrefix|attr\^=)$/.test( rule.type ) && attr.indexOf( ruleValue ) == 0 :
                        case /^(?:attrSuffix|attr\$=)$/.test( rule.type ) && attr.length - attr.lastIndexOf( ruleValue ) == ruleValue.length :
                            // 设置所匹配的规则下标,便于排查
                            sAdElem.setAttribute( '_attr_rules_', i );
                            
                            // 符合规则
                            _adElems.push( sAdElem );
                            return true;
                        default : break;
                        }
                        
                        /*if ( (/^(?:attr|attr=)$/.test( rule.type )         && attr == ruleValue) ||
                             (/^(?:attrContain|attr~=)$/.test( rule.type ) && attr.indexOf( ruleValue ) >= 0) ||
                             (/^(?:attrPrefix|attr\^=)$/.test( rule.type ) && attr.indexOf( ruleValue ) == 0) ||
                             (/^(?:attrSuffix|attr\$=)$/.test( rule.type ) && attr.length - attr.lastIndexOf( ruleValue ) == ruleValue.length) ) {
                            
                            // 设置所匹配的规则下标,便于排查
                            sAdElem.setAttribute( '_attr_rules_', i );
                            
                            // 符合规则
                            _adElems.push( sAdElem );
                            return true;
                        }*/
                    }
                }
                break;
            }
        }
        
        return false;
    }
    
    // 把确定的元素, 追加到列表中
    function pushAdElems( elem ) {
        var positionType = usePosition( elem );
        var isAd = false;
        
        switch ( positionType ) {
        case 1 : // absolute
            var e = elem.parentNode;
            // 是否是body元素的直接子元素或者孙元素, 是则视为悬浮广告
            if ( (e && /^body$/i.test( e.nodeName )) || (e.parentNode && /^body$/i.test( e.parentNode.nodeName )) ) {
                isAd = true;
            }
            break;
        case 2 : // fixed
            isAd = true;
            break;
        }
        
        if ( isAd ) {
            _adElems.push( elem );
            return true;
        }
        return false;
    }
    
    // 检测元素是否含有常见的广告域名链接, 并列入广告列表
    function checkAdDomain( sAdElem ) {
        for ( var i = 0; i < _adDomains.length; i++ ) {
            var domain = _adDomains[ i ];
            // 检测是否包含具有url类属性的元素,且url在匹配列表之内吗,则视为广告元素
            if ( doCheckAdDomain( sAdElem, domain.toLowerCase() ) ) {
                
                sAdElem.setAttribute( '_domain_rules_', domain );
                _adElems.push( sAdElem );
                
                return true;
            }
        }
        return false;
    }
    
    // 检测元素属性中的url是否与广告域名匹配, 且当前站点域名与domain参数非同一域名(避免在a.b.c下屏蔽了a.b.c/x)
    function doCheckAdDomain( elem, domain ) {
        
        // # 检测域名
        var ret = false, tmpDomain = '//' + domain;
        
        switch ( elem.nodeName.toLowerCase() ) {
        // iframe需要更多的检测,如:同域下,对iframe内部页面检测
        case 'iframe' :
            try {
                ret = checkAdIframe( elem, domain );
            } catch ( e ) {
                ret = false;
            }
            break;
        case 'a' :
            var url = (elem.href + '').toLowerCase();
            ret = url.indexOf( tmpDomain ) > -1;
            break;
        case 'object' :
            var url = (elem.data + '').toLowerCase();
            ret = url.indexOf( tmpDomain ) > -1;
            break;
        case 'img' :
        case 'embed' :
            var url = (elem.src + '').toLowerCase();
            ret = url.indexOf( tmpDomain ) > -1;
            break;
        }
        
        return ret;
    }
    
    // # 检测子页面域名是否是广告域名
    var sss = 0,
        domainCheckCount = {}, // 域名被检测次数
        domainHitCount = {};   // 域名命中次数
    function checkAdIframe( iframe, domain ) {
        if ( !domainCheckCount[ domain ] )
            domainCheckCount[ domain ] = 0;
        
        domainCheckCount[ domain ]++;
        sss++;
        
        var ret = false;
        try {
            url = (iframe.src + '').toLowerCase();

//            console.log( iframe );
//            console.log( 'url:' + url );
//            console.log( 'domain:' + domain );
//            console.log( 'currDomain:' + _currDomain );
            
            ret = url.indexOf( '//' + domain ) > -1;
            
            // 记录命中次数
            if ( ret ) {
                if ( !domainHitCount[ domain ] )
                    domainHitCount[ domain ] = 0;
                domainHitCount[ domain ]++;
            }

//            console.log( 'ret:' + ret );
//            console.log( '子页面数量:' + iframe.contentWindow.length );
//            console.log( 'checked:' + !!iframe[ '.ad.iframe.checked.' ] );
            
            if ( !ret && !iframe[ '.ad.iframe.checked.' ] ) {

                // 是否同域, 访问子页内容, 若不报错, 则为同域
                var isSameDomain = false;
                try {
                    isSameDomain = !!iframe.contentWindow.location.href;
                } catch ( _ ) {
                    isSameDomain = false;
//                    console.log( _ );
//                    console.log( iframe );
                }

//                console.log( 'isSameDomain:' + isSameDomain );

                if ( isSameDomain ) {
                    var subIframes = iframe.contentWindow.document.getElementsByTagName( 'iframe' );
//                    console.log( '---- each sub win ----' );
                    for ( var i = 0; i < subIframes.length; i++ ) {
                        // 递归检测
                        if ( checkAdIframe( subIframes[ i ], domain ) ) {
                            ret = true;
                            break;
                        }
                    }
                    
                    // 没子页面或者没检测出来, 则再检测一次a元素
                    if ( !ret ) {
                        var aList = iframe.contentWindow.document.getElementsByTagName( 'a' );
//                        if (iframe.id=='tanxssp-outer-iframemm_12581624_13592124_54378538') {
//                            console.log( iframe );
//                            console.log( aList );
//                        }
                        for ( var i = 0; i < aList.length; i++ ) {
                            if ( doCheckAdDomain( aList[ i ], domain ) ) {
                                ret = true;
                                break;
                            }
                        }
                    }
                    
                } else {
                    // 跨域后无法检测内部页面是否存在广告域名,此处打上标识,避免重复检测
                    iframe[ '.ad.iframe.checked.' ] = 1;
                }
            }
        } catch ( e ) {
            ret = false;
//            console.log( e );
        } finally {
            iframe = null;
        }
        return ret;
    }
    
    // 找出包含广告元素的外层包装容器
    function findOuterAdWrap( adElem ) {
        var sub = adElem, wrap = sub.parentNode;
        while ( wrap && sub && !/^body|html$/i.test( wrap.nodeName )
                // 暂注释,获取wrap的内容时,需要排除sub的内容
                // && ((wrap.textContent || wrap.innerText || '').replace( /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '' ).length == 0)
                && (wrap.children.length == 1 || !chackIsOuterAdWrap( wrap, sub )) ) {
            sub = wrap;
            wrap = sub.parentNode;
        }
        return sub;
    }
    
    // 检测是否是最外层的广告包装容器
    function chackIsOuterAdWrap( wrap, sub ) {
        if ( !wrap || !sub )
            return false;
        else if ( /^body|html$/i.test( wrap.nodeName ) )
            return true;
        
        var isOuter = false, subCount = 0;
        
        for ( var i = 0, l = wrap.children.length; i < l; i++ ) {
            var elem = wrap.children[ i ];
            
            // 子元素若包含title,meta,则认作嵌入了一个错误的页面
            if ( /^title|meta$/i.test( elem.nodeName ) ) {
                return false;
            }
            
            // 忽略父容器中不可见的元素, 自身不算在检测之内
            if ( elem.nodeType != 1 || elem === sub || /^script|link|style$/i.test( elem.nodeName ) )
                continue;
            
            // 子元素最小尺寸, 小于该尺寸则视为不可见
            var mWidth = 50, mHeight = 30;
            
            var isHide = elem.offsetWidth < mWidth || elem.offsetHeight < mHeight || 'hidden' == currCss( elem, 'visibility' );
            if ( !isHide )
                // 记录可见的兄弟节点个数
                subCount++;
            
            // 判别广告包装层的最外层元素
            if (
                // 任意元素,超过指定尺寸,或只要不是仅有一个img子节点(尺寸不超过指定尺寸的img),或者包含文字内容,则需要展示
                (!isHide && ((elem.offsetWidth >= mWidth || elem.offsetHeight >= mHeight)
                        || ((elem.textContent || elem.innerText).replace( /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '' ).length > 0)
                        || !(elem.children.length <= 1 && /^img$/i.test( elem.children[ 0 ].nodeName ) && (elem.children[ 0 ].offsetWidth < mWidth && elem.children[ 0 ].offsetHeight < mHeight))))
                // 任意元素,隐藏状态,但父元素具备tab关键字
                || (isHide && (/(?:^|[-_\s])tab(?:[-_\s]|$)/i.test( wrap.id + ' ' + wrap.className )))
                ) {
                isOuter = true;
                break;
            }
        }
        
        // console.log('subCount:' + subCount);
        
        // 超过1个元素, 则视为正常节点
        return isOuter || subCount > 0;
    }
    
    // 清理广告, 根据情况选择不同的方式清理
    function clearAd( adElemWrap, clearType ) {
        var success = true;
        
        // 自动处理,若使用了定位,则通过定位隐藏,否则直接移除
        if ( 'auto' == clearType ) {
            // 绝对定位的广告, 直接移动隐藏
            if ( usePosition( adElemWrap ) ) {
                clearType = 'movehide';
            } else {
                // 浮动样式的广告, 占位隐藏, 优先判别下一个元素是否具有浮动,此处:nextElementSibling不兼容浏览器,可再优化
                var floatNone = /^none$/i.test( currCss( adElemWrap.nextElementSibling || adElemWrap, 'float' ) );
                clearType = floatNone ? 'hide' : 'invisible';
            }
        }
        
        switch ( clearType ) {
        case 'invisible' :
            // 占位隐藏
            adElemWrap.style.cssText += ';opacity:0 !important;visibility: hidden !important;pointer-events: none !important;';
            break;
        case 'hide' :
            // 不占位隐藏
            adElemWrap.style.cssText += ';display:none !important;opacity:0 !important;height:0 !important;width:0 !important;pointer-events:none !important;';
            break;
        case 'movehide' :
            // 移动隐藏
            adElemWrap.style.cssText += ';filter:alpha(opacity=0) !important;opacity:0 !important;display:none !important;height:0 !important;bottom:auto !important;top:-99999px !important;left:-99999px !important;z-index:-100 !important;pointer-events:none !important;';
            break;
        case 'remove' :
            // 元素移除, 直接删除导致页面存在js报错问题
            adElemWrap.parentNode &&
            adElemWrap.parentNode.removeChild &&
            adElemWrap.parentNode.removeChild( adElemWrap );
            break;
        default : success = false; break;
        }
        
        // 打上标识, 避免重复被清理而耗损性能
        adElemWrap.setAttribute( _clearProperty, success ? '1' : '0' );
        
        return success;
    }
    
    // 主入口
    function main( findDepth ) {
        if ( window.top != window )
            return;
        
        // # 去掉过滤出的广告域名, 从过滤列表中取得当前域名下需要过滤的域名
        var fds = _filterDomains[ _currDomain ];
        if ( fds ) {
            for ( var i = 0; i < fds.length; i++ ) {
                // 需要过滤的域名
                var fd = fds[ i ].toLowerCase();
                
                for ( var j = 0; j < _adDomains.length; j++ ) {
                    if ( fd == _adDomains[ j ].toLowerCase() ) {
                        // 把数组最后一个覆盖j索引位置, 并让数组长度减1
                        _adDomains[ j-- ] = _adDomains[ _adDomains.length - 1 ];
                        _adDomains.length -= 1;
                    }
                }
            }
        }
        
        // 过滤出所有的广告元素,findDepth缺省检索深度20层
        findSuspiciousAdElem( findDepth );
        
        // 从已确认的广告列表中, 清理广告元素
        var clearProportion = 100; // 清理比例10%, 则表示仅仅删除10%的广告, 其他保留, 缺省为100%;
        for ( var i = 0, len = Math.round( _adElems.length * clearProportion / 100 ); i < len; i++ ) {
            var elem = _adElems[ i ];
            var adElemWrap = findOuterAdWrap( elem );
            adElemWrap && clearAd( adElemWrap, 'auto' ) && testLogClearAdCount++;
        }
        
        // # test log
        testLogAdElems = testLogAdElems.concat( _adElems );
        testLogTxt = '[广告清理 v' + _version + '] - 查出广告元素 %c' + testLogAdElems.length +
                     ' %c个：匹配Box广告 %c' + _findBoxRuleCount +
                     ' %c个、匹配属性广告 %c' + _findAttrRuleCount +
                     ' %c个、匹配域名广告 %c' + _findDomainRuleCount +
                     ' %c个，成功清理 %c' + testLogClearAdCount +
                     ' %c个广告，清理率 %c' + clearProportion +
                     ' %c%';
        testLogTxtColor = [ 'color:red',
                            'color:#000', 'color:red',
                            'color:#000', 'color:red',
                            'color:#000', 'color:red',
                            'color:#000', 'color:red',
                            'color:#000', 'color:red',
                            'color:#000' ];
    }
    
    // # TEST LOG
    var testLogTxt, testLogTxtColor = [], testLogAdElems = [],
        testLogClearAdCount = 0, testLogClearCount = 0, testLogUseTime = 0;
    
    // 每500毫秒清理一次, 持续清理10秒
    var speedTime = 500, maxTime = 10 * 1000 + speedTime,
        startTime = new Date().getTime();
    
    // 无阻塞方式渲执行清理 
    setTimeout( function() {
        testLogClearCount++;
        if ( testLogClearCount == 1 )
            window.console && console.log( '[广告清理 v' + _version + '] - 正在清理广告...' );
        
        // 调用主入口函数,默认检索深度为20层
        var t = new Date().getTime();
        main( 20 );
        var t2 = new Date().getTime() - t;
        
        testLogUseTime += t2;
        
        if ( false && t < startTime + maxTime )
            setTimeout( arguments.callee, speedTime );
        
        // # TEST LOG
        else if ( window.console ) {
            window._showADClearLog && console.log( testLogAdElems );
            testLogTxt && console.log.apply( console, [ testLogTxt ].concat( testLogTxtColor ) );
            console.log( '[广告清理 v' + _version + '] - 清理完毕，共清理广告 ' + testLogClearCount + ' 次，总耗时：' + testLogUseTime + 'ms，单次平均耗时：' + (testLogUseTime / testLogClearCount >> 0) + 'ms' );
            
            var cc = 0;
            for ( var k in domainCheckCount ) {
                if ( k && domainCheckCount.hasOwnProperty( k ) ) {
                    cc++;
                    window._showADClearLog && console.log( k + '检索次数:' + domainCheckCount[ k ] );
                }
            }
            
            var c = 0;
            for ( var k in domainHitCount ) {
                if ( k && domainHitCount.hasOwnProperty( k ) ) {
                    c++;
                    window._showADClearLog && console.log( k + '命中次数:' + domainHitCount[ k ] );
                }
            }
            
            window._showADClearLog && console.log( '总广告域名:' + _adDomains.length + '个, 被检索的广告域名:' + cc + '个, 命中广告域名:' + c + '个' );
            window._showADClearLog && console.log( 'checkAdIframe执行次数:' + sss );
        }
    }, 0 );
    
    
    // ####### 嵌入一个md5计算函数
    
    /**
     * 嵌入一个计算md5的jquery插件,但不绑定到jquery对象上,而是绑定到一个空函数对象上,从而能够直接使用md5功能
     */
    var jQuery = function(){};
    
    /*
     * jQuery MD5 Plugin 1.2.1
     * https://github.com/blueimp/jQuery-MD5
     *
     * Copyright 2010, Sebastian Tschan
     * https://blueimp.net
     *
     * Licensed under the MIT license:
     * http://creativecommons.org/licenses/MIT/
     * 
     * Based on
     * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
     * Digest Algorithm, as defined in RFC 1321.
     * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * Distributed under the BSD License
     * See http://pajhome.org.uk/crypt/md5 for more info.
     *//*jslint bitwise: true *//*global unescape, jQuery */
    (function(f){function n(t,w){var v=(t&65535)+(w&65535),u=(t>>16)+(w>>16)+(v>>16);return(u<<16)|(v&65535)}function r(t,u){return(t<<u)|(t>>>(32-u))}function c(A,w,v,u,z,y){return n(r(n(n(w,A),n(u,y)),z),v)}function b(w,v,B,A,u,z,y){return c((v&B)|((~v)&A),w,v,u,z,y)}function h(w,v,B,A,u,z,y){return c((v&A)|(B&(~A)),w,v,u,z,y)}function m(w,v,B,A,u,z,y){return c(v^B^A,w,v,u,z,y)}function a(w,v,B,A,u,z,y){return c(B^(v|(~A)),w,v,u,z,y)}function d(E,z){E[z>>5]|=128<<((z)%32);E[(((z+64)>>>9)<<4)+14]=z;var v,y,w,u,t,D=1732584193,C=-271733879,B=-1732584194,A=271733878;for(v=0;v<E.length;v+=16){y=D;w=C;u=B;t=A;D=b(D,C,B,A,E[v],7,-680876936);A=b(A,D,C,B,E[v+1],12,-389564586);B=b(B,A,D,C,E[v+2],17,606105819);C=b(C,B,A,D,E[v+3],22,-1044525330);D=b(D,C,B,A,E[v+4],7,-176418897);A=b(A,D,C,B,E[v+5],12,1200080426);B=b(B,A,D,C,E[v+6],17,-1473231341);C=b(C,B,A,D,E[v+7],22,-45705983);D=b(D,C,B,A,E[v+8],7,1770035416);A=b(A,D,C,B,E[v+9],12,-1958414417);B=b(B,A,D,C,E[v+10],17,-42063);C=b(C,B,A,D,E[v+11],22,-1990404162);D=b(D,C,B,A,E[v+12],7,1804603682);A=b(A,D,C,B,E[v+13],12,-40341101);B=b(B,A,D,C,E[v+14],17,-1502002290);C=b(C,B,A,D,E[v+15],22,1236535329);D=h(D,C,B,A,E[v+1],5,-165796510);A=h(A,D,C,B,E[v+6],9,-1069501632);B=h(B,A,D,C,E[v+11],14,643717713);C=h(C,B,A,D,E[v],20,-373897302);D=h(D,C,B,A,E[v+5],5,-701558691);A=h(A,D,C,B,E[v+10],9,38016083);B=h(B,A,D,C,E[v+15],14,-660478335);C=h(C,B,A,D,E[v+4],20,-405537848);D=h(D,C,B,A,E[v+9],5,568446438);A=h(A,D,C,B,E[v+14],9,-1019803690);B=h(B,A,D,C,E[v+3],14,-187363961);C=h(C,B,A,D,E[v+8],20,1163531501);D=h(D,C,B,A,E[v+13],5,-1444681467);A=h(A,D,C,B,E[v+2],9,-51403784);B=h(B,A,D,C,E[v+7],14,1735328473);C=h(C,B,A,D,E[v+12],20,-1926607734);D=m(D,C,B,A,E[v+5],4,-378558);A=m(A,D,C,B,E[v+8],11,-2022574463);B=m(B,A,D,C,E[v+11],16,1839030562);C=m(C,B,A,D,E[v+14],23,-35309556);D=m(D,C,B,A,E[v+1],4,-1530992060);A=m(A,D,C,B,E[v+4],11,1272893353);B=m(B,A,D,C,E[v+7],16,-155497632);C=m(C,B,A,D,E[v+10],23,-1094730640);D=m(D,C,B,A,E[v+13],4,681279174);A=m(A,D,C,B,E[v],11,-358537222);B=m(B,A,D,C,E[v+3],16,-722521979);C=m(C,B,A,D,E[v+6],23,76029189);D=m(D,C,B,A,E[v+9],4,-640364487);A=m(A,D,C,B,E[v+12],11,-421815835);B=m(B,A,D,C,E[v+15],16,530742520);C=m(C,B,A,D,E[v+2],23,-995338651);D=a(D,C,B,A,E[v],6,-198630844);A=a(A,D,C,B,E[v+7],10,1126891415);B=a(B,A,D,C,E[v+14],15,-1416354905);C=a(C,B,A,D,E[v+5],21,-57434055);D=a(D,C,B,A,E[v+12],6,1700485571);A=a(A,D,C,B,E[v+3],10,-1894986606);B=a(B,A,D,C,E[v+10],15,-1051523);C=a(C,B,A,D,E[v+1],21,-2054922799);D=a(D,C,B,A,E[v+8],6,1873313359);A=a(A,D,C,B,E[v+15],10,-30611744);B=a(B,A,D,C,E[v+6],15,-1560198380);C=a(C,B,A,D,E[v+13],21,1309151649);D=a(D,C,B,A,E[v+4],6,-145523070);A=a(A,D,C,B,E[v+11],10,-1120210379);B=a(B,A,D,C,E[v+2],15,718787259);C=a(C,B,A,D,E[v+9],21,-343485551);D=n(D,y);C=n(C,w);B=n(B,u);A=n(A,t)}return[D,C,B,A]}function o(u){var v,t="";for(v=0;v<u.length*32;v+=8){t+=String.fromCharCode((u[v>>5]>>>(v%32))&255)}return t}function i(u){var v,t=[];t[(u.length>>2)-1]=undefined;for(v=0;v<t.length;v+=1){t[v]=0}for(v=0;v<u.length*8;v+=8){t[v>>5]|=(u.charCodeAt(v/8)&255)<<(v%32)}return t}function j(t){return o(d(i(t),t.length*8))}function e(v,y){var u,x=i(v),t=[],w=[],z;t[15]=w[15]=undefined;if(x.length>16){x=d(x,v.length*8)}for(u=0;u<16;u+=1){t[u]=x[u]^909522486;w[u]=x[u]^1549556828}z=d(t.concat(i(y)),512+y.length*8);return o(d(w.concat(z),512+128))}function s(v){var y="0123456789abcdef",u="",t,w;for(w=0;w<v.length;w+=1){t=v.charCodeAt(w);u+=y.charAt((t>>>4)&15)+y.charAt(t&15)}return u}function l(t){return unescape(encodeURIComponent(t))}function p(t){return j(l(t))}function k(t){return s(p(t))}function g(t,u){return e(l(t),l(u))}function q(t,u){return s(g(t,u))}f.md5=function(u,v,t){if(!v){if(!t){return k(u)}else{return p(u)}}if(!t){return q(v,u)}else{return g(v,u)}}}(typeof jQuery==="function"?jQuery:this));
} )();