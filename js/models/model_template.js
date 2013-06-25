/**
*	MODEL: {name}
*
*	NOTES:
*		
*
*	HISTORY:
*		{date}: {author}. {action}.
*
*	DEPENDENCIES:
*
*
*	@author {name}. {contact/url}
*
*	Copyright (c) 2013. MIT License.
*
*
*
*/

var {Model} = Chart.Model.extend({

	defaults: function() {

		return {};

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