import React, { useEffect, useState } from "react";
import Nav from "./components/Nav";
import Private from "./components/Private";
import Chat from "./components/Chat";
import { DATA } from "./myTypes";
import { Socket, io } from "socket.io-client";
import { setSocket, setUserData } from "./utils";
import Header from "../../../Layout/Header/Header";


export default function ChatApp()
{
	const	[data, setData] = useState<DATA>({
		message: ""
	});
	const	[option, setOption] = useState("Private");
	
	async function callBack(socket: Socket) {
		setData(prev => setSocket(prev, socket));
		try {
			const res = await fetch("http://localhost:3001/chatUser", {
				method: "POST",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ socket: socket.id })
			});
			const Data = await res.json();
			setData(prev => setUserData(prev, Data));
		}
		catch {
			return;
		}
	}
	useEffect(() => {
		const	socket = io("http://localhost:3001");
		socket.on("connect", async () => {
			await callBack(socket);
		})
		return () => {
			socket.disconnect();
			socket.off("connect", async () => {
				await callBack(socket);
			})
		}
	}, []);
	return (
		<div className="">
			<Header avatar={""}/>
			<div className="flex h-96">
				<Nav option={option} setOption={setOption}/>
				<Private
					data={data}
					setData={setData}
					/>
				<Chat
					data={data}
					setData={setData}
					/>
			</div>
		</div>
	)
}
