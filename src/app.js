var Settings = require('settings');
var MailAccountsList = require('Mail/MailAccountsList');
var GApi = require('GApi');

Settings.config({
  url: 'https://dnschneid.github.io/pebblegmail/configure/'
}, GApi.updateConfiguration );

new MailAccountsList();