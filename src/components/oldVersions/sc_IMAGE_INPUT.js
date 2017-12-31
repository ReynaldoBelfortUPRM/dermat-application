/*
 Image Input screen
 Author: Reynaldo Belfort Pierrilus
*/

import React from 'react';
import {Grid, Row, Col, Button} from 'react-bootstrap';

import styles from '../styles/sc-imageinput-progress.css';

const ImageInputScreen = (props) => {


	return (

		<div className={[styles.centerContent, styles.windowContainer].join(' ')}>
  			<Grid>
  				<Row>
  					<Col md={12} className="text-center ">Click 'Browse' to load RCM images for analysis</Col>
  				</Row>
  				<Row>
  					<Col md={12}> <Button bsStyle="primary" bSize="large" className="center-block">Browse</Button> </Col>
  				</Row>
  			</Grid>
		</div>

	);

	// return (
	// 	<Grid className={styles.containerTable}>
	// 		<Row className={styles.verticalCenterRow}>
	// 			<Col md={4} mdOfffset={4} className="text-center"> Hola a todos</Col>
	// 		</Row>	
	// 	</Grid>
	// );


	// return (
	// 	<div className="site-wrapper">
	// 		<div className="site-wrapper-inner">
	// 			<div className="row">
	// 				<div className="col-md-12">Click 'Browse' to load RCM images for analysis.</div>
	// 			</div>
	// 			<div className="row">
	// 				<div className="btn btn-lg btn-primary">
	// 					Browse
	// 				</div>
	// 			</div>
	// 		</div>
	// 	</div>
	// );

	// 	return (
	// 	<div className="site-wrapper">
	// 		<div className="center-block">
	// 			<div className="row">
	// 				<div className="col-md-12">Click 'Browse' to load RCM images for analysis.</div>
	// 			</div>
	// 			<div className="row">
	// 				<div className="btn btn-lg btn-primary">
	// 					Browse
	// 				</div>
	// 			</div>
	// 		</div>
	// 	</div>
	// );


	// return (
	// 	<div className="site-wrapper">
	// 		<div className="site-wrapper-inner">
 //                <div className="cover-container">
 //                    <div className="inner cover">
 //                        <h1 className="cover-heading">MusicVenue</h1>
 //                        <p className="lead">A Social Network Dedicated to Connect Musicians</p>
 //                        <p className="lead"><a href="register.html" className="btn btn-lg btn-default">Sign-up</a><a href="login.html"><button type="button" className="btn btn-lg btn-default button-margins">Log-in</button></a></p>
 //                    </div>
 //                    <div className="mastfoot">
 //                        <div className="inner">
 //                            <p>A place brought you by the <span className="footer-style"> CoffeeSquad</span>team.</p>
 //                        </div>
 //                    </div>
 //                </div>
 //            </div>
	// 	</div>
	// );
}

export default ImageInputScreen;