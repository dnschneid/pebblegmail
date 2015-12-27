var Settings = require('settings');
var ajax = require('ajax');

var GApi = {
  updateConfiguration: function(e) {
    var data = Settings.data() || {};

    /* Remove old accounts */
    if ('accounts' in e.options) {
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

    if (this.onUpdate) {
      this.onUpdate();
    }
  },
  
  /* Queues callbacks in case multiple requests are in parallel */
  callbackQueue: {
    queue: {},
    
    push: function(account, callback, errorCallback) {
      this.queue[account.key] = this.queue[account.key] || [];
      this.queue[account.key].push([callback, errorCallback]);
      return this.queue[account.key].length > 1;
    },
    
    doCallbacks: function(index, account, data) {
      var callbacks = this.queue[account.key];
      for (var i = 0; i < callbacks.length; i++) {
        if (callbacks[i][index]) {
          callbacks[i][index](data);
        }
      }
      delete this.queue[account.key];
    },
    
    callback: function(account, data) {
      this.doCallbacks(0, account, data);
    },
    errorCallback: function(account, data) {
      this.doCallbacks(1, account, data);
    }
  },

  getAccessToken: function(account, callback, errorCallback) {
    if (!account || !account.key) {
      if (errorCallback) errorCallback('Account configuration invalid');
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
      if (GApi.callbackQueue.push(account, callback, errorCallback)) {
        return;
      }
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
          GApi.callbackQueue.callback(account, oauth.access_token);
        } else {
          GApi.callbackQueue.errorCallback(account, 'Could not acquire access token');
        }
      }, function(error) {
        GApi.callbackQueue.errorCallback(account, 'Could not request access token');
      });
    }
  }
};

module.exports = GApi;
