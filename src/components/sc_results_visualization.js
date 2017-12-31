/************************************************
	Results Screen: VisualizationView component
************************************************/

//Functional component that defines the space where the StackVisualization and the 
//list of images will be displayed.

// Author: Reynaldo Belfort Pierrilus, Computer Engineering Undergraduate
// University of Puerto Rico - Mayagüez

//Import necessary libraries and classes
import React, {Component} from 'react';
import { Panel, ListGroup, ListGroupItem } from 'react-bootstrap';

//TODO For debugging purposes:
// import BarChart from './tempCode/BarChart.js';
import dummyData from './dummyData/ipmOutputDummyData.js';

//Import internal components
import StackVisualization from './StackVisualization.js'

//Import Styles
import styles from '../styles/sc-results-main.css';

const VisualizationView = (props) => {
		console.log('Debug VisualizationView: ', props); 		//TODO DEBUG

		const ipmData = props.currentState.ipmData;
		
		//Create the stack visualization list to be rendered on screen
		var currentImageList = []; //TODO Remove if not neded
		const currentLayerLabel = ipmData.layerData[props.currentState.selectedLayerIdx].LayerName;
		const selectedLayerInfoObj = ipmData.layerData[props.currentState.selectedLayerIdx];
		const rangeMinVal = selectedLayerInfoObj.LayerRange[0] - 1; 		//subtract by 1 so we consider index starting at 0
		const rangeMaxVal = selectedLayerInfoObj.LayerRange[1] - 1; 		//subtract by 1 so we consider index starting at 0
		console.log('debug [rangeMinVal, rangeMaxVal] : ', rangeMinVal, rangeMaxVal);  

		//Create the list of images that correspond to the selected layer
		for(var i = rangeMinVal; i <= rangeMaxVal; i++ ){
			const fileName = ipmData.originalImages[i].split('\\').pop();
			const imageIdx = i; 	//For some reason, is important to save the index value in a separate var if we want the DOM element to preserve this value
			currentImageList.push(<ListGroupItem key={"imgListItm_" + i} onClick={ (event) => { props.imageClicked(imageIdx);  } }>{fileName}</ListGroupItem>)
		}

		//Render the DOM elements to the screen
		return (
			<div className={[styles.resultsWindow, styles.visualizationView].join(' ')}>
					<div className={[styles.vizItem, styles.vizBox].join(' ')}>
					 <StackVisualization currentState = { props.currentState } size={ [300, 500]} binClicked= { (layerIndex) => { props.binClicked(layerIndex)} } />
					</div>
					<div className={[styles.vizItem, styles.vizList].join(' ')}>
					    <Panel header={currentLayerLabel}>
					       <ListGroup>
							    {currentImageList}
						  </ListGroup>
					    </Panel>
					</div>
			</div>
		);
};

export default VisualizationView;