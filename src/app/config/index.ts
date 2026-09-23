import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  NODE_ENV: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  db_url: process.env.MONGODB_URI || process.env.DB_URL ,
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) ,
  jwt_access_secret: process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET ,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN ,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN ,
  frontend_url: process.env.FRONTEND_URL,
};
