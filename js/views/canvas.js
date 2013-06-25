/**
*	VIEW: Canvas
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

// Base chart layer (the canvas):
Chart.Layers.Base = Backbone.View.extend({

	initialize: function( options ) {

		var Model = Backbone.Model.extend({});
		this.model = new Model();

		if (options) {
			// options should include 'el','canvas', and 'layers':
			if ( !options.el || !options.canvas || !options.layers ) {
				throw 'ERROR:layer instantiation requires an associative array with the following keys: el, canvas, layers.';
			}; 

			this.model.set( {el: options.el, canvas: options.canvas, layers: options.layers	} );

			// Reset the options attribute:
			options = {};

			// Set a flag:
			this.init = true;

		}; 

	}, // end METHOD initialize()

	render: function() {

		if (!this.init) {
			console.log('ERROR:view not initialized. Provide three parameters: el, canvas, layers.')
			return;
		}; 

		// Create local variables to make the code less verbose:
		var element = this.model.get('el'),
			layers = this.model.get('layers'),
			canvas = this.model.get('canvas'),
			width = canvas.get('width'),
			height = canvas.get('height'),
			margin = canvas.get('margin'),
			graph = canvas.get('_graph');

		// Create an HTML <figure> container to hold the chart:
		layers.container = d3.select( element ).append('figure')
			.attr('width', width)
			.attr('class', 'mvcChart');
		
		// Create the canvas:
		layers.base = layers.container.append("svg:svg")
			.attr('width', width)
			.attr('height', height)
			.attr('class', 'base');

		// Initialize the chart area:
		layers.chart = layers.base.append("svg:g")
			.attr('transform', 'translate(' + margin[3] + ',' + margin[0] + ')')
			.attr('class', 'chart');

		// Append a path clipper, defining the data viewport:
		var numCharts = d3.selectAll('.mvcChart')[0].length,
			clipPathID = 'graphClipPath' + numCharts;

		canvas.set( '_clipPath', '#' + clipPathID, {validate: false} );

		layers.chart.append("svg:defs")
			.append("svg:clipPath")
				.attr("id", clipPathID)
				.append("svg:rect")
					.attr("width", graph.width)
					.attr("height", graph.height);

		return this;

	},	// end METHOD initCanvas()

	elem: function( element ) {
		if (element) {
			this.model.set('el', element);
			this._initialized();
			return this;
		}
		return this.model.get('el');
	},

	canvas: function( model ) {
		if (model) {
			this.model.set('canvas', model);
			this._initialized();
			return this;
		}
		return this.model.get('canvas');
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
		if ( this.model.get('el') && this.model.get('canvas') && this.model.get('layers') ) {
			this.init = true;
		}else {
			this.init = false;
		}; 
	}

});