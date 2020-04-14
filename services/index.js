var Activity = require('../models/activities');
var mongoose = require('mongoose');
var readXlsxFile = require('read-excel-file/node');

module.exports.getNameActByCode=async function(c){
  let act=await Activity.findOne({code:c});
  if(act)return act.name;
  return null;
}
module.exports.isActHaveFileCheckin=async function(c){let act=await Activity.findOne({code:c});if(!act)return null;if(act.isHaveFile)return true;return false;}