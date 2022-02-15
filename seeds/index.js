const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')

const {images} = require('./images')

mongoose.connect('mongodb://localhost:27017/yelp-camp')
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected')
})

// return a random element from array
const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDb = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: '62064cf3f7d01015696ee37d',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/ivans/image/upload/v1644602051/YelpCamp/jqkbg419pbqvytrtxiof.jpg',
                    filename: 'YelpCamp/jqkbg419pbqvytrtxiof',
                },
                {
                    url: 'https://res.cloudinary.com/ivans/image/upload/v1644604508/YelpCamp/lkjwa88jdpve3gno2s7q.jpg',
                    filename: 'YelpCamp/lkjwa88jdpve3gno2s7q',
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti cumque doloremque minus modi, quibusdam illo at tempora accusantium soluta numquam. Corrupti facere iste sapiente aspernatur quisquam sint perferendis incidunt culpa.',
            price
        })
        await camp.save()
    }
}

seedDb()
    .then(() => {
        mongoose.connection.close()
    }) // close the connection when done
