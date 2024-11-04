
const Joi = require('joi');

const clothingItemSchema = Joi.object({
  name: Joi.string().required(),
  size: Joi.string().required(),
  brand: Joi.string().required(),
  price: Joi.number().positive().required(),
  color: Joi.string().required(),
});

module.exports = {
  clothingItemSchema,
};