import { ActionIcon } from "@mantine/core";
import { IconPingPong, IconSend2, IconUser } from "@tabler/icons-react";
import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { DATA, MESSAGE, USERDATA } from "../myTypes";
import { setMessageData, setUserData } from "../utils";
import { Link } from "react-router-dom";

interface Props {
	data: DATA,
	setData: React.Dispatch<React.SetStateAction<DATA>>
}

const ChatPrivate: React.FC<Props> = ({ data, setData }) => {
	const	[conversation, setConversation] = useState<Array<{
		id: number,
		message: string,
		sender: string
	}>>([]);
	const	dataRef = useRef(data);
	dataRef.current = data;
	const	Reference = useRef<HTMLInputElement | null>(null);
	const	[trigger, setTrigger] = useState(false);
	const	[avatars, setAvatars] = useState<Array<{
		userName: string,
		avatar: string
	}>>([]);

	useEffect(() => {
		async function fetchData() {
			const	res = await fetch("chatAvatarPrivate", {
				method: "POST",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userName1: data.userData?.userName,
					userName2: data.talkingTo
				}),
				credentials: "include"
			});
			const	Data = await res.json();
			if (Data)
				setAvatars(Data);
		}
		if (data.userData?.userName && data.talkingTo)
			fetchData();
	}, [data.talkingTo]);
	useEffect(() => {
		if (Reference.current)
			Reference.current.focus();
	}, [data.talkingTo])
	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch("chathistoryPrivate", {
					method: "POST",
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						sender: data.userData?.userName,
						recver: data.talkingTo
					}),
					credentials: "include"
				});
				const Data = await res.json()
				if (Data)
					setConversation(Data)
				else
					throw new Error("error")
			}
			catch {
				setConversation([]);
				return ;
			}
		}
		if (data.talkingTo && data.userData?.userName)
			fetchData();
	}, [data]);
	useEffect(() => {
		if (trigger) {
			async function fetchData() {
				if (data.talkingTo) {
					await fetch("chatUsers", {
						method: "POST",
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							sender: data.userData?.userName,
							recver: data.talkingTo,
						}),
						credentials: "include"
					});
					setData(prev => ({
						...prev,
						trigger: !prev.trigger
					}))
				}
				const res0 = await fetch("chatUser", {
						method: "POST",
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							userName: data.userData?.userName
						}),
						credentials: "include"
					});
					const Data: USERDATA = await res0.json();
					if (Data) {
						Data.chatUsers.sort((x, y) => {
							if (x.time && y.time) {
								const	timeX = new Date(x.time);
								const	timeY = new Date(y.time);
								return timeY.getTime() - timeX.getTime();
							}
							return 0;
						})
						setData(prev => setUserData(prev, Data));
						data.socket?.emit("newUser", data.talkingTo)
					}
			}
			if (data.talkingTo && data.userData?.userName)
				fetchData()
			setTrigger(false);
		}
	}, [trigger])
	function callBack(m: {
		id: number,
		message: string,
		sender: string
	})
	{
		setData(x => ({
			...x,
			send: !x.send
		}))
		setTrigger(true);
	}
	useEffect(() => {
		data.socket?.on("clientPrivate", callBack);
		return (() => {
			data.socket?.off("clientPrivate", callBack);
		})
	}, [data.socket])
	function submit(event: FormEvent<HTMLFormElement>)
	{
		event.preventDefault();
		if (data.message.length) {
			const	Message: MESSAGE = {
				sender: data.userData ? data.userData.userName : "",
				recver: data.talkingTo ? data.talkingTo: "",
				message: data.message
			}
			data.socket?.emit("direct", Message);
			setData(prev => setMessageData(prev, ""))
			if (Reference.current)
				Reference.current.focus();
			data.socket?.emit(
				"addnotification",
				{reciever: Message.recver, type: "chat"}
			);
		}
	}
	function change(event: ChangeEvent<HTMLInputElement>)
	{
		setData(prev => setMessageData(prev, event.target.value))
	}
	function clickGame() {
		data.socket?.emit(
			"addnotification",
			{reciever: data.talkingTo, type: "game"}
		);
		
	}
	return data.talkingTo ? (
		<form
			onSubmit={submit}
			className="w-[57%] bg-discord4 flex flex-col
				justify-end text-discord6 p-0 rounded-r-3xl"
		>
			<ul className="max-h-90 overflow-auto flex flex-col-reverse">
				{conversation.map(x => {
					const	avatar = avatars.find(y => y.userName == x.sender);
					if (avatar) {
						return (
							<li
								key={x.id}
								className="flex hover:bg-discord3
									rounded-md m-2 p-3"
							>
								<a
									href={`UserProfile?name=${x.sender}`}
								>
									{
										avatar.avatar ?
											<img
												src={avatar.avatar}
												className="h-12 w-12 rounded-full mr-3"
											/> :
											<IconUser
												className="h-12 w-12 rounded-full mr-3
													bg-discord1"
											/>
									}
								</a>
								<div className="w-[80%]">
									<div className="font-extrabold">{x.sender}</div>
									<div className="break-words">{x.message}</div>
								</div>
							</li>
						)
					}
				})}
			</ul>
			<div className="flex m-2">
				<input
					type="text"
					placeholder="Message..."
					className="bg-discord1 border-none outline-none w-full h-10 rounded-md mr-2 p-5"
					onChange={change}
					value={data.message}
					autoFocus
					ref={Reference}
				/>
				{
					data.message.length ?
						<button
							className="bg-discord1 w-10 h-10 rounded-md flex
								justify-center items-center"
							type="submit"
						>
							<IconSend2 />
						</button> :
						<Link to={`/Game?opp=${data.talkingTo}`}>
							<button
								className="bg-discord1 w-10 h-10 rounded-md flex
									justify-center items-center"
								onClick={clickGame}
							>
								<IconPingPong/>
							</button>
						</Link>

				}
			</div>
		</form>
	) : <div></div>;
}
export default ChatPrivate;
