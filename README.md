backbone-and-d3
===============

Backbone.js + D3.js



---
### Models

Several models form the basis for a chart. 

* DataPoint: the atomic data unit, even if not actually displayed, e.g., in a line chart.
* DataSeries: extends the DataPoint model to manage a collection of data points, i.e., a data series. This is the primary unit for a line chart.
* ChartModel: this is a ViewModel which contains meta data related to the View representation, such as chart margins, axis labels, transition parameters, etc.
* DataCollection: the array of Models to be translated into graphical units. For a line chart, the collection is of data series.


---
### Views

Views correspond to chart layers. Each additional layer within a hierarchy extends the Views of layers below. This makes the implementation more modular and provides flexibility to include layers (functionality) only as needed.


#### Layers

Multiple layers comprise a chart. 

* ChartBase: the layer which creates the base canvas and defines chart dimensions
* ChartArea: the layer which creates axes (lines, ticks, labels) and specifies the x and y scales
* LineChart: the layer which actually plots the data
* AnimatedLineChart: the layer which introduces transition animations for various lifecycle events
* InteractiveLineChart: the layer which enables user interaction, e.g., providing additional context upon hover


---
### Classes

Classes are assigned within each chart layer, providing a more direct API for CSS and JS targeting.

* base: canvas layer, i.e., the SVG element
* chart: chart layer, i.e., the SVG group element holding all chart contents
* axis: axes layer, which is further classed by 
	* x: x axis
	* y: y axis
* label: axes labels
* data-series: the group of data sets plotted, even if only 1 data set
* line: the SVG path element for an individual data series, which is further classed in order of generation
	* line0: first line
	* line1: second line
	* ...
	* line(M-1): mth line


---
### Dependencies

This implementation uses multiple libraries/frameworks.

* D3.js: a visualization kernel.
* Backbone.js: an MV* framework.
* Underscore.js: a utility library used by Backbone.js
* jQuery.js: a general purpose library



---
### Copyright

Copyright (c) 2013. <a href="http://www.kgryte.com" target="_blank">Kristofer Gryte</a>.
License: <a href="http://www.opensource.org/licenses/mit-license.php" target="_blank">MIT</a>



