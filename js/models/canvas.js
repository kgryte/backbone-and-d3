/**
*	MODEL: Canvas
*
*	NOTES:
*		[1] margin: by convention, we refer to the space between the canvas border and the chart as 'margin', but, in reality, we should refer to this as padding. We follow D3 convention, but this may be changed in a future release to match Vega.
*
*	HISTORY:
*		2013-06-21: KGryte. Created.
*
*	DEPENDENCIES:
*		[1] Backbone.js
*		[2] Underscore.js
*
*
*	@author Kristofer Gryte. http://www.kgryte.com
*
*	Copyright (c) 2013. MIT License.
*
*
*
*/

var Canvas = Backbone.Model.extend({

	defaults: function() {

		return {
			// Canvas dimensions:
			width: 960,	// px
			height: 500,// px
			
			// As in CSS: [ Top, Right, Bottom, Left]
			margin: [20, 80, 50, 80]  // px
		};

	},

	initialize: function( options ) {
		var margin = this.get('margin');
		// Set convenience variables:
		this.set('marginTop'   , margin[0]);
		this.set('marginRight' , margin[1]);
		this.set('marginBottom', margin[2]);
		this.set('marginLeft'  , margin[3]);	

		// Bind a listener to ensure consistency:
		this.on("change:margin change:marginTop change:marginRight change:marginBottom change:marginLeft", setMargin, this);

		// Calculate the graph size:
		var that = this;
		graphSize();

		// Bind a listener to recalculate graph size upon change:
		this.on("change:height change:width change:margin", graphSize, this);

		function setMargin() {
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
		}; // end FUNCTION setMargin()

		function graphSize() {
			var height = that.get('height'),
				width = that.get('width');
				margin = that.get('margin');
			var _graph = {
				'width': width - margin[1] - margin[3],
				'height': height - margin[0] - margin[2]
			};
			that.set('_graph', _graph, {validate: false});
		}; // end FUNCTION graphSize()
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

				default:
					console.log('WARNING:unrecognized attribute: ' + key );
					invalidKeys.push(key);
					break;

			}; // end SWITCH

		}; // end FUNCTION validator(key)
		
	} // end METHOD validate()

});