import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SocketServiceService } from './services/socket-service.service';
import { RoomServiceService } from './services/room-service.service';
import { Observable, of } from 'rxjs';
import { MessageType, PictochatMessage, Room } from './models/room.model';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  rooms$!: Observable<Room[]>;
  currentRoom?: Room;

  notifications: { message: string, date: Date }[] = []

  public constructor(
    private readonly socketService: SocketServiceService,
    private readonly _roomService: RoomServiceService
  ) {
    this.rooms$ = _roomService.getRooms();
  }

  ngOnInit(): void {

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
    return [];
  }

  public connect() {
    this.socketService.connect();
  }


  title = 'wss-test-2';
}
