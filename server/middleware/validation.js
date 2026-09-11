import z from 'zod';

const createValidationMiddleware = (schema) => {
  return (req, res, next) => {
    try {
      const validatedBody = schema.parse(req.body);
      req.validatedBody = validatedBody;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            message: 'Validation error',
            details: error.errors
          }
        });
      }
      next(error);
    }
  };
};

export const schemas = {
  chat: z.object({
    message: z.string().min(1).max(5000),
    conversationId: z.string().optional(),
    context: z.object({}).optional()
  }),

  note: z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(50000),
    tags: z.array(z.string()).optional(),
    category: z.string().optional()
  }),

  task: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    type: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional()
  })
};

export const validateRequest = (schema) => createValidationMiddleware(schema);
