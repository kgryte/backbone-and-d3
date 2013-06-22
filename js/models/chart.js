/**
*
*
*
*
*
*
*
*
*/



// Chart Model:
App.Models.Chart = Backbone.Model.extend({

	// Override the constructor:
	constructor: function( attrs, options ) {

		// Validate the attributes on instantiation:
		var errors = this.validate( attrs );

		// Check if we have errors:
		if (errors) {
			console.log(errors);
			return {};
		} else {
			// Call the Backbone.Model constructor:
			Backbone.Model.prototype.constructor.call(this, attrs);
		}; // end IF/ELSE (errors)

	},

	// Override the set method:
	set: function( key, val, options ) {

		var attrs; 

		if (key == null ) {
			// Nothing to set.
			return this;
		}

		if (typeof key === 'object') {
			// Setting multiple attributes:
			attrs = key;
			options = val;
		} else {
			// Setting a key-value pair:
			(attrs = {})[key] = val;
		}; // end IF/ELSE

		// Check if validation is turned off:
		if ( options && options.hasOwnProperty('validate') && options['validate'] == false ) {
			// Don't validate.
		}else {
			// Validate:
			var errors = this.validate( attrs );
			if (errors) {
				// For each error, restore the default:
				_.each( errors, function(value, key, errs) {
					var orig = _.pick(this.defaults, key);
					attrs[key] = orig[key];
				}, this);
				console.log(errors);
				//return {};
			}; // end IF
		}; // end IF/ELSE

		// Call the parent:
		Backbone.Model.prototype.set.call(this, attrs, options);

	},

	// Set the default chart parameters:
	defaults: {

		// Line colors:
		colors: 'auto', //['g','r','k','b'], // these correspond to CSS classes; can also set to 'auto' for calculated color generation

		// Data smoothing:
		interpolation: 'linear',

		// Animation parameters:
		animation: 'arise', // options: enterLeft, arise
		animationProps: {
			'onEnter': {
				'duration': 1000,
				'easing': 'linear'
			},
			'onUpdate': {
				'duration': 1000,
				'easing': 'linear'
			},
			'onExit': {
				'duration': 1000,
				'easing': 'linear'
			}
		}, 

		// Transition parameters:
		transition: {
			'onEnter': {
				'duration': 1000,
				'easing': 'linear'
			},
			'onUpdate': {
				'duration': 1000, // this parameter should be tuned to the velocity of incoming data
				'easing': 'linear'
			},
			'onExit': {
				'duration': 1000,
				'easing': 'linear'
			}
		},

		// Plot mode: (primarily targeted toward real-time data feeds)
		mode: 'window', // options: window, add, dynamic, (others?)

		// Brush settings:
		brush: false,
		brushProps: {
			'height': 50,
			'width': 960,
			'margin': {
				'top': 10,
				'right': 20,
				'bottom': 20,
				'left': 80
			}
		},

		// Listeners:
		listeners: {
			'chart': true,
			'data': true
		}

	},

	//
	url: '',

	validate: function(attrs, options) {

		// Check that we have supplied attributes:
		if (!attrs) {
			return;
		}; // end IF

		var errors = Backbone.Validate( this, attrs );

		if ( !_.isEmpty(errors) ) {
			return errors;
		}; // end IF		

	}

});
