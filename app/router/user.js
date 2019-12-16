const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const UserModel = require('../model/user');


router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ ...req.user._doc })
});

router.get('/teacher', async (req, res) => {
    const result = await UserModel
        .find({ strategy: 'teacher' })
        .sort('fullname')

    res.status(200).json(result);
});

router.post('/teacher', async (req, res) => {
    let optionAddress, optionPrice, optionSubject;
    switch (req.body.valuePrice) {
        case '<20000':
            optionPrice = { price_per_hour: { $lt: 20000 } };
            break;
        case '20000-40000':
            optionPrice = { price_per_hour: { $gte: 20000, $lte: 40000 } }
            break;
        case '>40000':
            optionPrice = { price_per_hour: { $gt: 40000 } }
            break;
        default:
            optionPrice = {}
    }
    optionAddress = (req.body.valueAddress) ? { 'teaching_address': { $regex: `.*${req.body.valueAddress}.*` } } : {};
    optionSubject = (req.body.valueSubject) ? {
        'tags': {
            $in: [req.body.valueSubject]
        }
    } : {};
    const result = await UserModel
        .find({
            strategy: 'teacher',
            $and: [
                optionAddress,
                optionPrice,
                optionSubject
            ]
        })
        .sort('fullname')

    res.status(200).json(result);
})

module.exports = router;

