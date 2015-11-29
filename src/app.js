var Settings = require('settings');
var AccountsList = require('AccountsList');

Settings.config({
  url: 'https://dnschneid.github.io/pebblegmail/configure/'
});

new AccountsList();