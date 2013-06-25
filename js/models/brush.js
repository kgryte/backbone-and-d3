/**
*	MODEL: Brush
*
*	NOTES:
*		[1] margin: by convention, we refer to the space between the canvas border and the chart as 'margin', but, in reality, we should refer to this as padding. We follow D3 convention, but this may be changed in a future release to match Vega.
*		
*
*	HISTORY:
*		2013-06-24: KGryte. Created.
*
*	DEPENDENCIES:
*		[1] Backbone.js
*		[2] Underscore.js
*		[3] Chart.js - ancestor model class
*
*	TODO:
*		[1] Generalize to 2-dimensional brush.
*
*
*	@author Kristofer Gryte. http://www.kgryte.com
*
*	Copyright (c) 2013. MIT License.
*
*
*
*/

var Brush  = {};

Brush.Model = Chart.Model.extend({

	defaults: function() {

		return {

			// Dimensions:
			height: null, // px
			width: null, // px

			// As in CSS, [Top, Right, Bottom, Left]
			margin: [0, 0, 0, 0], // px

			// Axis orientation:
			orient: '', // 
			orientations: [],
			
			// Axis limits [data]:
			domain: [0, 1], // Limits
			
			// Axis limits [visual]:
			range: [0, 100],
			
			// Axis scales:
			type: 'linear',
			scale: d3.scale.linear(), // function 
			
			// Axis generators:
			axis: d3.svg.axis() // function

		};

	},

	initialize: function( options ) {
		var margin = this.get('margin');
		// Set convenience variables:
		this.set('marginTop'   , margin[0]);
		this.set('marginRight' , margin[1]);
		this.set('marginBottom', margin[2]);
		this.set('marginLeft'  , margin[3]);	

		// Bind a listener to ensure consistency:
		this.on("change:margin change:marginTop change:marginRight change:marginBottom change:marginLeft", setMargin, this);

		// Calculate the effective brush size:
		var that = this;
		brushSize();

		// Bind a listener to recalculate brush size upon change:
		this.on("change:height change:width change:margin", brushSize, this);

		// Update our scales:
		type(); // could also use scale(), but type() also accounts for a change in scale type.
		
		this.get('scale').nice();
		
		// Update our axis generators:
		this.axis();
		
		//Update the brush generators:
		brush();
		
		// Bind listeners to ensure model consistency:
		this.on("change:orient change:scale", this.axis, this);		
		this.on("change:domain change:range", scale, this);		
		this.on("change:type", type, this);
		this.on('change:scale', brush, this);
		
		function brush() {
			var _brush = d3.svg.brush()
				.x( that.get('scale') );
			that.set('_brush', _brush, {validate: false});
		}; // end FUNCTION brush()

		function scale() {
			this.get('scale')
				.domain( this.get('domain') )
				.range( this.get('range') );
		}; // end FUNCTION scale()

		function type() {
			that.set('scale', that.getScale(that.get('type')) );
		}; // end FUNCTION type()

		function setMargin() {
			if ( this.hasChanged("margin") ) {
				var margin = this.get('margin');
				// Set convenience variables:
				this.set('marginTop'   , margin[0]);
				this.set('marginRight' , margin[1]);
				this.set('marginBottom', margin[2]);
				this.set('marginLeft'  , margin[3]);	
			}else {
				this.set('margin', [
					this.get('marginTop'),
					this.get('marginRight'),
					this.get('marginBottom'),
					this.get('marginLeft')
				]);
			}; // end IF/ELSE				
		}; // end FUNCTION setMargin()

		function brushSize() {
			var height = that.get('height'),
				width = that.get('width');
				margin = that.get('margin');
			var _brush = {
				'width': width - margin[1] - margin[3],
				'height': height - margin[0] - margin[2]
			};
			that.set('_brush', _brush, {validate: false});
		}; // end FUNCTION brushSize()

	}, // end METHOD initialize()

	axis: function() {
		this.get('axis')
			.orient( that.get('orient') )
			.scale( that.get('scale') );				
	},

	getScale: function(type) {
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
	}, // end FUNCTION getScale(type)

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
			// Get possible axis orientations:
			var orientations = this.get('orientations');
			// Iterate over each key and perform appropriate validation:
			_.each(keys, validator);
		}; 

		return {
			errors: errors,
			invalidKeys: invalidKeys
		};

		// Provide a private validator method for this model:
		function validator( key ) {

			var prefix = 'ERROR:invalid input for "' + key + '". ',
				val = attrs[key];

			switch (key) {

				case 'width': case 'height': case 'marginTop': case 'marginRight': case 'marginBottom': case 'marginLeft':
					if ( !_.isFinite( val ) ) {
						errors[key] = prefix + 'Assigned value must be a finite number.';
					};
					break;

				case 'margin':
					if ( !_.isArray( val ) || val.length != 4) {
						errors[key] = prefix + 'Assigned value must be an array of length 4: [top, right, bottom, left].';
					}
					break;

				case 'orient'::
					if ( !_.isString( val ) ) {
						errors[key] = prefix + 'Assigned value must be a string.'
					}else {
						if ( orientations.indexOf(val) < 0 ) {
							errors[key] = prefix + 'Assigned value must be either ' + orientations[0] + ' or ' + orientations[1] + '.';
						};
					};
					break;

				case 'domain': case 'range':
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

				case 'scale': case 'axis':
					if ( !_.isFunction( val ) ) {
						errors[key] = prefix + 'Assigned object must be a function.';
					};
					break;

				case 'type':
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




var xBrush = Brush.Model.extend({

	defaults: function() {

		return {
			// Brush dimensions:
			width: 960,	// px
			height: 50,// px
			
			// As in CSS: [ Top, Right, Bottom, Left]
			margin: [10, 20, 20, 80]  // px

			// Axis orientation:
			orient: 'bottom', // either top or bottom
			orientations: ['top', 'bottom'],
			
			// Axis limits [data]:
			domain: [0, 1], // xLimits
			
			// Axis limits [visual]:
			range: [0, 100],
			
			// Axis scales:
			type: 'linear',
			scale: d3.scale.linear(), // function 
			
			// Axis generators:
			axis: d3.svg.axis() // function
			
		};

	},

	axis: function() {
		this.get('axis')
			.orient( that.get('orient') )
			.scale( that.get('scale') )
			.tickSize( that.get('height') )
			.tickPadding( -that.get('height')/2 );		
	}

}); 



var yBrush = Brush.Model.extend({

	defaults: function() {

		return {
			// Brush dimensions:
			width: 50,	// px
			height: 300,// px
			
			// As in CSS: [ Top, Right, Bottom, Left]
			margin: [20, 20, 50, 10]  // px

			// Axis orientation:
			orient: 'left', // either left or right
			orientations: ['left', 'right'],
			
			// Axis limits [data]:
			domain: [0, 1], // xLimits
			
			// Axis limits [visual]:
			range: [100, 0],
			
			// Axis scales:
			type: 'linear',
			scale: d3.scale.linear(), // function 
			
			// Axis generators:
			axis: d3.svg.axis() // function
			
		};

	},

	axis: function() {
		this.get('axis')
			.orient( that.get('orient') )
			.scale( that.get('scale') )
			.tickSize( that.get('width') )
			.tickPadding( -that.get('width')/2 );		
	}

}); 

	