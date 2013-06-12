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


// Instantiate our data set:
d3.json("data/example.json", function(json) {

	// 
	var data = new DataSeries(json);

	data.forEach(function(datum) {
		console.log(datum);
	});

	console.log(data);

	console.log(JSON.stringify(data));

});




