const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const UserModel = require('../model/user');
var mongoose = require('mongoose');


router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ ...req.user._doc })
});

router.get('/user', async (req, res) => {
    const result = await UserModel
        .find({})
        .sort('username')

    res.status(200).json(result);
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

router.put('/status', async (req, res) => {
    const option = (req.body.status === 'active') ? { status: 'inactive' } : { status: 'active' };
    const user = {
        ...req.body,
        avatar: undefined
    }
    await UserModel.updateOne({ _id: user._id }, option).then(() => {
        return res.status(200).json(option);
    })
})

router.put('/contract', async (req, res) => {
    let learnerContract = await UserModel.findOne({ _id: mongoose.Types.ObjectId(req.body.current_learner) });
    let teacherContract = await UserModel.findOne({ _id: mongoose.Types.ObjectId(req.body.current_teacher) });
    learnerContract.contract.push(req.body);
    teacherContract.contract.push(req.body);
    await UserModel.updateOne({ _id: mongoose.Types.ObjectId(req.body.current_learner) }, { contract: learnerContract.contract })
    await UserModel.updateOne({ _id: mongoose.Types.ObjectId(req.body.current_teacher) }, { contract: teacherContract.contract })
    return res.status(200).json({ contract: req.body });
})

module.exports = router;

