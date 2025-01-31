import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SocketServiceService } from './services/socket-service.service';
import { RoomServiceService } from './services/room-service.service';
import { Observable, of } from 'rxjs';
import { MessageType, PictochatMessage, Room } from './models/room.model';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { RoomDialogComponent } from './chat/components/room-dialog/room-dialog.component';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';



@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, MatButtonModule, RoomDialogComponent, FormsModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: true,
})

export class AppComponent implements OnInit {
  rooms$!: Observable<Room[]>;
  currentRoom?: Room;
  activeRoom?: string; // Track the active room
  usuario: string = '';

  notifications: { message: string, date: Date }[] = [];
  messages: { user: string, message: string, date: Date }[] = [];
  messageText: string = '';



  constructor(
    private readonly socketService: SocketServiceService,
    private readonly _roomService: RoomServiceService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef

  ) {
    this.rooms$ = _roomService.getRooms();
  }

  public joinRoom(room: string) {
    if (this.activeRoom === room) {
      this.activeRoom = undefined;
    } else {
      this.activeRoom = room;
      this.socketService.joinRoom(room, this.usuario);
    }
  }

  public leaveRoom(room: string) {
    this.activeRoom = undefined;
    console.log('Leaving room', room);
    this.socketService.leaveRoom(room, this.usuario);
  }

  public sendMessage() {
    console.log('Sending message:', this.messageText);
    
    if (this.messageText.trim()) {
      console.log('Sending message:', this.messageText);
      this.socketService.sendMessage(this.messageText, this.usuario);
      this.messageText = ''; // Clear input after sending
    }
  }
  

  public onSelectRoom(room: Room) {
    this.currentRoom = this.currentRoom === undefined || this.currentRoom.name !== room.name
      ? room
      : undefined;
  }

  public getMessageClass(message: PictochatMessage) {
    if (message.messageType === MessageType.notification) {
      return ['justify-center rounded-full bg-gray-600 text-white'];
    }
    return ['justify-center rounded-full bg-gray-600 text-white'];
  }

  public connect() {
    this.socketService.connect();
  }

  showRoomDialog (): void {    
    const dialogRef = this.dialog.open(RoomDialogComponent, {});
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.success) {
          this.socketService.createRoom(result.name)  
        } 
      }
    });
  }

  ngOnInit(): void {
    this.usuario = [...Array(24)].map(() => Math.random().toString(36)[2]).join('');
    console.log('Usuario: ', this.usuario);

    this.socketService._newNotification.subscribe(notification => {
      console.log('Received notification:', notification);
      this.notifications.push(notification);
    });

    this.socketService._roomCreated.subscribe(() => {
      console.log('Room created, updating rooms...');
      this.rooms$ = this._roomService.getRooms(); 
      console.log(this.rooms$);
      
    });

      // Subscribe to incoming messages
      this.socketService._newMessages.subscribe(message => {
        console.log('New message received:', message);
        this.messages = [...this.messages, message]; // Create a new array reference
        this.cdr.detectChanges(); // Force UI update
      });
      
  }
  


  title = 'wss-test-2';
}
