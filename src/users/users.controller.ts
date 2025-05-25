import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
    @UseGuards(AuthGuard('jwt'))
    @Get()
    getUsers() {
        return { msg: 'This action returns all users' };
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    addToProfile() {
        return { msg: 'This action returns the user profile' };
    }
}
