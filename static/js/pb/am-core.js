/***** ajax request manager *******
 *  [ ajax request ]
 *
 *  url & args & type & c & cb & post
 *
 * req = {
 *    exec:Function
 *    url :string[undefined],
 *    args:object[undefined],  // 
 *    type:undefined | 'html' | 'json'
 *    post:undefined|0|1
 *    c:string, // jQuery selector
 *    cb: Function || array of Function,
 * }
 *
 */


(function(){

//var __ = window._,_ajaxMan = window.ajaxMan;
var ajaxMan = {
    reqs:[],
    last:null,
    urlPrefix:'',
    modFlag:false,
    firstN:-1,
    defaultType:'json',
    firstReq:{},
    appName:'[地球人迁往火星资源管理系统V1.0]',
    eventCB:{},//event call back
    $c:$(), // main container
    $nav:$(),
    navClass:'curTitle',
    //master req
    mreqs:[],
    maxMreq:-1,
    // attribute member get & set
    C:function(d){
        if (d !== undefined)
            _.$c.html(d);
        return _.$c;
    },
    FullUrl:function(url){
         if (url && url.length > 0 && url.charAt(0) != '/' && url.search(/^http:\/\//i) == -1)
            return _.urlPrefix + url;
        return url;
    },
    // initialize @ window.onload
    RestoreTitle:function(){
        document.title = _.oldTitle;
    },
    Init:function(args){
        $.extend(this,args);
        _.defaultUrlPrefix = _.urlPrefix;
        _.oldTitle = document.title;
        _.$c.ajaxError(function(e,x){
                _.UnblockUi();
                _.EndLoading();
                _.TipsShow("<div>服务器出错,请联系模块负责人。</div>");
            });
        //$(document).ajaxComplete(_.RestoreTitle);
        if ($.browser.msie) {
            window.setInterval("_.RestoreTitle()",50);
        }
        _.TipsShow.overflow = $('body').css('overflow');
        $(window).hashchange(function(){
                //first. unserialize req
                var xArgs = _.GetHashArgs();
                var cnt = _.reqs.length;
                var req = {};
                if (xArgs){
                    if (xArgs._v == _.v && cnt != 0){
                        if (_.IsIndexOK(xArgs._n)){
                            //may be ...
                            req = _.reqs[xArgs._n];
                        }
                        else{
                            //ignore
                            //req = _.UnmarkUrl(xArgs);
                        }
                    }
                    else{
                        if (cnt == 0){
                            if (xArgs._url)
                                req = _.UnmarkUrl(xArgs);
                        }
                        else{
                            if (xArgs._url){
                                //last session
                                req = _.UnmarkUrl(xArgs);
                                req.executed = true;
                            }
                        }

                    }
                }
                if (cnt != 0){
                    _.ExecFromUrl(req); //execute now
                }
                else {
                    //alert("f5");
                    if (_.Trigger('f5',[req]) !== undefined)
                        return;
                    else if (_.IsReqGood(req)){
                        _.New(req);
                    }
                }
            }).bind('beforeunload',function(){
                    //监听页面离开事件
                    if (_.QueryToLeave())
                        return "【****当前页面已被修改，但尚未保存****】";
                });
        _.Trigger("init",[args]);
        $.event.trigger('hashchange');
    },
    // --------- begin public function --------
    //  New类型请求的初始化
    IsReqGood:function(req){
        return req && req.exec;
    },
    InitNew:function(req){
        if (!req.exec){
            req.exec = _.ProcessNew;
            req.url = _.FullUrl(req.url);
            if (!req.args) req.args = {};
            if (req.type === undefined) req.type = _.defaultType;
            //req.c whill not be here
            //req.cb not care
            //req.post is default: undefined means $.get
        }
    },
    //历史记录 + 执行
    New:function(req){
        if (_.QueryToLeave(req)) return _.CheckMod(arguments);
        _.InitNew(req);
        _.PushNew(req);
        _.MarkUrl(req); //will executed by hashchanged callback
        return false;
    },
    ReNew:function(args){
        //if (_.ModFlag()) return _.CheckMod(arguments);
        var req = _.Last();
        if (!req) return false; // ignore
        if (!args) return _.ExecNow(req); // no history recorded
        var req = $.extend(true,{},req);
        //更新参数
        $.extend(req.args,args);
        return _.New(req);
    },
    // 执行
    ExecNew:function(req,args){
        if (_.QueryToLeave(req)) return _.CheckMod(arguments);
        _.InitNew(req);
        //_.PushNew(req);
        _.UpdateArgs(req,args);
        _.ExecNow(req);
        return false;
    },
    Close:function(){
        if (_.lastDialog){
            _.lastDialog.dialog('close');
        }
    },
    //弹出对话框 并执行
    Dialog:function(req,dialogOptions){
        if (_.QueryToLeave(req)) return _.CheckMod(arguments);
        var defaultDialogOptions = {
                autoOpen:true,
                width:800,
                modal:true,
                /*show:'clip',*/
                /*hide:'clip',*/
                title:req.name,
                position:[350,100],
                //closeOnEscape:false,
                beforeClose:function(){
                    if (_.QueryToLeave())
                        return _.CheckMod(arguments);
                    if (_ == this && _.lastDialog) {
                        _.lastDialog.dialog('close');
                        return false;
                    }
                    return true;
                },
                close:function(){
                    //$('div.ui-effects-wrapper').remove();
                    $(this).dialog('destroy').remove();
                    _.ModFlag(false);
                },
                open:function(){
                    req.c = $(this);
                    _.ExecNew(req);
                }
        };
        if (dialogOptions) $.extend(defaultDialogOptions,dialogOptions);
        _.lastDialog = $('<div class="ac_del"><span class="_loading">Loading...</span></div>').dialog(defaultDialogOptions);
        return false;
    },
    //加入主请求 并执行
    Enter:function(req){
        if (_.QueryToLeave(req)) return _.CheckMod(arguments);
        _.Record(req);
        return _.New(req);
    },
    //加入主请求
    Record:function(req){
        if (_.mreqs.length > 0){
            if (_.mreqs[_.mreqs.length - 1].name == req.name)
                return false;
        }
        if (_.maxMreq > 0 && _.mreqs.length >= _.maxMreq) _.GoBack(1,false);
        req = $.extend(true,{},req);
        //_.InitNew(req);
        req.i = _.mreqs.length;
        _.mreqs.push(req);
        if (_.$nav.length){
            //TODO
            var ehtml;
            if (req.name) {
                ehtml = "<a href='' onclick='return _.JumpTo(" + req.i + ",true);'>" + req.name + "</a>";
                if (req.i > 0)
                    //ehtml = "<span style='display:inline-block;' class='ui-icon " + _.navDelimClass + "'></span>"+ehtml;
                    ehtml = "<span>-</span>" + ehtml;
                req.label = $(ehtml);
                _.$nav.append(req.label);
            }
            _.UpdateNav();
        }
        return false;
    },
    LastName:function(){
        if (_.mreqs.length)
            return _.mreqs[_.mreqs.length - 1].name;
        return "";
    },
    LastEnter:function(){
        if (_.mreqs.length)
            return _.mreqs[_.mreqs.length - 1];
        return false;
    },
    Clear:function(){
        _.mreqs = [];
        _.$nav.children().not('[_fixed]').remove();
    },
    ResetEnter:function(args){
        if (_.mreqs.length){
            _.ModFlag(false);
            var lastm = _.mreqs[_.mreqs.length - 1];
            lastm.args = {};
            _.UpdateArgs(lastm,args);
            lastm = $.extend(true,{},lastm);
            return _.New(lastm);
        }
    },
    ReEnter:function(args,name){
        //if (_.ModFlag()) return _.CheckMod(arguments);
        if (_.mreqs.length){
            _.ModFlag(false);
            var lastm = _.mreqs[_.mreqs.length - 1];
            if (name && lastm.label.length>0)
                lastm.label.html(name);
            _.UpdateArgs(lastm,args);
            
            lastm = $.extend(true,{},lastm);
            if (name) lastm.name = name;
            return _.New(lastm);
        }
        return false;
    },
    JumpTo:function(i,reenter){
        if (_.QueryToLeave()) return _.CheckMod(arguments);
        return _.GoBack(_.mreqs.length - i - 1,reenter);
    },
    GoBack:function(count,reenter){
        if (_.QueryToLeave()) return _.CheckMod(arguments);
        if (count === undefined) count = 1;
        else if (count < 0) count = _.mreqs.length + count;
        if (reenter === undefined) reenter = true;
        var i = _.mreqs.length - 1;
        while (count > 0 && i >= 0){
            var cur = _.mreqs[i];
            if (cur.label && cur.label.length){
                cur.label.remove();
                delete cur.label;
            }
            --count;
            --i;
            _.mreqs.pop();
        }
        _.UpdateNav();
        if (reenter)
            _.ReEnter();
        return false;
    },
    // ------------ begin can be overrided function  -------------
    // ajax 开始
    PreLoading:function(msg){
        if (_.$nav.length){
            if (!msg) msg = 'loading...';
            $('._loading',_.$nav).remove();
            $('a',_.$nav).last().append("<span class='_loading'>"+msg+"</span>");
        }
    },
    // ajax 结束
    EndLoading:function(){
        if (_.$nav.length){
            $('._loading',_.$nav).remove();
            _.TipsHide();
        }
    },
    BlockUi:function(){
        $.blockUI({message:'<span><img src="/public/plugin/block-ui/img/indicator.gif"/>Please be patient...</span>', overlayCSS: {opacity:0}});
    },   
    UnblockUi:function(){
        $.unblockUI();
    },   
    // new类型ajax 请求返回结果处理
    // @return : true表示已处理完毕, 否则返回结果(html文本)
    Redirect:function(url){
        if (url) {
            alert("您的OA登陆验证已过期，点击确定后重新登陆");
            window.location = url;
        }
    },
    NewResult:function(d,req,c){
        var data;
        if (req.type == 'json'){
            if (!d){
                _.InfoShow("加载出错");
                if (c && c.length) c.html("加载过程出现错误，请稍后再试");
                return true;
            }
            else if (d.errno){
                if (d._action == "redirect") _.Redirect(d._url);
                var res = _.ErrorShow(d);
                if (c && c.length) c.html(res);
                return true;
            }
            //无错误
            data = d.error;
        }
        else
            data = d; //无错误
        return data;
    },
    // ------------ end can be overrided function  -------------
    //  init(args)        : initialize ajaxman , to bind the following event
    //  f5(req)           : initialize global info
    //  history(req)      : restore global info
    //  mark(xArgs,req)   : get some global info
    //  unmark(xArgs,req) : save some global info
    //  dataload(d,req,c) : global initialize after data is loaded
    Bind:function(name,cb,toHead){
        var opArr = (toHead) ? _.UnshiftArr : _.PushArr;
        _.eventCB[name] = opArr(cb,_.eventCB[name]);
    },
    Trigger:function(name,args){
        return _.CallBack(_.eventCB[name],args,_);
    },
    //------ begin ui helper -----------
    YesNoQuery:function(queryText,cb,cbArgs,pThis){
        queryText = "<div>" + queryText + "</div>";
        $(queryText).dialog({
            title:_.appName,
            modal:true,
            width:450,
            /*height:150,*/
            position:[350,100],
            open:function(){
                $('body').css('overflow','hidden');
            },      
            close:function(){
                $('body').css('overflow',_.TipsShow.overflow);
                $(this).dialog('destroy').remove();
            },
            buttons: {
                '取消': function() { $(this).dialog('close'); },
                '确定': function() {
                    if (!pThis) { 
                        pThis = this;
                        if (!_.AcResult(1,$(this)))
                            return false;
                    }
                    if (!$.isArray(cbArgs))
                        cbArgs = [cbArgs];
                    cb.apply(pThis,cbArgs);
                    $(this).dialog('close');
                 }
            }
        });
        return false;
    },
    InfoShow:function(tips){
        if (tips.charAt(0) != '<')
            tips += "<div>" + tips + "</div>";
        $(tips).dialog({
            modal: true,
            title: _.appName,
            close:function(){
                $(this).dialog('destroy');
            },
            buttons: { '确定': function() { $(this).dialog('close'); } }
        });
    },
    ErrorShow:function(d,c){
        var msg = "<div>请求失败,服务器返回的信息：<span class='ui-state-highlight ui-corner-all'><br/>"+d.error+" (errno: "+d.errno+")]</span></div>";
        _.InfoShow(msg);
        _.AcTips(msg,c);
        return msg;
    },
    /* 信息提示对话框 */
    TipsHide:function(){
        if (_.TipsShow.o) _.TipsShow.o.stop(true,true);
        if (_.TipsShow.dlg) _.TipsShow.dlg.dialog('close');
    },
    TipsShow:function(tips){
        function _beginClose(){
            if (_.TipsShow.s)
                _.TipsShow.o.delay(1200).fadeOut(50,function(){
                        _.TipsShow.dlg.dialog('close');
                    });
        }
        function _beginShow(){
            if (_.TipsShow.s){
                _.TipsShow.o.stop(true).fadeTo(0,1).stop(true,true);
                _.TipsShow.o.css('filter','auto');
            }
        }
        if (!_.TipsShow.dlg){
            _.TipsShow.dlg = $("<div></div>").dialog({
                title: _.appName + '提醒您',
                modal:true,
                minHeight:60,
                autoOpen:false,
                close:function(){
                    $('body').css('overflow',_.TipsShow.overflow);
                    _.TipsShow.s = false;
                    _.TipsShow.o.stop(true).hide();
                },
                open:function(){
                    $('body').css('overflow','hidden');
                    _.TipsShow.s = true;
                    _beginShow();
                    _beginClose();
                    $('.ui-widget-overlay').click(function(){
                            _.TipsShow.dlg.dialog('close');
                        });
                }
            });
            _.TipsShow.o = _.TipsShow.dlg.closest('.ui-dialog').hover(_beginShow,_beginClose);
        }
        _.TipsShow.dlg.html(tips).dialog('open');
    },
    ReadOnly:function(o){
        o.find('input,textarea').filter('.readonly').css('border','none').css('background','transparent').attr('readonly','readonly');
    },
    TextAreaAJ:function(c){
        function _AJ(o)
        {
            var h = parseInt(this.style.height);
            if (isNaN(h) && this.scrollHeight == 0) return;
            if (isNaN(h) || h + 5 < this.scrollHeight || h > this.scrollHeight + 5)
                this.style.height = this.scrollHeight + "px";
            //this.style.posHeight = this.scrollHeight;
        }
        return c.find('textarea.auto_h').css('overflow','hidden').bind('propertychange input focus x',_AJ).trigger('input');
    },
    AutoInit:function(c){
        //反选
        function AutoRevert(c){
            var s_a = c.find("thead a:first");
            if (s_a.attr('auto_sel')) {
                s_a.click(function(){
                    return _.SelectAll(this);
                    });
                /*
                s_a.click(function(){
                    $(this).closest("table").find("tbody tr td:first-child input[type=checkbox]").click();
                    return false;
                });
                */
            }
        }
        AutoRevert(c);
        //under devloping
        c.find("a.todo").not('.ui-state-disabled').addClass("ui-state-disabled").attr("title","功能开发中...").css("color","gray")
		//.css("opacity","0.35")
            .click(function(){
                    alert('开发中');
		    return false;
                });
        //按钮样式
        c.find("button").not('.ui-button').button();
        //rtx 
        if ($.fn.rtxPresence)
            c.find('span.rtx_name').rtxPresence();
        c.find("input.focusedit").addClass("view").hover(function(){
                    $(this).addClass("edit");
                },function(){
                    $(this).removeClass("edit");
                    var ov = $(this).attr("_oldv");
                    if (ov != $(this).val())
                        $(this).addClass("changed");
                    else
                        $(this).removeClass("changed");
                }).dblclick(function(){
                            $(this).val($(this).attr("_oldv")).removeClass("changed");
                        }).each(function(){
                        $(this).attr("_oldv",$(this).val());
                    }).attr("title","双击撤销修改");
        //readonly
        _.ReadOnly(c);
        _.TextAreaAJ(c);
    },
    WatchMod:function(){
        _.ModFlag(true);
    },
    AutoWatch:function(c){
        var f = c.find('form[_watch]');
        if (f.length){
            //input/textarea之类控件内容改变后，修改当前页面标志[除非控件有属性_nowatch
            f.find("input,textarea,select").not('[_nowatch]').change(_.WatchMod);
        }
    },
    GetSelectedIds:function(c,id)
    {
        if (!id) id = 'value';
        if (!c) c = _.$c;
        var ids=[];
        c.find("tr td:first-child input[type=checkbox]").each(function(){
            if ($(this).attr('checked') && $(this).attr(id))
                ids.push($(this).attr(id));
        });
        return ids;
    },
    AjaxSubmit:function(formsel,req){
        _.BlockUi();
        req.type = 'json';
        var $form = $(formsel);
        var ifid=$form.attr('id')+"Result_"; //TODO : random id
        $form.append("<iframe id='"+ifid+"' name='"+ifid+"' style='display:none'></iframe>");
        $form.attr("target",ifid);
        var $ifid=$form.find('#'+ifid);
        $ifid.load(function(){
                _.UnblockUi();
                //var res = $(this).contents().text();
                var res = $(this).contents().find('#cb');
                var x;
                if (res.length > 0)
                    x = {errno:res.attr('errno'),error:res.attr('error')};
                else
                    x= $.evalJSON($(this).contents().text());
                $ifid.remove();
                if (x){
                    var data = _.ReqResult(x,req,$form);
                    if (data === true) return;
                    _.CommCB(x,req,data);
                    /*
                    if (x.errno == 0)
                        _.CommCB(x,req,x.error);
                    else
                        _.ErrorShow(x);
                        */
                }
            });
        $form.submit();
    },
    //级联加载
    CcLoad:function(is_init,param,url,cb)
    {
        var next = $(this);
        var pre;
        if (is_init === true)
            $(this).data("pre",null);
        while (1){
            pre = next;
            if (is_init === true)
                pre.data('cb',cb);
            next = $(next).attr("next");
            if (!next){
                break;
            }
            next = $('#' + next);
            if (!next.length)
                break;
            if (is_init === true)
            {
                pre.change(_.CcLoad);
                pre.data('param',param);
                pre.data('url',url);
                next.data('pre',pre);
            }
            next.html("<option value=''>待加载...</option>").trigger('change');
        }
        next = $(this).attr("next");
        if (!next)
            return;
        var $next = $('#' + next);
        if (!$next.length)
            return;
        var args = {};
        pre = $(this);
        if (!pre.val()&&is_init!==true)
            return;
        url = pre.data('url');
        if (url)
            url = _.FullUrl(url);
        else
            url = ajax_get_url_prefix() + 'get_' + next;
        param = pre.data('param');
        if (is_init !== true){
            if (param)
                args[param] = pre.attr(param);
            while (pre){
                args[pre.attr("id")] = pre.val();
                pre = pre.data('pre');
            }
        }
        else{
            if (param)
                args[param]="";
        }
        $.getJSON(url,args,
                function(data){
                    if (data.errno ==0)
                    {
                        var html = "";
                        var id = data.id;
                        if (!id)
                            id = 'id';
                        var value = data.value;
                        if (!value)
                            value = 'name';
                        var isE = false;
                        for(var i in data.error)
                        {
                            if (!data.error[i])
                                continue;
                            if (data.error[i][id])
                                html += "<option value='" + data.error[i][id] + "'>" + data.error[i][value] + "</option>";
                            else
                            {
                                html += "<option value='' selected='selected'>" + data.error[i][value] + "</option>";
                                isE = true;
                            }
                        }
                        if (!isE)
                                html += "<option value='' selected='selected'>请选择...</option>";
                        if (is_init !== true){
                            $next.html(html);
                            if ($next.data('cb'))
                                $next.data('cb')($next);
                            _.CcLoad.call($next);
                        }
                        else{
                            pre.html(html);
                            if (pre.data('cb'))
                                pre.data('cb')(pre);
                        }
                    }
                    else
                        _.ErrorShow(data);
                });
    },
    //级联加载
    CcLoad2:function(param,url,cb){
        function DoLoad(){
            var d = $(this).data('d');
            var args = {};
            url = pre.data('url');
            if (url)
                url = _.FullUrl(url);
            else
                url = ajax_get_url_prefix() + 'get_' + next;
            param = pre.data('param');
            if (is_init !== true){
                if (param)
                    args[param] = pre.attr(param);
                while (pre){
                    args[pre.attr("id")] = pre.val();
                    pre = pre.data('pre');
                }
            }
            else{
                if (param)
                    args[param]="";
            }
        }
        function DoLoadNext(){
            var next = $(this);
            while (1){
                pre = next;
                if (is_init === true)
                    pre.data('cb',cb);
                next = $(next).attr("next");
                if (!next){
                    break;
                }
                next = $('#' + next);
                if (!next.length)
                    break;
                if (is_init === true)
                {
                    pre.change(_.CcLoad);
                    pre.data('param',param);
                    pre.data('url',url);
                    next.data('pre',pre);
                }
                next.html("<option value=''>待加载...</option>").trigger('change');
            }
        }
        //initialize
        var pre = $(this);
        var d = {url:url,param:param,cb:cb};
        pre.data('pre',null).data('d',d);//.change(cb);
        var next = pre.attr('next');
        while (next){
            //pre.data('cb',cb);
            next = $('#' + next);
            if (!next.length) break;
            pre.change(DoLoadNext);
            next.data('pre',pre).data('d',d);
            //next
            pre = next;
            next = pre.attr('next');
        }
        $.getJSON(url,args,
                function(data){
                    if (data.errno ==0)
                    {
                        var html = "";
                        var id = data.id;
                        if (!id)
                            id = 'id';
                        var value = data.value;
                        if (!value)
                            value = 'name';
                        var isE = false;
                        for(var i in data.error)
                        {
                            if (!data.error[i])
                                continue;
                            if (data.error[i][id])
                                html += "<option value='" + data.error[i][id] + "'>" + data.error[i][value] + "</option>";
                            else
                            {
                                html += "<option value='' selected='selected'>" + data.error[i][value] + "</option>";
                                isE = true;
                            }
                        }
                        if (!isE)
                                html += "<option value='' selected='selected'>请选择...</option>";
                        if (is_init !== true){
                            $next.html(html);
                            if ($next.data('cb'))
                                $next.data('cb')($next);
                            _.CcLoad.call($next);
                        }
                        else{
                            pre.html(html);
                            if (pre.data('cb'))
                                pre.data('cb')(pre);
                        }
                    }
                    else
                        _.ErrorShow(data);
                });
    },
    FolderField:function(o,target)
    {
        if (!target){
            target = $(o).closest('div').nextAll();
        }
        if (target.css("display") != "none")
        {
            target.css("display","none");
            $(o).attr("class","ui-icon ui-icon-circle-triangle-e ib");
            $(o).attr("title",'展开此单元');
        }
        else
        {
            target.css("display","");
            $(o).attr("class","ui-icon ui-icon-circle-triangle-s ib");
            $(o).attr("title",'折叠此单元');
        }	
        return false;
    },
    Test:function(){
         alert("tert");
     },
    SelectAll:function(o,x){
        if (x === undefined) x = 1;
        var objs = $(o).closest("table").find("tbody");
        var checked = objs.find("td:nth-child("+x+") input:checked");
        var all = objs.find("td:nth-child("+x+") input");
        var v = (checked.length != all.length) ? "checked" : "";
        all.attr("checked",v).trigger('change');
        return false;
    },
    //------ end ui helper -----------
    //------- begin utility function -------------------
    //添加元素o到数组x末尾, arr 可为 空 或单个元素
    UnshiftArr:function(o,arr){
        if (!arr) return [o];
        if ($.isArray(arr)){
            arr.unshift(o);
            return arr;
        }
        else return [o,arr];
    },
    //添加元素o到数组x开头, x 可为 空 或单个元素
    PushArr:function(o,x){
        if (!x) return [o];
        else if ($.isArray(x)){
            x.push(o);
            return x;
        }
        else return [x,o];
    },
    //回调函数
    CallBack:function(cb,args,caller,noCheckResult){
        if (!cb) return;
        if (!$.isArray(cb)) cb = [cb];
        //if (!$.isArray(args)) args = [args];
        for(var i in cb){
           var res = cb[i].apply(caller,args);
           if (!noCheckResult && res !== undefined)
               return res;
        }
    },
    SetHash:function(hashStr){
        if (hashStr && hashStr.charAt(0) != '#')
            hashStr = '#' + hashStr;
        location.hash = hashStr;
    },
    SplitArgs:function(queryStr){
        var pairs = queryStr.split('&');
        var args = {};
        for(var i = 0; i < pairs.length; i++) {
            var pos = pairs[i].indexOf('=');
            if (pos == -1) continue; 
            var argname = pairs[i].substring(0,pos);
            var value = pairs[i].substring(pos+1); 
            value = decodeURIComponent(value);
            args[argname] = value;
        }
        return args;
    },
    GetHashArgs:function(){
        var hash = location.hash;
        if (hash && hash.length > 0) return _.SplitArgs(location.hash.substring(1));
        else return false;
    },
    //------ end utility function--------
    //------ begin private function--------
    UpdateLast:function(args){
        if (_.mreqs.length){
            var lastm = _.mreqs[_.mreqs.length - 1];
            _.UpdateArgs(lastm,args);
        }
    },
    UpdateNav:function(){
          var x = $("a",_.$nav);
          if (x.length){
              x = x.removeClass(_.navClass).last();
              if (x.length)
                  x.addClass(_.navClass)[0].blur();
          }
    },
    UpdateArgs:function(req,args){
        if (args){
            if (req.args)
                $.extend(req.args,args);
            else
                req.args = args;
        }
    },
    ExecNow:function(req){
        if (!_.IsReqGood(req)) return;
        req.exec.call(_,req);
    },
    ExecFromUrl:function(req){
        if (!_.IsReqGood(req)) return;
        if (req.exec === _.ProcessNew){
            if (req.c && typeof req.c == "string"){
                if ($(req.c).length <= 0){
                    //TODO:
                    //window.history.go(-1);
                    return;
                }
            }
        }
        if (req.executed && _.IsMarkable(req))
            _.Trigger('history',[req]);
        else
            req.executed = true;
        _.ExecNow(req);
        return false;
    },
    LoadData:function(req,c,data,d){
        if (!c || c.length == 0) return false;
        //TODO:dialog destroy
        if (c === _.$c){
            $("div.ac_del").dialog('destroy').remove();
            $("div.ac_close").each(function(){
                if ($(this).dialog('isOpen')) $(this).dialog('close');
            });
        }
        c.html(data);
        _.Trigger("dataload",[d,req,c]);
    },
    ProcessNew:function(req){
        if (_.PreLoading) _.PreLoading();
        var reqm = ((!req.post)? $.get : $.post);
        reqm(req.url,req.args,function(d){
                if (_.EndLoading) _.EndLoading();
                //step 1. 出错处理
                var c =req.c;
                if (!c) c = _.$c;
				else if (typeof c != "object") c = $(c);
                var data = _.NewResult(d,req,c);
                if (data === true) return;
                if (_.LoadData(req,c,data,d) !== undefined) return;
                //step 4.回调用户
                if (req.cb) _.CallBack(req.cb,[d,req,data],_);
            },req.type);
    },
    ModFlag:function(flag){
        if (flag !== undefined)
            _.modFlag = flag;
        return _.modFlag;
    },
    QueryToLeave:function(req){
        return  _.modFlag && (!req || _.IsMasterReq(req));
    },
    //检查是否修改标志，需要时提示用户
    //if (_.QueryToLeave()) return _.CheckMod(arguments);
    CheckMod:function(args,pThis){
        if (!pThis) pThis = this;
        if (_.modFlag)
            _.YesNoQuery("<div style='line-height:50px;height:50px;padding:0;'>当前页面已被修改，点确定后<span class='ui-state-error '>所作修改将被丢弃</span>，确定离开页面吗？</div>",function(){
                        _.modFlag = false;
                        args.callee.apply(pThis,args);
                    });
        else
            args.callee.apply(pThis,args);
        return false;
    },
    //将请求加入请求链
    PushNew:function(req){
        //special process
        if (_.reqs.length == _.firstN){
            _.reqs.n = _.firstN;
            _.reqs.push(_.firstReq);
            //_.firstReq = null;
        }
        req.n = _.reqs.length;
        delete req.executed; //!important
        _.reqs.push(req);
        _.Last(req);
    },
    Last:function(req){
        if (req) _.last = req;
        return _.last;
    },
    //判断是否可序列化
    IsMarkable:function(req){
        return req.url && !req.cb && (!req.c || req.c === _.$c) && (req.exec === _.ProcessNew);
    },
    IsMasterReq:function(req){
        return req.url && !req.cb && (!req.c || req.c === _.$c) && (!req.exec || req.exec === _.ProcessNew);
    },
    IsUnmarkable:function(xArgs){
        return xArgs && xArgs._url;
    },
    IsIndexOK:function(n){
        return n !== undefined && n >= 0 && n < _.reqs.length;
    },
    //将请求附加到浏览器url，以便页面刷新时能回到当前页面
    MarkUrl:function(req){
        var xArgs = { _n : req.n , _v:_.v};
        if (_.IsMarkable(req)){
            //mark url
            xArgs._url = req.url;
            xArgs._type = req.type;
            if (req.post) xArgs._post = 1;
            for(var i in req.args)
                if (req.args[i] !== undefined)
                    xArgs[i] = req.args[i];
            _.Trigger('mark',[xArgs,req]);
        }
        _.SetHashArgs(xArgs,req);
    },
    //反序列化请求
    UnmarkUrl:function(xArgs){
        var req = {};
        if (_.IsUnmarkable(xArgs)){
            req.url = xArgs._url;
            if (xArgs._type !==  undefined) req.type = xArgs._type;
            if (xArgs._post !== undefined) req.post = xArgs._post;
            _.InitNew(req);
            for(var x in xArgs){
                if (x && x.length && x.charAt(0) != '_'){
                    req.args[x] = xArgs[x];
                }
            }
            _.Trigger('unmark',[xArgs,req]);
        }
        return req;
    },
    //设置url参数
    SetHashArgs:function(args,req){
        var query=[];
        for(var n in args)
            if (args[n] !== undefined)
                query.push(n+'='+encodeURIComponent(args[n]));
        query = query.join('&');
        if (req) _.Trigger('markurl',[query,req]);
        location.hash = '#'+query;
    },
    //-------- end private ---------
    v:Math.random(),
    version:'ajax man 2.0'
};
window._ = window.ajaxMan = ajaxMan;

})();


// ----  unrepeated ajax request wrapper -------
$.extend(_,{
    CustomResult:function(type,d,c){
        var data;
        if (type == 'json'){
            if (!d){
                _.InfoShow("加载出错,服务器返回格式不对");
                //if (req.fr) _.ReEnter();
                return true;
            }
            else if (d.errno != 0){
                _.ErrorShow(d,c);
                //if (req.fr || d.fr) _.ReEnter();
                return true;
            }
            //无错误
            data = d.error;
        }
        else
            data = d; //无错误
        return data;
    },
	Post:function(url, data, callback, type ) {
		//shift arguments if data argument was omited
		if ($.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = null;
		}
        if (_.PreLoading) _.PreLoading();
        $.post(_.FullUrl(url),data,function(d){
            if (_.EndLoading) _.EndLoading();
            var data = _.CustomResult(type,d);
            if (data == true) return;
            callback(d,data);
        },type);
    },
	Get:function(url, data, callback, type ) {
		//shift arguments if data argument was omited
		if ($.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = null;
		}
        if (_.PreLoading) _.PreLoading();
        $.get(_.FullUrl(url),data,function(d){
            if (_.EndLoading) _.EndLoading();
            var data = _.CustomResult(type,d);
            if (data == true) return;
            callback(d,data);
        },type);
    },
    Req:function(req,queryMsg,noQuery,setArgsCb){
        if (queryMsg && !noQuery){
            return _.YesNoQuery(queryMsg,arguments.callee,[req,null,true,setArgsCb]);
        }
        if (setArgsCb) setArgsCb.call(this,req);
        //initialzie default args
        //if (!req.url) return true;
        req.url = _.FullUrl(req.url);
        if (!req.args) req.args = {};
        if (req.type === undefined) req.type = 'json';
        //req.c whill not be here
        //req.cb not care
        if (req.post === undefined) req.post = true;
        _.ProcessReq(req);
        return false;
    },
    Update:function(req,msg,setArgsCb){
        if (msg !== undefined){
            if (!msg){
                msg = "该操作不可恢复，确定"
                var action = req.action;
                if (!action)
                    action = "提交请求";
                msg += "<span class='ui-state-highlight'>[" + action+ "]</span>";
                msg += "吗？";
            }
        }
        if (req.nomod === undefined) req.nomod = 1;
        if (req.proc === undefined) req.proc = _.ReEnter;
        return _.Request(req,msg,false,setArgsCb);
    },
    Delete:function(req,msg,setArgsCb){
        if (msg !== undefined){
            if (!msg){
                msg = "该操作不可恢复，确定删除"
                if (req.name)
                    msg += "<span class='ui-state-highlight'>[" + req.name + "]</span>";
                msg += "吗？";
            }
        }
        //if (req.nomod === undefined) req.nomod = 1;
        if (req.bc === undefined) req.bc = 1;
        if (req.proc === undefined) req.proc = _.ReEnter;
        return _.Request(req,msg,false,setArgsCb);
    },
    FormSubmit:function(formsel,req,queryMsg,noQuery){
        if (!noQuery){
            if (!queryMsg)
                queryMsg = "提交后将不能修改，确认提交吗？";
            return _.YesNoQuery(queryMsg,arguments.callee,[formsel,req,null,true]);
        }
        _.ModFlag(false);
        req.type = 'json';
        //req.cb = _.PushArr(_.CommCB,req.cb);
        _.AjaxSubmit(formsel,req);
        return false;
    },
    // ------------ begin can be overrided function  -------------
    // new类型ajax 请求返回结果处理
    // @return : true表示已处理完毕, 否则返回结果(html文本)
    ReqResult:function(d,req,c){
        var data;
        if (req.type == 'json'){
            if (!d){
                _.InfoShow("加载出错,服务器返回格式不对");
                if (req.fr) _.ReEnter();
                return true;
            }
            else if (d.errno != 0){
                if (d._action == "redirect") {
                    _.InfoShow("您的Token卡已过期，需刷新页面后重试");
                    return true;
                }  
                _.ErrorShow(d,c);
                if (req.fr || d.fr) _.ReEnter();
                return true;
            }
            //无错误
            data = d.error;
        }
        else
            data = d; //无错误
        return data;
    },
    // ------------ end can be overrided function  -------------
    ProcessReq:function(req){
        _.BlockUi();
        if (_.PreLoading) _.PreLoading();
        var reqm = ((!req.post)? $.get : $.post);
        reqm(req.url,req.args,function(d){
                _.UnblockUi();
                if (_.EndLoading) _.EndLoading();
                // step 1. 出错处理
                var data = _.ReqResult(d,req);
                if (data === true) return;
                _.CommCB(d,req,data);
            },req.type);
    },
    CommCB:function(d,req,data){
        // step 2. 提示用户结果
        if (req.tips !== undefined) alert(req.tips);
        // step 3. 是否需要加载数据 //一般不需要用到
        var c =req.c;
        if (c) _.LoadData(req,c,data,d);
        // step 4. 页面已完成修改// 表单提交
        if (req.nomod) _.ModFlag(false);
        // step 5. ga back
        // go back
        if (req.bc){
            _.ModFlag(false);
            _.GoBack(req.bc,false);
        }
        //step 6. next req: may be  _.Enter\_.ReEnter\_.ExecNew ..
        var proc = req.proc;
        if (req.next && !proc)
            proc = _.Enter;
        if (proc){
            if (req.next){
                //  设置参数
                // A.only one arg (etc. id)
                if (req.idarg) {
                    if (!req.next.args)
                        req.next.args = {};
                    req.next.args[req.idarg] = data;
                }
                // B.复杂参数在回调函数中设置
                else if (req.argcb) req.argcb(d,req.next,data);
            }
            // go next
            proc(req.next);
        }
        //step 7. 回调用户 //一般不需要用到
        if (req.cb) _.CallBack(req.cb,[d,req,data],_);
    }
});
_.Request = _.Req;


//---------ui-----
$.extend(_,{
    AutoCheck:function(c){
        var f = c.find('form[_check]');
        if (f.length){
            var xObjs = f.find('._ack');
            if (xObjs.length == 0)
                return false;
            var $v = $('.validateTips',c);
            $v.data('om',$v.html());
            xObjs.each(function(){
                    var l = $(this).attr('_l');
                    var n = $(this).attr('name');
                    if (l && n)
                        c.find('label[for='+n+']').text(l +'：');
                });
            /*c.find('input,textarea,select').bind('blur',function(){
                    _.AcResult(0,c,0);
                    });
                    */
        }
    },
    AcTips:function (tips,c,s){
        if (!c) c = _.$c;
        var $v = $('.validateTips',c);
        if (!$v.length) return;
        $v.stop(true,true);
        if (tips){
            $v.fadeOut(function(){
                    $(this).html(tips).addClass('store-ui-info-container').fadeIn();
            });
            if (s) _.TipsShow(tips);
        }
        else{
            var om = $v.data('om');
            if (om) $v.html(om);
            $v.removeClass('store-ui-info-container');
        }
    },
    AcResult:function(f,c,showDlg){
        if (f === undefined) f = 1;
        if (f) showDlg = 1;
        if (!c) c = _.$c;
        var ok = true;
        var xObjs = c.find('._ack');
        xObjs.filter(".ck-error").removeClass("ck-error");
        xObjs.each(function(){
                if ($(this).attr('disabled')) return true;
                var type = $(this).attr('_t');
                if (!type) return true;
                ok = ok && _.AcObj($(this),type,c,showDlg);
                return ok;
            });
        if (ok && f)
            _.AcTips(f==1?"信息校对成功，正在提交，请稍等...":'',c);
        return ok;
    },
    AcObj:function(o,type,c,showDlg){
        if (!c){
            c = _.$c;
            showDlg = true;
        }
        var ok = true;
        if (ok && type.indexOf('ye') >= 0)
            if(!o.val()) return true; 
        if (ok && type.indexOf('ne') >= 0) // value must be non empty
            ok = _.CkNE.call(o,c,showDlg);
        if (ok && type.indexOf('len') >= 0) // _min < value.lenth <= _max
            ok = _.CkLen.call(o,c,showDlg);
        if (ok && type.indexOf('aa') >= 0) // value must be all alphabet
            ok = _.CkAA.call(o,c,showDlg);
        if (ok && type.indexOf('r') >= 0) // radio/checkbox must be selected 1 item at least
            ok = _.CkR.call(o,c,showDlg);
        if (ok && type.indexOf('dd') >= 0) //
            ok = _.CkDD.call(o,c,showDlg);
        if (ok && type.indexOf('mad') >= 0)
            ok = _.CkMIP.call(o,c,showDlg);
        else if (ok && type.indexOf('ad') >= 0)
            ok = _.CkIP.call(o,c,showDlg);
        if (ok && type.indexOf('p') >= 0) // reg patern check
            ok = _.CkP.call(o,c,showDlg);
        return ok;
    },
    CkLen:function(c,showDlg){
        var l = this.val().length;
        var max = this.attr('_max');
        var min = this.attr('_min');
        if (l > max || l < min)
            return _.CkFailed.call(this,'['+this.attr('_l')+']的长度必须在'+min+'和'+max+'之间',c,showDlg);
        else
            return _.CkSucc.call(this);
    },
    CkNE:function(c,showDlg){
        var l = this.val().length;
        if (l == 0){
            var m;
            if (this.attr('type') != 'file')
                m = '['+this.attr('_l')+']不能留空，请填写适当内容';
            else
                m = '['+this.attr('_l')+']不能留空，请从本地选择文件';
            return _.CkFailed.call(this,m,c,showDlg);
        }
        else
            return _.CkSucc.call(this);
    },
    CkAA:function(c,showDlg){
        var l = this.val().length;
        var letterPtn = /^[a-zA-Z]+$/;
        if (!letterPtn.exec(this.val()))
            return _.CkFailed.call(this,'['+this.attr('_l')+"]必须全部由英文字母组成",c,showDlg);
        else
            return _.CkSucc.call(this);
    },
    CkR:function(c,showDlg){
        var l = $('input[name='+this.attr('name')+']:checked').length;
        var min = this.attr('_rmin');
        if (!min) min = 1;
        if (l < min)
            return _.CkFailed.call(this,'请选择['+this.attr('_l')+"]",c,showDlg);
        else
            return _.CkSucc.call(this);
    },
    CkP:function(c,showDlg){
        var p = new RegExp(this.attr("_p"));
        if (!p.exec(this.val()))
        {
            var m = this.attr('_m');
            if (!m){
                m = "填写正确 (";
                if (!this.attr('title'))
                    m += "符合正则表达式：" + this.attr("_p")+")";
                else
                    m += this.attr('title') + ")";
            }
            return _.CkFailed.call(this,'['+this.attr('_l')+"]必须"+m,c,showDlg);
        }
        else
            return _.CkSucc.call(this);
    },
    CkDD:function(c, showDlg){
        var p = /^\d+$/;
        if (!p.exec(this.val()))
            return _.CkFailed.call(this,'['+this.attr('_l')+"]必须全部数字",c,showDlg);
        else
            return _.CkSucc.call(this);
    },
    CkIP:function(c,showDlg){
        var p = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/;
        if (!p.exec(this.val()))
            return _.CkFailed.call(this,'['+this.attr('_l')+"]必须是IPv4格式",c,showDlg);
        else
            return _.CkSucc.call(this);
    },
    CkMIP:function(c,showDlg){
        var s = this.val().split(new RegExp(this.attr('_bsplit')));
        if (s){
            var p = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/;
            var ipList = [];
            var ok = true;
            var exmsg = "";
            for(var i in s){
                var ip = $.trim(s[i]);
                if (!p.exec(ip)){
                    ok = false;
                    exmsg = ip + "格式不对";
                    break;
                }
                if ($.inArray(ip,ipList) == -1)
                    ipList.push(ip);
                else{
                    ok = false;
                    exmsg = ip + "重复";
                    break;
                }
            }
            if (ok){
               this.attr('iplist',ipList.join(this.attr('_gsplit')));
               return _.CkSucc.call(this);
            }
            if (exmsg) exmsg = "<span class='ck-error'>(" + exmsg + ")</span>";
        }
        return _.CkFailed.call(this,'['+this.attr('_l')+"]必须是指定分隔符隔开的IPv4地址列表"+exmsg,c,showDlg);
    },
    CkFailed:function(msg,c,showDlg){
        var of = this.offset();
        /*if ($(this).attr('_l') == "待变更机器"){
            //tips_show($.toJSON(of));
        }
        */
        if (of.left <= 0 || of.top <= 0 || of.left == 0 && of.top == 0){
            return true;
        }
        try{
            this[0].focus();
        }
        catch(e){
            return true;
        }
        //this.blur();
        this.addClass("ck-error");
        _.AcTips(msg,c,showDlg);
        return false;
    },
    CkSucc:function(){
        this.removeClass('ck-error');
        return true;
    }
});
$.extend(_,{
    MenuSel:{},
    HideMagicMenu : function(id){
        _.DoHideMagicMenu = function(sel){
            var o = $(sel);
            var t = o.attr('_menu');
            if (!t) return;
            $('#' + t).hide();
        }   
        if (_.MenuSel[id]){ window.clearTimeout(_.MenuSel[id]); }   
        _.MenuSel[id] = window.setTimeout("_.DoHideMagicMenu('#"+id+"')",300);
    },  
    MagicMenu : function(id){
        var o = $('#'+id);
        var t = o.attr('_menu');
        if (!t) return;
        t = $('#' + t); 
        if (t.length == 0) return;
        t.hide().css("position","absolute").css("z-index",2012);
        o.hover(function(){
                    $('#'+$(this).attr('_menu')).show();
                },function(){
                    _.HideMagicMenu($(this).attr('id'));
                }).click(function(){ return false; }); 
        t.hover(function(){
                    if (_.MenuSel[id]){
                        window.clearTimeout(_.MenuSel[id]);
                    }   
                },function(){
                    $(this).hide();
                }).click(function(){
                    $(this).hide();
                }); 
    }
});

$.extend(_, {
    AutoBatch:function(areaSel,trSel,batchBtnSel,opSel,objName,getOpInfoCb,defaultActionUrl,queryStr,okCb){
        var area = $(areaSel);
        var allTr = $(trSel,area);
        var batchBtn = $(batchBtnSel,area);
        allTr.find('td:first-child input').click(function(){
                _.UpdateBatchBtn(allTr.not("tr_hide"),batchBtn);
            });
        $('a.sel_all',area).click(function(){
                var objs = allTr.not("tr_hide");
                var chxbox_all = objs.find("td:first-child input");
                var chxbox = chxbox_all.filter(':checked');
                var v = "";
                if (chxbox_all.length != chxbox.length) v = "checked";
                chxbox_all.attr("checked",v);
                _.UpdateBatchBtn(objs,batchBtn);
                return false;
        });
        batchBtn.button().click(function(){
            var op = $(this).attr('op_type');
            var objs = allTr.not(".tr_hide").find('td:first-child input:checked').closest('tr');
            var opList = []; 
            objs.each(function(){
                var tr = $(this);
                var a = tr.find("a[op_type="+op+"]");
                if (a.length ==1) {
                    var opInfo = getOpInfoCb(tr,false,op,a);
                    opInfo.op_type = op;
                    opList.push(opInfo);
                }
            }); 
            if (opList.length <= 0) {
                alert('^_^');
                return false;
            }
            var actionUrl = $(this).attr('url');
            if (!actionUrl) actionUrl = defaultActionUrl;
            var msg = "";
            if (queryStr) msg = queryStr(op) + "<br />";
            msg += "确定对<span class='cnt'>符合条件</span>的[<span class='out big'>"+opList.length
                +"</span>]个"+objName+"进行<span class='out big'>"+$(this).html()+"</span>操作？";
            return _.Update({fr:1,url:actionUrl,args:{op_list:$.toJSON(opList),op_type:op}},msg,okCb);
        }); 
        $(opSel,allTr).click(function(){
            var op = $(this).attr('op_type');
            var tr = $(this).closest('tr');
            var objDesc = {};
            var batchOp = batchBtn.filter('[op_type=' + op + ']');
            if (batchOp.length != 1){
                alert('^_^');
                return false;
            }
            var actionUrl = batchOp.attr('url');
            if (!actionUrl) actionUrl = defaultActionUrl;
            var opInfo = getOpInfoCb(tr,true,op,$(this));
            opInfo.opInfo.op_type = op;
            var opList = [opInfo.opInfo];
            var msg = ""
            if (queryStr) msg = queryStr(op);
            msg += "确定对"+objName+" [<span class='out big'>"+opInfo.desc+"</span>]进行<span class='out big'>" + $(this).html() + "</span>操作？";
            return _.Update({fr:1,url:actionUrl,args:{op_list:$.toJSON(opList),op_type:op}},msg,okCb);
        });
        _.UpdateBatchBtn(allTr.not("tr_hide"),batchBtn);
    },
    UpdateBatchBtn:function(objs,batchBtn){
        var objs = objs.find('td:first-child input:checked').closest('tr');
        batchBtn.each(function(){
                var opsel = $(this).attr("op_type");
                if (opsel === undefined) return;
                if (objs.find("a[op_type=" + opsel+"]").length < 1) v = "disable";
                else v = "enable";
                $(this).button(v);
            });
   }
});
//iframe高度自适应，内容页面url传递
$.extend(_,{
    PublishIframeChange:function(){
       //var myH = "_h=" + $('div.store-ui-base-wrapper').outerHeight();
       var h = 250;
       if ($('div.store-ui-base-wrapper').length){
           var myH = parseInt($('div.store-ui-base-wrapper').outerHeight());
           h = Math.max(myH,h);
       }
       if (document.documentElement) h = Math.max(document.documentElement.scrollHeight,h);
       if (document.body.scrollHeight) h = Math.max(document.body.scrollHeight,h);
       var args = {h:h,url:window.location.href};
       if (_.iframeLastInfo && _.iframeLastInfo.url == args.url
           && _.iframeLastInfo.h <= args.h + 3 && _.iframeLastInfo.h >= args.h -3)
            return;
        _.iframeLastInfo = args;
       var info = [];
        for(var n in args)
            if (args[n] !== undefined)
                info.push(n+'='+encodeURIComponent(args[n]));
       info = info.join('&');
       var curHash = _.iframeComUrl + "#" + info;
       //alert("before="+document.documentElement.scrollHeight);
       $('#'+_.iframeProxyId).attr('src',curHash).hide();
       //alert("after="+document.documentElement.scrollHeight);
   },
   //iframe 页面调用
   InitIframe:function(parentHost,checkTime){
       if (window.top != window) {
           $('div.store-ui-base-header').remove();
           $('div.store-ui-sub-base-menu-holder').remove();
           $('div.store-ui-base-footer').remove();
           $('#bottombar').remove();
           var xwrapper = $('div.store-ui-base-wrapper');
           if (xwrapper.length) xwrapper.css("width","auto");
           var iframeComUrl = "http://" + parentHost + "/public/empty.html";
           _.iframeComUrl = iframeComUrl;
           _.iframeProxyId = "__proxy_iframe2012";
           _.iframeLastInfo = null;
           $('body').append('<iframe id="'+_.iframeProxyId+'" name="'+_.iframeProxyId+'" src="' + iframeComUrl + '" style="display:none" border="0" frameborder="0"> </iframe>');
           window.setInterval("_.PublishIframeChange()",checkTime?checkTime:300);
           return true;
       }
       return false;
   },
   CheckIframeChange:function(){
        var minh = 250;
        var h = minh;
        try{    
            var hash = frames['content_iframe'].frames['__proxy_iframe2012'];//.location.hash;
            hash = hash.location.hash;
            //alert(hash);
            if (hash && hash.length > 0){
                if (hash != _.lastIframeHash)
                {
                    _.lastIframeHash = hash;
                    var args = _.SplitArgs(hash.substr(1));
                    if (_.IframeChangeCb){
                        _.IframeChangeCb(args);
                        _.SetHashArgs(args);
                    }
                    else window.location.hash = hash;
                    h = parseInt(args["h"]);
                }
                else return;
            }
        }catch(e){
            //alert(e);
            h = minh;
            //alert("error:"+e);
        }
        h = parseInt(h);
        if (isNaN(h) || h < minh) h = minh;
        $('#content_iframe').height(h);
    },
    //iframe父页面调用
    InitParentFrame:function(checkTime,cb){
        //if (window.top != window) top.location = self.location;
        window.setInterval("_.CheckIframeChange()",checkTime?checkTime:300);  
        _.IframeChangeCb = cb;
        var initArgs = _.GetHashArgs();
        return initArgs;
    }
});
