/*
 Main Results screen
 Author: Reynaldo Belfort Pierrilus
*/

import React from 'react';

//Import internal components
import ImageView from './sc_results_image_view';
import VisualizationView from './sc_results_visualization';
import NavigationView from './sc_results_navigation';
import ImageMetricsView from './sc_results_image_metrics';

//Import styles
import styles from '../styles/sc-results-main.css';

const ResultsScreen = (props) => {
	return (
		<div className={styles.results_mainContainer}>
			<div className={styles.containerOne} >
				<NavigationView />
				<ImageView/>
				<VisualizationView/>
			</div>
			<div className={styles.containerTwo}>
				<ImageMetricsView/>
			</div>
		</div>
	);

	// return (
	// 	<div>
	// 		<NavigationView className="dat-navigation-view " />
	// 		<ImageView className="dat-image-view" />
	// 		<VisualizationView className="dat-visualization-view" />
	// 		<ImageMetricsView className="dat-image-metrics-view" />
	// 	</div>
	// );
}

// class ResultsScreen extends Component {
// 	constructor(props) {
// 		super(props);

// 		this.state = { computationResults: null }; //To be determined
// 	}

// 	render () {
// 		return (
// 			<div>
// 				<NavigationView className="dat-navigation-view " />
// 				<ImageView className="dat-image-view" />
// 				<VisualizationView className="dat-visualization-view" />
// 				<ImageMetricsView className="dat-image-metrics-view" />
// 			</div>
// 		);
// 	}
// }

export default ResultsScreen;