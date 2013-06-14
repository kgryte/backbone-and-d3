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



// Generate our graph:
controller( 'body' );



// Create our flow function:
function controller( element ) {

	var options = {
		el: element
	};

	// Initialize our model; once finished render our view.
	model( "data/example2.json", options, view );


}; // end FUNCTION controller()




function model( filePath, options, clbk ) {

	// Initialize a dynamic model with data and chart sub-models:
	var _model = new Backbone.Model();

	// Instantiate the Chart Model:
	var _chart = new ChartModel({
		canvas: {
			width: $(options.el).width(),
			height: 300
		}
	});

	_model.set('chart', _chart);
		

	// Load our data set:
	d3.json( filePath, function(json) {

		// Convert the JSON to an array:
		var dataArray = json2array( json );

		// Instantiate the Data Model:
		var _data = new DataCollection( dataArray );

		_model.set('data', _data);


		// Run our callback, passing along our dynamic model and options:
		clbk( _model, options );

	});

	function json2array( json ) {
		//
		// Converter to adhere to DataCollection API.
		//
		//	* This helper will probably be unique to raw data and application.
		//

		// Here, the data is of the form:
		//	{
		//		'x': #,
		//		'y': []	
		//	}
		//

		// Expand the data into M Nx2 matrices (i.e., one matrix for each data series)

		data = [];

		// Determine the number of data series:
		// NOTE: We assume that each value for 'y' is the same length
		var M = json[0].y.length; 
		
		// Initialize the array:
		for (var m = 0; m < M; m++) {
			data[m] = {
				'dataSeries': []
			};
		}; // end FOR m

		_.each( json, function(d,i)  {
			for (var m = 0; m < M; m++) {
				data[m]['dataSeries'][i] = [ d.x, d.y[m] ];
			}; // end FOR m
		});

		return data;

	}; // end FUNCTION json2array( json )


};







function view( model, options ) {

	// The DOM element into which we want to draw the chart:
	var element = options.el;

	// Instantiate our view and render:
	var chart = new AnimatedLineChart( {
		el: element,
		collection: model.get('data'),
		model: model.get('chart')
	}).render();

	/*
	counter = 0;
	setInterval( function() {
		var chartModel = model.get('chart');
		chartModel.set({
			yDomain: [0, counter+counter*100] 
		});
		counter++;
	}, 1000);
	*/

}; // end FUNCTION view()