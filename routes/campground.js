const express = require('express')
const router = express.Router()

// controller
const campgrounds = require('../controllers/campgrounds')

// middleware
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')
const catchAsync = require('../utils/catchAsync')

// for files (images)
const multer = require('multer')    // to handle multipart form data (files)
const {storage} = require('../cloudinary')  // no need to specify "index", because it automatically looks for "index.js" file
const upload = multer({storage})    // store in storage (on cloudinary);    dest: 'uploads/' - stores locally


// ========== ROUTES ==========

router.route('/')   // grouped together all routes with "/"
    .get(catchAsync(campgrounds.index))    // GET all campgrounds
    .post(isLoggedIn,
        upload.array('image'),
        validateCampground,
        catchAsync(campgrounds.createCampground)) // POST campground (create)

// GET creation form (must be before '/:id', or it will think "new" is an id)
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')    // grouped together all routes with "/:id"
    .get(catchAsync(campgrounds.showCampground))    // GET one campground (show)
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground)) // UPDATE a campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)) // DELETE a campground

// GET edit form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))


module.exports = router
