import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service'; 
import { JwtService } from '@nestjs/jwt'; // <--- THIS MUST BE ON ITS OWN LINE
import * as bcrypt from 'bcrypt';
import { SignupDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, // Access to our Postgres tables
    private jwtService: JwtService, // To create the "Login Key"
  ) {}

  async signup(dto: SignupDto) {
    // 1. Check if the email is already taken
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new BadRequestException('That email is already registered!');
    }

    // 2. Scramble the password so it's safe
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Save the new user to Postgres
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        penName: dto.penName,
      },
    });

    // 4. Send back a "Token" so they are logged in immediately
    return this.signToken(newUser.id, newUser.email);
  }

  async login(dto: LoginDto) {
    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Incorrect Credentials');

    // 2. Compare the typed password with the scrambled one in the DB
    const pwMatches = await bcrypt.compare(dto.password, user.password);

    if (!pwMatches) throw new UnauthorizedException('Incorrect Credentials');

    // 3. Success! Give them their "Login Key"
    return this.signToken(user.id, user.email);
  }

  // Helper function to create the JWT (JSON Web Token)
  private async signToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    const secret = 'WORLD_LEVEL_SECRET_123'; // We will move this to .env later

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d', // Keep user logged in for a week
      secret: secret,
    });

    return { access_token: token };
  }
}
