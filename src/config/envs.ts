/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  GOOGLE_API_KEY: string;
  OPENAI_API_KEY: string;
  PORT: number;
  GOOGLE_MODEL_NAME: string;
  OPENAI_MODEL_NAME: string;
  PINECONE_API_KEY: string;
  PINECONE_INDEX: string;
}

const envSchema = joi
  .object({
    GOOGLE_API_KEY: joi.string().required(),
    OPENAI_API_KEY: joi.string().required(),
    PORT: joi.number().required(),
    GOOGLE_MODEL_NAME: joi.string().required(),
    OPENAI_MODEL_NAME: joi.string().required(),
    PINECONE_API_KEY: joi.string().required(),
    PINECONE_INDEX: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value as EnvVars;

export const envs = {
  GOOGLE_API_KEY: envVars.GOOGLE_API_KEY,
  GOOGLE_MODEL_NAME: envVars.GOOGLE_MODEL_NAME,
  PORT: envVars.PORT,
  OPENAI_API_KEY: envVars.OPENAI_API_KEY,
  OPENAI_MODEL_NAME: envVars.OPENAI_MODEL_NAME,
  PINECONE_API_KEY: envVars.PINECONE_API_KEY,
  PINECONE_INDEX: envVars.PINECONE_INDEX,
};
