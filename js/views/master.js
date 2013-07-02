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


// Chart API:
Chart.API = Backbone.View.extend({

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
	},

	data: function( data ) {
		if (data) {
			this.collections.data.add( data );
			return this;
		};
		return this.collections.data.toJSON();
	},

	title: function( title ) {
		if (title) {
			this.models.annotations.set('title', title);
			return this;
		};
		return this.models.annotations.get('title');
	},

	caption: function( caption ) {
		if (caption) {
			this.models.annotations.set('caption', caption);
			return this;
		};
		return this.models.annotations.get('caption');
	},

	legend: function( legend ) {
		if (legend) {
			this.models.annotations.set('legend', legend);
			return this;
		};
		return this.models.annotations.get('legend');
	},

	dataCursor: function( boolean ) {
		if ( _.isBoolean(boolean) ) {
			this.models.annotations.set('dataCursor', boolean);
			return this;
		};
		return this.models.annotations.get('dataCursor');
	},

	editable: function( boolean ) {
		if ( _.isBoolean(boolean) ) {
			this.models.annotations.set('editable', boolean);
			return this;
		};
		return this.models.annotations.get('editable');
	},

	interactive: function( boolean ) {
		if ( _.isBoolean(boolean) ) {
			this.models.marks.set('interactive', boolean);
			return this;
		};
		return this.models.marks.get('interactive');
	}

});


// Master Controller:
Chart.View = Chart.API.extend({

	el: 'body',
	//tagName: 'figure',
	//className: 'mvcChart',

	initialize: function( options ) {

		// Initialize an event dispatcher:
		this.events = _.clone(Backbone.Events);

		// Initialize models and collections:
		this._initModels()
			._initCollections();

		// Initialize a layers object into which we will store all created layers:
		this.layers = {};

		// Initialize a chart object to store view instances:
		this.chart = {};

		// Handle input options:
		this._settings( options );

		// Initialize the view instances:
		this._initCanvas()
			._initAxes();

	}, // end METHOD initialize()

	render: function() {

		if (this.collections.data.length == 0) {
			console.log('Have you forgotten to give me some data?');
			return;
		}; 	
		
		this._initData()
			._initAnnotations()
			._initWidgets();

		return this;

	}, // end METHOD render()

	_initModels: function() {
		// Instantiate relevant models:
		this.models = {}; 
		this.models.canvas    = new Chart.Models.Canvas({events: this.events});
		this.models.axes 	  = new Chart.Models.Axes({events: this.events});
		this.models.marks	  = new Chart.Models.Marks({events: this.events});
		this.models.annotations = new Chart.Models.Annotations({events: this.events});
		this.models.widgets = new Chart.Models.Widgets({events: this.events});	

		return this;
		
	},

	_initCollections: function() {
		// Instantiate data collections:
		this.collections = {};
		this.collections.data = new Chart.Collections.Data([],{events: this.events});

		return this;
	},

	_initCanvas: function() {
		// Canvas:
		this.chart.base = new Chart.Layers.Base();

		this.chart.base
			.elem( this.el )
			.events( this.events )
			.canvas( this.models.canvas )
			.layers( this.layers )
			.render();	

		return this;	
	},

	_initAxes: function() {
		// Axes:
		this.chart.axes = new Chart.Layers.Axes();

		this.chart.axes
			.events( this.events )
			.canvas( this.models.canvas )
			.axes( this.models.axes )
			.layers( this.layers )
			.render();

		return this;
	},

	_initAnnotations: function() {
		// Annotations:
		this.chart.annotations = new Chart.Layers.Annotations();

		this.chart.annotations
			.events( this.events )
			.data( this.collections.data )
			.canvas( this.models.canvas )
			.axes( this.models.axes )
			.layers( this.layers )
			.annotations( this.models.annotations )
			.render();

		return this;
	},

	_initWidgets: function() {
		// Widgets:
		this.chart.widgets = new Chart.Layers.Widgets();

		this.chart.widgets
			.events( this.events )
			.canvas( this.models.canvas )
			.axes( this.models.axes )
			.layers( this.layers )
			.widgets( this.models.widgets )
			.data( this.collections.data )
			.marks( this.models.marks )
			.render();

		return this;
	},

	_initData: function() {
		// Data:
		this.chart.data = new Chart.Layers.Data();

		this.chart.data
			.data( this.collections.data )
			.events( this.events )
			.marks( this.models.marks )
			.canvas( this.models.canvas )
			.axes( this.models.axes )
			.layers( this.layers )
			.render();

		return this;

	},

	_settings: function( options ) {

		// Ability to turn on and off annotations, interaction, animation, listeners (?)
		// url for collection fetch

		return this;

	} // end METHOD settings()

});