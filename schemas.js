// joi is used for validating (forms...); can validate emails, and lots of other stuff
const BaseJoi = require('joi')
const sanitizeHtml = require('sanitize-html')


// XSS sanitization (sanitize html)
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {  // called automatically
                const clean = sanitizeHtml(value, {     // must install "sanitize-html"
                    allowedTags: [],
                    allowedAttributes: {}
                })
                if (clean !== value) return helpers.error('string.escapeHTML', {value})
                return clean
            }
        }
    }
})

const Joi = BaseJoi.extend(extension)   // extend regular Joi with this custom extension

module.exports.campgroundValidationSchema = Joi.object({
    campground: Joi.object({    // campground[title], campground[price]...(from HTML)
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewValidationSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        body: Joi.string().required().escapeHTML()
    }).required()
})