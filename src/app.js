var Settings = require('settings');
var MailLabelsList = require('Mail/MailLabelsList');

Settings.config({
  url: 'https://keanulee.github.io/workmate/configure/'
});

new MailLabelsList();