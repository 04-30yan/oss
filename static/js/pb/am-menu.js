// for left tree - right view
//  1. Record(req):   add a label to [#pathNav] & record req to [NavChain]
//  2. Enter(req):
$.extend(_,{
    menu:'',
    menusel:'menusel',
    selected:'_m_index',
    selectNoClear:false,
    getTreeItemUrl:null,
    /*treeTheme:'classic',*/
    //初始化树
    InitTree:function(args){
        _.Bind('init',_.OnInitTree,true);
        _.Init(args);
    },
    OnInitTree:function(){
        //_.InitUi(args,true);
        _.Bind('mark',_.OnTreeMark);
        _.Bind('unmark',_.TreeUnmark);

        _.Bind('f5',_.OnTreeInit);
        _.Bind('history',_.OnTreeHistory,true);

        _.Bind('dataload',_.OnDataLoad);
        //_.Start();
    },
    OnTreeHistory:function(req){
        _.Clear();
        if (req.menu) {
            var freq = _.GetNodeReq("#"+req.menu);
            if (freq && freq.url != req.url)
                _.Record(freq);
        }
        _.Record(req);
        if (req.menu && _.menu != req.menu){
            _.menu = req.menu;
            var i = _.tree.find('a.clicked').removeClass('clicked').end().find('#'+_.menu);
            if (i.length)
            {
                _.tree.selected = i;
                i.find('a').addClass('clicked');
            }
        }
        return true;
    },
    OnDataLoad:function(d,req,c){
        _.AutoWatch(c);
        _.AutoCheck(c);
        _.AutoInit(c);
        c.find("input.inputlabel").focus(function(){
                    if (this.value == $(this).attr('title')) {
                        this.value = '';
                        $(this).removeClass('gray');
                    }
                }).blur(function(){
                    if (this.value == '') {
                        this.value = $(this).attr('title');
                        $(this).addClass('gray');
                    }
                }).blur();
    },
    OnTreeMark:function(xArgs,req){
        if (req.name) xArgs._name = req.name;
        if (_.menu) {
            xArgs._menu = _.menu;
            if (!req.menu) req.menu = _.menu;
        }
    },
    TreeUnmark:function(xArgs,req){
        req.name = xArgs._name;
        req.menu = xArgs._menu;
    },
    //on page reload
    OnTreeInit:function(req){
        var selected;
        if (_.IsReqGood(req)){
            selected = [];
            if (req.menu) {
                _.menu = req.menu;
                var firstReq = _.GetNodeReq('#'+req.menu);
                if (firstReq && firstReq.url != req.url){
                    _.Record(firstReq);
                }
            }
            _.Record(req);
        }
        else{
            selected = _.selected;
        }
        _.tree = $(_.menusel);
        if (_.treeTheme){
            _.tree.children("ul").children("li").css("cssText","padding-left:15px !important");
            theme_name = _.treeTheme;
        }
        else{
            theme_name = "^_^";
        }
        _.tree.tree({
            selected:selected,
            ui : {theme_name : theme_name},
            callback:{
                onload:function(t){
                    if (_.getTreeItemUrl){
                        t.settings.data.async = true;
                        t.settings.data.opts.url = _.FullUrl(_.getTreeItemUrl);
                        t.settings.data.type = 'html';
                    }
                },
                beforeclose:function(node,tree){if (!_.treeTheme) return false;},
                beforechange:function(node,tree){
                    if (!_.bugfix){
                        _.tree.find('a.clicked').removeClass('clicked');
                        _.bugfix = true;
                    }
                    var href=$(node).children('a').attr("href");
                    if (!$(node).attr("id"))       
                        return false;
                    return true;
                },
                onselect:function(node,treeobj){
                    if (_.ModFlag()) return _.CheckMod(arguments);
                    var id = $(node).attr('id');
                    if (_.OnTreeSelect){
                        if (_.OnTreeSelect(id) !== undefined)
                            return;
                    }
                    var t = $(node).attr("_t");
                    if (t == "open"){
                        window.open($(node).attr("url"));
                        return;
                    }
                    var req = _.GetNodeReq(node);
                    if (req){
                        _.menu = id;
                        if (!_.selectNoClear) _.Clear();
                        _.Enter(req);
                    }
                }
            }
        });
        _.tree.find("li > a").each(function(){
            if (!$(this).parent().attr("url")){       
                $(this).attr('class','ui-state-disabled');
                $(this).attr('title','功能开发中...');
            }
        }); 
        if (!_.getTreeItemUrl && !_.noExpandAll || _.noExpandAll === false){
            _.tree.find("li.closed").removeClass("closed");
            _.tree.find("ul").css("display","block");
        }
        if (_.menu)
            _.tree.find('a.clicked').removeClass('clicked').end().find('#'+_.menu).children('a').addClass('clicked');
    },
    //-----------private function--------------
    GetNodeReq:function(sel){
        var $n = $(sel);
        var url = $n.attr('url');
        var req = false;
        if (url){
            var prefix = $n.attr('_prefix');
            if (!prefix) {
                _.urlPrefix = _.defaultUrlPrefix;
            }
            else {
                _.urlPrefix = prefix;
            }
            var $a = $n.find('a:first');
            req = {url:_.FullUrl(url),name:$a.text()};
            var type = $n.attr('_type');
            if (type) req.type = type;
            var post = $n.attr('_post');
            if (post) req.post = true;
            //_.InitNew(req);
        }
        return req;
    },
    //----------- tab------------
    InitTab:function(args){
        _.Bind("init",_.OnInitTab);
        _.selected = 1;
        _.Init(args);
    },
    OnInitTab:function(args,Tabsel,selected){
        //_.InitUi(args,true);
        _.Bind('mark',_.OnTreeMark);
        _.Bind('unmark',_.TreeUnmark);

        _.Bind('f5',_.OnTabInit,true);
        _.Bind('history',_.OnTabHistory,true);

        _.Bind('dataload',_.OnDataLoad);
        //_.Start();
    },
    ChangeTab:function(to){
		var o = _.tab.find('#'+to);
        if (o.length){
			_.tab.find('.ui-state-active,.ui-tabs-selected').removeClass('ui-tabs-selected ').removeClass('ui-state-active');
			o.addClass('ui-tabs-selected ').addClass('ui-state-active');
		}
    },
    OnTabHistory:function(req){
        _.Clear();
        if (req.menu) {
            var freq = _.GetNodeReq("#"+req.menu);
            if (freq && freq.url != req.url)
                _.Record(freq);
        }
        _.Record(req);
        if (req.menu !== "" && _.menu != req.menu){
            _.menu = req.menu;
            _.ChangeTab(_.menu);
			//_.tab.tabs('option','selected',_.menu);
        }
        return true;
    },
    OnTabInit:function(req){
        _.tab = $(_.menusel);
		_.tab.children('ul').prepend('<li style="display:none"><a href="xx">test</a></li>');
        _.tab.find('a').attr('href','#'+_.$c.attr("id"));
        if (_.IsReqGood(req)){
            if (req.menu !== ""){
                _.menu = req.menu;
                var firstReq = _.GetNodeReq('#'+req.menu);
                if (firstReq && firstReq.url != req.url){
                    _.Record(firstReq);
                }
            }
            _.Record(req);
        }
        _.tab.tabs({
                selected:0,
                spinner:"",
				show:function(e,ui){
					if (_.ModFlag()) return _.CheckMod(arguments);
					var menu = $(ui.tab).parent().attr('id');
                    if (!menu) return;
					var req = _.GetNodeReq('#' + menu);
					if (req){
                        _.menu = menu;
						_.Clear();
						_.Enter(req);
					}
				}
        });
		if (_.IsReqGood(req)){
			_.menu = req.menu;
			_.ChangeTab(_.menu);
		}
        else{
            _.tab.tabs('option','selected',_.selected);
            selected = [];
        }
    }
    /* ---------------   util  --------------- */
});
