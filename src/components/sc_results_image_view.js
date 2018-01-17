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
import { Image, Button, Glyphicon, Tooltip, OverlayTrigger } from 'react-bootstrap';
import ReactTooltip from 'react-tooltip';

//Import styles
import styles from '../styles/sc-results-main.css';

const ImageView = (props) => {

	//Set up tooltip messages
	const tooltipToggle = (
		<Tooltip id="tooltip-toggle">
			Show/hide characterized image
		</Tooltip>
	);

	const tooltipSave = (
		<Tooltip id="tooltip-save">
			Save characterized image
		</Tooltip>
	);

	//Determine if the save button shall be displayed on screen depending on the image view state
	var toggleButton = props.isCharacterizedView ? (<OverlayTrigger placement="right" overlay={tooltipToggle}><Button className={[styles.buttonSwitch].join(' ')} onClick={ () => { props.btnToggleClicked()} } active>MAP</Button></OverlayTrigger>) : (<OverlayTrigger placement="right" overlay={tooltipToggle}><Button className={[styles.buttonSwitch].join(' ')} onClick={ () => { props.btnToggleClicked()} }>MAP</Button></OverlayTrigger>);	
	var saveButton = props.isImageDownloadAllowed ? (<OverlayTrigger placement="bottom" overlay={tooltipSave}><Button className={[styles.buttonDownload].join(' ')} onClick={ () => { props.btnSaveClicked()} }><Glyphicon glyph="floppy-disk" /></Button></OverlayTrigger>) : null;

	//Render the DOM elements to the screen. The <img> DOM element is where the RCM image will be shown.
	return (
		<div className={[styles.resultsWindow, styles.imageView].join(' ')}>
				<img className = {styles.imageElement} src={ props.imageSrc }/>	
				{toggleButton}
				{saveButton}
		</div>
		);
};

export default ImageView;