import React from 'react';
import styles from '../Styles/Button.module.css';

const Button = props => {
	return (
		<div className={styles.Button} id={props.id}>
			<button onClick={props.clicked}>{props.text}</button>
		</div>
	);
};

export default Button;
