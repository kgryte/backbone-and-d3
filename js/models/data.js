/**
* 	RELATIONAL MODEL: DataSeries
*
*	NOTES:
*		[1] Big picture: every statistical graphic can have one or more data sets. And within those data sets are found individual datum. The fundamental graphical unit is a datum, but we often think in terms of encoding data sets, i.e., a collection of datum.
*		[2] Backbone.js, by itself, does not handle well nested models; e.g., a data set model which has nested within datum models.
*		[3] Backbone-relational.js provides a solution to represent the model relations.
*		[4] This is important for applications such as real-time analytics. In traditional Backbone.js, a data set would probably form the base model, with multiple data sets forming a collection. If a data set changes, i.e., is added or removed, then events are triggered; however, if an individual datum within a data set changes, no event is triggered. Obviously, this is important if we want our views to update upon changes in individual datum and not just at the data set level.
*
*	HISTORY:
*		2013-06-23: KGryte. Created.
*
*	DEPENDENCIES:
*		[1] Backbone.js
*		[2] Underscore.js
*		[3] Backbone-relational.js
*
*	TODOS:
*		[1] Need to include validation checks for DataSet(). Currently, we only check the related model, but we also need to validate the related dataset attributes, e.g., 'name', 'desc'.
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


Backbone.DataModel = Backbone.RelationalModel.extend({

	// Override the constructor: initial validation
	constructor: function( attrs, options ) {
		var results = this.validate( attrs );

		if ( results && !_.isEmpty(results.errors) ) throw results.errors;
		if ( results && results.invalidKeys.length != 0 ) {
			_.each( results.invalidKeys, function(key){ delete attrs[key]; });	
		};

		// Call the parent:
		Backbone.RelationalModel.prototype.constructor.call(this, attrs, options);

	}, // end METHOD constructor()

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
		Backbone.RelationalModel.prototype.set.call(this, attrs, options);

	} // end METHOD set()

});




// The basic statistical graphic unit:
Chart.Models.Datum = Backbone.DataModel.extend({

	urlRoot: '/data',

	defaults: function() {
		return {
			'x': null, // default is two-dimensions
			'y': null
		};
	}, // end METHOD defaults()

	initialize: function() {

		// Bind listeners:
		this.on('change', function(model) {
			//console.log('change ', model);
		});

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
			errors['init'] = 'ERROR:invalid input. Supply an appropriate associative array with "x" and/or "y" keys.';
		}else {
			// Get the keys:
			var keys = _.keys(attrs);
			// Ensure we have 'x' and 'y' keys:
			var xId = keys.indexOf('x'),
				yId = keys.indexOf('y');

			if (xId < 0 && yId < 0) {
				errors['keys'] = 'ERROR:invalid input. Associative array must have "x" and/or "y" keys.';
			}; // end IF

			// Get any extraneous keys:
			invalidKeys = _.without(keys, 'x', 'y');

			// Check the length of invalid keys:
			if (invalidKeys.length != 0) {				
				console.log('WARNING:invalid keys found. These will not be set on the model: ', invalidKeys, '.');
			};

		}; 

		return {
			errors: errors,
			invalidKeys: invalidKeys
		};

	} // end METHOD validate()

});

// A collection of datum
Chart.Models.DataSet = Backbone.RelationalModel.extend({

	// Define where the corresponding resource is located on the server:
	urlRoot: '/data',

	// Define the model relations:
	relations: [
		{
			key: 'data',						// DataSet.data will contain an array of datum
			relatedModel: 'Chart.Models.Datum',	// the referenced model
			type: Backbone.HasMany, 			// each data set has many datum
			//collectionType: 'DataCollection',
			reverseRelation: {
				key: 'dataset',					// the key used for reverse mapping: datum.dataset
				type: Backbone.HasOne,			// each datum belongs to only one data set
				includeInJSON: 'id'				// use an id to reference the dataset to which a datum belongs
			}
		}
	],

	defaults: function() {
		return {
			'name': 'data-set',
			'desc': '',
			'data': null
		};
	}, // end METHOD defaults()

	initialize: function( options ) {
		
		// Bind listeners:
		this.on('add:data', function(model, collection) {
			//console.log('add ', model, ' in ', collection);
		});
		this.on('remove:data', function(model, collection) {
			//console.log('remove ', model, ' in ', collection);
		});
		this.on('change:data', function(model, collection) {
			//console.log('change ', model, ' in ', collection);
		});

	}, // end METHOD initialize()

	validate: function() {
		// Check if any models have validation errors:
		var hasErrors = _.some(this.get('data').models, function(model) {
			return model.validationError;
		});

		if (hasErrors) {
			console.log('Some models failed validation');
		}else {
			console.log('All models passed validation.');
		}; // end IF/ELSE (hasErrors)

	} // end METHOD validate()

});





// A group of data sets:
Chart.Collections.Data = Backbone.Collection.extend({
	url: '/data',
	model: Chart.Models.DataSet,
	mode: 'static', // options: static, dynamic, live

	initialize: function() {

		// Bind listeners:
		this.on('add', function(model) {
			//console.log('add ', model);
		});
		this.on('remove', function(model) {
			//console.log('remove ', model);
		});

	}, // end METHOD initialize()

	min: function( dataset, key ) {
		// Get the datum with the smallest value according to key:
		return _.min( dataset.get('data').toJSON(), function(datum) {
			return datum[ key ];
		});
	}, // end METHOD min()

	max: function( dataset, key ) {
		// Get the datum with the largest value according to key:
		return _.max( dataset.get('data').toJSON(), function(datum) {
			return datum[ key ];
		});
	} // end METHOD max()

});

















