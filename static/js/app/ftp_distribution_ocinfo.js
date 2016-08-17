$(document).ready (function () {

    $('#top-right-div').css({
      "position": "absolute",
      "margin-left": $(window).width() / 2,
      "margin-top": "0px",
      "height": $(window).height() / 2,
      "filter": "alpha(opacity=100)",
      "opacity": "1",
      "overflow": "hidden",
      "width": $(window).width() / 2,
    });

    $('#bottom-iframe').css({
      "position": "absolute",
      "margin-top": $(window).height() / 2,
      "filter": "alpha(opacity=50)",
      "opacity": "1",
      "overflow": "hidden",
      "z-index": "999",
      "width": $(window).width(),
      "height": $(window).height()
    });
});

$(window).resize(function (){
    $('#top-left-div').width ($(window).width() / 2);
    $('#top-left-div').height ($(window).height() / 2);
    $('#top-right-div').width ($(window).width() / 2);
    $('#top-right-div').height ($(window).height() / 2);
    $('#top-right-div').offset ({top : 0, left : $(window).width() / 2});
    $('#bottom-iframe').width ($(window).width());
    $('#bottom-iframe').height ($(window).height());
    $('#bottom-iframe').offset ({top : $(window).height() / 2, left : 0});
});
