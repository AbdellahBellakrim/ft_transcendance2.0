import { Inject, Injectable } from '@nestjs/common';
import {  PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { channelDto, channelMembershipDto, CreateMessageDto, dmDto} from '../../chat/dto/create-chat.dto'
import { catchError } from '../decorators.prisma';


@Injectable()
export class ChatCrudService 
{
  constructor (@Inject (PrismaService) private readonly prisma:PrismaService ){}

    // Create a new chat channel (public, or password-protected).

    @catchError()
    async   createChannel (user_id:string , data : channelDto)
    {
      const channel_id :string =   (await this.prisma.prismaClient.channel.create ({data})).id
      const memberShipData : channelMembershipDto = {
        channel_id : channel_id,
        user_id : user_id, 
        role : 'OWNER'
      }
      this.joinChannel (memberShipData)
      return channel_id
    }
    
  //user joins channel

    @catchError()
    async   joinChannel (data : channelMembershipDto)
    {
        return this.prisma.prismaClient.channelMembership.create ({data})
    }

    @catchError()
    async findChannelById (channel_id :string)
    {
      return this.prisma.prismaClient.channel.findUnique (
        {
          where :{
            id : channel_id
          }
        }
      )
    }

    async findDmById (dm_id :string)
    {
      try
      {
        return await this.prisma.prismaClient.directMessaging.findUnique (
          {
            where :{
              id : dm_id
            }
          }
        )
      }
      catch
      {
        return null
      }
    }

    async findChannelsByType (channel_type :'PUBLIC' | 'PRIVATE' | 'PROTECTED')
    {
      return this.prisma.prismaClient.channel.findMany (
        {
          where :{
            type : channel_type
          }
        }
      )
    }
    @catchError()
    async createDm ( data : dmDto)
    {
      return (await this.prisma.prismaClient.directMessaging.create ({data})).id
    }


    async getDmTable ( user1_id: string, user2_id: string)
    {
        const Dm = await this.prisma.prismaClient.directMessaging.findUnique({
        where :
        {
          user1_id :user1_id,
          user2_id : user2_id
        },
        select : {
          id : true
        }

      })
      return Dm ? (await Dm).id : null
    }


    async retrieveUserDmChannels (user_id: string)
    {
      return this.prisma.prismaClient.directMessaging.findMany(
        {
          where :{
            OR :[
              {user1_id : user_id}, 
              {user2_id : user_id}, 
            ]
          },
          orderBy :{
            updatedAt : 'asc'
          }
        },
      );
    }
    //this method finds all the channels that exist in the server
    
    
    @catchError()
    async findAllChannelsAvailbleToJoin(user_id :string)
    {
      const notJoinedChannels = await this.prisma.prismaClient.channelMembership.findMany(
        {
          where :
          {
            user_id :
            {
              not :user_id
            },
          },
          select :{
            id :true
          }
      });
      //the type of the retrieved id's look like this { id: string }[], the nest function tries to add them to an array of string
      const channelIds: string[] = notJoinedChannels.map(item => item.id);

      return  this.prisma.prismaClient.channel.findMany (
        {
          where :{
            id:
              {
                in: channelIds
              },
            OR:[
              {type: 'PUBLIC'},
              {type :  'PROTECTED'}
            ]
          }
        }
      )
    }


    @catchError()
    async findAllJoinedChannels (user_id :string )
    {
      return this.prisma.prismaClient.channelMembership.findMany(
        {
          where :
          {
            user_id : user_id
          },
        }
      );
    }


    async retrieveRoomMessages (room_id : string)//This method is used both for dm and groups
    {
      try{
        return await this.prisma.prismaClient.message.findMany(
        {
          where :
          {
            OR:[
              {channel_id : room_id},
              {dm_id : room_id}
            ]
          },
          orderBy :{
            createdAt : 'asc'
          }
        }
      )
      }
      catch{
        return {}
      }
    }


    // Retrieve direct messages between users.
    @catchError()
    async retieveBlockedUsersList (user_id :string)
    {
      return this.prisma.prismaClient.friendships.findMany (
        {
          where:
          {
            
            OR:[
              {user1_id : user_id},
              {user2_id :user_id}
            ],
            relationStatus : 'BLOCK'
          }
        }
      )
    }
    @catchError()
    async retieveBlockedChannelUsers (channel_id :string)//for groups only
    {
      return this.prisma.prismaClient.channelMembership.findMany (
        {
          where:
          {
            channel_id :channel_id,
            is_banned :true
          }
        }
      )
    }



    //update

    @catchError()
  async changeChannelPhoto (channel_id: string, newAvatarURI :string)
  {
      return this.prisma.prismaClient.channel.update(
      {
        where: { id : channel_id}, 
        data : {
          image: newAvatarURI,
        }
      }
      )
    } 

    @catchError()
    async blockAUserWithinGroup(user_id :string, channel_id: string)
    {
      return this.prisma.prismaClient.channelMembership.update(
        {
          where :{
            user_id :user_id,
            channel_id : channel_id
          },
          data:
          {
            is_banned :true,
            banned_at: new Date()
          }
        }
      )
    }

    @catchError()
    async unblockAUserWithinGroup(user_id :string, channel_id: string)
    {
      return this.prisma.prismaClient.channelMembership.update(
        {
          where :{
            user_id :user_id,
            channel_id : channel_id
          },
          data:
          {
            is_banned :false,
          }
        }
      )
    }

    @catchError()
    async blockAUserWithDm(channel_id: string)
    {
      return this.prisma.prismaClient.directMessaging.update(
        {
          where :{
            id : channel_id
          },
          data:
          {
            status : 'BANNED'
          }
        }
      )
    }

    @catchError()
    async unblockAUserWithDm(channel_id: string)
    {
      return this.prisma.prismaClient.directMessaging.update(
        {
          where :{
            id : channel_id
          },
          data:
          {
            status : 'ALLOWED'
          }
        }
      )
    }


    @catchError()
    async leaveChannel (user_id: string, channel_id :string)
    {
      return this.prisma.prismaClient.channelMembership.delete (
        {
          where :
          {
            user_id : user_id, 
            channel_id: channel_id
          }

        }
      )
    }

    //this method espacially was created in case all the members of a channel left
    async deleteChannel ( channel_id :string)
    {
      try
      {
        await this.prisma.prismaClient.directMessaging.delete (
          {
            where :
            {
              id: channel_id
            }

          }
        )
      }
      catch (error)
      {
        await this.prisma.prismaClient.channel.delete (
          {
            where :
            {
              id: channel_id
            }

          }
        )
      }
    }

    // @catchError()
    async createMessage (data : CreateMessageDto)
    {
      console.log (data)
      return ( await this.prisma.prismaClient.message.create ({data}))
    }
  
    @catchError()
    async deleteMessage (message_id: string)
    {
      this.prisma.prismaClient.message.delete (
        {
          where:
          {
            id : message_id
          }
        }
      )
    }

    @catchError()
    async editMessage (message_id: string, content :string)
    {
      this.prisma.prismaClient.message.update ({
        where :
        {
          id : message_id
        },
        data: {
          content : content
        }
      })
    
    }


    @catchError()
    async upgradeToAdmin (user_id :string, channel_id: string)
    {
      this.prisma.prismaClient.channelMembership.update ({
        where :
        {
          channel_id : channel_id,
          user_id : user_id
        },
        data: {
          role : 'ADMIN'
        }
      })
    }

    @catchError()
    async setGradeToUser (user_id :string, channel_id: string)
    {
      this.prisma.prismaClient.channelMembership.update ({
        where :
        {
          channel_id : channel_id,
          user_id : user_id
        },
        data: {
          role : 'USER'
        }
      })
    }

    @catchError()
    async makeOwner (user_id :string, channel_id: string)
    {
      this.prisma.prismaClient.channelMembership.update ({
        where :
        {
          channel_id : channel_id,
          user_id : user_id
        },
        data: {
          role : 'OWNER'
        }
      })
    }
      ///


}