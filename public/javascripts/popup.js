function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
    }
    return "";
}

function checkCookie() {
    var user = getCookie("recurent");
    if (user != "") {
        //console.log("¡Bienvenido nuevamente a la Puerta Giratoria del Poder!");
    } else {
        $('html').addClass('overlay');
        $('.popup').addClass('visible');
        setCookie("recurent", "true", 60);
    }
}
$(window).load(function(){
  jQuery(document).ready(function ($) {
      checkCookie();

      $('[data-popup-target]').click(function () {
          $('html').addClass('overlay');
          var activePopup = $(this).attr('data-popup-target');
          $(activePopup).addClass('visible');
   
      });
      $(document).keyup(function (e) {
          if (e.keyCode == 27 && $('html').hasClass('overlay')) {
              clearPopup();
          }
      });
      $('.popup-exit').click(function () {
          clearPopup();
      });   
      $(document).on('click','.popup-exit-control',function () {
          clearPopup();
          $(".bjqs-next a").text("Siguiente >");
      }); 
      $('.popup-overlay').click(function () {
          clearPopup();
      });
      function clearPopup() {
          $('.popup.visible').addClass('transitioning').removeClass('visible');
          $('html').removeClass('overlay');
   
          setTimeout(function () {
              $('.popup').removeClass('transitioning');
          }, 200);
      }   
  });
});