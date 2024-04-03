
// Preloader
var delayFunc = function (callback, time) {

    if (time === undefined) {
        time = 0;
    }

    var startTime = new Date().valueOf();

    setTimeout(function () {

        var endTime = new Date().valueOf();

        if ((endTime - startTime) > (time + 10)) {
            delayFunc(callback, time);
        } else {
            callback();
        }
    }, time);
};

// For Mozilla, Opera, Webkit
if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function () {
        document.removeEventListener("DOMContentLoaded", arguments.callee, false);
        delayFunc(function () {
            $("#page-preloader").fadeOut(500);
            $('body').css('overflow', 'auto');
        }, 100);
    }, false);
}
// For Internet Explorer
else if (document.attachEvent) {
    document.attachEvent("onreadystatechange", function () {
        if (document.readyState === "complete") {
            document.detachEvent("onreadystatechange", arguments.callee);
            delayFunc(function () {
                $("#page-preloader").fadeOut(500);
                $('body').css('overflow', 'auto');
            }, 100);
        }
    });
}