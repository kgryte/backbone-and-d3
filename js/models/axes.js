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
*		[3] D3.js
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

var Axes = Backbone.Model.extend({

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
			round: true // rounds output values to integers; D3 --> .nice()
		};

	},

	initialize: function() {
		var that = this;	

		// Update our scales:
		xType(); // could also use xScale(), but xtype() also accounts for a change in scale type.
		yType();

		if (this.get('round')) {
			this.get('xScale').nice();
			this.get('yScale').nice();
		}; // end IF

		// Update our axis generators:
		xAxis();
		yAxis();

		// Bind listeners to ensure model consistency:
		this.on("change:xOrient change:xScale", xAxis, this);
		this.on("change:yOrient change:yScale", yAxis, this);

		this.on("change:xDomain change:xRange", xScale, this);
		this.on("change:yDomain change:yRange", yScale, this);

		this.on("change:xType", xType, this);
		this.on("change:yType", yType, this);

		function xAxis() {
			that.get('xAxis')
			.orient( that.get('xOrient') )
			.scale( that.get('xScale') );
		}; // end FUNCTION updateXAxis()

		function yAxis() {
			that.get('yAxis')
			.orient( that.get('yOrient') )
			.scale( that.get('yScale') );
		}; // end FUNCTION updateXAxis()

		function xScale() {
			this.get('xScale')
				.domain( this.get('xDomain') )
				.range( this.get('xRange') );
		}; // end FUNCTION xScale()

		function yScale() {
			this.get('yScale')
				.domain( this.get('yDomain') )
				.range( this.get('yRange') );
		}; // end FUNCTION yScale()

		function xType() {
			that.set('xScale', getScale(that.get('xType')) );
		}; // end FUNCTION xType()

		function yType() {
			that.set('yScale', getScale(that.get('xType')) );
		}; // end FUNCTION yType()

		function getScale(type) {
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
		}; // end FUNCTION getScale(type)

	},

	// Override the constructor: initial validation
	constructor: function( attrs, options ) {
		var results = this.validate( attrs );

		if ( results && !_.isEmpty(results.errors) ) throw results.errors;
		if ( results && results.invalidKeys.length != 0 ) {
			_.each( results.invalidKeys, function(key){ delete attrs[key]; });	
		};

		// Call the parent:
		Backbone.Model.prototype.constructor.call(this, attrs, options);

	},

	// Override the set method: ensure validation
	set: function( key, val, options ) {
		var attrs; 

		if (key == null ) {
			// Nothing to set.
			return this;
		}; // end IF
		if (typeof key === 'object') {
			// Setting multiple attributes:
			attrs = key;
			options = val;
		}else {
			// Setting a key-value pair:
			(attrs = {})[key] = val;
		}; // end IF/ELSE
		// Check if validation is turned off:
		if ( options && options.hasOwnProperty('validate') && options['validate'] == false ) {
			// Don't validate.
		}else {
			// Validate:
			var results = this.validate( attrs );
			if ( results && !_.isEmpty(results.errors) ) {
				// For each error, restore the default:
				var defaults = this.toJSON();
				_.each( results.errors, function(value, key, errs) {
					attrs[key] = defaults[key];
				}, this);
				console.log(results.errors);
			}; // end IF
			if ( results && results.invalidKeys.length != 0 ) {
				_.each( results.invalidKeys, function(key){ delete attrs[key]; });	
			}; // end IF
		}; // end IF/ELSE

		// Call the parent:
		Backbone.Model.prototype.set.call(this, attrs, options);

	}, // end METHOD set()

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

				case 'round':
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

				default:
					console.log('WARNING:unrecognized attribute: ' + key );
					invalidKeys.push(key);
					break;

			}; // end SWITCH

		}; // end FUNCTION validator(key)
		
	} // end METHOD validate()

});