import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { FTUser } from './42dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config';
import * as speakeasy from 'speakeasy';
import { AuthDto, FAuthDto, achDto } from './dto';

@Injectable()
export class AuthService {
	constructor(private prisma: PrismaService, 
				private jwt: JwtService,
				private config: ConfigService) {}
	
	
	
	async signupPass(body: FAuthDto)
	{
		const hash = await argon.hash(body.password);
		//save the new user int the db
		try {
			const user = await this.prisma.user.create({
				data: {
				 username: body.name,
				 email: body.email,
				 twoFaAuth: false,
				 hash,
				 achievement: achDto,
				},
			});
			//return saved user
			const payload = {
				sub: user.id,
				userID: user.id,
				isTwoFaAuth: user.twoFaAuth,
			}
			const token = await this.signToken(payload);
			return token;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002')
					throw new ForbiddenException('Already taken');
			}
			throw error;
		}
	}
	async validateUserWithPass(body: AuthDto)
	{
		try {
			const user = await this.prisma.user.findUnique({
				where: {
					email: body.email,
				},
			});
			if (!user) throw new ForbiddenException('incorret credentials');
			const pass = await argon.verify(user.hash, body.password);
			if (!pass) throw new ForbiddenException('incorret credentials');
			return (user);
		} catch(error) {
			throw error;
		}
	}
	//42 api
	async signup(dto: FTUser)
	{
		//console.log('------------');
		try {
			const input: Prisma.UserCreateInput = dto;
			//console.log(input);
			const user = await this.prisma.user.create({
				data: input, 
			});
			return user;
		}
		catch (error) {
			//console.log(error);
			throw 'error creating user';
		}
	}			
	async signin(user: FTUser)
	{
        let finduser = await this.prisma.user.findUnique({
			where: {
				email: user.email,
			},
		});
		if (!finduser) {
			///fill the database with user infos if first time logged
			finduser = await this.signup(user);
		}
		const payload = {
			sub: finduser.id,
			userID: finduser.id,
			isTwoFaAuth: finduser.twoFaAuth,
		}
		const token = await this.signToken(payload);
		return (token);
	}	
	////sign a token
	async signToken(payload: {sub: number, userID: number, isTwoFaAuth: boolean}) : Promise<string> {
		const secret = this.config.get('JWT_SECRET');
		const token = await this.jwt.signAsync(payload, {
			expiresIn: '10 days',
			secret: secret,
		});
		//console.log('console in signToken');
		//console.log(token);
		////console.log(token);
		return (token);
	}
	////check the user if exist in the database
	async validateUser(user: any)
	{
        let finduser = await this.prisma.user.findUnique({
			where: {
				id: user.id,
				email: user.email,
			},
		});
		return (finduser || null);
	}
	///////TWO FACTOR AUTH////////
	async enableTwoFa(user: any) {
		await this.prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				twoFaAuth: true
			}
		});
	}
	async disableTwoFa(user: any) {
		await this.prisma.user.update({
			where: {
				id: user.id
			},
			data: {
				twoFaAuth: false,
				twoFaSecret: null,
			}
		})
	}
	async generateTwoFA(user: any) {
		const finduser = await this.validateUser(user);
		if (!finduser)
			throw new NotFoundException('User not found');
		const secret = await speakeasy.generateSecret();
		await this.prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				twoFaSecret: secret.base32,
			}
		})
		const otpauthUrl = await speakeasy.otpauthURL({
			secret: secret.ascii,
			label: 'PongTFA',
			issuer: 'Auth',
			algorithm: 'sha1', 
		});
		return ({secret: secret.otpauth_url, oturl: otpauthUrl});
	}
	async verifyTwoFa(user: any, token: string): Promise<boolean> {
		const finduser = await this.validateUser(user);
		//console.log(user.twoFaSecret);
		//console.log("UserSecret = " + finduser.twoFaSecret);
		//console.log("AuthCode = " + token);
		const secret = finduser.twoFaSecret;
		const isItValid = await speakeasy.totp.verify({
			secret: secret,
			encoding: 'base32',
			token: token
		});
		return isItValid;
	}

	async login2fa(payload: { sub: number, userID: number, isTwoFaAuth: boolean }) {
		const token = await this.signToken(payload);
		return (token);
	}
}