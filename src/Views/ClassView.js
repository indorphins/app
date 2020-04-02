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
		setupCallObject();
		return createRoomAndToken()
			.then(({ url, token }) => {
				console.log('SET STATE VARS to t: ', token, ' url: ', url);
				if (!url || !token) {
					throw Error('missing token or url');
				}
				setClassUrl(url);
				setToken(token);
			})
			.catch(e => {
				console.log('Error in Class View initialization: ', e);
				window.location.reload();
			});
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
		console.log('*Create Class URL w/ profile ', state.myProfile);
		console.log('**Profile type is ', state.myProfile.type);

		let room;
		if (state.myProfile.type === 'INSTRUCTOR') {
			return createRoom({
				privacy: 'private',
				properties: {
					exp: Math.floor(Date.now() / 1000) + 100, // + secs
					max_participants: 11,
					eject_at_room_exp: true
				}
			}).then(room => {
				window.alert(`ROOM NAME: ${room.name}`);
				console.log('ROOM is ', room);
				return createToken({
					properties: {
						room_name: room.name,
						is_owner: state.myProfile.type === 'INSTRUCTOR' ? true : false
					}
				}).then(tokens => {
					console.log('got mtg token', tokens);
					console.log('Set URL as ', room.url);
					return { url: room.url, token: tokens.token };
				});
			});
		} else {
			// participants have room passed from /classes page as a prop
			const roomName = props.roomName ? props.roomName : false;
			if (!roomName) {
				// Room name required, bounce them back to classes
				dispatch({
					type: 'updateInClass',
					payload: false
				});
				return;
			}
			return getRoom(roomName).then(room => {
				console.log('got room as participant', room);
				return createToken({
					properties: {
						room_name: room.name,
						is_owner: state.myProfile.type === 'INSTRUCTOR' ? true : false
					}
				}).then(tokens => {
					console.log('got mtg token', tokens);
					console.log('Set URL as ', room.url);
					return { url: room.url, token: tokens.token };
				});
			});
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
