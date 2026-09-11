import Joi from 'joi';
import logger from '../config/logger.js';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      logger.warn('Validation error:', error.details);
      return res.status(400).json({
        error: {
          message: 'Validation Error',
          details: error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message
          }))
        }
      });
    }
    
    req.validatedBody = value;
    next();
  };
};

export const schemas = {
  chat: Joi.object({
    conversationId: Joi.string().optional(),
    message: Joi.string().required().min(1).max(5000),
    context: Joi.object().optional()
  }),
  
  note: Joi.object({
    title: Joi.string().required().min(1).max(200),
    content: Joi.string().required().min(1),
    tags: Joi.array().items(Joi.string()).optional(),
    category: Joi.string().optional()
  })
};
