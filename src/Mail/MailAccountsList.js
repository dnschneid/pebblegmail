var Settings = require('settings');
var UI = require('ui');
var Gmail = require('Gmail');
var MailMessagesList = require('MailMessagesList');

var AccountsList = function() {
  this.accounts = Settings.option('accounts');
  if (!this.accounts) {
    var sections = [];
    if (!Settings.option('clientId') || !Settings.data('secret')) {
      sections.push({ title: 'Configure on phone', items: [] });
      if (!Settings.option('clientId')) {
        sections[0].items.push({ title: 'OAuth2 client ID' });
      }
      if (!Settings.data('secret')) {
        sections[0].items.push({ title: 'OAuth2 secret' });
      }
    }
    sections.push({
      title: 'No accounts added',
      items: [{ title: 'Add via phone UI' }]
    });
    this.menu = new UI.Menu({
      highlightBackgroundColor: Gmail.COLOR,
      sections: sections
    });
    this.menu.show();
    return;
  }
  
  this.menu = new UI.Menu({
    highlightBackgroundColor: Gmail.COLOR,
    sections: [{
      title: 'Gmail',
      items: {}
    }]
  });

  this.menu.on('select', function(e) {
    var messages = e.item.messages;
    if (messages) {
      new MailMessagesList(this, e.item.account, e.item.title, messages);
    }
  }.bind(this));

  this.menu.on('longSelect', function(e) {
    for (var i = 0; i < this.accounts.length; i++) {
      this.refreshAccount(this.accounts[i]);
    }
  }.bind(this));

  for (var i = 0; i < this.accounts.length; i++) {
    this.refreshAccount(this.accounts[i]);
  }

  this.menu.show();
};

AccountsList.prototype.refreshAccount = function(account) {
  if (account.refreshing) {
    return;
  }
  account.refreshing = true;
  var index = this.accounts.indexOf(account);
  this.menu.item(0, index, {
    title: account.name,
    subtitle: 'Loading...',
    icon: 'images/refresh.png',
    account: account,
    messages: null
  });
  Gmail.Messages.list(account, account.query || 'is:unread -is:mute',
      this.updateAccount.bind(this), this.updateAccount.bind(this));
};

AccountsList.prototype.updateAccount = function(account, data, error) {
  var index = this.accounts.indexOf(account);
  this.menu.item(0, index, {
    title: account.name,
    subtitle: data ? data.resultSizeEstimate + ' messages' : error,
    icon: data ? null : 'images/warning.png',
    account: account,
    messages: data && data.messages && data.messages.length ? data.messages : null
  });
  account.refreshing = false;
};

module.exports = AccountsList;
