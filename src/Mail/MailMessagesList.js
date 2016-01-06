var UI = require('ui');
var Util = require('Util');
var Gmail = require('Mail/Gmail');
var MailMessageCard = require('MailMessageCard');
var MailActionsList = require('MailActionsList');

var MailMessagesList = function(accountsList, account, title, messages) {
  this.threaded = accountsList.refreshAccount && account.threaded;
  this.account = account;

  var thread = null;
  if (!this.threaded && messages.messages) {
    thread = messages;
    /* Threads return oldest-to-newest, but we want newest on top */
    messages = Array.prototype.slice.call(messages.messages).reverse();
  }
  this.messages = messages;
  
  if (!messages || !messages.length) {
    return;
  }

  this.menu = new UI.Menu({
    highlightBackgroundColor: Gmail.COLOR,
    sections: [{
      title: title,
      items: messages.map(function(message) { return {
        title: 'Loading...',
        subtitle: '(' + message.id + ')',
        message: null,
        icon: 'images/refresh.png'
       };})
    }]
  });

  this.menu.on('select', function(e) {
    var message = e.item.message;
    if (message && message.messages) {
      new MailMessagesList(this, account, e.item.title, message);
    } else if (message) {
      new MailMessageCard(account, message, this);
    }
  }.bind(this));

  this.menu.on('longSelect', function(e) {
    var message = e.item.message;
    if (message) new MailActionsList(account, message, this);
  }.bind(this));

  this.menu.on('hide', function() {
    if (thread) {
      accountsList.updateMessage(thread);
    } else {
      accountsList.refreshAccount(account);
    }
  });

  this.menu.show();

  messages.map(this.loadMessage.bind(this));
};

MailMessagesList.prototype.loadMessage = function(message) {
  if (message.loaded) {
    return;
  }
  /* only load metadata if viewing threads or the message is known to be read */
  var metadataOnly = this.threaded ||
      (message.labelIds && message.labelIds.indexOf(Gmail.UNREAD_LABEL_ID) == -1);
  (this.threaded ? Gmail.Threads.get : Gmail.Messages.get)
    (!metadataOnly, this.account, message.id, function(data) {
      for (var field in data) {
        message[field] = data[field];
      }
      this.updateMessage(message);
    }.bind(this), function(error) {
      this.setMessageError(message, error);
    }.bind(this));
};

MailMessagesList.prototype.updateMessage = function(message) {
  var index = this.messages.indexOf(message);
  var thread = message.messages || [message];
  var starred = false;
  var unread = 0;
  for (var i = 0; i < thread.length; i++) {
    starred = starred || thread[i].labelIds.indexOf(Gmail.STARRED_LABEL_ID) !== -1;
    if (thread[i].labelIds.indexOf(Gmail.UNREAD_LABEL_ID) !== -1) {
      unread += 1;
    }
  }
  var title = Util.trimLine(Util.getMessageSubjectHeader(thread[0]));
  var subtitle = starred ? '*' : '';
  if (this.threaded) {
    if (unread) {
      subtitle += unread + ' unread, ';
    }
    subtitle += thread.length + ' messages';
  } else {
    var from = Util.trimLine(Util.getMessageFromHeader(thread[0]));
    subtitle += (unread ? '' : '®') + from;
    if (this.account.threaded) {
      title = Util.trimLine(Util.decodeHTML(thread[0].snippet));
    }
  }
  
  this.menu.item(0, index, {
    title: title, subtitle: subtitle, icon: null,
    message: message
  });
};

MailMessagesList.prototype.setMessageError = function(message, error) {
  var index = this.messages.indexOf(message);
  this.menu.item(0, index, {
    title: 'Error',
    subtitle: error,
    message: null,
    icon: 'images/warning.png'
  });
};

module.exports = MailMessagesList;
