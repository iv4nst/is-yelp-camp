const Campground = require("../models/campground");
const Review = require("../models/review");


const createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)  // ".review" because of: review[...]
    review.author = req.user._id    // associate the current logged-in user with the new review
    // add review to that campground and save them both
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success', 'Successfully created a review!') // make a success message
    res.redirect(`/campgrounds/${campground._id}`)
}

const deleteReview = async (req, res, next) => {
    const {id, reviewId} = req.params
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})    // remove (pull) from "reviews" array where id is reviewId
    await Review.findByIdAndDelete(reviewId) // delete review
    req.flash('success', 'Successfully deleted the review!') // make a success message
    res.redirect(`/campgrounds/${id}`)
}

module.exports = {createReview, deleteReview}