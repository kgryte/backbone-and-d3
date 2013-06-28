/**
*	VIEW: Data
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

// Data layer:
Chart.Layers.Data = Backbone.View.extend({

	initialize: function( options ) {
		
		var Model = Backbone.Model.extend({});
		this.model = new Model();

		if (options) {
			// Options should include 'data', 'marks', 'canvas', 'axes', and 'layers':
			if ( !options.data || !options.type || !options.canvas || !options.axes || !options.layers ) {
				throw 'ERROR:layer instantiation requires an associative array with the following keys: data, marks, canvas, axes, layers.';
			};

			this.model.set( {data: options.data, marks: options.marks, canvas: options.canvas, axes: options.axes, layers: options.layers} );

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

	}, // end METHOD initialize()

	render: function() {

		if (!this.init) {
			console.log('ERROR:view not initialized. Provide five parameters: data, marks, canvas, axes, layers.')
			return;
		}; 

		this._initGraph()
			._initDraw()
			.draw();
		// NOTE: a listener is set on the x- and y-domains such that the chart is redrawn upon domain changes (in _initDraw()). This listener triggers this.draw(). In which case, the second .draw() is redundant and causes the paths to be redrawn unnecessarily. In the event that a single event-dispatcher is not provided, however (i.e., no listeners are set), we need to retain the call to draw().

		return this;

	}, // end METHOD render()

	draw: function() {
		// this is overwritten internally, depending on graph type.
	}, // end METHOD draw()

	redraw: function() {
		
		this._initDraw()
			.draw();

		// Broadcast the redraw event:
		this._events.trigger('data:redraw');

		return this;

	},	// end METHOD redraw()

	line: function() {
		
		this._removeMarks()
			._initData();

		var marks = this.model.get('layers').data.marks,
			dataset = this._dataset;

		// Create the enter selection and append mark elements (paths):
		marks.enter() 
		  	.append('svg:path')
		  		.attr('class', function(d,i) {
		  			return 'marks line ' + 'line' + i;
		  		});

		this._colors( marks, 'stroke' );

		this.draw = function() {	
			// NOTE: each time draw is called, need to update the path generator in the event any function pointers have changed; e.g., user changed x-axis generator from linear() to sqrt():
			var line = this._line(); 
			marks.attr('d', function(d) {
				return line( dataset(d) );
			});
			return this;
		};

		return this;
	}, // end METHOD line()

	_line: function() {
		var xScale = this.model.get('axes').get('xScale'),
			yScale = this.model.get('axes').get('yScale'),
			interpolation = this.model.get('marks').get('interpolation'),
			xVal = this._xValue,
			yVal = this._yValue;

		// Return the path generator:
		return d3.svg.line()
			.x( function(d) { return xScale( xVal(d) ); } )
			.y( function(d) { return yScale( yVal(d) ); } )
			.interpolate( interpolation );
		
	}, // end METHOD _line()

	area: function() {

		this._removeMarks()
			._initData();

		var marks = this.model.get('layers').data.marks,
			dataset = this._dataset;

		// Create the enter selection and append mark elements (paths):
		marks.enter() 
		  	.append('svg:path')
		  		.attr('class', function(d,i) {
		  			return 'marks area ' + 'area' + i;
		  		});

		this._colors( marks, 'fill' );

		this.draw = function() {
			var area = this._area();
			marks.attr('d', function(d) {
				return area( dataset(d) );
			});
			return this;
		};

		return this;
	}, // end METHOD area()

	_area: function() {
		var height = this.model.get('canvas').get('_graph').height,
			xScale = this.model.get('axes').get('xScale'),
			yScale = this.model.get('axes').get('yScale'),
			interpolation = this.model.get('marks').get('interpolation'),
			xVal = this._xValue,
			yVal = this._yValue;
		
		// Return the path generator:
		return d3.svg.area()
			.x( function(d,i) { return xScale( xVal(d) ); } )
			.y0( height )
			.y1( function(d,i) { return yScale( yVal(d) ); } )
			.interpolate( interpolation );

	}, // end METHOD _area()

	jitter: function() {

	}, // end METHOD jitter()

	_jitter: function() {

	}, // end METHOD _jitter()

	scatter: function() {

		this._removeMarks()
			._initData();

		var marks = this.model.get('layers').data.marks,
			dataset = this._dataset;

		// Create the enter selection and append mark elements (circles):
		marks.enter()
			.append('svg:g')
				.attr('class', function(d,i) {
					return 'marks scatter ' + 'scatter' + i;
				})
		  .selectAll('.point')
		  	.data(function(d) { return dataset(d); } )
		  .enter()
			.append('svg:circle')
				.attr('class', 'point');

		this._colors( marks, 'fill' );

		this.draw = function() {
			this._scatter( marks );
			return this;
		}; 

		return this;

	}, // end METHOD scatter()

	_scatter: function( selection ) {
		var size = this.model.get('marks').get('size'),
			xScale = this.model.get('axes').get('xScale'),
			yScale = this.model.get('axes').get('yScale'),
			xVal = this._xValue,
			yVal = this._yValue;

		selection.selectAll('.point')
			.attr('cx', function(d) { return xScale( xVal(d) ); } )
			.attr('cy', function(d) { return yScale( yVal(d) ); } )
			.attr('r', Math.sqrt(size) );

	}, // end METHOD _scatter()

	bubble: function() {
		this._removeMarks()
			._initData();

		var marks = this.model.get('layers').data.marks,
			dataset = this._dataset;

		// Create the enter selection and append mark elements (circles):
		marks.enter()
			.append('svg:g')
				.attr('class', function(d,i) {
					return 'marks bubble ' + 'bubble' + i;
				})
		  .selectAll('.point')
		  	.data(function(d) { return dataset(d); } )
		  .enter()
			.append('svg:circle')
				.attr('class', 'point');

		this._colors( marks, 'fill' );

		this.draw = function() {
			this._bubble( marks );
			return this;
		}; 

		return this;
	}, // end METHOD bubble()

	_bubble: function() {
		var xScale = this.model.get('axes').get('xScale'),
			yScale = this.model.get('axes').get('yScale'),
			xVal = this._xValue,
			yVal = this._yValue,
			zVal = this._zValue;

		selection.selectAll('.point')
			.attr('cx', function(d) { return xScale( xVal(d) ); } )
			.attr('cy', function(d) { return yScale( yVal(d) ); } )
			.attr('r', function(d) { return Math.sqrt( zVal(d) ); } );
	}, // end METHOD _bubble()

	stacked: function( offset ) {
		this._removeMarks();

		var xVal = this._xValue,
			yVal = this._yValue,
			dataset = this._dataset;

		// Initialize the stack layout:
		this._stack = d3.layout.stack()
			.offset( offset )
			.values( function(d) { return dataset(d); })
			.x( function(d) { return xVal(d); } )
			.y( function(d) { return yVal(d); } )
			.out( function(d,y0,y) { d.set('y0', y0, {validate: false}); });
		
		this._initData();

		var marks = this.model.get('layers').data.marks;

		// Create the enter selection and append mark elements (paths):
		marks.enter() 
		  	.append('svg:path')
		  		.attr('class', function(d,i) {
		  			return 'marks stacked area ' + 'area' + i;
		  		});

		this._colors( marks, 'fill' );

		this.draw = function() {
			var area = this._stacked();
			marks.attr('d', function(d) {
				return area( dataset(d) );
			});
			return this;
		};

		return this;
	}, // end METHOD stacked()

	_stacked: function() {
		var xScale = this.model.get('axes').get('xScale'),
			yScale = this.model.get('axes').get('yScale'),
			xVal = this._xValue,
			yVal = this._yValue,
			interpolation = this.model.get('marks').get('interpolation');

		// Return the path generator:
		return d3.svg.area()
			.x( function(d) { return xScale( xVal(d) ); } )
			.y0( function(d) { return yScale( d.get('y0' ) ); } )
			.y1( function(d) { return yScale( yVal(d) + d.get('y0') ); } )
			.interpolate( interpolation );

	}, // end METHOD _stacked()

	data: function( data ) {
		if (data) {
			this.model.set('data', data);
			this._initialized();
			return this;
		}
		return this.model.get('data');
	},

	marks: function( model ) {
		if (model) {
			this.model.set('marks', model);
			this._initialized();
			return this;
		}
		return this.model.get('marks');
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
		if ( this.model.get('data') && this.model.get('marks') && this.model.get('canvas') && this.model.get('axes') && this.model.get('layers') ) {
			this.init = true;
			if (this._events) { 
				this._listeners(); 
			};
		}else {
			this.init = false;
		}; 
	},

	_listeners: function() {

		// Define event callbacks:
		var removeData = function() {

			this.model.get('layers').data.marks
				.exit()
				.remove();

		}; // end FUNCTION removeData()		

		var draw = function() {
			// Housed in its own function due to pointers generated dynamically; this ensures that we always have the correct function pointer:
			this.draw();
		}; // end FUNCTION draw()

		var toggleInteraction = function() {

			if ( this.model.get('marks').get('interactive') ) {
				this._initInteraction();
			}else {

				var marks = this.model.get('layers').data.marks;

				// Remove the hover events:
				marks.style('cursor', 'pointer')
					.on('mouseover.hover', null )
					.on('mouseout.hover', null );

			}; // end IF/ELSE
		}; // end FUNCTION toggleInteraction()

		//
		var subscribe = function() {
			// Subscribers:
			var events = {
				'data:collection:add': this._initData,
				'data:collection.remove': removeData,
				'axes:xDomain:change': draw,
				'axes:yDomain:change': draw,
				'axes:xType:change': draw,
				'axes:yType:change': draw,
				'marks:type:change': this.redraw,
				'marks:interpolation:change': this.redraw,
				'marks:colors:change': this.redraw,
				'marks:size:change': draw,
				'marks:interactive:change': toggleInteraction,
				'canvas:width:change': draw,
				'canvas:height:change': draw
			};

			_.each(events, function(clbk, event) {
				this._events.on(event, clbk, this);
			}, this);
			
		}; // end FUNCTION subscribe()

		var bind = function() {
			subscribe = _.bind(subscribe, this);
			removeData = _.bind(removeData, this);
			draw = _.bind(draw, this);
			toggleInteraction = _.bind(toggleInteraction, this);		
		}; // end FUNCTION bind()	

		// Ensure context:
		bind = _.bind(bind, this);
		bind();

		// Channel subscriptions:
		subscribe();

		return this;
		
	}, // end METHOD _listeners()

	_initGraph: function() {

		var canvas = this.model.get('canvas'),
			layers = this.model.get('layers');

		// Initialize the data layer object:
		layers.data = {};

		// Create a group for all data sets:
		layers.data.base = layers.chart.append("svg:g")
			.attr('class', 'data-sets');

		// Include a path clipper to prevent layer spillover:
		layers.data.clipPath = layers.data.base.append("svg:g")
			.attr('clip-path', "url(" + canvas.get( '_clipPath' ) +  ")");

		return this;

	}, // end METHOD _initGraph()

	_initDraw: function() {
		// Initialize the domains:
		this._initDomains();

		// Initialize the graph generators:
		switch ( this.model.get('marks').get('type') ) {
			case 'line':
				this.line();
				break;
			case 'area':
				this.area();
				break;
			case 'scatter':
				this.scatter();
				break;
			case 'steamgraph':
				this.stacked( 'wiggle' )
					._yOffset();
				break;
			case 'stackedArea':
				this.stacked( 'zero' )
					._yOffset();
				break;
			default:
				this.line();
				console.log('WARNING:unrecognized chart type. Plotting default: "line".');
				break;
		}; // end SWITCH (type)

		// Initialize interaction:
		if ( this.model.get('marks').get('interactive') ) {
			this._initInteraction();
		}; // end IF

		return this;

	}, // end METHOD _initDraw()	

	_initData: function() {

		var data = this._getData(),
			layers = this.model.get('layers');		

		// Bind the data:
		layers.data.marks = layers.data.clipPath.selectAll('.marks')
			.data( data );

		return this;

	}, // end METHOD _initData()	

	_getData: function() {
		var data = this._collection(), // an array of collections (datasets)
			type = this.model.get('marks').get('type');
		if (type === 'steamgraph' || type === 'stackedArea' ) {
			data = this._stack( data );
		};
		return data;
	}, // end METHOD _getData()	

	_initInteraction: function() {
		var marks = this.model.get('layers').data.marks;

		// Set the hover events:
		marks.style('cursor', 'pointer')
			.on('mouseover.hover', mouseover )
			.on('mouseout.hover', mouseout );

		return this;
	
		function mouseover() {
			var self = this;				

			marks.transition()
				.filter( function(d) {
					return self != this;
				})
				.duration(1000)
				.style('opacity', 0.3);
		}; // end FUNCTION mouseover()

		function mouseout() {
			marks.transition()
				.duration(200)
				.style('opacity', 1);
		}; // end FUNCTION mouseout()
	
	}, // end METHOD _initInteraction()

	_colors: function( selection, property ) {
		var colors = this.model.get('marks').get('colors');

		if ( colors != 'auto') {			
			var numColors = colors.length;

			selection.each( function(d,i) {
				// Loop back through the colors if we run out!
				var color = colors[ i % numColors ];
				d3.select( this ).classed( color, 1 ); 
			});

		}else {
			// Generate the colors:
			var color = d3.scale.category10();

			selection.style( property, function(d,i) { 
				return color(i);
			});

		}; // end IF/ELSE colors

		return this;

	}, // end METHOD _colors()

	_xValue: function(d) {
		return d.get('x');
	}, // end METHOD x-accessor

	_yValue: function(d) {
		return d.get('y');
	}, // end METHOD y-accessor

	_zValue: function(d) {
		return d.get('z');
	}, // end METHOD z-accessor

	_dataset: function(d) {
		return d.get('data').slice();
	}, // end METHOD dataset accessor

	_collection: function() {
		return this.model.get('data').slice();
	}, // end METHOD collection accessor

	_removeMarks: function() {
		var marks = this.model.get('layers').data.marks;
		// If previous marks exist, remove them:
		if ( marks ) {
			marks.remove();
		};
		return this;
	}, // end METHOD _removeMarks()

	_initDomains: function() {
		// Initialize the domains:
		var xMin = this._min('x'),
			xMax = this._max('x'),
			yMin = this._min('y'),
			yMax = this._max('y');

		this.model.get('axes').set({
			'xDomain': [xMin, xMax],
			'yDomain': [yMin, yMax]
		});

		return this;		
		
	}, // end METHOD _initDomains()

	_yOffset: function() {
		// Offset the yDomain: (stack layouts)
		var collection = this.model.get('data'),
			data = collection.slice();

		var yMin = this._min('y0'),
			yMax = max('y', 'y0');

		this.model.get('axes').set({
			'yDomain': [yMin, yMax]
		});

		return this;

		// Custom 'max' function for sum:
		function max( key1, key2 ) {
			
			return d3.max(data, function( dataset ) { 
				// Return the datum with the largest sum: key1 + key2:
				var _datum = _.max( dataset.get('data').toJSON(), function( datum ) {
					return datum[ key1 ] + datum[ key2 ]; 
				});
				// Return the sum to d3.max():
				return _datum[ key1 ] + _datum[ key2 ];
			});

		}; // end FUNCTION max()
				
	}, // end METHOD _yOffset()

	_max: function( key1, key2 ) {
		var collection = this.model.get('data'),
			data = collection.slice();

		return d3.max( data, function(d) {
			return collection.max(d, key1)[key1];
		});

	}, // end METHOD _max()

	_min: function( key ) {
		var collection = this.model.get('data'),
			data = collection.slice();

		return d3.min( data, function(d) {
			return collection.min(d, key)[key];
		});

	} // end METHOD _min()

});