			/******************************************
			 		DermAT's Electron Main Process 
			*******************************************/
// Author: Reynaldo Belfort Pierrilus, Computer Engineering Undergraduate
// University of Puerto Rico - Mayagüez

//FIND ALL 'TODO' TAGS AND DELETE THEM IF NOT NEEDED

//TODO - Task list
			// We should catch all unexpected errors with try-catch cases

//Terminology:
//IPM - Image Processing Module
//IPA - Image Processing Algorithm

//Require necessary libraries and classes
const {app, BrowserWindow, globalShortcut, Menu} = require('electron');
const path = require('path');
const url = require('url');

//For interaction with the Renderer process
const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;

//Define application window
let win;

/*********************************
 	Electron application events
**********************************/

//Executes when Electron has finished initializing and it's ready to create BrowserWindows
app.on('ready', createWindows);

// Quit application when all windows are closed.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

//TODO Function used for debugging purposes
app.on('browser-window-focus', (event, window) => {
	console.log('APP-DEBUG: focused window ID:' + window.id); 
});

/******************************************
 	Inter-process communication listeners
*******************************************/
// These functions are defined for interaction with the app's renderer process

//Executes the command for opening the OS's OpenFile dialog. Returns back an array of paths selected by the user
ipc.on('open-file-dialog', (event) => {

	const options = {
	    properties: ['openFile', 'multiSelections'],
	    filters: [
		    {name: 'RCM Images', extensions: ['png']},
		  ]
	};

	 dialog.showOpenDialog(options, 
	  function (filePaths) {
		    if (filePaths){
		    	event.sender.send('selected-images', filePaths);	
		    }
	  });
});

//For saving a single image. Opens the OS's Save File dialog. 
//Saves the recieved image path to the user's local machine
ipc.on('open-save-dialog', function (event) {
  console.log('DEBUG: About to save image'); //TODO

  const options = {
    title: 'Save Characterized Image',
    filters: [
      { name: 'Image', extensions: ['png'] }
    ]
  }
  dialog.showSaveDialog(options, function (fileDest) {
	//Dialog has been closed at this point
  	if(fileDest) {
  		//TODO Implement saving the image to local machine
		console.log("DEBUG: Save destination retrieved. Signaling Renderer proc..");
		event.sender.send('save-destination-retrieved', fileDest);
  	}
  });
});

//Signals the IPM to start execution of the IPA
ipc.on('execute-ipm', (event, ipmInputData) => {

	if(ipmInputData){
		//HERE WE EXECUTE THE IMAGE PROCESSING ALGORITHM
		console.log("DEBUG: Image Processing Algorithm has been executed! IPM input object: ", ipmInputData); //TODO
	}

});

//Signals the IPM to cancel IPA execution
ipc.on('cancel-execution', (event) => {

	//HERE WE SIGNAL THE IMAGE PROCESSING ALGORITHM TO STOP ALGORITHM EXECUTION
	console.log("DEBUG: CANCELED EXECUTION!!" );
	const statusMsg = "This is a dummy message that was sent form the Main Process!!";
	event.sender.send('status-update', statusMsg);
});


//Adds 'Analysis' menu option on app's menu bar
ipc.on('add-analysis-menu', (event) => {
	console.log('DEBUG: Added <Analysis> menu bar');
	//Menu bar setup
	const menu = Menu.buildFromTemplate(menuBarTemplatePostAnalysis);
	Menu.setApplicationMenu(menu);
});

//Removes 'Analysis' menu option on app's menu bar
ipc.on('remove-analysis-menu', (event) => {
	console.log('DEBUG: Added <Analysis> menu bar');
	//Menu bar setup
	const menu = Menu.buildFromTemplate(menuBarTemplatePreAnalysis);
	Menu.setApplicationMenu(menu);
});

/************************
   Menu bar definition 
*************************/
let menuBarTemplatePreAnalysis = [{
	label: 'File',
	submenu: [{
	label: 'Exit',
	click: function (item, focusedWindow) {
		if (focusedWindow) {
			//Close the application. Will attempt to close all windows via win.close().
			app.quit();	 		
		}
	}
	}]
}];

let menuBarTemplatePostAnalysis = [{
			label: 'File',
			submenu: [{
			label: 'Exit',
			click: function (item, focusedWindow) {
				if (focusedWindow) {
					//Close the application. Will attempt to close all windows via win.close().
					app.quit();	 		
				}
			}
			}]
		},{
			label: 'Analysis',
			submenu: [{
			label: 'Perform new analysis',
			click: function (item, focusedWindow) {
				if (focusedWindow) {
					//Send signal to the Renderer process to perform new analysis
					win.webContents.send('perform-new-analysis');
				}
				}
			},
			{
			label: 'Save analysis results',
			click: function (item, focusedWindow) {
				if (focusedWindow) {
					//Send signal to the Renderer process to perform new analysis
					win.webContents.send('save-analysis-results');
				}
				}
			}]
		}];

/*************************************
   Application Function Declarations  
**************************************/

function createWindows(){  	//Function called by the application. 'on-ready' event
	displayAppInfo(); 		//Display applcation metadata information for debugging purposes TODO
	createMainWindow();		//Create and display applcation's main window

	/****************************************
   		Keyboard Shortcut registrations 
	*****************************************/
	globalShortcut.register('Up', function () {
		//Send signal to the Renderer process to change image: UP
		win.webContents.send('change-image-up');
	});

	globalShortcut.register('Down', function () {
		//Send signal to the Renderer process to change image: DOWN
		win.webContents.send('change-image-down');
	});
	
	//Menu bar setup
	const menu = Menu.buildFromTemplate(menuBarTemplatePreAnalysis);
	Menu.setApplicationMenu(menu);
}

function displayAppInfo(){
	console.log("DEBUG - App has been loaded.\n");
	console.log("-----------Reynaldo's Example App-----------");
	console.log("Application path: ", app.getAppPath());
	console.log("Home path: ", app.getPath('home'));
	console.log("App data path: ", app.getPath('appData'));
	console.log("User's desktop path: ", app.getPath('desktop'));
	console.log("\nApplication version: ", app.getVersion());
	console.log("--------------------------------------------\n\n");
}

function createMainWindow(){
	//Create a new windows with the corresponding screen specifications
	win = new BrowserWindow({width: 1200, height: 600, minWidth: 1200, minHeight: 600, resizable: false, show: false});

	//Load HTML file to render ReactJS app
	win.loadURL(url.format(
		{
			pathname: path.join(__dirname, 'public/index.html'),
			protocol:'file:',
			slashes: true
	}));

	//TODO Open DevTools for this window. For debugging purposes
	win.webContents.openDevTools();

	//--------------- Registration of  Window Events -------------

	//Event registered so we can ensure that all resources of the Web Pages are loaded before we show
	//the window to the user
	win.on('ready-to-show', function() { 
		win.show(); 
		win.focus(); 
	});

	//When the application is about to close or the user click the X button
	win.on('closed', () => {
		//Warn user if image analysis results have not been save yet 

		//Close window by dereferencing the window object.
		win = null; 
	});
	
}
