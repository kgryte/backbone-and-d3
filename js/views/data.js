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
		// options should include 'data','canvas', 'axes', and 'layers':
		if ( !options.data || !options.type || !options.canvas || !options.axes || !options.layers ) {
			throw 'ERROR:layer instantiation requires a data attribute "data", a type attribute "type", a canvas attribute "canvas", an axes attribute "axes", and a layers attribute "layers".';
		};

		var that = this;

		// Get the defaults:
		var Model = Backbone.Model.extend({});	
		this.model = new Model( this.defaults() );


		// Assign over the options:
		this.data = options.data;
		this.canvas = options.canvas;
		this.axes = options.axes;
		this.layers = options.layers;

		// Initialize the layers object:
		this.layers.data = {};

		// Update the chart type:
		this.model.set('type', options.type);

		// Get the path generator:
		getGenerator();

		// Initialize the drawing:
		initGraph();

		// Do we have data?
		if (this.data.length > 0) {
			bindData();
		};

		// Listeners:
		this.data.on('add', bindData);
		this.data.on('remove', removeData);
		this.axes.on('change:xDomain', updateDomains, this);
		this.axes.on('change:yDomain', updateDomains, this);
		this.model.on('change:type', function() {
			getGenerator();
			bindData();
		}, this);
		
		function getGenerator() {
			switch ( that.model.get('type') ) {
				case 'line':
					that.line();
					break;
				case 'area':
					that.area();
					break;
				case 'scatter':
					that.scatter();
					break;
				case 'steamgraph':
					that.steamgraph();
					break;
				default:
					that.line();
					console.log('WARNING:unrecognized chart type. Plotting default: "line".');
					break;
			}; // end SWITCH (type)

		}; // end FUNCTION getGenerator()

		function initGraph() {

			// Create a group for all data sets:
			that.layers.data.base = that.layers.chart.append("svg:g")
				.attr('class', 'data-sets');

			// Include a path clipper to prevent layer spillover:
			that.layers.data.clipPath = that.layers.data.base.append("svg:g")
				.attr('clip-path', "url(" + that.canvas.get( '_clipPath' ) +  ")");

		}; // end FUNCTION initGraph()

		function bindData() {

			var data;
			if (that.model.get('type') == 'steamgraph') {
				data = that._stack( that.data.slice(0) );
			}else {
				data = that.data.slice(0);
			};

			// Bind the data and create the path elements:
			that.layers.data.paths = that.layers.data.clipPath.selectAll('.line')
				.data( data )
			  .enter() // create the enter selection
			  	.append('svg:path')
			  		.attr('class', function(d,i) {
			  			return 'line ' + 'line' + i;
			  		});

			// Update the domains:
			updateDomains();

			// Render the data:
			that.render();

		}; // end FUNCTION bindData()

		function removeData() {

			that.layers.data.paths.exit().remove();

		}; // end FUNCTION removeData()

		function updateDomains() {
			// Update the domains:
			var xMin, xMax, yMin, yMax;
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

			that.axes.set({
				'xDomain': [xMin, xMax],
				'yDomain': [yMin, yMax]
			});
			
		}; // end FUNCTION updateDomains()

	}, // end METHOD initialize()

	render: function() {

		var generator = this._generator;

		this.layers.data.paths.attr('d', function(d,i) {
			return generator( d.get('data').toJSON() );
		});

		return this;

	},	// end METHOD render()

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
	}

});