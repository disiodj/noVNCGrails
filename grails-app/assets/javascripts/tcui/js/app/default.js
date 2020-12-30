/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function switchActiveTab() {
    console.log("switchTab");
    $(".tabs").each(function () {
        if (!$(this).hasClass("active")) {
            console.log("tab not active");
            if ($(this).hasClass("inactive")) {
                $(this).removeClass("inactive");
                console.log("inactive");
            } else {
                $(this).addClass("inactive");
                console.log("active");
            }
        }
    });
}

$(function () {
    $('.toggle').on('click', function () {
        if ($(this).hasClass('on')) {
            $(this).removeClass('on');
        } else {
            $(this).addClass('on');
        }
    });
});

$(function () {
    $('.balance').tooltip({
        position: {
            my: "center bottom-10",
            at: "center"
        }
    });
});
