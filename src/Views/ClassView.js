import React, { useEffect, useContext, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import ClassToolbar from '../Components/ClassToolbar';
import VideoFrame from './VideoFrame';
import {
	createRoom,
	createToken,
	getRoom,
} from '../Controllers/DailycoController.js';
import { createClass } from '../Controllers/ClassesController';
import { AppStateContext } from '../App';

const ClassView = (props) => {
	const [classUrl, setClassUrl] = useState();
	const [token, setToken] = useState();
	const { state, dispatch } = useContext(AppStateContext);

	useEffect(async () => {
		setupCallObject();
		return createRoomAndToken()
			.then(({ url, token }) => {
				if (!url || !token) {
					throw Error('missing token or url');
				}
				setClassUrl(url);
				setToken(token);
			})
			.catch((e) => {
				console.log('Error in Class View initialization: ', e);
				window.location.reload();
			});
	}, []);

	// Setups up Daily.co call object and stores in state as "myCallFrame"
	const setupCallObject = () => {
		const callObj = DailyIframe.createCallObject({
			dailyConfig: {
				experimentalChromeVideoMuteLightOff: true,
			},
		});
		dispatch({
			type: 'updateCallFrame',
			payload: callObj,
		});
	};

	// Create the room url and add owner token for instructor
	async function createRoomAndToken() {
		console.log(
			'Class View - create room and token start w/ profile type: ',
			state.myProfile
		);
		console.log('state myprofile type is ', state.myProfile.type);
		if (state.myProfile.type === 'instructor') {
			console.log('instructor flow - create room fxn: ', createRoom);
			return createRoom({
				privacy: 'private',
				properties: {
					exp: Math.floor(Date.now() / 1000) + 4200, // 70 mins
					max_participants: 11, // 10 participants + 1 instructor
					eject_at_room_exp: true,
				},
			})
				.then((room) => {
					window.alert(`ROOM CODE: ${room.name}`);
					return createToken({
						properties: {
							room_name: room.name,
							start_audio_off: false,
							is_owner: true,
						},
					}).then((tokens) => {
						// Create Class in backend
						return createClass(
							'active',
							state.myProfile.name,
							room.name,
							11
						).then((response) => {
							console.log('Created class on backend reponse ', response);
							return { url: room.url, token: tokens.token };
						});
					});
				})
				.catch((error) => {
					console.log(
						'ClassView - createRoomAndToken Instructor flow - error: ',
						error
					);
				});
		} else {
			// participants have room passed from /classes page as a prop
			const roomName = props.roomName ? props.roomName : false;
			if (!roomName) {
				// Room name required, bounce them back to classes
				dispatch({
					type: 'updateInClass',
					payload: false,
				});
				return;
			}
			console.log('Participant flow - get room ');
			return getRoom(roomName)
				.then((room) => {
					return createToken({
						properties: {
							room_name: room.name,
							is_owner: false,
							start_audio_off: true,
						},
					}).then((tokens) => {
						return { url: room.url, token: tokens.token };
					});
				})
				.catch((error) => {
					console.log(
						'ClassView - createRoomAndToken Participant flow - error: ',
						error
					);
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
