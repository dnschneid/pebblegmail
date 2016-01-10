var Settings = require('settings');
var MailAccountsList = require('Mail/MailAccountsList');
var GApi = require('GApi');

(function() {
  var menu = null;
  var resetUI = function() {
    var newMenu = new MailAccountsList();
    if (menu) {
      menu.hide();
    }
    menu = newMenu;
  };

  Settings.config({
    url: 'https://dnschneid.github.io/pebblegmail/configure/'
  }, function(e) {
    /*
    Settings.option('clientId', '');
    Settings.data('secret', '');
    Settings.option('secret', 'y');
    */
  }, function(e) {
    GApi.updateConfiguration(e);
    if ('accounts' in e.options) {
      resetUI();
    }
  });

  resetUI();
})();
