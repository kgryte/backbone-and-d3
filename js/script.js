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
	model( "data/example.json", options, view );


}; // end FUNCTION controller()




function model( filePath, options, clbk ) {

	// Load our data set:
	d3.json( filePath, function(json) {

		// Initialize a dynamic model with data and chart sub-models:
		var _model = new Backbone.Model();

		_model.set( 
			{
				data: new DataSeries( json ),
				chart: new ChartModel()
			}
		);

		clbk( _model, options );

	});

};





function view( model, options ) {

	// The DOM element into which we want to draw the chart:
	var element = options.el;

	// Instantiate our view and render:
	var chart = new LineChart( {
		el: element,
		collection: model.get('data'),
		model: model.get('chart')
	}).render();


}; // end FUNCTION view()