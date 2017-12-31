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

//Import Electron functions for interaction with Main Process
const ipc = window.require('electron').ipcRenderer;

//Import major components
import ImageInputScreen from './components/sc_image_input';
import InProgressScreen from './components/sc_in_progress';
import ResultsScreen from './components/sc_results_main';

//Import dummy data
import ipmOutputDummy from './components/dummyData/ipmOutputDummyData.js';
import ipmInputDummy from './components/dummyData/ipmInputDummyData.js';

var ipmOutput = null;
var ipmInput = null;

class App extends Component {
	constructor(props){
		super(props);
		this.state = {
			imgInputPaths: []
		};
	}

	render (){
		return (
			// <ImageInputScreen onRef= { ref => this.inputScreenChild = ref} />
			// <InProgressScreen onRef= { ref => this.inProcessScreenChild = ref} />
			 <ResultsScreen analysisData={ ipmOutputDummy } inputData = { ipmInputDummy } />
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

//Point where the entire applcation is rendered by binding App object with the HTML container
var AppComponent = ReactDOM.render(<App/>, document.querySelector('.react-container') ); 