/**
*	MODEL: Widgets
*
*	NOTES:
*		
*		
*
*	HISTORY:
*		2013-06-29: KGryte. Created.
*
*	DEPENDENCIES:
*		[1] Backbone.js
*		[2] Underscore.js
*		[3] Chart.js - ancestor model class
*
*	TODO:
*		
*
*
*	@author Kristofer Gryte. http://www.kgryte.com
*
*	Copyright (c) 2013. MIT License.
*
*
*
*/

Chart.Models.Widgets = Backbone.ChartModel.extend({

	defaults: function() {

		return {

			// Interactive brush:
			brush: true,
			brushType: 'x', // options: x or y

			// Events:
			events: null

		};

	},

	initialize: function( options ) {

		var events = this.get('events'),
			params;

		if (events) {
			params = {'events': events};
		}else {
			params = undefined;
		} 
				
		// Initialize widget models:
		if (this.get('brush')) {
			var brush;
			switch (this.get('brushType')) {
				case 'x':
					brush = new Chart.Models.xBrush( params );
					break;
				case 'y':
					brush = new Chart.Models.yBrush( params );
					break;
				default:
					brush = new Chart.Models.xBrush( params );
					break;
			}; // end SWITCH brushType	
			this.set('brushModel', brush, {validate: false});
		}; // end IF brush
		
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

				case 'brush':
					if ( !_.isBoolean( val ) ) {
						errors[key] = prefix + 'Assigned object must be a boolean.';
					};
					break;

				case 'brushType':
					if ( !_.isString( val ) ) {
						errors[key] = prefix + 'Assigned value must be a string.';
					}else {
						var validVals = ['x', 'y'];
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

	} // end METHOD validate()

});