var Settings = require('settings');
var UI = require('ui');
var Gmail = require('Mail/Gmail');
var MailMessagesList = require('Mail/MailMessagesList');

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
    this.menu = new UI.Menu({ sections: sections });
    this.menu.show();
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

AccountsList.prototype.updateAccount = function(account, data, error) {
  var index = this.accounts.indexOf(account);
  this.menu.item(0, index, {
    title: account.name,
    subtitle: data ? data.resultSizeEstimate + ' messages' : error,
    account: account,
    messages: data && data.messages && data.messages.length ? data.messages : null,
    icon: data ? null : 'images/warning.png'
  });
};

module.exports = AccountsList;
