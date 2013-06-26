/**
*	VIEW: Axes
*
*	NOTES:
*		
*
*	HISTORY:
*		2013-06-24: KGryte. Created.
*
*	DEPENDENCIES:
*		[1] Backbone.js
*		[2] Underscore.js
*		[3] D3.js
*
*
*	@author Kristofer Gryte. http://www.kgryte.com
*
*	Copyright (c) 2013. MIT License.
*
*
*
*/

// Axes layer:
Chart.Layers.Axes = Backbone.View.extend({

	initialize: function( options ) {

		var Model = Backbone.Model.extend({});
		this.model = new Model();

		if (options) {
			// options should include 'canvas', 'axes', and 'layers':
			if ( !options.canvas || !options.axes || !options.layers ) {
				throw 'ERROR:layer instantiation requires an associative array with the following keys: canvas, axes, layers.';
			};

			this.model.set( {canvas: options.canvas, axes: options.axes, layers: options.layers} );

			// Set listeners:
			if (options.events) {
				this.events = options.events;
				this._listeners();
			};

			// Reset the options attribute:
			options = {};

			// Set a flag:
			this.init = true;
			
		};
		
	},

	render: function() {

		if (!this.init) {
			console.log('ERROR:view not initialized. Provide three parameters: canvas, axes, layers.')
			return;
		}; 

		// Local variables:
		var canvas = this.model.get('canvas'),
			axes = this.model.get('axes'),
			layers = this.model.get('layers'),
			graph = canvas.get('_graph'),
			marginLeft = canvas.get('marginLeft'),
			xLabel = axes.get('xLabel'),
			yLabel = axes.get('yLabel'),
			xAxis = axes.get('xAxis'),
			yAxis = axes.get('yAxis');	

		// Extend the layer object:
		layers.axis = {};

		// Set the ranges: (note: these trigger events to auto-update the scales)
		axes.set('xRange', [0, graph.width]);
		axes.set('yRange', [graph.height, 0]);	

		// Create the axes:
		layers.axis.x = layers.chart.append("svg:g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + graph.height + ")")
			.call( xAxis );

		layers.axis.x.append("svg:text")
			.attr("y", 40)
			.attr("x", graph.width / 2)
			.attr("text-anchor", "middle")
			.attr("class", "label")
			.text( xLabel );

		layers.axis.y = layers.chart.append("svg:g")
			.attr("class", "y axis")
			.call( yAxis );

		layers.axis.y.append("svg:text")
			.attr("transform", "rotate(-90)")
			.attr("y", -(marginLeft-6))
			.attr("dy", ".71em")
			.attr("x", -(graph.height / 2))
			.attr("text-anchor", "middle")
			.attr("class", "label")
			.text( yLabel );

		return this;

	},	// end METHOD initAxes()

	canvas: function( model ) {
		if (model) {
			this.model.set('canvas', model);
			this._initialized();
			return this;
		}
		return this.model.get('canvas');
	},

	axes: function( model ) {
		if (model) {
			this.model.set('axes', model);
			this._initialized();
			return this;
		}
		return this.model.get('axes');
	},

	layers: function( obj ) {
		if (obj) {
			this.model.set('layers', obj);
			this._initialized();
			return this;
		}
		return this.model.get('layers');
	},

	events: function( obj ) {
		if (obj) {
			this.events = obj;
			this._initialized();
			return this;
		}
		return;
	},

	_initialized: function() {
		if ( this.model.get('canvas') && this.model.get('axes') && this.model.get('layers') ) {
			this.init = true;
			if (this.events) { 
				this._listeners(); 
			};
		}else {
			this.init = false;
		}; 
	},

	_listeners: function() {

		// Subscribers:		
		this.events.on('axes:xLabel:change', xLabel, this);
		this.events.on('axes:yLabel:change', yLabel, this);

		this.events.on('axes:xDomain:change axes:xType:change axes:xScale:change', xAxis, this);
		this.events.on('axes:yDomain:change axes:yType:change axes:yScale:change', yAxis, this);

		return this;

		function xLabel() {
			var layers = this.model.get('layers'),
				axes = this.model.get('axes');

			layers.axis.x.selectAll('.label')
				.text( axes.get('xLabel') );
		}; // end FUNCTION xLabel()

		function yLabel() {
			var layers = this.model.get('layers'),
				axes = this.model.get('axes');

			layers.axis.y.selectAll('.label')
				.text( axes.get('yLabel') );
		}; // end FUNCTION yLabel()

		function xAxis() {
			var layers = this.model.get('layers'),
				axes = this.model.get('axes');

			layers.axis.x.call( axes.get('xAxis') );		
		}; // end FUNCTION xAxis()

		function yAxis() {
			var layers = this.model.get('layers'),
				axes = this.model.get('axes');

			layers.axis.y.call( axes.get('yAxis') );		
		}; // end FUNCTION yAxis()

	} // end METHOD listeners()

});