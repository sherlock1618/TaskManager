import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDTO } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDTO } from './dtos/login-user.dto';
import { User } from './user.model';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private jwtService: JwtService,
    ) {}

    async createUser(createUserDto: CreateUserDTO): Promise<void> {
        const { username, password } = createUserDto;
        console.log('Creating user:', username, password);    

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = this.userRepository.create({ username, password: hashedPassword });
        
        try {
            await this.userRepository.save(newUser);
            } catch (error) {
            if (
                error instanceof QueryFailedError &&
                (error as any).code === '23505' // PostgreSQL duplicate key error
            ) {
                throw new ConflictException('Username already exists');
            }
            throw new InternalServerErrorException('Failed to create user');
        }
    }

    async login(loginUserDto: LoginUserDTO) {
        const { username, password } = loginUserDto;
        const user = await this.validateUser(username, password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { username: user.username, id: user.id };
        const token = this.jwtService.sign(payload);

        return {
            access_token: token,
            user: {
                id: user.id,
                username: user.username,
            },
        };
    }

    async refreshToken(token: string): Promise<string>{
        const verifiedTOken = this.jwtService.verify(token);
        if (!verifiedTOken) {
            throw new UnauthorizedException('Invalid token');
        }

        const newToken = this.jwtService.sign({
            username: verifiedTOken.username,
            id: verifiedTOken.id,
        });

        return newToken;
    }

    async validateUser(username: string, password: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        return user;
    }
}
