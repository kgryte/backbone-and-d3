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

Chart.Models.Brush = Backbone.ChartModel.extend({

	defaults: function() {

		return {

			// Dimensions:
			height: null, // px
			width: null, // px

			// As in CSS, [Top, Right, Bottom, Left]
			margin: [0, 0, 0, 0], // px

			// Axis orientation:
			orient: '', // 
			_orientations: [],
			
			// Axis limits [data]:
			domain: [0, 1e-100], // Limits
			
			// Axis limits [visual]:
			range: [0, 100],
			
			// Axis scales:
			type: 'linear',
			scale: d3.scale.linear(), // function 
			
			// Axis generators:
			axis: d3.svg.axis(), // function

			// Event dispatcher:
			events: null

		};

	},

	initialize: function( options ) {
		var margin = this.get('margin');
		// Set convenience variables:
		this.set('marginTop'   , margin[0]);
		this.set('marginRight' , margin[1]);
		this.set('marginBottom', margin[2]);
		this.set('marginLeft'  , margin[3]);	

		// Calculate the effective brush size:
		this._brushSize();

		// Update our scales:
		this._type(); // could also use scale(), but type() also accounts for a change in scale type.
		
		this.get('scale').nice();
		
		// Update our axis generators:
		this._axis();

		// Initialize the brush generator:
		this._brush();

		// Publish to the event dispatcher:
		if ( this.get('events') ) {
			this._listeners();
		}; // end IF (dispatcher)
		
	}, // end METHOD initialize()

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
			var orientations = attrs._orientations;			
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

				case 'orient':
					if ( !_.isString( val ) ) {
						errors[key] = prefix + 'Assigned value must be a string.'
					}else {
						if ( orientations.indexOf(val) < 0 ) {
							errors[key] = prefix + 'Assigned value must be either ' + orientations[0] + ' or ' + orientations[1] + '.';
						};
					};
					break;

				case '_orientations':

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

		// Bind a listener to ensure consistency:
		this.on("change:margin change:marginTop change:marginRight change:marginBottom change:marginLeft", margin, this);

		// Bind a listener to recalculate brush size upon change:
		this.on("change:height", height, this);
		this.on("change:width", width, this);

		// Bind listeners to ensure model consistency:
		this.on("change:orient", orient, this);
		this.on("change:domain", domain, this);
		this.on("change:range", range, this);		
		this.on("change:type", type, this);
		this.on('change:scale', scale, this);

		function margin() {
			this._setMargin()
				._brushSize();
			events.trigger('brush:margin:change');
		};

		function height() {
			this._brushSize();
			events.trigger('brush:height:change');
		};

		function width() {
			this._brushSize();
			events.trigger('brush:width:change');
		};

		function orient() {
			this._axis();
			events.trigger('brush:orient:change');
		}; 

		function domain() {
			this._scale();
			events.trigger('brush:domain:change');
		};
		
		function range() {
			this._scale();
			events.trigger('brush:range:change');
		};

		function type() {
			this._type();
			events.trigger('brush:type:change');
		}; 

		function scale() {
			this._axis()
				._brush();
			events.trigger('brush:scale:change');
		}; 

	}, // end METHOD listeners()

	_brush: function() {
		var brush = d3.svg.brush();
		this.set('brush', brush, {validate: false});
		return this;
	}, // end METHOD _brush()

	_axis: function() {
		this.get('axis')
			.orient( this.get('orient') )
			.scale( this.get('scale') );
		return this;				
	}, // end METHOD _axis()
	
	_scale: function() {
		this.get('scale')
			.domain( this.get('domain') )
			.range( this.get('range') );
		return this;
	}, // end METHOD _scale()

	_type: function() {
		this.set('scale', this._getScale(this.get('type')) );
		this._scale();
		return this;
	}, // end METHOD _type()

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
	}, // end FUNCTION _getScale(type)


	_setMargin: function() {
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
		return this;				
	}, // end METHOD _setMargin()


	_brushSize: function() {
		var height = this.get('height'),
			width = this.get('width');
			margin = this.get('margin');
		var _brush = {
			'width': width - margin[1] - margin[3],
			'height': height - margin[0] - margin[2]
		};
		this.set('_brush', _brush, {validate: false});
		return this;
	} // end METHOD _brushSize()

});




Chart.Models.xBrush = Chart.Models.Brush.extend({

	defaults: function() {

		return {
			// Brush dimensions:
			width: 960,	// px
			height: 150,// px
			
			// As in CSS: [ Top, Right, Bottom, Left]
			margin: [60, 20, 20, 80],  // px

			// Axis orientation:
			orient: 'bottom', // either top or bottom
			_orientations: ['top', 'bottom'],
			
			// Axis limits [data]:
			domain: [0, 1], // xLimits
			
			// Axis limits [visual]:
			range: [0, 100],
			
			// Axis scales:
			type: 'linear',
			scale: d3.scale.linear(), // function 
			
			// Axis generators:
			axis: d3.svg.axis(), // function

			// Event dispatcher:
			events: null
			
		};

	},

	_axis: function() {
		this.get('axis')
			.orient( this.get('orient') )
			.scale( this.get('scale') )
			.tickSize( this.get('_brush').height )
			.tickPadding( -this.get('_brush').height/2 );	
		return this;	
	},

	_brush: function() {
		var brush = d3.svg.brush()
			.x( this.get('scale') );
		this.set('brush', brush, {validate: false});
		return this;
	} // end METHOD _brush()

}); 



Chart.Models.yBrush = Chart.Models.Brush.extend({

	defaults: function() {

		return {
			// Brush dimensions:
			width: 100,	// px
			height: 300,// px
			
			// As in CSS: [ Top, Right, Bottom, Left]
			margin: [20, 20, 50, 10],  // px

			// Axis orientation:
			orient: 'left', // either left or right
			_orientations: ['left', 'right'],
			
			// Axis limits [data]:
			domain: [0, 1], // xLimits
			
			// Axis limits [visual]:
			range: [100, 0],
			
			// Axis scales:
			type: 'linear',
			scale: d3.scale.linear(), // function 
			
			// Axis generators:
			axis: d3.svg.axis(), // function

			// Event dispatcher:
			events: null
			
		};

	},

	_axis: function() {
		this.get('axis')
			.orient( this.get('orient') )
			.scale( this.get('scale') )
			.tickSize( this.get('_brush').width )
			.tickPadding( -this.get('_brush').width/2 );	
		return this;	
	},

	_brush: function() {
		var brush = d3.svg.brush()
			.y( this.get('scale') );
		this.set('brush', brush, {validate: false});
		return this;
	} // end METHOD _brush()


}); 

	