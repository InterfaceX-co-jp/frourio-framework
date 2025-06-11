import type { FastifyReply, FastifyRequest } from 'fastify';

interface JwtPayload {
  id: string;
  email: string;
  scope: string[];
  sub: string;
  iat: number;
  exp: number;
}

export const authUserMiddleware = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const _verified: JwtPayload = await req.jwtVerify(); // eslint-disable-line @typescript-eslint/no-unused-vars
  } catch (err) {
    console.error('JWT verify error', err);
    reply.send(err);
  }
};
