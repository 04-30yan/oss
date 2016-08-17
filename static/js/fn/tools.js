/*
 * 作者：neilwang
 * 日期：2007-12-13
 */

/*
 * Description:      检查xml中的error节点，如果错误id为3333, 3334, 3335时表示登入问题，其他情况则只显示提示信息
 * Input:            xmltree      用xpath为/*选择的dataset，如果xmltree不是用/*选择的dataset，则若dataset为空时
 *                                不会检查任何的error节点，若dataset不为空则检查从/开始的任何error节点
 * Output:
 * Return:
 * Others:
 * 实例:
 *     var xmltree = new Spry.Data.XMLDataSet("appinfo.xml", "/*", {useCache: false});
 *     var appinfo = new Spry.Data.NestedXMLDataSet(xmltree, "/root/applist", {sortOnLoad: "appid", sorOrderOnLoad: "ascending"});
 *     check_error(xmltree);
 */
function check_error(xmltree)
{
    var errorinfo = new Spry.Data.NestedXMLDataSet(xmltree, "//error");
    errorinfo.addObserver(function (type, notifier, data) {
        if (type == "onPostLoad" && notifier.getRowCount() != 0)
        {
            var msg ="";
            for (var i = 0; i < notifier.getRowCount(); i++)
            {
				var reason = notifier.getData()[i]["@reason"];
				var errstr = notifier.getData()[i]["error"];
				if (reason == 3333) // token过期
				{
					alert(errstr);
					document.cookie="";
					window.location.href='http://passport.oa.com/modules/passport/signout.ashx?url=http://'+window.location.host+'/cgi-bin/coss/login?indexurl=' + window.location.href;
                    //parent.leftFrame.location.href='leftframe.htm';
					return;
				} else if (reason == 3334) // token输入错误
				{
					alert(errstr);
					window.location.href='http://passport.oa.com/modules/passport/signin.ashx?url=http://'+window.location.host+'/cgi-bin/coss/login?indexurl=' + window.location.href ;
                    //parent.leftFrame.location.href='leftframe.htm';
					return;
				} else if (reason == 3335) // 第一次登入
				{
					window.location.href='http://passport.oa.com/modules/passport/signin.ashx?url=http://'+window.location.host+'/cgi-bin/coss/login?indexurl=' + window.location.href ;
                    //parent.leftFrame.location.href='leftframe.htm';
					return;
				}

				if (reason == 0)
				{
					alert(errstr);
				}
				else
				{
					msg += "CGI错误ID:" + reason + ", 详细信息: " + errstr + "\n";
				}
            }
			if (msg != "")
			{
				alert(msg);
			}
        }
    });
}

/*
 * Description:      获取传给html页面的参数
 * Input:            argname      想要获取的参数名
 * Output:
 * Return:           argname对应的参数，如果没有则返回“”
 * Others:
 */
function getArg(argname)
{
	var href = window.location.href;
    var args  = href.split("?");
    var ret = "";
    
    if(args.length <= 1) /* 参数为空 */
    {
         return ret;
    }

    args = args[1].split("&");
    for(var i = 0; i < args.length; i++)
    {
        var str = args[i];
        var arg = str.split("=");
        if(arg.length <= 1) continue;
        if(arg[0] == argname) 
			ret = arg[1]; 
    }
    return ret;
}

/*
下载头部所用JS
*/
function onDownloadHead(downDate)
{
        showHead.innerHTML=downDate;
}

/*
下载尾部所用JS
*/
function onDownloadTail(downDate)
{
        showTail.innerHTML=downDate;
}

function TranslateURLLogOut(url)
{
	if(!url || url == "")
		return "";
	var OAURL = 'http://passport.oa.com/modules/passport/signout.ashx?url=';
	url = escape(url);
	url = OAURL + url;
	url += '&title=CDNLOGIN';
	return url;
}

function LogOutCDNV2()
{
    var indexurl = 'http://'+window.location.host+'/cgi-bin/coss/login?indexurl=http://'+window.location.host+'/cgi-bin/config/index';
	document.cookie = "";
	document.loginname = "";
	window.parent.parent.location = TranslateURLLogOut(indexurl);
	return;
}

function GetCookie(sName)
{
  // cookies are separated by semicolons
  var aCookie = document.cookie.split("; ");
  for (var i=0; i < aCookie.length; i++)
  {
    // a name/value pair (a crumb) is separated by an equal sign
    var aCrumb = aCookie[i].split("=");
    if (sName == aCrumb[0]) 
      return unescape(aCrumb[1]);
  }

  // a cookie with the requested name does not exist
  return null;
}

function rtx_img_onload_func()
{
	RAP(this.rtx);
}

function rtx_register_winScroll_modified()
{
	if (window.onscroll != rtx_winScroll)
	{
		rtx_oldWinScroll = window.onscroll;
		window.onscroll = rtx_winScroll;
	}
}

function rtx_getUILocation_modified(objSrc)
{
	var obj = objSrc;
	var uiLocation = new Object();
	var uiX = 0;
	var uiY = 0
	var objDX = 0;
	var fRtl = (document.dir == "rtl");
	var parentWindow = window;
	var doc = document;
	var scrollTop = 0;
	var scrollLeft = 0;

	if(rtx_frameRandom == 0)
	{
		var dt = new Date();

		rtx_frameRandom = dt.getSeconds() * 1000 + dt.getMilliseconds();
	}

	rtx_frameRandom++;

	while(obj && obj.rtxframeRandom != rtx_frameRandom)
	{
		obj.rtxframeRandom = rtx_frameRandom;
		
		scrollLeft = obj.scrollLeft;
		scrollTop = obj.scrollTop;
		
		if(obj.tagName == "BODY")
		{
			if(obj.scrollLeft == 0 && doc.documentElement.scrollLeft != 0)
			{
				scrollLeft = doc.documentElement.scrollLeft;
			}

			if(obj.scrollTop == 0 && doc.documentElement.scrollTop != 0)
			{
				scrollTop = doc.documentElement.scrollTop;
			}
		}

		if(fRtl)
		{
			if(obj.scrollWidth >= obj.clientWidth + scrollLeft)        
			{
				objDX = obj.scrollWidth - obj.clientWidth - scrollLeft;
			}
			else
			{
				objDX = obj.clientWidth + scrollLeft - obj.scrollWidth;
			}

			uiX += obj.offsetLeft + objDX;
		}
		else
		{
			uiX += obj.offsetLeft - scrollLeft;
		}

		uiY += obj.offsetTop - scrollTop;
		obj = obj.offsetParent;            

		if(!obj)
		{
			if(parentWindow.frameElement)
			{
				obj = parentWindow.frameElement;
				if (obj.tagName == "FRAME")
				{
					break;
				}

				parentWindow = parentWindow.parent;
				doc = parentWindow.document;
			}
		}
	}

	if(parentWindow)
	{
		uiX += parentWindow.screenLeft;
		uiY += parentWindow.screenTop;
	}

	uiLocation.uiX = uiX;
	uiLocation.uiY = uiY;

	if(fRtl)
	{
		uiLocation.uiX += objSrc.offsetWidth;
	}

	return uiLocation;
}

function init_rtx_observer(type, notifier, data)
{
	if (type == "onPostUpdate")
	{
		var imgs = data.regionNode.all.tags("img");
		if (!imgs.length)
		{
			return;
		}
		rtx_nameIndex = 0;
		rtx_isNameControlLoadError = false;
		rtx_idDictionary = null;
		rtx_stateDictionary = null;
		rtx_nickDictionary = null;
		rtx_showOfflineDictionary = null;
		rtx_groupidDictionary = null;
		rtx_pageGroupNicks = "";
		m_isLogout = false;
		rtx_updateAllStatusCallInfo = null;
		rtx_frameRandom = 0;

		for (var i = 0; i < imgs.length; ++i)
		{
			if (imgs[i].rtx != undefined && imgs[i].rtx != "")
			{
				imgs[i].onload = rtx_img_onload_func;
				imgs[i].style.filter = "Chroma(Color = '#00008080', Enable = true)";
				imgs[i].showOffline = "1";
				imgs[i].src = "../img/blank.gif";
			}
		}

		rtx_updateAllStatus(2);
	}
}

function init_rtx(region_id)
{
	RDL("ocx");
	rtx_register_winOnload();
	rtx_register_winScroll = rtx_register_winScroll_modified;
	rtx_getUILocation = rtx_getUILocation_modified;
	
	Spry.Data.Region.addObserver(region_id, init_rtx_observer);
}

function number_compare(a, b)
{
	return (a == b) ? 0 : (a < b ? -1 : 1);
}

function number_compare_asc(a, b)
{
	a = parseFloat(a); 
	b = parseFloat(b);
	if (isNaN(a))
	{
		if (isNaN(b))
			return 0;
		return 1;
	}
	else if (isNaN(b))
	{
		return -1;
	}
	return (a == b) ? 0 : (a < b ? -1 : 1);
}

function number_compare_desc(a, b)
{
	a = parseFloat(a); 
	b = parseFloat(b);
	if (isNaN(a))
	{
		if (isNaN(b))
			return 0;
		return 1;
	}
	else if (isNaN(b))
	{
		return -1;
	}
	return (a == b) ? 0 : (a < b ? 1 : -1);
}

function string_compare_asc(a, b)
{
	if (a == undefined || b == undefined)
		return (a == b) ? 0 : (a ? 1 : -1);
	var tA = a.toString();
	var tB = b.toString();
	var tA_l = tA.toLowerCase();
	var tB_l = tB.toLowerCase();
	var min_len = tA.length > tB.length ? tB.length : tA.length;

	for (var i=0; i < min_len; i++)
	{
		var a_l_c = tA_l.charAt(i);
		var b_l_c = tB_l.charAt(i);
		var a_c = tA.charAt(i);
		var b_c = tB.charAt(i);
		if (a_l_c > b_l_c)
			return 1;
		else if (a_l_c < b_l_c)
			return -1;
		else if (a_c > b_c)
			return 1;
		else if (a_c < b_c)
			return -1;
	}
	if(tA.length == tB.length)
		return 0;
	else if (tA.length > tB.length)
		return 1;
	return -1;
}

function string_compare_desc(a, b)
{
	return -string_compare_asc(a, b);
}

function date_compare_asc(a, b)
{
	a = a ? (new Date(a.replace(/([^-]*)-([^-]*)-([^ ]*)(.*)/, "$2/$3/$1$4"))) : 0; 
	b = b ? (new Date(b.replace(/([^-]*)-([^-]*)-([^ ]*)(.*)/, "$2/$3/$1$4"))) : 0; 
	
	return a - b;
}

function date_compare_desc(a, b)
{
	return -date_compare_asc(a, b);
}

function getdaystring(offset)
{
	var d = new Date(new Date().getTime() + offset * 3600 * 24 * 1000);
	var y = d.getFullYear(), m = d.getMonth() + 1, d = d.getDate();
	if (m < 10) m = '0' + m;
	if (d < 10) d = '0' + d;
	return y + '-' + m + '-' + d;
}
function setdaystring(obj, offset)
{
	obj.value = getdaystring(offset);
}
function setthisday(obj)
{
	setdaystring(obj, 0);
}

function setlastday(obj)
{
	setdaystring(obj, -1);
}

function setlastweek(obj)
{
	setdaystring(obj, -6);
}
function write_userscript(clientid){
	var ctl = $("#" + clientid + "Value");
    if (ctl.attr('init') == 1)
        return;
	var sign = [0,0];
	var src = '/chooser/usersscript.js';
	
	var actbsrc = '/chooser/actb.js';
			
	if(typeof(Actb)=='undefined'){
		disableCtl();
		$.getScript(actbsrc, function(){ sign[0] = 1;enableCtl();});
	}
	else{
		sign[0] = 1;
	}
	
	if(typeof(_arrStaffs)=='undefined'){
		$.getScript(src,initChooser);	
	}
	else{
		initChooser();
	}
    return;

	function initChooser(){
		setChooser(_arrStaffs,document.getElementById(clientid));
		sign[1] = 1;
		enableCtl();
	}
	
	function disableCtl(){
		if(ctl.attr('init') != 1){
			//ctl.val('loading...');
			ctl.attr('disabled', true);
		}
	}
	
	function enableCtl(){
		if(sign[0] && sign[1]){
			ctl.attr('init', 1); 
			ctl.attr('disabled', false);
			//ctl.val('');
			ctl.focus();
		}
	}
}
function switch_show(objid, iconid)
{
var obj = document.getElementById(objid);
var me = document.getElementById(iconid);
var cssclass = me.className.replace(/\bexpanded\b/, '').replace(/\bcollapsed\b/, '');
if (obj.style.display == 'none')
{
obj.style.display = 'block';
me.className = cssclass + ' expanded';
}
else
{
obj.style.display = 'none';
me.className = cssclass + ' collapsed';
}
}
function tips_show(msg,ret)
{
    $("<div>" + msg + "</div>").dialog({modal:true,title:"提示信息对话框",buttons:{"确认":function(){$(this).dialog("close");if(ret) ret();}}});
}
/*
 * 显示对话框，
 */
function show_dlgurl(url,dlgtitle)
{
    
    var dlg = window._dlg_;
    var tt="对话框";
    if( typeof(dlgtitle)!=undefined)
         tt= dlgtitle;

    
    //create the dialog only once
    if (!dlg)
    {
        //create a ifreame to load the url file
        dlg = $("<iframe style='height:400px;width:780px;positon:absolute;'></iframe>");
        window._dlg_ = dlg;// save it to window
        //dlg.dialog({modal:false,autoOpen:false,width:800,height:420,position:'top'
        dlg.dialog({modal:false,autoOpen:false,width:800,height:420,position:'top'
                //open function
                ,open:function(event,ui){
                     var w =780;
                      var h =420;
                      if(dlg.data("w"))
                            w= dlg.data("w");
                      if(dlg.data("h"))
                            h= dlg.data("h");
                 dlg.attr("style","width:"+w+"px;height:"+h+"px;");
                   dlg.contents().find("body").load(function(){alert("xxxxx");});
                 }
                 //Resize
                ,resizeStop:function(event,ui){
                     dlg.data("w",ui.size.width-20);//记录div的大小
                     dlg.data("h",ui.size.height);
                     dlg.attr("style","width:"+(ui.size.width-20)+"px;height:"+(ui.size.height)+"px;"); 
                     }
                });//END of Create dialog
        dlg.load(function(){
                try{
                var iframe = dlg.get()[0];
                var  bWidth= iframe.contentWindow.document.body.scrollWidth;
                var  dWidth= iframe.contentWindow.document.documentElement.scrollWidth;
                var  width= Math.max( dWidth, bWidth);
                dlg.dialog("option","width",width+ 20); 
                //dlg.attr("style","width:"+height+"px");
                var  bHeight= iframe.contentWindow.document.body.scrollHeight;
                var  dHeight= iframe.contentWindow.document.documentElement.scrollHeight;
                var height= Math.max( dHeight, bHeight);
                dlg.dialog("option","height",height+ 20); 
                 dlg.attr("style","width:"+width+"px;height:"+height+"px;");
                }catch (ex){}
;

        dlg.contents().find("#rightFrame").each(function()
                {
                //$(this).live("load",function(){alert("load");});
                $(this).load(
                    function(){
                        try{
                        var iframe = this;
                        var bHeight = iframe.contentWindow.document.body.scrollWidth;
                        var dHeight = iframe.contentWindow.document.documentElement.scrollWidth;
                        var height = Math.max(bHeight, dHeight);
                        dlg.dialog("option","width",height+20); 
                        dlg.width(height);
                        }catch (ex){}


                        /////////////////
                    $(this).contents().find("#applynewrow").each(
                        function()
                        {
                        alert("xxxxxxxxxxxxxxxxxxx");
                        }
                        );

                    });
                    });


                }); //end of load function
    }
    //$("iframe[src]",dlg).change(function(){alert("xxxx")});
    dlg.resizable();
    dlg.dialog( "option", "title", tt );
    dlg.attr("src",url);
    dlg.dialog("open");
    dlg.data("is_first",true);
    return false;
}
/*
 *  把选择的内容写回到这些空间
 * */
function displaydialog(busetname_id,bu_set_name_id,bu_name_id,bu_module_name_id)
{
    if (typeof(busetname_id) != "string"){
        busetname_id = 'busetname';
        bu_set_name_id = 'bu_set_name';
        bu_name_id = 'bu_name';
        bu_module_name_id = 'bu_module_name';
    }
    var id = 'choosedialog';
    if (!$("#" + id).length)
        $("body").append("<div id='" + id + "'></div>");
    id = $("#" + id).html("");
    var tree=new dhtmlXTreeObject(id[0],"100%","100%",0);
    tree.setImagePath("../img/");
    tree.enableTreeImages(0);
    tree.enableCheckBoxes(1);
    tree.enableThreeStateCheckboxes(true);
    tree.loadXML("/cgi-bin/config/get_busitree_cgi");
//    tree.enableItemEditor(true);
    //tree.setEditStartAction(true,true);
    id.dialog({
modal:true, width:350, height:400,title:"业务模块选择对话框",
            buttons:{
                '同步ITIL':function(){ $.get(
                        "/cgi-bin/config/update_busitree_cgi",
                        function(ret)
                        {
                            try{
                                eret =eval("("+ret +")");
                            }catch(e)
                            {
                                tips_show("更新服务器业务模块失败"); 
                                return false;
                            }
                            tips_show(eret.data);
                            if(eret.errno == 0)
                            {
                                var id = 'choosedialog';
                                id = $("#" + id).html("");
                                tree=new dhtmlXTreeObject(id[0],"100%","100%",0);
                                tree.setImagePath("../img/");
                                tree.loadXML("/cgi-bin/config/get_busitree_cgi");
                                tree.enableTreeImages(0);
                                tree.enableCheckBoxes(1);
                                tree.enableThreeStateCheckboxes(true);
                            }
                            return false;
                        }
                    );},
                '取消':function(){ $(this).dialog("close");},
                '确认':function(){
                        var leafs =","+ tree.getAllLeafs( ) +",";
                        var checkeditems= tree.getAllChecked().split(",");
                        var ret;
                        var itemid;
                        var bu_set_name="";
                        var bu_name="";
                        var bu_module_name="";
                                
                        var alertmsg ="你确认选择业务模块:";
                        var outmsg ="";
                        for(var index = 0; index < checkeditems.length; ++index)
                        {
                            itemid = checkeditems[index];
                            ret = leafs.indexOf("," +itemid+",");
                            if( ret != -1)
                            {
                                var parid = tree.getParentId(itemid);
                                var graid= tree.getParentId(parid);
                                if( graid == "")
                                {
                                    tips_show("选择业务不正确......");
                                    return false;
                                }
                                bu_set_name += tree.getItemText(graid)+";";
                                bu_name += tree.getItemText(parid)+";";
                                bu_module_name += tree.getItemText(itemid)+";";
                                alertmsg+="<br>&nbsp;["+tree.getItemText(graid)+"-"+tree.getItemText(parid)+"-"+tree.getItemText(itemid) +"]";
                                outmsg += tree.getItemText(graid)+"-"+tree.getItemText(parid)+"-"+tree.getItemText(itemid) +"\r\n";
                            }
                        }
                        var r = confirm_show(alertmsg+"<br>&nbsp;吗",function(){
                                            $('#' + busetname_id).val(outmsg);
                                            $('#' + bu_set_name_id).val(bu_set_name);
                                            $('#' + bu_name_id).val(bu_name);
                                            $('#' + bu_module_name_id).val(bu_module_name);
                                            id.dialog('close');
                                            },
                                            function() {id.dialog('close');});
                }

            }
    } );
}
function confirm_show(msg,y,n)
{
    $("<div>" + msg + "</div>").dialog({modal:true,title:"确认信息对话框",buttons:{
            "取消":function(){$(this).dialog("close"); var nret=false;if(n) { nret=n(); }$("body").data("ret",nret);},
            "确认":function(){$(this).dialog("close");var nret=true; if(y) { nret =y();}$("body").data("ret",nret);}
            }});
    
    if(!$("body").data("ret"))
        return  false;
    return $("body").data("ret");
}
function OpenWindow(url,windowid)
{
   // window.showModalDialog("busetframe.htm",document,"dialogHeight:500px;dialogWidth:350px;status:no;scroll:yes;help:no;center:yes;resizable:yes");
    window.open(url,windowid,"height=500,width=700,left=200,toolbar=no,resizable=yes,location=yes,scrollbars=yes,status=no,center=yes");
    return false;
    //window.open(url,windowid,title);
}
