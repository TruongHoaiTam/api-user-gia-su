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

router.get('/revenue/admin', async (req, res) => {
    const teachers = await UserModel
        .find({ strategy: 'teacher' })
        .sort('fullname')
    let data = [];
    teachers.forEach((item) => {
        item.contract.forEach((contract_item) => {
            data.push({
                fullname: item.fullname,
                time: contract_item.id,
                tags: item.tags,
                money: item.price_per_hour * 50
            })
        })
    })
    return res.status(200).json(data);
})

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
    await UserModel.updateOne({ _id: mongoose.Types.ObjectId(user._id) }, option).then(() => {
        return res.status(200).json(option);
    })
})

router.put('/contract', async (req, res) => {
    let learnerContract = await UserModel.findOne({ _id: mongoose.Types.ObjectId(req.body.current_learner._id) });
    let teacherContract = await UserModel.findOne({ _id: mongoose.Types.ObjectId(req.body.current_teacher._id) });
    req.body.status = 'still validate';
    learnerContract.contract.push(req.body);
    teacherContract.contract.push(req.body);
    await UserModel.updateOne({ _id: mongoose.Types.ObjectId(req.body.current_learner._id) }, { contract: learnerContract.contract })
    await UserModel.updateOne({ _id: mongoose.Types.ObjectId(req.body.current_teacher._id) }, { contract: teacherContract.contract })
    return res.status(200).json({ contract: req.body });
})

router.put('/contract/status', async (req, res) => {
    let learnerContract = await UserModel.findOne({ _id: mongoose.Types.ObjectId(req.body.current_learner._id) });
    let teacherContract = await UserModel.findOne({ _id: mongoose.Types.ObjectId(req.body.current_teacher._id) });
    checkId = (item) => {
        return item.id === req.body.id;
    }
    const indexLearnerContract = learnerContract.contract.findIndex(checkId);
    learnerContract.contract[indexLearnerContract].status = 'forced terminate';
    const indexTeacherContract = teacherContract.contract.findIndex(checkId);
    teacherContract.contract[indexTeacherContract].status = 'forced terminate';

    await UserModel.updateOne({ _id: mongoose.Types.ObjectId(req.body.current_learner._id) }, { contract: learnerContract.contract })
    await UserModel.updateOne({ _id: mongoose.Types.ObjectId(req.body.current_teacher._id) }, { contract: teacherContract.contract })
    return res.status(200).json({ contract: req.body });
})

router.get('/:_id', async (req, res) => {
    const result = await UserModel
        .findOne({ _id: mongoose.Types.ObjectId(req.params._id) })

    res.status(200).json(result);
});

router.put('/contract/status/user', async (req, res) => {
    let learnerContract = await UserModel.findOne({ _id: mongoose.Types.ObjectId(req.body.current_learner._id) });
    let teacherContract = await UserModel.findOne({ _id: mongoose.Types.ObjectId(req.body.current_teacher._id) });
    checkId = (item) => {
        return item.id === req.body.id;
    }
    const indexLearnerContract = learnerContract.contract.findIndex(checkId);
    learnerContract.contract[indexLearnerContract].status = (req.body.pending_complaint === true) ? 'pending complaint' : 'finished';
    const indexTeacherContract = teacherContract.contract.findIndex(checkId);
    teacherContract.contract[indexTeacherContract].status = (req.body.pending_complaint === true) ? 'pending complaint' : 'finished';

    await UserModel.updateOne({ _id: mongoose.Types.ObjectId(req.body.current_learner._id) }, { contract: learnerContract.contract })
    await UserModel.updateOne({ _id: mongoose.Types.ObjectId(req.body.current_teacher._id) }, { contract: teacherContract.contract })
    return res.status(200).json({ contract: req.body });
})

router.put('/contract/complaint/user', async (req, res) => {
    let learnerContract = await UserModel.findOne({ _id: mongoose.Types.ObjectId(req.body.current_learner._id) });
    let teacherContract = await UserModel.findOne({ _id: mongoose.Types.ObjectId(req.body.current_teacher._id) });
    checkId = (item) => {
        return item.id === req.body.id;
    }
    const indexLearnerContract = learnerContract.contract.findIndex(checkId);
    learnerContract.contract[indexLearnerContract].status = 'finished';
    const indexTeacherContract = teacherContract.contract.findIndex(checkId);
    teacherContract.contract[indexTeacherContract].status = 'finished';

    await UserModel.updateOne({ _id: mongoose.Types.ObjectId(req.body.current_learner._id) }, { contract: learnerContract.contract })
    await UserModel.updateOne({ _id: mongoose.Types.ObjectId(req.body.current_teacher._id) }, { contract: teacherContract.contract })
    return res.status(200).json({ contract: req.body });
})

router.delete('/contract', async (req, res) => {

    let learnerContract = await UserModel.findOne({ _id: mongoose.Types.ObjectId(req.body.current_learner._id) });
    let teacherContract = await UserModel.findOne({ _id: mongoose.Types.ObjectId(req.body.current_teacher._id) });
    checkId = (item) => {
        return item.id === req.body.id;
    }
    const indexLearnerContract = learnerContract.contract.findIndex(checkId);
    const indexTeacherContract = teacherContract.contract.findIndex(checkId);

    learnerContract.contract.splice(indexLearnerContract, 1)
    teacherContract.contract.splice(indexTeacherContract, 1)

    await UserModel.updateOne({ _id: mongoose.Types.ObjectId(req.body.current_learner._id) }, { contract: learnerContract.contract })
    await UserModel.updateOne({ _id: mongoose.Types.ObjectId(req.body.current_teacher._id) }, { contract: teacherContract.contract })
    return res.status(200).json(req.body);
})

router.put('/rate', async (req, res) => {
    let teacher = await UserModel.findOne({ _id: mongoose.Types.ObjectId(req.body.id_teacher) });
    let rate = (teacher.rate) ? teacher.rate : 0;
    let num = (teacher.num) ? teacher.num : 0;
    let data = {
        rate: (rate * num + req.body.rate) / (num + 1),
        num: num + 1,
    }
    await UserModel.updateOne({ _id: mongoose.Types.ObjectId(req.body.id_teacher) }, data)
    return res.status(200).json(data)
})

router.put('/comment', async (req, res) => {
    let teacher = await UserModel.findOne({ _id: mongoose.Types.ObjectId(req.body.id_teacher) });
    teacher.comment.push(req.body.comment)
    await UserModel.updateOne({ _id: mongoose.Types.ObjectId(req.body.id_teacher) }, { comment: teacher.comment })
    return res.status(200).json(teacher)
})

router.get('/revenue/:_id', async (req, res) => {
    let teacher = await UserModel.findOne({ _id: mongoose.Types.ObjectId(req.params._id) });
    let data = {
        count: teacher.contract.length,
        revenue: teacher.contract.length * teacher.price_per_hour * 50 + 'VND'
    }
    return res.status(200).json(data);
})


module.exports = router;

