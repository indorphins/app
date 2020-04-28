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
import DailyClass from '../Classes/DailyClass';
import { useHistory } from 'react-router-dom';
import { storeInSession, getFromSession } from '../Helpers/sessionHelper';

const ClassView = (props) => {
	const [loaded, setLoaded] = useState(false);
	const { state, dispatch } = useContext(AppStateContext);

	useEffect(() => {
		// load call frame object on mount
		console.log('setup call obj use effect');
		setupCallObject();
	}, []);

	useEffect(async () => {
		return createRoomAndToken()
			.then(({ url, token }) => {
				if (!url || !token) {
					throw Error('missing token or url');
				}
				setLoaded(true);
			})
			.catch((e) => {
				console.log('Error in Class View initialization: ', e);
				console.log('Have state profile ', state.myProfile);
				window.alert('Error joining class');

				if (state.myProfile.type === 'instructor') {
					window.location.pathname = `/instructor`;
				} else {
					window.location.pathname = `/classes`;
				}
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
		const dailyClass = getFromSession('dailyClass');
		const currentClass = getFromSession('currentClass');

		// If no daily class set up yet or if mismatching daily and current class, fetch room and tokens
		if (
			!dailyClass ||
			!currentClass ||
			(currentClass &&
				dailyClass &&
				dailyClass.name !== currentClass.chat_room_name)
		) {
			if (state.myProfile.type === 'instructor') {
				return createRoom({
					privacy: 'private',
					properties: {
						exp:
							Math.floor(Date.now() / 1000) +
							parseInt(process.env.REACT_APP_DEFAULT_CLASS_DURATION),
						max_participants: process.env.REACT_APP_DEFAULT_CLASS_SIZE,
						eject_at_room_exp: true,
					},
				})
					.then((room) => {
						// window.alert(`ROOM CODE: ${room.name}`);
						return createToken({
							properties: {
								room_name: room.name,
								start_audio_off: false,
								is_owner: true,
								user_name: state.myProfile.firstName
									? state.myProfile.firstName
									: '',
							},
						}).then((tokens) => {
							// Create Class in backend as instructor type
							return createClass(
								'active',
								state.myProfile.firstName,
								room.name,
								process.env.REACT_APP_DEFAULT_CLASS_SIZE,
								1,
								state.myProfile.id,
								Math.round(process.env.REACT_APP_DEFAULT_CLASS_DURATION / 60)
							).then((response) => {
								if (response.success) {
									storeInSession(
										'dailyClass',
										new DailyClass(room.url, tokens.token, room.name)
									);
									storeInSession('currentClass', response.class);

									return { url: room.url, token: tokens.token };
								} else {
									throw response.error;
								}
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
				// participants have current class from /classes page

				if (!currentClass.chat_room_name) {
					// Room name required, bounce them back to classes
					storeInSession('inClass', false);
					return;
				}
				// TODO join class, update as participant in class
				return getRoom(currentClass.chat_room_name)
					.then((room) => {
						if (!room.name || !room.url) {
							throw Error('room returned empty data');
						}
						return createToken({
							properties: {
								room_name: room.name,
								is_owner: false,
								start_audio_off: true,
								user_name: state.myProfile.firstName
									? state.myProfile.firstName
									: '',
							},
						}).then((tokens) => {
							storeInSession(
								'dailyClass',
								new DailyClass(room.url, tokens.token, room.name)
							);
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
		} else {
			return { url: dailyClass.url, token: dailyClass.token };
		}
	}

	return (
		<div>
			{/* <ClassToolbar /> */}
			<VideoFrame callFrame={state.myCallFrame} loaded={loaded} />
		</div>
	);
};

export default ClassView;
