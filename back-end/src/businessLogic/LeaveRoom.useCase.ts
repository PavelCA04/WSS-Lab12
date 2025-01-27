import { Socket } from "socket.io";
import { UserRepository } from "../database/user.database";
import { RoomRepository } from "../database/room.repository";

export type LeaveRoomCommand = {
  username: string;
};

export type LeaveRoomResult = {
  success: boolean;
};

export class LeaveRoomHandler {
  public constructor(
    private readonly _socket: Socket,
    private readonly _userRepository: UserRepository,
    private readonly _roomRepository: RoomRepository,
  ) {
  }

  public handle(command: LeaveRoomCommand): LeaveRoomResult {
    // TODO: implement
    const { username }  = command;
    
    //Obtener usuario
    const user = this._userRepository.getUserByCriteria(
      (user) => user.username === username
    );

    //Validar el usuario exista
    if (!user || !user.currentRoom){ 
      return { success: false };
    }

    //Obtener la sala
    const room = this._roomRepository.getRoomByName(user.currentRoom!);

    
    // Validar que la room exista
    if (!room){
      return { success: false };
    }
    
    // Quitarle un participante a la sala
    room.numberOfParticipants -= 1;
    
    //implementar la logica de salir de la sala
    this._socket.leave(user.currentRoom!);

    //Actualizar el usuario
    user.currentRoom = undefined;

    //Mandar el mensaje de que alguien un usuario ha salido
    this._socket.to(user.currentRoom!).emit('USER_LEFT', user.username);
    return { success: true };
  }
}
