var Account = require('../models/accounts');
var Activity = require('../models/activities');
var mongoose = require('mongoose');

module.exports.getAllMyActivities = async function (a) {
  let all = await Activity.find({auth: a});
  return all;
}
module.exports.getActivitiesReady = async function (a) {
  let all = await Activity.find({auth: a,isHaveFile: true});
  return all;
}

module.exports.isCodeNotExist_code = async function (c,a) {
  let countall = await Activity.find({code: c,auth:a}).count();
  if(countall > 0) return null;
  return c;
}
module.exports.isCodeExist_code = async function (c,a) {
  let countall = await Activity.find({code: c,auth:a}).count();
  if(countall == 0) return null;
  return c;
}
module.exports.createNewActivity = async function (i){
  let act = new Activity(i);
  await act.save({}, err => {
    if(err) throw err;
  });
}
module.exports.uploadedFileCheckinActById=async function(i){let act=await Activity.findById(i);act.isHaveFile=true;await act.save({},err=>{if(err)throw err;})}
module.exports.getActByCode=async function(c,a){let act=await Activity.findOne({code:c,auth:a});return act;}
module.exports.delActByCode=async function(c,a){let act=await Activity.findOneAndDelete({code:c,auth:a});if(act)return act.name;return null;}
module.exports.getNameActByCode=async function(c,a){let act=await Activity.findOne({code:c,auth:a});if(act)return act.name;return null;}
module.exports.updateNameAct=async function(c,n,a){let act=await Activity.findOne({code:c,auth:a});if(!act)return null;act.name=n;await act.save({},err=>{if(err)throw err;});return n;}
module.exports.updateNumTPIAct=async function(c,n,a){let act=await Activity.findOne({code:c,auth:a});if(!act)return;act.numTPI=n;act.listCheckin=[];await act.save({},err=>{if(err)throw err;});return;}
module.exports.addUserCheckinAct=async function(c,i,n,a){let now=new Date();let infCK={id:i,name:n,createAt:now};let act=await Activity.findOne({code:c,auth:a});if(!act)return null;act.listCheckin.push(infCK);await act.save({},err=>{if(err){throw err;}});return n;}
module.exports.isCheckedIn=async function(c,i,a){let act=await Activity.findOne({code:c,auth:a}); if(isIDEleInArr(i,act.listCheckin))return true; return false;}
module.exports.updateInfoUser=async function(i,a){let me=await Account.findById(a);if(!me)return null;me.name=(i.name=='')?me.name:i.name;await me.save({},err=>{if(err)throw err;});return me;}
function isIDEleInArr(id,a){for(var i=0;i<a.length;i++)if(a[i].id==id)return true;return false;}