import { Socket } from "socket.io";
import { UserRepository } from "../database/user.database";
import { TopicsToSend } from "../constants";
import { RoomRepository } from "../database/room.repository";

export type JoinRoomCommand = {
  username: string;
  room: string;
};

export type JoinRoomResult = {
  success: boolean;
};

export class JoinRoomHandler {
  public constructor(
    private readonly _socket: Socket,
    private readonly _userRepository: UserRepository,
    private readonly _roomRepository: RoomRepository,
    
  ) { }

  public handle(command: JoinRoomCommand): JoinRoomResult {
    console.log('command', command);
    console.log(this._roomRepository.getRooms());
    
    
    if (!command.username || !command.room) {
      return { success: false };
    }

    const user = this._userRepository.getUsers().find((user) => user.username === command.username);
    
    //Obtener la sala
    const room = this._roomRepository.getRoomByName(user?.currentRoom!);

    
    // Validar que la room exista
    console.log('room', room);
    
    
    // Quitarle un participante a la sala
    if (room) {
      room.numberOfParticipants += 1;
    }

    try {
      this._socket.join(command.room)
      this._userRepository.addUser({ username: command.username, socketId: this._socket.id, currentRoom: command.room });


      const room = this._roomRepository
      this._socket.emit(TopicsToSend.GENERAL_NOTIFICAITON, {
        message: `User ${command.username} has joined the room ${command.room}`,
        date: new Date()
      });
      return { success: false };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
    

  }
}
