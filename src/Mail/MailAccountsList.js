var Settings = require('settings');
var UI = require('ui');
var Gmail = require('Gmail');
var MailMessagesList = require('MailMessagesList');
var Util = require('Util');

var MailAccountsList = function() {
  this.accounts = Settings.option('accounts');
  if (!this.accounts) {
    this.menu = new UI.Menu({
      highlightBackgroundColor: Gmail.COLOR,
      sections: [{
        title: 'No accounts added',
        items: [{ title: 'Add via phone UI' }]
      }]
    });
    this.menu.show();
    return;
  }

  this.menu = new UI.Menu({
    highlightBackgroundColor: Gmail.COLOR,
    sections: [{
      title: 'Email',
      items: {}
    }]
  });

  this.menu.on('select', function(e) {
    var messages = e.item.messages;
    if (messages && messages.length) {
      this.child = new MailMessagesList(this, e.item.account, e.item.title, messages);
    }
  }.bind(this));

  this.menu.on('longSelect', function(e) {
    for (var i = 0; i < this.accounts.length; i++) {
      this.refreshAccount(this.accounts[i]);
    }
  }.bind(this));

  for (var i = 0; i < this.accounts.length; i++) {
    this.accounts[i].refreshing = false;
    this.refreshAccount(this.accounts[i]);
  }

  this.menu.show();
};

MailAccountsList.prototype.hide = function() {
  this.menu.hide();
  if (this.child) {
    this.child.hide();
    this.child = null;
  }
};

MailAccountsList.prototype.refreshAccount = function(account) {
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
  (account.threaded ? Gmail.Threads.list : Gmail.Messages.list)
    (account, account.query || 'is:unread -is:mute',
      this.updateAccount.bind(this), this.updateAccount.bind(this));
};

MailAccountsList.prototype.updateAccount = function(account, data, error) {
  var index = this.accounts.indexOf(account);
  var item = {
    title: account.name,
    account: account,
  };
  if (data) {
    item.subtitle = data.resultSizeEstimate +
                    (account.threaded ? ' conversation' : ' message') +
                    Util.plural(data.resultSizeEstimate);
    item.icon = null;
    item.messages  = account.threaded ? data.threads : data.messages;
  } else {
    item.subtitle = error;
    item.icon = 'images/warning.png';
    item.messages = null;
  }
  this.menu.item(0, index, item);
  account.refreshing = false;
};

module.exports = MailAccountsList;
