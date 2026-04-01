export const config = {
  databaseUrl: process.env.DATABASE_URL || 'postgres://lm_user:lm_pass@localhost:5432/languageme',
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  port: parseInt(process.env.PORT, 10) || 3000,
  jwtExpiresIn: '15m',
  refreshExpiresInDays: 30,
};
