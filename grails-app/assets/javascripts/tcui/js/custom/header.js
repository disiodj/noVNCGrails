$(document).ready(function () {
    console.log("ready!");
    $('.toggle').eq(0).click();
    $("#filter_days").buttonset();
    $("#filter_app").buttonset();
    $("#filter_dir").buttonset();
});

$(function () {
    $('.vnc_reload .fa').on('click', function () {
        if (!$(this).hasClass('fa-spin')) {
            $(this).addClass('fa-spin');
        }
        setTimeout(function () {
            if ($(".vnc_reload .fa").hasClass('fa-spin')) {
                $(".vnc_reload .fa").removeClass('fa-spin');
            }
        }, 5000);
    });
});

$(function () {
    $('.vnc_reload .fa').on('click', function () {
        if (!$(this).hasClass('fa-spin')) {
            $(this).addClass('fa-spin');
        }
        setTimeout(function () {
            if ($(".vnc_reload .fa").hasClass('fa-spin')) {
                $(".vnc_reload .fa").removeClass('fa-spin');
            }
        }, 5000);
    });
});

function switchError() {
    if ($('.receiver input').hasClass('error')) {
        $('.receiver input').removeClass('error');
    } else {
        $('.receiver input').addClass('error');
    }

    if ($('.messageBox textarea').hasClass('error')) {
        $('.messageBox textarea').removeClass('error');
    } else {
        $('.messageBox textarea').addClass('error');
    }

    if ($('.errorMessage').hasClass('hidden')) {
        $('.errorMessage').removeClass('hidden');
    } else {
        $('.errorMessage').addClass('hidden');
    }
}

function placeAccordion() {
    $("#accordion").accordion({
        collapsible: true
    });
};

$(function () {
    $('#messagesOnPage').selectmenu();
});
