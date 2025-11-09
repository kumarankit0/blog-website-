const Joi = require('joi');

const createCommentSchema = Joi.object({
  postId: Joi.string().required(),
  content: Joi.string().min(1).max(5000).required(),
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message,
      });
    }
    next();
  };
};

module.exports = {
  validateCreateComment: validate(createCommentSchema),
};

