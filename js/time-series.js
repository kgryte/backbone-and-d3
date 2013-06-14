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
%		[1] Decouple view 'data' from view itself. Create a chart model (?)
*		[2] Validate model data
%		[3] Parse input options for view
%		[4] Stipulate updates
%		[5] Figure out how to handle the data. Currently, data is duplicated.
*		[6] 
*		[7] Demonstrate that changes in model values actually enact changes in view.
*		[8] Hover/Highlight
*		[9] Time series colors (default ordering) --> no, just set a class for each time series and use CSS.
*		[10] Ensure standard data representation
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
			'datum': [0,0] // default is 2-dimensions
		};
	},

	// The basic type in a time series is a point:
	type: "point"

});


// Individual data series:
var DataSeries = DataPoint.extend( {

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
		margin: { // for the graph, margin; for the canvas, this is padding
			top: 20,
			right: 20,
			bottom: 50,
			left: 70
		},
		canvas: {
			width: 960,
			height: 500
		},
		xLabel: 'x',
		yLabel: 'y',
		colors: {
			'g': 'rgba(0,255,0,0.8)',
			'r': 'rgba(255,0,0,0.8)',
			'k': 'rgba(0,0,0,0.8)',
			'b': 'rgba(0,0,255,0.8)'
		},
		interpolation: 'linear',
		transitions: {
			'onEnter': {
				'delay': 1000,
				'easing': 'linear'
			},
			'onUpdate': {
				'delay': 1000,
				'easing': 'linear'
			},
			'onExit': {
				'delay': 1000,
				'easing': 'linear'
			}
		}
	}

});



//////////////////////
// 	  COLLECTION  	//
//////////////////////


// A line chart is a collection of data series, each a collection of data points:
var DataCollection = Backbone.Collection.extend({

	// A data series will serve as the basic unit for our collection:
	model: DataSeries

});




//////////////////////
//	  	VIEWS 		//
//////////////////////


// Create the base chart layer (the canvas):
var ChartBase = Backbone.View.extend({

	render: function() {

		this.createCanvas();

		return this;

	},

	createCanvas: function() {

		// Initialize the layers object:
		this.layer = {};

		// Get the graph size:
		this.model.set( 'graph', this.graphSize() );

		// Create local variables to make the code less verbose:
		var element = this.el,
			canvas = this.model.get('canvas'),
			margin = this.model.get('margin');

		
		// Create the canvas:
		this.layer.base = d3.select( element ).append("svg:svg")
			.attr('width', canvas.width)
			.attr('height', canvas.height)
			.attr('class', 'base');

		// Initialize the chart area:
		this.layer.chart = this.layer.base.append("svg:g")
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
				.attr('class', 'chart');

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

	render: function() {

		// [1] Create the canvas, [2] Generate the axes
		this.createCanvas()
			.axes();

		return this;

	},



	axes: function() {

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

		var width = this.model.get('graph').width;

		// Update the scale domain and range:
		xScale.domain( [
			d3.min( this.data, function(d) { 
				return d3.min( d, function(dataPt) { 
					return dataPt[0]; 
				}); 
			} ),
			d3.max( this.data, function(d) { 
				return d3.max( d, function(dataPt) { 
					return dataPt[0]; 
				});
			}) ] 
			)
			.range( [0, width] );

		// Update our chart model:
		this.model.set('xScale', xScale);

		return this;

	},

	yScale: function( __ ) {

		var yScale;
		if (!arguments.length) {
			yScale = d3.scale.linear(); // Default
		}else {
			// Allow external setting of the scale:
			yScale = __; 
		}; // end IF/ELSE

		var height = this.model.get('graph').height;

		// Update the scale domain and range:
		yScale.domain( [
			/*d3.min( this.data, function(d) { 
				return d3.min( d, function(dataPt) { 
					return dataPt[1]; 
				}); 
			}),*/
			0,
    		d3.max( this.data, function(d) { 
    			return d3.max( d, function(dataPt) { 
    				return dataPt[1]; 
    			}); 
    		}) ]
    		).range( [height, 0] );

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

	}

});






// Create the line chart layer:
var LineChart = ChartArea.extend({

	initialize: function( options ) {		
		
		// Extract the data from the collection:
		this.getData();

	},

	getData: function() {

		// Map the collection to a format suitable for the D3 API:
		this.data = this.collection.map( function(d) { 
			return d.get('dataSeries'); 
		} );

		return this;

	},

	render: function() {

		// [1] Create the canvas, [2] Display the data, [3] Generate the axes
		this.createCanvas()
			.axes() // TODO: need to switch the order. Draw the axes atop the data; order matters.
			.show();
			
		return this;

	},


	show: function() {

		// Extend the layer object:
		this.layer.data = {};

		// Get the color choices:
		var colorTable = this.model.get('colors'),
			colorKeys = Object.keys(colorTable), // this should work in most modern browsers
			numColors = colorKeys.length;
			
		// Get the x scale:
		var xScale = this.model.get('xScale');

		// Create the path generator:
		this.line();

		// Get the path generator:
		var line = this.model.get('line');

		// Bind the data:
		this.layer.data.base = this.layer.chart.selectAll(".data-series")
			.data( this.data ) // data is an array of arrays
		  .enter()
			.append("svg:g")
				.attr("class", "data-series");

		// Create the onEnter transition:
		this.onEnter();

		// Get the onEnter transition:
		var onEnter = this.model.get('onEnter');

		// Create the line paths:
		this.layer.data.paths = this.layer.data.base.append("svg:path")
			.attr("class", function(d,i) { 
				return "line " + "line" + i; 
			})
			.attr("transform", "translate(" + xScale(-100) + ")")
			.attr("d", function(d,i) { 
				return line( d ); 
			} )
			.style("stroke", function(d,i) {
				// Loop back through the colors if we run out!
				return colorTable[ colorKeys[ i % numColors ] ];
			})
			.call( onEnter );

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
				.x( function(d) { return xScale( d[0] ); } )
				.y( function(d) { return yScale( d[1] ); } )
				.interpolate('linear');

		}else {
			// Allow external setting of the line path:
			line = __;
		}

		// Update our chart model:
		this.model.set('line', line);

		return this;
			
	},

	onEnter: function( __ ) {

		// Get the scales:
		var xScale = this.model.get('xScale'),
			yScale = this.model.get('yScale');

		var onEnter;
		if (!arguments.length) {

			var props = this.model.get('transitions'),
				delay = props.onEnter.delay,
				easing = props.onEnter.easing;

			onEnter = function() {
				return this.transition()
					.duration( delay )
					.ease( easing )
					.attr("transform", "translate(" + xScale(0.5) + ")");
				};
		}else {
			// Allow external setting of the transition onEnter:
			onEnter = __;
		}; // end IF/ELSE

		// Update our chart model:
		this.model.set('onEnter', onEnter);

		return this;

	},

	onUpdate: function() {
		// TBD
	},

	onExit: function() {
		// TBD
	},



	update: function() {


	}


});
