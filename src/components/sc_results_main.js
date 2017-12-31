		/**********************
		     Results Screen
		***********************/
// Author: Reynaldo Belfort Pierrilus, Computer Engineering Undergraduate
// University of Puerto Rico - Mayagüez

//Terminology:
//IPM - Image Processing Module
//IPA - Image Processing Algorithm

//Import necessary libraries and classes
import React, {Component} from 'react';

//Import internal application components
import ImageView from './sc_results_image_view';
import VisualizationView from './sc_results_visualization';
import NavigationView from './sc_results_navigation';
import ImageMetricsView from './sc_results_image_metrics';

//Import styles
import styles from '../styles/sc-results-main.css';

//TODO Import debug tools
import debug from '../debug/debugTools.js';

//Import Electron functions for interaction with Main Process
const ipc = window.require('electron').ipcRenderer;

//Define the Results screen
class ResultsScreen extends Component {
	constructor(props) {
		super(props)

		//Define screen's state for holding results data, along with metadata for funcitonality purposes
		// this.state = {							//TODO Code to be removed
		// 	currentImageIndex: 0,
		// 	selectedLayerIndex: 0,
		// 	totalImages: props.analysisData.FilePaths.length,
		// 	currentImage: props.analysisData.FilePaths[0],
		// 	characterizedImages: props.analysisData.FilePaths,			
		// 	layersInfo: props.analysisData.LayersInfo,
		// }

		this.state = {
			currentImageIdx: 0,
			selectedLayerIdx: 0,
			rcmStackImageCount: props.analysisData.FilePaths.length,
			currentImageSrc: props.analysisData.FilePaths[0],
			ipmData: {
				originalImages: props.analysisData.FilePaths,
				characterizedImages: props.analysisData.FilePaths,
				layerData: props.analysisData.LayersInfo,
			}
		}
	}

	//Change the current image that is being presented to the user according to the desired change direction
	changeImage(isUp){
		if(isUp){ //Up button was preessed
			if(this.state.currentImageIdx > 0){
				var newIndex = this.state.currentImageIdx - 1;
				var newImage = this.state.ipmData.characterizedImages[newIndex];
				this.setState({ currentImageIdx: newIndex, currentImageSrc: newImage });
			}
		} else { //Down button was pressed
			if(this.state.currentImageIdx < this.state.ipmData.characterizedImages.length - 1){
				var newIndex = this.state.currentImageIdx + 1;
				var newImage = this.state.ipmData.characterizedImages[newIndex];
				this.setState({ currentImageIdx: newIndex, currentImageSrc: newImage });
			}
		}
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
		var newImage = this.state.ipmData.characterizedImages[imgIndex];
		this.setState({ currentImageIdx: imgIndex, currentImageSrc: newImage });
	}

	/********************************
	     ImageView event handlers
	********************************/
	
	//Start the file saving process
	saveCurrentImage(){
		//Signal main process to open OS's file dialog
		ipc.send('open-save-dialog', this.state.ipmData.characterizedImages[this.state.currentImageIdx]) ;
	}

	//Re-render the screen according to the images that was toggled
	toggleClicked(){
		console.log('DEBUG: Toggle signal received!!');
	}

	//Render the DOM elements to the screen
	render() {
		return (
			<div className={styles.results_mainContainer}>
				<div className={styles.containerOne} >
					<NavigationView btnNavClicked={ (isUp) => { this.changeImage(isUp); } } />
					<ImageView imageSrc= { this.state.currentImageSrc } btnSaveClicked={ () => { this.saveCurrentImage(); } } btnToggleClicked={ () => { this.toggleClicked();} }/>
					<VisualizationView currentState={ this.state } analysisData={ this.props.analysisData } binClicked={ (layerIndex) => { this.binClicked(layerIndex); } } imageClicked={ (imgIndex) => { this.imageClicked(imgIndex); } }/>
				</div>
				<div className={styles.containerTwo}>
					<ImageMetricsView currentImg = { this.state.currentImageIdx + 1} totalImages = { this.state.ipmData.characterizedImages.length }/>
				</div>
			</div>
		);
	}

	// //Render the DOM elements to the screen
	// render() {
	// 	return (
	// 		<div className={styles.results_mainContainer}>
	// 			<div className={styles.containerOne} >
	// 				<NavigationView btnNavClicked={ (isUp) => { this.changeImage(isUp); } } />
	// 				<ImageView imageSrc= { this.state.currentImage } btnSaveClicked={ () => { this.saveCurrentImage(); } } btnToggleClicked={ () => { this.toggleClicked();} }/>
	// 				<VisualizationView currentState={ this.state } analysisData={ this.props.analysisData } binClicked={ (layerIndex) => { this.binClicked(layerIndex); } } imageClicked={ (imgIndex) => { this.imageClicked(imgIndex); } }/>
	// 			</div>
	// 			<div className={styles.containerTwo}>
	// 				<ImageMetricsView currentImg = { this.state.currentImageIndex + 1} totalImages = { this.state.totalImages }/>
	// 			</div>
	// 		</div>
	// 	);
	// }

}

export default ResultsScreen;