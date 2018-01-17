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

/****************************************
 	Related to DermAT software installer
*****************************************/
// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent(app)) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

//---------------Rest of the required libraries and variables-------------
const jetpack = require('fs-jetpack');
const path = require('path');
const url = require('url');
require('electron-debug')({enabled: true});					//TODO Remove for final application release
const appDataPath = app.getPath('appData') + "\\" + app.getName();

//For interaction with the Renderer process
const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;


//Python related vars
var http = require('http');
var PythonShell = require('python-shell');
var pyshell = null;
var serverPort = 8080;
var dermatServer = null;

//Define application window
let win;

/*********************************
 	Electron application events
**********************************/

//Executes when Electron has finished initializing and it's ready to create BrowserWindows
app.on('ready', createWindows);

// Quit application when all windows are closed.
app.on('window-all-closed', () => {
	//Erase characterized images produced by the IPA
	eraseLocalImages();

	if (process.platform !== 'darwin') {
		app.quit();
	}
});

//TODO Function used for debugging purposes
app.on('browser-window-focus', (event, window) => {
	console.log('APP-DEBUG: focused window ID:' + window.id); 
});



//Remove if not needed TODO
// app.on('will-quit', function () {
// 	globalShortcut.unregisterAll();
// });

/******************************************
 	Inter-process communication listeners
*******************************************/
// These functions are defined for interaction with the app's renderer process

//Executes the command for opening the OS's OpenFile dialog. Returns back an array of paths selected by the user
ipc.on('open-file-dialog', (event) => {

	// const options = {
	//     properties: ['openFile', 'multiSelections'],
	//     filters: [
	// 	    {name: 'RCM Images', extensions: ['png']},
	// 	  ]
	// };

	const options = {
		title: 'Open RCM images',
	    properties: ['openDirectory'],
	};

	 dialog.showOpenDialog(options, 
	  function (folderPaths) {
		    if (folderPaths){
		    	event.sender.send('selected-input-folder', folderPaths[0]);	
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
		pyshell = new PythonShell(appDataPath + '\\test_script.py');
		pyshell.send(JSON.stringify(ipmInputData));

		/************************
		   Python definitions 
		*************************/
		// (TEST OUTPUT)
		pyshell.on('message', function (message) {
		  // received a message sent from the Python script (a simple "print" statement)
		    console.log(message);
		    output = JSON.parse(message)
		    if (output.messageType == 'status'){

		      //Signal the InProcessScreen component to send a status message
			  win.webContents.send('status-update',output.data);
		      console.log(output.data);
		    
		    }
		    else if (output.messageType == 'results'){
		      
		      win.webContents.send('analysis-complete',output.data);
		      console.log(output.data);

			}
			else if (output.messageType == 'error'){ //The IPA could not classify appropiately the images
				
			  win.webContents.send('analysis-error',output.data);
		      console.log(output.data);
			}
		});

		pyshell.end(function (err) {
		  if (err) throw err;
		  console.log('Program ended normally');
		});

		console.log("DEBUG: Image Processing Algorithm has started! IPM input object: "); //TODO
		// console.log("DEBUG: Image Processing Algorithm has started! IPM input object: ", ipmInputData); //TODO
	}

});

//Signals the IPM to cancel IPA execution
ipc.on('cancel-execution', (event) => {

	//HERE WE SIGNAL THE IMAGE PROCESSING ALGORITHM TO STOP ALGORITHM EXECUTION
	
	//Kill option
	// console.log(`Spawned child pid: ${pyshell.childProcess.pid}`);
    // pyshell.childProcess.kill(-pyshell.pid);


	console.log(serverPort);

	dermatServer = http.createServer(function (req, res) {
		res.write('end'); //write a response to the client
  		res.end(); //end the response
	}).listen(serverPort);


	setTimeout(() => {
		dermatServer.close(); //the server object listens on port 8080
		//SIGNAL RENDERER HERE THAT PYTHON HAS CLOSED.
	}, 5000);

	console.log("DEBUG: CANCEL SIGNAL SENT!!" );
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
   Menu bar definitions 
*************************/
//Used when we are not at the results screen
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
},
];

//Used at the results screen
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
		},
		{
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
		},
		{
			visible: false,
			submenu: [{
					label: 'Change image: Up',
					accelerator: 'Up',
					visible: false,
					click: function (item, focusedWindow) {
						if (focusedWindow) {
							//Send signal to the Renderer process to change image: UP
							win.webContents.send('change-image-up');
						}
					}
					},{
					label: 'Change image: Down',
					accelerator: 'Down',
					visible: false,
					click: function (item, focusedWindow) {
						if (focusedWindow) {
							//Send signal to the Renderer process to change image: DOWN
							win.webContents.send('change-image-down');
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

	//Menu bar setup
	const menu = Menu.buildFromTemplate(menuBarTemplatePreAnalysis);
	Menu.setApplicationMenu(menu);
}

function displayAppInfo(){
	console.log("DEBUG - App has been loaded.\n");
	console.log("-------DermAT Application Information-------");
	console.log("Application path: ", app.getAppPath());
	console.log("Home path: ", app.getPath('home'));
	console.log("App data path: ", app.getPath('appData'));
	console.log("User's desktop path: ", app.getPath('desktop'));
	console.log("\nApplication version: ", app.getVersion());
	console.log("--------------------------------------------\n\n");
}

function createMainWindow(){
	//Create a new windows with the corresponding screen specifications
	win = new BrowserWindow({
		width: 1200, 
		height: 600, 
		minWidth: 1200, 
		minHeight: 600, 
		resizable: false, 
		show: false,
		icon: __dirname + "\\assets\\resources\\dermat-icon.ico"
	});

	//Load HTML file to render ReactJS app
	win.loadURL(url.format(
		{
			pathname: path.join(__dirname, 'dist/index.html'),
			protocol:'file:',
			slashes: true
	}));

	//TODO Open DevTools for this window. For debugging purposes
	// win.webContents.openDevTools();

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

//Function erases all characterized images produced by the IPA
function eraseLocalImages(){
	var characterizedImagesPath = appDataPath + "\\characterized-images";
	var relativeImageFilePaths = jetpack.find(characterizedImagesPath, {files: true, matching: "*.png" } );
	//Erase images one by one
	relativeImageFilePaths.forEach( (path) =>{
		jetpack.remove(path);
	});
}


/****************************************
 	Related to DermAT software installer
*****************************************/

function handleSquirrelEvent(application) {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {
                detached: true
            });
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            application.quit();
            return true;
    }
};
