/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  GOOGLE_API_KEY: string;
  PORT: number;
  MODEL_NAME: string;
}

const envSchema = joi
  .object({
    GOOGLE_API_KEY: joi.string().required(),
    PORT: joi.number().required(),
    MODEL_NAME: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value as EnvVars;

export const envs = {
  GOOGLE_API_KEY: envVars.GOOGLE_API_KEY,
  port: envVars.PORT,
  MODEL_NAME: envVars.MODEL_NAME,
};
