import { Body, Injectable, Req, Res } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as bcrypt from 'bcrypt';
import { GameService } from '../game/game.service';
import { time, timeStamp } from 'console';



class obj {
  id: string;
  username: string
  msg: string;
  time: Date;
  isMe: boolean;
  img: string;
  muted?: boolean;
  admin?: boolean;
  owner?: boolean;
  online?: boolean;
  constructor(id: string, username: string, msg: string, date: Date, isMe: boolean, img: string, muted?: boolean, admin?: boolean, owner?: boolean, _online?: boolean) {
    this.id = id;
    this.username = username;
    this.msg = msg;
    this.time = date;
    this.isMe = isMe;
    this.img = img;
    this.muted = muted;
    this.admin = admin;
    this.owner = owner;
    this.online = _online;
  }
}
class Theroom {
  id: number;
  roomName: string
  roomImg: string;
  userscount: number;
  ismember: boolean;
  protected: boolean;
  private: boolean;
  constructor(id: number, roomName: string, roomImg: string, userscount: number, mem: boolean, protect: boolean, priv: boolean) {
    this.id = id;
    this.roomName = roomName;
    this.roomImg = roomImg;
    this.userscount = userscount;
    this.ismember = mem;
    this.protected = protect;
    this.private = priv;
  }
}
class UserS {
  id: string;
  online: boolean;
  avatar: string;
  username: string;
  constructor(idd: string, onliine: boolean, _username, _avatar) {
    this.id = idd;
    this.online = onliine;
    this.username = _username;
    this.avatar = _avatar;
  }
}

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private readonly gameService: GameService) { }


  private clients: Map<Socket, string> = new Map();

  findroom(dm1: number[], dm2: number[]): number | null {
    const set1 = new Set(dm1);
    return dm2.find(num => set1.has(num)) || -1;
  }

  async checkifblocked(user1: string, user2: string) {

    const ifblockes = await this.prisma.block.findMany({ where: { blockid: user1 } })
    if (ifblockes.length > 0) {
      for (let i = 0; i < ifblockes.length; i++) {
        if (ifblockes[i].userid == user2) {
          return true
        }
      }
    }
    const ifblockes2 = await this.prisma.block.findMany({ where: { blockid: user2 } })
    if (ifblockes2.length > 0) {
      for (let j = 0; j < ifblockes2.length; j++) {
        if (ifblockes2[j].userid == user1) {
          return true
        }
      }
    }
    return false
  }

  async getchatDM(req, res, id) {

    if (id == req.user.id) {
      return
    }
    const opp = await this.prisma.user.findUnique({ where: { id: id } })
    const mee = await this.prisma.user.findUnique({ where: { id: req.user.id } })

    let dmid = -1
    if (mee == null || opp == null) {
      return
    }
    for (let i = 0; i < mee.dms.length; i++) {
      if (opp.dms.includes(mee.dms[i])) {
        dmid = mee.dms[i];
      }
    }
    //dmid = 0
    const lastmsg = await this.prisma.chatMessage.findMany({
      where: {
        roomid: dmid
      }
    });
    let goodDms: obj[] = []
    for (let i = 0; i < lastmsg.length; i++) {
      const isMe = (lastmsg[i].senderId == id ? false : true);
      goodDms[i] = (new obj(lastmsg[i].senderId, null, lastmsg[i].message, lastmsg[i].time, isMe, (!isMe ? opp.avatar : null)))
    }

    if (await this.checkifblocked(mee.id, opp.id) == true) {
      return
    }
    return res.send({ id: opp.id, username: opp.username, img: opp.avatar, messages: goodDms, online: opp.online });
  }

  async getchatGroup(req, res, id) {

    const theroom = await this.prisma.chatRoom.findUnique({ where: { roomName: id, } })
    if (!theroom) {
      return
    }

    const mee = await this.prisma.user.findUnique({ where: { id: req.user.id } })
    if (mee == null) {
      return
    }
    if ((mee.rooms.length < 1) || (!mee.rooms.includes(theroom.id))) {
      return 
    }

    //dmid = 0
    const lastmsg = await this.prisma.chatMessage.findMany({
      where: {
        roomid: theroom.id
      }
    })
    if (!lastmsg) {
      return
    }
    let goodgrchat: obj[] = []
    for (let i = 0; i < lastmsg.length; i++) {
      const theone = await this.prisma.user.findUnique({ where: { id: lastmsg[i].senderId } })
      if (theone == null) {
        return
      }
      const isMe = (req.user.id == theone.id ? true : false);
      goodgrchat[i] = (new obj(theone.id, theone.username, lastmsg[i].message, lastmsg[i].time, isMe, theone.avatar!))
    }
    if (!goodgrchat) {
      return
    }
    return res.send({ id: theroom.id, username: theroom.roomName, img: theroom.roomName, messages: goodgrchat });
  }

  async getLastChats(req, res) {

    const theuser = await this.prisma.user.findUnique({ where: { id: req.user.id } })
    if (theuser == null) {
      return
    }
    const lastDms = await this.prisma.chatRoom.findMany({
      where: {
        mems: {
          has: theuser.id
        },
        isitgroup: false
      },
      orderBy: {
        lastUpdate: 'desc'
      }
    })
    let friends: obj[] = []
    for (let i = 0; i < lastDms.length; i++) {
      const roomMessages = await this.prisma.chatMessage.findMany({
        where: {
          roomid: lastDms[i].id
        }
      })
      let friendd: string
      const twofr = await this.prisma.user.findMany({ where: { dms: { has: lastDms[i].id } } })
      if (twofr[0].id == theuser.id) {
        friendd = twofr[1].id
      }
      else {
        friendd = twofr[0].id

      }
      const thefrnd = await this.prisma.user.findUnique({ where: { id: friendd } })
      if (thefrnd == null) {
        return
      }
      let lastone = roomMessages[roomMessages.length - 1]
      // let user = await this.prisma.user.findUnique({ where: { id: lastone.senderId } })
      friends[i] = (new obj(thefrnd.id, thefrnd.username, lastone?.message, lastDms[i].lastUpdate, false, thefrnd.avatar, null, null, null, thefrnd.online))
    }
    return res.send(friends)
  }

  async getLastGroups(req, res) {

    const theuser = await this.prisma.user.findUnique({ where: { id: req.user.id } })
    if (theuser == null) {
      return
    }
    const lastgroup = await this.prisma.chatRoom.findMany({
      where: {
        mems: {
          has: theuser.id
        },
        isitgroup: true
      },
      orderBy: {
        lastUpdate: 'desc'
      }
    })
    if (!lastgroup) {
      return
    }
    let friends: obj[] = []
    for (let i = 0; i < lastgroup.length; i++) {
      const roomMessages = await this.prisma.chatMessage.findMany({
        where: {
          roomid: lastgroup[i].id
        }
      })
      let lastone = roomMessages[roomMessages.length - 1]
      if (!lastone) {
        friends[i] = (new obj(lastgroup[i].roomName, null, null, null, false, null));
      }
      else {
        let user = await this.prisma.user.findUnique({ where: { id: lastone.senderId } })
        friends[i] = (new obj(lastgroup[i].roomName, user.username, lastone?.message, lastgroup[i].lastUpdate, false, null))
      }
    }
    if (!friends) {
      return
    }
    return res.send(friends)
  }

  async updateFriendRole(req, res, body) {

    body.id = parseInt(body.id)
    if (isNaN(body.id)) {
      return
    }
    if (body.memberId == undefined) {
      return
    }
    if (body.id == undefined) {
      return
    }
    const theuser = await this.prisma.user.findUnique({ where: { id: req.user.id } })
    const theroom = await this.prisma.chatRoom.findFirst({ where: { id: body.id } })
    const meMember = await this.prisma.member.findFirst({ where: { memberId: theuser.id, roomId: theroom.id } })
    if (!meMember.admin) {
      return
    }
    const thefrnd = await this.prisma.user.findUnique({ where: { id: body.memberId } })
    const frMember = await this.prisma.member.findFirst({ where: { memberId: thefrnd.id, roomId: theroom.id } })
    if (!frMember) {
      return
    }
    if (frMember.owner) {
      return
    }
    if (body.Role == 'Admin') {
      if (frMember.admin) {
        return
      }
      else {
        await this.prisma.member.update({ where: { id: frMember.id }, data: { admin: true } })
        return
      }
    }
    else if (body.Role == 'Member') {
      if (frMember.admin) {
        await this.prisma.member.update({ where: { id: frMember.id }, data: { admin: false } })
        return
      }
    }

  }

  async getAllRooms(req, res, body) {

    const theuser = await this.prisma.user.findUnique({ where: { id: req.user.id } })
    if (!theuser) {
      return
    }
    const allrooms = await this.prisma.chatRoom.findMany({ where: { isitgroup: true } })
    let goodrooms: Theroom[] = []
    let j = 0
    for (let i = 0; i < allrooms.length; i++) {
      if ((!allrooms[i].mems.includes(theuser.id)) && (!allrooms[i].blockList.includes(theuser.id))) {
        if (allrooms[i].type == 'Protected') {
          goodrooms[j] = (new Theroom(allrooms[i].id, allrooms[i].roomName, null, allrooms[i].mems.length, false, true, false))
          j++
        }

        else if (allrooms[i].type == 'Public') {
          goodrooms[j] = (new Theroom(allrooms[i].id, allrooms[i].roomName, null, allrooms[i].mems.length, false, false, false))
          j++
        }
        else if (allrooms[i].type == 'Private') {
          continue;
        }
      }
      else if (allrooms[i].blockList.includes(theuser.id)) {
        continue;
      }
      else if (allrooms[i].mems.includes(theuser.id)) {
        if (allrooms[i].type == 'Protected') {
          goodrooms[j] = (new Theroom(allrooms[i].id, allrooms[i].roomName, null, allrooms[i].mems.length, true, true, false))
          j++
        }

        else if (allrooms[i].type == 'Public') {
          goodrooms[j] = (new Theroom(allrooms[i].id, allrooms[i].roomName, null, allrooms[i].mems.length, true, false, false))
          j++
        }
        else if (allrooms[i].type == 'Private') {
          goodrooms[j] = (new Theroom(allrooms[i].id, allrooms[i].roomName, null, allrooms[i].mems.length, true, false, true))
          j++
        }
      }

    }
    return res.send(goodrooms)
  }

  async getMembres(req, res, body, id) {
    if (id == undefined) {
      return
    }
    // console.log('req id === ', req.id)
    id = parseInt(id)
    if (isNaN(id)) {
      return
    }
    const theroom = await this.prisma.chatRoom.findFirst({ where: { id: id } })
    if (!theroom) {
      return
    }
    const themember = await this.prisma.member.findFirst({ where: { roomId: id, memberId: req.user.id } })
    if (!themember) {
      return
    }
    const members = await this.prisma.member.findMany({ where: { roomId: theroom.id } })
    if (!members) {
      return
    }
    let mems: obj[] = []
    for (let i = 0; i < members.length; i++) {
      const usr = await this.prisma.user.findUnique({ where: { id: members[i].memberId } })
      mems[i] = (new obj(members[i].memberId, usr.username, null, null, (themember.memberId == usr.id), usr.avatar, members[i].muted, members[i].admin, members[i].owner))
    }
    return res.send({ admin: themember.admin, members: mems })
  }

  async muteMemeber(req, res, body) {
    body.roomId = parseInt(body.roomId)
    if (isNaN(body.roomId)) {
      res.send({ message: 'room not found' })
      return
    }
    const theuser = await this.prisma.user.findUnique({ where: { id: req.user.id } })
    if (!theuser) {
      res.send({ message: 'you are not a user!' })
      return 1
    }
    const theroom = await this.prisma.chatRoom.findFirst({ where: { id: body.roomId } })
    if (!theroom) {
      {
        res.send({ message: 'Room not found' })
        return 1
      }
    }

    const meMember = await this.prisma.member.findFirst({ where: { memberId: theuser.id, roomId: theroom.id } })
    if (!meMember) {
      {
        res.send({ message: 'you are not member' })
        return 1
      }
    }
    if (!meMember.admin) {
      res.send({ message: 'you dont have "L\'Ba9el" to do that' })
      return 1
    }
    const thefrnd = await this.prisma.user.findUnique({ where: { id: body.id } })
    if (!thefrnd) {
      res.send({ message: 'user not found !!' })
      return 1

    }
    const frMember = await this.prisma.member.findFirst({ where: { memberId: thefrnd.id, roomId: theroom.id } })
    if (!frMember) {
      res.send({ message: 'member not found !!' })
      return 1
    }
    if (frMember.admin && !meMember.owner) {
      res.send({ message: 'you cant do shit to moul chi !!' })
      return 1
    }
    await this.prisma.member.update({ where: { id: frMember.id }, data: { muted: true } })
    res.send({ message: 'update mute member is done!!' })
  }

  async unmuteMemeber(req, res, body) {
    body.roomId = parseInt(body.roomId)
    if (isNaN(body.roomId)) {
      res.send({ message: 'room not found' })
      return
    }
    const theuser = await this.prisma.user.findUnique({ where: { id: req.user.id } })
    if (!theuser) {
      res.send({ message: 'you are not a user!' })

      return 1
    }
    const theroom = await this.prisma.chatRoom.findFirst({ where: { id: body.roomId } })
    if (!theroom) {
      {
        res.send({ message: 'Room not found' })
        return 1
      }
    }

    const meMember = await this.prisma.member.findFirst({ where: { memberId: theuser.id, roomId: theroom.id } })
    if (!meMember) {
      {
        res.send({ message: 'you are not member' })
        return 1
      }
    }
    if (!meMember.admin) {
      res.send({ message: 'you dont have "L\'Ba9el" to do that' })
      return 1
    }
    const thefrnd = await this.prisma.user.findUnique({ where: { id: body.id } })
    if (!thefrnd) {
      res.send({ message: 'user not found !!' })
      return 1

    }
    const frMember = await this.prisma.member.findFirst({ where: { memberId: thefrnd.id, roomId: theroom.id } })
    if (!frMember) {
      res.send({ message: 'member not found !!' })
      return 1

    }
    if (frMember.admin && !meMember.owner) {
      res.send({ message: 'you cant do shit to moul chi !!' })
      return 1
    }
    await this.prisma.member.update({ where: { id: frMember.id }, data: { muted: false } })
    res.send({ message: 'update mute member is done!!' })
  }

  async getalltoadd(req, res, id) {
    id = parseInt(id)
    if (isNaN(id)) {
      return
    }
    const theroom = await this.prisma.chatRoom.findFirst({ where: { id: id } })
    if (!theroom) {
      return
    }
    const themem = await this.prisma.member.findFirst({ where: { memberId: req.user.id, roomId: id } })
    if (!themem) {
      return
    }
    const allusers = await this.prisma.user.findMany()
    let goodusers: User[] = []
    let j = 0
    for (let i = 0; i < allusers.length; i++) {
      if (!allusers[i].rooms.includes(id)) {
        goodusers[j] = allusers[i]
        j++
      }
    }
    return res.send(goodusers)
  }

  async getUserStatus(res, userId) {
    const onlineuser = await this.prisma.user.findMany({
      where: { online: true },
      select: {
        id: true,
        username: true,
        online: true,
        avatar: true
      }
    });
    return res.send({ onlineuser: onlineuser.filter((el) => el.id != userId) });
  }

  async getNewUser(@ConnectedSocket() client: Socket, @Req() req, @Res() res) {

    const userId = req.user.id;
    const newuser = await this.prisma.user.findFirst({ where: { id: userId } });
    if (!newuser) {
      client.emit('error', 'refresh browser !! ');
    }
    // this.prisma.user.update({
    //   where: { id: userId },
    //   data: { socketId: client.id },
    // });
    //this.clients[userId] = client.id;
    let memberss: string[] = [];
    const mapIter = this.clients.keys();
    for (let i = 0; i < this.clients.size; i++) {
      memberss[i] = mapIter.next().value;
    }
    //this.server.emit('online', memberss)
    this.clients.set(client, userId)
    // this.clientsGame.set(userId, client);
    if (!newuser.online)
      await this.prisma.user.update({ where: { id: userId }, data: { online: true } })

    client.join(req.user.id)

  }

  async checkif_blocked(user1: string, user2: string) {

    const ifblockes = await this.prisma.block.findMany({ where: { blockid: user1 } })
    if (ifblockes.length > 0) {
      for (let i = 0; i < ifblockes.length; i++) {
        if (ifblockes[i].userid == user2) {
          return 1
        }
      }
    }
    const ifblockes2 = await this.prisma.block.findMany({ where: { blockid: user2 } })
    if (ifblockes2.length > 0) {
      for (let j = 0; j < ifblockes2.length; j++) {
        // console.log('check if ', ifblockes2[j].userid, ' ==== ', user1)
        if (ifblockes2[j].userid == user1) {
          // console.log('user not available')
          return 1
        }
      }
    }
    return 0
  }

  async handleDisconnect(client: Socket) {
    const userId = this.clients.get(client);
    const socketid = client.id;
    this.clients.delete(client);
    if (userId) {
      let valuess = Array.from(this.clients.values());

      if (!valuess.includes(userId)) {
        // console.log('Client disconnected with ID:', client.id);
        await this.prisma.user.update({ where: { id: userId }, data: { online: false } });
      }
      const user = await this.prisma.user.findFirst({ where: { id: userId, inGame: true, socketId: socketid } });

      if (user)
        this.gameService.exitGame(null, { user: { id: userId } });
    }
  }

  async sendDm(@MessageBody() info, @ConnectedSocket() client: Socket, @Req() req) {
    if (req.user.id == undefined) {
      // console.log('refresh the page !!')
      client.emit('error', 'refresh the page !!')
      return
    }
    const sender = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!sender) {
      client.emit('error', 'unkown socket')
      // console.log('unkown socket')
      return;
    }
    const reciver = await this.prisma.user.findFirst({
      where: { id: info.user2 },
    });
    if (!reciver) {
      // console.log('receiver not found')
      client.emit('error', 'receiver not found')
      return;
    }
    if (sender.id == reciver.id) {
      // console.log('you cant text your self')
      client.emit('error', 'you cant text your self')
      return
    }
    //if ()
    if (await this.checkif_blocked(sender.id, reciver.id)) {
      return
    }
    let dmid: number
    dmid = this.findroom(sender.dms, reciver.dms)
    if (dmid == -1) {
      const newDms = await this.prisma.chatRoom.create({
        data: {
          owner: sender.id,
          roomName: 'DM' + sender.id + reciver.id,
          password: '',
          isitgroup: false,
          type: 'private',
          mems: [sender.id, reciver.id],
          lastUpdate: new Date().toISOString(),
        },
      });
      this.clients.forEach((id, sock) => {
        if (id == reciver.id) {
          sock.join(newDms.roomName)
        }
      })
      this.clients.forEach((id, sock) => {
        if (id == req.user.id) {
          sock.join(newDms.roomName)
        }
      }
      )

      //this.clients.get(sender.id).join(newDms.roomName)
      await this.prisma.user.update({
        where: { id: sender.id },
        data: { dms: { push: newDms.id, } },
      });
      await this.prisma.user.update({
        where: { id: reciver.id },
        data: { dms: { push: newDms.id } },
      });
      const newmess = await this.prisma.chatMessage.create({
        data: {
          senderId: sender.id,
          message: info.message,
          roomid: newDms.id,
        },
      });

      this.clients.forEach((id, sock) => {
        if (id == reciver.id) {
          sock.join(newDms.roomName)
        }
      })
      this.clients.forEach((id, sock) => {
        if (id == req.user.id) {
          sock.join(newDms.roomName)
        }
      }
      )
      client.to(newDms.roomName).emit('receive', { message: info.message, sender: sender.id, id: sender.id, img: sender.avatar })
      client.emit('chat-update', 'recive msg 1')
    } else {
      const theDm = await this.prisma.chatRoom.findFirst({
        where: { id: dmid },
      });
      await this.prisma.chatRoom.update({
        where: { id: theDm.id },
        data: {
          lastUpdate: new Date().toISOString()
        }
      })
      /* for (let i = 0; i < sender.dms.length; i++) {
        if (reciver.dms.includes[sender.dms[i]] != -1) {
          dmid = sender.dms[i];
        }
      } */
      const newmess = await this.prisma.chatMessage.create({
        data: {
          senderId: sender.id,
          message: info.message,
          roomid: theDm.id
          //chatid: theDm.id,
        },
      });
      this.clients.forEach((id, sock) => {
        if (id == reciver.id) {
          sock.join(theDm.roomName)
        }
      })
      this.clients.forEach((id, sock) => {
        if (id == req.user.id) {
          sock.join(theDm.roomName)
        }
      }
      )
      client.to(theDm.roomName).emit('receive', { message: info.message, sender: sender.id, id: sender.id, img: sender.avatar })
      client.emit('chat-update', 'recive msg 2')

    }
  }

  async kickUser(@MessageBody() body, @ConnectedSocket() client: Socket, @Req() req) {
    body.roomId = parseInt(body.roomId)
    if (isNaN(body.roomId)) {
      // console.log('room is undefined !!')
      client.emit('error', 'room is undefined !!')
      return
    }
    if (req.user.id == undefined) {
      // console.log('refresh your browser !')
      client.emit('error', 'refresh your browser !')
      return 1
    }
    const theuser = await this.prisma.user.findUnique({ where: { id: req.user.id } })
    if (!theuser) {
      // console.log('you are not a user!')
      client.emit('error', 'you are not a user!')
      return 1
    }
    const theroom = await this.prisma.chatRoom.findFirst({ where: { id: body.roomId } })
    if (!theroom) {
      {
        client.emit('error', 'Room not found')
        // console.log('Room not found')
        return 1
      }
    }

    const meMember = await this.prisma.member.findFirst({ where: { memberId: theuser.id, roomId: theroom.id } })
    if (!meMember) {
      {
        client.emit('error', 'you are not member')
        // console.log('you are not member')
        return 1
      }
    }
    if (!meMember.admin) {
      client.emit('error', 'you dont have "L\'Ba9el" to do that')
      // console.log('you dont have "L\'Ba9el" to do that')
      return 1
    }
    const thefrnd = await this.prisma.user.findUnique({ where: { id: body.freindId } })
    if (!thefrnd) {
      // console.log('user not found !!')
      client.emit('error', 'user not found !!')
      return 1
    }
    if (await this.checkif_blocked(theuser.id, thefrnd.id)) {
      return
    }
    const frMember = await this.prisma.member.findFirst({ where: { memberId: thefrnd.id, roomId: theroom.id } })
    if (!frMember) {
      // console.log('member not found !!')
      client.emit('error', 'member not found !!')
      return 1

    }
    if (frMember.owner) {
      // console.log('you cant do shit to moul chi !!')
      client.emit('error', 'you cant do shit to moul chi !!')
      return 1
    }
    if (frMember.admin && !meMember.owner) {
      // console.log('you both admins! you cant do this')
      client.emit('error', 'you both admins! you cant do this')
      return 1
    }
    this.clients.forEach((id, sock) => {
      if (id == thefrnd.id) {
        sock.leave(theroom.roomName)
      }
    }
    )
    // console.log('kan hnaa !!!!')
    client.emit('error', 'can hnaa !!!!')
    client.emit('chat-update', 'can hnaa !!!!')

    await this.prisma.member.delete({ where: { id: frMember.id } })
    const newrooms = thefrnd.rooms.filter(item => item !== theroom.id)
    const newmems = theroom.mems.filter(item => item !== thefrnd.id)
    await this.prisma.user.update({ where: { id: thefrnd.id }, data: { rooms: newrooms } })
    await this.prisma.chatRoom.update({ where: { roomName: theroom.roomName }, data: { mems: newmems } })
    return 0
  }

  async banuser(@MessageBody() body, @ConnectedSocket() client: Socket, @Req() req) {
    body.roomId = parseInt(body.roomId)
    if (isNaN(body.roomId)) {
      client.emit('error', 'room is undefined !!')
      // console.log('room is undefined !!')
      return
    }
    if (await this.kickUser(body, client, req)) {

      //client.emit('error', 'in in return')
      // console.log('in in return')
      return
    }
    await this.prisma.chatRoom.update({ where: { id: body.roomId }, data: { blockList: { push: body.freindId } } })
  }

  async addUser(@MessageBody() body, @ConnectedSocket() client: Socket, @Req() req) {
    // console.log(body)
    body.roomId = parseInt(body.roomId)
    if (isNaN(body.roomId)) {
      client.emit('error', 'room not found !!!')
      // console.log('room not found !!!')
      return
    }
    if (req.user.id == undefined) {
      client.emit('error', 'refresh your browser !')
      // console.log('refresh your browser !')
      return 1
    }
    const theuser = await this.prisma.user.findUnique({ where: { id: req.user.id } })
    if (!theuser) {
      client.emit('error', 'you are not a user!')
      // console.log('you are not a user!')
      return 1
    }
    const theroom = await this.prisma.chatRoom.findFirst({ where: { id: body.roomId } })
    if (!theroom) {
      {
        client.emit('error', 'Room not found')
        // console.log('Room not found')
        return 1
      }
    }

    const meMember = await this.prisma.member.findFirst({ where: { memberId: theuser.id, roomId: theroom.id } })
    if (!meMember) {
      {
        client.emit('error', 'you are not member')
        // console.log('you are not member')
        return 1
      }
    }
    if (!meMember.admin) {
      client.emit('error', 'you dont have "L\'Ba9el" to do that')
      // console.log('you dont have "L\'Ba9el" to do that')
      return 1
    }
    const newusr = await this.prisma.user.findUnique({ where: { id: body.user2 } })
    if (!newusr) {
      client.emit('error', 'user not found !!')
      // console.log('user not found !!')
      return
    }
    if (await this.checkif_blocked(theuser.id, newusr.id)) {
      client.emit('error', 'user is blocked')
      // console.log('user is blocked')
      return
    }
    const newmemb = await this.prisma.member.findFirst({ where: { roomId: theroom.id, memberId: newusr.id } })
    if (newmemb) {
      client.emit('error', 'this user is already member !')
      // console.log('this user is already member !')
      return
    }
    else {
      if (theroom.blockList.includes(newusr.id)) {
        client.emit('error', 'this user is banned from this Room !!')

        // console.log('this user is banned from this Room !!')
        return
      }
      const newm = await this.prisma.member.create({
        data: {
          memberId: newusr.id,
          muted: false,
          admin: false,
          owner: false,
          roomId: theroom.id,
        }

      })
      await this.prisma.chatRoom.update({
        where: { roomName: theroom.roomName },
        data: {
          mems: { push: newm.memberId },
          members: { connect: { id: newm.id } }
        }
      })
      await this.prisma.user.update({
        where: { id: newusr.id },
        data: {
          rooms: {
            push: theroom.id
          }
        }
      })
      this.clients.forEach((id, sock) => {
        if (id == newusr.id) {
          sock.join(theroom.roomName)
        }
      }
      )
      client.emit('chat-update', 'you add this user !!')
      client.emit('error', 'you add this user !!')

    }
  }

  async leaveRoom(@MessageBody() body, @ConnectedSocket() client: Socket, @Req() req) {
    if (!body.roomName) {
      client.emit('error', 'undefined room !')
      // console.log('undefined room !')
      return
    }
    if (req.user.id == undefined) {
      client.emit('error', 'refresh your browser !!')
      // console.log('refresh your browser !!')
      return
    }
    const userr = await this.prisma.user.findUnique({ where: { id: req.user.id } })
    const theroom = await this.prisma.chatRoom.findUnique({
      where: { roomName: body.roomName },
    })
    if (!theroom) {
      client.emit('error', 'Room not fouund !!');
      // console.log('Room not fouund !!');
      return;
    }
    if (!theroom.mems.includes(req.user.id)) {
      client.emit('error', 'user is not a member!!');
      // console.log('user is not a member!!');
      return
    }
    const themember = await this.prisma.member.findFirst({
      where: {
        roomId: theroom.id,
        memberId: req.user.id
      }
    })
    if (!themember) {
      client.emit('error', 'you are not a member !!')
      // console.log('you are not a member !!')
      return
    }
    if (themember.owner) {
      client.emit('error', 'owner cant leave his group')
      // console.log('owner cant leave his group')
      return
    }
    await this.prisma.member.delete({ where: { id: themember.id } })
    const newrooms = userr.rooms.filter(item => item !== theroom.id)
    const newmems = theroom.mems.filter(item => item !== userr.id)
    await this.prisma.user.update({ where: { id: userr.id }, data: { rooms: newrooms } })
    await this.prisma.chatRoom.update({ where: { roomName: theroom.roomName }, data: { mems: newmems } })
    this.clients.forEach((id, sock) => {
      if (id == req.user.id) {
        sock.leave(theroom.roomName)
      }
    }
    )
    client.emit('error', 'kenti hna !!');
    client.emit('chat-update', 'kenti hna !!');
    // console.log('kenti hnaa !!')
  }

  async textRoom(@MessageBody() body, @ConnectedSocket() client: Socket, @Req() req) {

    if (!body.roomName) {
      client.emit('error', 'undefined room !')
      // console.log('undefined room !')
      return
    }
    if (req.user.id == undefined) {
      client.emit('error', 'refresh your browser !!')
      // console.log('refresh your browser !!')
      return
    }
    const sender = await this.prisma.user.findUnique({ where: { id: req.user.id } })
    const theroom = await this.prisma.chatRoom.findUnique({
      where: { roomName: body.roomName },
    })
    if (!theroom) {
      // console.log('Room not fouund !!');
      client.emit('error', 'Room not fouund !!');
      return;
    }
    if (!theroom.mems.includes(req.user.id)) {
      // console.log('user is not a member!!');
      client.emit('error', 'user is not a member!!');
      return
    }
    let idd: string
    theroom.mems.forEach((memb) => {
      if (memb == sender.id) {
        idd = memb
      }
    })
    const themember = await this.prisma.member.findFirst({
      where: {
        roomId: theroom.id,
        memberId: req.user.id
      }
    })
    if (themember.muted) {
      client.emit('error', 'you are muted !')
      // console.log('you are muted !')
      return
    }
    const thetxt = await this.prisma.chatMessage.create({
      data: {
        senderId: sender.id,
        roomid: theroom.id,
        message: body.message
      }
    })
    const allmems = await this.prisma.member.findMany({ where: { roomId: theroom.id } })
    for (let i = 0; i < allmems.length; i++) {
      this.clients.forEach((id, sock) => {
        if (id == allmems[i].memberId) {
          sock.join(theroom.roomName)
        }
      }
      )
    }
    await this.prisma.chatRoom.update({
      where: { id: theroom.id },
      data: {
        lastUpdate: new Date().toISOString()
      }
    })
    client.to(theroom.roomName).emit('receive', { message: body.message, sender: theroom.id, id: sender.id, img: sender.avatar })
    // console.log('message sent !')
    client.emit('chat-update', 'recive msg 3')


    /*      if (!(room.members.indexOf(client.id) === -1)) {
        for(let i = 0; i < room.mems.length; i++)
        {
          // console.log('sent !!');
          room.mems[i].emit('textRoom', { message, time: new Date().toDateString() })};
    
      } */
    /*       else {
        // console.log('you are not member of this chat');
      } */
  }

  async createRoom(@MessageBody() body: any, @ConnectedSocket() client: Socket, @Req() req) {
    if (body.roomName == undefined) {
      // console.log('roomName is undefined !!')
      client.emit('error', 'roomName is undefined !!')
      return
    }
    if (body.password == undefined) {
      body.password = ''
    }
    const checkroom = await this.prisma.chatRoom.findUnique({ where: { roomName: body.roomName } })
    if (checkroom) {
      // console.log('room already exist')
      client.emit('error', 'room already exist')
      return
    }

    if (req.user.id == undefined) {
      // console.log('unkown socket')
      client.emit('error', 'unkown socket')
      return
    }
    const owner = await this.prisma.user.findUnique({ where: { id: req.user.id } })
    if (!owner) {
      // console.log('unkown user')
      client.emit('error', 'unkown user')
      return
    }
    const newmember = await this.prisma.member.create(
      {
        data: {
          memberId: owner.id,
          muted: false,
          admin: true,
          owner: true
        }
      }
    )
    let hashed: string
    hashed = await bcrypt.hash(body.password, 10)!
    const newroom = await this.prisma.chatRoom.create(
      {
        data: {
          owner: owner.id,
          roomName: body.roomName,
          password: hashed,
          members: { connect: [{ id: newmember.id }] },
          mems: [owner.id],
          isitgroup: true,
          type: body.roomType
        }
      }
    )
    await this.prisma.user.update({
      where: { id: owner.id },
      data: {
        rooms: {
          push: newroom.id
        }
      }
    })
    this.clients.forEach((id, sock) => {
      if (id == req.user.id) {
        sock.join(newroom.roomName)
      }
    }
    )
    client.emit('error', `${body.roomName} room is created  ... `);
    client.emit('chat-update', `${body.roomName} room is created  ... `);
    // console.log('room created  ... room name :!!')
  }

  async joinRoom(@MessageBody() body: any, @ConnectedSocket() client: Socket, @Req() req) {
    if (body.roomName == undefined) {
      client.emit('error', 'roomName is undefined !!')
      // console.log('roomName is undefined !!')
      return
    }
    if (body.password == undefined) {
      body.password = ''
    }
    if (req.user.id == undefined) {
      // console.log('refreeeshhhh !!!')
      client.emit('error', 'refreeeshhhh !!!')
      return
    }
    const theuser = await this.prisma.user.findUnique({ where: { id: req.user.id } })
    if (!theuser) {
      // console.log('unknown user !!!')
      client.emit('error', 'unknown user !!!')
      return
    }
    // console.log(body.roomName, ' ===== roomname')
    const room = await this.prisma.chatRoom.findUnique({ where: { roomName: body.roomName } })
    if (!room) {
      // console.log('room not found !!')
      client.emit('error', 'room not found !!')
      return
    }

    // console.log(room.type)
    const mems = room.mems

    // console.log(mems)
    if (mems.includes(theuser.id)) {
      // console.log('already member !! ')
      client.emit('error', 'already member !! ')
      return
    }
    if (room.blockList.includes(theuser.id)) {
      // console.log('you are banned a lmicrob ... ach derti?')
      client.emit('error', 'you are banned a lmicrob ... ach derti?')
      return
    }
    if (room.type == 'Protected') {
      //emit err
      let iscorrect = await bcrypt.compare(body.password, room.password)
      if (!iscorrect) {
        // console.log('wrong passsword !!!')
        client.emit('error', 'wrong passsword !!!')
        return
      }
    }
    if (room.type == 'Private') {
      client.emit('error', 'this is a private room you dont have access')
      // console.log('this is a private room you dont have access')
      return
    }
    const newmember = await this.prisma.member.create({
      data: {
        memberId: theuser.id,
        muted: false,
        admin: false,
        owner: false,
        roomId: room.id,
      }
    })
    this.clients.forEach((id, sock) => {
      if (id == req.user.id) {
        sock.join(room.roomName)
      }
    }
    )
    await this.prisma.chatRoom.update({
      where: { roomName: room.roomName },
      data: {
        mems: { push: newmember.memberId },
        members: { connect: { id: newmember.id } }
      }
    })
    client.emit('chat-update', 'you add this user !!')
    client.emit('error', 'welcome to the room !!');
    // console.log('welcome to the room !!')
    await this.prisma.user.update({
      where: { id: theuser.id },
      data: {
        rooms: {
          push: room.id
        }
      }
    })
  }

  async changeRoomType(req, res, body) {
    if (body.roomName == undefined) {
      //client.emit('error', 'roomName is undefined !!')
      // console.log('roomName is undefined !!')
      return
    }
    if (body.password == undefined) {
      body.password = ''
    }
    if (req.user.id == undefined) {
      // console.log('refreeeshhhh !!!')
      //client.emit('error', 'refreeeshhhh !!!')
      return
    }
    const theuser = await this.prisma.user.findUnique({ where: { id: req.user.id } })
    if (!theuser) {
      // console.log('unknown user !!!')
      //client.emit('error', 'unknown user !!!')
      return
    }
    // console.log(body.roomName, ' ===== roomname')
    const room = await this.prisma.chatRoom.findUnique({ where: { roomName: body.roomName } })
    if (!room) {
      // console.log('room not found !!')
      //client.emit('error', 'room not found !!')
      return
    }
    const themember = await this.prisma.member.findFirst({
      where: {
        roomId: room.id,
        memberId: req.user.id
      }
    })
    if (!themember) {
      //client.emit('error', 'you are not a member !!')
      // console.log('you are not a member !!')
      return
    }
    if (!themember.owner) {
      // console.log('you cant do this !')
      return
    }
    if (room.type == body.roomType) {
      // console.log('room is already ', room.type)
      //client.emit('error','room is already ', room.type)
      return
    }
    let hashed: string
    hashed = await bcrypt.hash(body.password, 10)!
    if (body.roomType == 'Protected') {
      await this.prisma.chatRoom.update({
        where: { roomName: room.roomName }, data: {
          type: body.roomType,
          password: hashed,
        }
      })
    }
    else if (body.roomType == 'Private') {
      await this.prisma.chatRoom.update({
        where: { roomName: room.roomName }, data: {
          type: body.roomType,
          password: hashed,
        }
      })
    }
    else if (body.roomType == 'Public') {
      await this.prisma.chatRoom.update({
        where: { roomName: room.roomName }, data: {
          type: body.roomType,
          password: hashed,
        }
      })
    }
  }
}
