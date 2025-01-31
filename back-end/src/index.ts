import express, { Express } from 'express';
import { createServer } from 'http';
import { Socket, Server } from 'socket.io';
import { cors } from './httpServer/cors.function';
import { UserRepository } from './database/user.database';
import { RoomRepository } from './database/room.repository';
import { Startup } from './loadInitialData';
import { SendMessageUseCase } from './businessLogic/SendMessage.useCase';
import { JoinRoomHandler } from './businessLogic/JoinRoom.useCase';
import { LeaveRoomHandler } from './businessLogic/LeaveRoom.useCase';
import { CreateRoomHandler } from './businessLogic/CreateRoom.useCase';
import { GeneralGroups, RequestsTopics } from './constants';
import { PictochatUser } from './domain/user/user.model';

// Routes
import RoomsRoute from './routes/room.routes';

const PORT = 3000;
// const origin:

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors);

// Startup
Startup();

app.use('/rooms', RoomsRoute);


// Setup http server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true
  }
});
io.on('connection', (socket: Socket) => {
  const { id } = socket;

  console.log(`Connected ${id}`);
  socket.join(GeneralGroups.GENERAL_NOTIFICATIONS);

  socket


  socket.on(RequestsTopics.ASSIGN_USER, (createUserRequest) => {
    const userRepository = new UserRepository();
    const user: PictochatUser = {
      socketId: socket.id,
      username: JSON.parse(createUserRequest).username
    };
    userRepository.addUser(user);
  });

  socket.on(RequestsTopics.CREATE_ROOM, (createRoomRequest) => {
    console.log(createRoomRequest.name);
    
    const roomRepository = new RoomRepository();
    const createRoomHandler = new CreateRoomHandler(socket, roomRepository);

    createRoomHandler.handle({ name: createRoomRequest.name });
  });

  socket.on(RequestsTopics.JOIN_ROOM, (roomRequeststr) => {
    const userRepository = new UserRepository();
    const roomRepository = new RoomRepository();
    
    const joinRoomHandler = new JoinRoomHandler(socket, userRepository, roomRepository);
    
    console.log('Join room request', roomRequeststr.username );
    
    joinRoomHandler.handle({ room: roomRequeststr.room, username: roomRequeststr.username });
  });

  socket.on(RequestsTopics.LEAVE_ROOM, (leaveRequest) => {
    console.log('Leave room request', leaveRequest.username);
    
    const userRepository = new UserRepository();
    const roomRepository = new RoomRepository();
    const leaveRoomHandler = new LeaveRoomHandler(socket, userRepository, roomRepository);

    leaveRoomHandler.handle({ username: leaveRequest.username });
  });

  socket.on(RequestsTopics.NEW_MESSAGE, (newMessage) => {
    console.log('New message', newMessage);
    
    const userRepository = new UserRepository();
    const newMessageUseCase: SendMessageUseCase = new SendMessageUseCase(
      socket,
      userRepository
    );

    console.log('New message 1', newMessage);

    newMessageUseCase.handle({
      content: newMessage.content,
      username: newMessage.userId
    });

    console.log('New message 2', newMessage);
  });

  socket.on('GENERAL_NOTIFICATION', () => {
    socket.broadcast.emit('HOLA MUNDO');
  })
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server is running on http://localhost:${PORT}`);
});
