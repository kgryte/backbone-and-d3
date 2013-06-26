/**
*	MODEL: Marks
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
*		[3] Chart.js - ancestor model class
*
*
*	@author Kristofer Gryte. http://www.kgryte.com
*
*	Copyright (c) 2013. MIT License.
*
*
*
*/

Chart.Models.Marks = Backbone.ChartModel.extend({

	defaults: function() {

		return {
			// Chart type:
			type: 'line', 

			// Datum encoding
			symbols: ['circle'], 
			size: 9,

			// 'auto' or, e.g., ['g','r','k','b'] 
			// the latter correspond to CSS classes; 'auto' for automatic color generation:
			colors: 'auto',

			// Data smoothing:
			interpolation: 'linear', 
			
			// Event dispatcher:
			events: null

		};

	},

	initialize: function( options ) {
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

				case 'type':
					if ( !_.isString( val ) ) {
						errors[key] = prefix + 'Assigned value must be a string.';
					}else {
						var validVals = ['line', 'area', 'scatter', 'steamgraph', 'stackedArea'];
						if (validVals.indexOf(val) < 0) {
							errors[key] = prefix + 'Assigned value must be one of the following: ' + validVals;
						}; 
					};
					break;


				case 'symbols':
					// Must be either an array or a string:
					if ( !_.isArray( val ) && !_.isString( val ) ) {
						errors[key] = prefix + 'Must be an array of strings or a single string.';
					}else {		
						var validVals = ['circle', 'square', 'cross', 'diamond', 'triangle-up', 'triangle-down'];
						if ( _.isString(val) ) { val = [val]; };
						if ( !_.every( val, function(str) { return validVals.indexOf(str) >= 0; }) ) {
							errors[key] = prefix + 'Assigned value must be one of the following: ' + validVals;
						};
					};
					break;

				case 'size':
					if ( !_.isFinite( val ) ) {
						errors[key] = prefix + 'Assigned value must be a finite number.';
					};
					break;

				case 'interpolation':
					// Must be a string:
					if ( !_.isString( val ) ) {
						errors[key] = prefix + 'Assigned value must be a string.';
					}else {
						var validVals = ['linear', 'linear-closed', 'step', 'step-before', 'step-after', 'basis', 'basis-open', 'basis-closed', 'bundle', 'cardinal', 'cardinal-open', 'cardinal-closed', 'monotone'];
						if (validVals.indexOf( val ) < 0) {
							errors[key] = prefix + 'Assigned value must be one of the following options: ' + validVals;
						}; // end IF
					};
					break;

				case 'colors':
					// Must be either an array or a special string:
					if ( !_.isArray( val ) && val != 'auto' ) {
						errors[key] = prefix + 'Must be an array of strings or "auto".';
					}else {						
						if ( _.some(val, function(str) { return !_.isString( str ); } ) ) {
							errors[key] = prefix + 'Each array element must be a string corresponding to an externally defined CSS class.';
						}; // end IF
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

		// Bind listeners:
		this.on("change:type", type, this);
		this.on("change:size", size, this);
		this.on("change:colors", type, this);
		this.on("change:interpolation", type, this);
		this.on("change:symbols", type, this);

		function type() {
			events.trigger('marks:type:change');
		};

		function size() {
			events.trigger('marks:size:change');
		};

		function colors() {
			events.trigger('marks:colors:change');
		};

		function interpolation() {
			events.trigger('marks:interpolation:change');
		};

		function symbols() {
			events.trigger('marks:symbols:change');
		};

	} // end METHOD _listeners()

});