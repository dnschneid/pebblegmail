var Settings = require('settings');
var UI = require('ui');
var Gmail = require('Mail/Gmail');
var MailMessagesList = require('Mail/MailMessagesList');
var ErrorCard = require('ErrorCard');

var AccountsList = function() {
  var accounts = Settings.option('accounts');
  if (!accounts) {
    if (!Settings.option('clientId') || !Settings.option('secret')) {
      new ErrorCard('Set oauth2 client ID and secret on phone');
    } else {
      new ErrorCard('Add accounts via phone UI');
    }
    return;
  }
  
  this.menu = new UI.Menu({
    sections: [{
      title: 'Gmail',
      items: accounts.map(function(account) {
        return {
          title: account.name,
          subtitle: 'Loading...',
          icon: 'images/refresh.png'
        };
      })
    }]
  });

  this.menu.on('select', function(e) {
    var messages = e.item.messages;
    if (messages) new MailMessagesList(e.item.account, e.item.title, messages);
  }.bind(this));

  this.menu.on('longSelect', function(e) {
    var messages = e.item.messages;
    if (messages) new MailMessagesList(e.item.account, e.item.title, messages);
  }.bind(this));

  this.menu.show();
               
  for (var i = 0; i < accounts.length; i++) {
    var accountIndex = i;
    var query = accounts[accountIndex].query || 'is:unread -is:mute';
    Gmail.Messages.list(accounts[accountIndex], query, function(data) {
      this.menu.item(0, accountIndex, {
        title: accounts[accountIndex].name,
        subtitle: data.resultSizeEstimate + ' messages',
        account: accounts[accountIndex],
        messages: data.messages && data.messages.length ? data.messages : null,
        icon: null
      });
    }.bind(this), function() {
      this.menu.item(0, accountIndex, {
        title: accounts[accountIndex].name,
        subtitle: 'Failed to load messages',
        icon: 'images/warning.png'
      });
    }.bind(this));
  }
};

module.exports = AccountsList;
