/**
 * 广告清理-PC版 v1.2
 * 
 * v1.2 清理内容广告
 * v1.1 清理浮动广告
 */

( function() {
    
    var

    // # 当前站点域名
    _currDomain = location.hostname.toLowerCase(),
    // 确定的广告元素
    _adElems = [],
    // 临时存放已经检测过的域名, 便于快速检测
    _tempFilterDomains = {},
    
    // 被清理的广告元素标识
    _clearProperty = '_a' + 'd_bo' + 'x_wr' + 'ap_cle' + 'aned_',
    
    // # 检索可能是广告元素的正则
    _tagNamesReg_pos = /^div|a|table|iframe|span|ul|ins|em$/i,  // 通过定位判定
    _tagNamesReg_url = /^iframe|embed|object|a$/i,              // 通过路径判定

    // 记录查到的数量, 仅用于输出调试
    _findBoxRuleCount = 0,
    _findAttrRuleCount = 0,
    _findDomainRuleCount = 0,
    
    // # 广告box模型规则(适用于浮动层广告)
    _boxRules = [ {
        // css 规则, 边距范围, 适用[右下角弹窗]
        type : 'css',
        bottom : '-10,50', // 区间[0,30],或者[-10,20],或-10,50;10,30，多个组合用;号隔开
        right : '-10,50',
        width : '200,500',
        height : '200,400'
    }, {
        type : 'css',   // 左下角,方形
        bottom : '-10,50',
        left : '-10,50',
        width : '200,500',
        height : '200,400'
    }, {
        type : 'css',   // 左,长方形
        left : '-10,50',
        width : '100,200',
        height : '200,500'
    }, {
        type : 'css',   // 右,长方形
        right : '-10,50',
        width : '100,200',
        height : '200,500'
    }, {
        type : 'css',   // 任意固定位置, 长方形
        position : 'fixed',
        width : '100,200',
        height : '200,500'
    }, {
        type : 'css',   // 任意固定位置, 约4:3
        position : 'fixed',
        width : '150,500',
        height : '150,300'
    } ],
    
    // # 属性规则, 适用[适用于嵌入在页面内容中的广告,常用广告平台]
    // attrPrefix - 起始匹配,例如:id="tanx...",表示id值以tanx打头的所有元素
    // attrSuffix - 结尾匹配
    // attr       - 包含
    _attrRules = [ {
        type : 'attrPrefix',
        id : 'tanx'
    }, {
        type : 'attrPrefix',
        id : 'adContent-'
    } ],
    
    // # 常见广告域名(适用于内容嵌入广告)
    _adDomains = [
            // 百度
            'pos.baidu.com',
            'pos.baidu.com/zcnm',
            'static.pay.baidu.com/baichuan/adp',
            'entry.baidu.com/rp/home',
            
            // 360搜索
            'api.so.lianmeng.360.cn/searchthrow/api/ads/throw',

            // 爱搜网
            'nads.wuaiso.com',
            
            // 阿里
            'a1.alicdn.com/creation',
            'click.aliyun.com/m',
            'click.tanx.com/ct',
            
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
            'ads.vamaker.com',                      // 万流客
            'same.chinadaily.com.cn/s?',            // 中国日报网
            
            // google
            'googleads.g.doubleclick.net/pagead/ads',
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
                    if ( s && s != 'type' && s != 'position' && rule.hasOwnProperty( s ) ) {
                        if ( rule.position ) {
                            // 若规则中要求有定位样式, 则必须符合定位样式
                            var p = currCss( sAdElem, 'position' ) + '';
                            if ( p != rule.position ) {
                                isAd = false;
                                flg = false;
                                break;
                            }
                        }
                        
                        /*if ( 'leftCoupletId' == sAdElem.id ) {
                            debugger;
                        }*/
                        
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
            case 'attr' :
            case 'attrPrefix' :
            case 'attrSuffix' :
                for ( var s in rule ) {
                    if ( s && s != 'type' && rule.hasOwnProperty( s ) ) {
                        var attr = sAdElem.getAttribute( s );
                        
                        // 没有匹配的值,直接视为不匹配终止校验
                        if ( attr == null )
                            break;
                        
                        if ( ('attr' == rule.type && attr.indexOf( rule[ s ] ) >= 0) ||
                             ('attrPrefix' == rule.type && attr.indexOf( rule[ s ] ) == 0) ||
                             ('attrSuffix' == rule.type && attr.length - attr.lastIndexOf( rule[ s ] ) == rule[ s ].length) ) {
                            
                            // 设置所匹配的规则下标,便于排查
                            sAdElem.setAttribute( '_attr_rules_', i );
                            
                            // 符合规则
                            _adElems.push( sAdElem );
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
        
        /*// 过滤域名, 指定域名下, 过滤不需要屏蔽的广告域名
        switch ( _tempFilterDomains[ domain ] ) {
        // 已有检测,且不在过滤名单中,则不再检测
        case 1 : break;
        
        case true  :
        case false :
            // 若已经检测过, 且是过滤列表中的域名, 则直接返回
            return _tempFilterDomains[ domain ];
            
        case null :
        case undefined :
            // 检测广告域名时,从过滤列表中取得当前域名下需要过滤的域名
            var fds = _filterDomains[ _currDomain ];
            if ( fds ) {
                for ( var i = 0; i < fds.length; i++ ) {
                    if ( fds[ i ] && fds[ i ].toLowerCase() == domain ) {
                        window.console && console.log( '过滤:' + _currDomain + ' 域名下的:' + domain );
                        // 记录已经检测过的域名
                        _tempFilterDomains[ domain ] = false;
                        return false;
                    }
                }
            }
            
            // 赋个状态,避免当前页面重复检索过滤域名列表
            _tempFilterDomains[ domain ] = 1;
            
            break;
        }*/
        
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
    
    
//    function findWrap( adElem ) {
//        var sub = adElem, wrap = sub.parentNode;
//        // 仅包含一个元素的父元素,视为最外层包装容器
//        while ( wrap && sub && !/^body|html$/i.test( wrap.nodeName ) 
//                && (wrap.children.length == 1 || !chackIsNotAdWrap( wrap, sub )) ) {
//            sub = wrap;
//            wrap = sub.parentNode;
//        }
//        return sub;
//    }
    
    // 找出包含广告元素的外层包装容器
    function findOuterAdWrap( adElem ) {
        var sub = adElem, wrap = sub.parentNode;
        while ( wrap && sub && !/^body|html$/i.test( wrap.nodeName ) 
                && (wrap.children.length == 1 || !chackIsOuterAdWrap( wrap, sub )) ) {
            sub = wrap;
            wrap = sub.parentNode;
        }
        return sub;
    }
    
    // 检测父元素下是否仅包含广告元素, 忽略不可见元素
//    function chackIsNotAdWrap( wrap, sub ) {
//        if ( !wrap || !sub || /^body|html$/i.test( wrap.nodeName ) )
//            return true;
//        
//        var has = false, subCount = 0;
//        
//        for ( var i = 0, l = wrap.children.length; i < l; i++ ) {
//            var elem = wrap.children[ i ];
//            
//            // 忽略父容器中不可见的元素, 自身不算在检测之内
//            if ( elem.nodeType != 1 || elem === sub || /^script|link|style$/i.test( elem.nodeName ) )
//                continue;
//            
//            // 子元素若包含title,meta,则认作嵌入了一个错误的页面
//            if ( /^title|meta$/i.test( elem.nodeName ) ) {
//                has = false;
//                break;
//            }
//            
//            // 记录兄弟节点个数
//            subCount++;
//            
//            // 是否不可见
//            var isHide = (elem.offsetWidth == 0 || elem.offsetHeight == 0) || 'visible' == currCss( elem, 'visibility' );
////            if ( isHide ) {
////                continue;
////            }
//            
//            // 判别广告包装层的最外层元素
//            if ( subCount > 4 // 超过4个元素, 则视为正常节点
//                    // 非a元素,且具有尺寸,则需要展示
//                    || (!/^a$/i.test( elem.nodeName ) && !isHide && (elem.offsetWidth > 50 || elem.offsetHeight > 30))
//                    // 非a元素,无尺寸,但父元素具备tab关键字
//                    || (!/^a$/i.test( elem.nodeName ) && (elem.offsetWidth == 0 || elem.offsetHeight == 0)
//                            && (elem.parentNode && /(?:^|[-_\s])tab(?:[-_\s]|$)/i.test( elem.parentNode.id + ' ' + elem.parentNode.className )))
//                    // a元素,且子节点有一个img或者没有
//                    || (/^a$/i.test( elem.nodeName ) && !(!elem.children.length || elem.children.length == 1 && /^img$/i.test( elem.children[ 0 ].nodeName )))
//                ) {
//                has = true;
//                break;
//            }
//        }
//        
//        return has;
//    }
    
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
                // 任意元素,超过指定尺寸,或只要不是仅有一个img子节点(尺寸不超过指定尺寸的img),则需要展示
                (!isHide && ((elem.offsetWidth >= mWidth || elem.offsetHeight >= mHeight)
                        || !(!elem.children.length || elem.children.length == 1 
                        && /^img$/i.test( elem.children[ 0 ].nodeName ) 
                        && (elem.children[ 0 ].offsetWidth < mWidth && elem.children[ 0 ].offsetHeight < mHeight))))
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
    function main() {
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
        
        // 过滤出所有的广告元素
        findSuspiciousAdElem( 20 );
        
        // 从已确认的广告列表中, 清理广告元素
        var clearProportion = 100; // 清理比例10%, 则表示仅仅删除10%的广告, 其他保留, 缺省为100%;
        for ( var i = 0, len = Math.round( _adElems.length * clearProportion / 100 ); i < len; i++ ) {
            var elem = _adElems[ i ];
            var adElemWrap = findOuterAdWrap( elem );
            adElemWrap && clearAd( adElemWrap, 'auto' ) && testLogClearAdCount++;
        }
        
        // # test log
        testLogAdElems = testLogAdElems.concat( _adElems );
        testLogTxt = '[广告清理] - 查出广告元素 %c' + testLogAdElems.length +
                     ' %c个, 匹配Box广告 %c' + _findBoxRuleCount +
                     ' %c个, 匹配属性广告 %c' + _findAttrRuleCount +
                     ' %c个, 匹配域名广告 %c' + _findDomainRuleCount +
                     ' %c个, 成功清理 %c' + testLogClearAdCount +
                     ' %c个广告, 清理率 %c' + clearProportion +
                     ' %c%';
        testLogTxtColor = [ 'color:red',
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
    
    setTimeout( function() {
        testLogClearCount++;
        if ( testLogClearCount == 1 )
            window.console && console.log( '[广告清理] - 正在清理广告...' );
        
        var t = new Date().getTime();
        main();
        var t2 = new Date().getTime() - t;
        
        testLogUseTime += t2;
        
        if ( false && t < startTime + maxTime )
            setTimeout( arguments.callee, speedTime );
        
        // # TEST LOG
        else if ( window.console ) {
            window._showADClearLog && console.log( testLogAdElems );
            testLogTxt && console.log.apply( console, [ testLogTxt ].concat( testLogTxtColor ) );
            console.log( '[广告清理] - 清理完毕, 共清理广告 ' + testLogClearCount + ' 次, 总耗时:' + testLogUseTime + 'ms, 单次平均耗时:' + (testLogUseTime / testLogClearCount >> 0) + 'ms' );
            
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
    
} )();