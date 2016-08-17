
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
     $("#id_ftp_distribution_date_1").val(getDate());
     $("#id_ftp_distribution_date_2").val(getDate());
});
$("#file_check").click(function () {
     $("#id_ftp_distribution_date_3").val(getDate());
     $("#id_ftp_distribution_date_4").val(getDate());
});

$("#id_ftp_distribution_date_onefile").click(function() {

    str = $("#id_ftp_distribution_filename").val();

    if(str.indexOf(".") != -1){
        fn($("#id_ftp_distribution_filename").val(), $("#id_ftp_distribution_date_1").val(), $("#id_ftp_distribution_date_2").val());
    }else{
        vid_get_filestatus(str,$("#id_ftp_distribution_date_1").val(), $("#id_ftp_distribution_date_2").val());
    }

});

$("#param_list").click(function () {    
    var flag = false;
    $("input[name='file']").each(function(){
        if($(this).val() != "")
        {
            flag = true;
        }
    });
    if(!flag){
        alert("请选择文件!");
    }else{
     $.ajax({
        url: 'ftp_distribution_upload_upload',
        type: 'POST',
        cache: false,
        data: new FormData($('#uploadForm')[0]),
        processData: false,
        contentType: false,
        datatype: "json",
        success: function (data) {
            var totalrows = data.pages;
            var task_id = data.task_id;
            var sortKey = 0;
            var table_title = '<table id="table_all" class="table table-condensed table-striped table-bordered templatemo-user-table">'
                            +'<thead><tr><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                            +'文件'
                            +'</td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                            +'域名'
                            +'</td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                            +'机房成功率(一类)'
                            +'</td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                            +'机房成功率(二类)'
                            +'</td><td id="fail_sort" rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                            +'失败'
                            +'<span class="caret"></span></td><td width="170px" rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                            +'错误'
                            +'</td></tr></thead><tbody id="table_show_all_tbody"></tbody></table>';
            if(!$("#table_show_all").html())
            {
                $("#table_show_all").append(table_title);
            }
            $('#fail_sort').on('click', function() {
                sortKey = sortby(task_id, totalrows, sortKey);
            });

            page(task_id, totalrows, sortKey);
        },
        error: function(data) {
          alert("查询失败！请重试或者检查网络！");
        }
    });
 }
});

function fn(n1, n2, n3){

    // 信息提交
    if( n1 != "" && n2 != ""&& n3 != "" ){
    if(n2 > n3){
        alert("开始时间不能晚于结束时间");
    }else{
        $.ajax({
            type: "GET",
            dataType: "json",
            // 下面需要添加文件提交的路由
            url: "ftp_distribution_upload_getQueryStatus?file_name="+n1 +"&start_time="+n2+"&end_time="+n3 + "&t="+ new Date().getTime(),
            success: function( data ){
                        // 数据请求成功
                if (data == null){
                    alert("查询失败！请重尝试或者检查网络！");
                }else{
                    var table_title = '<table class="table table-condensed table-striped table-bordered templatemo-user-table" >'
                        +'<thead><tr><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                        +'文件'
                        +'</td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                        +'域名'
                        +'</td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                        +'机房成功率(一类)'
                        +'</td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                        +'机房成功率(二类)'
                        +'</td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                        +'失败机房'
                        +'</td><td width="170px" rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                        +'错误'
                        +'</td></tr></thead><tbody id="table_show_all_tbody"></tbody></table>';

                    if(!$("#table_show_all").html())
                    {
                        $("#table_show_all").append(table_title);
                    }
              
                    var fail_detail_html = "";
                    var failedList = data.v_failed_oc_list;
                    for(var j = 0; j < failedList.length; j++){
                        var failed = failedList[j];
                        fail_detail_html = fail_detail_html
                                + '<tr><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                                + failed.area
                                + '</td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                                + failed.errorcode
                                + '</td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                                + failed.oc_id
                                + '</td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                                + failed.oc_ip
                                + '</td></tr>';
                    }
                    if(data.success_rate_1st_max < 90){
                        success_rate_1st =  "分发成功率:" + ata.success_rate_1st +"%(最高：" + "<font color='red'>" + data.success_rate_1st_max+ "</font>" + "%)";
                    }else {
                        success_rate_1st =  "分发成功率:" + data.success_rate_1st + "%(最高：" + data.success_rate_1st_max + "%)";
                    }

                    if(data.success_rate_2nd < 90){
                        success_rate_2nd =  "分发成功率:" + data.success_rate_2nd +  "%(最高：" + "<font color='red'>" + data.success_rate_2nd_max  + "</font>"+ "%)";
                    }else {
                        success_rate_2nd =  "分发成功率:" + data.success_rate_2nd + "%(最高：" + data.success_rate_2nd_max + "%)";
                    }
                    var success_1_detail_html = "创建时间:"+data.create_time + '<br>' + "开始时间:"+data.start_time + '<br>' +"结束时间:"+ data.success_time_1st;
                    var success_2_detail_html = "创建时间:"+data.create_time + '<br>' + "开始时间:"+data.start_time + '<br>' + "结束时间:"+ data.success_time_2nd;
           
                    var b_html= '<tr><td>'
                        + '文件名:'+ data.file_name 
                        + '<br>'+'文件大小:' + data.file_size +'<br>'+'哈希值: '+data.hash_value+'</td><td>'
                        + '域名:'+ data.domain
                        + '<br>'+'任务id: '+data.task_id+'</td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                        + success_rate_1st
                        + '<br>'
                        + data.time_1st
                        + '<br><button  id="success_1_detail"  class="btn_margin_success btn btn-xs" data-toggle="modal" data-target="#success_1_detail_modal">详情</button></td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                        + success_rate_2nd
                        + '<br>'
                        + data.time_2nd
                        + '<br><button  id="success_2_detail"  class="btn_margin_success btn btn-xs" data-toggle="modal" data-target="#success_2_detail_modal">详情</button></td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                        + data.failmsg
                        + '<br><button id="fail_detail"  class="btn_margin btn  btn-xs" data-toggle="modal" data-target="#fail_detail_modal">详情</button></td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                        + data.error
                        + '</td></tr>';
                    $("#table_show_all_tbody").html(b_html);

                    $("#fail_detail").click(function(){
                            //if(!$("#file_detail_show").html())
                            //{
                        $("#fail_detail_show").html(fail_detail_html);
                            //}

                    });
                   
                    $("#success_1_detail").click(function(){
                        $("#success_1_detail_show").html(success_1_detail_html);
                    });
                    $("#success_2_detail").click(function(){
                        $("#success_2_detail_show").html(success_2_detail_html);
                    });         
                }       
            },
            error: function(data) {
                alert("查询失败！请重新尝试或者检查网络！");
            }
        });
    }
    } else {
        alert("请填写所有选项");
    }
}

function page(task_id, totalrows, sortKey){
    var totalPages = parseInt(totalrows / 10) + 1;
    $.jqPaginator('#pagination1', {
        totalPages: totalPages,
        visiblePages: 3,
        currentPage: 1,
        onPageChange: function(num, type) {
            $.ajax({
                type: "GET",
                dataType: "json",
                // 下面需要添加文件提交的路由
                url: "ftp_distribution_upload_getPage?pageno="+ num + "&taskid="+task_id+"&pages="+totalrows+ "&sortKey="+sortKey + "&t=" + new Date().getTime(),
                success: function( data ){
                    // 数据请求成功
                    var fail_detail_html_list = [];
                    var success_1_detail_html_list = [];
                    var success_2_detail_html_list = [];
                    if(data == null)
                    {
                        alert("error,please try again");
                    }else{
                         $("#table_show_all_tbody").html(" ");
                        for(var i = 0; i < data.length; i++){
                        if(data[i].task_id != '-'){
                            var fail_detail_html = "";
                            var failedList = data[i].v_failed_oc_list;
                            for(var j = 0; j < failedList.length; j++){
                                var failed = failedList[j];
                                fail_detail_html = fail_detail_html
                                        + '<tr><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                                        + failed.area
                                        + '</td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                                        + failed.errorcode
                                        + '</td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                                        + failed.oc_id
                                        + '</td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                                        + failed.oc_ip
                                        + '</td></tr>';
                            }
                            fail_detail_html_list[i] = fail_detail_html;
                            if(data[i].success_rate_1st_max < 90){
                                success_rate_1st =  "分发成功率:" + data[i].success_rate_1st +"%(最高："+"<font color='red'>" + data[i].success_rate_1st_max + "</font>" + "%)";
                            }else {
                                success_rate_1st =  "分发成功率:" + data[i].success_rate_1st + "%(最高：" + data[i].success_rate_1st_max + "%)";
                            }
                            if(data[i].success_rate_2nd_max < 90){
                                success_rate_2nd =  "分发成功率:" + data[i].success_rate_2nd + "%(最高："+"<font color='red'>" +data[i].success_rate_2nd_max +"</font>" +"%)";
                            }else {
                                success_rate_2nd =  "分发成功率:" + data[i].success_rate_2nd + "%(最高："  + data[i].success_rate_2nd_max + "%)";
                            }
                            var success_1_detail_html = "创建时间:"+data[i].create_time + '<br>' + "开始时间:"+data[i].start_time + '<br>' +"结束时间:"+ data[i].success_time_1st;
                            success_1_detail_html_list[i] = success_1_detail_html;
                            var success_2_detail_html = "创建时间:"+data[i].create_time + '<br>' + "开始时间:"+data[i].start_time + '<br>' + "结束时间:"+data[i].success_time_2nd;
                            success_2_detail_html_list[i] = success_2_detail_html;

                            var b_html = '<tr><td>'
                                +'文件名:'+ data[i].file_name 
                                + '<br>'+'文件大小:' +data[i].file_size+'<br>'+'哈希值: '+data[i].hash_value+'</td><td>'
                                + '域名:'+data[i].domain
                                + '<br>'+'任务id: '+ data[i].task_id+'</td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                                + success_rate_1st
                                + '<br>'
                                + data[i].time_1st
                                + '<br><button id="success_1_detail_'+i+'" value="'+i+'" class="btn_margin_success btn btn-xs" data-toggle="modal" data-target="#success_1_detail_modal">详情</button></td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                                + success_rate_2nd
                                + '<br>'
                                + data[i].time_2nd
                                + '<br><button id="success_2_detail_'+i+'" value="'+i+'" class="btn_margin_success btn btn-xs" data-toggle="modal" data-target="#success_2_detail_modal">详情</button></td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                                + data[i].failmsg
                                + '<br><button id="fail_detail_'+i+'" value="'+i+'" class="btn_margin btn  btn-xs" data-toggle="modal" data-target="#fail_detail_modal">详情</button></td><td rowspan=$rowspan style="vertical-align:middle;text-align:center;">'
                                + data[i].error
                                + '</td></tr>';
                            $("#table_show_all_tbody").append(b_html);
                            $("#fail_detail_"+i).click(function(){
                                var a = $(this).attr("value");
                                //if(!$("#file_detail_show").html())
                                //{
                                    $("#fail_detail_show").html(fail_detail_html_list[a]);
                                //}

                            });
                           
                            $("#success_1_detail_"+i).click(function(){
                               
                                var a = $(this).attr("value");
                                $("#success_1_detail_show").html(success_1_detail_html_list[a]);
                            });
                            $("#success_2_detail_"+i).click(function(){
                             
                                var a = $(this).attr("value");
                                $("#success_2_detail_show").html(success_2_detail_html_list[a]);
                            });
                        }
                        }
                    }
                },
                error: function(data) {
                    alert("查询失败！请重新尝试或者检查网络！");
                }
            });
        }
    });
}
function sortby(task_id, totalrows, sortKey){

    if(sortKey == 0)
    {
        sortKey = 1;
    }else if(sortKey == 1){
        sortKey = 2;
    }
    else{
        sortKey = 0;
    }
    page(task_id, totalrows, sortKey);
    return sortKey;


}
function vid_get_filestatus(vid, start_time, end_time){

    $.ajax({
        url: 'ftp_distribution_vid_get_filestatus?vid=' + vid + '&start_time=' + start_time + '&end_time=' + end_time + '&t=' + new Date().getTime(),
        type: 'get',
        cache: false,
        datatype: "json",
         success: function (data) {
            var totalrows = data.pages;
            var task_id = data.task_id;
            var sortKey = 0;
            var table_title = '<table id="table_all" class="table  table-condensed table-striped table-bordered templatemo-user-table" rowspan=$r    owspan style="vertical-align:middle;">'
                            +'<thead><tr><td>'
                            +'文件'
                            +'</td><td>'
                            +'域名'
                            +'</td><td>'
                            +'机房成功率(一类)'
                            +'</td><td>'
                            +'机房成功率(二类)'
                            +'</td><td id="fail_sort">'
                            +'失败'
                            +'<span class="caret"></span></td><td width="170px">'
                            +'错误'
                            +'</td></tr></thead><tbody id="table_show_all_tbody"></tbody></table>';
            if(!$("#table_show_all").html())
            {
                $("#table_show_all").append(table_title);
            }
            $('#fail_sort').on('click', function() {
                sortKey = sortby(task_id, totalrows, sortKey);
            });
 
            page(task_id, totalrows, sortKey);
        },
        error: function(data) {
           alert("查询失败！请重新尝试或者检查网络！");
        }
    });
}

