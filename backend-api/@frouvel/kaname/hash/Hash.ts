import bcrypt from 'bcryptjs';

export const hashPassword = async ({ password }: { password: string }) => {
  return await bcrypt.hash(password, 10);
};

export const verifyPassword = async ({
  passwordHash,
  password,
}: {
  passwordHash: string;
  password: string;
}) => {
  return bcrypt.compare(password, passwordHash);
};
