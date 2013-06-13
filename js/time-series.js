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
*
*/



//////////////////////
// 		Models   	//
//////////////////////

// Individual data points:
var DataPoint = Backbone.Model.extend({

	// Set the default coordinates for an individual data point:
	defaults: {
		x: 0,
		y: 0
	},

	// The basic type in the time series is a point:
	type: "point",

	// Data validation:
	validate: function(attrs, options) {
		// Code goes here. Check for numerical input, appropriate keys, etc. Ensure standard data representation.
	}

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
		yLabel: 'y'
	},

	// Parameter validation:
	validate: function(attrs, options) {
		// Code goes here.
	}

});



//////////////////////
// 	  COLLECTION  	//
//////////////////////


// A line is a collection of data points:
var DataSeries = Backbone.Collection.extend({

	// A data point will serve as the basic unit for our collection:
	model: DataPoint

});




//////////////////////
//	  	VIEWS 		//
//////////////////////


// Create the base chart layer (the canvas):
var ChartBase = Backbone.View.extend({

	initialize: function( ) {
		//
	},

	render: function() {

		// This method should be overloaded by higher layers:
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
			.append("svg:g")
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

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



// Create the line chart layer:
var LineChart = ChartBase.extend({

	initialize: function( options ) {		
		//

		// Extract the data from the collection:
		this.setData();

	},

	setData: function() {

		// Access the raw JavaScript array of models in our collection:
		this.data = jQuery.parseJSON(JSON.stringify(this.collection.models));

		return this;

	},

	updateData: function() {

		// When the model updates...

	},

	render: function() {

		// [1] Create the canvas, [2] Generate the axes, [3] Display the data
		this.createCanvas()
			.axes()
			.show();

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
		this.layer.axis.x = this.layer.base.append("svg:g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + graph.height + ")")
			.call( xAxis );

		this.layer.axis.x.append("svg:text")
			.attr("y", 40)
			.attr("x", graph.width / 2)
			.attr("text-anchor", "middle")
			.text( xLabel );

		this.layer.axis.y = this.layer.base.append("svg:g")
			.attr("class", "y axis")
			.call( yAxis );

		this.layer.axis.y.append("svg:text")
			.attr("transform", "rotate(-90)")
			.attr("y", -(margin.left-6))
			.attr("dy", ".71em")
			.attr("x", -(graph.height / 2))
			.attr("text-anchor", "middle")
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
		xScale.domain(d3.extent(this.data, function(d) { return d.x; } ))
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
		yScale.domain([0, d3.max(this.data, function(d) { return d.y; } )])
			.range( [height, 0] );

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



	show: function() {

		// Create the path generator:
		this.line();

		// Get the path generator:
		var line = this.model.get('line');

		// Create the line path:
		this.layer.data = this.layer.base.append("svg:path")
			.data( this.data )
			.attr("class", "line")
			.attr("d", line(this.data) );

		return this;
		
	},


	line: function( __ ) {

		var line = d3.svg.line();
		if (!arguments.length) {
			// Set the default:

			// Get the scales:
			var xScale = this.model.get('xScale'),
				yScale = this.model.get('yScale');
		
			line
				.x( function(d) { return xScale( d.x ); } )
				.y( function(d) { return yScale( d.y ); } );

		}else {
			// Allow external setting of the line path:
			line = __;
		}

		// Update our chart model:
		this.model.set('line', line);

		return this;
			
	},



	update: function() {


	}


});
