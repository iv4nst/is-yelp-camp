const express = require('express')
const router = express.Router()
const passport = require('passport')

// controller
const users = require('../controllers/users')

// middleware
const catchAsync = require('../utils/catchAsync')


// ========== ROUTES ==========

router.route('/register')
    .get(users.renderRegisterForm)     // GET registration form
    .post(catchAsync(users.register))  // POST register

router.route('/login')
    .get(users.renderLoginForm)   // GET login form
    .post(passport.authenticate('local', { // passport.authenticate('local') middleware strategy used (can have multiple routes for google, twitter...)
        failureFlash: true, // use flash messages
        failureRedirect: '/login'   // redirect to /login
    }), users.login)    // POST login

router.get('/logout', users.logout) // logout


module.exports = router
