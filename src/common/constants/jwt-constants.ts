export const jwtConstants = {
  secret: `${process.env.JWT_SECRET}`,
  expiresIn: Number(process.env.JWT_EXPIRES_IN) || 20000000000,
};
