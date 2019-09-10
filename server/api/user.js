import Express from 'express'
const router = Express.Router();
import User from '../../models/user'
import {MD5_SUFFIX,responseClient,md5} from '../util'

/**
 * define reponse template
 */


router.post('/login', (req, res) => {
    let {username, password} = req.body;
    if (!username) {
        responseClient(res, 400, 2, 'Please enter username');
        return;
    }
    if (!password) {
        responseClient(res, 400, 2, 'Please enter password');
        return;
    }
    User.findOne({
        username,
        password: md5(password + MD5_SUFFIX)
    }).then(userInfo => {
        if (userInfo) {
            let data = {};
            data.username = userInfo.username;
            data.userType = userInfo.type;
            data.userId = userInfo._id;
            //set session
            req.session.userInfo = data;

            responseClient(res, 200, 0, 'Loggined!', data);
            return;
        }
        responseClient(res, 400, 1, 'username or password wrong');

    }).catch(err => {
        responseClient(res);
    })
});


router.post('/register', (req, res) => {
    let {userName, password, passwordRe} = req.body;
    if (!userName) {
        responseClient(res, 400, 2, 'Please enter username');
        return;
    }
    if (!password) {
        responseClient(res, 400, 2, 'Please enter password');
        return;
    }
    if (password !== passwordRe) {
        responseClient(res, 400, 2, 'The password does not match');
        return;
    }
    //authenticate if user has existed
    User.findOne({username: userName})
        .then(data => {
            if (data) {
                responseClient(res, 200, 1, 'Username Existed');
                return;
            }
            //save to database
            let user = new User({
                username: userName,
                password: md5(password + MD5_SUFFIX),
                type: 'user'
            });
            user.save()
                .then(function () {
                    User.findOne({username: userName})
                        .then(userInfo=>{
                            let data = {};
                            data.username = userInfo.username;
                            data.userType = userInfo.type;
                            data.userId = userInfo._id;
                            responseClient(res, 200, 0, 'Successfully Registered', data);
                            return;
                        });
                })
        }).catch(err => {
        responseClient(res);
        return;
    });
});

//authenticate user
router.get('/userInfo',function (req,res) {
    if(req.session.userInfo){
        responseClient(res,200,0,'',req.session.userInfo)
    }else{
        responseClient(res,200,1,'Please Loggin Again',req.session.userInfo)
    }
});

router.get('/logout',function (req,res) {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;