			/******************************************
			 		DermAT's ReactJS Main Applcation 
			*******************************************/
// Author: Reynaldo Belfort Pierrilus, Computer Engineering Undergraduate
// University of Puerto Rico - Mayagüez

// This file serves as the entry point of the DermAT's ReactJS application.
// The rendering of all the DOM elements and screens are defined from this point.

//Terminology:
//IPM - Image Processing Module
//IPA - Image Processing Algorithm

/* TODO Task List
	- COMENTAR TODO EL CÓDIGO, EXPLICANDO LAS FUNCIONES DE CADA COSA.
	- Poner primera letra de propiedades de dummyData lower case e.g. 'layersInfo'
	- Change folder names on application file structure
	- FIX padding issue on results view, so that borders can be seen appropiately
	- Figure out a way to load local .css files
	- Figure out a way to incorporate webpack into electron
	- Save 'npm list --depth=0' problems.
	- Properly arrange application's package.json
*/

//Import libraries
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import jetpack from 'fs-jetpack'; 								//For file management
const ipc = window.require('electron').ipcRenderer;			//Electron functions for interaction with Main Process	
// const dialog = window.require('electron').remote.dialog;
// const app = window.require('electron').remote.app;
const { dialog, app } = window.require('electron').remote;	//Importing rest of necessary Electron libraries

//Import styles
// import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
// import styles from '../node_modules/bootstrap/dist/css/bootstrap.min.css';

//Import major components
import ImageInputScreen from './components/sc_image_input';
import InProgressScreen from './components/sc_in_progress';
import ResultsScreen from './components/sc_results_main';

//Import dummy data
import ipmInputDummy from './components/dummyData/ipmInputDummyData.js';
import ipmOutputDummy from './components/dummyData/ipmOutputDummyData.js';

//TODO Import debug tools
import debug from './debug/debugTools.js';

var ipmOutput = null;
var ipmInput = null;

class App extends Component {
	constructor(props){
		super(props);

		this.state = {
			currentScreenIdx: 2,
			imgInputPaths: [],
			isResulsDataExported: false 		//Will save wether results data was saved to the user at any given moment
		};
	}

	goImageInputSreen(openFileDilog) {
		if(openFileDilog){
			//Render the Image Input Screen and open 'Open Dialog'
			this.setState({ currentScreenIdx: 0, isResulsDataExported: false});
			this.inputScreenChild.btnBrowseClick();
		} else {
			//Render the Image Input Screen, without opening  'Open Dialog'
			this.setState({ currentScreenIdx: 0, isResulsDataExported: false});			//TODO Maybe this step is never needed
		}
	}

	goInProgressScreen(){

	}

	setResultDataExported(isDataExported){
		if(isDataExported){
			this.setState({ isResulsDataExported: true});	
		}
	}

	goResultsScreen(ipmOutputData){
		//Image Processing Algorithm has finished. Show ResultsScreen
		
		//Change the screen
	}

	render (){
		var currentScreen = null;

		switch(this.state.currentScreenIdx){
			case 0: //Image Input Screen
				currentScreen = (<ImageInputScreen onRef= { ref => this.inputScreenChild = ref} />);
				break;
			case 1: //In Progress Screen
				currentScreen = (<InProgressScreen onRef= { ref => this.inProcessScreenChild = ref} />);
				break;
			case 2: //Results Screen
				currentScreen = (<ResultsScreen outputData = { ipmOutputDummy } inputData = { ipmInputDummy } onRef= { ref => this.resultsScreenChild = ref}/>)
				break;
		}

		return (
			<div>
				{currentScreen}
			</div>
		);
	}

}

/******************************************
 	Inter-process communication listeners
*******************************************/

//These functions are defined for interaction with the Main Process

//Executes when user has selected images
ipc.on('selected-images', (event, filePaths) => {
	//Signal the ImageInputScreen component to display the 'Input Confirmation Dialog'
	AppComponent.inputScreenChild.displayConfirmationModal(filePaths);
});

//Executes everytime there is a new massege to be recieved form the IPM
ipc.on('status-update', (event, statusMessage) => {
	//Signal the InProcessScreen component to send a status message
	AppComponent.inProcessScreenChild.updateStatus(statusMessage);
});

//Executes when the IPA finished its execution and result data was sent back to this Renderer proecss
ipc.on('analysis-complete', (event, data) => {
	//Save data sent by the IPM module. To be used in the Results Screen
	ipmOutput = data;
});

//Executes when user has selected a destination to save a characterized image
ipc.on('save-destination-retrieved', (event, fileDest) => {

	//Copy the current characterized image in view into the 
	//path specified by the user
	jetpack.copy(AppComponent.resultsScreenChild.state.currentImageSrc, fileDest, { 
		overwrite: (srcInspectData, destInspectData) => {
			//This function will run whenever there is a conflict when copying the image file
			// to the destination (such as 'the destination file already exists'). 
			//We decide here if file is to be replaced or not. Ask user.		<---- TODO
			 
			return true; 	//Overwrite for now
		}
	});
	//TODO Another way that might work. Watning: Errors handling should be considered here
	// fs.createReadStream(AppComponent.resultsScreenChild.state.currentImageSrc).pipe(fs.createWriteStream(fileDest));

	debug('Function to save the filed has been called (async)!');
	//TODO We should catch an error here if something unexpected hapens . 'Internal error application.' 
});

//Executes when a new image analysis has been requested
ipc.on('perform-new-analysis', (event, message) => {
	//Warn user to save current image analysis results, if needed
	if(!AppComponent.state.isResulsDataExported) {

		dialog.showMessageBox({
			type: 'warning',
			title: 'Save Result Data',
			message: "Do you want to save the current image results on your local machine? Otherwise all data will be lost.",
			buttons: ['Yes', 'No']
		  }, function (index) {		//Callback function
			  if(index === 0){		//User selected 'Yes'

				//Proceed to save image analysis on the user's local machine
				exportIPMOutputData();

				//Note: Here we don't have to update the isResulsDataExported var since the app will change to the first page
			  }

			  //Change screen back to Image Input screen and open the 'Open Dialog'
			  AppComponent.goImageInputSreen(true);
		  });
	} else{
		//Change screen back to Image Input screen and open the 'Open Dialog'
		AppComponent.goImageInputSreen(true);
	}

	//Return to first page
	debug('SIGNAL to return to first page');
});

ipc.on('save-analysis-results', (event, message) => {
	//Open the OS's dialog so that user can choose a folder to save the IPM data	
	dialog.showOpenDialog({
		title: 'Save Analysis Results',
		properties: ['openFile', 'openDirectory'],
		defaultPath: app.getPath('desktop')
	  }, function (folderDest) { 				//Callbak function
		//If a folder destination was chosen
		if (folderDest){				
			//Proceed to save image analysis on the user's local machine
			exportIPMOutputData();

			//Mark that the results data has been exported
			AppComponent.setResultDataExported(true);

			//Return to first page
			debug('SAVED DATA on destination: ' + folderDest);
		} 
	  });

});

function exportIPMOutputData(){
	//>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<>><>>>>>>>>>>>>< IMPLEMENT HERE! TODO
}

//Point where the entire applcation is rendered by binding App object with the HTML container
var AppComponent = ReactDOM.render(<App/>, document.querySelector('.react-container') ); 