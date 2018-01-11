					/*********************************
					 		Image Input Screen
					**********************************/
// Author: Reynaldo Belfort Pierrilus, Computer Engineering Undergraduate
// University of Puerto Rico - Mayagüez

//Terminology:
//IPM - Image Processing Module
//IPA - Image Processing Algorithm

//TODO list
	//Enlarge browse button (use bsStyle attribute)

//Import necessary libraries
import React, { Component } from 'react';
import {Grid, Row, Col, Button, Modal, ListGroup, ListGroupItem} from 'react-bootstrap';

//Import Electron required electron functions
const ipc = window.require('electron').ipcRenderer;
const { app } = window.require('electron').remote;

//Import styles
import styles from '../styles/sc-imageinput-progress.css';

//TODO Import debug tools
import debug from '../debug/debugTools.js';

//Define the Image Input screen
class ImageInputScreen extends Component {

	constructor(props){
		super(props);

		//Define screen's state 
		this.state = {
			showModal: false,
			selectedPaths: [],
			imageNamesList: []
		}

		//Add 'Analysis' menu on app's menu bar
		ipc.send('remove-analysis-menu');   			//TODO Not sure if this belongs here
	}

	/****************************************
	   ReactJS component life cycle methods
	*****************************************/

  	componentDidMount() {
    	//Send this 'ImageInputScreen' object back to where it was called (App obj) so that 
		//functions on this object can be accessed from App.js
		this.props.onRef(this);
	}

	componentWillUnmount() {
		//Free memory space by removing the reference previously set
	    this.props.onRef(undefined);
	}

	//-----------------------------------------

	displayConfirmationModal(selectedPaths){

		//Create the list elements to be displayed to the user for confirmation
		const imageNamesList = selectedPaths.map( (path, i) => {

			//Obtain file names from the file paths by splitting the path into strings
			//between '/' characters. Last element should be the file name
			const fileName = path.split('\\').pop();
			return <ListGroupItem key={"listElement" + i}> {fileName} </ListGroupItem>
		});

		//Update the state of this component so we can re-trigger render() so that the modal will now be displayed
		this.setState({ selectedPaths, showModal: true, imageNamesList }); //The same as this.setState({ selectedPaths: selectedPaths });
		//TODO DEBUG 
		console.log('DEBUG: Modal Displayed. Filepaths are... ', selectedPaths);
	}

	//Signals the Main Process via IPC to execute the IPA.
	signalIpmExecution(selectedPaths) {

		//TODO VALIDATE FILE PATH FIRST!!!
		if(selectedPaths){ 
			//Creating an object that corresponds to the format that was defined in the early stages of the project
			const ipmInputObj = {
				originalImages: selectedPaths,
				characterizedImagesDest: app.getPath('appData') + "\\dermat-application\\characterized-images",
			}
			this.props.onSelectedPaths(ipmInputObj);					//Send input object back to the App component and also signal tostart execution process
			this.setState({ showModal: false });						//Hide the modal
		}
	}

	//------- Event handler for 'Browse' button ---------
	btnBrowseClick (){
		debug("Browse button clicked"); //TODO debug

		//Signal main process to open OS's file dialog
		ipc.send('open-file-dialog');
	}

	//Render the DOM elements to the screen
	render() {

		return (

			<div className={[styles.centerContent, styles.windowContainer].join(' ')}>
	  			<Grid>
	  				<Row>
	  					<Col md={12} className="text-center ">Click 'Browse' to load RCM images for analysis</Col>
	  				</Row>
	  				<Row>
	  					<Col md={12}> <Button bsStyle="primary" bSize="large" className="center-block" onClick= { () => { this.btnBrowseClick(); } }> Browse </Button> </Col>
	  				</Row>
	  			</Grid>

	  			 <Modal show={this.state.showModal} >
		          <Modal.Header closeButton =  { false } >
			            <Modal.Title>Input Confirmation</Modal.Title>
			          </Modal.Header>
			          <Modal.Body>
			            <div>
			            	<p>
			            		The following list presents the images to be analyzed where the list order is based on how the images were inserted into the application. Since the application will analyze images shown in this list in a top to bottom fashion, please verify that the order of the images is correct:
			            	</p>
			            </div>
			            <div className={[styles.confirmationList].join(' ')}>
			            	<ListGroup>
							    {this.state.imageNamesList}
						  </ListGroup>
			            </div>
			            
			          </Modal.Body>
			          <Modal.Footer>
			            <Button onClick={ () => {this.setState({ showModal: false })} }>Cancel</Button>
			            <Button bsStyle="primary" onClick={ () => { this.signalIpmExecution(this.state.selectedPaths); } }>Execute</Button>

			          </Modal.Footer>
	    		</Modal>
			</div>

		);
	}

}

export default ImageInputScreen;