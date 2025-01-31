import { UserRepository} from './../database/user.database';
import { Socket } from "socket.io";
import { PictochatMessage } from "../domain/message/message.model";
import { MessageType } from "../domain/message/messageType.enum";

export type SendMessageCommand = {
  content: string;
  username: string;
};

export type SendMessageResult = {
  message?: PictochatMessage;
  success: boolean;
};

export class SendMessageUseCase {
  private socket:Socket;
  private userRepository:UserRepository;

  public constructor(socket:Socket,UserRepository:UserRepository) 
  { 
    this.socket=socket;
    this.userRepository=UserRepository;
  }

  public handle(command: SendMessageCommand): SendMessageResult {
    console.log('Send Message', command);
    
    const message: PictochatMessage = {
      messageType: MessageType.direct_message,
      content: command.content,
      sent: new Date(),
      sentBy: undefined,
    };
    console.log('Send Message 1', command);
    this.socket.emit('NEW_MESSAGE', message);
    console.log('Send Message 2', command);
    return { success: true };
  }
}