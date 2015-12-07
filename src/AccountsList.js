var Settings = require('settings');
var UI = require('ui');
var Gmail = require('Mail/Gmail');
var MailMessagesList = require('Mail/MailMessagesList');
var ErrorCard = require('ErrorCard');

var AccountsList = function() {
  this.accounts = Settings.option('accounts');
  if (!this.accounts) {
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
      items: this.accounts.map(function(account) {
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
               
  for (var i = 0; i < this.accounts.length; i++) {
    var query = this.accounts[i].query || 'is:unread -is:mute';
    Gmail.Messages.list(this.accounts[i], query,
                        this.updateAccount.bind(this), this.updateAccount.bind(this));
  }
};

AccountsList.prototype.updateAccount = function(account, data) {
  var index = this.accounts.indexOf(account);
  this.menu.item(0, index, {
    title: account.name,
    subtitle: data ? data.resultSizeEstimate + ' messages' : 'Failed to load messages',
    account: account,
    messages: data && data.messages && data.messages.length ? data.messages : null,
    icon: data ? null : 'images/warning.png'
  });
};

module.exports = AccountsList;
