/**
*	VIEW: Events
*
*	NOTES:
*		
*
*	HISTORY:
*		2013-06-26: KGryte. Created.
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

// Events layer:
Chart.Layers.Events = Backbone.View.extend({

	initialize: function( options ) {
		
		var Model = Backbone.Model.extend({});
		this.model = new Model();

		if (options) {
			// Options should include 'data', 'marks', 'canvas', 'axes', and 'layers':
			if ( !options.data || !options.type || !options.canvas || !options.axes || !options.layers ) {
				throw 'ERROR:layer instantiation requires an associative array with the following keys: data, marks, canvas, axes, layers.';
			};

			this.model.set( {data: options.data, marks: options.marks, canvas: options.canvas, axes: options.axes, layers: options.layers} );

			// Reset the options attribute:
			options = {};

			// Set a flag:
			this.init = true;

			// Set listeners:
			this._listeners();

		};

	} // end METHOD initialize()

});
