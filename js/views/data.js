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

			// Reset the options attribute:
			options = {};

			// Set a flag:
			this.init = true;

			// Set listeners:
			this._listeners();

		};

		// Initialize the layers object:
		this.layers.data = {};

	}, // end METHOD initialize()

	render: function() {

		if (!this.init) {
			console.log('ERROR:view not initialized. Provide five parameters: data, marks, canvas, axes, layers.')
			return;
		}; 

		this._initGraph()
			._initGenerator()
			._initData()
			._refreshDomains();

	}, // end METHOD render()

	redraw: function() {
		var generator = this._generator;

		this.layers.data.paths.attr('d', function(d,i) {
			return generator( d.get('data').toJSON() );
		});

		return this;

	},	// end METHOD redraw()

	line: function() {
		var xScale = this.axes.get('xScale'),
			yScale = this.axes.get('yScale'),
			interpolation = this.model.interpolation;

		this._generator = d3.svg.line()
			.x( function(d) { return xScale( d.x ); } )
			.y( function(d) { return yScale( d.y ); } )
			.interpolate( interpolation );

		return this;
	},

	area: function() {
		var height = this.canvas.get('height'),
			xScale = this.axes.get('xScale'),
			yScale = this.axes.get('yScale'),
			interpolation = this.model.get('interpolation');

		this._generator = d3.svg.area()
			.x( function(d) { return xScale( d.x ); } )
			.y0( height )
			.y1( function(d) { return yScale( d.y); } )
			.interpolate( interpolation );

		return this;
	},

	scatter: function() {

	},

	steamgraph: function() {
		var xScale = this.axes.get('xScale'),
			yScale = this.axes.get('yScale'),
			interpolation = this.model.get('interpolation');

		this._stack = d3.layout.stack()
			.offset('wiggle')
			.values( function(d) { return d.get('data').toJSON(); });

		this._generator = d3.svg.area()
			.x( function(d) { return xScale( d.x ); } )
			.y0( function(d) { return yScale( d.y); } )
			.y1( function(d) { return yScale( d.y + d.y0); } )
			.interpolate( interpolation );

		return this;
	},









	data: function( data ) {
		if (data) {
			this.model.set('data', model);
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

	_initialized: function() {
		if ( this.model.get('data') && this.model.get('marks') && this.model.get('canvas') && this.model.get('axes') && this.model.get('layers') ) {
			this.init = true;
			this._listeners();
		}else {
			this.init = false;
		}; 
	},

	_listeners: function() {

		var data = this.model.get('data'),
			axes = this.model.get('axes'),
			marks = this.model.get('marks');

		// Listeners:
		data.on('add', this._initData, this);
		data.on('remove', removeData, this);
		axes.on('change:xDomain change:yDomain', this._refreshDomains, this);
		marks.on('change:type', function() {
			this._initGenerator()
				._initData()
				.redraw();
		}, this);
		
		return this;

		function removeData() {

			this.model.get('layers').data.paths
				.exit()
				.remove();

		}; // end FUNCTION removeData()		
		
	}, // end METHOD _listeners()

	_initGraph: function() {

		var canvas = this.models.get('canvas'),
			layers = this.models.get('layers');

		// Create a group for all data sets:
		layers.data.base = layers.chart.append("svg:g")
			.attr('class', 'data-sets');

		// Include a path clipper to prevent layer spillover:
		layers.data.clipPath = layers.data.base.append("svg:g")
			.attr('clip-path', "url(" + canvas.get( '_clipPath' ) +  ")");

	}, // end METHOD _initGraph()

	_initGenerator: function() {
		switch ( this.model.marks.get('type') ) {
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
				this.steamgraph();
				break;
			default:
				this.line();
				console.log('WARNING:unrecognized chart type. Plotting default: "line".');
				break;
		}; // end SWITCH (type)

	}, // end METHOD _initGenerator()	

	_initData: function() {

		var data = this._getData(),
			layers = this.model.get('layers');		

		// Bind the data and create the path elements:
		layers.data.paths = layers.data.clipPath.selectAll('.line')
			.data( data )
		  .enter() // create the enter selection
		  	.append('svg:path')
		  		.attr('class', function(d,i) {
		  			return 'line ' + 'line' + i;
		  		});

		return this;

	}, // end METHOD _initData()	

	_getData: function() {
		var data = this.model.get('data').slice(0);
		if (this.model.marks.get('type') == 'steamgraph') {
			data = this._stack( this.model.get('data').slice(0) );
		};
		return data;
	}, // end METHOD _getData()	

	_refreshDomains: function() {
		// Update the domains:
		var xMin, xMax, yMin, yMax;
		var that = this;

		xMin = d3.min( that.data.slice(0), function(d) {
			return that.data.min(d, 'x').x;
		});
		xMax = d3.max( that.data.slice(0), function(d) {
			return that.data.max(d, 'x').x;
		});
		yMin = d3.min( that.data.slice(0), function(d) {
			return that.data.min(d, 'y').y;
		});
		yMax = d3.max( that.data.slice(0), function(d) {
			return that.data.max(d, 'y').y;
		});

		this.model.get('axes').set({
			'xDomain': [xMin, xMax],
			'yDomain': [yMin, yMax]
		});
		
	} // end METHOD _refreshDomains()

});