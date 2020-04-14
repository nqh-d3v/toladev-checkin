var express = require('express');
var router = express.Router();
var controllers = require('../controllers/index');
/* GET home page. */
router.get('/', controllers.getHome);

router.post('/ajax-get-info-from-code', controllers.AJAX_getInfoFromCode);

module.exports = router;
