var Settings = require('settings');
var ajax = require('ajax');
var ErrorCard = require('ErrorCard');

/* FIXME: error callbacks should have the error message
 */

var GApi = {
  updateConfiguration: function(e) {
    var data = Settings.data() || {};

    /* Remove old accounts */
    var accounts = e.options.accounts || [];
    for (var key in data) {
      if (key == 'secret') {
        continue;
      }
      var keep = false;
      for (var i = 0; i < accounts.length; i++) {
        if (accounts[i].key == key) {
          keep = true;
          break;
        }
      }
      if (!keep) {
        data[key] = null;
      }
    }
    
    /* Keep secret */
    if ('secret' in e.options) {
      if (!e.options.secret) {
        data.secret = null;
      } else if (e.options.secret.length == 24) {
        data.secret = e.options.secret;
        Settings.option('secret', 'y');
      }
    }
    
    /* Save the data */
    Settings.data(data);
  },
  
  getAccessToken: function(account, callback, errorCallback) {
    if (!account || !account.key) {
      if (errorCallback) errorCallback();
      return;
    }
    var oauth = Settings.data(account.key);
    var now = new Date();
    var expiry = 0;
    if (oauth) {
      expiry = (oauth.created + oauth.expires_in) * 1000;
    }
    if (now.valueOf() < expiry) {
      callback(oauth.access_token);
    } else {
      var request = { 'client_id': Settings.option('clientId'),
                      'client_secret': Settings.data('secret') };
      if (!oauth) {
        request.grant_type = "authorization_code";
        request.redirect_uri = "urn:ietf:wg:oauth:2.0:oob";
        request.code = account.key;
      } else {
        request.grant_type = "refresh_token";
        request.refresh_token = oauth.refresh_token;
      }
      ajax({
        url: "https://www.googleapis.com/oauth2/v3/token",
        method: 'post',
        data: request
      }, function(data) {
        data = JSON.parse(data);
        if (data && data.access_token) {
          oauth = oauth || {};
          for (var key in data) {
            oauth[key] = data[key];
          }
          oauth.created = now.valueOf() / 1000;
          Settings.data(account.key, oauth);
          callback(oauth.access_token);
        } else {
          new ErrorCard('Could not acquire Google access token');
          if (errorCallback) errorCallback();
        }
      }, function(error) {
        new ErrorCard('Could not request Google access token');
        if (errorCallback) errorCallback();
      });
    }
  }
};

module.exports = GApi;
