function menuToggle(obj){
    obj.toggle(300);
}

function onNavClick (id) {
    $(".sub-dev").css({
        "style" : "display:none"
    });
    menuToggle($('#sub_' + id));
    $("#id").children("i").toggleClass("icon-chevron-down").toggleClass("icon-chevron-right");
    $("#id").sublings().
}

$(document).ready(function(){
    $(".nav-li").click(function (){
        onNavClick (this.id);
    });
});

$(window).resize(function (){
    $("#map").css({
        "position" : "absolute",
        "margin-top" : "0",
        "margin-left" : "0",
        "width" : $(window).width() / 5.0 * 4,
        "height": $(window).height()
    });
    $("#sidebar-nav").css({
        "position" : "absolute",
        "margin-top" : "0",
        "margin-left" : $(window).width() / 5.0 * 4,
        "width" : $(window).width() / 5,
        "height": $(window).height()
    });

    setTimeout (function () {
        myChart.resize ();
    }, 200);
});
