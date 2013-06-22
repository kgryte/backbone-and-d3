/**
*
*
*
*
*
*
*
*
*
*/



// Individual data points:
App.Models.DataPoint = Backbone.Model.extend({

	// Set the default coordinates for an individual data point:
	defaults: function() {
		return {
			'x': 0, // default is two-dimensions
			'y': 0
		};
	},

	// The basic type in a time series is a point:
	type: "point",

	// 
	url: ''

});


// Individual data series:
App.Models.DataSeries = Backbone.NestedModel.extend( {

	// Set the default format for an individual data series:
	defaults: function() {
		return {
			'dataSeries': [] // default is an array of DataPoints
		};
	},

	// A collection of data points is of type data series:
	type: "dataSeries",

	//
	url: ''

});














