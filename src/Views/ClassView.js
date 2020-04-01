import React, { useEffect, useContext, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import ClassToolbar from '../Components/ClassToolbar';
import VideoFrame from './VideoFrame';
import {
	createRoom,
	createToken,
	getRoom
} from '../Controllers/DailycoController';
import { AppStateContext } from '../App2';

const ClassView = props => {
	const [classUrl, setClassUrl] = useState();
	const [token, setToken] = useState();
	const { state, dispatch } = useContext(AppStateContext);

	useEffect(async () => {
		try {
			setupCallObject();
			const { url, token } = await createRoomAndToken();
			console.log('SET STATE VARS to t: ', token, ' url: ', url);
			setClassUrl(url);
			setToken(token);
		} catch (e) {
			console.log('Error in Class View initialization: ', e);
			window.location.reload();
		}
	}, []);

	// Setups up Daily.co call object and stores in state as "myCallFrame"
	const setupCallObject = () => {
		console.log('setup call obj');
		const callObj = DailyIframe.createCallObject({
			dailyConfig: {
				experimentalChromeVideoMuteLightOff: true
			}
		});
		dispatch({
			type: 'updateCallFrame',
			payload: callObj
		});
	};

	// Create the room url and add owner token for instructor
	async function createRoomAndToken() {
		console.log('Create Class URL w/ profile ', state.myProfile);
		console.log('Profile type is ', state.myProfile.type);

		try {
			let room;
			if (state.myProfile.type === 'INSTRUCTOR') {
				room = await createRoom({
					privacy: 'private',
					properties: {
						exp: Math.floor(Date.now() / 1000) + 100, // + secs
						max_participants: 11,
						eject_at_room_exp: true
					}
				});
				window.alert(`ROOM NAME: ${room.name}`);
			} else {
				// participants have room passed from /classes page as a prop

				const roomName = false; //props.roomName ? props.roomName : false;
				if (!roomName) {
					// Room name required, bounce them back to classes
					dispatch({
						type: 'updateInClass',
						payload: false
					});
					return;
				}
				room = await getRoom(roomName);
			}

			console.log('GOT ROOM as ', room);
			console.log(
				'CREATE token as owner? ',
				state.myProfile.type === 'INSTRUCTOR' ? true : false
			);
			const tokens = await createToken({
				room_name: room.name,
				is_owner: state.myProfile.type === 'INSTRUCTOR' ? true : false
			});
			console.log('got mtg token', tokens);
			console.log('Set URL as ', room.url);
			return { url: room.url, token: tokens.token };
		} catch (e) {
			console.log('url fetch failed - retrying in 2s: ', e);
			setTimeout(() => createRoomAndToken(), 2000);
		}
	}

	return (
		<div>
			<ClassToolbar />
			<VideoFrame
				url={classUrl}
				token={token}
				viewerType={state.myProfile.type}
			/>
		</div>
	);
};

export default ClassView;
