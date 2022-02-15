const cloudinary = require('cloudinary').v2 // v2 is important
const {CloudinaryStorage} = require('multer-storage-cloudinary')


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'YelpCamp',     // folder in Cloudinary to store things in
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
})


module.exports = {cloudinary, storage}
