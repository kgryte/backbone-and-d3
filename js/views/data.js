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
				this.events = options.events;
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
			._initDomains()
			.draw();

		return this;

	}, // end METHOD render()

	redraw: function() {
		
		this._initDraw()
			.draw();

		return this;

	},	// end METHOD redraw()

	line: function() {
		
		this._removeMarks()
			._initData();

		var marks = this.model.get('layers').data.marks,
			xScale = this.model.get('axes').get('xScale'),
			yScale = this.model.get('axes').get('yScale'),
			interpolation = this.model.get('marks').get('interpolation'),
			xVal = this._xValue,
			yVal = this._yValue,
			dataset = this._dataset;

		// Create the enter selection and append mark elements (paths):
		marks.enter() 
		  	.append('svg:path')
		  		.attr('class', function(d,i) {
		  			return 'marks line ' + 'line' + i;
		  		});

		this._colors( marks, 'stroke' );

		// Initialize the path generator:
		var line = d3.svg.line()
			.x( function(d) { return xScale( xVal(d) ); } )
			.y( function(d) { return yScale( yVal(d) ); } )
			.interpolate( interpolation );

		this.draw = function() {			
			marks.attr('d', function(d) {
				return line( dataset(d) );
			});
			return this;
		};

		return this;
	}, // end METHOD line()

	area: function() {

		this._removeMarks()
			._initData();

		var marks = this.model.get('layers').data.marks,
			height = this.model.get('canvas').get('_graph').height,
			xScale = this.model.get('axes').get('xScale'),
			yScale = this.model.get('axes').get('yScale'),
			interpolation = this.model.get('marks').get('interpolation'),
			xVal = this._xValue,
			yVal = this._yValue,
			dataset = this._dataset;

		// Create the enter selection and append mark elements (paths):
		marks.enter() 
		  	.append('svg:path')
		  		.attr('class', function(d,i) {
		  			return 'marks area ' + 'area' + i;
		  		});

		this._colors( marks, 'fill' );

		// Initialize the path generator:
		var area = d3.svg.area()
			.x( function(d,i) { return xScale( xVal(d) ); } )
			.y0( height )
			.y1( function(d,i) { return yScale( yVal(d) ); } )
			.interpolate( interpolation );

		this.draw = function() {
			marks.attr('d', function(d) {
				return area( dataset(d) );
			});
			return this;
		};

		return this;
	}, // end METHOD area()

	scatter: function() {

		this._removeMarks()
			._initData();

		var marks = this.model.get('layers').data.marks,
			size = this.model.get('marks').get('size'),
			xScale = this.model.get('axes').get('xScale'),
			yScale = this.model.get('axes').get('yScale'),
			xVal = this._xValue,
			yVal = this._yValue,
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
			marks.selectAll('.point')
				.attr('cx', function(d) { return xScale( xVal(d) ); } )
				.attr('cy', function(d) { return yScale( yVal(d) ); } )
				.attr('r', Math.sqrt(size) );
			return this;
		}; 

		return this;

	}, // end METHOD scatter()

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

		var marks = this.model.get('layers').data.marks,
			xScale = this.model.get('axes').get('xScale'),
			yScale = this.model.get('axes').get('yScale'),
			interpolation = this.model.get('marks').get('interpolation');

		// Create the enter selection and append mark elements (paths):
		marks.enter() 
		  	.append('svg:path')
		  		.attr('class', function(d,i) {
		  			return 'marks area ' + 'area' + i;
		  		});

		this._colors( marks, 'fill' );

		// Initialize the path generator:
		var area = d3.svg.area()
			.x( function(d) { return xScale( xVal(d) ); } )
			.y0( function(d) { return yScale( d.get('y0' ) ); } )
			.y1( function(d) { return yScale( yVal(d) + d.get('y0') ); } )
			.interpolate( interpolation );

		this.draw = function() {
			marks.attr('d', function(d) {
				return area( dataset(d) );
			});
			return this;
		};

		return this;
	}, // end METHOD stacked()

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
			this.events = obj;
			this._initialized();
			return this;
		}
		return;
	},

	_initialized: function() {
		if ( this.model.get('data') && this.model.get('marks') && this.model.get('canvas') && this.model.get('axes') && this.model.get('layers') ) {
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
		this.events.on('data:collection:add', this._initData, this);
		this.events.on('data:collection:remove', removeData, this);

		this.events.on('axes:xDomain:change axes:yDomain:change axes:xType:change axes:yType:change', draw, this);

		this.events.on('marks:type:change marks:interpolation:change marks:colors:change', this.redraw, this);
		this.events.on('marks:size:change', draw, this);
		
		return this;

		function removeData() {

			this.model.get('layers').data.marks
				.exit()
				.remove();

		}; // end FUNCTION removeData()		

		function draw() {
			var that = this;
			setTimeout(function() { that.draw();}, 10);
		};
		
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
				this.stacked( 'wiggle' );
				break;
			case 'stackedArea':
				this.stacked( 'zero' );
				break;
			default:
				this.line();
				console.log('WARNING:unrecognized chart type. Plotting default: "line".');
				break;
		}; // end SWITCH (type)

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
		// Update the domains:
		var collection = this.model.get('data'),
			data = collection.slice(0);

		var xMin = min('x'),
			xMax = max('x'),
			yMin = min('y'),
			yMax = max('y');

		this.model.get('axes').set({
			'xDomain': [xMin, xMax],
			'yDomain': [yMin, yMax]
		});

		return this;

		function min( key ) {
			return d3.min( data, function(d) {
				return collection.min(d, key)[key];
			});
		};

		function max( key ) {
			return d3.max( data, function(d) {
				return collection.max(d, key)[key];
			});
		};
		
	} // end METHOD _initDomains()

});