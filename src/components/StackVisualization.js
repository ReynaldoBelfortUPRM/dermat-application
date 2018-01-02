/*************************************************
		Results Screen: Stack Visualization 
*************************************************/

//Class component that defines the data visualization to be rendered on screen 
//based on the data provided by the Image Processing Module.

// Author: Reynaldo Belfort Pierrilus, Computer Engineering Undergraduate
// University of Puerto Rico - Mayagüez

//Terminology:
//IPM - Image Processing Module
//IPA - Image Processing Algorithm

//TODO List
	//- Display brackets for thickness values
	//- Is this should be a Functionaly component instead???
	//Check issues in other TODOS in this doc

//IMPROVEMENTS LIST FOR: Stack Visualization
	//Convert StackVisualization component into a functional component
	//Responsive svg element (auto-resize visualization)

//Import necessary libraries and classes
import React, { Component } from 'react';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { select } from 'd3-selection';
import _ from 'lodash';
var d3Color = require('d3-color');

//Import styles
import styles from '../styles/StackVisualization.css';

//Import resources TODO
// import SvgBracket from '../resources/GullBraceDown.svg';

//Define the StackVisualization component
const StackVisualization = (props) => {

	const ipmData = props.currentState.ipmData;

	/***********************
		DOM Event Handlers
	************************/
	const binSelected = (svgBinTextElems, index) => {
		//Signal the 'sc_results_main' component that a bin has clicked to update the DOM
		props.binClicked(index); 
	}

	// console.log('About to render: ', props.data); 		//TODO DEBUG

	//Obtain SVG box dimensions:
	const svgBoxDimensions = {  //TODO Using an object to save dimensions is not consistent with other variables that also has 'dimensions' in its names
		width: props.size[0],
		height: props.size[1]
	};

	//Obtain the maximum depth of the RCM stack inserted by the user (in micrometers)
	const minMaxStackDepth = [ipmData.layerData[0].LayerRange[0], ipmData.layerData[4].LayerRange[1]]; //Format ['minimum', 'maximum']

	//Define rendering constants
	const boxPadding = 15; 			//SVG box padding
	const stackCoverHeight = 10;	//Height of stack cover's rectangle
	const textOffset = 25;			//To consider long texts specified in the IPM output

	//Define stack cover constants
		const stackCoverDimensions = [100, 15]; 		//['width', 'height']
		const stackOutsideSpace = boxPadding + stackCoverDimensions[1];
		//Set-up cover coordinates
		const coverTopX = 120;
		const coverTopY =  boxPadding;
		const coverBottomX = 120; 
		const coverBottomY = svgBoxDimensions.height - stackOutsideSpace; 

	const stackBarDimensions = {
		width: svgBoxDimensions.width - (boxPadding * 2),
		height: svgBoxDimensions.height - stackOutsideSpace,
	};

	//Define colors for each layer known to exist in an RCM image stack
	const layerColors = [
		d3Color.hsl(120, 0.65, 0.5) + '', //green
		d3Color.hsl(36, 0.65, 0.5) + '', //orange
		d3Color.hsl(0, 0.65, 0.5) + '', //red
		d3Color.hsl(180, 0.65, 0.5) + '', //cyan
		d3Color.hsl(330, 0.65, 0.5) + '', //hot pink
	];

	//Obtain the vertical scale to be use for the position & height visualization channels
	const yScaleStackBar = scaleLinear().
					domain([minMaxStackDepth[0], minMaxStackDepth[1]]).range([stackOutsideSpace, stackBarDimensions.height]);

	//Render a stack bin, layer title and thickness label for every element in LayersInfo
	const layerElements = ipmData.layerData.map((d,i) => {
			//Define bin rendering characteristics
			const binX = (stackBarDimensions.width / 2) + textOffset;
			const binY = yScaleStackBar(d.LayerRange[0]);
			const binWidth = 20;
			const binHeight = yScaleStackBar(d.LayerRange[1]) - yScaleStackBar(d.LayerRange[0]);
			const layerIDSubstring = d.LayerName + '_' + d.LayerID;
			const thicknessValue = d.LayerThickness + ' µm';

			//Set-up bin's text information
			var textStyles = [styles.stackThicknessText];
			var focusStyle = null;

			//Highlight the bin's text elements if this bin was selected
			if(props.currentState.selectedLayerIdx >= 0 && _.isEqual(i, props.currentState.selectedLayerIdx) ){
				focusStyle = styles.focusedBin;
			}
			textStyles.push(focusStyle);

			//Define label and thickness value SVG elements
			const thickValSVG = <text key ={ 'thickVal_' + layerIDSubstring} strokeOpacity = {1} strokeWidth = {0.45}   className={textStyles.join(' ') } x={ binX + 35 } y={ binY + (binHeight / 2)}  fill="#fff" >{thicknessValue}</text>;
			const layerNameSVG = <text key ={ 'layName_' + layerIDSubstring} strokeOpacity = {1} strokeWidth = {0.45}  className={textStyles.join(' ') } x={ binX - 140 } y={ binY + (binHeight / 2)} textAnchor="start" fill="#fff">{d.LayerName}</text>;

			//Prepare the text to be rendered on screen corresponding to this bin
			const svgBinTextElems = [];
			svgBinTextElems.push(thickValSVG);
			svgBinTextElems.push(layerNameSVG);

			//Return DOM elements to be rendered on screen
			return (
					<g key = {'group_' + layerIDSubstring + '_' + i}>
						<rect key ={'bin_' + layerIDSubstring} 
							x={binX} 
							y={binY}
							width = {binWidth}
							height = { binHeight }
							fill = {layerColors[i]}
							strokeOpacity = {1}
							onClick= { () => { binSelected(svgBinTextElems, i); } }
							className = {[styles.stackBin, focusStyle].join(' ')}
							/>

						{svgBinTextElems}
					</g>
				);
		});

	//Define DOM elements for the stack covers
	const stackCovers = (<g> 
							<rect
								x = { coverTopX }
								y = { coverTopY }
								width = { stackCoverDimensions[0]  }
								height = { stackCoverDimensions[1] }
								fill = { d3Color.hsl(120, 0, 0.95) }
								stroke = "black"
								strokeOpacity = {1} 
								/>
							<rect
								x = { coverBottomX }
								y = { coverBottomY }
								width = { stackCoverDimensions[0]  }
								height = { stackCoverDimensions[1] }
								fill = {d3Color.hsl(120, 0, 0.95)}
								stroke = "black"
								strokeOpacity = {1} 
								/>
						</g>);

	//Return DOM elements to be rendered on screen
	return (
			<svg width={props.size[0]} height={props.size[1]}>
				{layerElements}
				{stackCovers}
			</svg>
		);
}

//TODO Remove if not needed
// class StackVisualization extends Component {

// 	constructor(props){
// 		super(props);

// 		this.state ={
// 			selectedBin: 0, //this will allow the app to highlight the currently selected bin. Default is 'stratum corneum' layer
// 		};
// 	}

// 	/***********************
// 		DOM Event Handlers
// 	************************/
// 	binSelected(thisObj, svgBinTextElems, index){
// 		//Signal the 'sc_results_main' component that a bin has clicked to update the DOM
// 		thisObj.props.binClicked(index); 
// 		//Update state so that ReactJS can re-render the visualization
// 		thisObj.setState({ selectedBin: index });
// 	}

// 	//Render the DOM elements to the screen
// 	render(){

// 		// console.log('About to render: ', this.props.data); 		//TODO DEBUG

// 		//Obtain SVG box dimensions:
// 		const svgBoxDimensions = {  //TODO Using an object to save dimensions is not consistent with other variables that also has 'dimensions' in its names
// 			width: this.props.size[0],
// 			height: this.props.size[1]
// 		};

// 		//Obtain the maximum depth of the RCM stack inserted by the user (in micrometers)
// 		const minMaxStackDepth = [this.props.data.LayersInfo[0].LayerRange[0], this.props.data.LayersInfo[4].LayerRange[1]]; //Format ['minimum', 'maximum']

// 		//Define rendering constants
// 		const boxPadding = 15; 			//SVG box padding
// 		const stackCoverHeight = 10;	//Height of stack cover's rectangle
// 		const textOffset = 25;			//To consider long texts specified in the IPM output

// 		//Define stack cover constants
// 			const stackCoverDimensions = [100, 15]; 		//['width', 'height']
// 			const stackOutsideSpace = boxPadding + stackCoverDimensions[1];
// 			//Set-up cover coordinates
// 			const coverTopX = 120;
// 			const coverTopY =  boxPadding;
// 			const coverBottomX = 120; 
// 			const coverBottomY = svgBoxDimensions.height - stackOutsideSpace; 

// 		const stackBarDimensions = {
// 			width: svgBoxDimensions.width - (boxPadding * 2),
// 			height: svgBoxDimensions.height - stackOutsideSpace,
// 		};

// 		//Define colors for each layer known to exist in an RCM image stack
// 		const layerColors = [
// 			d3Color.hsl(120, 0.65, 0.5) + '', //green
// 			d3Color.hsl(36, 0.65, 0.5) + '', //orange
// 			d3Color.hsl(0, 0.65, 0.5) + '', //red
// 			d3Color.hsl(180, 0.65, 0.5) + '', //cyan
// 			d3Color.hsl(330, 0.65, 0.5) + '', //hot pink
// 		];

// 		//Obtain the vertical scale to be use for the position & height visualization channels
// 		const yScaleStackBar = scaleLinear().
// 						domain([minMaxStackDepth[0], minMaxStackDepth[1]]).range([stackOutsideSpace, stackBarDimensions.height]);

// 		//Render a stack bin, layer title and thickness label for every element in LayersInfo
// 		const layerElements = this.props.data.LayersInfo.map((d,i) => {
// 				//Define bin rendering characteristics
// 				const binX = (stackBarDimensions.width / 2) + textOffset;
// 				const binY = yScaleStackBar(d.LayerRange[0]);
// 				const binWidth = 20;
// 				const binHeight = yScaleStackBar(d.LayerRange[1]) - yScaleStackBar(d.LayerRange[0]);
// 				const layerIDSubstring = d.LayerName + '_' + d.LayerID;
// 				const thicknessValue = d.LayerThickness + ' µm';

// 				//Set-up bin's text information
// 				var textStyles = [styles.stackThicknessText];
// 				var focusStyle = null;

// 				//Highlight the bin's text elements if this bin was selected
// 				if(this.state.selectedBin >= 0 && _.isEqual(i, this.state.selectedBin) ){
// 					focusStyle = styles.focusedBin;
// 				}
// 				textStyles.push(focusStyle);

// 				//Define label and thickness value SVG elements
// 				const thickValSVG = <text key ={ 'thickVal_' + layerIDSubstring} strokeOpacity = {1} strokeWidth = {0.45}   className={textStyles.join(' ') } x={ binX + 35 } y={ binY + (binHeight / 2)}  fill="#fff" >{thicknessValue}</text>;
// 				const layerNameSVG = <text key ={ 'layName_' + layerIDSubstring} strokeOpacity = {1} strokeWidth = {0.45}  className={textStyles.join(' ') } x={ binX - 140 } y={ binY + (binHeight / 2)} textAnchor="start" fill="#fff">{d.LayerName}</text>;

// 				//Prepare the text to be rendered on screen corresponding to this bin
// 				const svgBinTextElems = [];
// 				svgBinTextElems.push(thickValSVG);
// 				svgBinTextElems.push(layerNameSVG);

// 				//Return DOM elements to be rendered on screen
// 				return (
// 						<g key = {'group_' + layerIDSubstring + '_' + i}>
// 							<rect key ={'bin_' + layerIDSubstring} 
// 								x={binX} 
// 								y={binY}
// 								width = {binWidth}
// 								height = { binHeight }
// 								fill = {layerColors[i]}
// 								strokeOpacity = {1}
// 								onClick= { () => { this.binSelected(this, svgBinTextElems, i); } }
// 								className = {[styles.stackBin, focusStyle].join(' ')}
// 								/>

// 							{svgBinTextElems}
// 						</g>
// 					);
// 			});

// 		//Define DOM elements for the stack covers
// 		const stackCovers = (<g> 
// 								<rect
// 									x = { coverTopX }
// 									y = { coverTopY }
// 									width = { stackCoverDimensions[0]  }
// 									height = { stackCoverDimensions[1] }
// 									fill = { d3Color.hsl(120, 0, 0.95) }
// 									stroke = "black"
// 									strokeOpacity = {1} 
// 									/>
// 								<rect
// 									x = { coverBottomX }
// 									y = { coverBottomY }
// 									width = { stackCoverDimensions[0]  }
// 									height = { stackCoverDimensions[1] }
// 									fill = {d3Color.hsl(120, 0, 0.95)}
// 									stroke = "black"
// 									strokeOpacity = {1} 
// 									/>
// 							</g>);

// 		//Return DOM elements to be rendered on screen
// 		return (
// 			<svg width={this.props.size[0]} height={this.props.size[1]}>
// 				{layerElements}
// 				{stackCovers}
// 			</svg>
// 			);
// 	}
// }

export default StackVisualization;