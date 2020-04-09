import React from 'react';
import icon from '../assets/favicon.png';

const ClassTile = (props) => {
	return (
		<div
			id={`class_tile_${props.id}`}
			className='w-48 h-48 m-4 shadow border border-gray-400 bg-white rounded text-center inline-block'
		>
			<div id='class-img' className='w-16 m-auto pt-4'>
				<img src={icon} alt=':)' />
			</div>
			<div id='class-name'>{`${props.instructor}'s Class`}</div>
			<div id='spots-left'>
				{`${
					props.totalSpots - Object.keys(props.participants).length
				} Spots Left`}
			</div>
			<button
				id='join-btn'
				className='p-3 bg-blue-400 text-white rounded'
				onClick={props.clicked}
			>
				Join!
			</button>
		</div>
	);
};

export default ClassTile;
