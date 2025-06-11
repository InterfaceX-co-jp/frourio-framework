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
    const verified: JwtPayload = await req.jwtVerify();
  } catch (err) {
    console.error('JWT verify error', err);
    reply.send(err);
  }
};
