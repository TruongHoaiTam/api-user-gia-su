const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const passport = require('../../app/config/passport');
const UserModel = require('../model/user');
var mongoose = require('mongoose');


router.post('/register', async (req, res) => {
    console.log(req.body)
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
            const _user = {
                /* ...user._doc,
                avatar: undefined */
                username: user._doc.username
            }
            const token = jwt.sign({ _user }, 'your_jwt_secret');
            return res.status(200).json({ user, token });
        });
        return null;
    })(req, res);
});

router.post('/introduction', (req, res) => {
    console.log('a')
    passport.authenticate('jwt', { session: false }, async (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Cập nhật thông tin giới thiệu thất bại',
                user
            });
        }
        let update = {
            introduce: (req.body.introduce == undefined) ? user.introduce : req.body.introduce,
            teaching_address: (req.body.teaching_address == undefined) ? user.teaching_address : req.body.teaching_address,
            price_per_hour: (req.body.price_per_hour == undefined) ? user.price_per_hour : req.body.price_per_hour,
            tags: (req.body.tags == undefined) ? user.tags : req.body.tags.split(','),
        }
        await UserModel.updateOne({ _id: user._id }, update).then(() => {
            return res.status(200).json(update);
        })
    })(req, res);
});

router.post('/login/facebook', (req, res) => {
    passport.authenticate('facebook-token', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).send('User Not Authenticated');
        }
        user.status = 'active';
        const _user = {
            ...user._doc,
            avatar: undefined
        }
        const token = jwt.sign({ _user }, 'bc3b8945b9ade2eee00b571a13677848');
        return res.status(200).json({ user, token });
    })(req, res);
});

router.post('/login/google', (req, res) => {
    passport.authenticate('google-token', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).send('User Not Authenticated');
        }
        user.status = 'active';
        const _user = {
            ...user._doc,
            avatar: undefined
        }
        const token = jwt.sign({ _user }, 'rx-n9iou9gtjvCvqhRdtdgnp');
        return res.status(200).json({ user, token });
    })(req, res);
});

router.post('/update-info-register', (req, res) => {
    passport.authenticate('jwt', { session: false }, async (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Cập nhật thông tin đăng ký thất bại',
                user
            });
        }
        let update = {
            username: (req.body.username == undefined) ? user.username : req.body.username,
            email: (req.body.email == undefined) ? user.email : req.body.email,
            fullname: (req.body.fullname == undefined) ? user.fullname : req.body.fullname,
            phone: (req.body.phone == undefined) ? user.phone : req.body.phone,
            birthday: (req.body.birthday == undefined) ? user.birthday : req.body.birthday,
            address: (req.body.address == undefined) ? user.address : req.body.address,
            avatar: (req.body.avatar !== undefined && req.body.avatar !== "undefined") ? req.body.avatar : user.avatar
        }
        await UserModel.updateOne({ _id: user.id }, update).then(() => {
            return res.status(200).json(update);
        })
    })(req, res);
});

router.put('/change-password', async (req, res) => {
    await UserModel.updateOne({ _id: mongoose.Types.ObjectId(req.body._id) }, { password: md5(req.body.new_password) })
    return res.status(200).json(req.body);
});


module.exports = router;





