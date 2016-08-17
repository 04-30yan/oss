function testAlert () {
    alert (this.name);
}

$(document).ready (function () {
    $('#testbn').click(function(){
        window.location = "developing";
    });
});
