const Joi = require('joi');

const userSchema = Joi.object({
    first_name: Joi.string().min(3).max(20).required(),
    last_name:  Joi.string().min(3).max(20).required(),
    email:      Joi.string().email().required(),
    gender:     Joi.string().valid('male', 'female', 'other').required(),
    password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
        'string.pattern.base': 'Password must have uppercase, number and special character (@$!%*?&)'
    })
});

function validateUser(data) {
    const { error } = userSchema.validate(data);
    if (error) throw new Error(error.details[0].message);
}

module.exports = validateUser;  