/**
*	MODEL: Animations
*
*	NOTES:
*		- This needs to be thought through. Animations are more bespoke than other chart elements. Maybe: on initialization, on addition, on removal, on change.
*
*	HISTORY:
*		2013-06-22: KGryte. Created.
*
*	DEPENDENCIES:
*		[1] Backbone.js
*		[2] Underscore.js
*		[3] Chart.js - ancestor model class
*
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

Chart.Models.Animations = Backbone.ChartModel.extend({

	defaults: function() {

		return {			
			'init.type': 'arise', // options: enterLeft, arise
			'init.duration': 1000,
			'init.easing': 'linear' // options: linear, bounce, etc.
		};

	},

	initialize: function() {		

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

				case {key}:
					if ( {condition} ) {
						errors[key] = prefix + '{message}';
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