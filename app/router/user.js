const express = require('express');
const router = express.Router();
const passport = require('../config/passport');


router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ ...req.user._doc })
});

module.exports = router;

