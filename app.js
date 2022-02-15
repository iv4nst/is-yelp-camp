// if in development, require dotenv (must be at top of file)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const path = require('path')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local') // passport-local-mongoose is used in model
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize') // prevent query injections
// const helmet = require('helmet')
const MongoStore = require('connect-mongo') // to store session in mongo instead of memory store


// require routes
const campgroundRoutes = require('./routes/campground')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')

// DATABASE
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected')
})

// settings
app.engine('ejs', ejsMate)  // use ejs-mate (can define "layouts" folder in "views" for boilerplate, etc...)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// app.use and middlewares
app.use(express.urlencoded({extended: true})) // parse the body - for form
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))   // serve public directory
app.use(mongoSanitize())    // prevent query injections; or add "{replaceWith: '_'}" to replace "$" or others with "_"

const secret = process.env.SECRET || 'changemelater'
const store = MongoStore.create({
    mongoUrl: dbUrl,
    // ttl: 14 * 24 * 60 * 60, // change the default number of days (14) the session is saved
    touchAfter: 24 * 60 * 60,  // to not save the session to db every time the user refreshes the page; lazy update the session by limiting a period of time (seconds)
    crypto: {
        secret
    }
})
const sessionConfig = {
    store,  // or store: store  -use mongo to store session
    name: 'session',   // change the default session name (default is "connect.sid")
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,  // accessible only through HTTP (not js); cookie won't be revealed/can't be accessed through client-side scripts (even if cross-site scripting is used)
        // secure: true,    // cookies can be configured/changed only over HTTPS (used when deployed)
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,   // + 1 week from now (milliseconds, seconds, minutes, hours, days)
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig)) // use express-session; must be before "app.use(passport.session())"
app.use(flash())    // flash messages

// helmet
// app.use(helmet())   // automatically enables all 11 middleware that helmet comes with
// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
// ]
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
//     "https://cdn.jsdelivr.net",
// ]
// const connectSrcUrls = [
//     "https://api.mapbox.com/",
//     "https://a.tiles.mapbox.com/",
//     "https://b.tiles.mapbox.com/",
//     "https://events.mapbox.com/",
// ]
// const fontSrcUrls = []
// app.use(helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/ivans/",
//                 "https://images.unsplash.com/",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// )


// configure passport & passport-local
app.use(passport.initialize())  // initialize passport
app.use(passport.session())     // needed for persistent login sessions (instead of logging in on every request)
passport.use(new LocalStrategy(User.authenticate()))    // use local strategy; authentication method is on User model (from passport-local-mongoose)
passport.serializeUser(User.serializeUser())        // how to store a user in the session
passport.deserializeUser(User.deserializeUser())    // how to get user out of the session

// middleware for res.locals (flash messages, currentUser - e.g. show/hide links if logged in or not...)
app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')   // have access to res.locals.success (only use "success" key)
    res.locals.error = req.flash('error')   // for error messages
    next()
})

// routers
app.use('/', userRoutes)    // no need to prefix them
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)  // we don't have access to ":id" in reviews routes, because routers get separate params; to fix: {mergeParams: true} on router

// ========== routes ==========
app.get('/', (req, res) => {
    res.render('home')
})

// 404
app.all('*', (req, res, next) => {  // all - all requests; "*" - every route
    // res.send('404!!!')
    next(new ExpressError('Page Not Found', 404))
})

// error handler
app.use((err, req, res, next) => {
    // err is from this function above (because of passing new ExpressError)
    const {status = 500} = err
    if (!err.message) err.message = 'Something went wrong'
    res.status(status).render('error', {err})
})

app.listen(3000, () => {
    console.log('Listening on port 3000')
})
