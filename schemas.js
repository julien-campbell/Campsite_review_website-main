const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({                                       //creates extention for joi
    type: 'string',
    base: joi.string(),                                             //adds extra method on joi.string called escapeHTML
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {                                       
            validate(value, helpers) {                              //will call function called validate
                const clean = sanitizeHtml(value, {                 //santizes to strip hml tags away in input
                    allowedTags: [],                                //options created by santizieHTML. We're saying no exception is allowed. (could say h1 is allowed if we want)
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })       //if input and sanitized input is different, return error string from messages 
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)           //connects the function made above to joi


module.exports.campgroundSchema = Joi.object({       //variable campgroundSchema is different schema than mongoose. Validating data before it even enters mongoose to save
    campground: Joi.object({                //above represents the request object. campground represents the campground object. Below are the required key values in the object
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        //image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()                     //array of images that will be deleted from edit page
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(0).max(5),
        body: Joi.string().required().escapeHTML(),
    }).required()
});