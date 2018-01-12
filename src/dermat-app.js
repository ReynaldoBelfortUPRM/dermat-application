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
	- Change 'FilePaths' property of ipmOutputData var to 'characterizedImages'
	- Perform Unit Testing
*/


//Meta: Ver las imagenes originales que inserte de unstack de Input Screen -> Results screen.
//Meta 2: Que me cargue imagenes caracterizadas (dommy data) independiente de cualquier stack ogirinal que ponga.

//Import libraries
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import jetpack from 'fs-jetpack'; 								//For file management
import Papa from 'papaparse';
import _ from 'lodash';
// import sortPaths from 'sort-paths';
// import pathSorter from 'path-sort';
const ipc = window.require('electron').ipcRenderer;			//Electron functions for interaction with Main Process	
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

		//TODO DEBUG PURPOSES - Obtain the characterized images stored in this computer
		ipmOutputDummy.characterizedImages = getCharacterizedImagesLocalComputer();

		this.state = {
			currentScreenIdx: 0,
			isResulsDataExported: false, 		//Will save wether results data was saved to the user at any given moment
			ipmInputData: null,			
			ipmOutputData: ipmOutputDummy
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
		this.setState({ currentScreenIdx: 1});	
		setTimeout(() => { this.goResultsScreen();}, 3000); 		//TODO THIS CODE IS NOT FOR PRODUCTION	
	}	

	setResultDataExported(isDataExported){
		if(isDataExported){
			this.setState({ isResulsDataExported: true});	
		}
	}

	goResultsScreen(ipmOutputData){
		//Image Processing Algorithm has finished. Show ResultsScreen
		this.setState({ currentScreenIdx: 2});
	}

	executeIpm(ipmInputObj){
		this.setState({ ipmInputData: ipmInputObj});				//Save the data	
		ipc.send('execute-ipm', ipmInputObj);						//Signal main process to execute the IPM to analyze images
		this.goInProgressScreen();
	}

	render (){
		var currentScreen = null;

		switch(this.state.currentScreenIdx){
			case 0: //Image Input Screen
				currentScreen = (<ImageInputScreen onRef= { ref => this.inputScreenChild = ref} onSelectedPaths = { (ipmInputObj) => { this.executeIpm(ipmInputObj) } } />);
				break;
			case 1: //In Progress Screen
				currentScreen = (<InProgressScreen onRef= { ref => this.inProcessScreenChild = ref} />);
				break;
			case 2: //Results Screen
				currentScreen = (<ResultsScreen outputData = { this.state.ipmOutputData } inputData = { this.state.ipmInputData } onRef= { ref => this.resultsScreenChild = ref}/>)
				break;
		}

		return (
			<div>
				{currentScreen}
			</div>
		);
	}

}



/*************************
 	App Component Utils
**************************/

//Exports images and metadata from the stored IPM output info into .PNG and .txt (CSV) files at the specified folder destination
function exportIPMOutputData(folderDestPath){
	//TEST FOR ASYNC OPERATIONS TAHT MIGHT AFFECT The SAVING PROCESS TODO

	//Create a new var contaning proper format for the papaparse library
	var formattedIpmOutput = AppComponent.state.ipmOutputData.LayersInfo.map( (layerObj, i) => {
		var newObj = {
			LayerID: _.toString(layerObj.LayerID),
			LayerName: layerObj.LayerName,
			LayerThickness: _.toString(layerObj.LayerThickness),
			LayerStackMin: _.toString(layerObj.LayerRange[0]),
			LayerStackMax: _.toString(layerObj.LayerRange[1]),
		};

		return newObj;
	});

	debug("About to create csv data" );	 //TODO DEBUG

	//Convert from JSON to CSV
	var csvData = Papa.unparse(formattedIpmOutput);

	console.log("DEBUG: Created CSV data: ", csvData);		//TODO DEBUG

	console.log("DEBUG: JETPACK About to obtain main target directory. folderDestPath: ", folderDestPath);		 //TODO DEBUG	

	//Obtain main target directory
	var mainTargetDir = jetpack.dir(folderDestPath);

	//Store text file on the selected diretory
	mainTargetDir.file('stack-analysis-results.txt', { content: csvData });

	//Create new path where characterized images will be placed
	var imgExportFolderPath = mainTargetDir.path() + '\\characterized-images'; 	
	
	//Get app's internal folder where characterized images are stored
	var imgSrcFolderPath = "C:\\Users\\reyna\\Google Drive\\UPRM\\Capstone Project\\- Project - Dermatologists Assistive Tool (DermAT) - Prof. Heidy\\3 Final Report\\Alejandro's Tasks (1)\\Testing_Stage\\CharacterizedImageSamples";

	//TODO VERIFY HERE IF THERE ARE EXISTING IMAGES IN THE EXPORT FOLDER THAT MAY BE REPLACED
			//Error case: what happens if user have to different folders with exported data and 
			//the app replaces data on one of these folders (by user mistake)?

	//Copy all and only the PNG files contained on the source folder into the export folder
	jetpack.copy(imgSrcFolderPath, imgExportFolderPath, { matching: '*.png', 
		overwrite: (srcInspectData, destInspectData) => { 
				//This function executes when the image already exist in destination folder
				//Criteria to replace/overwrite existing images should be defined here
				//TODO Verify if we have to define something here
				//TODO We should warn the user here that a file will be replaced ("one or more files will be replaced")
				return true;
	} });

	//TODO Test: What happens if an error occurs when copying a file???
	//Inform user that information has been succesfully exported
	dialog.showMessageBox({
		type: 'info',
		title: 'Data succesfully exported',
		message: "The image analysis results have been succesfully exported.",
		buttons: ['Ok']
	  });
}

function getCharacterizedImagesLocalComputer(){
	var roamingPath = app.getPath('appData'); //Will look something like this: C:\Users\reyna\AppData\Roaming
	var characterizedImgPath = roamingPath + "\\" + app.getName() + "\\characterized-images";

	//Obtain all the PNG files contained within the source folder
	var relativeImageFilePaths = jetpack.find(characterizedImgPath, {files: true, matching: "*.png" } );	
	
	//Obtain the file names of each image with its corresponding index
	var imageFileNames = relativeImageFilePaths.map((path, i) => {
		var fileName = jetpack.inspect(path).name;
		var fileIndex = getFileNameIndex(fileName);
		//Validate if the file name has index
		if(fileIndex < 0){
			console.warn('DEBUG: FILENAME INDEX ERROR! For file: ', jetpack.inspect(path).name );
		}
		//Return a new object with 'fileName' and 'fileIndex' properties
		return {fileName: fileName, fileIndex: fileIndex};
	});

	//Sort array based on the fileIndex property
	var sortedArray = _.sortBy(imageFileNames, [function(target) {return target.fileIndex; }])

	//Append the source folder to each image file name to retrieve a new array of absolute paths
	var sortedAbsoluteImagePaths = sortedArray.map( (d) => {
		return characterizedImgPath + '\\' + d.fileName;
	});

	return sortedAbsoluteImagePaths;
}

/**********************************************************************************
//This functon will retrieve the index contained in the given fileName parameter.
//'fileName' is expected to have '_' characters that separates an index number from 
	the rest of the string. e.g. 'RCM_image_9' or '9_image_RCM'
//Returns -1 if the fileName doesn't comply with the expected format.
**********************************************************************************/
function getFileNameIndex(fileName){

	//TODO VERIFY THIS CASE getFileNameIndex('_RCM_image'). This returns 0 value when it should returning -1.
	
	//Split name acording to the expected file name format 
	var splittedFileNameValues = fileName.split('_');		
	//Initialize vars	
	var foundIndexValue = -1;
	var numberCount = 0;
	
	//Count how many numbers are available in the string while also storing the last found index
	splittedFileNameValues.forEach( (str) => {
		var parseAttempt = _.toNumber(str);
		if(!_.isNaN(parseAttempt)){
			foundIndexValue = parseAttempt;
			numberCount++;
		}
	} )

	//If there are either 0 numbers or more than 1 numbers in the file name, it's an error. Return -1 in that case. Otherwise return the index found.
	return (numberCount === 0 || numberCount > 2) ? -1 : foundIndexValue;		
}

/******************************************
 	Inter-process communication listeners
*******************************************/

//These functions are defined for interaction with the Main Process

//Executes when user has selected the image source folder
ipc.on('selected-input-folder', (event, srcFolderPath) => {
	//----- Obtaing the absolute path of every PNG image found in the given source folder  --------

	//Obtain all the PNG files contained within the source folder
	var relativeImageFilePaths = jetpack.find(srcFolderPath, {files: true, matching: "*.png" } );	
	
	//Obtain the file names of each image with its corresponding index
	var imageFileNames = relativeImageFilePaths.map((path, i) => {
		var fileName = jetpack.inspect(path).name;
		var fileIndex = getFileNameIndex(fileName);
		//Validate if the file name has index
		if(fileIndex < 0){
			console.warn('DEBUG: FILENAME INDEX ERROR! For file: ', jetpack.inspect(path).name );
		}
		//Return a new object with 'fileName' and 'fileIndex' properties
		return {fileName: fileName, fileIndex: fileIndex};
	});

	//Sort array based on the fileIndex property
	var sortedArray = _.sortBy(imageFileNames, [function(target) {return target.fileIndex; }])

	//Append the source folder to each image file name to retrieve a new array of absolute paths
	var sortedAbsoluteImagePaths = sortedArray.map( (d) => {
		return srcFolderPath + '\\' + d.fileName;
	});

	//TODO >>>>>>>> VALIDATE IMAGES HERE!!! <<<<<<
	

	//Signal the ImageInputScreen component to display the 'Input Confirmation Dialog'
	AppComponent.inputScreenChild.displayConfirmationModal(sortedAbsoluteImagePaths);
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

	//Display the Results Screen
	
	//TODO NOT SURE IF THIS BELONGS HERE
	//Add 'Analysis' menu on app's menu bar
	// ipc.send('add-analysis-menu');
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
	//TODO We should catch an error here if something unexpected hapens. 'Internal error application.' 
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

				//Open the OS's dialog so that user can choose a folder to save the IPM data	
				dialog.showOpenDialog({
					title: 'Save Analysis Results',
					properties: ['openFile', 'openDirectory'],
					defaultPath: app.getPath('desktop')
				}, function (folderDestArr) { 				//Callbak function
					//If a folder destination was chosen
					if (folderDestArr){				
						//Proceed to save image analysis on the user's local machine
						exportIPMOutputData(folderDestArr[0]);

						//Mark that the results data has been exported
						AppComponent.setResultDataExported(true);

						debug('SAVED DATA on destination: ' + folderDestArr); //TODO DEBU	
					
						//Change screen back to Image Input screen and open the 'Open Dialog'
						AppComponent.goImageInputSreen(true);
					} 
					
				});

				//Note: Here we don't have to update the isResulsDataExported var since the app will change to the first page
			  } else { 			//User selected 'No'
			  	//Change screen back to Image Input screen and open the 'Open Dialog'
				AppComponent.goImageInputSreen(true);
			  }
		  });
	} else{
		//Delete all application data produced by the app (characterized images & IPM metadata) 	TODO

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
	  }, function (folderDestArr) { 				//Callbak function
		//If a folder destination was chosen
		if (folderDestArr){				
			//Proceed to save image analysis on the user's local machine
			exportIPMOutputData(folderDestArr[0]);

			//Mark that the results data has been exported
			AppComponent.setResultDataExported(true);

			//Return to first page
			debug('SAVED DATA on destination: ' + folderDestArr);
		} 
	  });

});

//Signal the Results Screen component to change current image in UP direction
ipc.on('change-image-up', (event) => {
	if(AppComponent.state.currentScreenIdx === 2){ //Verify if we are in the Results screen
		AppComponent.resultsScreenChild.changeImage(true);
	}
});

//Signal the Results Screen component to change current image in DOWN direction
ipc.on('change-image-down', (event) => {
	if(AppComponent.state.currentScreenIdx === 2){ //Verify if we are in the Results screen
		AppComponent.resultsScreenChild.changeImage(false);
	}
});

//Point where the entire applcation is rendered by binding App object with the HTML container
var AppComponent = ReactDOM.render(<App/>, document.querySelector('.react-container') ); 