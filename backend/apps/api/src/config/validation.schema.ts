import * as Joi from 'joi';

/**
 * Startup-time env validation — fails fast on missing/malformed config
 * (ENGINEERING_GUIDE.md §1 config discipline). Full field list implemented
 * in a later phase alongside each module's env requirements.
 */
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(4000),
});
