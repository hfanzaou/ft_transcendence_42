import {
	IconCirclePlus,
	IconDotsVertical,
	IconLogin,
	IconLogout2,
	IconUsersGroup
} from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";
import { DATA, Group, NEWCHAT } from "../myTypes";
import { setUserData } from "../utils";

interface Props {
	data: DATA,
	setData: React.Dispatch<React.SetStateAction<DATA>>
	privateJoin: string
	setPrivateJoin: React.Dispatch<React.SetStateAction<string>>
}

const Groups: React.FC<Props> = ({ data, setData, privateJoin, setPrivateJoin }) => {
	const	[createXy, setCreateXy] = useState({
		x: 0,
		y: 0,
	})
	const	createXyRef = useRef(createXy);
	const	[create, setCreate] = useState(false);
	const	[password, setPassword] = useState(true);
	const	[createData, setCreateData] = useState({
		name: "",
		state: "",
		password: "",
		owner: data.userData?.userName
	});
	const	[passwordText, setPasswordText] = useState("");
	const	[validate, setValidate] = useState(true);
	const	[createTrigger, setCreateTrigger] = useState(false);
	const	[name, setName] = useState(true);
	const	[validateText, setValidateText] = useState("");
	const	[accessibility, setAccessibility] = useState(true);
	const	[size, setSize] = useState(window.innerWidth < 600 ? false : true);
	const	[list, setList] = useState(data.userData?.groups.filter(x => {
		return x.banded?.find(y => y == data.userData?.userName) == undefined;
	}).sort((x, y) => {
		if (x.time && y.time) {
			const	timeX = new Date(x.time);
			const	timeY = new Date(y.time);
			return timeY.getTime() - timeX.getTime();
		}
		return 0;
	}));
	const	[publicList, setPublicList] = useState<Group[]>([]);
	const	[searchText, setSearchText] = useState("");
	const	[settings, setSettings] = useState(false);
	const	[settingsXy, setSettingsXy] = useState({
		x: 0,
		y: 0,
		login: "",
		joined: false
	});
	const	nameRef = useRef(name);
	const	settingsXyRef = useRef(settingsXy);
	const	userNameRef = useRef(data.userData?.userName);

	userNameRef.current = data.userData?.userName;
	createXyRef.current = createXy;
	nameRef.current = name;
	settingsXyRef.current = settingsXy;
	useEffect(() => {
		if (privateJoin.length) {
			async function fetchData() {
				const	res = await fetch("/privateJoin", {
					method: "POST",
					headers: {
						"content-type": "application/json"
					},
					body: JSON.stringify({
						name: privateJoin,
						userName: userNameRef.current
					}),
					credentials: "include"
				});
				const	Data = await res.json();
				setList(Data);
				setPrivateJoin("");
			}
			if (userNameRef && userNameRef.current)
				fetchData();
		}
	}, [privateJoin])
	useEffect(() => {
		function callBackMouse(event: MouseEvent) {
			if (event.clientX < createXyRef.current.x ||
				event.clientX > createXyRef.current.x + 400 ||
				event.clientY < createXyRef.current.y ||
				event.clientY > createXyRef.current.y + 320) {
					setCreate(false);
					setPassword(true);
					setCreateData(x => ({
						...x,
						name: "",
						state: "",
						password: ""
					}));
					setPasswordText("");
					setValidate(true);
					setName(true);
					setValidateText("");
					setAccessibility(true);
				}
				if (event.clientX < settingsXyRef.current.x ||
					event.clientX > settingsXyRef.current.x + 100 ||
					event.clientY < settingsXyRef.current.y ||
					event.clientY > settingsXyRef.current.y + 100) {
						setSettings(false);
					}
			function callBackResize() {
				if (window.innerWidth < 600)
					setSize(false);
				else
					setSize(true);
			}
			document.addEventListener("mousedown", callBackMouse);
			window.addEventListener("resize", callBackResize);
			return () => {
				document.removeEventListener("mousedown", callBackMouse);
				window.removeEventListener("resize", callBackResize);
			}
		}
		document.addEventListener("mousedown", callBackMouse);
		return () => {
			document.removeEventListener("mousedown", callBackMouse);
		}
	}, [])
	useEffect(() => {
		setCreateData(x => ({
			...x,
			owner: data.userData?.userName
		}))
	}, [data.userData?.userName])
	useEffect(() => {
		if (createTrigger) {
			async function fetchData() {
				const	res = await fetch("/createGroup", {
					method: "POST",
					headers: {
						"content-type": "application/json"
					},
					body: JSON.stringify({
						data: createData
					}),
					credentials: "include"
				})
				const	Data = await res.json();
				if (Data) {
					setPasswordText("");
					setValidateText("");
					setCreate(false);
					setCreateData(x => ({
						...x,
						name: "",
						state: "",
						password: ""
					}));
					setData(x => ({
						...x,
						trigger: !x.trigger
					}))
				}
				setName(Data);
			}
			fetchData();
			setCreateTrigger(false);
		}
	}, [createTrigger])
	useEffect(() => {
		if (searchText == "")
			setList(data.userData?.groups.filter(x => {
				return x.banded?.find(y => y == data.userData?.userName) == undefined;
			}).sort((x, y) => {
				if (x.time && y.time) {
					const	timeX = new Date(x.time);
					const	timeY = new Date(y.time);
					return timeY.getTime() - timeX.getTime();
				}
				return 0;
			}));
	}, [data.userData?.groups])
	useEffect(() => {
		async function fetchData() {
			const	res = await fetch("/searchList", {
				method: "GET",
				headers: {
					"content-type": "application/json"
				},
				credentials: "include"
			});
			const	Data = await res.json();
			if (Data)
				setPublicList(Data);
		}
		fetchData();
	}, [settingsXy])
	useEffect(() => {
		setSearchText("");
		setList(data.userData?.groups.filter(x => {
			return x.banded?.find(y => y == data.userData?.userName) == undefined;
		}).sort((x, y) => {
			if (x.time && y.time) {
				const	timeX = new Date(x.time);
				const	timeY = new Date(y.time);
				return timeY.getTime() - timeX.getTime();
			}
			return 0;
		}));
	}, [data.send]);
	async function callBackNewGroup() {
		if (userNameRef && userNameRef.current) {
			const res0 = await fetch("/chatUser", {
				method: "POST",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userName: userNameRef.current
				}),
				credentials: "include"
			});
			const Data = await res0.json();
			if (Data)
				setData(prev => setUserData(prev, Data));
		}
	}
	useEffect(() => {
		setList(data.userData?.groups.filter(x => {
			return x.banded?.find(y => y == data.userData?.userName) == undefined;
		}).sort((x, y) => {
			if (x.time && y.time) {
				const	timeX = new Date(x.time);
				const	timeY = new Date(y.time);
				return timeY.getTime() - timeX.getTime();
			}
			return 0;
		}));
		data.socket?.on("newgroup", callBackNewGroup);
		return () => {
			data.socket?.off("newgroup", callBackNewGroup);
		}
	}, [data.userData?.groups]);
	function clickCreate(event: React.MouseEvent<HTMLButtonElement>) {
		setCreate(true);
		setCreateXy({ x: event.clientX, y: event.clientY})
	}
	function clickPrivatePublic(event: React.MouseEvent<HTMLButtonElement>) {
		const tmp = event.currentTarget.name;
		setCreateData(x => ({
			...x,
			state: tmp
		}))
		setAccessibility(true);
	}
	function submitCreate(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (password &&
			validate &&
			createData.name.length &&
			createData.state.length) {
			setCreateTrigger(true);
		}
		else if (!createData.name.length)
			setName(false);
		else if (!createData.state.length)
			setAccessibility(false);
	}
	function changeCreate(event: React.ChangeEvent<HTMLInputElement>) {
		setName(true);
		setCreateData(x => ({
			...x,
			name: event.target.value,
		}))
	}
	function changePassword(event: React.ChangeEvent<HTMLInputElement>) {
		if (event.target.value.length == 0)
			setPassword(true);
		else if (event.target.value.length < 6)
			setPassword(false);
		else
			setPassword(true);
		setPasswordText(event.target.value);
		if (validateText.length) {
			if (validateText != event.target.value)
				setValidate(false);
			else
				setValidate(true);
		}
	}
	function changeValidate(event: React.ChangeEvent<HTMLInputElement>) {
		if (passwordText == event.target.value) {
			setValidate(true);
			setCreateData(x => ({
				...x,
				password: event.target.value
			}));
		}
		else
			setValidate(false);
		setValidateText(event.target.value)
	}
	function changeSearch(event: React.ChangeEvent<HTMLInputElement>) {
		let	List: Group[] | undefined;

		setSearchText(event.target.value);
		if (event.target.value == "")
			List = data.userData?.groups;
		else if (data.userData) {
			List = [...data.userData?.groups, ...publicList].
				filter((value, index, self) => {
					for (let i = index + 1; i < self.length; i++)
						if (value.id == self[i].id)
							return false;
					return true;
				}).filter(x => x.name.includes(event.target.value));
		}
		setList(List?.filter(x => {
			return x.banded?.find(y => y == data.userData?.userName) == undefined;
		}).sort((x, y) => {
			if (x.time && y.time) {
				const	timeX = new Date(x.time);
				const	timeY = new Date(y.time);
				return timeY.getTime() - timeX.getTime();
			}
			return 0;
		}));
		if (List && !List.find(x => x.name == data.groupTo))
			setData(prev => ({
				...prev,
				groupTo: undefined
			}));
	}
	function clickGroup(event: React.MouseEvent<HTMLButtonElement>) {
		const tmp = event.currentTarget.name;

		setData(prev => ({
			...prev,
			groupTo: tmp,
			password: list?.find(x => x.name == tmp)?.password
		}))
		if (data.userData?.groups.find(x => x.name == tmp)) {
			const	newChat: NEWCHAT = {
				sender: data.userData ? data.userData.userName : "",
				recver: tmp
			}
			data.socket?.emit("newChatRoom", newChat);
			setData(prev => {
				if (prev.userData)
					return {
						...prev,
						userData: {
							...prev.userData,
							groups: [...prev.userData.groups].map(x => {
								if (x.name == tmp)
									return {
										...x,
										unRead: 0
									}
								return x;
							})
						}
					}
				return prev;
			});
		}
	}
	async function checkGroup(name: string) {
		if (userNameRef && userNameRef.current) {
			const	res = await fetch("/checkGroup", {
					method: "POST",
					headers: {
						"content-type": "application/json"
					},
					body: JSON.stringify({
						name: name,
						userName: userNameRef.current
					}),
					credentials: "include"
				});
			const	Data = await res.json();
			return Data;
		}
		return false;
	}
	async function clickSettings(event: React.MouseEvent<HTMLButtonElement>) {
		const	x = event.clientX;
		const	y = event.clientY;
		const	login = event.currentTarget.name;

		if (await checkGroup(login)) {
			setSettings(true);
			setSettingsXy(() => {
				if (data.userData?.groups.find(x => x.name == login))
					return {
						joined: true,
						x: x,
						y: y,
						login: login
					}
				else
					return {
						joined: false,
						x: x,
						y: y,
						login: login
					}
			});
		}
	}
	async function leaveJoin() {
		if (data.userData?.userName) {
			const	res = await fetch("/leaveJoin", {
				method: "POST",
				headers: {
					"content-type": "application/json"
				},
				body: JSON.stringify({
					userName: data.userData?.userName,
					name: settingsXy.login
				}),
				credentials: "include"
			});
			const	Data = await res.json();
			setData(x => {
				if (x.userData)
					return {
						...x,
						userData: {
							...x.userData,
							groups: Data
						}
					}
				return x;
			});
			setSettings(false);
			if (data.groupTo == settingsXy.login)
				setData(x => ({ ...x, groupTo: undefined }));
		}
	}
	return (
		<div className="bg-discord3 w-2/6 text-center p-2 text-white
			font-Inconsolata font-bold h-full overflow-auto
			min-w-[100px] rounded-s-3xl"
		>
			<div className="w-full flex">
				<button
					className="bg-discord1 rounded-l-full h-10 w-10 flex
						justify-center items-center hover:bg-discord2"
					onClick={clickCreate}
				>
					<IconCirclePlus />
				</button>
				<input
					type="text"
					placeholder="search..."
					className="w-full font-thin bg-discord1
						h-10 p-5 outline-none rounded-r-full mb-3"
					onChange={changeSearch}
					value={searchText}
				/>
				{
					create &&
						<form
							className="fixed z-50 font-thin w-[400px] bg-discord1 p-5
								rounded-md"
							style={{ top: createXy.y, left: createXy.x}}
							onSubmit={submitCreate}
						>
							{
								!name && (createData.name.length ?
									<h6 className="text-red-400">
										this name is already taken
									</h6> :
									<h6 className="text-red-400">
										you need a group name
									</h6>)
							}
							<input
								type="text"
								placeholder="group name..."
								className={`outline-none border-none bg-discord3
									h-10 p-5 rounded-full w-full mb-5
									${!name && "outline-red-500"}`}
								onChange={changeCreate}
								value={createData.name}
							/>
							{
								!accessibility &&
									<h6 className="text-red-400">
										you need to spicify the group accessibility
									</h6>
							}
							<div className="flex h-10 mb-5">
								<button
									type="button"
									onClick={clickPrivatePublic}
									name="Private"
									className={`bg-discord3 w-full mr-2
										rounded-md
										${createData.state == "Private" ?
											"bg-discord5" :
											"hover:bg-discord4"}`}
								>
									Private
								</button>
								<button
									type="button"
									onClick={clickPrivatePublic}
									name="Public"
									className={`bg-discord3 w-full ml-2
										rounded-md
										${createData.state == "Public" ?
											"bg-discord5" :
											"hover:bg-discord4"}`}
								>
									Public
								</button>
							</div>
							{
								!password &&
									<h6 className="text-red-400">
										the password should have:
											at least 6 characters
									</h6>
							}
							<input
								type="password"
								placeholder="password...or leave it empty for no password"
								className={`outline-none border-none bg-discord3
									h-10 p-5 rounded-full w-full mb-5
									${!password && "outline-red-500"}`}
								onChange={changePassword}
								value={passwordText}
							/>
							<input
								type="password"
								placeholder="confirm password"
								className={`outline-none border-none bg-discord3
									h-10 p-5 rounded-full w-full mb-5
									${!validate && "outline-red-500"}`}
								onChange={changeValidate}
								value={validateText}
							/>
							<button className="bg-discord3 w-full rounded-md h-10
								hover:bg-discord4"
							>
								create
							</button>
						</form>
				}
			</div>
			<ul>
				{
					list?.map(x => {
						return (
							<li key={x.id} className="flex relative group">
								<button
									onClick={clickGroup}
									name={x.name}
									className={`w-full px-7 py-3 rounded-md
									select-none ${data.groupTo == x.name
										? "bg-discord5"
										: "hover:bg-discord4"}
										flex justify-center items-center`}
								>
									<div className="relative">
										<IconUsersGroup
											className={`w-10 h-10 mr-3
												rounded-full bg-discord1
												${
													data.groupTo == x.name &&
														"shadow-black shadow-lg"
												}`}
										/>
										{
											x.name != data.groupTo &&
											x.unRead != 0 &&
											<div
												className="absolute rounded-full
													z-10 border-4 bg-red-500
													text-xs px-1 right-1 -bottom-2
													border-discord3
													group-hover:border-discord4"
											>
												{
													x.unRead && (
														x.unRead < 100 ?
															x.unRead :
															"+99"
													)
												}
											</div>
										}
									</div>
									{size && x.name}
								</button>
								<button
									className="absolute top-5 right-0 w-10 flex
										justify-center"
									onClick={clickSettings}
									name={x.name}
								>
									<IconDotsVertical/ >
								</button>
							</li>);
					})
				}
			</ul>
			{
				settings && <ul
					className={`fixed border-none
						bg-discord1 rounded-md z-10`}
					style={{
						top: settingsXy.y,
						left: settingsXy.x
					}}
				>
					<li>
						<button
							className=" w-[100px] h-[50px] rounded-t-md
								hover:bg-discord3"
							onClick={leaveJoin}
						>
							{
								settingsXy.joined ? 
									<div className="flex justify-center items-center">
										<IconLogout2 />
										<h2 className="mt-1">Leave</h2>
									</div> :
									<div className="flex justify-center items-center">
										<IconLogin />
										<h2 className="mt-1">Join</h2>
									</div>
							}
						</button>
					</li>
				</ul>
			}
		</div>
	)
}

export default Groups;
