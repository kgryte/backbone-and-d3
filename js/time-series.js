/**
*	A reusable time series statistical graphic with Backbone.js and D3.js
*
*
*
*	Author:
*		Kristofer Gryte
*		http://www.kgryte.com
*
*	History:
*		2013/06/12 - KGryte. Created.
*
*
*	TODO:
*		[1] Decouple view 'data' from view itself. Create a chart model (?) --> a work in progress
*		[2] Validate model data
*		[3] Parse input options for view
*		[4] Stipulate updates
*		[5] Note that xScale and yScale are polymorphic in the data layer --> this makes sense due to data binding; data allows us to calculate domains; each layer should be independent of children inheritors.
*		[6] Change axis implementation. Currently, external modification does not make sense, as axis is translated beyond user control
*		[7] 
*		[8] Hover/Highlight --> should individual circles be created and hidden, shown on hover? Tooltip to obtain values? 
*		[9] Time series colors (include more classes)
*		[10] Ensure standard data representation
*		[11] Allow for ChartModel axis min and max setting (both axes) --> perform CHECKS! Use underscore.js
*		[12] Switch the order such that axes plotted on top of data (?)
*		[13] Bind change events so views auto-update when model changes
*		[14] Resolve the tension between the animation layer and, say, the data layer with regard to transitions. Question to answer: are transitions something fundamental to the graph (to its normal functioning)? If so, then transitions in the data layer; otherwise, something extra (gratuitus)
*		[15] 
*
*
*
*	 Copyright (c) 2013. Kristofer Gryte. http://www.kgryte.com
*	 License: MIT (http://www.opensource.org/licenses/mit-license.php)
*
*/



//////////////////////
// 		Models   	//
//////////////////////

// Individual data points:
var DataPoint = Backbone.Model.extend({

	// Set the default coordinates for an individual data point:
	defaults: function() {
		return {
			'x': 0, // default is two-dimensions
			'y': 0
		};
	},

	// The basic type in a time series is a point:
	type: "point"

});


// Individual data series:
var DataSeries = Backbone.NestedModel.extend( {

	// Set the default format for an individual data series:
	defaults: function() {
		return {
			'dataSeries': [] // default is an array of DataPoints
		};
	},

	// A collection of data points is of type data series:
	type: "dataSeries"

});


// Chart Model:
var ChartModel = Backbone.Model.extend({

	// Set the default chart parameters:
	defaults: {

		// Chart area specifications:
		margin: { 
			// for the graph, margin; for the canvas, this is padding
			top: 20,
			right: 20,
			bottom: 50,
			left: 80
		},
		canvas: {
			width: 960,
			height: 500
		},

		// Axis labels:
		xLabel: 'x',
		yLabel: 'y',

		// Axis limits; keywords: 'min' and 'max' to auto-calculate the respective limit; leave empty to auto-calculate both limits
		xDomain: [], // xLimits
		yDomain: [0, 'max'], // yLimits

		// Line colors:
		colors: ['g','r','k','b'], // these correspond to CSS classes

		// Data smoothing:
		interpolation: 'linear',

		// Animation parameters:
		animation: {
			'onEnter': {
				'duration': 1000,
				'easing': 'linear'
			},
			'onUpdate': {
				'duration': 1000,
				'easing': 'linear'
			},
			'onExit': {
				'duration': 1000,
				'easing': 'linear'
			}
		}, 

		// Transition parameters:
		transition: {
			'onEnter': {
				'duration': 1000,
				'easing': 'linear'
			},
			'onUpdate': {
				'duration': 1000, // this parameter should be tuned to the velocity of incoming data
				'easing': 'linear'
			},
			'onExit': {
				'duration': 1000,
				'easing': 'linear'
			}
		},

		// Plot mode: (primarily targeted toward real-time data feeds)
		mode: 'window' // options: window, add, dynamic, (others?)

	}

});



//////////////////////
// 	  COLLECTION  	//
//////////////////////


// A line chart is a set of data series, each a collection of data points:
var DataCollection = Backbone.Collection.extend({

	// A data series will serve as the basic unit for our collection:
	model: DataSeries

});




//////////////////////
//	  	VIEWS 		//
//////////////////////


// Create the base chart layer (the canvas):
var ChartBase = Backbone.View.extend({

	initialize: function( options ) {
		// 
	},

	render: function() {

		this.initCanvas();

		return this;

	},

	initCanvas: function() {

		// Initialize the layers object:
		this.layer = {};

		// Get the graph size:
		this.model.set( 'graph', this.graphSize() );

		// Create local variables to make the code less verbose:
		var element = this.el,
			canvas = this.model.get('canvas'),
			margin = this.model.get('margin'),
			graph = this.model.get('graph');

		
		// Create the canvas:
		this.layer.base = d3.select( element ).append("svg:svg")
			.attr('width', canvas.width)
			.attr('height', canvas.height)
			.attr('class', 'base mvcChart');

		// Initialize the chart area:
		this.layer.chart = this.layer.base.append("svg:g")
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			.attr('class', 'chart');

		// Append a path clipper, defining the data viewport:
		var numCharts = d3.selectAll('.mvcChart')[0].length,
			clipPathID = 'graphClipPath' + numCharts;

		this.model.set( 'clipPath', '#' + clipPathID );

		this.layer.chart.append("svg:defs")
			.append("svg:clipPath")
				.attr("id", clipPathID)
				.append("svg:rect")
					.attr("width", graph.width)
					.attr("height", graph.height);

		return this;

	},

	graphSize: function() {
		var canvas = this.model.get('canvas'),
			margin = this.model.get('margin');
		return {
			width: canvas.width - margin.left - margin.right,
			height: canvas.height - margin.top - margin.bottom
		}
	}	

});



// Create the Axes layer:
var ChartArea = ChartBase.extend({

	initialize: function( options ) {
		// This overrides any inherited initialize functions.
	},

	render: function() {

		// [1] Create the canvas, [2] Generate the axes
		this.initCanvas()
			.initAxes();

		return this;

	},

	initAxes: function() {

		// Extend the layer object:
		this.layer.axis = {};

		// Set the scales and both axis:
		this.xScale()
			.yScale()
			.xAxis()
			.yAxis();			

		// Local variables:
		var graph = this.model.get('graph'),
			margin = this.model.get('margin'),
			xLabel = this.model.get('xLabel'),
			yLabel = this.model.get('yLabel'),
			xAxis = this.model.get('xAxis'),
			yAxis = this.model.get('yAxis');		

		// Create the axes:
		this.layer.axis.x = this.layer.chart.append("svg:g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + graph.height + ")")
			.call( xAxis );

		this.layer.axis.x.append("svg:text")
			.attr("y", 40)
			.attr("x", graph.width / 2)
			.attr("text-anchor", "middle")
			.attr("class", "label")
			.text( xLabel );

		this.layer.axis.y = this.layer.chart.append("svg:g")
			.attr("class", "y axis")
			.call( yAxis );

		this.layer.axis.y.append("svg:text")
			.attr("transform", "rotate(-90)")
			.attr("y", -(margin.left-6))
			.attr("dy", ".71em")
			.attr("x", -(graph.height / 2))
			.attr("text-anchor", "middle")
			.attr("class", "label")
			.text( yLabel );

		return this;
		
	},


	xScale: function( __ ) {

		var xScale;
		if (!arguments.length) {
			xScale = d3.scale.linear(); // Default
		}else {
			// Allow external setting of the scale:
			xScale = __; 
		}; // end IF/ELSE

		// Get the graph width:
		var width = this.model.get('graph').width;
		
		// Set the scale range:
		xScale.range( [0, width] );

		// Update our chart model:
		this.model.set('xScale', xScale);

		return this;

	},

	yScale: function( __ ) {

		var yScale;
		if (!arguments.length) {
			yScale = d3.scale.linear().nice(); // Default
		}else {
			// Allow external setting of the scale:
			yScale = __; 
		}; // end IF/ELSE

		// Get the graph height:
		var height = this.model.get('graph').height;

		// Set the scale range:
		yScale.range( [height, 0] );

		// Update our chart model:
		this.model.set('yScale', yScale);	

		return this;	
			
	},

	xAxis: function( __ ) {

		var xAxis = d3.svg.axis()
			.scale( this.model.get('xScale') );

		if (!arguments.length) {
			xAxis.orient('bottom'); // Default
		}else {
			// Allow external setting of the axis:
			xAxis.orient( __ );
		}

		// Update our chart model:
		this.model.set('xAxis', xAxis);

		return this;

	},

	yAxis: function( __ ) {
		
		var yAxis = d3.svg.axis()
			.scale( this.model.get('yScale') );

		if (!arguments.length) {
			yAxis.orient('left'); // Default
		}else {
			// Allow external setting of the axis:
			yAxis.orient( __ );
		}

		// Update our chart model:
		this.model.set('yAxis', yAxis);

		return this;

	},

	updateAxes: function(){

		// Refresh our scales and axes:
		this.xScale()
			.yScale()
			.xAxis()
			.yAxis();

		var xAxis = this.model.get('xAxis'),
			yAxis = this.model.get('yAxis');	

		// Axes Labels
		this.layer.axis.x.call( xAxis )
			.selectAll('.label')
			.text( this.model.get('xLabel') );
		
		this.layer.axis.y.call( yAxis )
			.selectAll('.label')
			.text( this.model.get('yLabel') );

	}

});






// Create the line chart layer:
var DataLayer = ChartArea.extend({

	initialize: function( options ) {	
		// This overrides any inherited initialize functions.
	},

	render: function() {

		// [1] Create the canvas, [2] Initialize the data, [3] Generate the axes, [4] Bind the data, [5] Plot the data
		this.initCanvas()
			.initData()
			.initAxes() // TODO: need to switch the order. Draw the axes atop the data; order matters.
			.bindData()
			.plot();
			
		return this;

	},

	plot: function() {

		// Get the color choices:
		var colorClasses = this.model.get('colors'),
			numColors = colorClasses.length;

		// Create the path generator:
		this.line();

		// Get the path generator:
		var line = this.model.get('line');
		
		// Generate the lines:
		this.layer.data.paths.attr("d", function(d,i) { 
				return line( d.get('dataSeries') ); 
			} )
			.each( function(d,i) {
				// Loop back through the colors if we run out!
				var color = colorClasses[ i % numColors ];
				d3.select(this).classed( color, 1 ); 
			});

		return this;
		
	},

	initData: function() {

		// Get the number of data series:
		var numSeries = this.collection.length;

		// NOTE: data is an array of arrays; we perform a shallow copy to avoid duplication; we store the copy as a convenience method
		this.data = this.collection.slice( 0, numSeries );

		// Store the number of time series:
		this.model.set('numSeries', numSeries );

		// Calculate the x- and y-offsets:
		this.model.set( { 
			'xOffset': this.min('x'), 
			'yOffset': this.min('y') 
		} );

		return this;

	},

	min: function( key ) {
		return d3.min( this.data, function(d) { 
			return d3.min( d.get('dataSeries'), function(dataPt) { 
				return dataPt[ key ]; 
			}); 
		});
	},

	max: function( key ) {
		return d3.max( this.data, function(d) { 
			return d3.max( d.get('dataSeries'), function(dataPt) { 
				return dataPt[ key ]; 
			}); 
		});
	},

	bindData: function() {

		// Extend the layer object:
		this.layer.data = {};

		// Create a group for all data series:
		this.layer.data.base = this.layer.chart.append("svg:g")
				.attr("class", "data-series");

		// Include a path clipper to prevent layer spillover:
		this.layer.data.clipPath = this.layer.data.base.append("svg:g") 
			.attr("clip-path", "url(" + this.model.get( 'clipPath' ) +  ")");

		// Bind the data and initialize the path elements:
		this.layer.data.paths = this.layer.data.clipPath.selectAll(".line")
			.data( this.data ) 
		  .enter() // create the enter selection
		  	.append("svg:path")
				.attr("class", function(d,i) { 
					return "line " + "line" + i; 
				});

		return this;

	},

	line: function( __ ) {

		// Get the scales:
		var xScale = this.model.get('xScale'),
			yScale = this.model.get('yScale');
		
		var line = d3.svg.line();
		if (!arguments.length) {
			// Set the default:

			line
				.x( function(d) { return xScale( d.x ); } )
				.y( function(d) { return yScale( d.y ); } )
				.interpolate('linear');

		}else {
			// Allow external setting of the line path:
			line = __;
		}

		// Update our chart model:
		this.model.set('line', line);

		return this;
			
	},

	xScale: function( __ ) {

		var xScale;
		if (!arguments.length) {
			xScale = d3.scale.linear(); // Default
		}else {
			// Allow external setting of the scale:
			xScale = __; 
		}; // end IF/ELSE

		// Get data from the Chart Model:
		var width = this.model.get('graph').width,
			xDomain = this.model.get('xDomain');

		// Update the scale domain and range:
		if (xDomain.length < 2) {
			// Calculate the domain:
			xDomain = [ this.min( 'x' ), this.max( 'x' ) ];

		} else if (xDomain[0] === 'min') {

			xDomain[0] = this.min( 'x' );

		} else if (xDomain[1] === 'max') {

			xDomain[1] = this.max( 'x' );

		}; // end IF/ELSEIF/ELSEIF

		xScale.domain( xDomain )
			.range( [0, width] );

		// Update our chart model:
		this.model.set('xScale', xScale);

		return this;

	},

	yScale: function( __ ) {

		var yScale;
		if (!arguments.length) {
			yScale = d3.scale.linear().nice(); // Default
		}else {
			// Allow external setting of the scale:
			yScale = __; 
		}; // end IF/ELSE

		// Get Chart Model data:
		var height = this.model.get('graph').height,
			yDomain = this.model.get('yDomain');

		// Update the scale domain and range:
		if (yDomain.length < 2) {
			// Calculate the domain:
			yDomain = [ this.min( 'y' ), this.max( 'y' ) ];

		} else if (yDomain[0] === 'min') {

			yDomain[0] = this.min( 'y' );

		} else if (yDomain[1] === 'max') {

			yDomain[1] = this.max( 'y' );

		}; // end IF/ELSEIF/ELSEIF

		yScale.domain( yDomain )
			.range( [height, 0] );

		// Update our chart model:
		this.model.set('yScale', yScale);	

		return this;

	},


	update: function() {

		// Get the path generator:
		var line = this.model.get('line');	

		switch ( this.model.get( 'mode' ) ) {

			case 'window':
				// A sliding window of constant width. Good for when we only care about recent history and having a current snapshot:
				var selection = this.layer.data.paths,
					xScale = this.model.get('xScale'),
					props = this.model.get( 'transition' ).onUpdate;

				// Calculate the shift:
				var lastVals = _.last( this.data[0].get('dataSeries'), 2 );
				var shift = this.model.get('xOffset') - (lastVals[1].x - lastVals[0].x);

				slideWindow( this, selection, line, xScale, shift, props );
				break;

			case 'add':

				// Data is added to the path. Axes domain expands. No sliding is needed.

				break;

			case 'dynamic':

				// Data is changed in place. Meaning the path and axes may update, but we do not need to transform the path. 

				break;

			default:
				console.log('WARNING:unrecognized transition.');
				break;

		}; // end SWITCH mode


		function slideWindow( View, selection, line, xScale, shift, props ) {

			// Update the paths:
			selection.attr('d', function(d,i) { 
				return line( d.get('dataSeries') ); 
			});

			// Update the axes:
			updateAxes( View, props );

			// Slide the path with a transition:
			selection.transition()
				.duration( props.duration )
				.ease( props.easing )
				.attr('transform', 'translate(' + xScale( shift ) + ')');

		}; // end FUNCTION slideWindow()


		function updateAxes( View, props ) {

			// Update the scales and axis:
			View.xScale()
				.yScale()
				.xAxis()
				.yAxis();

			var xAxis = View.model.get('xAxis'),
				yAxis = View.model.get('yAxis');
			
			// Run the axis transitions:
			View.layer.axis.x.transition()
				.duration( props.duration ) 
				.ease( props.easing )
				.call( xAxis );

			View.layer.axis.y.transition()
				.duration( props.duration )
				.ease( props.easing )
				.call( yAxis );

		}; // end FUNCTION updateAxes()

	}


});




// Listener Layer:
var ListenerLayer = DataLayer.extend({

	bindListeners: function() {

		// Bind data listeners:
		this.model.on('change:xLabel change:yLabel', this.updateAxes, this);
		this.model.on('change:xDomain change:yDomain', this.updateAxes, this);
		this.model.on('change:xDomain change:yDomain', this.plot, this);

		//this.collection.on('change:dataSeries', this.update, this);
		//this.collection.on('add:dataSeries', this.update, this);
		this.collection.on('remove:dataSeries', this.update, this);
		//this.collection.on('reset', this.update, this);

	}


});



// Interaction layer:
var InteractionLayer = ListenerLayer.extend({

	initialize: function( options ) {
		// This overrides an inherited initialize functions.
	},

	render: function() {

		this.initCanvas()		// Create the canvas layer
			.initData()			// Initialize the data
			.initAxes()			// Create the axes layer
			.bindData()			// Bind the data and initialize the paths layer
			.plot()				// Plot the data
			.bindInteration()	// Bind the interaction behavior
			.bindListeners(); 	// Bind listeners so that views update upon model changes

	},

	bindInteraction: function() {

		var selection = this.layer.data.paths;

		// Set our mouse events:
		this.mouseover().mouseout();

		// Get the events:
		var mouseover = this.model.get('mouseover'),
			mouseout = this.model.get('mouseout');

		// Set the hover events:
		selection
			.style('cursor', 'pointer')
			.on('mouseover', mouseover )
			.on('mouseout', mouseout );

		return this;

	},

	mouseover: function() {

		var mouseover = function() {
			var self = this;
			d3.selectAll('.data-series .line')
				.transition()
				.filter( function(d) {
					return self != this;
				})
				.duration(1000)
				.style('opacity', 0.3);
		};

		// Update our chart model:
		this.model.set('mouseover', mouseover);

		return this;

	},

	mouseout: function() {

		var mouseout = function() {
			d3.selectAll('.data-series .line')
				.transition()
				.duration(200)
				.style('opacity', 1);
		};

		// Update our chart model:
		this.model.set('mouseout', mouseout);

		return this;

	}

});




// Animation layer:
var AnimationLayer = InteractionLayer.extend({

	initialize: function( options ) {
		// This overrides an inherited initialize functions.
	},

	render: function() {

		this.initCanvas()					// Create the canvas layer
			.initData()						// Initialize the data
			.initAxes()						// Create the axes layer
			.bindData()						// Bind the data and initialize the paths layer
			.initAnimation( )				// Setup the selection for transitions
			.plot()							// Plot the data
			.bindInteraction()				// Bind the interaction behavior
			.bindAnimation( )				// Bind the animations
			.bindListeners(); 				// Bind listeners so that views update upon model changes

	},

	initAnimation: function( ) {

		var selection = this.layer.data.paths;

		// Get the x scale and domain:
		var xScale = this.model.get('xScale'),
			domain = xScale.domain();

		// Setup the transition:
		selection.attr("transform", "translate(" + xScale( -domain[1] ) + ")");

		return this;

	},

	bindAnimation: function( ) {

		var selection = this.layer.data.paths;

		// Create the onEnter transition:
		this.onEnter();

		// Get the onEnter transition:
		var onEnter = this.model.get('onEnter');

		// Animate:
		selection.call( onEnter );

		return this;

	},

	onEnter: function( __ ) {

		// Get the scales:
		var xScale = this.model.get('xScale'),
			yScale = this.model.get('yScale');

		var onEnter;
		if (!arguments.length) {

			var props = this.model.get('animation'),
				duration = props.onEnter.duration,
				easing = props.onEnter.easing,
				xDomain = xScale.domain();

			onEnter = function() {
				return this.transition()
					.duration( duration )
					.ease( easing )
					.attr("transform", "translate(" + xScale( xDomain[0] ) + ")");
				};
		}else {
			// Allow external setting of the transition onEnter:
			onEnter = __;
		}; // end IF/ELSE

		// Update our chart model:
		this.model.set('onEnter', onEnter);

		return this;

	},

	onUpdate: function( __ ) {

		var onUpdate;
		if (!arguments.length) {
		
			// TBD

		} else {
			// Allow external setting of the transition onUpdate:
			onUpdate = __;
		}; // end IF/ELSE

		// Update our chart model:
		this.model.set('onUpdate', onUpdate);

		return this;

	},

	onExit: function() {
		
		// TBD

	}

});






