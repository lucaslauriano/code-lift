import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import type { LoginRequest, SessionUser } from '@code-lift/shared';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  static hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  /**
   * Verifies credentials and returns the user.
   *
   * The same message covers "no such email" and "wrong password" so the endpoint does not confirm
   * which accounts exist.
   */
  async validate(credentials: LoginRequest): Promise<SessionUser> {
    const user = await this.prisma.client.user.findUnique({
      where: { email: credentials.email.toLowerCase() },
    });

    // Hash against a dummy when the user is missing, so a wrong email does not answer faster than
    // a wrong password.
    const hash = user?.passwordHash ?? DUMMY_HASH;
    const matches = await argon2.verify(hash, credentials.password).catch(() => false);

    if (!user || !matches) throw new UnauthorizedException('Invalid email or password');

    return { id: user.id, email: user.email, name: user.name };
  }

  signToken(user: SessionUser): Promise<string> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwt.signAsync(payload);
  }

  async userFromToken(token: string): Promise<SessionUser | null> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      return null;
    }

    const user = await this.prisma.client.user.findUnique({ where: { id: payload.sub } });
    return user ? { id: user.id, email: user.email, name: user.name } : null;
  }
}

/** A real argon2 hash of a value nobody will ever submit, used to equalise timing. */
const DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$c29tZS1maXhlZC1zYWx0LXZhbHVl$n2rCJ7C9eJ1jJ9nGvLFhkA3k0pQeQ6xQ2vGm1nJ0hVY';
