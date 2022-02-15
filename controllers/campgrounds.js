const Campground = require('../models/campground')
const {cloudinary} = require('../cloudinary')
// mapbox
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken: mapBoxToken})


// all campgrounds (index page)
const index = async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
}

// render new campground form
const renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

// create a new campground
const createCampground = async (req, res, next) => {
    // mapbox
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground)
    campground.geometry = geoData.body.features[0].geometry
    // map over the array that's added to req.files thanks to multer; makes array of objects containing urls and filenames
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.author = req.user._id    // associate the current logged-in user with the new campground
    await campground.save()
    console.log(campground)
    req.flash('success', 'Successfully made a new campground!') // make a success message
    res.redirect(`/campgrounds/${campground._id}`)
}

// show a campground
const showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({path: 'reviews', populate: {path: 'author'}})    // reviews and review author (nested populate)
        .populate('author') // campground author
    // if campground doesn't exist
    if (!campground) {
        req.flash('error', 'Campground not found!') // make an error message
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground})
}

// render edit campground form
const renderEditForm = async (req, res) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    // if campground doesn't exist
    if (!campground) {
        req.flash('error', 'Campground not found!') // make an error message
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground})
}

// update a campground
const updateCampground = async (req, res) => {
    const {id} = req.params
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {runValidators: true})

    // push (add) images to array
    const images = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.images.push(...images)   // takes data from array of images and pushes into the campground images array

    await campground.save()

    // delete selected images
    if (req.body.deleteImages) {
        // delete images from cloudinary
        for (const image of req.body.deleteImages) {
            await cloudinary.uploader.destroy(image)
        }

        // delete from db
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
        console.log(campground)
    }

    req.flash('success', 'Successfully updated the campground!') // make a success message
    res.redirect(`/campgrounds/${campground._id}`)
}

// delete a campground
const deleteCampground = async (req, res) => {
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted the campground!') // make a success message
    res.redirect('/campgrounds')
}


module.exports = {
    index,
    renderNewForm,
    createCampground,
    showCampground,
    renderEditForm,
    updateCampground,
    deleteCampground
}