(function () {

  var background = chrome.extension.getBackgroundPage();

  $(function () {

    $('.logout button').on('click', function (ev) {

      console.log('logout clicked');
      background.logout();
    });
  });
})();