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
*		[3] Chart.js - ancestor model class
*
*
*	@author Kristofer Gryte. http://www.kgryte.com
*
*	Copyright (c) 2013. MIT License.
*
*
*
*/

Chart.Models.Canvas = Backbone.ChartModel.extend({

	defaults: function() {

		return {
			// Canvas dimensions:
			width: 960,	// px
			height: 500,// px
			
			// As in CSS: [ Top, Right, Bottom, Left]
			margin: [20, 80, 50, 80],  // px

			// Event dispatcher:
			events: null
		};

	},

	initialize: function( options ) {
		var margin = this.get('margin');
		// Set convenience variables:
		this.set('marginTop'   , margin[0]);
		this.set('marginRight' , margin[1]);
		this.set('marginBottom', margin[2]);
		this.set('marginLeft'  , margin[3]);	

		// Calculate the graph size:
		this._graphSize();

		// Publish to the event dispatcher:
		if ( this.get('events') ) {
			this._listeners();
		}; // end IF (dispatcher)
		
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

		// Provide a private validator method for this model:
		function validator( key ) {

			var prefix = 'ERROR:invalid input for "' + key + '". ',
				val = attrs[key];

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

		// Bind a listener to ensure consistency:
		this.on("change:margin change:marginTop change:marginRight change:marginBottom change:marginLeft", margin, this);
		
		// Bind a listener to recalculate graph size upon change:
		this.on("change:height", height, this);
		this.on("change:width", width, this);

		function margin() {
			this._setMargin()
				._graphSize();
			events.trigger('canvas:margin:change');
		};

		function height() {
			this._graphSize();
			events.trigger('canvas:height:change');
		};

		function width() {
			this._graphSize();
			events.trigger('canvas:width:change');
		};

	},

	_setMargin: function() {
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
		return this;				
	}, // end METHOD _setMargin()

	_graphSize: function() {
		var height = this.get('height'),
			width = this.get('width');
			margin = this.get('margin');
		var _graph = {
			'width': width - margin[1] - margin[3],
			'height': height - margin[0] - margin[2]
		};
		this.set('_graph', _graph, {validate: false});
		return this;
	} // end METHOD _graphSize()

}); 

	