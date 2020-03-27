import React, { useEffect, useState } from 'react';
import Button from './Components/Button';
import Toolbar from './Components/Toolbar';

import DailyIframe from '@daily-co/daily-js';
import { get } from 'https';

const createRoomEndpoint =
	'https://create-daily-chat-room.alexlindsay1.repl.co';

export const ClassesContext = createContext({
	classes: []
});

const App = () => {
	const [classes, setClasses] = useState([]); // class obj {url: 'url', instructor: 'name'}
	const [myCallUrl, setMyCallUrl] = useState('');
	let callFrame;

	useEffect(() => {
		console.log('MOUNT');
		if (window.location.hash) {
			setMyCallUrl(window.location.hash.substring(1));
			startCall(window.location.hash.substring(1));
		}
	}, []);

	const startClassButtonHandler = () => {
		startCall();
	};

	const startCall = startUrl => {
		console.log(
			'start Call w/ my url ',
			startUrl,
			' which is a ',
			typeof startUrl
		);

		if (!startUrl) {
			get(createRoomEndpoint, response => {
				console.log('fetched response', response);

				response.on('data', data => {
					const roomData = JSON.parse(data);
					const url = roomData.url;
					setMyCallUrl(url);
					setClasses([...classes, { url: url }]);
					console.log('Call url is ', url);

					if (!callFrame) {
						callFrame = DailyIframe.createFrame({
							url: url
						});
					}
					console.log('connecting to ', url);
					callFrame.join();
					window.location = '#' + url;
					const button = document.getElementById('start-class-btn');
					button.innerHTML = 'end call';
					button.onclick = () => {
						callFrame.leave();
						button.innerHTML = 'start call';
						button.onclick = startCall;
						// window.location.origin is this page's url
						// without the hash fragment
						window.location = window.location.origin;
					};
				});
			}).on('error', error => {
				console.log('error getting chat room url - ', error);
				console.log('fetch failed (retrying in 2s)');
				setTimeout(() => startCall(), 2000);
			});
		} else {
			if (!callFrame) {
				callFrame = DailyIframe.createFrame({
					url: startUrl
				});
				console.log('connecting to ', startUrl);
				callFrame.join();
				window.location = '#' + startUrl;
				const button = document.getElementById('start-class-btn');
				button.innerHTML = 'end call';
				button.onclick = () => {
					callFrame.leave();
					button.innerHTML = 'start call';
					button.onclick = startCall;
					// window.location.origin is this page's url
					// without the hash fragment
					window.location = window.location.origin;
				};
			}
		}
	};

	const joinCall = url => {};

	return (
		<div>
			<Toolbar text='Toolbar' menuClicked={() => console.log('menu clicked')} />
			<div>
				<p>Welcome to my page</p>
				<Button
					text='Start Class'
					id='start-class-btn'
					clicked={startClassButtonHandler}
				/>
				<Button text='Join Class' clicked={joinCall} />
			</div>
		</div>
	);
};

export default App;
