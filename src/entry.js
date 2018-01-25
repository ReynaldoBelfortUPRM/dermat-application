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

//Import libraries
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import jetpack from 'fs-jetpack'; 								//For file management
import Papa from 'papaparse';
import _ from 'lodash';
var sizeOf = require('image-size');
const ipc = window.require('electron').ipcRenderer;				//Electron functions for interaction with Main Process	
const { dialog, app } = window.require('electron').remote;	//Importing rest of necessary Electron libraries

//Import major components
import ImageInputScreen from './components/sc_image_input';
import InProgressScreen from './components/sc_in_progress';
import ResultsScreen from './components/sc_results_main';

//TODO Import debug tools
import debug from './debug/debugTools.js';

//Import Image Processing Module script
import pythonScript from '../test_script.py';

//Get App Data information
const appDataFolderPath = app.getPath('appData') + "\\" + app.getName();
const characterizedImgFolderPath = appDataFolderPath + "\\characterized-images";
const pyScriptFilePath = appDataFolderPath + '\\test_script.py';

								/*********************
									App Component
								**********************/

class App extends Component {
	constructor(props){
		super(props);

		//Store the python script to be executed on local machine, if it doesn't exist already
		if(!jetpack.exists(pyScriptFilePath)){
			jetpack.file(pyScriptFilePath, { content: pythonScript });
		}

		this.state = {
			currentScreenIdx: 0,
			isResulsDataExported: false, 		//Will save wether results data was saved to the user at any given moment
			ipmInputData: null,			
			ipmOutputData: null,			
			isIPAError: false,
		};
	}

	goImageInputSreen(openFileDilog) {
		if(openFileDilog){
			//Erase the produced characterized images we no longer need
			eraseLocalImages(this.state.ipmOutputData.characterizedImages);
			//Render the Image Input Screen and open 'Open Dialog'
			this.setState({ currentScreenIdx: 0, isResulsDataExported: false});
			this.inputScreenChild.btnBrowseClick();
		} else {
			//Render the Image Input Screen, without opening  'Open Dialog'
			this.setState({ currentScreenIdx: 0, isResulsDataExported: false});			//TODO Maybe this step is never needed
		}
	}

	goInProgressScreen(){
		//Display the progress screen
		this.setState({ currentScreenIdx: 1});	
	}	
	
	//Mark whether the user has saved the analysis results
	setResultDataExported(isDataExported){
		if(isDataExported){
			this.setState({ isResulsDataExported: true});	
		}
	}

	goResultsScreen(ipmOutputData, isIPAError){
		//Retrieve the produced characterized images stored on the local machine
		ipmOutputData.characterizedImages = getAndSortImages(characterizedImgFolderPath);

		//Image Processing Algorithm has finished. Show ResultsScreen
		this.setState({ currentScreenIdx: 2, ipmOutputData, isIPAError});
	}

	executeIpm(ipmInputObj){
		this.setState({ ipmInputData: ipmInputObj});			//Save the data	
		ipc.send('execute-ipm', ipmInputObj);					//Signal main process to execute the IPM to analyze images
		this.goInProgressScreen();
	}

	render (){
		var currentScreen = null;

		switch(this.state.currentScreenIdx){
			case 0: //Image Input Screen
				currentScreen = (<ImageInputScreen onRef= { ref => this.inputScreenChild = ref} onSelectedPaths = { (ipmInputObj) => { this.executeIpm(ipmInputObj) } } appDataPath = { appDataFolderPath } />);
				break;
			case 1: //In Progress Screen
				currentScreen = (<InProgressScreen onRef= { ref => this.inProcessScreenChild = ref} onCancel = { () => { this.goImageInputSreen(false) } }/>);
				break;
			case 2: //Results Screen
				currentScreen = (<ResultsScreen outputData = { this.state.ipmOutputData } inputData = { this.state.ipmInputData } isAnalysisError={ this.state.isIPAError } onRef= { ref => this.resultsScreenChild = ref}/>)
				break;
		}

		return (	//Render the corresponding screen to the user
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
	mainTargetDir.file('stack-analysis-results.csv', { content: csvData });

	//Create new path where characterized images will be placed
	var imgExportFolderPath = mainTargetDir.path() + '\\characterized-images'; 	

	//Copy all and only the PNG files contained on the source folder into the export folder
	jetpack.copy(characterizedImgFolderPath, imgExportFolderPath, { matching: '*.png', 
		overwrite: (srcInspectData, destInspectData) => { 
				//This function executes when the image already exist in destination folder
				//Criteria to replace/overwrite existing images should be defined here
				//TODO Verify if we have to define something here
				//TODO We should warn the user here that a file will be replaced ("one or more files will be replaced")
				return true;
	} });

	//Inform user that information has been succesfully exported
	dialog.showMessageBox({
		type: 'info',
		title: 'Data succesfully exported',
		message: "The image analysis results have been succesfully exported.",
		buttons: ['Ok']
	  });
}

function getCharacterizedImagesLocalComputer(){

	//Store characterized images on the user's temporary folder if it doesn't exist
	debug("about to store charerized images in Roaming folder");

	//Copy all and only the PNG files contained on the source folder into the export folder
	if(!jetpack.exists(characterizedImgFolderPath)){	//If does not exists

		jetpack.copy(app.getAppPath() + "\\assets\\characterized-images", characterizedImgFolderPath, { matching: '*.png', 
		overwrite: (srcInspectData, destInspectData) => { 
				//This function executes when the image already exist in destination folder
				//Criteria to replace/overwrite existing images should be defined here
				return true;
		} });
	}
	
	//Obtain all the PNG files contained within the source folder
	var relativeImageFilePaths = jetpack.find(characterizedImgFolderPath, {files: true, matching: "*.png" } );	
	
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
		return characterizedImgFolderPath + '\\' + d.fileName;
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
	});

	//If there are either 0 numbers or more than 1 numbers in the file name, it's an error. Return coresponding negative value.
	if(numberCount === 0){ 			//There is not an identifiable index
		return -1;
	} else if(numberCount > 2){		//There are more than one identifiable index
		return -2;
	}

	return foundIndexValue;
}

function getAndSortImages(srcImageFolderPath){
	//Obtain all the PNG files contained within the source folder
	var relativeImageFilePaths = jetpack.find(srcImageFolderPath, {files: true, matching: "*.png" } );	
	
	//Obtain the file names of each image with its corresponding index
	var imageFileNames = relativeImageFilePaths.map((path, i) => {
		var fileName = jetpack.inspect(path).name;
		var fileIndex = getFileNameIndex(fileName.slice(0,-4));
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
		return srcImageFolderPath + '\\' + d.fileName;
	});

	return sortedAbsoluteImagePaths;
}

//Function erases all images or even other files given the specified path array
function eraseLocalImages(pathArray){
	//Erase images one by one
	_.each(pathArray, (path) =>{
		jetpack.remove(path);
	});
}

				/******************************************
					Inter-process communication listeners
				*******************************************/

//These functions are defined for interaction with the Main Process

//Executes when user has selected the image source folder
ipc.on('selected-input-folder', (event, srcFolderPath) => {

	var isInputInvalid = false;		//Defined flag in case there are validation errors
	
	//Obtain all the PNG files contained within the source folder
	var relativeImageFilePaths = jetpack.find(srcFolderPath, {files: true, matching: "*.png" } );
	
					//--------------Validation case-------------
					//Stack of images between 30 and 100 images
	if(relativeImageFilePaths.length < 30 || relativeImageFilePaths.length > 100){
		//Error, too few or too many images in the stack
		dialog.showMessageBox({
			type: 'error',
			title: 'Invalid input',
			message: "Please select a stack with no less than 30 images or no more than 100 images.",
		  });
		//Signal main process to open OS's file dialog
		ipc.send('open-file-dialog');
		return; 	//Stop here
	}

	//Obtain the file names of each image with its corresponding index
	var imageFileNames = relativeImageFilePaths.map((path, i) => {
		var fileName = jetpack.inspect(path).name;
		var fileIndex = !isInputInvalid ? getFileNameIndex(fileName.slice(0,-4)) : 0;  //Remove file extension before proceeding to retrieve index
		//Validate if the file name has index
		if(fileIndex === -1 ){ 			//No index on file name

				//--------------Validation case-------------
				//File name of one of the images does not contain a number
			console.warn('DEBUG: FILENAME INDEX ERROR! For file: ', jetpack.inspect(path).name );
			isInputInvalid = true;
			dialog.showMessageBox({
				type: 'error',
				title: 'Invalid input',
				message: "One of the images in the stack contains no identifiable index in its file name. Please leave a single index separated by _ (e.g. 9_RCM_Dark or RCM_9_Dark). ",
			});
		}
	else if(fileIndex === -2 ){ 		//More than one index on file name
			//--------------Validation case-------------
			//File name of one of the images contains more than one individual number
			console.warn('DEBUG: FILENAME INDEX ERROR! For file: ', jetpack.inspect(path).name );
			isInputInvalid = true;
			dialog.showMessageBox({
				type: 'error',
				title: 'Invalid input',
				message: "One of the images in the stack contains more than one identifiable index in its file name. Please leave a single index separated by _ (e.g. 9_RCM_Dark or RCM_9_Dark).",
			});
		}
		//Return a new object with 'fileName' and 'fileIndex' properties
		return {fileName: fileName, fileIndex: fileIndex};
	});

	//Validation
	if(isInputInvalid){
		//Signal main process to open OS's file dialog
		ipc.send('open-file-dialog');
		return; 	//Stop here
	}

	//----- Sort the images contained within the selected folder  --------	

	//Sort array based on the fileIndex property
	var sortedArray = _.sortBy(imageFileNames, [function(target) {return target.fileIndex; }])

	//Append the source folder to each image file name to retrieve a new array of absolute paths
	var sortedAbsoluteImagePaths = sortedArray.map( (d) => {
		return srcFolderPath + '\\' + d.fileName;
	});

	var stackHeight = null;
	var stackWidth = null;
	for(var i = 0; i < sortedAbsoluteImagePaths.length; i++){

		//Obtain image dimensions
		var dimensions = sizeOf(sortedAbsoluteImagePaths[i]);

		//Intitialize stack dimensions if needed
		stackHeight = stackHeight == null ? dimensions.height : stackHeight;
		stackWidth = stackWidth == null ? dimensions.width : stackWidth;

				//-----------------------Validation case----------------------
				//Any of the images in the stack is below 400px or above 1000px
		if(dimensions.width < 400 || dimensions.height < 400){

			dialog.showMessageBox({
				type: 'error',
				title: 'Invalid input',
				message: "One of the images on the selected folder has a width or height less than 400px which is the minimum. Please insert an image with both dimensions equal or greater than 400px.",
			});

			isInputInvalid = true;
			break;

		} else if(dimensions.width > 1000 || dimensions.height > 1000){ 

			dialog.showMessageBox({
				type: 'error',
				title: 'Invalid input',
				message: "One of the images on the selected folder has a width or height more than 1000px which is the maximum. Please insert an image with both dimensions equal or less than 1000px.",
			});
			
			isInputInvalid = true;
			break;
				
					//-----------------Validation case-------------------
					//One of the images do not contain the same  
					//dimensions as the rest of the images in the stack
		} else if(stackHeight != dimensions.height || stackWidth != dimensions.width){
			//Then one of the images have different dimensions than the rest of the images

			dialog.showMessageBox({
				type: 'error',
				title: 'Invalid input',
				message: "All images in a given stack must have the same dimensions. Please select a stack where all its images have the same dimensions.",
			});
			
			isInputInvalid = true;
			break;
		}
	}

	//Signal the ImageInputScreen component to display the 'Input Confirmation Dialog'
	if(!isInputInvalid){
		AppComponent.inputScreenChild.displayConfirmationModal(sortedAbsoluteImagePaths);
	}
});

//Executes everytime there is a new massege to be recieved form the IPM
ipc.on('status-update', (event, statusMessage) => {
	//Signal the InProcessScreen component to send a status message
	AppComponent.inProcessScreenChild.updateStatus(statusMessage);
});

//Executes when the IPA finished its execution and result data was sent back to this Renderer proecss
ipc.on('analysis-complete', (event, ipmOutput) => {
	//Display the Results Screen	
	AppComponent.goResultsScreen(ipmOutput, false);
});

//Executes when the IPA could not classify the stack of images appropiately
ipc.on('analysis-error', (event, ipmOutput) => {
	//Display the Results Screen, also rasing the error flag
	AppComponent.goResultsScreen(ipmOutput, true);
});

//Executes when user has selected a destination to save a characterized image
ipc.on('save-destination-retrieved', (event, fileDest) => {

	//Copy the current characterized image in view into the 
	//path specified by the user
	jetpack.copy(AppComponent.resultsScreenChild.state.currentImageSrc, fileDest, { 
		overwrite: (srcInspectData, destInspectData) => {
			//This function will run whenever there is a conflict when copying the image file
			// to the destination (such as 'the destination file already exists').
			//Criteria for deciding whether file shall be replaced or not should be defined here.

			return true; 	//Overwrite file
		}
	});

	//Inform user that the characterized image has been succesfully saved
	dialog.showMessageBox({
		type: 'info',
		title: 'Successfull save',
		message: "The characterized image have been successfully saved.",
		buttons: ['Ok']
	  });
	debug('Function to save the filed has been called (async)!');	//TODO
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