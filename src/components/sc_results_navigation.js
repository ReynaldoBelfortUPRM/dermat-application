/*****************************************
	Results Screen: ImageView component
******************************************/

// Functional component that defines the navigation buttons used to navigate
// between the stack of images

// Author: Reynaldo Belfort Pierrilus, Computer Engineering Undergraduate
// University of Puerto Rico - Mayagüez

//Import the necessart libraries and classes
import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';

//Import styles
import styles from '../styles/sc-results-main.css';

//Define the NavigationView component
const NavigationView = (props) => {

	//Return DOM elements to be displayed on screen
	return (
		<div className={[styles.resultsWindow, styles.navigationView].join(' ')}>
			<div className={styles.buttonContainer}>
				<Button className={styles.buttonNav} onClick={ () => { props.btnNavClicked(true) } } ><Glyphicon glyph="menu-up" /></Button>
				<Button className={styles.buttonNav} onClick={ () => { props.btnNavClicked(false) } }><Glyphicon glyph="menu-down" /></Button>
			</div>
		</div>
	);
}

export default NavigationView;