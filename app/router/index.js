const express = require('express');
const router = express.Router();


router.use('/user', require('./auth'));
router.use('/', require('./user'));



module.exports = router;