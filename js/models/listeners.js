/**
*	MODEL: Listeners
*
*	NOTES:
*		
*
*	HISTORY:
*		2013-06-22: KGryte. Created
*
*	DEPENDENCIES:
*		[1] Backbone.js
*		[2] Underscore.js
*		[3] Chart.js - ancestor model class
*
*	TODO:
*		[1] Rethink this. Custom listener layer?
*
*
*	@author Kristofer Gryte. http://www.kgryte.com
*
*	Copyright (c) 2013. MIT License.
*
*
*
*/

Chart.Models.Listeners = Backbone.ChartModel.extend({

	defaults: function() {

		return {
			chart: true,
			data: true
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

				case 'chart': case 'data':
					if ( !_.isBoolean( val ) ) {
						errors[key] = prefix + 'Assigned value must be a boolean: true or false.';
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











