const mongoose = require('mongoose')
const {Schema} = mongoose      // shortcut (or const Schema = mongoose.Schema)
const Review = require('./review')


const imageSchema = new Schema({
    url: String,
    filename: String
})
// no need to store on our model or db, because it's derived from the information we're already storing
imageSchema.virtual('thumbnail').get(function () {  // "thumbnail" is not stored in db, it's just a virtual property
    return this.url.replace('/upload', '/upload/w_200') // gets a small version of the image
})

const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],    // has to be "Point"
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}],
}, {toJSON: {virtuals: true}})  // make virtuals available as data when converting to JSON (used for "properties" key inside data for mapbox)

// popup virtual (with campground name and link to view)
campgroundSchema.virtual('properties.popupMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
})

// delete reviews after campground is deleted (see in docs which middleware is triggered after which query)
// if we change the way we delete, this middleware will have to be changed
campgroundSchema.post('findOneAndDelete', async function (campground) {
    if (campground) {
        await Review.deleteMany({
            _id: {
                $in: campground.reviews // delete all reviews where id is in campground reviews array
            }
        })
    }
})

const Campground = mongoose.model('Campground', campgroundSchema)

module.exports = Campground