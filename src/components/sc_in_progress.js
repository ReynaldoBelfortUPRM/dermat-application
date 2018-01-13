				/*******************************
				   		In Process Screen
				********************************/
// Author: Reynaldo Belfort Pierrilus, Computer Engineering Undergraduate
// University of Puerto Rico - Mayagüez

//Terminology:
//IPM - Image Processing Module
//IPA - Image Processing Algorithm


//Import necessary libraries and classes
import React, { Component} from 'react';
import {Grid, Row, Col, Button} from 'react-bootstrap';

//Import Electron functions for interaction with Main Process
const ipc = window.require('electron').ipcRenderer;

//Import styles
import styles from '../styles/sc-imageinput-progress.css';

//TODO Import debug tools
import debug from '../debug/debugTools.js';


//Define the In Progress screen
class InProgressScreen extends Component {

	constructor(props){
		super(props);
		
		//Define screen's state
		this.state = {
			statusMessage: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
		}
	}

	/****************************************
	   ReactJS component life cycle methods
	*****************************************/

  	componentDidMount() {
    	//Send this 'InProgressScreen' object back to where it was called (App obj) so that 
		//functions on this object can be accessed from App.js
		this.props.onRef(this);
	}

	componentWillUnmount() {
		//Free memory space by removing the reference previously set
	    this.props.onRef(undefined);
	}
	//	-------------------------------------------------------

	//Send signal to the Main Process to cancel the current execution of the IPA
	cancelIpmExecution() {
		this.props.onCancel();
		ipc.send('cancel-execution');
	}

	//Updates the status message displayed on this screen
	updateStatus(statusMessage){
		this.setState({ statusMessage });
	}

	//Render the DOM elements to the screen
	render (){
			return (
			<div className={[styles.centerContent, styles.windowContainer].join(' ')}>
				<Grid>
					<Row>
						<Col md={12} className="text-center">Performing Image Analysis</Col>
						<Col md={7} className="center-block">
							<div className={styles.progress}>
								  <div className={styles.indeterminate}></div>
							</div>
						</Col>
						<Col md={12} className={[styles.statusMessageFormat, "text-center"].join(' ')}>{this.state.statusMessage}</Col>

						<Col md={12}><Button bsStyle="link" className="center-block" bsSize="large" onClick={ () => { this.cancelIpmExecution();} } >Cancel</Button></Col>
					</Row>
				</Grid>
			</div>
		);
	}
}

/******************************************
 	Inter-process communication listeners
*******************************************/

//Signals the IPM to start execution of the IPA
ipc.on('analysis-complete', (event, ipmOutputData) => {

	if(ipmOutputData){ //If there is data
		//We have recieved here the results from the execution of the IPA
		console.log("DEBUG: IPA execution finished!!! IPM output object: ", ipmOutputData); //TODO

		//Signal the application's App component that execution has finished so that transition to the 
		//Results screen can be made. Send as argument the results data:
	}

});

export default InProgressScreen;