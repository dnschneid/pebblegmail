var Gmail = require('Gmail');
var UI = require('ui');
var Util = require('Util');
var MailLabelsList = require('MailLabelsList');

var MailMessageCard = function(parent, account, message) {
  this.parent = parent;
  this.message = message;
  this.card = new UI.Card({
    subtitle: Util.getMessageSubjectHeader(message),
    body: '',
    scrollable: true,
    style: 'small'
  });
  this.updateMessage();

  this.card.on('click', 'select', function() {
    this.child = new MailLabelsList(this, account, message);
  }.bind(this));

  this.card.on('longClick', 'select', function() {
    this.child = new MailLabelsList(this, account, message);
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

MailMessageCard.prototype.hide = function() {
  this.card.hide();
  if (this.child) {
    this.child.hide();
    this.child = null;
  }
};

MailMessageCard.prototype.updateMessage = function() {
  this.card.body(
    Util.getMessageFromHeader(this.message) + '\n' +
    Util.getMessageDateTime(this.message) + '\n\n' +
    Util.getMessageBody(this.message)
  );
};

MailMessageCard.prototype.labelsChanged = function(message) {
  this.parent.labelsChanged(message);
  this.hide();
};

module.exports = MailMessageCard;
