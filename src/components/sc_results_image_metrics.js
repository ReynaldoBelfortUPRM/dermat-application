
/**********************************************
	Results Screen: ImageMetricsView component 
***********************************************/
//Functional component that defines the DOM elements that will present image data
//coming form the IPM output

// Author: Reynaldo Belfort Pierrilus, Computer Engineering Undergraduate
// University of Puerto Rico - Mayagüez

//Terminology:
//IPM - Image Processing Module

//Import necessary libraries and classes
import React, {Component} from 'react';

//Import styles
import styles from '../styles/sc-results-main.css';

const ImageMetricsView = (props) => {
	return (
	//Return DOM elements to be rendered on screen
		<div className={styles.imageMetricsView}>
			<div className={styles.metricsStyle}> 
				Image <span className={styles.metricValueColor}>{props.currentImg}</span> of {props.totalImages} | Depth: <span className={styles.metricValueColor}>{props.currentImg}</span> µm
			</div>
		</div>
	);
}

export default ImageMetricsView;