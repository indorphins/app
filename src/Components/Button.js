import React from 'react';

const Button = props => {
	let css = 'p-2 rounded-sm inline-block';
	if (!props.bgcolor) {
		css += ' bg-gray-300 text-black';
	} else {
		switch (props.bgcolor) {
			case 'teal':
				css += ' bg-teal-400 text-black';
				break;
			case 'red':
				css += ' bg-red-600 text-white';
				break;
			case 'blue':
				css += ' bg-blue-600 text-white';
				break;
			case 'green':
				css += ' bg-green-500 text-white';
			default:
				console.log('DEFAULT BG COLOR SET FOR BTN');
				css += ' bg-gray-300 text-black';
				break;
		}
	}

	return (
		<div className={css} id={props.id}>
			<button onClick={props.clicked}>{props.text}</button>
		</div>
	);
};

export default Button;
