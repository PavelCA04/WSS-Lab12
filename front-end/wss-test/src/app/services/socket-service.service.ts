import { EventEmitter, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
// import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketServiceService {
  private io?: Socket;

  public readonly _newNotification: EventEmitter<{ message: string, date: Date }> = new EventEmitter();
  public readonly _newMessages: EventEmitter<{ user:string, message: string, date: Date }> = new EventEmitter()
  public readonly _roomCreated: EventEmitter<unknown> = new EventEmitter();

  constructor(
  ) {
  }


  public connect() {
    if (!this.io) {
      console.log('Connecting');
      this.io = io('http://localhost:3000');

      this.io.on('GENERAL_NOTIFICATION', (data: { message: string, date: string }) => {
        this._newNotification.emit({
          message: data.message,
          date: new Date(data.date)
        });
        this._roomCreated.emit();
      });

      this.io.on('ROOM_CREATED', () => {
        console.log('Room created event received');
        this._roomCreated.emit();
      });

      this.io.on('NEW_MESSAGE', (data: { content: string; sentBy: { username: string }; sent: string }) => {
        console.log('New message received:', data);
        this._newMessages.emit({
          user: '',
          message: data.content,
          date: new Date(data.sent)
        });
      });

      console.log('Connected');
    }
  }

  public createRoom(name: string):  void {    
    this.io?.emit('CREATE_ROOM', { "name": name });
  }

  public joinRoom(room: string, usuario: string):  void {        
    this.io?.emit('JOIN_ROOM', { "room": room, "username": usuario });
  }

  public leaveRoom(room: string, usuario: string):  void {        
    this.io?.emit('LEAVE_ROOM', { "room": room, "username": usuario });
  }

  public sendMessage( message: string, usuario: string):  void {
    console.log('Sending message:', message);
    
    this.io?.emit('NEW_MESSAGE', { "content": message, "username": usuario });
  }
}
