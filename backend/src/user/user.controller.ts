import { Controller, Get, UseGuards, Req, Query, Post, Body, HttpCode, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import JwtTwoFaGuard from 'src/auth/guard/twoFaAuth.guard';

@UseGuards(JwtTwoFaGuard)
@Controller('user')
export class UserController {
    constructor(private userService: UserService )
    {
    }
    ///USER_INFO////
    @Get('game')
    async getGameInfo(@Req() req, @Query() query)
    {  
        const username = await this.userService.getUsername(parseInt(query.opp));
        const avatar = await this.userService.getUserAvatar(parseInt(query.opp));
        const { level }=  await this.userService.getLevel(parseInt(query.opp));
        return ({username, avatar, level: level.toFixed(2)});
    }
    @Get('avatar')
    async getImage(@Req() req) { 
        ////console.log(req.user.id)
        return  {avatar: await this.userService.getUserAvatar(req.user.id)};
    }
    @Get('name')
    async getName(@Req() req) {
        const name = await this.userService.getUsername(req.user.id)
        const {level, win , loss} = await this.userService.getLevel(req.user.id);
        return ({name: name, level: parseFloat(level.toFixed(2)), win, loss});
    }
    @Get('profile')
    async getProfile(@Req() req, @Query() query) {
        if (!query.name)
            throw new BadRequestException('unsupported data');
        return (await this.userService.getProfile(req.user.id, query.name));
    }
    @Get('list')
    async getUsersList(@Req() req) {
        return (await this.userService.getUsersList(req.user.id));
    }
    @Get('friend/list')
    async getFriendsList(@Req() req) {
        return (await this.userService.getFriendsList(req.user.id));
    }
    @Get('friend/requests')
    async getFriendReq(@Req() req) {
        return (await this.userService.getFriendReq(req.user.id));
    }
    @Get('blocked')
    async getBlocks(@Req() req) {
        return (await this.userService.getBlocks(req.user.id));
    }
    ///ADD, ACCEPT AND BLOCK////
    @Post('add/friend')
    @HttpCode(201)
    async addFriend(@Req() req, @Body() body) {
        if (!body.name)
            throw new BadRequestException('unsupported data');
        await this.userService.addFriend(req.user.id, body.name);
    }
    @Post('accept/friend')
    @HttpCode(201)
    async acceptFriend(@Req() req, @Body() body) {
        if (!body.name)
            throw new BadRequestException('unsupported data');
        return (await this.userService.acceptFriend(req.user.id, body.name));
    }
    @Post('block')
    @HttpCode(201)
    async blockUser(@Req() req, @Body() body) {
        if (!body.name)
            throw new BadRequestException('unsupported data');
        return (await this.userService.blockUser(req.user.id, body.name));
    }
    @Post('inblock')
    @HttpCode(201)
    async inblockUser(@Req() req, @Body() body) {
        if (!body.name)
            throw new BadRequestException('unsupported data');
        return (await this.userService.inblockUser(req.user.id, body.name));
    }
    @Post('remove/request')
    @HttpCode(201)
    async removeReq(@Req() req, @Body() body) {
        if (!body.name)
            throw new BadRequestException('unsupported data');
        return (await this.userService.removeReq(req.user.id, body.name));
    }
    @Post('remove/friend')
    @HttpCode(201)
    async removeFriend(@Req() req, @Body() body) {
        if (!body.name)
            throw new BadRequestException('unsupported data');
        return (await this.userService.removeFriend(req.user.id, body.name));    
    }
    //////ADD_ACHIEVEMENTS, GET_ACHIEVEMENTS///////
    @Post('achievements')
    @HttpCode(201)
    async addAchievement(@Req() req, @Body() body) {
        if (!body.achievement)
            throw new BadRequestException('unsupported data');
        return (await this.userService.addAchievement(req.user.id, body.achievement));
    }
    @Get('achievements')
    async getAchievements(@Req() req) {
        return (await this.userService.getAchievements(req.user.id));
    }
    ///2FA_STATE///
    @Get('2fa')
    async getTwoFaState(@Req() req) {
        //console.log('in 2fa state');
        return (await this.userService.getTwoFaState(req.user.id));
    }

    @Get('matchhistory')
    async getMatchHistory(@Req() req) {
        return (await this.userService.getMatchHistory(req.user.id));
    }

    @Get('notification')
    async getNotification(@Req() req) {
        return (await this.userService.getNotification(req.user.id));
    }
    @Post('matchhistory')
    async addMatchHistoy(@Req() req, @Body() body: {name: string, playerScore: number, player2Score: number}) {
        if (!body)
            throw new BadRequestException('unsupported data');
        // console.log("here");
        // console.log(body);
        return (await this.userService.addMatchHistory(req.user.id, body));
    }
    @Get('leaderboard')
    async getLeaderBoard(@Req() req) {
        return (await this.userService.leaderBoard());
    }
}
