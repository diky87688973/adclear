/**
 * 广告清理-移动版 v1.1
 */

( function() {
    // 过滤出的元素标签名
    var tagNamesReg = /^div|a|table|iframe|span|ul|ins$/i;
    
    // 广告规则列表
    var rules = [ {
      /*  type : 'css',   // 顶部
        position : 'fixed',
        top : '-10,30',
        left : '-10,30',
        right : '-10,30',
        height : '20,100'
    }, {
        type : 'css',   // 底部
        position : 'fixed',
        bottom : '-10,30',
        left : '-10,30',
        right : '-10,30',
        height : '20,100'
    }, {*/
        type : 'css',   // 全屏,固定定位
        position : 'fixed',
        top : '-10,30',
        left : '-10,30',
        right : '-10,30',
        bottom : '-10,30'
    },  {
        type : 'css',   // 全屏,绝对定位
        position : 'absolute',
        top : '-10,30',
        left : '-10,30',
        right : '-10,30',
        bottom : '-10,30'
    }, {
        // 属性规则, 属性前缀, 适用[常用广告平台]
        type : 'attrPrefix',
        id : 'tanx' // id="tanx..."
    }, {
        type : 'attrPrefix',
        id : 'tanx-popwin-'
    } ];
    
    // 常见广告域名
    var domains = [ 'pos.baidu.com',        // 百度
                    'strip.taobaocdn.com',  // 淘宝
                    'www.cokolo.cn',
                    'topic.cokolo.cn',
                    'c1.ifengimg.com'
                  ];
    
    // 可疑的广告元素
    var sAdElems = [];
    
    // 确定的广告元素
    var adElems = [];
    
    // 分析页面元素,查找可疑的广告元素, findDepth - 检索深度,从根节点开始
    function findSuspiciousAdElem( findDepth ) {
        findDepth = findDepth >> 0 || 20;
        sAdElems  = [];
        adElems   = [];
        
        /*var elems = [];
        if ( document.querySelectorAll )
            elems = document.querySelectorAll( '*' );
        else if ( document.all ) {
            elems = document.all;
        } else {*/
        _findAll( document.body, findDepth );
        /*}*/
        
        /*// 判断是否使用了定位样式
        for ( var i = 0, l = elems.length; i < l; i++ ) {
            var elem = elems[ i ];
            if ( elem && _usePosition( elem ) ) {
                sAdElems.push( elem );
            }
        }*/
    }
    
    // 递归查询dom,可指定检索深度,缺省深度20
    function _findAll( dom, depth ) {
        if ( depth <= 0 || !dom || dom.nodeType != 1 )
            return;
        
        for ( var i = 0, l = dom.children.length; i < l; i++ ) {
            var elem = dom.children[ i ];
            
            if ( elem.nodeType != 1 )
                continue;
            
            // 排除自己的广告(含有_YWF_,或含有_YWF_ADBOX的样式名)
            if ( !(elem._YWF_ || /\b_YWF_ADBOX\b/i.test( elem.className )) ) {
                // 是否可疑,若使用了定位,且属于指定的标签,则视为可疑元素,追加进可疑列表,并停止向内递归
                if ( _usePosition( elem ) && tagNamesReg.test( elem.nodeName ) ) {
                    sAdElems.push( elem );
                } else
                    _findAll( elem, depth - 1 );
            }
        }
    }
    
    // 是否使用了绝对定位或固定定位,1-absolute,2-fixed,0-其他
    function _usePosition( elem ) {
        var style = _currCss( elem, 'position' ) + '';
        
        // 绝对定位或固定定位:absolute,fixed
        if ( /^absolute$/i.test( style ) ) {
            return 1;
        } else if ( /^fixed$/i.test( style ) ) {
            return 2;
        }
        return 0;
    }
    
    // 获取当前使用的样式值, 样式名需遵守驼峰风格
    function _currCss( elem, styleName ) {
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
                    style = elem.offsetTop + 'px';
                break;
            case 'left' :
                    style = elem.offsetLeft + 'px';
                break;
            case 'right' :
                    style = (elem.parentNode.offsetWidth - elem.offsetLeft - elem.offsetWidth) + 'px';
                break;
            case 'bottom' :
                    style = (elem.parentNode.offsetHeight - elem.offsetTop - elem.offsetHeight) + 'px';
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
    // window._currCss = _currCss;
    
    // 清理广告, 根据情况选择不同的方式清理
    function clearAd( adElemWrap, clearType ) {
        var success = true;
        
        // 自动处理,若使用了定位,则通过定位隐藏,否则直接移除
        if ( 'auto' == clearType ) {
            var positionType = _usePosition( adElemWrap );
            clearType = positionType ? 'movehide' : 'remove';
        }
        
        switch ( clearType ) {
        case 'remove' :
            adElemWrap.parentNode &&
            adElemWrap.parentNode.removeChild &&
            adElemWrap.parentNode.removeChild( adElemWrap );
            break;
        case 'hide' :
            adElemWrap.style.display = 'none';
            break;
        case 'movehide' :
            adElemWrap.style.visibility = 'hidden';
            adElemWrap.style.cssText += ';bottom:auto !important;top:-9999px !important;z-index:-100 !important;';
            break;
        default : success = false; break;
        }
        return success;
    }
    
    // 检测可疑的广告元素是否匹配规则, 匹配的列入确定广告元素列表
    function checkAdRule( sAdElem ) {
        for ( var i = 0; i < rules.length; i++ ) {
            var rule = rules[ i ];
            
            switch ( rule.type ) {
            // css 规则
            case 'css' :
                var isAd = false, flg = true;
                for ( var s in rule ) {
                    if ( !flg ) break;
                    if ( s && s != 'type' && s != 'position' && rule.hasOwnProperty( s ) ) {
                        if ( rule.position ) {
                            // 若规则中要求有定位样式, 则必须符合定位样式
                            var p = _currCss( sAdElem, 'position' ) + '';
                            if ( p != rule.position ) {
                                isAd = false;
                                flg = false;
                                break;
                            }
                        }
                        
                        /*if ( 'leftCoupletId' == sAdElem.id ) {
                            debugger;
                        }*/
                        
                        var style = _currCss( sAdElem, s );
                        
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
                if ( isAd ) {
                    sAdElem.setAttribute( '_rules_', i );
                    return _pushAdElems( sAdElem );
                }
                break;
            case 'attrPrefix' :
                for ( var s in rule ) {
                    if ( s && s != 'type' && rule.hasOwnProperty( s ) ) {
                        var attr = sAdElem.getAttribute( s );
                        
                        // 没有匹配的值,直接视为不匹配终止校验
                        if ( attr == null )
                            break;
                        
                        if ( attr.indexOf( rule[ s ] ) >= 0 ) {
                            // 符合规则
                            adElems.push( sAdElem );
                            // _pushAdElems( sAdElem );
                            return true;
                        }
                    }
                }
                break;
            }
        }
        
        return false;
    }
    
    // 把确定的元素, 追加到列表中
    function _pushAdElems( elem ) {
        var positionType = _usePosition( elem );
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
            /* 已提取到规则里
            if ( (elem.offsetWidth >= 250 && elem.offsetHeight >= 200) ||
                 (elem.offsetWidth >= 100 && elem.offsetHeight >= 200) ) {
                isAd = true;
            }*/
            break;
        }
        
        if ( isAd ) {
            adElems.push( elem );
            return true;
        }
        return false;
    }
    
    // 检测可疑的广告元素是否含有常见的广告域名链接, 匹配的列入确定广告元素列表
    function checkAdDomain( sAdElem ) {
        for ( var i = 0; i < domains.length; i++ ) {
            var domain = domains[ i ];
            // 递归向内检测是否包含iframe或a标签,且链接在匹配列表之内吗,则视为广告元素
            if ( _chackUrl( sAdElem, domain ) ) {
                adElems.push( sAdElem );
                return true;
            }
        }
        return false;
    }
    
    // 检测url是否匹配
    function _chackUrl( elem, domain ) {
        switch ( elem.nodeName.toLowerCase() ) {
        case 'iframe' :
            var url = (elem.src + '').toLowerCase();
            return url.indexOf( domain ) > -1;
            break;
        case 'a' :
            var url = (elem.href + '').toLowerCase();
            return url.indexOf( domain ) > -1;
        default :
            for ( var i = 0, l = elem.children.length; i < l; i++ ) {
                var el = elem.children[ i ];
                if ( el.nodeType != 1 )
                    continue;
                
                if ( _chackUrl( el, domain ) ) {
                    return true;
                }
            }
            break;
        }
        return false;
    }
    
    // 找出包含广告元素的外层包装容器
    function findWrap( adElem ) {
        var sub = adElem, wrap = sub.parentNode;
        // 仅包含一个元素的父元素,视为最外层包装容器
        while ( wrap && wrap.children.length == 1 ) {
            sub = wrap;
            wrap = sub.parentNode;
        }
        return sub;
    }
    
    // 主入口
    function main() {
        if ( window.top != window )
            return;
        
        var clearCount = 0, ruleCount = 0, domainCoun = 0;
        
        // 过滤出所有可疑的广告元素
        findSuspiciousAdElem( 10 );
        
        // 根据匹配规则和域名规则,过滤出最可能的广告元素
        for ( var i = 0; i < sAdElems.length; i++ ) {
            var elem = sAdElems[ i ];
            var s = checkAdRule( elem );
            if ( s ) {
                ruleCount++; // 符合规则的统计数量+1
            } else if ( checkAdDomain( elem ) ) {
                domainCoun++; // 符合域名规则的统计数量+1
            }
        }
        
        /*// 再一次过滤出非嵌入在页面内部的广告元素
        for ( var i = 0; i < adElems.length; i++ ) {
            var elem = adElems[ i ];
            var e = elem.parentNode;
            // 是否是body元素的直接子元素, 是则视为悬浮广告, 否则从广告元素列表中移除
            if ( !/^body$/i.test( e.nodeName ) ) {
                adElems[ i ] = adElems[ adElems.length - 1 ];
                adElems.length -= 1;
            }
        }*/
        
        for ( var i = 0; i < adElems.length; i++ ) {
            var elem = adElems[ i ];
            var adElemWrap = findWrap( elem );
            // 移动隐藏
            adElemWrap && clearAd( adElemWrap, 'auto' ) && clearCount++;
        }
        
        // test log
        window.console &&
        console.log( '[广告清理] - 查找出可疑广告元素 %c' + sAdElems.length +
                     ' %c个, 分析出 %c' + ruleCount +
                     ' %c个匹配规则的广告, %c' + domainCoun +
                     ' %c个匹配域名的广告, 共 %c' + adElems.length +
                     ' %c个广告, 成功清理 %c' + clearCount +
                     ' %c个广告',
                     'color:red',
                     'color:#000', 'color:red',
                     'color:#000', 'color:red',
                     'color:#000', 'color:red',
                     'color:#000', 'color:red',
                     'color:#000' );
    }
    
    // 每500毫秒清理一次, 持续清理15秒
    var speedTime = 500, maxTime = 15 * 1000 + speedTime,
        startTime = new Date().getTime(),
        useTime = 0,  count = 0;
    setTimeout( function() {
        var t = new Date().getTime();
        main();
        var t2 = new Date().getTime() - t;
        count++;
        useTime += t2;
        window.console && console.log( '[广告清理] - 第 ' + count + ' 次清理, 单次耗时:' + t2 + ', 总耗时:' + useTime );
        if ( t < startTime + maxTime ) setTimeout( arguments.callee, speedTime );
    }, 0 );
    
} )();