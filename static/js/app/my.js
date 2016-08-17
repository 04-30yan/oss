function menuToggle (obj) {
    $(obj).toggle (300);
}

function loadXML(url, id) {
    var xmlhttp = null;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    }
    else if (window.ActiveXObject){
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    else {
        alert ("unsupport browser types");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            document.getElementById(id).innerHTML = xmlhttp.responseText;
           // set_innerHTML ('id_main', xmlhttp.responseText);
        }
    }
    xmlhttp.open ("GET", url);
    xmlhttp.send ();
}

function onMyNav1stClick (id, name) {
    //self state
    if($("#" + id).hasClass("my-nav-1st-active")) {
        $("#" + id).removeClass("my-nav-1st-active");
    }
    else {
        $("#" + id).addClass("my-nav-1st-active");
    }

    //menu toggle
    menuToggle("#" + id + "_sub");
    $("#" + id).children("i").toggleClass("icon-chevron-down").toggleClass("icon-chevron-rigth");

    //children state
    $(".my-nav-2nd").removeClass ("my-nav-2nd-active");

    //display
    loadXML ("test_path?params="+ id + "$" + name, "PathDisplay");
    loadXML ("test_main?params=empty", "MainDisplay");
    setContent ("empty");
}

function onMyNav2ndClick (id, name) {
    //siblings state
    $(".my-nav-2nd").removeClass ("my-nav-2nd-active");
    $("#" + id).addClass ("my-nav-2nd-active");

    //
    loadXML ("test_path?params=" + id + "$" + name, "PathDisplay");
    loadXML ("test_main?&params=" + id, "MainDisplay");
    setContent ("empty");
}

function setContent(params) {
    loadXML ("test_proxy?url=test_content&params=" + params, "ContentDisplay");
}

$(document).ready(function(){
    $(".my-nav-1st").click(function(){
        onMyNav1stClick(this.id, $(this).children('a').attr("name"));
    });
    $(".my-nav-2nd").click(function(){
        onMyNav2ndClick(this.id, $(this).children('a').attr("name"));
    });
    $('.mobile-menu-icon').click(function(){
        $('.templatemo-left-nav').slideToggle();
    });
    $('.templatemo-content-widget .fa-times').click(function(){
        $(this).parent().slideUp(function(){
            $(this).hide();
        });
    });
});
