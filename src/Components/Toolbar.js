import React, { useContext } from 'react';
import styles from '../Styles/Toolbar.module.css';
import Menu from './Menu';
import Logo from './Logo';
import NavigationItems from './NavigationItems';

const Toolbar = (props) => {
	return (
		<div id='toolbar' className={styles.Toolbar}>
			<Menu clicked={props.menuClicked} />
			<div className={styles.Logo}>
				<Logo />
			</div>
			<div>
				<NavigationItems />
			</div>
		</div>
	);
};

export default Toolbar;
