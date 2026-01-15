/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  OPENAI_API_KEY: string;
  PORT: number;
}

const envSchema = joi
  .object({
    OPENAI_API_KEY: joi.string().required(),
    PORT: joi.number().required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value as EnvVars;

export const envs = {
  OPENAI_API_KEY: envVars.OPENAI_API_KEY,
  port: envVars.PORT,
};
