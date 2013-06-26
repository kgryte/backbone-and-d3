/**
*	A reusable time series statistical graphic with Backbone.js and D3.js
*
*
*
*	Author:
*		Kristofer Gryte
*		http://www.kgryte.com
*
*	History:
*		2013/06/12 - KGryte. Created.
*
*
*	TODO:
*		[1] Decouple view 'data' from view itself. Create a chart model (?) --> a work in progress
*		[2] x and y accessors? Are they necessary? Could this allow for user's to define their own input data structure? e.g., array versus associative array?
*		[3] Replace underscore with lo-dash (?)
*		[4] Stipulate updates
*		[5] Update defaults and validation so that either (a) backbone-nested can be used or (b) such that the config levels do not extend beyond 1, e.g., marginLeft: 10 versus margin: {left: 10, ...}
*		[6] Change axis implementation. Currently, external modification does not make sense, as axis is translated beyond user control
*		[7] Provide validation for internal methods / variables
*		[8] Provide validation for animation and transition settings
*		[9] Refactor validation code to be more compact
*		[10] Ensure standard data representation
*		[11] For real-time sliding window, need to establish a one data point buffer so that the left data edge matches the chart viewport. --> Two ways: 1) create an explicit buffer; 2) fiddle with the collection updates so that the listener fires only on add but not remove. Currently, this is how the buffer is maintained. The downside is that the last time series legend lags.
*		[12] Switch the order such that axes plotted on top of data (?)
*		[13] Resolve the tension between the animation layer and, say, the data layer with regard to transitions. Question to answer: are transitions something fundamental to the graph (to its normal functioning)? If so, then transitions in the data layer; otherwise, something extra (gratuitus). Add/remove methods for new dataseries.
*		[14] Output error messages to a pop up dialog. Currently just logged to console.
*		[15] Add updates for adding and removing time series from the plot
*		[16] 
*		[17] 
*
*
*
*	BUGS:
*		[1] On load, the animation transition is sometimes interrupted. This could be due to the transition() method being over-written. --> Yes! If a listener event is called, say, the user hovers/mousemoves over the plot, the transition is interrupted. 
*
*
*
*	NOTES:
*		[1] Note that, on initialization and set, the full object must be specified for setting an attribute; e.g., margin: {top: , bottom: , left: , right: }
*		[2] Note that xScale and yScale are polymorphic in the data layer --> this makes sense due to data binding; data allows us to calculate domains; each layer should be independent of children inheritors.
*
*
*
*	 Copyright (c) 2013. Kristofer Gryte. http://www.kgryte.com
*	 License: MIT (http://www.opensource.org/licenses/mit-license.php)
*
*/



// Create the line chart layer:
App.Views.DataLayer = App.Views.ChartArea.extend({

	slideWindow: function( model, updatedData ) {

		// Redraw the paths and reset the translation:
		var line = this.model.get('_line');
		this.layer.data.paths.attr('d', function(d) {
				return line( d.get('dataSeries') );
			})
			.attr('transform', null);

		// Reset yDomain to original preference; if originally specified, calculate new max and min:
		this.yScale();

		// 
		var xScale = this.model.get('_xScale'),
			xOffset = this.model.get('_xOffset'),
			props = this.model.get('transition').onUpdate;

		// Update the x domain:
		var xMin = this.data[0].get('dataSeries')[1].x, // We assume a sorted data set
			xMax = _.last( this.data[0].get('dataSeries') ).x,
			xDomain = [ xMin, xMax ],
			xOffset = xDomain[0];
		
		xScale.domain( xDomain );

		this.model.set( {
			'_xDomain': xDomain
		});
		
		// Transition the axes:
		this.layer.axis.x.transition()
			.duration( props.duration ) 
			.ease( props.easing )
			.call( this.model.get('_xAxis') );
		
		this.layer.axis.y.transition()
			.duration( props.duration )
			.ease( props.easing )
			.call( this.model.get('_yAxis') );					

		// Calculate the shift:
		var lastVals = _.last( this.data[0].get('dataSeries'), 2 ),
			shift = xOffset - (lastVals[1].x - lastVals[0].x);

		// Slide the path with a transition:
		this.layer.data.paths.transition()
			.duration( props.duration )
			.ease( props.easing )
			.attr('transform', 'translate(' + xScale( shift ) + ')');

		return this;

	}

}); // end DataLayer



// Annotation Layer:
App.Views.AnnotationLayer = App.Views.DataLayer.extend({

	annotate: function() {

		// Initialize the annotation layer:
		this.layer.annotation = {};

		// Parse the relevant settings:
		var title = this.model.get('title'),
			caption = this.model.get('caption'),
			legend = this.model.get('legend'),
			dataCursor = this.model.get('dataCursor');

		if ( title ) {
			this.title();
		}; // end IF title

		if ( caption ) {
			this.caption();
		}; // end IF caption

		if ( legend.length ) {
			// Check!:
			if (legend.length != this.data.length) {
				// Gracefully not output anything and issue a warning to the console:
				console.log('WARNING:number of legend labels does not equal the number of data series. Legend not generated.');
			}else  {
				this.legend();
			}; // end IF/ELSE
		}; // end IF legend

		if ( dataCursor ) {
			this.initCursor();
		}; // end IF dataCursor

		return this;

	},

	title: function() {
		this.layer.annotation.title = this.layer.chart.append('svg:text')
			.attr('x', this.model.get('_graph').width / 2)
			.attr('y', 2 )
			.attr('text-anchor', 'middle')
			.attr('class', 'title')
			.text( this.model.get('title') );

		return this;
	},

	caption: function() {
		// For the caption, we append a <figcaption> to the <figure> container:
		this.layer.annotation.caption = this.layer.container.append('figcaption')
			.attr('class', 'caption')
			.style('width',  this.model.get('_graph').width + 'px' )
			.style('padding-left', this.model.get('margin').left + 'px' )
			.html( this.model.get('caption') );

		return this;
	},

	legend: function() {
		// Initialize the legend layer:
		this.layer.annotation.legend = [];

		// For each data series, get the last data value and append a text object to that value:
		var data = [],
			legend = this.model.get('legend'),
			xScale = this.model.get('_xScale'),
			yScale = this.model.get('_yScale');

		_.each(this.data, function(d,i) {
			data.push( _.last( d.get('dataSeries') ) );
		});			

		this.layer.annotation.legend = this.layer.chart.selectAll('.legend')
			.data( data )
		  .enter().append('svg:text')
			.attr('transform', function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; })
			.attr('x', 3 )
			.attr('dy', ".35em" )
			.attr('class', 'legend')
			.text( function(d,i) { return legend[i]; } );		

		return this;
	},

	updateLegend: function() {
		// Get the current xDomain and x- and y-scales:
		var xDomain = this.model.get('_xScale').domain(),
			xScale = this.model.get('_xScale'),
			yScale = this.model.get('_yScale');

		// Define the x-bisector: (where, for the id returned, data[id-1] < val < data[id])
		var xBisect = d3.bisector( function(d) { return d.x; }).left;

		var data = [],
			id;
		_.each(this.data, function(d,i) {
			id = xBisect( d.get('dataSeries'), xDomain[1] );
			if (id >= d.get('dataSeries').length) {
				id = id - 1; // edge case
			}; // end IF
			data.push( {
				'x': xDomain[1],
				'y': d.get('dataSeries')[id].y
			});
		});

		this.layer.annotation.legend
			.data( data )
			.transition()
				.duration(100)
				.ease('linear')
				.attr('transform', function(d) { 
					return 'translate(' + xScale(d.x) + ',' + yScale(d.y) + ')'; });

		return this;

	},

	initCursor: function() {

		// Get the chart container and base data layers:
		var chartLayer = this.layer.container,
			dataLayer = this.layer.data.base;

		// Add the tooltip to our annotation layer:
		var tooltip = chartLayer.append('div')
			.attr('class', 'data-cursor tooltip')
			.style('opacity', 0);

		// Namespace the data cursor callback:
		this.layer.data.paths.on('mouseover.cursor', createCursor )
			.on('mouseout.cursor', destroyCursor );

		// Get the x- and y-scales:
		var xScale = this.model.get('_xScale'),
			yScale = this.model.get('_yScale');

		// Define the x-bisector: (where, for the id returned, data[id-1] < val < data[id])
		var xBisect = d3.bisector( function(d) { return d.x; }).left;

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
			var data = d3.select(this).data()[0].get('dataSeries'),
				xPos = xBisect(data, xData);

			if ( (xData-data[xPos-1].x) < (data[xPos].x-xData) ) {
				// The closet x-value is the previous data point:
				xPos = xPos - 1;
			}; // end IF			

			dataLayer.selectAll('.data-cursor')
				.data( [ data[xPos] ] )
			  .enter().append('svg:circle')
			  	.attr('class', 'data-cursor')
			  	.attr('cx', function(d) { return xScale(d.x); } )
			  	.attr('cy', function(d) { return yScale(d.y); } )
			  	.attr('fill', 'black')
			  	.attr('r', 0)
			  	.transition()
			  		.duration(500)
			  		.ease('linear')
			  		.attr('r', 5)
			  		.call( showTooltip, data[xPos] );


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

		function showTooltip( transition, d ) {
			var str = 'x: ' + d.x + '<br>y: ' + d.y;
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

	}

}); // end AnnotationLayer



// Listener Layer:
App.Views.ListenerLayer = App.Views.AnnotationLayer.extend({

	listen: function() {

		// Get listeners settings:
		var settings = this.model.get('listeners');

		if ( settings.chart ) {

			// Bind chart data listeners:
			this.model.on('change:xLabel change:yLabel', this.refreshAxes, this);
			this.model.on('change:_xDomain change:_yDomain', this.updateAxes, this);
			this.model.on('change:_xDomain change:_yDomain', this.redraw, this);
			this.model.on('change:_xDomain change:_yDomain', this.updateLegend, this);

		}; // end IF

		if ( settings.data ) {

			// Bind plot data listeners:

			var updateFcn = this.model.get('_updateFcn');

			//this.collection.on('add:dataSeries', this.update, this);
			this.collection.on('change:dataSeries', updateFcn, this);
			//this.collection.on('reset', this.update, this);

		}; // end IF

	}

});



// Interaction layer:
App.Views.InteractionLayer = App.Views.ListenerLayer.extend({

	bindInteraction: function() {

		var selection = this.layer.data.paths;

		// Initialize our hover events:
		this.mouseover().mouseout();

		// Get the events:
		var mouseover = this.model.get('_mouseover'),
			mouseout = this.model.get('_mouseout');

		// Set the hover events:
		selection
			.style('cursor', 'pointer')
			.on('mouseover.hover', mouseover )
			.on('mouseout.hover', mouseout );

		// Determine if brush interaction is enabled:
		if ( this.model.get('brush') ) {
			this.initBrush()
				.createBrush();
		}; // end IF brush.on

		return this;

	},

	mouseover: function() {

		var mouseover = function() {
			var self = this;
			d3.selectAll('.data-series .line')
				.transition()
				.filter( function(d) {
					return self != this;
				})
				.duration(1000)
				.style('opacity', 0.3);
		};

		// Update our chart model:
		this.model.set('_mouseover', mouseover);

		return this;

	},

	mouseout: function() {

		var mouseout = function() {
			d3.selectAll('.data-series .line')
				.transition()
				.duration(200)
				.style('opacity', 1);
		};

		// Update our chart model:
		this.model.set('_mouseout', mouseout);

		return this;

	},

	initBrush: function() {

		// The brush is essentially its own mini chart.

		// Get the brush properties:
		var props = this.model.get('brushProps'),
			width = this.model.get('_graph').width; // this is a hack; need to allow for setting.

		// Get the xScale:
		var xScale = this.model.get('_xScale');

		// Specify the brush scale:
		var brushScale = d3.scale.linear()
			.domain( xScale.domain() ) // same domain as our main chart
			.range( [ 0, width ] ); // HACK!

		// Specify the brush axis generator:
		var brushAxis = d3.svg.axis()
			.scale( brushScale )
			.tickSize( props.height )
			.tickPadding( -props.height/2 )
			.orient('bottom');

		// Specify the brush generator:
		var brush = d3.svg.brush()
			.x( brushScale )
			.on('brush', onBrush );

		// Update our chart model:
		this.model.set( {
			'_brush': brush,
			'_brushScale': brushScale,
			'_brushAxis': brushAxis 
		} );

		var that = this;
		function onBrush() {
			// Get the current brush extent:
			var extent = brush.empty() ? brushScale.domain() : brush.extent();

			// Update the xScale:
			xScale.domain( extent );
			
			// Update our chart model: (this will trigger a listener callback)
			that.model.set('_xDomain', extent);

		}; // end FUNCTION onBrush()

		return this;

	},

	createBrush: function() {

		// Initialize the brush layer:
		this.layer.brush = {};
		this.layer.brush.axis = {};

		// Get the graph and brush specs:
		var canvas = this.model.get('canvas'),
			margin = this.model.get('margin'),
			graph = this.model.get('_graph'),
			props = this.model.get('brushProps');

		// Expand the SVG canvas: (make room for the brush)
		this.layer.base.attr('height', canvas.height + props.margin.top + props.height + props.margin.bottom);

		// Get the brush generators:
		var brush = this.model.get('_brush'),
			brushAxis = this.model.get('_brushAxis');

		// Create the brush container:
		var fromTop = canvas.height + props.margin.top;
		this.layer.brush.chart = this.layer.base.append('svg:g')
			.attr('class', 'brush')
			.attr('transform', 'translate(' + props.margin.left + ',' + fromTop + ')' );

		// Create the brush graph:
		this.layer.brush.bars = this.layer.brush.chart.append('svg:g')
			.attr('class', 'x bars')
			.call( brush )
			.selectAll( 'rect' )
			.attr('y', 0)
			.attr('height', props.height );

		// Create the brush x-axis:
		this.layer.brush.axis.x = this.layer.brush.chart.append('svg:g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + 0 + ')')
			.call( brushAxis );

		return this;

	}

});




// Animation layer:
App.Views.AnimationLayer = App.Views.InteractionLayer.extend({

	

	bindAnimation: function( ) {

		var selection, animationFcn;
		switch (this.model.get('animation')) {

			case 'enterLeft':

				// Define what is going to animate:
				selection = this.layer.data.paths;

				// Get the x scale and domain:
				var xScale = this.model.get('_xScale'),
					xDomain = xScale.domain();

				// Setup the transition:
				selection.attr("transform", "translate(" + xScale( -xDomain[1] ) + ")");

				// Set the animation function:
				animationFcn = enterLeft;

				break;

			case 'arise':

				// Define what is going to animate:
				selection = this.layer.data.paths;

				// Get the base layer height:
				var height = this.model.get('canvas').height;

				// Setup the transition:
				selection.attr('transform', 'translate(0,' + height + ') scale(1,0)' );

				// Set the animation function:
				animationFcn = arise;

				break;

			default:

				break;

		}; // end SWITCH animation

		// Store the selection to be animated and its associated animation:
		this.model.set({
			"_selection": selection,
			"_animationFcn": animationFcn
		});		

		return this;

		function enterLeft() {

			this.attr('transform', 'translate(' + xScale( xDomain[0] ) + ')');

		}; // end FUNCTION enterLeft()

		function arise() {

			this.attr('transform', 'translate(0,0) scale(1,1)');

		}; // end FUNCTION arise()

	},

	animate: function( ) {

		// Get the selection to be animated:
		var selection = this.model.get('_selection');

		// Get the scales:
		var xScale = this.model.get('_xScale'),
			yScale = this.model.get('_yScale');

		var props = this.model.get('animationProps'),
			duration = props.onEnter.duration,
			easing = props.onEnter.easing;

		var animate = this.model.get('_animationFcn');
		
		selection.transition()
			.duration( duration )
			.ease( easing )
			.call( animate );

		return this;

	},

	

});









Backbone.Validate = function( model, attrs ) {

	var errors = {};
		
	// Get the keys:
	var keys = _.keys(attrs);

	// Iterate over each key and perform the appropriate validation:
	_.each(keys, validator);

	return errors;

	function validator(key) {

		var prefix = 'ERROR:invalid input for "'+ key +'". ';

		var val = attrs[key];
		//console.log(val);
		switch (key) {

			case 'brush':
				// Must be boolean:
				if ( !_.isBoolean( val ) ) {
					errors[key] = prefix + 'Must be a boolean.';
				}; // end IF
				break;

			case 'brushProps':
				// Must be an object:
				if ( !_.isObject( val ) ) {
					errors[key] = prefix + 'Must be an object.';
					return;
				}; // end IF

				var validKeys = ['width', 'height', 'margin'];

				_.each(validKeys, function(validKey) {
					if ( !_.has( val, validKey ) ) {
						errors[key] = prefix + 'Object must have one of the following keys: ' + validKeys;
						return;
					};

					switch (validKey) {
						case 'height': case 'width':
							if ( !_.isFinite( val[validKey] ) ) {
								errors[key] = prefix + validKey + ' must be a finite number.';
							}; // end IF
							break;
						case 'margin':
							// Must be an object:
							if ( !_.isObject( val[validKey] ) ) {
								errors[key][validKey] = prefix + 'Must be an object.';
								return;
							}; // end IF

							var innerValidKeys = ['top', 'bottom', 'left', 'right'];
							
							_.each(innerValidKeys, function(innerValidKey) {
								if ( !_.has( val[validKey], innerValidKey ) ) {
									errors[key][validKey] = prefix + 'Object must have one of the following keys: ' + innerValidKeys;
									return;
								};
								if ( !_.isFinite( val[validKey][innerValidKey] ) ) {
									errors[key][validKey] = prefix + innerValidKey + ' must be a finite number.';
								}; // end IF
							});
							break;
					}; // end SWITCH
					
				});
				break;

			case 'interpolation': case 'animation': case 'mode':
				// Must be a string:
				if ( !_.isString( val ) ) {
					errors[key] = prefix + 'Must be a string.';
				}; // end IF

				var validVals;
				switch (key) {
					case 'interpolation':
						validVals = ['linear', 'linear-closed', 'step', 'step-before', 'step-after', 'basis', 'basis-open', 'basis-closed', 'bundle', 'cardinal', 'cardinal-open', 'cardinal-closed', 'monotone'];
						break;
					case 'animation':
						validVals = ['enterLeft', 'arise'];
						break;
					case 'mode':
						validVals = ['window', 'add', 'dynamic'];
						break;
				}; // end SWITCH (key)

				var index = validVals.indexOf( val );

				if (index == -1) {
					// Value not found:
					errors[key] = prefix + 'Assigned value must be one of the following options: ' + validVals;
				}; // end IF

				break;

			

		}; // end SWITCH

	}; // end FUNCTION validator(key)

}; // end FUNCTION Backbone.validate()