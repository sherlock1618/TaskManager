import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dtos/create-user.dto';
import { LoginUserDTO } from './dtos/login-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @Post('/signup')
    async signup(@Body() createUserDto: CreateUserDTO): Promise<void> {
        return await this.authService.createUser(createUserDto);
    }

    @Post('/login')
    async login(@Body() loginUserDto: LoginUserDTO): Promise<any> {
        return this.authService.login(loginUserDto);
    }
}
