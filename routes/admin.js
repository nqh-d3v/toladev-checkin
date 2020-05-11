var express = require('express');
var multer = require('multer');
var router = express.Router();
var controllers = require('../controllers/admin');
var storageFileXLSX = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/files/xlsx/')
  },
  onError : function(err, next) {
    console.log('error', err);
    next(err);
  },
  filename: function (req, file, cb) {
    cb(null, req.params.c+'.xlsx');
  }
});

router.get('/login', controllers.isNotLogined_next, controllers.getLogin);
router.post('/login', controllers.isNotLogined_next, controllers.postLogin);
router.post('/create-account', controllers.isNotLogined_next, controllers.postCreateAccount);
router.get('/send-mail-act', controllers.isLogined_next, controllers.getSendMailAct);
router.get('/', controllers.isLogined_next, controllers.getHome);
router.get('/logout', controllers.getLogout);

router.post('/create-activity', controllers.isLogined_next, controllers.postCreateActivity);

router.post('/ajax-upload-list-checkin/:c', controllers.isLogined_next, controllers.checkActBefUploadFile, multer({storage: storageFileXLSX}).single('fileact'), controllers.AJAX_postUploadListCheckin);
router.post('/ajax-new-code-activity', controllers.isLogined_next, controllers.AJAX_createNewCodeAct);
router.post('/ajax-update-name-activity/:c', controllers.isLogined_next, controllers.AJAX_updateNameAct)
router.post('/ajax-get-activity', controllers.isLogined_next, controllers.AJAX_getActByCode)
router.post('/ajax-del-activity', controllers.isLogined_next, controllers.AJAX_delActByCode);
router.post('/ajax-reload-activity', controllers.isLogined_next, controllers.AJAX_reloadAct);
router.post('/ajax-check-activity', controllers.isLogined_next, controllers.AJAX_isExistAct);
router.post('/ajax-checkin-activity/:c', controllers.isLogined_next, controllers.AJAX_checkinAct);
router.post('/ajax-update-info-me', controllers.isLogined_next, controllers.AJAX_updateInfo)
module.exports = router;
