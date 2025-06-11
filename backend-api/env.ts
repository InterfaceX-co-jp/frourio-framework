import dotenv from 'dotenv';

dotenv.config();

export const API_SERVER_PORT = +(process.env.API_SERVER_PORT ?? '8080');
export const API_BASE_PATH = process.env.API_BASE_PATH ?? '';
export const API_JWT_SECRET = process.env.API_JWT_SECRET ?? '';

export const WEB_FRONTEND_URL = process.env.WEB_FRONTEND_URL ?? '';
