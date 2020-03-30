import React, { useEffect } from 'react';
import '../Styles/css-grid.css';
import DailyIframe from '@daily-co/daily-js';

const ClassView = props => {
	let callFrame, room, ownerLink, showNames;
	let url, token, isCurrentlyScreenSharing;

	console.log('Class View');

	useEffect(() => {
		async function loadPage() {
			if (props.viewerType.toLowerCase() === 'instructor') {
				await run();
			} else {
				// load as participant
			}
		}
		// Execute the created function directly
		loadPage();
	}, []);

	function showEvent(e) {
		console.log('video call event -->', e);
	}

	async function joinedCall(e) {
		console.log('joinedCall');
		showEvent(e);
		document.getElementById('leave-call-label').innerHTML = 'Leave call';
		document.getElementById('leave-call-div').onclick = () => callFrame.leave();
	}

	async function leftCall(e) {
		console.log('leftCall start');
		showEvent(e);
		document.getElementById('leave-call-label').innerHTML = 'Join call';
		document.getElementById('leave-call-div').onclick = () => callFrame.join();
	}

	async function updateEvent(e) {
		console.log('run start');
		showEvent(e);
		let ps = callFrame.participants();
		if (Object.keys(ps).length < 2) {
			document.getElementById('ui-local').style.display = 'none';
			document.getElementById('ui-alone').style.display = 'block';
			let wrapper = document.getElementById('ui-participant');
			wrapper.innerHTML = '';
		} else {
			document.getElementById('ui-local').style.display = 'none';
			document.getElementById('ui-alone').style.display = 'none';
			let wrapper = document.getElementById('ui-participant');
			wrapper.innerHTML = '';
			Object.keys(ps).forEach(p => {
				if (p === 'local') {
					return;
				}
				let participant = ps[p];
				let name = participant.user_name;
				wrapper.innerHTML += `
                <div class="ui-participant-guest">
                <p>{ ${name} || 'Guest'}</p>
                  <img src="icon-eject.svg" alt="Kick user out of meeting"
                        onclick="callFrame.updateParticipant({participant},{eject:true})" />
                </div>`;
			});
		}
		// update controller ui for joining/leaving the meeting and
		// for local screenshare start/stop
		if (ps.local) {
			if (ps.local.screen && !isCurrentlyScreenSharing) {
				isCurrentlyScreenSharing = true;
				document.getElementById('screenshare-label').innerHTML =
					'Stop sharing your screen';
			} else if (!ps.local.screen && isCurrentlyScreenSharing) {
				isCurrentlyScreenSharing = false;
				document.getElementById('screenshare-label').innerHTML =
					'Start a screen share';
			}
		}
	}

	const newRoomEndpoint =
			'https://fu6720epic.execute-api.us-west-2.amazonaws.com/default/dailyWwwApiDemoNewCall',
		tokenEndpoint =
			'https://dwdd5s2bp7.execute-api.us-west-2.amazonaws.com/default/dailyWWWApiDemoToken';

	async function createMtgRoom() {
		try {
			let response = await fetch(newRoomEndpoint),
				room = await response.json();
			return room;
		} catch (e) {
			console.error(e);
		}
	}

	async function createMtgLinkWithToken(room, properties = {}) {
		try {
			let response = await fetch(tokenEndpoint, {
				method: 'POST',
				body: JSON.stringify({
					properties: {
						room_name: room.name,
						...properties
					}
				})
			});
			let token = await response.text();
			return `${room.url}?t=${token}`;
		} catch (e) {
			console.error(e);
		}
	}

	async function run() {
		console.log('RUN start');
		// create a short-lived demo room and a join token with
		// is_owner set to true. if you just want to
		// hard-code a meeting link for testing you could do
		// something like this:
		//
		//   room = { url: 'https://your-domain.daily.co/hello' }
		//   ownerLink = room.url;
		//
		room = await createMtgRoom();
		ownerLink = await createMtgLinkWithToken(room, {
			is_owner: true
		});

		callFrame = window.DailyIframe.wrap(document.getElementById('call-frame'));
		callFrame
			.on('joining-meeting', showEvent)
			.on('joined-meeting', joinedCall)
			.on('left-meeting', leftCall)
			.on('participant-joined', updateEvent)
			.on('participant-updated', updateEvent)
			.on('participant-left', updateEvent)
			.on('recording-started', showEvent)
			.on('recording-stopped', showEvent)
			.on('recording-stats', showEvent)
			.on('recording-error', showEvent)
			.on('recording-upload-completed', showEvent)
			.on('error', showEvent);
		await callFrame.join({
			url: ownerLink,
			cssFile: 'css-grid.css'
		});

		console.log(
			' You are connected to',
			room.url,
			'\n',
			'Join from another tab or machine, or use the',
			'\n',
			'callFrame.addFakeParticipant() method to test',
			'\n',
			'this layout.'
		);
	}

	async function toggleScreenShare() {
		if (!isCurrentlyScreenSharing) {
			callFrame.startScreenShare();
		} else {
			callFrame.stopScreenShare();
		}
	}

	return (
		<div onLoad={run}>
			<div
				onClick={callFrame
					.join({ url })
					.then(ps => console.log('joined and have participants', ps))}
			>
				[ join mtg ]
			</div>
			<div onClick={console.log('PARTICIPANTS', callFrame.participants())}>
				[ get participants ]
			</div>
			{/* <!--
        <div>&nbsp;</div>
        <div onclick="callFrame.startRecording()">
        [ start recording ]
        </div>
        <div onclick="callFrame.stopRecording()">
        [ stop recording ]
        </div>
        --> */}

			<div onClick={callFrame.stopScreenShare()}>[ stop screen share ]</div>
			<div
				onClick={() => {
					showNames = !showNames;
					// callFrame.loadCss({ bodyClass: "." });
				}}
			>
				[ toggle names ]
			</div>

			<iframe id='call-frame' allow='camera; microphone; autoplay'></iframe>

			<div id='ui-container'>
				<div id='ui-local'>
					<p>Loading your video feed…</p>
				</div>
				<div id='ui-alone'></div>
				<div id='ui-controller'>
					<div
						onclick='callFrame.setLocalVideo(!callFrame.localVideo())'
						class='ui-controller-control'
					>
						<p>Toggle camera</p>
						<img
							src='../shared-assets/icon-camera.svg'
							alt='Toggle Camera On/Off'
						/>
					</div>
					<div
						onClick={callFrame.setLocalAudio(!callFrame.localAudio())}
						class='ui-controller-control'
					>
						<p>Toggle microphone</p>
						<img
							src='../shared-assets/icon-microphone.svg'
							alt='Toggle Microphone On/Off'
						/>
					</div>
					<div onClick={toggleScreenShare} class='ui-controller-control'>
						<p id='screenshare-label'>Start a screen share</p>
						<img
							src='../shared-assets/icon-screenshare.svg'
							alt='Screen share'
						/>
					</div>
					<hr />
					<div id='leave-call-div' class='ui-controller-control'>
						<p id='leave-call-label' style='color:#ff3b30'></p>
						<img src='../shared-assets/icon-leave.svg' alt='Leave call' />
					</div>
				</div>
				<div id='ui-participant'></div>
			</div>
		</div>
	);
};

export default ClassView;
