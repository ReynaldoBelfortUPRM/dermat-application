/*
 Author: Reynaldo Belfort Pierrilus
*/

/* TODO 
	- COMENTAR TODO EL CÓDIGO, EXPLICANDO LAS FUNCIONES DE CADA COSA.
	- Poner primera letra de propiedades de dummyData lower case e.g. 'layersInfo'
	- Change folder names on application file structure
	- FIX padding issue on results view <div>, so that borders can be seen appropiately
	- Figure out a way to load local .css files
	- Figure out a way to incorporate webpack into electron
	- Save 'npm list --depth=0' problems.
*/

//Import libraries
import React from 'react';
import ReactDOM from 'react-dom';

//Import stylesheets
// import styles from './styles/app-styles.css';
// require('./styles/app-styles.css');
// require('../node_modules/bootstrap/dist/css/bootstrap.min.css');

//Import major components
import ImageInputScreen from './components/sc_image_input';
import InProgressScreen from './components/sc_in_progress';
import ResultsScreen from './components/sc_results_main';

//Import styles
import styles from './styles/sc-imageinput-progress.css';

//This functional component will server as the viewer for the 
//different screens to be implemented
const App = (props) => {

	return (
			// <ImageInputScreen/>
			// <InProgressScreen/>
			 <ResultsScreen/>
		);

	// return (
	// 	<div className={styles.appContainer}>
	// 		// <ImageInputScreen/>
	// 		<InProgressScreen/>
	// 		// <ResultsScreen className="dat-results-sc"/>
	// 		//<div className="dat-results-sc">
	// 		//	<div className="dat-navigation-view "></div>
	// 		//	<div className="dat-image-view"></div>
	// 		//	<div className="dat-visualization-view"></div>
	// 		//	<div className="dat-image-metrics-view"></div>
	// 		//</div>
	// 	</div>
	// 	);
};

ReactDOM.render(<App/>, document.querySelector('.react-container') ); 