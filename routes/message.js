var express = require('express');
var router = express.Router();
var MessageCtrl = require('../controllers/message');

router.get('/:messageId', MessageCtrl.get);

router.post('/', MessageCtrl.create);

module.exports = router;
