var services = require('../services/index');
var mongoose = require('mongoose');
var readXlsxFile = require('read-excel-file/node');

module.exports.getHome = function (req, res) {
  res.render('home');
}
module.exports.AJAX_getInfoFromCode=async function(req,res){let code=req.query.c||'';let id=req.query.id||'?';var nameID = '';
  let name=await services.getNameActByCode(code);
  if(!name)return res.send({e: 'Không tìm thấy hoạt động cần điểm danh!',s:false});
  let isHadFile = await services.isActHaveFileCheckin(code);
  if(!isHadFile)return res.send({e:'Danh sách tham gia chưa được cập nhật! Vui lòng thử lại sau!',s:false});
  await readXlsxFile(`./public/files/xlsx/${code}.xlsx`,{sheet:'DIEMDANH'}).then(async function(rows,error){
    if(error){console.log('Lỗi đọc file: '+error);return res.send({e:'Dường như có lỗi nào đó đã xảy ra trong quá trình kiểm tra thông tin của bạn! Liên hệ quản trị viên để biết thông tin',s:false});}
    for(var i=1;i<rows.length;i++){
      if(rows[i][0] == id)return res.send({nameAct: name, nameUser: rows[i][1], s:true});
    }
    return res.send({e: 'Không tìm thấy thông tin của bạn trong danh sách tham gia, liên hệ người tổ chức để biết thông tin!',s:false});
  });
}