import React from 'react';
import styles from '../Styles/Menu.module.css';

const Menu = (props) => {
    return (
        <div className={styles.Menu} onClick={props.clicked}>
            <div/>
            <div/>
            <div/>
        </div>
    )
};

export default Menu;