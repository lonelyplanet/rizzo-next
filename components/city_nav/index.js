require("./_city_nav.scss");

$(document).on("click", "a[href^='#']", function (e) {
    e.preventDefault();

    var target = this.hash;
    var $target = $(target);

    $('html, body').stop().animate({
        'scrollTop': $target.offset().top
    }, 500, 'swing');
});
