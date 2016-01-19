var Gmail = require('Gmail');
var UI = require('ui');
var Util = require('Util');
var MailLabelsList = require('MailLabelsList');

var MailMessageCard = function(parent, account, message, page) {
  this.parent = parent;
  this.message = message;
  this.page = page || 0;
  this.card = new UI.Card({
    subtitle: Util.getMessageSubjectHeader(message),
    body: 'Loading...',
    scrollable: true,
    style: 'small'
  });
  this.updateMessage();

  this.card.on('click', 'select', function() {
    this.child = new MailLabelsList(this, account, message);
  }.bind(this));

  this.card.on('longClick', 'select', function() {
    if (this.page + 1 < Util.getMessageBodyPageCount(message)) {
      this.child = new MailMessageCard(this, account, message, this.page + 1);
    }
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
  var pages = Util.getMessageBodyPageCount(this.message);
  if (pages < 0) {
    pages = '(Snippet)\n';
  } else if (pages > 1) {
    pages = '(Page ' + (this.page + 1) + ' of ' + pages + ')\n';
  } else {
    pages = '';
  }
  var body = '';
  if (this.page === 0) {
    body = Util.getMessageFromHeader(this.message) + '\n' +
           Util.getMessageDateTime(this.message) + '\n';
  }
  this.card.body(body +  pages + '\n' +
                 Util.getMessageBody(this.message, this.page));
};

MailMessageCard.prototype.labelsChanged = function(message) {
  this.parent.labelsChanged(message);
  this.hide();
};

module.exports = MailMessageCard;
