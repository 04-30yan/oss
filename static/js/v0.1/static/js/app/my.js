function restore () {
    var path = window.location.hash;
    var tabs = path.split('&');
    if (tabs.length > 0) {
        var platform = tabs[0].split("=")[1];
        if (tabs.length > 1) {
            var service = tabs[1].split("=")[1];
            $(document.getElementById("id_" + platform + "_" + service)).children("a").addClass("alive-left-tab");
            loadXML ("getContent", "id_main", platform + "_" + service);
            if (tabs.length > 2) {
                var sub = tabs[2].split("=")[1];
                $(document.getElementById("id_" + platform + "_" + service + "_" + sub)).parent().children("#id_" + platform + "_" + service + "_" + sub).addClass("active");
                loadXML ("getContent", "id_content", platform + "_" + service + "_" + sub);
            }
        }
    }
}

function menuToggle (obj) {
    obj.toggle (300);
}


$(document).ready(function(){
    $(".left-super-tab").click(function(){
        if($(this).hasClass("alive-left-super-tab")) {
            $(this).removeClass("alive-left-super-tab");
        }
        else {
            $(this).addClass("alive-left-super-tab");
        }
    });
    $(".left-tab").click(function(){
        $(this).parent().parent().parent().parent().parent().find("a.alive-left-tab").removeClass("alive-left-tab");
        $(this).addClass("alive-left-tab");
        loadXML ("getContent", "id_main", this.name);
    });
    $("#id_ftp").click(function(){
        menuToggle($("#id_ftp_sub"));
        $(this).children("i").toggleClass("icon-chevron-down").toggleClass("icon-chevron-rigth");
    });
    $("#id_ugc").click(function(){
        menuToggle($("#id_ugc_sub"));
        $(this).children("i").toggleClass("icon-chevron-down").toggleClass("icon-chevron-rigth");
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

function setContent (id, name) {
    $("#"+id).parent().siblings().children("a").removeClass("active");
    $("#"+id).addClass("active");
    loadXML ("getContent", "id_content", name);
}

function setDisplay (id, name) {
    loadXML ("getContent", id, name);
}

function loadXML(url, id, subject) {
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
    xmlhttp.open ("GET", url + "?s=" + subject);
    xmlhttp.send ();
}