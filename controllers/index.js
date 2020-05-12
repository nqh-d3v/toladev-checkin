var services = require('../services/index');
var mongoose = require('mongoose');
var readXlsxFile = require('read-excel-file/node');

module.exports.getHome = function (req, res) {
  let code = req.query.c||"";
  res.render('home', {code_inp: code});
}
module.exports.AJAX_getInfoFromCode=async function(req,res){let code=req.query.c||'';let id=req.query.id||'?';var nameID = '';
  let name=await services.getNameActByCode(code);

  let status=await services.isCheckedIn(code, id);
  if(status.checked) return res.send({e: `Bạn đã điểm danh hoạt động này!`, s: false});

  let tokenUsed = await services.isTokenUsed(code, id, req.body.token);
  if(tokenUsed.s) return res.send({e: `Dường như bạn đang cố điểm danh cho một người khác trên thiết bị của bạn.(Thiết bị này đã được sử dụng để điểm danh cho "${tokenUsed.i.name}", tạo vào lúc "${tokenUsed.i.time}")`, s: false});

  if(!name)return res.send({e: 'Không tìm thấy hoạt động cần điểm danh!',s:false});
  if(!validateIPaddress(req.body.ip)) return res.send({e: 'Địa chỉ IP không hợp lệ! Kiểm tra và thử lại sau!', s: false});
  let isHadFile = await services.isActHaveFileCheckin(code);
  if(!isHadFile)return res.send({e:'Danh sách tham gia chưa được cập nhật! Vui lòng thử lại sau!',s:false});
  await readXlsxFile(`./public/files/xlsx/${code}.xlsx`,{sheet:'DIEMDANH'}).then(async function(rows,error){
    if(error){console.log('Lỗi đọc file: '+error);return res.send({e:'Dường như có lỗi nào đó đã xảy ra trong quá trình kiểm tra thông tin của bạn! Liên hệ quản trị viên để biết thông tin',s:false});}
    for(var i=1;i<rows.length;i++){
      if(rows[i][0] == id){
        if(!status.exists) await services.addTempCheckin(code, id, rows[i][1], req.body.ip, req.body.timezone, req.body.token);
        return res.send({nameAct: name, nameUser: rows[i][1], s:true});
      }
    }
    return res.send({e: 'Không tìm thấy thông tin của bạn trong danh sách tham gia, liên hệ người tổ chức để biết thông tin!',s:false});
  });
}

function validateIPaddress(ipaddress) 
{
  return (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress));
}