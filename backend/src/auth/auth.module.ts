import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module'
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy, JwtTwoFaStrategy } from '../strategy';
import { FTAuth } from './42startegy';
import JwtTwoFaGuard from './guard/twoFaAuth.guard';
import { JwtGuard } from './guard';

@Module({
	imports: [PrismaModule, JwtModule.register({})],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, JwtGuard ,JwtTwoFaStrategy, FTAuth, JwtTwoFaGuard],
})

export class AuthModule {}