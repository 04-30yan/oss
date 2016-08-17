var g_isFirst = true;
function fn(n1, n2, n3){
// 信息提交
	if( n1 != "" && n2 != ""&& n3 != "" ){
		$.ajax({
			type: "GET",
			dataType: "json",
			// 下面需要添加文件提交的路由
			url: "getFileStatus?file_name="+n1 +"&start_time="+n2+"&end_time="+n3,
			data: {
				"n1": n1,
				"n2": n2,
				"n3": n3,
			},
			success: function( data ){
				if(data.data == null)
				{
					alert("data is null:"+data.error);
				}
				else{
					if(g_isFirst == true){
        						g_isFirst = false;
    					}
			// 数据请求成功
					var a_list = data.data;
					for(var j = 0; j < a_list.length; j++){
						var a = a_list[j];
						var t_html = "";
						var failedList = a.v_failed_oc_list;
                    				for(var i = 0; i < failedList.length; i++){
		                				var failed = failedList[i];
		                				t_html = t_html
		                		+ '<tr><td>'
		                		+ failed.area
						     + '</td><td>'
						     + failed.errcode
				           	+ '</td><td>'
				           	+ failed.oc_id
				           	+ '</td><td>'
				           	+ failed.oc_ip
				           	+ '</td></tr>';
		                }
						var b_html = '<tr><td>'
				            + a.file_name
				            + '</td><td>'
				            + a.domain
				            + '</td><td><table class="l_table" cellspacing="0" cellpadding="0"><tr class="l_table_tr"><td>rate:</td><td>'
				            + a.success_rate_1st
				            + '</td></tr><tr><td>time:</td><td>'
				            + a.success_time_1st
				            + '</td></tr></table></td><td><table class="l_table" cellspacing="0" cellpadding="0"><tr class="l_table_tr"><td>rate:</td><td>'
				            + a.success_rate_2nd
				            + '</td></tr><tr><td>time:</td><td>'
				            + a.success_time_2nd
				            + '</td></tr></table></td><td><a href="#" class="failBtn">详情</a><table class="y_table table_1" cellspacing="0" cellpadding="0"><tr><th>area</th><th>errcode</th><th>oc_id</th><th>oc_ip</th></tr>'
				            + t_html
				            + '</table></td><td><a href="#" class="detaBtn">查看</a><table class="y_table table_2" cellspacing="0" cellpadding="0"><tr><th>task_id</th><th>file_size</th><th>create_time</th><th>start_time</th><th>errno</th><th>hash_value</th><th>error</th></tr><tr><td>'
				            + a.task_id
				            + '</td><td>'
				            + a.file_size
				            + '</td><td>'
				            + a.create_time
				            + '</td><td>'
				            + a.start_time
				            + '</td><td>'
				            + data.errno
				            + '</td><td>'
				            + a.hash_value
				            + '</td><td>'
				            + data.error
			          		 + '</td></tr></table></td></tr>';
						$(".imforTable").append( b_html );

						// 折叠效果
						var state_1 = 0;
						var state_2 = 0;
						$(".failBtn").click(function(){
							if(state_1 == 0){
								$(this).siblings('.y_table').css("display", "block");
								$(".failBtn").text("取消");
								state_1 = 1;
							} else {
								$(this).siblings('.y_table').css("display", "none");
								$(".failBtn").text("详情");
								state_1 = 0;
							}
						});
						$(".detaBtn").click(function(){
							if(state_2 == 0){
								$(this).siblings('.y_table').css("display", "block");
								$(".detaBtn").text("取消");
								state_2 = 1;
							} else {
								$(this).siblings('.y_table').css("display", "none");
								$(".detaBtn").text("查看");
								state_2 = 0;
							}
						});
					}
				}
			},
			error: function(data) {
				alert("请求失败");
			}
		});
	} else {
		alert("请填写所有选项");
	}
}

	// 点击信息提交

function getDate() {
	var date = new Date();
	var year = 0;
	var month = 0;
	var day = 0;
	var str = "";
	year = date.getFullYear();
	month = date.getMonth() + 1;
	day = date.getDate();
    str += year;
    if (month >= 10){
    	str += month;
    }else{
    	str += "0" + month;
    }
    if(day >= 10){
    	str += day;
    }else{
    	str += "0" + day;
    }
    return str;
}

 $(document).ready(function () {
     $("#n2").val(getDate());
     $("#n3").val(getDate());
});

function onsubmBtnClcik() {
     	fn($("#n1").val(), $("#n2").val(), $("#n3").val());
}

$("#submBtn").click(function() {
	onsubmBtnClcik();

});

$("#param_list").click(function () {
     $.ajax({
	    url: 'uploadFiles',
	    type: 'POST',
	    cache: false,
	    data: new FormData($('#uploadForm')[0]),
	    processData: false,
	    contentType: false,
	    datatype: "json",
	    success: function (data) {
	        alert("ok");
	        for(var i = 0; i < data.length;i = i+3 ){
		        fn(data[i], data[i+1], data[i+2]);
	        }
	    },
	    error: function(data) {
	      alert("fail");
	    }
	});
});

