// Initialize a single data point:
var datum = new Datum();

// Get the default 'x' value => null
datum.get('x');

// Get the default 'y' value => null
datum.get('y');

// Initialize a single data set:
var dataset = new DataSet();

// Initialize and give a data set a name:
var dataset = new DataSet({'name': 'DexDem'});

// Get the name:
dataset.get('name'); // => 'DexDem'

// Initialize a dataset with a single data model:
var dataset = new DataSet(
	{
		'data': {
			'x': 5, 
			'y': 5
		}
	}
); // => stored in a collection (array)

dataset.get('data').length; // => 1

// Initialize a dataset with a data array:
var dataset = new DataSet(
	{
		'name': 'DexDem',
		'data': [
			{
				'x': 5, 
				'y': 5
			},
			{
				'x': 4,
				'y': 4
			},
			{
				'x': 3,
				'y': 3
			}
		]
	}
);

// Get the first model in the collection:
dataset.get('data').at(0);

// Get the 'x' value in the first model:
dataset.get('data').at(0).get('x');

// Add a model to the dataset:
dataset.get('data').add(datum);

// Remove the a model from the dataset:
dataset.get('data').remove(datum);

// Initialize a data group:
var datagroup = new DataCollection();

// Initialize multiple datasets:
var dataset1 = new DataSet(
	{
		'name': 'DexDem',
		'data': [
			{
				'x': 5, 
				'y': 5
			},
			{
				'x': 4,
				'y': 4
			},
			{
				'x': 3,
				'y': 3
			}
		]
	}
);

var dataset2 = new DataSet(
	{
		'name': 'DexAem',
		'data': [
			{
				'x': 5, 
				'y': 5
			},
			{
				'x': 4,
				'y': 4
			},
			{
				'x': 3,
				'y': 3
			}
		]
	}
);

var dataset3 = new DataSet(
	{
		'name': 'AexAem',
		'data': [
			{
				'x': 5, 
				'y': 5
			},
			{
				'x': 4,
				'y': 4
			},
			{
				'x': 3,
				'y': 3
			}
		]
	}
);

// Initialize a datagroup and populate with data sets:
var datagroup = new DataCollection( [dataset1, dataset2, dataset3] );

// Get the first dataset:
datagroup.at(0);

// Get the x value of the first model in the first data set:
datagroup.at(0).get('data').at(0).get('x');











