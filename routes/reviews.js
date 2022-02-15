const express = require('express')
const router = express.Router({mergeParams: true})

// controller
const reviews = require('../controllers/reviews')

// middleware
const {isLoggedIn, validateReview, isReviewAuthor} = require('../middleware')
const catchAsync = require('../utils/catchAsync')


// ========== ROUTES ==========

// POST a new review (create)
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

// DELETE a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router
