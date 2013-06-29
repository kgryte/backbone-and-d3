/**
*	VIEW: Widgets
*
*	NOTES:
*		
*
*	HISTORY:
*		2013-06-29: KGryte. Created.
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

// Widgets layer:
Chart.Layers.Widgets = Backbone.View.extend({

	initialize: function( options ) {

		var Model = Backbone.Model.extend({});
		this.model = new Model();

		if (options) {
			// options should include 'widgets', 'canvas', 'axes', and 'layers':
			if ( !options.widgets || !options.canvas || !options.axes || !options.layers ) {
				throw 'ERROR:layer instantiation requires an associative array with the following keys: widgets, canvas, axes, layers.';
			};

			this.model.set( {widgets: options.widgets, canvas: options.canvas, axes: options.axes, layers: options.layers} );

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
			console.log('ERROR:view not initialized. Provide four parameters: widgets, canvas, axes, layers.')
			return;
		}; 

		// Local variables:
		var layers = this.model.get('layers'),
			widgets = this.model.get('widgets'),
			brush = widgets.get('brush');	

		// Initialize the widget layer:
		layers.widgets = {};

		// Determine what to render:
		if ( brush ) {
			this.brush();
		}; // end IF brush
		
		return this;

	},	// end METHOD initAnnotations()

	brush: function() {

		// The brush is essentially its own mini chart.

		var layers = this.model.get('layers');

		// Initialize the brush generator based on the current axes:
		this._initBrush();
		
		// Initialize the brush layer:
		layers.brush = {};
		layers.brush.axis = {};

		// Get the canvas and brush specs:
		var canvas = this.model.get('canvas'),
			canvasHeight = canvas.get('height'),
			model = this.model.get('widgets').get('brushModel'),
			margin = model.get('margin'),
			axis = model.get('axis'),
			brush = model.get('brush'),
			height = model.get('_brush').height; // auto-updated during _initBrush() by margin calculation			

		// Expand the SVG canvas: (make room for the brush)
		layers.base.attr('height', canvasHeight + margin[0] + height + margin[2]);

		// Create the brush container:
		var marginTop = canvasHeight + margin[0];
		layers.brush.chart = layers.base.append('svg:g')
			.attr('class', 'brush')
			.attr('transform', 'translate(' + margin[3] + ',' + marginTop + ')' );

		// Create the brush graph:
		layers.brush.bars = layers.brush.chart.append('svg:g')
			.attr('class', 'x bars')
			.call( brush )
			.selectAll( 'rect' )
				.attr('y', 0)
				.attr('height', height );

		// Create the brush x-axis:
		layers.brush.axis.x = layers.brush.chart.append('svg:g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + 0 + ')')
			.call( axis );

		return this;
		
	},

	_initBrush: function() {

		var canvasMargin = this.model.get('canvas').get('margin'),
			width = this.model.get('canvas').get('_graph').width,
			type = this.model.get('widgets').get('brushType'),
			model = this.model.get('widgets').get('brushModel'),
			brush = model.get('brush'), // brush generator
			scale = model.get('scale'),
			margin = model.get('margin'),
			axes = this.model.get('axes'),
			axesScale, axesDomain;

		switch (type) {
			case 'x':
				axesScale = axes.get('xScale');
				axesDomain = 'xDomain';				
				margin = [ margin[0], canvasMargin[1], margin[2], canvasMargin[3] ];	
				break;
			case 'y':
				axesScale = axes.get('yScale');
				axesDomain = 'yDomain';
				margin = [ canvasMargin[0], margin[1], canvasMargin[2], margin[3] ];	
				break
			default:
				axesScale = axes.get('xScale');
				axesDomain = 'xDomain';
				margin = [ margin[0], canvasMargin[1], margin[2], canvasMargin[3] ];
				break;
		}; 

		// Set margins to mirror relevant canvas margins:
		model.set('margin', margin);

		// Mirror relevant settings in the axes:
		var domain = axesScale.domain(),
			range = axesScale.range();

		// Update the brush width, domain, and range:
		model.set( {
			'width': width,
			'domain': domain,
			'range': range
		} );

		// Provide the callback:
		brush.on('brush', onBrush);
		
		return this;

		function onBrush() {
			// Get the current brush extent:
			var axesExtent = brush.empty() ? scale.domain() : brush.extent();

			// Update our chart model: (this will trigger a listener callback)
			axes.set( axesDomain, axesExtent );

		}; // end FUNCTION onBrush()

	}, // end METHOD _initBrush()

	widgets: function( model ) {
		if (model) {
			this.model.set('widgets', model);
			this._initialized();
			return this;
		}
		return this.model.get('widgets');
	},

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
		if ( this.model.get('widgets') && this.model.get('canvas') && this.model.get('axes') && this.model.get('layers') ) {
			this.init = true;
			if (this._events) { 
				this._listeners(); 
			};
		}else {
			this.init = false;
		}; 
	},

	_listeners: function() {

		var updateBrush = function() {

		};

		var resize = function() {

		};

		//
		var subscribe = function() {
			// Subscribers:
			var events = {
				'axes:xType:change': updateBrush,
				'axes:yType:change': updateBrush,
				'canvas:width:change': resize,
				'canvas:height:change': resize
			};

			_.each(events, function(clbk, event) {
				this._events.on(event, clbk, this);
			}, this);
			
		}; // end FUNCTION subscribe()

		var bind = function() {
			subscribe = _.bind(subscribe, this);
			updateBrush = _.bind(updateBrush, this);
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