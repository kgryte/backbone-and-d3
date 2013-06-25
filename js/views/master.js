/**
*	VIEW: Master
*
*	NOTES:
*		
*
*	HISTORY:
*		2013-06-24: KGryte. Created.
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



// Master Controller:
Chart.View = Backbone.View.extend({

	el: 'body',
	//tagName: 'figure',
	//className: 'mvcChart',

	initialize: function( options ) {

		// Initialize models and collections:
		this._initModels();

		// Initialize a layers object into which we will store all created layers:
		this.layers = {};

		// Initialize a chart object to store view instances:
		this.chart = {};

		// Handle input options:
		this._settings();

		// Initialize the view instances:
		this._initCanvas()
			._initAxes();

	}, // end METHOD initialize()

	render: function() {

		if (this.collections.data.length == 0) {
			console.log('Have you forgotten to give me some data?');
			return;
		}; 	
		
		this._initData();
		this.chart.data.render();

	}, // end METHOD render()

	_initModels: function() {
		// Instantiate relevant models:
		this.models = {}; 
		this.models.canvas    = new Chart.Models.Canvas();
		this.models.axes 	  = new Chart.Models.Axes();
		this.models.marks	  = new Chart.Models.Marks();
		//this.models.annotations = new Chart.Models.Annotations();
		//this.models.listeners = new Chart.Models.Listeners();
		

		this.collections = {};
		this.collections.data = new Chart.Collections.Data();

		return this;
		
	},

	_initCanvas: function() {
		// Canvas:
		this.chart.base = new Chart.Layers.Base();

		this.chart.base
			.elem( this.el )
			.canvas( this.models.canvas )
			.layers( this.layers )
			.render();	

		return this;	
	},

	_initAxes: function() {
		// Axes:
		this.chart.axes = new Chart.Layers.Axes();

		this.chart.axes
			.canvas( this.models.canvas )
			.axes( this.models.axes )
			.layers( this.layers )
			.render();

		return this;
	},

	_initData: function() {
		// Data:
		this.chart.data = new Chart.Layers.Data();

		this.chart.data
			.data( this.collections.data )
			.marks( this.models.marks )
			.canvas( this.models.canvas )
			.axes( this.models.axes )
			.layers( this.models.layers );

		return this;

	},

	_settings: function() {



		return this;

	}, // end METHOD settings()

	type: function( type ) {
		if (type) {
			this.models.marks.set('type', type);
			return this;
		}
		return this.models.marks.get('type');
	},

	size: function( size ) {
		if (size) {
			this.models.marks.set('size', size);
			return this;
		}
		return this.models.marks.get('size');
	},

	symbols: function( symbols ) {
		if (symbols) {
			this.models.marks.set('symbols', symbols);
			return this;
		}
		return this.models.marks.get('symbols');
	},

	colors: function( colors ) {
		if (colors) {
			this.models.marks.set('colors', colors);
			return this;
		}
		return this.models.marks.get('colors');
	},

	interpolation: function( method ) {
		if (method) {
			this.models.marks.set('interpolation', method);
			return this;
		}
		return this.models.marks.get('interpolation');		
	},

	height: function( height ) {
		if (height) {
			this.models.canvas.set('height', height);
			return this;
		}
		return this.models.canvas.get('height');
	},

	width: function( width ) {
		if (width) {
			this.models.canvas.set('width', width);
			return this;
		}
		return this.models.canvas.get('width');
	},

	xDomain: function( domain ) {
		if (domain) {
			this.models.axes.set('xDomain', domain);
			return this;
		}
		return this.models.axes.get('xDomain');
	},

	yDomain: function( domain ) {
		if (domain) {
			this.models.axes.set('yDomain', domain);
			return this;
		}
		return this.models.axes.get('domain');
	},

	xLabel: function( label ) {
		if (label) {
			this.models.axes.set('xLabel', label);
			return this;
		}
		return this.models.axes.get('xLabel');
	},

	yLabel: function( label ) {
		if (label) {
			this.models.axes.set('yLabel', label);
			return this;
		}
		return this.models.axes.get('yLabel');
	},

	xType: function( type ) {
		if (type) {
			this.models.axes.set('xType', type);
			return this;
		}
		return this.models.axes.get('xType');
	},

	yType: function( type ) {
		if (type) {
			this.models.axes.set('yType', type);
			return this;
		}
		return this.models.axes.get('yType');
	}

});