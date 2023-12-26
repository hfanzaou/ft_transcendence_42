import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, StreamableFile } from '@nestjs/common';
import { isInstance } from 'class-validator';
import { createReadStream, readFileSync } from 'fs';
import { of } from 'rxjs';
import { userDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prismaservice: PrismaService) {}

    ///USER INFO///
    async getUserAvatar(id: number) {
        try {
            const avatar = await this.prismaservice.user.findUnique({
                where: {
                    id: id,
                }, select : {
                    avatar: true,
                    upAvatar: true,
                }
            })
            if (!avatar || !avatar.avatar)
                return "";
            if (avatar.upAvatar)
            {
                ////console.log(avatar.avatar);
                const file = readFileSync(avatar.avatar, 'base64');
                ////console.log(file.toString('base64'));
                return ("data:image/png;base64,"+ file.toString());
            }
            return (avatar.avatar);
        } catch(error) {
            if (error instanceof NotFoundException)
                throw HttpStatus.NOT_FOUND; 
            throw HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
    async getUsername(id: number) {
        try {
            const user = await this.prismaservice.user.findUnique({
                 where: {
                     id: id
                 }, select: {
                     username: true,
                 }
             })
            if (!user)
                 throw new NotFoundException('USER NOT FOUND');
            return (user.username);
        } catch(error) {
            if (error instanceof NotFoundException)
                throw HttpStatus.NOT_FOUND;
            throw HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
    // async getProfile(id: number) {
    //     try {
    //         let user = await this.prismaservice.user.findUnique({
    //             where: {
    //                 id: id
    //             }, select: {
    //                 username: true,
    //                 avatar: true,
    //                 firstName: true,
    //                 lastName: true,
    //             }
    //         })
    //         if (!user)
    //             throw new NotFoundException('USER NOT FOUND');
    //         return user;
    //     } catch(error) {
    //         if (error instanceof NotFoundException)
    //             throw HttpStatus.NOT_FOUND;
    //         throw HttpStatus.INTERNAL_SERVER_ERROR;
    //     }
    // }
    async getTwoFaState(id: number)
    {
        try {
            const user = await this.prismaservice.user.findUnique({
                where: {
                    id: id
                }, select: {
                    twoFaAuth: true,
                }
            })
            return user.twoFaAuth;
        } catch(error) {
            throw HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
    ///friends, request and block lists///////
    async getUsersList(id: number) {
        console.log(id);
        try {
            const users = await this.prismaservice.user.findMany({
                where: {
                    NOT: {
                        blockedFrom: {some: {id: id}},
                        blocked: {some: {id: id}}
                    }
                },
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    state: true
                } 
            });
            
            return await this.extarctuserinfo(users, id);
        } catch(error) {
            console.log(error);
            throw HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
    async getFriendsList(id: number)
    {
        try {
            const users = await this.prismaservice.user.findMany({
                where: {
                    friends: {
                        some: {
                            id: id
                        }
                    },
                    friendOf: {
                        some: {
                            id: id
                        }
                    }
                },
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    state: true
                }
            })
            return await this.extarctuserinfo(users, id);
        } catch(error) {
            throw HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
    async getFriendReq(id: number)
    {
        try {
            const users = await this.prismaservice.user.findMany({
                where: {    
                    NOT : {
                        friendOf: {some: {id: id}}
                    },
                    friends: {some: {id: id}}
                },
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    state: true
                }
            })
            return await this.extarctuserinfo(users, id);
        } catch(error) {
            throw HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
    async getBlocks(id: number)
    {
        try {
            const users = await this.prismaservice.user.findUnique({
                where: {id: id},
                select: {blocked: 
                    {select: {
                    id: true,
                    username: true,
                    avatar: true,
                    state: true
                }},
            }})
            console.log(users);
            return await this.extarctuserinfo(users.blocked, id);
        } catch(error) {
            throw HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
    ///ADD, ACCEPT AND BLOCK////
    async addFriend(id: number, name:string) {
        try {
            const user = await this.prismaservice.user.findUnique({
                where: {
                    NOT: {blocked: {some: {username: name}}, blockedFrom: {some: {username:name}}},
                    username: name,
                }
            });
            await this.prismaservice.user.update({
                where: {id: id},
                data: {friends: {
                    connect: {id: user.id}
                }}
            })
        } catch(error) {
            throw HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }

    async acceptFriend(id: number, name: string) {   
        try {
            const user = await this.prismaservice.user.findUnique({
                where: { 
                    NOT: {blocked: {some: {username: name}}, blockedFrom: {some: {username:name}}},
                    username: name,
                }
            });
            await this.prismaservice.user.update({
                where: {id: id},
                data: {friends: {
                    connect: {id: user.id}
                }}
            })
        } catch(error) {
            throw HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
    async blockUser(id: number, name: string) {
        try {
            await this.prismaservice.user.update({
                where: {id: id},
                data: {
                    blocked: {
                        connect: {username: name}
                    }, friends: {
                        disconnect: {username: name}
                    }, friendOf: {
                        disconnect: {username: name}
                    }
                }
            })
        } catch(error) {
            throw HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
    async inblockUser(id: number, name: string) {
        try {
            await this.prismaservice.user.update({
                where: {id: id},
                data: {
                    blocked: {
                       disconnect: {username: name},
                    },
                },
            })
        } catch(error) {
            throw HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
    ///Achievements////
    // async addAchievement(id: number, achievement: boolean) {
    //     try { 
    //         await this.prismaservice.achievement.update({
    //             where: {
    //                 userId: id
    //             }, data: {
    //                achievement: true,
    //             }

    //         })
    //         const user = await this.prismaservice.user.findUnique({
    //             where: {id: id},
    //             select: {id: true, achievement: true}
    //         })
    //         console.log(user);
    //     } catch(error) {
    //         throw HttpStatus.INTERNAL_SERVER_ERROR;
    //     }
    // }
    async getAchievements(id: number)
    {
        try {
            const ach = await this.prismaservice.user.findUnique({
                where : {id: id},
                select: {achievement: true}
            })
            return ach.achievement;
        } catch(error) {
            throw HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
    async addAchievement(id: number, achievement: any)
    {
        try {
            await this.prismaservice.user.update({
                where : {id: id}, data : {achievement: achievement}
            })
        } catch(error){

        }    
    }
    ////extartacting user info functions////
    async extarctuserinfo(users: any, id: number)
    {
            const usersre: userDto[] = await Promise.all(users.filter((obj) => {
                if (obj.id != id) {
                    return true
                }
                return false;
              }).map(async (obj) => {
                const avatar = await this.getUserAvatar(obj.id);
                return { level: obj.id, name: obj.username, avatar: avatar, state: obj.state };
              })); 
         return (usersre);     
    }

    /////match history/////
    async getMatchHistory(id: number)
    {
        try {
            const matchhistory = await this.prismaservice.matchHistory.findMany({
                where : {
                    OR: [
                        {playerId: id},
                        {player2Id: id},
                    ]},
                select : {players: {where: {
                        NOT: {id: id},
                }, select: {id: true, username: true }}, playerScore: true, player2Score: true, win: true},
            })
            const to_send = await Promise.all(matchhistory.map(async (obj) => {
                console.log(obj.players[0].id);
                const avatar = await this.getUserAvatar(obj.players[0].id);
                return { 
                    playerScore: obj.playerScore, 
                    player2Score: obj.player2Score, 
                    win: obj.win,
                    avatar: avatar,
                    username: obj.players[0].username
                };
              }));
            ///console.log(to_send);
            return to_send;
        } catch(error) {
            //if (error.instanceof(this.prismaservice))
                
            throw HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
    // async addMatchHistory(id: number, name: string) {
    //     try {
    //         const user = await this.prismaservice.matchHistory.update({
    //             data: {
    //                 player
    //         })
    //     } catch(error)
    //     {

    //     }
    // }
}
