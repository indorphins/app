import React from 'react';
import NavigationItem from './NavItem';

const NavigationItems = (props) => {
	return (
		<ul>
			<NavigationItem path='/classes'>Classes</NavigationItem>
			<NavigationItem path='/profile'>My Profile</NavigationItem>
		</ul>
	);
};

export default NavigationItems;
