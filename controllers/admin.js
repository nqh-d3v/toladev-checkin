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
    code: req.body.code,
    auth: req.user._id,
  };
  await services.createNewActivity(info);
  res.redirect('/admin');
}

module.exports.getSendMailAct=async function(req,res) {
  let c = req.query.c;
  let i = await services.getActByCode(c, req.user._id);
  if(!i) {
    req.flash('mess', 'Không tìm thấy thông tin hoạt động cần gửi mail!');
    return res.redirect('/admin');
  }
  await readXlsxFile(`./public/files/xlsx/${c}.xlsx`,{sheet:'DIEMDANH'}).then(async function(rows,error){
    if(error){req.flash('mess', 'Một lỗi nào đó đã xảy ra trong quá trình xử lý file! Vui lòng thử lại sau!'); return res.redirect('/admin');}
    for(var stt = 1; stt < rows.length; stt++) {console.log(rows[stt][1]); if(validateEmail(rows[stt][2])) await services.sendMailActive(i.name, i.code, rows[stt][0], rows[stt][1], rows[stt][2]);}
  });
  req.flash('mess', 'Đã gửi mail cho tất cả người tham dự có địa chỉ gmail hợp lệ!');
  return res.redirect('/admin');
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
  if(!req.query.name || req.query.name.legnth < 4) return res.send(null);
  let code = new codeAct().creatCode(req.query.name)
  var check;
  do {
    check = await services.isCodeNotExist_code(code,req.user._id);
  } while (!check);
  return res.send(check);
}
module.exports.AJAX_isExistAct=async function(req,res){let c=req.query.c;let n=await services.getNameActByCode(c,req.user._id);return res.send(n);}

module.exports.AJAX_getActByCode=async function(req,res){let c=req.query.c;let a=await services.getActByCode(c,req.user._id);
  let lst = []; // Mọi người
  let lstTPI = []; //Đã điểm danh
  let lstC = []; // Chỉ mới tạo vùng điểm danh
  let lstCI = []; // Thông tin người dùng chỉ mới tạo vùng điểm danh
  await readXlsxFile(`./public/files/xlsx/${c}.xlsx`,{sheet:'DIEMDANH'}).then(async function(rows,error){
    if(error){console.log('Lỗi đọc file: '+error);return res.send({e:'Lỗi hệ thống',s:false});}
    for(var stt=1;stt<rows.length;stt++)lst.push({id: rows[stt][0], name: rows[stt][1], gmail: rows[stt][2], isValid: validateEmail(rows[stt][2])});
    for(var x = 0; x < a.listCheckin.length; x++) {lstC.push(a.listCheckin[x].id); lstCI.push({id: a.listCheckin[x].id, ip: a.listCheckin[x].ipCheckin, timezone: a.listCheckin[x].timezone, createAt: a.listCheckin[x].createAt, checkinAt: a.listCheckin[x].checkinAt}); if(a.listCheckin[x].isChecked) lstTPI.push(a.listCheckin[x].id);}
    return res.send({a:a,lstJoin:lst,lstTPI:lstTPI, lstCreated: lstC, lstCreatedInfo: lstCI});
  });
}

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
      let na=await services.addUserCheckinAct(c,id,req.user._id);
      if(na)return res.send({i:`Điểm danh thành công cho ${name}`,s:true});
      return res.send({e:`Điểm danh thất bại cho ${name}! Đã xảy ra lỗi trong quá trình lưu thông tin!`,s:false});
    }
    return res.send({e:`Không tìm thấy thông tin người tham gia hoạt động ${sc} với id: ${id}`,s:false});
  });
}
module.exports.AJAX_listJoin=async function(req,res){

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

function removeCharInStr(c,s){var o='';for(var i=0;i<s.length;i++)o+=(s[i]!=c)?s[i]:'';return o;}
class codeAct{
	constructor() {
    this.arrOne = ['1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V'];
    this.arrDat = [31,28,31,30,31,30,31,31,30,31,30,31];
	}
	_time(key){
		var n = new Date(), o = '',y=n.getFullYear()+'';
		if(n.getFullYear()%4===0&&n.getFullYear()%100!=0)this.arrDat[1] = 29;
		o = this.arrOne[Math.abs(n.getDate()+key.length-this.arrDat[n.getMonth()])]+''+this.arrOne[Math.abs(n.getMonth()+1+key.length-12)]+''+this.arrOne[Math.abs(Number(y[0])+key.length-31)]+''+this.arrOne[Math.abs(Number(y[1])+key.length-31)]+''+this.arrOne[Math.abs(Number(y[2])+key.length-31)]+''+this.arrOne[Math.abs(Number(y[3])+key.length-31)];
		return o;
	}
	_rand(n,type){
		var l;
		if(!n||n==0||isNaN(n))l=5 
		else l=n;
		var result='';
		var chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		var nums = '0123456789';
		var charsLength=chars.length;
		var numsLength = nums.length;
		for(var i=0;i<l; i++){
			result+=(type=='char')?chars.charAt(Math.floor(Math.random()*charsLength)):nums.charAt(Math.floor(Math.random()*numsLength));
		}
		return result;
  }
  creatCode(key) {
    return this._time(key)+this._rand(2,'char')+this._rand(2, 'num');
  }
}
function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}