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

			// Check if data and marks:
			if (options.data && options.marks) {
				this.model.set({data: options.data, marks: options.marks});
				this.showGraph = true;
			}; // end IF


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

		var type = this.model.get('widgets').get('brushType');

		switch (type) {
			case 'x':
				this._xBrush();
				break;
			case 'y':
				this._yBrush();
				break;
			default:
				this._xBrush();
				break;
		}; 
		
		return this;
		
	},

	_xBrush: function() {

		var canvas = this.model.get('canvas'),
			model = this.model.get('widgets').get('brushModel'),
			brush = model.get('brush'), // brush generator
			scale = model.get('scale'),
			margin = model.get('margin'),
			axis = model.get('axis'),
			height = model.get('_brush').height, 
			axes = this.model.get('axes'),
			layers = this.model.get('layers');

		// Initialize the brush layer:
		layers.widgets.brush = {};
		layers.widgets.brush.axis = {};

		// Calculate the margins based on the canvas dimensions:
		margin = [ margin[0], canvas.get('marginRight'), margin[2], canvas.get('marginLeft') ];	
				
		// Set width and margin to match the canvas and update the brush domain and range:
		model.set({
			'width': canvas.get('width'),
			'margin': margin,
			'domain': axes.get('xScale').domain(),
			'range': axes.get('xScale').range()
		} );

		// Expand the SVG canvas while maintaining graph size: (make room for the brush)
		canvas.set({
			'height': canvas.get('height') + margin[0] + height + margin[2],
			'marginBottom': canvas.get('marginBottom') + margin[0] + height + margin[2]
		});

		// Create the brush container:
		var moveDown = canvas.get('marginTop') + canvas.get('_graph').height + margin[0];
		layers.widgets.brush.chart = layers.base.append('svg:g')
			.attr('class', 'brush')
			.attr('transform', 'translate(' + margin[3] + ',' + moveDown + ')' );

		// Create the brush graph:
		layers.widgets.brush.bars = layers.widgets.brush.chart.append('svg:g')
			.attr('class', 'x bars')
			.call( brush )
			.selectAll( 'rect' )
				.attr('y', 0)
				.attr('height', height );

		// Create the brush x-axis:
		layers.widgets.brush.axis.x = layers.widgets.brush.chart.append('svg:g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + 0 + ')')
			.call( axis );

		if (this.showGraph) {
			this._brushGraph();
			// Move the ticks down:
			axis.tickPadding(5);
			layers.widgets.brush.axis.x.call( axis );
		};

		// Provide the callback:
		brush.on('brush', onBrush);
		
		return this;

		function onBrush() {
			
			// Get the current brush extent:
			var extent = brush.empty() ? scale.domain() : brush.extent();

			// Update our chart model: (this will trigger a listener callback)
			axes.set( 'xDomain', extent );

		}; // end FUNCTION onBrush()

	}, // end METHOD _xBrush()

	_yBrush: function() {

		var canvas = this.model.get('canvas'),
			model = this.model.get('widgets').get('brushModel'),
			brush = model.get('brush'), // brush generator
			scale = model.get('scale'),
			margin = model.get('margin'),
			axis = model.get('axis'),
			width = model.get('_brush').width, 
			axes = this.model.get('axes'),
			layers = this.model.get('layers');

		// Initialize the brush layer:
		layers.widgets.brush = {};
		layers.widgets.brush.axis = {};

		// Calculate the margins based on the canvas dimensions:
		margin = [ canvas.get('marginTop'), margin[1], canvas.get('marginBottom'), margin[3] ];	
				
		// Set height and margin to match the canvas and update the brush domain and range:
		model.set({
			'height': canvas.get('height'),
			'margin': margin,
			'domain': axes.get('yScale').domain(),
			'range': axes.get('yScale').range()
		} );

		// Reduce the graph area and move over: (make room for the brush)
		canvas.set('marginLeft', width + margin[1] + canvas.get('marginLeft'));

		// Create the brush container:
		layers.widgets.brush.chart = layers.base.append('svg:g')
			.attr('class', 'brush')
			.attr('transform', 'translate(' + margin[3] + ',' + margin[0] + ')' );

		// Create the brush graph:
		layers.widgets.brush.bars = layers.widgets.brush.chart.append('svg:g')
			.attr('class', 'y bars')
			.call( brush )
			.selectAll( 'rect' )
				.attr('x', 0)
				.attr('width', width );

		// Create the brush y-axis:
		layers.widgets.brush.axis.y = layers.widgets.brush.chart.append('svg:g')
			.attr('class', 'y axis')
			.attr('transform', 'translate(' + width + ',0)')
			.call( axis );

		layers.widgets.brush.axis.y.selectAll('.tick.major text')
			.attr('transform', 'translate(20)');

		// Provide the callback:
		brush.on('brush', onBrush);
		
		return this;

		function onBrush() {
			
			// Get the current brush extent:
			var extent = brush.empty() ? scale.domain() : brush.extent();

			// Update our chart model: (this will trigger a listener callback)
			axes.set( 'yDomain', extent );

		}; // end FUNCTION onBrush()

	}, // end METHOD _yBrush()
	

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

	data: function( data ) {
		if (data) {
			this.model.set('data', data);
			this._createGraph();
			return this;
		}
		return this.model.get('data');
	},

	marks: function( model ) {
		if (model) {
			this.model.set('marks', model);
			this._createGraph();
			return this;
		}
		return this.model.get('marks');
	},

	_createGraph: function() {
		if ( this.model.get('data') && this.model.get('marks') ) {
			this.showGraph = true;
		}else {
			this.showGraph = false;
		};
	},

	_listeners: function() {

		var update = function() {
			if (this.model.get('widgets').get('brush')) {
				updateBrush();
			};
		};

		var updateBrush = function() {
			var axes = this.model.get('axes'),
				type = this.model.get('widgets').get('brushType');

			// TBD			
		}; 

		var resize = function() {
			if (this.model.get('widgets').get('brush')) {
				resizeBrush();
			};
		};

		var resizeBrush = function() {

			// Local variables:
			var canvas = this.model.get('canvas'),
				graph = canvas.get('_graph'),
				axes = this.model.get('axes'),
				layers = this.model.get('layers'),
				type = this.model.get('widgets').get('brushType'),
				model = this.model.get('widgets').get('brushModel'),
				scale = model.get('scale'),
				axis = model.get('axis'),
				brush = model.get('brush'), 
				dims = ['width', 'height'],
				range = [0, 0],
				ax = ['x', 'y'],
				id = ax.indexOf( type ),
				extent = axes.get( ax[id] + 'Scale').domain();

			if (!layers.widgets.brush.bars) {
				// Make sure the brush has been drawn.
				return;
			};

			// NOTE! This may change once we have 2D brushing!
			if (type != 'y') {
				moveBrush();
			}; // end IF

			update();

			return this;

			function moveBrush() {
				// Re-translate the brush:
				var moveDown = canvas.get('marginTop') + graph.height + model.get('marginTop');
				layers.widgets.brush.chart
					.attr('transform', 'translate(' + model.get('marginLeft') + ',' + moveDown + ')' );					
			}; // end FUNCTION moveBrush()

			function update() {
				// Update the relevant brush dimension: (width/height)
				model.set(dims[id], canvas.get(dims[id]));

				// Update the model range:
				range[ (id+1)%2 ] = graph[ dims[id] ];
				model.set('range', range);

				// Update the axis:
				layers.widgets.brush.axis[ ax[id] ].call( axis );

				// Refresh the brush background:
				layers.widgets.brush.chart.select('.' + ax[id] + '.bars')
					.select('.background')
						.attr( dims[id], model.get('_brush')[ dims[id] ] );

				// Refresh the brush extent:
				var offset = scale( extent[id]),
					length = scale( extent[(id+1)%2] ) - offset;
				layers.widgets.brush.chart.select('.' + ax[id] + '.bars')
					.select('.extent')
						.attr( ax[id], offset )
						.attr( dims[id], length );

				// Call the brush:
				layers.widgets.brush.chart.select('.brush').call( brush.extent( extent ) );

			}; // end FUNCTION update()

		}; // end FUNCTION resizeBrush()

		//
		var subscribe = function() {
			// Subscribers:
			var events = {
				'axes:xType:change': update,
				'axes:yType:change': update,
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
			update = _.bind(update, this);
			updateBrush = _.bind(updateBrush, this);
			resize = _.bind(resize, this);
			resizeBrush = _.bind(resizeBrush, this);		
		}; // end FUNCTION bind()	

		// Ensure context:
		bind = _.bind(bind, this);
		bind();

		// Channel subscriptions:
		subscribe();
		
		return this;

	}, // end METHOD listeners()

	_brushGraph: function() {

		// This is for creating a duplicate graph for brushing. Not advisable for a yBrush.

		var brushModel = this.model.get('widgets').get('brushModel'),
			brushChart = this.model.get('layers').widgets.brush.chart,
			data = this.model.get('data'),
			marks = this.model.get('marks');

		// [ ] Instantiate a new event dispatcher:
		var events = _.clone(Backbone.Events);

		// [1] Instantiate new axes and canvas models:
		var canvas = new Chart.Models.Canvas({events: events}),
			axes = new Chart.Models.Axes({events: events});

		// Update the canvas and axes parameters:
		canvas.set({
			'height': brushModel.get('height'),
			'width': brushModel.get('width'),
			'margin': brushModel.get('margin')
		});

		axes.set({
			'xType': brushModel.get('type'),
			'xScale': brushModel.get('scale'),
			'xRange': brushModel.get('range'),
			'xDomain': brushModel.get('domain'),
			'xAxis': brushModel.get('axis'),
			'yRange': [brushModel.get('_brush').height, 0],
		});

		// [2] Create a new Data View:
		var graph = new Chart.Layers.Data();

		// [3] Provide modified models for the brush graph:
		
		var layers = {
			chart: brushChart
		};

		graph
			.data( data )
			.marks( marks )
			.canvas( canvas )
			.axes( axes )
			.layers( layers )
			.events( events );

		// [4] Render:
		graph.render();

		// [5] Remove mouseover events for the marks:
		graph.model.get('layers').data.marks.style('pointer-events', 'none');

		// [6] Add listeners for resize:
		this._events.on('brush:range:change', draw, this);

		function draw() {
			canvas.set({
				'height': brushModel.get('height'),
				'width': brushModel.get('width'),
				'margin': brushModel.get('margin')
			}); 
		}; // end FUNCTION draw()

	} // end METHOD _brushGraph()

});