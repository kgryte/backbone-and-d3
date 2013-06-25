/**
*	MODEL: Annotations
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

Chart.Models.Annotations = Backbone.ChartModel.extend({

	defaults: function() {

		return {
			title: '',
			legend: [],
			caption: '',
			dataCursor: false
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

				case 'title': case 'caption':
					if ( !_.isString( val ) ) {
						errors[key] = prefix + 'Assigned value must be a string.';
					};
					break;

				case 'legend':
					if ( !_.isArray( val) ) {
						errors[key] = prefix + 'Assigned value must be an array.';
					}else {
						_.each(val, function( element ) {
							if ( !_.isString(element) ) {
								errors[key] = prefix + 'Array elements must be strings.'
							};
						});
					};					
					break;

				case 'dataCursor':
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