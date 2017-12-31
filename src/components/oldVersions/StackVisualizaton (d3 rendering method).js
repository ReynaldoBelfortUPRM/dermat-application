// ----------- Stack Visualization (d3 selection rendering method) ------------
// Author: Reynaldo Belfort Pierrilus, Computer Engineering Undergraduate
// University of Puerto Rico - Mayagüez

import React, { Component } from 'react';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { select } from 'd3-selection';
// var d3Color = require('d3-color');

//Import styles
import styles from '../styles/StackVisualization.css';
//Import resources
// import SvgBracket from '../resources/GullBraceDown.svg';


//Pseudocode:

//Load data: 
	//recieve ipmResults data from props
//Format:
	//Obtain yScale for the (position & height) data visualization channels
		//Obtain max depth of the RCM stack (domain)
		//Obtain screen height dimensions (range)
		//Get scale
//Define visualization rendering (via enter)
	//Set-up SVG container
	//For each element in ipmResults.layerInfo
		//Define rectangle 
		//Set-up rectangle position 
			//X position
			//Y position
		//Set-up rectangle height
		//Set-up width
		//Set-up rectangle styles
			//Border stroke
			//Fill color - orange
		//------
		//Set-up thickness label
		//Set-up layer name label
		//Register onClick event handler


class StackVisualization extends Component {
	constructor(props){
		super(props);

		this.renderStackVisualization = this.renderStackVisualization.bind(this);
	}

	//React component lifecycle events
   componentDidMount() {
      this.renderStackVisualization();
   }

   componentDidUpdate() {
      this.renderStackVisualization();
   }

   renderStackVisualization() {

   		console.log('About to render: ', this.props.data);

		const node = this.node;

		//Obtain the maximum depth of the RCM stack inserted by the user (in micrometers)
		const minMaxStackDepth = [this.props.data.LayersInfo[0].LayerRange[0], this.props.data.LayersInfo[4].LayerRange[1]];

		//Define padding for the SVG box:
		const boxOffset = 15;

		//Obtain SVG box dimensions:
		const svgBoxDimensions = {
			width: this.props.size[0],
			height: this.props.size[1]
		};

		// const boxWidth = props.size[0];
		// const boxHeight = props.size[1];
		const stackBarDimensions = {
			width: svgBoxDimensions.width,
			height: svgBoxDimensions.height - (boxOffset * 2)
		};

		//Obtain the vertical scale to be use for the position & height visualization channels
		const yScaleStackBar = scaleLinear().
						domain([minMaxStackDepth[0], minMaxStackDepth[1]]).range([boxOffset, stackBarDimensions.height]);

		var numericArray = [];

		for(var i = 0; i < minMaxStackDepth[1]; i++){
			numericArray.push(i);
		}

		const yScaleStackBar = scaleOrdinal().
									domain(numericArray).range([boxOffset, stackBarDimensions.height])


		--------TODO DEBUG-----------
		// console.log('yScale(20):', yScaleStackBar(20)); 
		console.log('stackBarDimensions.height: ', stackBarDimensions.height)
		console.log('yScaleStackBar(1)', yScaleStackBar(1))

		//Define how the data visualization will render on the SVG box
		select(node)
			.selectAll('rect')
			.data(this.props.data.LayersInfo)
			.enter()
			.append('rect')
			//Set-up rectangle unique identifier
			.attr('id', d => d.LayerName)

			//Set-up retangle position based on data
			.attr('x', (stackBarDimensions.width / 2) + 18)
			// .attr('y', d =>  stackBarDimensions.height - yScaleStackBar(d.LayerRange[0]) )
			.attr('y', d => yScaleStackBar(d.LayerRange[0]) + 25)

			//Set-up rectangle height based on data
			.attr('width', 20)
			// .attr('height', d => (stackBarDimensions.height - yScaleStackBar(d.LayerRange[0]) ) + yScaleStackBar(d.LayerRange[1]) )
			// .attr('height', d => stackBarDimensions.height - yScaleStackBar(d.LayerRange[1]) )
			.attr('height', d => yScaleStackBar(d.LayerRange[1]) - yScaleStackBar(d.LayerRange[0]) )
			// .attr('height', 10)
			//Set-up rectange styles
			.style('fill', '#fe9922')
			.style('stroke', 'black')
			.style('stroke-opacity', 1)
			.append('text')
			.attr('x', (stackBarDimensions.width / 2) + 25)
			.attr('y', yScaleStackBar(d.LayerRange[0]) + 25)
			.attr('fill', '#fff')
			.text(d => d.LayerThickness)

	
			
			//Set-up thickness label
			//Set-up layer name label
			//Register onClick event handler

	}

	render(){
		return (
			<svg ref={node => this.node = node} width={this.props.size[0]} height={this.props.size[1]}></svg>
			);
	}

}

export default StackVisualization;