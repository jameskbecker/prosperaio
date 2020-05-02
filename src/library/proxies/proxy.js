const fs = require("fs");
const request = require("request");
const config = require("../../configuration/config")

exports.format = function(input) {
  if (input && ['localhost', ''].indexOf(proxy) < 0) {
    proxy = proxy.replace(' ', '_');
    const proxySplit = proxy.split(':');
    if (proxySplit.length > 3)
      return "http://" + proxySplit[2] + ":" + proxySplit[3] + "@" + proxySplit[0] + ":" + proxySplit[1];
    else
      return "http://" + proxySplit[0] + ":" + proxySplit[1];
    }
  else
    return '';
}

exports.getRandomItem = function(array) {
  if (array.length === 0) {
    return null;
  } else {
    return exports.formatProxy(array[Math.floor(Math.random() * array.length)]);
  }
}

exports.formatList = function(array) {
  let list = [];
  for (let i = 0; i < array.length; i++) {
    list.push(exports.formatProxy(array[i]));
  } 
  return list;
}