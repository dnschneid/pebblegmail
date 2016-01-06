var UI = require('ui');
var Util = require('Util');
var Gmail = require('Gmail');
var ErrorCard = require('ErrorCard');

var MailActionsList = function(account, message, messagesList, messageCard) {
  this.account = account;
  this.thread = message.messages ? message : null;
  this.messages = message.messages || [message];
  this.messagesList = messagesList;
  this.messageCard = messageCard;
  this.labelIds = {};
  this.messages.forEach(function (message) {
    for (var i = 0; i < message.labelIds.length; i++) {
      this.labelIds[message.labelIds[i]] = true;
    }
  }.bind(this));

  this.createMenu();
  Gmail.Labels.list(account, function(data) {
    this.labels = data.labels || [];
    this.updateMenu();
  }.bind(this), function(error) {
    this.child = new ErrorCard(this.account.name, error);
    this.menu.hide();
  }.bind(this));
};

MailActionsList.prototype.hide = function() {
  this.menu.hide();
  if (this.child) {
    this.child.hide();
    this.child = null;
  }
};

MailActionsList.prototype.createMenu = function() {
  var subject = Util.getMessageSubjectHeader(this.messages[0]);
  this.menu = new UI.Menu({
    highlightBackgroundColor: Gmail.COLOR,
    sections: [{
      title: Util.trimLine(subject),
      items: [{
        title: 'Loading...',
        icon: 'images/refresh.png'
      }]
    }]
  });

  this.menu.on('select', function(e) {
    var label = e.item.label;
    if (label) {
      this.menu.on('select', null);

      var options = {
        removeLabelIds: [],
        addLabelIds: []
      };
      if (this.labelIds[label.id]) {
        options.removeLabelIds.push(label.id);
      } else {
        options.addLabelIds.push(label.id);
      }

      if (!this.thread && label.id !== Gmail.UNREAD_LABEL_ID) {
        options.removeLabelIds.push(Gmail.UNREAD_LABEL_ID);
      }

      this.menu.item(e.sectionIndex, e.itemIndex, {
        title: 'Loading...',
        icon: 'images/refresh.png'
      });

      (this.thread ? Gmail.Threads.modify : Gmail.Messages.modify)
        (this.account, (this.thread ? this.thread.id : this.messages[0].id),
         options, function(data) {
          this.messages.forEach(function (message) {
            var i;
            for (i = 0; i < options.addLabelIds.length; i++) {
              message.labelIds.push(options.addLabelIds[i]);
            }
            for (i = 0; i < options.removeLabelIds.length; i++) {
              message.labelIds.splice(message.labelIds.indexOf(options.removeLabelIds[i]), 1);
            }
          });
          if (this.messageCard) this.messageCard.card.hide();
          this.messagesList.updateMessage(this.thread || this.messages[0]);
          this.menu.hide();
        }.bind(this), function(error) {
          this.child = new ErrorCard(this.account.name, error);
        }.bind(this));
    }
  }.bind(this));

  this.menu.show();
};

MailActionsList.prototype.updateMenu = function() {
  var systemItems = [];
  var categoryItems = [];
  var labelItems = [];
  this.labels.forEach(function(label) {
    var hasLabel = this.labelIds[label.id];
    if (label.type === 'system') {
      var match = /^CATEGORY_(.*)$/.exec(label.id);
      if (match) {
        categoryItems.push({
          title: Util.capitalize(Util.trimLine(match[1])),
          icon: hasLabel ? 'images/check.png' : 'images/uncheck.png',
          label: label
        });
      } else if (this.canModifyLabel(label)) {
        systemItems.push({
          title: Util.capitalize(Util.trimLine(label.name)),
          icon: hasLabel ? 'images/check.png' : 'images/uncheck.png',
          label: label
        });
      }
    } else if (label.type === 'user') {
      labelItems.push({
        title: Util.trimLine(label.name),
        icon: hasLabel ? 'images/check.png' : 'images/uncheck.png',
        label: label
      });
    }
  }.bind(this));
  systemItems.sort(Util.systemLabelSortComparator);

  this.menu.items(0, systemItems);
  this.menu.section(1, {
    title: 'Categories',
    items: categoryItems
  });
  this.menu.section(2, {
    title: 'Labels',
    items: labelItems
  });
};

MailActionsList.prototype.canModifyLabel = function(label) {
  var unmodifiableLabels = {
    DRAFT: true,
    SENT: true,
    CHAT: true
  };
  return !unmodifiableLabels[label.id];
};

module.exports = MailActionsList;
