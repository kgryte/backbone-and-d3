/**
*	MODEL: Axes
*
*	NOTES:
*		
*
*	HISTORY:
*		2013-06-21: KGryte. Created.
*
*	DEPENDENCIES:
*		[1] Backbone.js
*		[2] Underscore.js
*		[3] Chart.js - ancestor model class
*		[4] D3.js
*
*	TODOS:
*		[1] Allow scale type input: utc (?) --> Vega
*		[2] Handle nice() on update
*
*
*	@author Kristofer Gryte. http://www.kgryte.com
*
*	Copyright (c) 2013. MIT License.
*
*
*
*/

Chart.Models.Axes = Backbone.ChartModel.extend({

	defaults: function() {

		return {
			// Axis labels:
			xLabel: 'x',
			yLabel: 'y',

			// Axis orientation:
			xOrient: 'bottom', // either top or bottom
			yOrient: 'left',   // either left or right

			// Axis limits [data]:
			xDomain: [0, 1], // xLimits
			yDomain: [0, 1], // yLimits

			// Axis limits [visual]:
			xRange: [0, 100],
			yRange: [100, 0], // Inverted as (0,0) begins in upper-left

			// Axis scales:
			xType: 'linear',
			yType: 'linear',
			xScale: d3.scale.linear(), // function 
			yScale: d3.scale.linear(), // function

			// Axis generators:
			xAxis: d3.svg.axis(), // function
			yAxis: d3.svg.axis(), // function

			// Round:
			round: true, // rounds output values to integers; D3 --> .nice()

			// Edit on figure:
			editable: true, 

			// Event dispatcher:
			events: null
		};

	},

	initialize: function( options ) {

		// Update our scales:
		this._xType(); // could also use xScale(), but xtype() also accounts for a change in scale type.
		this._yType();

		if (this.get('round')) {
			this.get('xScale').nice();
			this.get('yScale').nice();
		}; // end IF

		// Update our axis generators:
		this._xAxis();
		this._yAxis();

		// Publish to the event dispatcher:
		if ( this.get('events') ) {
			this._listeners();
		}; // end IF (dispatcher)			

	},

	validate: function( attrs, options ) {
		// Check that we have supplied attributes:
		if (!attrs) {
			return;
		}; 

		var errors = {},
			invalidKeys = [];

		// Check that input is an object:
		if ( !_.isObject( attrs ) ) {
			errors['init'] = 'ERROR:invalid input. Supply an appropriate associative array.';
		}else {
			// Get the keys:
			var keys = _.keys(attrs);
			// Iterate over each key and perform appropriate validation:
			_.each(keys, validator);
		}; 

		return {
			errors: errors,
			invalidKeys: invalidKeys
		};

		function validator( key ) {

			var prefix = 'ERROR:invalid input for "' + key + '". ';

			var val = attrs[key];

			switch (key) {

				case 'xLabel': case 'yLabel':
					if ( !_.isString( val ) ) {
						errors[key] = prefix + 'Assigned value must be a string.';
					};
					break;

				case 'xOrient': case 'yOrient':
					if ( !_.isString( val ) ) {
						errors[key] = prefix + 'Assigned value must be a string.'
					}else {
						if ( key === 'xOrient' && val != 'bottom' && val != 'top' ) {
							errors[key] = prefix + 'Assigned value must be either "bottom" or "top".';
						}else if ( key === 'yOrient' && val != 'left' && val != 'right' ) {
							errors[key] = prefix + 'Assigned value must be either "left" or "right".';
						};
					};
					break;

				case 'xDomain': case 'yDomain': case 'xRange': case 'yRange':
					if ( !_.isArray( val ) || val.length !=2 ) {
						errors[key] = prefix + 'Must be either an array of length 2.';
					}else {
						_.each(val, function( num ) {
							if ( !_.isFinite( num ) ) {
								errors[key] = prefix + 'Array elements must be finite numbers.';
							}; // end IF
						});
					};
					break;

				case 'xScale': case 'yScale': case 'xAxis': case 'yAxis':
					if ( !_.isFunction( val ) ) {
						errors[key] = prefix + 'Assigned object must be a function.';
					};
					break;

				case 'round': case 'editable':
					if ( !_.isBoolean( val ) ) {
						errors[key] = prefix + 'Assigned value must be a boolean: true or false.';
					}; 
					break;

				case 'xType': case 'yType':
					if ( !_.isString( val ) ) {
						errors[key] = prefix + 'Assigned value must be a string.';
					}else {
						var validVals = ['linear', 'pow', 'sqrt', 'log', 'quantize', 'quantile', 'threshold', 'ordinal', 'time'];
						if (validVals.indexOf(val) < 0) {
							errors[key] = prefix + 'Assigned value must be one of the following: ' + validVals;
						}; 
					};
					break;

				case 'events':
					if ( !_.isObject( val ) ) {
						errors[key] = prefix + 'Assigned value must be an object.';
					}else {
						if ( !val.hasOwnProperty('trigger') || !_.isFunction( val.trigger) ) {
							errors[key] + prefix + 'Assigned object must have a trigger method.';
						};
					};
					break;

				default:
					console.log('WARNING:unrecognized attribute: ' + key );
					invalidKeys.push(key);
					break;

			}; // end SWITCH

		}; // end FUNCTION validator(key)
		
	}, // end METHOD validate()

	_listeners: function() {
		var events = this.get('events');

		// Bind listeners to ensure model consistency:
		this.on("change:xOrient", xOrient, this);
		this.on("change:yOrient", yOrient, this);

		this.on("change:xScale", xScale, this);
		this.on("change:yScale", yScale, this);

		this.on("change:xDomain", xDomain, this);
		this.on("change:yDomain", yDomain, this);

		this.on("change:xRange", xRange, this);
		this.on("change:yRange", yRange, this);

		this.on("change:xType", xType, this);
		this.on("change:yType", yType, this);

		this.on("change:xLabel", xLabel, this);
		this.on("change:yLabel", yLabel, this);	

		function xOrient() {
			this._xAxis();
			events.trigger('axes:xOrient:change');
		};

		function yOrient() {
			this._yAxis();
			events.trigger('axes:yOrient:change');
		};
		
		function xScale() {
			this._xAxis();
			events.trigger('axes:xScale:change');
		}; 

		function yScale() {
			this._yAxis();
			events.trigger('axes:yScale:change');
		};

		function xDomain() {
			this._xScale();
			events.trigger('axes:xDomain:change');
		};

		function yDomain() {
			this._yScale();
			events.trigger('axes:yDomain:change');
		};

		function xRange() {
			this._xScale();
			events.trigger('axes:xRange:change');
		};

		function yRange() {
			this._yScale();
			events.trigger('axes:yRange:change');
		};

		function xType() {
			this._xType();
			events.trigger('axes:xType:change');
		};

		function yType() {
			this._yType();
			events.trigger('axes:yType:change');
		};

		function xLabel() {
			events.trigger('axes:xLabel:change');
		};

		function yLabel() {
			events.trigger('axes:yLabel:change');
		};

	}, // end METHOD _listeners()

	_xAxis: function() {
		this.get('xAxis')
			.orient( this.get('xOrient') )
			.scale( this.get('xScale') );
	}, // end FUNCTION xAxis()

	_yAxis: function() {
		this.get('yAxis')
			.orient( this.get('yOrient') )
			.scale( this.get('yScale') );
	}, // end FUNCTION yAxis()

	_xScale: function() {
		this.get('xScale')
			.domain( this.get('xDomain') )
			.range( this.get('xRange') );
	}, // end FUNCTION xScale()

	_yScale: function() {
		this.get('yScale')
			.domain( this.get('yDomain') )
			.range( this.get('yRange') );
	}, // end FUNCTION yScale()

	_xType: function() {
		this.set('xScale', this._getScale(this.get('xType')) );
		this._xScale();
	}, // end FUNCTION xType()

	_yType: function() {
		this.set('yScale', this._getScale(this.get('yType')) );
		this._yScale();
	}, // end FUNCTION yType()

	_getScale: function(type) {
		var scale;
		switch (type) {
			case 'linear':
				scale = d3.scale.linear();
				break;
			case 'pow':
				scale = d3.scale.pow();
				break;
			case 'sqrt':
				scale = d3.scale.sqrt();
				break;
			case 'log':
				scale = d3.scale.log();
				break;
			case 'quantize':
				scale = d3.scale.quantize();
				break;
			case 'threshold':
				scale = d3.scale.threshold();
				break;
			case 'quantile':
				scale = d3.scale.quantile();
				break;
			case 'ordinal':
				scale = d3.scale.ordinal();
				break;
			case 'time':
				scale = d3.time.scale();
				break; 
			default:
				console.log('WARNING:unrecognized scale type. Using default: d3.scale.linear()');
				scale = d3.scale.linear();
				break;
		};
		return scale;
	} // end FUNCTION getScale(type)

});