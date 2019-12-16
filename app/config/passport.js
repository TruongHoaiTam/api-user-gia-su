const passport = require('passport');
const passportJWT = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const md5 = require('md5');
const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const UserModel = require('../model/user');
var FacebookTokenStrategy = require('passport-facebook-token');
var GoogleTokenStrategy = require('passport-google-token').Strategy;

passport.use(new LocalStrategy(
    (username, password, cb) => {
        UserModel.findOne({ username })
            .then(user => {
                if (user && user.password === md5(password)) {
                    return cb(null, user, { message: 'Đăng nhập thành công' });
                }
                return cb(null, false, { message: "Đăng nhập thất bại" });
            })
            .catch(err => {
                return cb(err);
            });
    }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
},
    (jwtPayload, cb) => {
        return UserModel.findOne({ _id: jwtPayload._user._id })
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    }
));

passport.use(new FacebookTokenStrategy({
    clientID: '975638769468030',
    clientSecret: '2d9bb1097758b1dee4406f4edbfbb010'
},
    function (accessToken, refreshToken, profile, done) {
        UserModel.upsertFbUser(accessToken, refreshToken, profile, function (err, user) {
            return done(err, user);
        });
    }));

passport.use(new GoogleTokenStrategy({
    clientID: '384897073821-irhgosv3cmfov3plu6315bf4dnkhjqr7.apps.googleusercontent.com',
    clientSecret: '9v8I429jYNMj5KLOazkTBH1O'
},
    function (accessToken, refreshToken, profile, done) {
        UserModel.upsertGoogleUser(accessToken, refreshToken, profile, function (err, user) {
            return done(err, user);
        });
    }));

module.exports = passport;