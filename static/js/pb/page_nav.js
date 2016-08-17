//navContainer: 分页工具条容器
//totalCount:总数量
//curPage   :当前页， 以0开始
//--curCount  :当前页的条数
//perPage   :每页最多显示的条数
//<div id='pgContainer' total_count='100' per_page='20' cur_page='0'></div>
//_.AutoPage('#pgContainer');
if (!_) _ = {};
$.extend(_,{
AutoPage:function(navSel,proc){
    var req = _.LastEnter();
    if (!req) return;
    var nav = $(navSel);
    var totalCount = parseInt(nav.attr('total_count'));
    if (totalCount <= 0 || isNaN(totalCount)){
        nav.html("<div class='pgNav'>没有检索到任何记录!</div>");
        return;
    }
    //当前数量>总数  or <= 0
    //if (curCount <= 0 || curCount > totalCount)  // error
    //当前页最多显示
    var perPage = parseInt(nav.attr('per_page'));
    if (perPage <= 0 || isNaN(perPage)) perPage = 10; //error
    if (perPage > totalCount) perPage = totalCount; //error
    //总页数
    var pageCount = Math.floor((totalCount + perPage - 1) / perPage);
    // 当前页
    var curPage = parseInt(nav.attr('cur_page'));
    ++curPage; // index from 1
    if (curPage < 1 || isNaN(curPage)) curPage = 1; // error
    else if (curPage > pageCount) curPage = pageCount; // error
    var prefix = nav.attr("_pre");
    if (!prefix) prefix = "";
    //
    var navHtml = '<div class="pgNav" _pre="'+prefix+'" cur_page="'+curPage+'" per_page="'+perPage+'" total_count="'+totalCount+'" page_count="'+pageCount+'">'
          + '共<span>' + totalCount + '</span>条&nbsp;&nbsp;'
          + '每页 <input type="text" value="' + perPage + '" class="per_page"/> 条 '
          + '<span class="sep"></span>'
          + ((curPage != 1) ? '<span class="op pgFirst" title="首页" onclick=\'return _.PageNav(this,"first")\'></span>' : '<span class="op pgFirstDisabled"></span>')
          + ((curPage > 1) ? '<span class="op pgPrev" title="上页" onclick=\'return _.PageNav(this,"prev")\'></span>' : '<span class="op pgPrevDisabled"></span>')
          + '<span class="sep"></span>'
          + '  第 <input type="text" class="cur_page" value="' + curPage + '"> / ' + pageCount + ' 页 '
          + '<span class="sep"></span>'
          + ((curPage < pageCount) ? '<span class="op pgNext" title="下页" onclick=\'return _.PageNav(this,"next")\'></span>':'<span class="op pgNextDisabled"></span>')
          + ((curPage != pageCount) ? '<span class="op pgLast" title="尾页" onclick=\'return _.PageNav(this,"last")\'></span>':'<span class="op pgLastDisabled"></span>')
          + '<span class="sep"></span>'
          + '<span class="op pgGo" title="Go" onclick=\'return _.PageNav(this,"go")\'></span>'
          + '</div>';
    nav.html(navHtml);
    if (!proc) proc = _.ReEnter;
    else{
        if (proc === _.New)
        {
            var lastReq = _.Last();
            proc = function(args){
                lastReq = $.extend(true,{},lastReq);
                _.UpdateArgs(lastReq,args);
                _.New(lastReq);
            }
        }
    }
    nav.find('.pgNav').data('proc',proc);
    //nav.attr('total_count',totalCount);
},
PageNav:function(o,action){
    var nav = $(o).closest('div.pgNav');
    var totalCount  = parseInt(nav.attr('total_count'));

    var pageCount = parseInt(nav.attr('page_count'));
    var perPage = parseInt(nav.attr('per_page'));

    var newPerPage = parseInt(nav.find('input.per_page').val());
    if (!isNaN(newPerPage) && newPerPage != perPage && newPerPage > 0){
        perPage = newPerPage;
        if (perPage > totalCount) perPage = totalCount;
        pageCount = Math.floor((totalCount + perPage - 1) / perPage);
    }

    var curPage = nav.attr('cur_page');
    var newCurPage = parseInt(nav.find('input.cur_page').val());
    if (!isNaN(newCurPage) && newCurPage != curPage && newCurPage > 0){
        curPage = newCurPage;
        if (curPage > pageCount)
            curPage = pageCount;
    }
    //var per_page = nav.attr('per_page');
    switch(action)
    {
    case 'first':
        curPage = 1;
        break;
    case 'prev':
        --curPage;
        break;
    case 'next':
        ++curPage;
        break;
    case 'last':
        curPage = pageCount;
        break;
    case 'go':
        curPage = nav.find('input.cur_page').val();
        break;
    default:
        return false;
    }
    --curPage;
    if (curPage < 0) curPage = 0;
    else if (curPage >= pageCount) curPage = pageCount - 1;
    var prefix = nav.attr("_pre");
    if (!prefix) prefix = "";
    var args = {};
    args[prefix + "cur_page"] = curPage;
    args[prefix + "per_page"] = perPage;
    nav.data('proc')(args);
    return false;
}
});
