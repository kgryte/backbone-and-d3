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
				this._events = options.events;
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
			.attr("y", -74)
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
			this._events = obj;
			this._initialized();
			return this;
		}
		return;
	},

	_initialized: function() {
		if ( this.model.get('canvas') && this.model.get('axes') && this.model.get('layers') ) {
			this.init = true;
			if (this._events) { 
				this._listeners(); 
			};
		}else {
			this.init = false;
		}; 
	},

	_listeners: function() {

		// Define the event callbacks:
		var xLabel = function() {
			var layers = this.model.get('layers'),
				axes = this.model.get('axes');

			layers.axis.x.selectAll('.label')
				.text( axes.get('xLabel') );
		}; // end FUNCTION xLabel()

		var yLabel = function() {
			var layers = this.model.get('layers'),
				axes = this.model.get('axes');

			layers.axis.y.selectAll('.label')
				.text( axes.get('yLabel') );
		}; // end FUNCTION yLabel()

		var xAxis = function() {
			var layers = this.model.get('layers'),
				axes = this.model.get('axes');

			layers.axis.x.call( axes.get('xAxis') );		
		}; // end FUNCTION xAxis()

		var yAxis = function() {
			var layers = this.model.get('layers'),
				axes = this.model.get('axes');

			layers.axis.y.call( axes.get('yAxis') );		
		}; // end FUNCTION yAxis()

		var resize = function() {

			// Local variables:
			var canvas = this.model.get('canvas'),
				axes = this.model.get('axes'),
				layers = this.model.get('layers'),
				graph = canvas.get('_graph');	

			// Set the ranges: (note: these trigger events to auto-update the scales)
			axes.set('xRange', [0, graph.width]);
			axes.set('yRange', [graph.height, 0]);	

			// Update the axes:
			layers.axis.x.attr("transform", "translate(0," + graph.height + ")");
			xAxis();

			layers.axis.x.selectAll('.label').attr("x", graph.width / 2);
			yAxis();

			layers.axis.y.selectAll('.label').attr("y", -74)
				.attr("x", -(graph.height / 2));

		}; // end FUNCTION resize()

		// 
		var subscribe = function() {
			// Subscribers:
			var events = {
				'axes:xLabel:change': xLabel,
				'axes:yLabel:change': yLabel,
				'axes:xDomain:change': xAxis,
				'axes:yDomain:change': yAxis,
				'axes:xType:change': xAxis,
				'axes:yType:change': yAxis,
				'axes:xScale:change': xAxis,
				'axes:yScale:change': yAxis,
				'canvas:width:change': resize,
				'canvas:height:change': resize,
				'canvas:margin:change': resize
			};

			_.each(events, function(clbk, event) {
				this._events.on(event, clbk, this);
			}, this);
			
		}; // end FUNCTION subscribe()

		var bind = function() {
			subscribe = _.bind(subscribe, this);
			xLabel = _.bind(xLabel, this);
			yLabel = _.bind(yLabel, this);
			xAxis = _.bind(xAxis, this);
			yAxis = _.bind(yAxis, this);
			resize = _.bind(resize, this);		
		}; // end FUNCTION bind()	

		// Ensure context:
		bind = _.bind(bind, this);
		bind();

		// Channel subscriptions:
		subscribe();
		
		return this;

	} // end METHOD listeners()

});