var Gmail = require('Gmail');
var UI = require('ui');
var Util = require('Util');
var MailActionsList = require('MailActionsList');

var MailMessageCard = function(account, message, messagesList) {
  this.message = message;
  this.card = new UI.Card({
    subtitle: Util.getMessageSubjectHeader(message),
    body: '',
    scrollable: true,
    style: 'small'
  });
  this.updateMessage();

  this.card.on('click', 'select', function() {
    new MailActionsList(account, message, messagesList, this);
  }.bind(this));

  this.card.on('longClick', 'select', function() {
    new MailActionsList(account, message, messagesList, this);
  }.bind(this));
  
  if (!message.loaded) {
    Gmail.Messages.get(true, account, message.id, function(data) {
      message.payload = data.payload;
      message.loaded = true;
      this.updateMessage();
    }.bind(this), function(error) {
      this.card.icon('');
    }.bind(this));
  }

  this.card.show();
};

MailMessageCard.prototype.updateMessage = function() {
  this.card.body(
    Util.getMessageFromHeader(this.message) + '\n' +
    Util.getMessageDateTime(this.message) + '\n\n' +
    Util.getMessageBody(this.message)
  );
};

module.exports = MailMessageCard;
