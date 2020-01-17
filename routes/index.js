const _env = require('../env');

const express = require('express');
const { verifyToken, deleteToken, superUser } = require('../middleware/auth');
const users = _env.db;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const fs = require('fs');

const router = express.Router()

router.get('/', verifyToken, (req, res) => {
    res.json(users)
})

router.get('/login', (req, res) => {
    res.send(
        `<h1>login page</h1>
        <form action='/login' method='POST' style='display:flex; width: 45%; flex-direction:column; margin: auto'>
            <label for='email' style='display: flex; flex-direction: column'>Email
            <input type='text' name='email'>
            </label>
            <label for='pwd' style='display: flex; flex-direction: column;'>password
            <input type='text' name='pwd'>
            </label>
            <button type='submit' style='border: none; height: 30px; width: 50%; margin: 20px auto; background: #256989; color: white; '>log In</button>
        </form>`
    )
})

    .post('/login', (req, res) => {
        const { email, pwd } = req.body;

        if (!email || !pwd) {
            res.status(401).redirect('/login')
        } else {
            const u = users.find(user => user.email == email)
            if (!u) { res.send('user was not found') }
            else {
                const token = jwt.sign({ _id: u._id, name: u.name }, _env.secret_key)
                // res.header(`auth-token`, token)
                // console.log(token);

                bcrypt.compare(pwd, u.pwd, (err, isMatch) => {
                    if (isMatch) {
                        res.cookie("auth", token, { httpOnly: true });
                        res.json({ message: "logged in", user: u, token })
                    }
                    err && res.status(403).send('wrong password')
                })
            }
        }
    })

router.get('/logout', deleteToken, (req, res) => {
    res.send('cookie deleted')
}
)

router.get('/user/:name', verifyToken, (req, res) => {
    const u = users.find(user => user.name == req.params.name);
    if (!u) { return res.status(400).send('cannot find user') }
    res.setHeader("Content-type", "text/html")
    res.status(200)
    res.send(
        `<h1>${u.name}</h1>
            <h3>${u.email}</h3>`)
})

router.get('/user', verifyToken, superUser, (req, res) => {
    res.send(`<h1>CREATE USER</h1>
    <form action='/user' method='POST' 
    style='height: 60vh; width:50%; display:flex; flex-direction:column; 
    align-item:center; justify-content: space-around; margin: auto'>
        <label type='text' for='name' value='name' style:'display: flex; flex-direction: column'>
            Name
            <input type='text' name='name' id='name'>
        </label>
        <label type='text' for='email' value='name' style:'display: flex; flex-direction: column'>
            Email
            <input type='text' name='email'>
        </label>
        <label type='text' for='pwd' value='name' style:'display: flex; flex-direction: column'>
            Password
            <input type='text' name='pwd'>
        </label>
    <button type='submit'>Sign In</button>
</form>`)
})
    .post('/user', verifyToken, (req, res) => {
        let errors = [];
        const newUser = {
            _id: users.length + 1,
            name: req.body.name.toLowerCase(),
            email: req.body.email,
            pwd: req.body.pwd,
            isAdmin: false,
            creation_date: Date.now()
        };
        // Check if informations from user are not null
        for (prop in newUser) {
            if (newUser[prop] == null || newUser[prop] == '') {
                errors.push(prop)
            }
        }

        // if missing informations, status 400 is sent to user and send message telling him which intels was/were forgotten
        if (errors.length > 0) {
            res.status(400).send(`missing informations to register : ${errors}`)
        } else {
            // CHECK IF user already exist in DB (his email address)
            const userExist = users.find(u => u.email === newUser.email)
            userExist ?
                res.status(400).send('That email address is already registered, please login')
                // Unknow in DB => we create it after crypting his pwd
                : bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.pwd, salt, (err, hash) => {
                        if (err) console.log(err);
                        newUser.pwd = hash
                        users.push(newUser);
                        const data = JSON.stringify(users, null, 2)
                        fs.writeFile('Users.json', data, (err) => {
                            if (err) throw err;
                            console.log('Data added to DBFile')
                        })
                        res.status(200).send(`user ${newUser.name} was created`)
                    })
                })
        }
    })

module.exports = router;