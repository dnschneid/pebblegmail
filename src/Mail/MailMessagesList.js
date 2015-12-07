var UI = require('ui');
var Util = require('Util');
var ErrorCard = require('ErrorCard');
var Gmail = require('Mail/Gmail');
var MailMessageCard = require('MailMessageCard');
var MailActionsList = require('MailActionsList');

var MailMessagesList = function(account, title, messages) {
  if (messages.length === 0) {
    new ErrorCard('No unread messages');
  /*} else if (messages.length === 1) {
    new MailMessageCard(account, messages[0]);*/
  } else {
    this.messages = messages;
    
    this.menu = new UI.Menu({
      sections: [{
        title: title,
        items: ''
      }]
    });
  
    this.menu.on('select', function(e) {
      var message = e.item.message;
      if (message) new MailMessageCard(account, message, this);
    }.bind(this));
      
    this.menu.on('longSelect', function(e) {
      var message = e.item.message;
      if (message) new MailActionsList(account, message, this);
    }.bind(this));
  
    this.menu.show();
    
    messages.map(function(message) {
      Gmail.Messages.get(account, message.id, function(data) {
        for (var field in data) {
          message[field] = data[field];
        }
        this.updateMessage(message);
      }.bind(this), function() {

      });
    }.bind(this));
  }
  
};

MailMessagesList.prototype.updateMessage = function(message) {
  var index = this.messages.indexOf(message);
  var state = (message.labelIds.indexOf('STARRED') !== -1 ? '*' : '') +
              (message.labelIds.indexOf('UNREAD') !== -1 ? '' : '®');
  this.menu.item(0, index, {
    title: Util.trimLine(Util.getMessageSubjectHeader(message)),
    subtitle: state + Util.trimLine(Util.getMessageFromHeader(message)),
    message: message
  });
};

module.exports = MailMessagesList;
