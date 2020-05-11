var express = require('express');
var router = express.Router();
var controllers = require('../controllers/index');
/* GET home page. */
router.get('/', controllers.getHome);
router.get('/n-i', controllers.networkInfo);

router.post('/ajax-get-info-from-code', controllers.AJAX_getInfoFromCode);
router.get('/ajax-get-ip-public', controllers.getIPPublic);

module.exports = router;
