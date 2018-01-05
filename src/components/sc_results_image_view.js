/*****************************************
	Results Screen: ImageView component
******************************************/
//Functional component that defines the space where the image will be displayed along with the toggle and save buttons

// Author: Reynaldo Belfort Pierrilus, Computer Engineering Undergraduate
// University of Puerto Rico - Mayagüez

//Terminology:
//IPM - Image Processing Module
//IPA - Image Processing Algorithm

//Import the necessart libraries and classes
import React, {Component} from 'react';
import { Image, Button, Glyphicon } from 'react-bootstrap';

//Import styles
import styles from '../styles/sc-results-main.css';

//TODO Import debug tools
import debug from '../debug/debugTools.js';

const ImageView = (props) => {

	//Determine if the download/save button shall be displayed on screen depending on the image view state
	var downloadButton = props.isImageDownloadAllowed ? <Button className={[styles.buttonDownload].join(' ')} onClick={ () => { props.btnSaveClicked()} }><Glyphicon glyph="download" /></Button> : null;
	
	//Render the DOM elements to the screen. The <img> DOM element is where the RCM image will be shown.
	return (
		<div className={[styles.resultsWindow, styles.imageView].join(' ')}>
				<img className = {styles.imageElement} src={ props.imageSrc }/>	
				<Button className={[styles.buttonSwitch].join(' ')} onClick={ () => { props.btnToggleClicked()} }><Glyphicon glyph="refresh" /></Button>
				{downloadButton}
			</div>
		);
};

export default ImageView;