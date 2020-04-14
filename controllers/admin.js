var passport = require('passport');
var mongoose = require('mongoose');
var readXlsxFile = require('read-excel-file/node');
var services = require('../services/admin');
module.exports.getLogin = function (req, res) {
  res.render('admin/login', {
    mess: req.flash('mess')
  });
}
module.exports.postLogin = passport.authenticate("local-login", {
  successRedirect : '/admin',
  failureRedirect : '/admin/login',
  failureFlash : true
});
module.exports.postCreateAccount = passport.authenticate("local-create-account", {
  successRedirect : '/admin/login',
  failureRedirect : '/admin/login',
  failureFlash : true
});
module.exports.getHome = async function (req, res) {
  let activities = await services.getAllMyActivities(req.user._id);
  let activitiesReady = await services.getActivitiesReady(req.user._id);
  res.render('admin/home', {
    mess: req.flash('mess'),
    user: req.user,
    act: activities,
    actRD: activitiesReady
  });
}
module.exports.getLogout = async function (req, res) {
  req.logout();
  res.redirect('/admin');
}

module.exports.postCreateActivity = async function(req, res) {
  let info = {
    name: req.body.name,
    code: removeCharInStr('-',req.body.code),
    auth: req.user._id,
  };
  await services.createNewActivity(info);
  res.redirect('/admin');
}

//-- AJAX request
module.exports.AJAX_postUploadListCheckin = async function(req, res) {
  var c=req.params.c;
  console.log(req.body.fileact+'-file');
  var i=await services.getActByCode(c,req.user._id);
  if(!i) return res.send({e:'Không tìm thấy hoạt động cần tải file lên!',s:false});
  await readXlsxFile(`./public/files/xlsx/${c}.xlsx`,{sheet:'DIEMDANH'}).then(async function(rows,error){
    if(error){console.log('Lỗi đọc file: '+error);return res.send({e:'Dường như có lỗi nào đó đã xảy ra trong quá trình đọc file mà bạn tải lên! Hãy chắc chắn rằng file bản tải lên là đúng trước khi thử lại!',s:false});}
    await services.updateNumTPIAct(c,rows.length-1,req.user._id);
    await services.uploadedFileCheckinActById(i._id);
  });
  return res.send({n:i.name,s:true});
}
module.exports.AJAX_createNewCodeAct = async function (req, res) {
  let now = new Date();
  let code = add0(now.getDate())+add0(now.getMonth()+1)+''+now.getFullYear()+''+randomNum(4)+''+randomNum(4);
  var check;
  do {
    check = await services.isCodeNotExist_code(code,req.user._id);
  } while (!check);
  return res.send(check);
}
module.exports.AJAX_isExistAct=async function(req,res){let c=req.query.c;let n=await services.getNameActByCode(c,req.user._id);return res.send(n);}
module.exports.AJAX_getActByCode=async function(req,res){let c=req.query.c;let a=await services.getActByCode(c,req.user._id);return res.send(a);}
module.exports.AJAX_delActByCode=async function(req,res){let c=req.query.c;let i=await services.delActByCode(c,req.user._id);return res.send(i);}
module.exports.AJAX_reloadAct=async function(req,res){let a=await services.getAllMyActivities(req.user._id);return res.send(a);}
module.exports.AJAX_updateNameAct=async function(req,res){let c=req.params.c;let n=req.query.n;if(!req.params.c||!req.query.n)return res.send(false);let nn=await services.updateNameAct(c,n,req.user._id);console.log(nn);if(nn)return res.send(nn);return res.send(null);}
module.exports.AJAX_checkinAct=async function(req,res){
  let c=req.params.c;
  let id=req.query.id;
  let sc=await services.getNameActByCode(c,req.user._id);
  if(!sc)return res.send({e:'Không tìm thấy hoạt động nào trong danh sách hoạt động của bạn cho mã:'+c+'-'+sc,s:false});
  let cs=await services.isCheckedIn(c,id,req.user._id);
  if(cs) return res.send({e:'Bạn đã điểm danh hoạt động này',s:false});
  //Đọc file kiểm tra thông tin user
  var name = '';
  await readXlsxFile(`./public/files/xlsx/${c}.xlsx`,{sheet:'DIEMDANH'}).then(async function(rows,error){
    if(error){console.log('Lỗi đọc file: '+error);return res.send({e:'Lỗi hệ thống',s:false});}
    for(var stt=1;stt<rows.length;stt++)if(rows[stt][0]==id){name=rows[stt][1];break;}
    if(name!=''){
      let na=await services.addUserCheckinAct(c,id,name,req.user._id);
      if(na)return res.send({i:`Điểm danh thành công cho ${name}`,s:true});
      return res.send({e:`Điểm danh thất bại cho ${name}! Đã xảy ra lỗi trong quá trình lưu thông tin!`,s:false});
    }
    return res.send({e:`Không tìm thấy thông tin người tham gia hoạt động ${sc} với id: ${id}`,s:false});
  });
}
module.exports.AJAX_updateInfo=async function(req,res){
  let name=req.query.name||'';
  let info={name:name,};
  let newUser=await services.updateInfoUser(info,req.user._id);
  if(newUser){req.user=newUser;return res.send({i:'Cập nhật thành công',s:true});}
  return res.send({e:'Không tìm thấy thông tin cần cập nhật, vui lòng thử lại sau!',s:false});
}
//--- Authentication user
module.exports.isNotLogined_next = async function (req, res, next) {
  if (!req.isAuthenticated()) return next();
  return res.redirect('/admin');
}
module.exports.isLogined_next = async function (req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.redirect('/admin/login');
}
module.exports.isParamsId_next = async function (req, res, next) {
  if(req.isAuthenticated()) {
    if(mongoose.Types.ObjectId.isValid(req.params.id)) return next();
    req.flash('mess', 'Định dạng đầu vào không chính xác!');
    return res.redirect('/admin');
  }
  return res.redirect('/admin/login');
}

module.exports.checkActBefUploadFile=async function(req,res,next){
  let c=req.params.c;
  let i=await services.getActByCode(c,req.user._id);
  if(!i){let m='Không tìm thấy hoạt động cần tải file lên.';return res.send({e:m,s:false});}
  return next();
}

function randomNum(num) {
  var result           = '';
  var characters       = '0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < num; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function add0(n) {return (n<=9)?'0'+n:n;}
function removeCharInStr(c,s){var o='';for(var i=0;i<s.length;i++)o+=(s[i]!=c)?s[i]:'';return o;}
