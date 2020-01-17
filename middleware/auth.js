const _env = require('../env');
const jwt = require('jsonwebtoken');
const { findCookie } = require('../utils/utils');


module.exports = {
    isAuthenticated: function (req, res, next) {
        if (req.headers.cookie) {
            return res.redirect('/')
        } else {
            return next();
        }
    },
    verifyToken: (req, res, next) => {
        const token = findCookie(req.headers.cookie, 'auth');
        // const token = req.headers.cookie && req.headers.cookie.split('auth=')
        !token ? res.status(401)/*.send('Access denied')*/.redirect('/login')
            : jwt.verify(token, _env.secret_key, (err, decoded) => {
                if (err) res.status(400).send('Invalid Token')
                else {
                    req.decoded = decoded
                    next();
                }
            })

    },
    deleteToken: (req, res, next) => {
        const cookies = req.headers.cookie;
        const token = findCookie(cookies, 'auth');
        if (token == -1 || token == false) res.redirect('/login')
        // { 'no cookie to delete' } :
        res.clearCookie(' auth', token)

        next();
    },
    superUser: (req, res, next) => {

        const admin = req.headers.cookie;
        const token = findCookie(admin, 'auth');
        jwt.verify(token, _env.secret_key, (err, decoded) => {
            if (err) res.status(400).send('Invalid Token')
            else {
                console.log(token);
                
                const user = _env.db.find(user => user._id == decoded._id)
                

                if (user.isAdmin) {
                    req.isAdmin = user.isAdmin
                    next();
                } else { res.status(401).send('protected area') }

            }



        })
    }
}