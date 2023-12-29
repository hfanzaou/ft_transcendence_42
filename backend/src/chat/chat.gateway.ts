import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { MESSAGE, NEWCHAT } from "./myTypes";

@WebSocketGateway({cors: true})
export class ChatGateway implements
OnGatewayConnection,
OnGatewayDisconnect {
	constructor(private chatService: ChatService) {}
	@WebSocketServer() server: Server
	@SubscribeMessage("server")
	handelMessage(client: Socket, data: MESSAGE) {
		// console.log(Array.from(client.rooms).slice(1));
		const room = this.chatService.getRoom(data);
		this.server
			.to(room)
			.emit("client", data.message);
	}
	@SubscribeMessage("newChat")
	handelNewChat(client: Socket, data: NEWCHAT) {
		Array
			.from(client.rooms)
			.slice(1)
			.forEach(room => client.leave(room));
		const room = this.chatService.getRoom(data);
		client.join(room);
	}
	async handleConnection(client: Socket) {
		// console.log(`connection: ${client.id}`);
	}
	handleDisconnect(client: Socket) {
		// console.log(`disconnect: ${client.id}`);
		this.chatService.dropUser(client);
	}
}