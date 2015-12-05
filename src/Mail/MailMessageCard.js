var UI = require('ui');
var Util = require('Util');
var MailActionsList = require('MailActionsList');

var MailMessageCard = function(account, message, messagesList) {
  this.card = new UI.Card({
    title: Util.getMessageFromHeader(message),
    subtitle: Util.getMessageSubjectHeader(message),
    body: Util.decodeHTML(message.snippet),
    scrollable: true
  });
  
  this.card.on('click', 'select', function() {
    new MailActionsList(account, message, messagesList, this);
  }.bind(this));
  
  this.card.on('longClick', 'select', function() {
    new MailActionsList(account, message, messagesList, this);
  }.bind(this));
  
  this.card.show();
};

module.exports = MailMessageCard;
