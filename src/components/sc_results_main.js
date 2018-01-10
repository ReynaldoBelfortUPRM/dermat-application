		/**********************
		     Results Screen
		***********************/
// Author: Reynaldo Belfort Pierrilus, Computer Engineering Undergraduate
// University of Puerto Rico - Mayagüez


//TODO Task list
		//Make sure download button gets removed when viewing original image

//Terminology:
//IPM - Image Processing Module
//IPA - Image Processing Algorithm

//Import necessary libraries and classes
import React, {Component} from 'react';
const ipc = window.require('electron').ipcRenderer;		//Electron functions for interaction with Main Process

//Import internal application components
import ImageView from './sc_results_image_view';
import VisualizationView from './sc_results_visualization';
import NavigationView from './sc_results_navigation';
import ImageMetricsView from './sc_results_image_metrics';

//Import styles
import styles from '../styles/sc-results-main.css';

//TODO Import debug tools
import debug from '../debug/debugTools.js';


//Define the Results screen
class ResultsScreen extends Component {
	constructor(props) {
		super(props)

		//Define screen's state for holding results data, along with metadata for funcitonality purposes
		this.state = {											  //TODO DOCUMENT THIS PROPERTIES
			currentImageIdx: 2,
			selectedLayerIdx: 0,
			rcmStackImageCount: props.outputData.FilePaths.length,
			currentImageSrc: props.inputData.FilePaths[0],
			isCharacterizedViewEnabled: false,
			ipmData: {
				originalImages: props.inputData.FilePaths,
				characterizedImages: props.outputData.FilePaths,
				layerData: props.outputData.LayersInfo,
			}
		}

		//Add 'Analysis' menu on app's menu bar
		ipc.send('add-analysis-menu');						//TODO Not sure if this belongs here
	}

	/****************************************
	   ReactJS component life cycle methods
	*****************************************/

	componentDidMount() {
    	//Send this 'ResultsScreen' object back to where it was called (App obj) so that 
		//functions on this object can be accessed from App.js
		this.props.onRef(this);
	}

	componentWillUnmount() {
		//Free memory space by removing the reference previously set
	    this.props.onRef(undefined);
	}

	/**********************************
	  NavigationView event handlers
	***********************************/

	//Change the current image that is being presented to the user according to the desired change direction
	changeImage(isUp){
		if(isUp){ //Up button was preessed
			if(this.state.currentImageIdx > 0){
				//Retrieve the new image index
				var newIndex = this.state.currentImageIdx - 1;
				//Get the  new RCM image according to the current image view state
				var newImageSrc = this.getNewCurrentImage(this.state.isCharacterizedViewEnabled, this.state.currentImageIdx);
				//Set new component state and re-render the DOM 
				this.setState({ currentImageIdx: newIndex, currentImageSrc: newImageSrc });
			}
		} else { //Down button was pressed
			if(this.state.currentImageIdx < this.state.ipmData.originalImages.length - 1){
				//Retrieve the new image index
				var newIndex = this.state.currentImageIdx + 1;
				//Get the  new RCM image according to the current image view state
				var newImageSrc = this.getNewCurrentImage(this.state.isCharacterizedViewEnabled, this.state.currentImageIdx);
				//Set new component state and re-render the DOM 
				this.setState({ currentImageIdx: newIndex, currentImageSrc: newImageSrc });
			}
		}
	}

	/**********************
	  Component Utilities
	***********************/
	
	//Get the corresponding image according to the new image view state
	getNewCurrentImage(imgViewState, imgIdx){
		var newImageSrc = null;
		if(imgViewState){ 														//The characterized version of the image shall be displayed
			var arrLength = this.state.ipmData.characterizedImages.length;
			if(arrLength - 1 <= imgIdx){ //TODO FOR DEBUG PURPOSES
				newImageSrc = this.state.ipmData.characterizedImages[arrLength - 1]; //Just always show the last characterized image
			} else {	//TODO This is the production code
				newImageSrc = this.state.ipmData.characterizedImages[imgIdx];																		
			}
		} else {																//The original version of the image shall be displayed
			newImageSrc = this.state.ipmData.originalImages[imgIdx];									
		}
		//Return the new image path
		return newImageSrc;
	}

	/**********************************
	  VisualizationView event handlers
	***********************************/

	//Re-render the screen according to the selected layer
	binClicked(layerIndex) {
		this.setState({ selectedLayerIdx: layerIndex });
	}

	//Re-render the screen according to the selected image
	imageClicked(imgIndex){
		var newImageSrc = this.getNewCurrentImage(this.state.isCharacterizedViewEnabled, imgIndex);		//Retrieve the new current image to be displayed on screen
		this.setState({ currentImageIdx: imgIndex, currentImageSrc: newImageSrc });						//Set new component state and re-render the DOM 
	}

	/********************************
	     ImageView event handlers
	********************************/
	
	//Start the file saving process
	saveCurrentImageClicked(){
		//Signal main process to open OS's file dialog
		ipc.send('open-save-dialog');
	}

	//Re-render the screen according to the images that was toggled
	toggleClicked(){
		console.log('DEBUG: Toggle signal received!!'); //TODO Debugging purposes
		var isCharacterizedView_newState = this.state.isCharacterizedViewEnabled ? false : true;  	//Establish the new view state of the image based on the current state. 
																									//Doing it this way avoids unexpected 
		var newImageSrc = this.getNewCurrentImage(isCharacterizedView_newState, this.state.currentImageIdx); 			//Retrieve the new current image to be displayed on screen
		this.setState({isCharacterizedViewEnabled: isCharacterizedView_newState, currentImageSrc: newImageSrc});		//Set new component state and re-render the DOM 
	}

	//Render the DOM elements to the screen
	render() {
		return (
			<div className={styles.results_mainContainer}>
				<div className={styles.containerOne} >
					<NavigationView btnNavClicked={ (isUp) => { this.changeImage(isUp); } } />
					<ImageView imageSrc= { this.state.currentImageSrc } isImageDownloadAllowed = { this.state.isCharacterizedViewEnabled } btnSaveClicked={ () => { this.saveCurrentImageClicked(); } } btnToggleClicked={ () => { this.toggleClicked();} }/>
					<VisualizationView currentState={ this.state } outputData={ this.props.outputData } binClicked={ (layerIndex) => { this.binClicked(layerIndex); } } imageClicked={ (imgIndex) => { this.imageClicked(imgIndex); } }/>
				</div>
				<div className={styles.containerTwo}>
					<ImageMetricsView currentImg = { this.state.currentImageIdx + 1} totalImages = { this.state.ipmData.originalImages.length }/>
				</div>
			</div>
		);
	}
}

export default ResultsScreen;