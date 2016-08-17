function show_sub_menu(eUl){
	var eUl = $(this).find("ul");
	if(eUl.length){
		var posX = Math.floor(($(this).width() - eUl.width())/2);
		if (-posX + 5 > $(this).offset().left)
		posX = -$(this).offset().left + 5;
		eUl.css("margin-left",posX + "px");
	}
}
//主菜单选中样式设置以及菜单hover事件设置
function my_name_is(name, subname){
	document.cur_li = "";
	$(".ui-base-menu > li > a").addClass("ui-corner-top").each(function(){
		if($(this).attr("_name") == name || $(this).text() == name){
			$(this).addClass("ui-cur");
			if($(this).parent().find("ul").length){
				document.cur_li = $(this).parent()[0];
				$(this).parent().addClass("ui-show-sub-menu").find("ul li a").each(function(){
                    var smname = $(this).attr("_name");
                    if (!smname) smname = $(this).text();
					if($(this).attr("_name") == subname || $(this).text() == subname){
						$(this).addClass("ui-cur");
						return false;
					}
				});
				show_sub_menu.call(document.cur_li);
			}
			return false;
		}
	});
	//主菜单hover事件
	$(".ui-base-menu > li").hover(
		function(){
			if (document.cur_li != this){
				if (document.cur_li)
					$(document.cur_li).removeClass("ui-show-sub-menu");
				$(this).addClass("ui-show-sub-menu");
			}
			show_sub_menu.call(this);
       		},
		function(){
			if(document.cur_li == this)
				return;
			if(document.cur_li)
				$(document.cur_li).addClass("ui-show-sub-menu");
			$(this).removeClass("ui-show-sub-menu");
		}
	);
	$(".ui-base-menu > li").each(function(){
		if($(this).find("ul").length){
			$(this).children("a").click(function(){
				return false;
			}).attr("title","请单击子菜单");
		}  
	});
}
function load_from_url(arg){
	var contain = $("#" + arg.contain);
	pre_loading(contain);
	$.getJSON(arg.url,function(data){
		if (data.errno == 0){
			contain.html(data.data);
                }else
			alert("errno:" + data.errno + ",errmsg:" + data.data);
		end_loading(contain);
	});
}
/*** loading ***/
function pre_loading($contain){
	$contain.html("");
	$contain.append("<a href='#' id='loading' title='请不要离开当前页面!'><ins class='loading'></ins>加载中...</a>");
}
function end_loading($contain){
	("#loading").detach();
}

