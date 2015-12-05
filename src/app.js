var Settings = require('settings');
var AccountsList = require('AccountsList');
var GApi = require('GApi');

Settings.config({
  url: 'https://dnschneid.github.io/pebblegmail/configure/'
}, GApi.updateConfiguration );

new AccountsList();