import React from 'react';
import styles from '../Styles/Toolbar.module.css';
// import NavigationItems from '../NavigationItems/NavigationItems';
import Menu from './Menu';
import Logo from './Logo';

const Toolbar = (props) => (
	<header id='toolbar' className={styles.Toolbar}>
		<Menu clicked={props.menuClicked} />
		<div className={styles.Logo}>
			<Logo />
		</div>
		<nav className={styles.DesktopOnly}>{/* <NavigationItems /> */}</nav>
	</header>
);

export default Toolbar;
