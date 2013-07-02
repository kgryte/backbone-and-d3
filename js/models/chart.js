/**
*	MODEL: Chart
*
*	NOTES:
*		[1] This serves as the base model from which other chart models should extend. 
*		[2] We override the 'constructor' and 'set' methods to perform validation before setting attributes and to prevent cluttering the model namespace with unrecognized attributes. 
*		
*		
*
*	HISTORY:
*		2013-06-23: KGryte. Created.
*
*	DEPENDENCIES:
*		[1] Backbone.js
*		[2] Underscore.js
*
*	TODOS:
*		[1] Create a general validate method and use per-class closures for model extensions with validation settings and permissions. See Backbone.Validation.
*		[2] Following [1], need to ensure that validationError is set, invalid event is triggered, and the isvalid method work. Currently, these do not work. See Backbone source for implementation ideas.
*
*
*	@author Kristofer Gryte. http://www.kgryte.com
*
*	Copyright (c) 2013. MIT License.
*
*
*
*/

var Chart = {
	Models: {},
	Layers: {},
	Collections: {},
	View: null,
	API: null
};

Backbone.ChartModel = Backbone.Model.extend({

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
					if ( defaults.hasOwnProperty(key) ) {
						attrs[key] = defaults[key];
					};
				}, this);
				console.log(results.errors);
			}; // end IF
			if ( results && results.invalidKeys.length != 0 ) {
				_.each( results.invalidKeys, function(key){ delete attrs[key]; });	
			}; // end IF
		}; // end IF/ELSE

		// Call the parent:
		Backbone.Model.prototype.set.call(this, attrs, options);

	} // end METHOD set()

});