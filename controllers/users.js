const User = require('../models/user')


const renderRegisterForm = (req, res) => {
    res.render('users/register')
}

const register = async (req, res, next) => {
    try {
        const {username, email, password} = req.body
        const user = new User({email, username})
        const registeredUser = await User.register(user, password) // user and password (stores salt and hash)
        // log the user in
        req.login(user, err => {
            if (err) return next(err)
            req.flash('success', 'Welcome to Yelp Camp!')
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}


const renderLoginForm = (req, res) => {
    res.render('users/login')
}

const login = (req, res) => {
    // if we make it here, then login was successful
    req.flash('success', 'Welcome back!')
    const redirectUrl = req.session.returnTo || '/campgrounds'  // "returnTo" url or "/campgrounds"
    delete req.session.returnTo     // deletes that url from the session
    res.redirect(redirectUrl)
}

const logout = (req, res) => {
    req.logout()
    req.flash('success', 'Goodbye!')
    res.redirect('/campgrounds')
}

module.exports = {renderRegisterForm, register, renderLoginForm, login, logout}