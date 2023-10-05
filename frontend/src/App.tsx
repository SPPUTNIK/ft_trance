import { useContext, lazy, Suspense, useEffect, useState } from "react";
import Login from "./auth/Login";
import { Route, Routes, useNavigate } from "react-router-dom";

import { UserContext } from "./auth/userContext";
import { currentUserType } from "./auth/userContext";

// import { Dashboard } from "./Components/Dashboard/Dashboard";
// const Dashboard = lazy(() =>
//   import('./Components/Dashboard/Dashboard')
//     .then(({ Dashboard }) => ({ default: Dashboard })),
// );

// const  = lazy(() =>
//   import('')
//     .then(({  }) => ({ defaultSuspense:  })),
// );

// const ChatList = lazy(() =>
//   import('./Components/Chat/Chat')
//     .then(({ ChatList }) => ({ default: ChatList })),
// );
// const ChatConversation = lazy(() =>
//   import('./Components/Chat/Chat')
//     .then(({ ChatList }) => ({ default: ChatList })),
// );
// const NewChat = lazy(() =>
//   import('./Components/Chat/Chat')
//     .then(({ ChatList }) => ({ default: ChatList })),
// );

import { NotFound } from "./Components/ErrorPages/404/404";
import { MyProfile, ProfileFriend } from "./Components/Profile/Profile";
import { Users } from "./Components/Users/Users";
import { Friends } from "./Components/Friends/Friends";
import { History } from "./Components/Profile/History";
import { ListBlock } from "./Components/Profile/ListBlock";
import { Setting } from "./Components/Setting/Setting";
import { LandingPage } from "./LandingPage/LandingPage";

import { AddMemberGruop, CreatGroup, GroupSettingGruop, JoinGruop } from "./Components/Chat/Groups";
import { VerificationTwoFactor } from "./auth/TwoFactor/TwoFactor";
import { StartGame } from "./game/Game";
import webSocket from "./auth/Socket/Socket";
import AppSidebar from "./Components/Sidebar/AppSidebar";
import AppHeader from "./Components/Sidebar/AppHeader";
import Stream from "./game/Stream/Stream";
import { ChatConversation, ChatList, NewChat } from "./Components/Chat/Chat";
import { Dashboard } from "./Components/Dashboard/Dashboard";


// const Dashboard = lazy(() =>
//   import('./Components/Dashboard/Dashboard')
//     .then(({ Dashboard }) => ({ default: Dashboard })),
// );

// const StartGame = lazy(() =>
// 	import("./game/Game").then(
// 		({StartGame}) => ({default: StartGame}),
// 	));

// export function lazyLoad(path: string, nameExp: string)
// {
// 	return (lazy(() => {
// 		const p = import(path)
// 		if (nameExp == null){
// 			return p;
// 		}else{
// 			return p.then(module => ({default: module[nameExp]}))
// 		}
// 	}))
// }

// lazyLoad("./Components/Users/Users", "Users")


function App() {
	const navigate = useNavigate();
	const { currentUser } = useContext(UserContext) as currentUserType;
	const [reload, setReload] = useState(false)
	if (currentUser && currentUser.signup) {

		const socket = webSocket.connect();
		socket?.off(`accept-game`).on(`accept-game`, () => {
			// console.log('game accepted', document.location.pathname);
			navigate('/game');
			setReload(!reload);
			// navigate(0);
		});
		socket?.off('chat-update').on('chat-update', (args: any) => {
			// console.log('accept - 1', args);
			setReload(!reload);
		  })
	}
	useEffect(()=>{
		// console.log('updatee --------------')
	},[reload])
	if (!currentUser) {
		return <>
			<div className="d-flex w-100 clm-center row-center vh-75">
				<h1>loading page</h1>
			</div>
		</>
	}
	else if (currentUser.message === 'twoFactor') {
		return <VerificationTwoFactor />
	}
	else if (currentUser.signup) {
		return (
			<div className="root-app user-app">
				<AppSidebar />
				<AppHeader />
				<main className="app-content">
					{/* <Suspense fallback={<h1>Loading...</h1>}> */}
						<Routes>
							<Route path="/chat" element={<ChatList reload={reload}/>} >
								<Route path="/chat/" element={<NewChat />} />
								<Route path="/chat/users" element={<ChatList isGroup={false} reload={reload}/>} />
								<Route path="/chat/groups/:userId" element={<ChatConversation isGroup={true} reload={reload} /> } />
								<Route path="/chat/users/:userId" element={<ChatConversation isGroup={false} reload={reload} /> } />
								<Route path="/chat/creatgroup" element={<CreatGroup />} />
								<Route path="/chat/joingoup" element={<JoinGruop reload={reload}/>} />
								<Route path="/chat/group/addmember/:id" element={<AddMemberGruop reload={reload}/>} />
								<Route path="/chat/group/setting/:id" element={<GroupSettingGruop reload={reload}/>} />

							</Route>
							<Route path="/" element={<Dashboard />} />
							<Route path="/profile" element={<MyProfile />} >
								<Route path="/profile/friends/:friendId" element={<Friends />} />
								<Route path="/profile/History" element={<History />} />
								<Route path="/profile/listBlocked" element={<ListBlock />} />
							</Route>
							<Route path="/game" element={<StartGame reload={reload}/>} />
							<Route path="/users" element={<Users />} />
							<Route path="/stream" element={<Stream />} />
							<Route path="/userProfile/:friendId" element={<ProfileFriend />} />
							<Route path="/setting" element={<Setting />} />
							<Route path="*" element={<NotFound />} />
						</Routes>
					{/* </Suspense> */}
				</main>

			</div>
		)
	}
	else if (currentUser && currentUser.signup === false) {
		return (
			<div className="root-app">
				<Routes>
					{/* <Route path="/" element={<LandingPage />} /> */}
					{/* <Route path="/check" element={<CheckingSocket />} /> */}
					<Route path="*" element={<Setting />} />
				</Routes>
			</div>
		)
	}
	else {
		return (
			<div className="root-app">
				<Routes>
					<Route path="/" element={<LandingPage />} />
					{/* <Route path="/check" element={<CheckingSocket />} /> */}
					{/* <Route path="/Dashboard" element={<Dashboard />} /> */}
					<Route path="/login" element={<Login />} />
					<Route path="*" element={<Login />} />
				</Routes>
			</div>
		)
	}
}

export default App;

