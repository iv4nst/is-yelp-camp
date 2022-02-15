const Campground = require('./models/campground')
const Review = require('./models/review')

const {campgroundValidationSchema, reviewValidationSchema} = require('./schemas')
const ExpressError = require('./utils/ExpressError')


// check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {   // this is from passport
        req.session.returnTo = req.originalUrl    // store the url they are requesting (to redirect to after logging in)
        req.flash('error', 'You must be signed in!')
        return res.redirect('/login')
    }
    next()  // if user is authenticated, we're good to go
}

// prevent editing and deleting campgrounds if user is not the campground author
module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    // if current logged-in user is NOT the campground owner
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    // if user is the owner, move on to update/delete...
    next()
}

// CAMPGROUND validation middleware (JOI)
module.exports.validateCampground = (req, res, next) => {
    // validate with req.body (req.body.campground.title, ....price...)
    const {error} = campgroundValidationSchema.validate(req.body)
    if (error) {
        // map over errors (error.details) to make a single string message; then pass it to new ExpressError
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

// REVIEW validation middleware (JOI)
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewValidationSchema.validate(req.body)
    if (error) {
        // map over errors (error.details) to make a single string message; then pass it to new ExpressError
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const {id, reviewId} = req.params
    const review = await Review.findById(reviewId)
    // if current logged-in user is NOT the review owner
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    // if user is the owner, move on to update/delete...
    next()
}