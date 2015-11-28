var Settings = require('settings');
var ajax = require('ajax');
var ErrorCard = require('ErrorCard');

var GApi = {
  getAccessToken: function(callback, errorCallback, i /* account index */) {
    var accounts = Settings.option('accounts');
    i = i || 0;
    if (!accounts || !accounts[i] || (!accounts[i].oauth && !accounts[i].key)) {
      new ErrorCard('Not signed in', 'Sign in using the app configuration page.');
      if (errorCallback) errorCallback();
      return;
    }
    var now = new Date();
    var expiry = 0;
    if (accounts[i].oauth) {
      expiry = (accounts[i].oauth.created + accounts[i].oauth.expires_in) * 1000;
    }
    if (now.valueOf() < expiry) {
      callback(accounts[i].oauth.access_token);
    } else {
      var request = { 'client_id': Settings.option('clientId'),
                      'client_secret': Settings.option('secret') };
      if (!accounts[i].oauth) {
        request.grant_type = "authorization_code";
        request.redirect_uri = "urn:ietf:wg:oauth:2.0:oob";
        request.code = accounts[i].key;
      } else {
        request.grant_type = "refresh_token";
        request.refresh_token = accounts[i].oauth.refresh_token;
      }
      ajax({
        url: "https://www.googleapis.com/oauth2/v3/token",
        method: 'post',
        data: request
      }, function(data) {
        data = JSON.parse(data);
        if (data && data.access_token) {
          accounts[i].oauth = accounts[i].oauth || {};
          for (var key in data) {
            accounts[i].oauth[key] = data[key];
          }
          accounts[i].oauth.created = now.valueOf() / 1000;
          accounts[i].key = null;
          Settings.option('accounts', accounts);
          callback(accounts[i].oauth.access_token);
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
