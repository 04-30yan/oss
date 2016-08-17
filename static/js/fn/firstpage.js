var acchart;
var occhart;

var root = new Spry.Data.XMLDataSet("/cgi-bin/firstpage_new/cgi-bin/firstpage_table.cgi", "/*", {useCache:false});
root.loadData();
check_error(root);

var monthlist = new Spry.Data.NestedXMLDataSet(root, "/root/srcdata/monthlist", {useCache:false});
var acdatalist = new Spry.Data.NestedXMLDataSet(root, "/root/srcdata/acdatalist", {useCache:false});
var ocdatalist = new Spry.Data.NestedXMLDataSet(root, "/root/srcdata/ocdatalist", {useCache:false});
var budata = new Spry.Data.NestedXMLDataSet(root, "/root/budata/data", {useCache:false});

Spry.Data.Region.addObserver("budata", region_observer);
function left_formatter()
{
	return this.value +"T";
}
function right_formatter()
{
	return this.value +"G";
}

//通过div的id来添加regionoberver的
$(function(){
my_name_is("index");
        //绘制资源状况图
        });

function region_observer(type, notifier, data)
{
    if (type == "onPostUpdate")
    {
        var collapseIcon = '/firstpage/img/CollapseMinus.gif';
        var collapseText = 'Collapse this section';
        var expandIcon = '/firstpage/img/CollapsePlus.gif';
        var expandText = 'Expand this section';
        // add icon

        $('tr.nnature').each(function()
                {
                var $section = $(this);

                $section.find('td')
                .css('padding-left', '18px')
                .css('backgroundColor', 'white')
                .mouseover(function()
                    {
                    $section.find('td').css('backgroundColor', '#E4ECF7');
                    //$section.find('td').css('backgroundColor', 'yellowgreen');
                    })
                .mouseout(function()
                    {
                    $section.find('td').css('backgroundColor', '#FFFFFF');
                    });

                $section.find('#morelabel').hide();
                $section.hide();

                }) ;

        $('tr.nature')
            .css('background-color', 'white')
            .mouseover(function()
                    {
                    $("td" ,this).css('backgroundColor', '#E4ECF7');
                    $('#morelabel', this).show();
                    })
        .mouseout(function()
                {
                $("td",this).css('backgroundColor', 'white');
                $('#morelabel',this).hide();
                });


        //对业务类的td表格增加点击图标
        $('tr.nature #tdbuname').each(
                function(){
                $('<img />').attr('src', expandIcon) .attr('alt', expandText) .prependTo($('#bulabel',this)).addClass('clickable');

                });

        //业务类的td表格增加点击事件
        $('tr.nature #tdbuname').addClass('clickable');
        $('tr.nature #tdbuname').click(
                function(){
                var tid = $(this).parent().attr('id') + '_sub';
                if($(this).is('.collapsed'))
                {
                   $(this).find('img').attr('src', expandIcon).attr('attr', expandText);
                   $(this).removeClass('collapsed');
                   $("tr.nnature").each(
                       function(){
                         if($(this).attr('id') == tid)
                         $(this).hide();
                       }
                    );
                }else
                {
                    $(this).find('img').attr('src', collapseIcon).attr('attr', collapseText);
                    $(this).addClass('collapsed');
                    $("tr.nnature").each(
                        function(){
                            if($(this).attr('id') == tid)
                            $(this).show();
                        }
                    );
                }
                }

        );

                }
    }


function ShowACData()
{
    $('#ocfluxcontainer').remove();
		   $("#continer").html(" <div align='center' id='acfluxcontainer' ' > </div>");
	chart=	 new Highcharts.Chart(window.json_acchart);

}

function ShowOCData()
{
/*
    $('#acfluxcontainer').hide();
    $('#ocfluxcontainer').show();
*/
    $('#acfluxcontainer').remove();
		   $("#continer").html(" <div align='center' id='ocfluxcontainer' ' > </div>");
	chart=	 new Highcharts.Chart(window.json_occhart);
}

var $dialog;
function displaybustat(datatype,butype,datetype,buid)
{
    var chartdiv;
    alert("datatype="+datatype+" butype=" + butype + " datetype=" + datetype + " buid=" +buid);
    $("#id_dialog_show").empty();
    $("#id_dialog_show").dialog(
    {
                modal:true,
                title:"UGC加速平台",
                width:800,
                height:400,
                resizeable:false,
                "open":
                    function(){
                        $.get("/cgi-bin/firstpage/cgi-bin/bustat.cgi",
                        {
                           datatype:datatype,
                           butype:butype,
                           datetype:datetype,
                           buid:buid
                        },
                        function(eret)
                        {
                            if(eret.errno!=0 )
                                return false;
                            eret = $.evalJSON(eret["error"]);
                            chartdiv = new Highcharts.Chart(eret["highchart_option"]);
                        },
                       "json"
                       )
                    },
                "close":function(){
                    $(this).dialog("destroy");
                }
            });
    return false;
}
