var ajax = require('ajax');
var GApi = require('GApi');
var ErrorCard = require('ErrorCard');

var Gmail = {
  Labels: {
    listCache_: null,

    list: function(i, callback, errorCallback) {
      if (this.listCache_) {
        callback(this.listCache_);
        return;
      }

      GApi.getAccessToken(i, function(accessToken) {
        var url = 'https://www.googleapis.com/gmail/v1/users/me/labels?access_token=' +
          encodeURIComponent(accessToken);
        
        ajax({
          url: url,
          type: 'json'
        }, function(data) {
          this.listCache_ = data;
          callback(data);
        }.bind(this), function(error) {
          new ErrorCard('Could not get labels list');
          if (errorCallback) errorCallback();
        }); 
      }.bind(this), errorCallback);
    }
  },
  
  Messages: {
    list: function(i, query, callback, errorCallback) {
      GApi.getAccessToken(i, function(accessToken) {
        var url = 'https://www.googleapis.com/gmail/v1/users/me/messages' +
                  '?maxResults=20' +
                  '&q=' + encodeURIComponent(query) +
                  '&access_token=' + encodeURIComponent(accessToken);
        ajax({
          url: url,
          type: 'json'
        }, function(data) {
          callback(data);
        }, function(error) {
          new ErrorCard('Could not get messages');
          if (errorCallback) errorCallback();
        }); 
      }, errorCallback);
    },
    
    get: function(i, messageId, callback, errorCallback) {
      GApi.getAccessToken(i, function(accessToken) {
        var url = 'https://www.googleapis.com/gmail/v1/users/me/messages/' +
                  messageId +
                  '?access_token=' + encodeURIComponent(accessToken);
        ajax({
          url: url,
          type: 'json'
        }, callback, function(error) {
          if (errorCallback) errorCallback();
        }); 
      }, errorCallback);
    },

    modify: function(i, messageId, options, callback, errorCallback) {
      GApi.getAccessToken(i, function(accessToken) {
        var url = 'https://www.googleapis.com/gmail/v1/users/me/messages/' +
          messageId + '/modify' +
          '?access_token=' + encodeURIComponent(accessToken);

        ajax({
          url: url,
          method: 'post',
          type: 'json',
          data: options
        }, callback, function(error) {
          new ErrorCard('Could not modify labels');
          if (errorCallback) errorCallback();
        }); 
      }, errorCallback);
    }
  },
  
  UNREAD_LABEL_ID: 'UNREAD'
};

module.exports = Gmail;
