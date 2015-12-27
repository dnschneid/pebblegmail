var ajax = require('ajax');
var GApi = require('GApi');

var Gmail = {
  Labels: {
    listCache_: {},

    list: function(account, callback, errorCallback) {
      if (this.listCache_[account.key]) {
        callback(this.listCache_[account.key]);
        return;
      }

      GApi.getAccessToken(account, function(accessToken) {
        var url = 'https://www.googleapis.com/gmail/v1/users/me/labels?access_token=' +
          encodeURIComponent(accessToken);

        ajax({
          url: url,
          type: 'json'
        }, function(data) {
          this.listCache_[account.key] = data;
          callback(data);
        }.bind(this), function(error) {
          if (errorCallback) errorCallback('Could not get labels list');
        });
      }.bind(this), errorCallback);
    }
  },

  Threads: {
    list: function(account, query, callback, errorCallback) {
      GApi.getAccessToken(account, function(accessToken) {
        var url = 'https://www.googleapis.com/gmail/v1/users/me/threads' +
                  '?maxResults=20' +
                  '&q=' + encodeURIComponent(query) +
                  '&access_token=' + encodeURIComponent(accessToken);
        ajax({
          url: url,
          type: 'json'
        }, function(data) {
          callback(account, data);
        }, function(error) {
          if (errorCallback) errorCallback(account, null, 'Could not get threads');
        });
      }, function(error) { errorCallback(account, null, error); });
    },

    get: function(account, threadId, callback, errorCallback) {
      GApi.getAccessToken(account, function(accessToken) {
        var url = 'https://www.googleapis.com/gmail/v1/users/me/threads/' +
                  threadId +
                  '?format=metadata' +
                  '&access_token=' + encodeURIComponent(accessToken);
        ajax({
          url: url,
          type: 'json'
        }, callback, function(error) {
          if (errorCallback) errorCallback('Could not get thread');
        });
      }, errorCallback);
    },

    modify: function(account, threadId, options, callback, errorCallback) {
      GApi.getAccessToken(account, function(accessToken) {
        var url = 'https://www.googleapis.com/gmail/v1/users/me/threads/' +
          threadId + '/modify' +
          '?access_token=' + encodeURIComponent(accessToken);

        ajax({
          url: url,
          method: 'post',
          type: 'json',
          data: options
        }, callback, function(error) {
          if (errorCallback) errorCallback('Could not modify thread labels');
        });
      }, errorCallback);
    }
  },

  Messages: {
    list: function(account, query, callback, errorCallback) {
      GApi.getAccessToken(account, function(accessToken) {
        var url = 'https://www.googleapis.com/gmail/v1/users/me/messages' +
                  '?maxResults=20' +
                  '&q=' + encodeURIComponent(query) +
                  '&access_token=' + encodeURIComponent(accessToken);
        ajax({
          url: url,
          type: 'json'
        }, function(data) {
          callback(account, data);
        }, function(error) {
          if (errorCallback) errorCallback(account, null, 'Could not get messages');
        });
      }, function(error) { errorCallback(account, null, error); });
    },

    get: function(account, messageId, callback, errorCallback) {
      GApi.getAccessToken(account, function(accessToken) {
        var url = 'https://www.googleapis.com/gmail/v1/users/me/messages/' +
                  messageId +
                  '?access_token=' + encodeURIComponent(accessToken);
        ajax({
          url: url,
          type: 'json'
        }, callback, function(error) {
          if (errorCallback) errorCallback('Could not get message');
        });
      }, errorCallback);
    },

    modify: function(account, messageId, options, callback, errorCallback) {
      GApi.getAccessToken(account, function(accessToken) {
        var url = 'https://www.googleapis.com/gmail/v1/users/me/messages/' +
          messageId + '/modify' +
          '?access_token=' + encodeURIComponent(accessToken);

        ajax({
          url: url,
          method: 'post',
          type: 'json',
          data: options
        }, callback, function(error) {
          if (errorCallback) errorCallback('Could not modify message labels');
        });
      }, errorCallback);
    }
  },

  UNREAD_LABEL_ID: 'UNREAD',
  STARRED_LABEL_ID: 'STARRED',
  COLOR: '#d71900'  /* attempting to match #d44937 */
};

module.exports = Gmail;
