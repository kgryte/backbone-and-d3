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
			dataCursor: true,

			// Edit on figure:
			editable: true,

			// Interaction:
			interactive: true,

			// Event dispatcher:
			events: null
		};

	},

	initialize: function() {		
		// Publish to the event dispatcher:
		if ( this.get('events') ) {
			this._listeners();
		}; // end IF (dispatcher)
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

				case 'dataCursor': case 'editable': case 'interactive':
					if ( !_.isBoolean( val ) ) {
						errors[key] = prefix + 'Assigned value must be a boolean: true or false.';
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
		
	}, // end METHOD validate()

	_listeners: function() {
		var events = this.get('events');

		// Bind listeners:
		this.on("change:title", title, this);
		this.on("change:caption", caption, this);
		this.on("change:legend", legend, this);
		this.on("change:dataCursor", dataCursor, this);
		this.on("change:interactive", interactive, this);
		this.on("change:editable", editable, this);
		
		function title() {
			events.trigger('annotations:title:change');
		};

		function caption() {
			events.trigger('annotations:caption:change');
		};

		function legend() {
			events.trigger('annotations:legend:change');
		};

		function dataCursor() {
			events.trigger('annotations:dataCursor:change');
		};

		function interactive() {
			events.trigger('annotations:interactive:change');
		};

		function editable() {
			events.trigger('annotations:editable:change');
		};

	}, // end METHOD _listeners()

});