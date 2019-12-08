const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const passport = require('../../app/config/passport');
const UserModel = require('../model/user');


router.post('/register', async (req, res) => {
    await UserModel.findOne({ username: req.body.username })
        .then(async result => {
            if (result == null) {
                const user = {
                    ...req.body,
                    password: md5(req.body.password),
                    avatar: (req.body.avatar !== undefined && req.body.avatar !== "undefined") ? req.body.avatar : "uploads\\no-avatar.jpg"
                };
                res.status(200).json(user);
                return new UserModel(user).save();
            }
            return res.status(404).send('Đăng ký thất bại');
        })
});

router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Đăng nhập thất bại',
                user
            });
        }
        req.login(user, { session: false }, (error) => {
            if (error) {
                res.send(error);
            }
            const token = jwt.sign({ user }, 'your_jwt_secret');
            return res.status(200).json({ user, token });
        });
        return null;
    })(req, res);
});

router.post('/login/facebook', (req, res) => {
    passport.authenticate('facebook-token', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).send('User Not Authenticated');
        }
        const token = jwt.sign({ user }, 'bc3b8945b9ade2eee00b571a13677848');
        return res.status(200).json({ user, token });
    })(req, res);
});

router.post('/login/google', (req, res) => {
    passport.authenticate('google-token', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).send('User Not Authenticated');
        }
        const token = jwt.sign({ user }, 'rx-n9iou9gtjvCvqhRdtdgnp');
        return res.status(200).json({ user, token });
    })(req, res);
});

module.exports = router;





