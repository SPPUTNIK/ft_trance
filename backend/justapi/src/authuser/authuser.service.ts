import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {JwtService} from '@nestjs/jwt';
import { Response } from 'express';
import { MyIp, Myport, portFront } from 'src/main';


@Injectable()
export class AuthuserService {
  constructor(private prisma: PrismaService, private jwt: JwtService ){}

  async set2faSecretDB(secret: string, userId: string) {
    return this.prisma.user.update({where: {id: userId}, data: {twoFactorAuthenticationSecret: secret}});
  }

  async turnOnTwoFactorAuthentication(userId: string) {
    return this.prisma.user.update({where: {id: userId}, data: {is2FAEnabled: true}});
  }

  async turnOffTwoFactorAuthentication(userId: string) {
    return this.prisma.user.update({where: {id: userId}, data: {is2FAEnabled: false}});
  }

  async signJWToken(args: {id:String, email:String, istwofa:boolean}) {
    const payload = args
    return this.jwt.signAsync(payload, {secret: process.env.JWT_SECRET})
  }

  async intra42Login(req: { user: any; id: any; email: any; username: any; image:  any}, res: Response) {
    const  foundUser = await this.prisma.user.findFirst({where: {id : req.id} });

    if (!foundUser)
    {
      const  isusernameset = await this.prisma.user.findFirst({where: {username : req.username} });
      if (!isusernameset){
        //const secret = this.twoFactorAuthService.generateSecret();
        await this.prisma.user.create({data: {id : req.id, email : req.email, username : req.username, avatar: req.image}});
      }
      else{
          //just a tmp solution
        var randomstring = require("randomstring");//+;
        await this.prisma.user.create({data: {id : req.id, email : req.email, username : req.username+randomstring.generate(), avatar: req.image}});
      }
    }
    else {
      const token = await  this.signJWToken({id: foundUser.id, email: foundUser.email, istwofa: false})
      if (!token){
        throw new ForbiddenException();
      }
      res.cookie("token", token);
    }
    // return res.send({message: 'Logged in succefuly', userData: foundUser});
    return res.redirect(`http://${MyIp}:${portFront}/`)
  }

  async updateusername(req, res, body){
    const  isusernameset = await this.prisma.user.findFirst({where: {username : body.username} });
    await this.prisma.user.update({where: {id: req.user.id}, data: {signup: true}})
    if (!isusernameset){
      if (body.username){
        await this.prisma.user.update({where: {id: req.user.id},data: {username: body.username}});
      }
      return res.send({message: 'ok'})
    }
    return res.send({message: 'no'})
  }

  async uploadimage(req, res, image){
    await this.prisma.user.update({where: {id: req.user.id}, data: {signup: true}})
    if (image){
      await this.prisma.user.update({where: {id: req.user.id}, data: {avatar: `http://${MyIp}:${Myport}/auth-user/` + image.path}});
    }
    return res.send({message: 'ok'})
  }

  async getimg(req, res, paramimage){
    
    // const aa = '/goinfre/hjrifi/backend/justapi/image/' + paramimage.img
    // const aa = '/nfs/homes/hjrifi/Desktop/backend/justapi/image/' + paramimage.img
    // const aa = 'C:\\Users\\ColoNel\\Desktop\\clone\\back-end\\justapi\\image\\' + paramimage.img
    const aa = '/usr/src/app/image/' + paramimage.img
    
    return res.sendFile(aa) 
  } 

  async search(req, res, paramusername){
    const foundUser = await this.prisma.user.findMany({where: {username: {contains: paramusername}}, select: {username: true, id: true, avatar:true}})
    return res.send(foundUser)
  }

  async getuser(req: { user: any; id: any; email: any; username: any; }, res){
    const foundUser = await this.prisma.user.findFirst({where: {id: req.id}})
    return res.send(foundUser)
  }   

  async getuserid(req: { user: any; id: any; email: any; username: any; }, res, userid){
    const foundUser = await this.prisma.user.findFirst({where: {id: userid}})
    const friend = await this.prisma.friend.findFirst({where: {Id: userid+req.id}})
    if (foundUser && friend){
      return res.send({User: foundUser, isfriend: 'true'})
    }
    return res.send({User: foundUser, isfriend: 'false'})
  }

  async getusers(req, res){
    const foundUser = await this.prisma.user.findMany()
    const blockedusers = await this.prisma.block.findMany({where: {blockid: req.user.id}, select: {userid: true}})

    const blockeduserids = blockedusers.map((block) => block.userid);

    const usersblockedstatus = foundUser.map((user) => {
      const isBlocked = blockeduserids.includes(user.id);
      return {...user, isBlocked };
    });
    return res.send(usersblockedstatus);
  }

  async blockusers(req, res, blockid){
    const founduser = await this.prisma.user.findFirst({where: {id : blockid}})
     const  isblocked = await this.prisma.block.findFirst({where: {userid : blockid, blockid: req.user.id} });

     if (founduser && blockid != req.user.id && !isblocked){
       await this.prisma.block.create({data: {Id: blockid+req.user.id,user: founduser.username, blockid: req.user.id, userid: blockid}})
       //delete friend
       const foundFriend = await this.prisma.friend.findFirst({where : {userid: blockid, friendId: req.user.id}})
       if (foundFriend){
        await this.prisma.friend.delete({where: {Id : blockid+req.user.id}})
       }
     }
     else {
       return res.send({message: 'we cant block this user'})
     }
    return res.send({message: 'we blocked this user'})
  }

  async blocklist(req, res){
    const listBlock = await this.prisma.block.findMany({where: {blockid: req.user.id}})
    return res.send(listBlock)
  }

  async unblockuser(req, res, blockid){
    const  isblocked = await this.prisma.block.findFirst({where: {userid : blockid, blockid: req.user.id} });
    if (isblocked){
      await this.prisma.block.delete({where: {Id: blockid+req.user.id}})
    }
    else {
      return res.send({message: 'we cant unblock this user'})
    }
    return res.send({message: 'we unblocked this user'})
  }

  async signout(req, res: Response){
    res.clearCookie('token')
    return res.send({message: 'Loged out succefuly'})
  }

  // friend of user
  async getfriend(req, res, paramid){
    const  foundUser = await this.prisma.friend.findFirst({where: {userid : paramid, friendId:  req.user.id} });
    if (!foundUser){
      return res.send({message: 'there is no friend ', paramid})
    }
    return res.send({message: 'my friend id is ', foundUser})
  }

  async getfriends(req, res){
    const foundFriends = await this.prisma.friend.findMany({where: {friendId: req.user.id}})
    return res.send({message: 'this is all your friend', foundFriends})
  }

  async getfriendsaa(req, res){
    const foundUser = await this.prisma.user.findMany()
    const foundFriends = await this.prisma.friend.findMany({where: {userid: req.user.id}})
    const frienduserids = foundFriends.map((friend) => friend.friendId);

    const users = foundUser.map((user) => {
      const isfriend = frienduserids.includes(user.id);
      return {user, isfriend };
    });
    const friendsonly = users.filter((userStatus) => userStatus.isfriend);

    return res.send({ message: 'these are all your friends', users: friendsonly });
  }

  async getfriendsid(req, res, paramid){
    const foundFriends = await this.prisma.friend.findMany({where: {friendId: paramid}})
    return res.send({message: 'this is all your friend of your friend', foundFriends})
  }

  async addfriend(req, res, paramid){
    const  foundUser = await this.prisma.user.findFirst({where: {id : paramid} });
    const  isfriend = await this.prisma.friend.findFirst({where: {userid : paramid, friendId: req.user.id} });
     const  isblocked = await this.prisma.block.findFirst({where: {userid : paramid, blockid: req.user.id} });
    if (paramid == '90357'){
      return res.send(`<h2>we can't add this friend... is blacklisted,</h2><img src='https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmlwamxwOW9xanpma295dWFwYmZkdGplOWQ4aXJ1MXJxdzN1NzEzaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aTygclg9R0MbR7i/giphy.gif'><h1>be careful this man is not normal, bla matsawal 3lach</h1> you can report him here.<a href='https://www.fbi.gov/contact-us'>FBI</a> please reportih please`)
    }
    else if (foundUser && paramid != req.user.id && !isfriend && !isblocked)
    {
      await this.prisma.friend.create({data: {Id: paramid+req.user.id,userid : paramid, user : foundUser.username, friendId: req.user.id}});
    }
    else
    {
      return res.send({message: 'we cant add this user'})
    }
    return res.send({message: 'we do our reserch and we find that this gay is good man, you can be friend now'})
  }

  async deletefriend(req, res, friendid)
  {
    const foundFriend = await this.prisma.friend.findFirst({where : {userid: friendid, friendId: req.user.id}})
    if (foundFriend && friendid != req.user.id){
      await this.prisma.friend.delete({where: {Id : friendid+req.user.id}})
    }
    else{
      return res.send({message: "3tih(a) forsa, or you don't have friend with this id"})
    }
    return res.send({message: 'this friend is not a good man, this is why delete them'})
  }
}
