import React, { useState } from 'react';
import Toolbar from '../Components/Toolbar';
import Button from '../Components/Button';
import { useHistory } from 'react-router-dom';

const Landing = props => {
	const history = useHistory();
	const [name, setName] = useState('');
	const [nameSubmitted, setNameSubmitted] = useState(false);

	const instructorBtnHandler = () => {
		history.push(`/instructor#${name}`);
	};

	const participantBtnHandler = () => {
		history.push(`/classes#${name}`);
	};

	const nameSubmitBtnHandler = () => {
		const inputName = document.getElementById('name-input').value;
		setName(inputName);
		setNameSubmitted(true);
	};

	return (
		<div>
			<Toolbar text='Toolbar' menuClicked={() => console.log('menu clicked')} />
			<div>
				<div id='landing-text-container' className='text-center'>
					<h1>Ready to Workout?</h1>

					{nameSubmitted ? (
						<h2>Click one of the buttons below to begin</h2>
					) : (
						<h2>Start by giving your name!</h2>
					)}
				</div>
				{nameSubmitted ? (
					<div id='body-container' className='grid grid-cols-2 '>
						<div id='landing-participant-container' className='col-span-1'>
							<Button
								text='Participant'
								id='participant-btn'
								clicked={participantBtnHandler}
							/>
						</div>
						<div id='landing-instructor-container' className='col-span-1'>
							<Button
								text='Instructor'
								id='instructor-btn'
								clicked={instructorBtnHandler}
							/>
						</div>
					</div>
				) : (
					<div id='name-container' className='text-center'>
						<input
							type='text'
							placeholder='Type your name here...'
							id='name-input'
							className='border-gray-400 border-solid border'
						/>
						<Button
							text='Submit'
							clicked={nameSubmitBtnHandler}
							id='name-submit-btn'
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default Landing;
