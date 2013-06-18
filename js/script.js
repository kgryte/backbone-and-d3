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


// Set various options for the graph:
var element = 'body';
var options = {
	el: element,
	data: 'data/example2.json',
	chart: {
		'canvas': {
			'width': $(element).width()/2,
			'height': 300
		},
		'brush': true,
		'interpolation': 'linear', //monotone',
		'animation': 'arise',
		'title': 'Title',
		'caption': 'Figure 1. <span class="figure-desc">Short description</span>. This is a figure caption.',
		'legend': ['line0', 'line1', 'line2'],
		'dataCursor': true
	}
};


// Generate our graph:
controller( options );



// Create our flow function:
function controller( options ) {

	// Get our data path:
	var filePath = options.data;

	// Initialize our model; once finished render our view.
	model( filePath, options, view );

}; // end FUNCTION controller()




function model( filePath, options, clbk ) {

	// Initialize a dynamic model with data and chart sub-models:
	var _model = new Backbone.Model();

	// Instantiate the Chart Model:
	var _chart = new ChartModel( options.chart.canvas );

	// Add the Chart Model to our dynamic model:
	_model.set('chart', _chart);

	// Demonstrate that we can set options even after setting the dynamic model:
	_chart.set( options.chart );

	// Load our data set:
	d3.json( filePath, function(json) {

		// Convert the JSON to an array:
		var dataArray = json2array( json );

		// Instantiate the Data Model:
		var _data = new DataCollection( dataArray );

		// Add the Data Model to our dynamic model:
		_model.set('data', _data);

		// Run our callback, passing along our dynamic model and options:
		clbk( _model, options );

		// Run our simulator:
		setTimeout( simulate( _data, 1100 ), 1000 ); 

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

		// Expand the data into M Nx1 object arrays (i.e., one array for each data series)

		var data = [];

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
				data[m]['dataSeries'][i] = {
					'x': d.x, 
					'y': d.y[m]
				};
			}; // end FOR m
		});

		return data;

	}; // end FUNCTION json2array( json )

	function simulate( collection, delay ) {

		var counter = 1,
			randn = d3.random.normal();
		setInterval( function() {

			var x = 5.5 + counter*0.02;
			var data, yMean, yStd;
			for (var m = 0; m < collection.length; m++) {

				data = collection.at(m).get('dataSeries');

				yMean = d3.mean(data, function(d) { return d.y; });
				yStd = 1 / data.length * d3.sum(data , function(d) { return Math.pow(d.y - yMean, 2); });
				yStd = Math.sqrt(yStd);

				collection.at(m).add('dataSeries', {
					'x': x,
					'y': yMean + yStd * randn()
				});
				collection.at(m).remove('dataSeries[0]', {silent: true});
			}; // end FOR m

			counter++;

		}, delay);

	}; // end FUNCTION simulate( collection, delay )

}; // end FUNCTION model()



function view( model, options ) {

	// The DOM element into which we want to draw the chart:
	var element = options.el;

	// Instantiate our view and render:
	var chart = new AnimationLayer( {
		el: element,
		collection: model.get('data'),
		model: model.get('chart')
	}).render();

}; // end FUNCTION view()