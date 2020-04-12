import React from 'react';
import { useHistory, NavLink } from 'react-router-dom';

const NavigationItem = (props) => {
	const history = useHistory();
	return (
		<li className='pl-6'>
			<button onClick={() => history.push(props.path)}>{props.children}</button>
		</li>
	);
};

export default NavigationItem;
