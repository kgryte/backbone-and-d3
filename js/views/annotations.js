/**
*	VIEW: Annotations
*
*	NOTES:
*		
*
*	HISTORY:
*		2013-06-27: KGryte. Created.
*
*	DEPENDENCIES:
*		[1] Backbone.js
*		[2] Underscore.js
*		[3] D3.js
*		[4] jQuery.js
*
*
*	@author Kristofer Gryte. http://www.kgryte.com
*
*	Copyright (c) 2013. MIT License.
*
*
*
*/

// Annotations layer:
Chart.Layers.Annotations = Backbone.View.extend({

	initialize: function( options ) {

		var Model = Backbone.Model.extend({});
		this.model = new Model();

		if (options) {
			// options should include 'data', 'canvas', 'axes', 'annotations', and 'layers':
			if ( !options.data || !options.annotations || !options.canvas || !options.axes || !options.layers ) {
				throw 'ERROR:layer instantiation requires an associative array with the following keys: data, annotations, canvas, axes, layers.';
			};

			this.model.set( {data: options.data, annotations: options.annotations, canvas: options.canvas, axes: options.axes, layers: options.layers} );

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
			console.log('ERROR:view not initialized. Provide five parameters: data, annotations, canvas, axes, layers.')
			return;
		}; 

		// Local variables:
		var layers = this.model.get('layers'),
			annotations = this.model.get('annotations'),
			title = annotations.get('title'),
			caption = annotations.get('caption'),
			legend = annotations.get('legend'),
			dataCursor = annotations.get('dataCursor');	

		// Initialize the annotation layer:
		layers.annotations = {};

		// Determine what to render:
		if ( title ) {
			this.title();
		}; // end IF title

		if ( caption ) {
			this.caption();
		}; // end IF caption

		if ( legend.length ) {
			this.legend();
		}; // end IF legend

		if ( dataCursor ) {
			this.initCursor();
		}; // end IF dataCursor

		return this;

	},	// end METHOD initAnnotations()

	title: function() {
		var layers = this.model.get('layers'),
			width = this.model.get('canvas').get('_graph').width,
			title = this.model.get('annotations').get('title');

		layers.annotations.title = layers.chart.append('svg:text')
			.attr('x', width / 2)
			.attr('y', 2 )
			.attr('text-anchor', 'middle')
			.attr('class', 'title')
			.attr('contenteditable', true)
			.text( title );

		return this;
	},

	caption: function() {
		var layers = this.model.get('layers'),
			width = this.model.get('canvas').get('_graph'),
			marginLeft = this.model.get('canvas').get('marginLeft'),
			caption = this.model.get('annotations').get('caption'),
			editable = this.model.get('annotations').get('editable');

		// For the caption, we append a <figcaption> to the <figure> container:
		layers.annotations.caption = layers.container.append('figcaption')
			.attr('class', 'caption')
			.attr('contenteditable', editable)
			.style('width',  width + 'px' )
			.style('padding-left', marginLeft + 'px' )
			.html( caption );

		return this;
	},

	legend: function() {
		var layers = this.model.get('layers');

		// For each data series, get the last data value and append a text object to that value:
		var legend = this.model.get('annotations').get('legend'),
			xScale = this.model.get('axes').get('xScale'),
			yScale = this.model.get('axes').get('yScale'),
			data = [],
			dataset = this._dataset,
			xVal = this._xValue,
			yVal = this._yValue;

		_.each(this._collection(), function(d,i) {
			data.push( _.last( dataset( d ) ) );
		});			

		layers.annotations.legend = layers.chart.selectAll('.legend')
			.data( data )
		  .enter().append('svg:text')
			.attr('transform', function(d) { return "translate(" + xScale( xVal(d) ) + "," + yScale( yVal(d) ) + ")"; })
			.attr('x', 3 )
			.attr('dy', ".35em" )
			.attr('class', 'legend')
			.text( function(d,i) { return legend[i]; } );	

		if (this.model.get('annotations').get('interactive')) {
			this._initInteraction();
		}; // end IF

		return this;
	},

	_initInteraction: function() {

		var layers = this.model.get('layers');

		// Set the hover events:
		layers.annotations.legend.style('cursor', 'pointer')
			.on('mouseover.hover', mouseover )
			.on('mouseout.hover', mouseout );

		return this;

		function mouseover() {
			var self = this,
				id;				

			layers.annotations.legend.transition()
				.filter( function(d,i) {
					if (self == this) {
						id = i;
					};
					return self != this;
				})
				.duration(1000)
				.style('opacity', 0.3);

			layers.data.marks.transition()
				.filter( function(d,i) {
					return id != i;
				})
				.duration(1000)
				.style('opacity', 0.3);
		}; // end FUNCTION mouseover()

		function mouseout() {
			layers.annotations.legend.transition()
				.duration(200)
				.style('opacity', 1);
			layers.data.marks.transition()
				.duration(200)
				.style('opacity', 1);
		}; // end FUNCTION mouseout()	

	}, // end METHOD _interInteraction()

	initCursor: function() {
		// Get the chart container and base data layers:
		var layers = this.model.get('layers'),
			chartLayer = layers.container,
			dataLayer = layers.data.base,
			xScale = this.model.get('axes').get('xScale'),
			yScale = this.model.get('axes').get('yScale'),
			dataset = this._dataset,
			xVal = this._xValue,
			yVal = this._yValue;

		// Add the tooltip and make transparent:
		var tooltip = chartLayer.append('div')
			.attr('class', 'data-cursor tooltip')
			.style('opacity', 0);

		// Namespace the data cursor callback:
		layers.data.marks.on('mouseover.cursor', createCursor )
			.on('mouseout.cursor', destroyCursor );

		// Define the x-bisector: (where, for the id returned, data[id-1] < val < data[id])
		var xBisect = d3.bisector( function(d) { return xVal(d); }).left;

		// Initialize the mouse coordinates:
		var coords;

		return this;

		function createCursor() {

			// Get the current mouse coordinates:
			coords = d3.mouse( this );

			// Map those pixel coordinates to the data space:
			var xData = xScale.invert( coords[0] ),
				yData = yScale.invert( coords[1] );

			// Determine the closest data indices:
			var data = dataset( d3.select(this).data()[0] ),
				id = xBisect(data, xData),
				xLower = xVal( data[id-1] ),
				xUpper = xVal( data[ id ] );

			if ( (xData-xLower) < (xUpper-xData) ) {
				// The closet x-value is the previous data point:
				id = id - 1;
			}; // end IF			

			dataLayer.selectAll('.data-cursor')
				.data( [ data[id] ] )
			  .enter().append('svg:circle')
				.attr('class', 'data-cursor')
				.attr('cx', function(d) { return xScale( xVal(d) ); } )
				.attr('cy', function(d) { return yScale( yVal(d) ); } )
				.attr('fill', 'black')
				.attr('r', 0)
				.transition()
					.duration(500)
					.ease('linear')
					.attr('r', 5)
					.call( showTooltip, data[id] );

		}; // end FUNCTION createCursor()

		function destroyCursor() {
			dataLayer.selectAll('.data-cursor')
				.transition()
					.call( hideTooltip )
					.duration(200)
					.ease('linear')
					.attr('r', 0)
					.remove();
		}; // end FUNCTION destroyCursor()

		function showTooltip( selection, d ) {
			var str = 'x: ' + xVal(d) + '<br>y: ' + yVal(d);
			// Determine the position of the chart container:
			var pos = $(chartLayer[0][0]).position();
			// Show the tooltip and move into position:
			tooltip.transition()
				.duration(200)
				.style('opacity', 0.9);
			tooltip.html( str )
				.style('left', d3.event.pageX - pos.left + 14 + 'px')
				.style('top', d3.event.pageY - pos.top + 'px');
		}; // end FUNCTION showTooltip()

		function hideTooltip( d ) {
			tooltip.transition()
				.duration(200)
				.style('opacity', 0);
		}; // end FUNCTION hideTooltip()

	}, // end METHOD initCursor()

	data: function( data ) {
		if (data) {
			this.model.set('data', data);
			this._initialized();
			return this;
		}
		return this.model.get('data');
	},

	annotations: function( model ) {
		if (model) {
			this.model.set('annotations', model);
			this._initialized();
			return this;
		}
		return this.model.get('annotations');
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
		if ( this.model.get('data') && this.model.get('annotations') && this.model.get('canvas') && this.model.get('axes') && this.model.get('layers') ) {
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
		var title = function() {
			var layers = this.model.get('layers'),
				title = this.model.get('annotations').get('title');
			
			if (layers.annotations.title) {
				layers.annotations.title.text( title );
				return;
			};
			this.title();
		}; // end FUNCTION title()

		var legend = function() {
			var layers = this.model.get('layers'),
				legend = this.model.get('annotations').get('legend');
			
			if (layers.annotations.legend) {
				layers.annotations.legend.text( function(d,i) { 
					return legend[i]; 
				});
				return;
			};
			this.legend();
		}; // end FUNCTION legend()

		var caption = function() {
			var layers = this.model.get('layers'),
				caption = this.model.get('annotations').get('caption');

			if (layers.annotations.caption) {
				layers.annotations.caption.html( caption );
				return;
			};
			this.caption();
		}; // end FUNCTION caption()

		var toggleDataCursor = function() {

			var layers = this.model.get('layers');

			if (!this.model.get('annotations').get('dataCursor')) {
				// Remove the tooltip:
				layers.container.selectAll('.data-cursor.tooltip').remove();

				// Remove the event handlers:
				layers.data.marks.on('mouseover.cursor', null )
					.on('mouseout.cursor', null );

				return;
			}; // end IF
			this.initCursor();

		}; // end FUNCTION toggleDataCursor()

		var toggleInteraction = function() {
			var layers = this.model.get('layers');

			if (!this.model.get('annotations').get('interactive')) {
				layers.chart.selectAll('.legend')
					.on('mouseover.hover', null )
					.on('mouseout.hover', null );
				return;
			}; // end IF
			if (layers.annotations.legend) {
				this._initInteraction();
			}; // end IF
		}; // end FUNCTION toggleInteraction()

		var toggleEditable = function() {
			var layers = this.model.get('layers'),
				editable = this.model.get('annotations').get('editable');

			if (layers.annotations.caption) {
				layers.annotations.caption.attr('contenteditable', editable);
			}; // end IF
		}; // end FUNCTION toggleEditable()

		var updateLegend = function() {

			var layers = this.model.get('layers');

			if (!layers.annotations.legend) {
				return;
			};

			var xScale = this.model.get('axes').get('xScale'),
				yScale = this.model.get('axes').get('yScale'),
				xDomain = xScale.domain(),
				dataset = this._dataset,
				xVal = this._xValue,
				yVal = this._yValue;

			// Define the x-bisector: (where, for the id returned, data[id-1] < val < data[id])
			var xBisect = d3.bisector( function(d) { return xVal(d); }).left;

			var data = [],
				id;
			_.each(this._collection(), function(d,i) {
				id = xBisect( dataset(d), xDomain[1] );
				if (id >= dataset(d).length) {
					id = id - 1; // edge case
				}; // end IF
				data.push( dataset(d)[id] );
			});

			// Rebind the updated data and move the legend:
			layers.annotations.legend
				.data( data )
				.transition()
					.duration(100)
					.ease('linear')
					.attr('transform', function(d) { 
						return 'translate(' + xScale( xVal(d) ) + ',' + yScale( yVal(d) ) + ')'; });

		}; // end FUNCTION updateLegend()

		var updateCursor = function() {
			if (!this.model.get('annotations').get('dataCursor')) {
				return;
			}; // end IF

			var layers = this.model.get('layers'),
				chartLayer = layers.container;			

			// Remove previous cursor and cursor listeners:
			chartLayer.selectAll('.data-cursor.tooltip').remove();

			// Re-initialize:
			this.initCursor();

		}; // end FUNCTION updateCursor()

		var resize = function() {

			var width = this.model.get('canvas').get('_graph').width,
				marginLeft = this.model.get('canvas').get('marginLeft'),
				annotations = this.model.get('layers').annotations;

			if (annotations.title) {
				annotations.title.attr('x', width / 2)
			}; // end IF

			if (annotations.caption) {
				annotations.caption.style('width',  width + 'px' )
				.style('padding-left', marginLeft + 'px' );			
			}; // end IF

			if (annotations.legend) {
				updateLegend();
			}; // end IF

			if (this.model.get('annotations').get('dataCursor')) {
				// Need to update the scale pointers within the closure; re-initialize:
				updateCursor();
			}; // end IF

		}; // end FUNCTION resize()

		//
		var subscribe = function() {
			// Subscribers:
			var events = {
				'annotations:title:change': title,
				'annotations:legend:change': legend,
				'annotations:caption:change': caption,
				'annotations:dataCursor:change': toggleDataCursor,
				'annotations:interactive:change': toggleInteraction,
				'annotations:editable:change': toggleEditable,
				'axes:xDomain:change': updateLegend,
				'axes:yDomain:change': updateLegend,
				'axes:xType:change': updateLegend,
				'axes:yType:change': updateLegend,
				'data:redraw': updateCursor,
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
			title = _.bind(title, this);
			legend = _.bind(legend, this);
			caption = _.bind(caption, this);
			toggleDataCursor = _.bind(toggleDataCursor, this);
			toggleInteraction = _.bind(toggleInteraction, this);
			toggleEditable = _.bind(toggleEditable, this);
			updateLegend = _.bind(updateLegend, this);
			updateCursor = _.bind(updateCursor, this);
			resize = _.bind(resize, this);		
		}; // end FUNCTION bind()	

		// Ensure context:
		bind = _.bind(bind, this);
		bind();

		// Channel subscriptions:
		subscribe();
		
		return this;

	}, // end METHOD listeners()

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
	} // end METHOD collection accessor

});