/**
*	A reusable time series statistical graphic with Backbone.js and D3.js
*
*
*
*	Author:
*		Kristofer Gryte
*		http://www.kgryte.com
*
*	History:
*		2013/06/12 - KGryte. Created.
*
*
*
*/



//////////////////////
// 		Model   	//
//////////////////////

// Individual data points:
var DataPoint = Backbone.Model.extend({

	// Set the default coordinates for an individual data point:
	defaults: {
		x: 0,
		y: 0
	},

	// The basic type in the time series is a point:
	type: "point",

	// Data validation:
	validate: function(attrs, options) {
		// Code goes here. Check for numerical input, appropriate keys, etc.
	}

});




//////////////////////
// 	  COLLECTION  	//
//////////////////////


// A line is a collection of data points:
var DataSeries = Backbone.Collection.extend({

	// A data point will serve as the basic unit for our collection:
	model: DataPoint

});



