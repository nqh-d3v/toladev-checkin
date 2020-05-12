var Account = require('../models/accounts');
var Activity = require('../models/activities');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');

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
module.exports.sendMailActive= async function(a,c,i,n,m){
  var transporter =  nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: '<your_username_gmail_account',
      pass: '<your_password_gmail_account'
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
    }
});
var content = '';
content += `
<div style="width: 100%; padding: 10px; box-sizing: border-box; background-color: #007bff; font-family: Arial, Helvetica, sans-serif;">
<div style="text-align: right; margin-bottom: 5px;;">
<img src="https://lib.toladev.info/img/DEV_850.png" alt="logo-toladev" style="width: 40px; height: 40px;">
</div>
<div style="width: 100%; padding: 5px; box-sizing: border-box; font-size: 14px; background-color: white; margin-bottom: 5px;">
Hello ${n}, You are receiving this mail because you are registered to participate in ${a} activity with this gmail address.
To take attendance/checkin when participating in activities.<br>
Please use the code below and follow the instructions (or click on the link below).<br>
<hr>
<h6 style="text-align: center; margin: 5px 0px; padding: 0px;">${c}_${i}</h6>
<hr>
<a href="https://toladev-checkin.herokuapp.com?c=${c}_${i}">Access to check in website to checkin for ${n}</a><br>
If you do nothing, treat this email as spam and ignore it! Thanks
</div>
<div style="padding: 5px; box-sizing: border-box; color: white;">
About <a href="https://www.toladev.info" style="text-decoration: none; font-weight: 600; color: white">I'm a Dev</a>
</div>
</div>

`;
var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
  from: 'toladev.info - Checkin online',
  to: m,
  subject: 'QR Code for checkin - Activity "'+a+'"',
  html: content
}
transporter.sendMail(mainOptions, function(err, info){
  if (err) {
    console.log('==== Send mail to \''+n+'\' with address \''+m+'\' == Error:  ' + err);
  } else {
    console.log('==== Send mail to \''+n+'\' with address \''+m+'\' == Status: ' +  info.response);
  }
});
}
module.exports.uploadedFileCheckinActById=async function(i){let act=await Activity.findById(i);act.isHaveFile=true;await act.save({},err=>{if(err)throw err;})}
module.exports.getActByCode=async function(c,a){let act=await Activity.findOne({code:c,auth:a});return act;}
module.exports.delActByCode=async function(c,a){let act=await Activity.findOneAndDelete({code:c,auth:a});if(act)return act.name;return null;}
module.exports.getNameActByCode=async function(c,a){let act=await Activity.findOne({code:c,auth:a});if(act)return act.name;return null;}
module.exports.updateNameAct=async function(c,n,a){let act=await Activity.findOne({code:c,auth:a});if(!act)return null;act.name=n;await act.save({},err=>{if(err)throw err;});return n;}
module.exports.updateNumTPIAct=async function(c,n,a){let act=await Activity.findOne({code:c,auth:a});if(!act)return;act.numTPI=n;act.listCheckin=[];await act.save({},err=>{if(err)throw err;});return;}
module.exports.addUserCheckinAct=async function(c,i,a){let now=new Date();let act=await Activity.findOne({code:c,auth:a});if(!act)return null; for(var stt=0;stt<act.listCheckin.length;stt++){if(i==act.listCheckin[stt].id){act.listCheckin[stt].checkinAt=new Date();act.listCheckin[stt].isChecked=true;}} ; await act.save({},err=>{if(err){throw err;}});return i;}
module.exports.isCheckedIn=async function(c,i,a){let act=await Activity.findOne({code:c,auth:a}); if(isIDEleInArr(i,act.listCheckin))return true; return false;}
module.exports.updateInfoUser=async function(i,a){let me=await Account.findById(a);if(!me)return null;me.name=(i.name=='')?me.name:i.name;await me.save({},err=>{if(err)throw err;});return me;}
function isIDEleInArr(id,a){for(var i=0;i<a.length;i++)if(a[i].id==id&&a[i].isChecked)return true;return false;}