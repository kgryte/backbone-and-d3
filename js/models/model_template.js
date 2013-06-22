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

var {Model} = Backbone.Model.extend({

	defaults: function() {

		return {};

	},

	initialize: function() {		

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