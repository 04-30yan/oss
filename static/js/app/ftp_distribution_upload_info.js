$(document).ready (function () {
    $("#id_nav").delegate("a.linker", "click", "", function (){
        window.location = this.name;
    });
    $("#id_info").delegate("a.linker", "click", "", function (){
        window.location = this.name;
    });
});


$(window).resize(function (){
    $("#id_info").width ($(window).width());
    $("#id_charts").width ($(window).width() / 2);
    $("#id_charts").height ($(window).height());
    setTimeout (function () {
        myChart.resize ();
    }, 200);
});


//id_charts
