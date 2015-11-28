var Settings = require('settings');
var MailLabelsList = require('Mail/MailLabelsList');

Settings.config({
  url: 'https://dnschneid.github.io/pebblegmail/configure/'
});

new MailLabelsList();