import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SignupDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<{ access_token: string }> {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new BadRequestException('That email is already registered!');
    }

    const hashedPassword: string = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        penName: dto.penName,
      },
    });

    if (!newUser) {
      throw new BadRequestException('Failed to create user');
    }

    return this.signToken(newUser.id, newUser.email);
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user: User | null = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Incorrect Credentials');

    const pwMatches: boolean = await bcrypt.compare(dto.password, user.password);

    if (!pwMatches) throw new UnauthorizedException('Incorrect Credentials');

    return this.signToken(user.id, user.email);
  }

  private async signToken(userId: string, email: string): Promise<{ access_token: string }> {
    const payload = { sub: userId, email };
    const secret = 'WORLD_LEVEL_SECRET_123'; // Move to .env later

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: secret,
    });

    return { access_token: token };
  }
}