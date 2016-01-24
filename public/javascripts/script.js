var myStyles=['#268BD2', '#BD3613', '#FCF4DC'];

var width = 2000,
    height = 1500,
    root;

var force = d3.layout.force()
    .size([width, height])
    .on("tick", tick);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", "0 0 " + width + " " + height)
	.attr("preserveAspectRatio", "xMidYMid meet");;

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

var index = {},
	set = {};
var size = 0;

standard = {
	"http://asn.jesandco.org/resources/D10003B9": 1, 
	"http://asn.jesandco.org/resources/D100029D": 5, 
	"http://asn.jesandco.org/resources/D10003FB": 10
}

var createNode = function(temp){
	set[key] = {
		"id": size,
		"key": key, 
		"description": temp['http://purl.org/dc/terms/description'][0].value, 
		"comment": temp['http://purl.org/ASN/schema/core/comments'], 
		"subject": temp['http://purl.org/dc/terms/subject'][0].value, 
		"isPartOf": temp['http://purl.org/dc/terms/isPartOf'], 
		"isChildOf": temp['http://purl.org/gem/qualifiers/isChildOf'], 
		"educationLevel": temp['http://purl.org/dc/terms/educationLevel'].length, 
		"children": temp['http://purl.org/gem/qualifiers/hasChild'], 
		"_children": null
	};
	size++;

	if (key != "http://asn.jesandco.org/resources/D10003FB" && key != "http://asn.jesandco.org/resources/D10003B9" && key != "http://asn.jesandco.org/resources/D100029D")
	{
		set[key].level = set[set[key].isChildOf[0].value].level + 1;
	}
	else
	{
		set[key].level = 0;
	}
}

var loadData = function(){

	d3.json('data/s1.json', function(data){
		for (key in data){
			var temp = data[key];

			console.log('s1 is loading');

			if (temp != undefined && key != 'http://asn.jesandco.org/resources/D10003FB.xml'){
				createNode(temp);
			}
		}

		if (size > 1500){
			console.log('s1 setup');
			hideNodes();
			update();
		}
	});
	
	d3.json('data/t1.json', function(data){
		for (key in data){
			var temp = data[key]

			console.log("t1 is loading");

			if (temp != undefined && key != 'http://asn.jesandco.org/resources/D10003B9.xml'){
				createNode(temp);
			}
		}

		if (size > 1500){
			console.log('t1 setup');
			hideNodes();
			update();
		}
	});

	d3.json('data/t2.json', function(data){
		for (key in data){
			var temp = data[key]

			console.log('t2 is loading');

			if ((temp != undefined && key != 'http://asn.jesandco.org/resources/D100029D.xml') ){
				createNode(temp);
			}
		}

		if (size > 1500){
			console.log('t2 setup');
			hideNodes();
			update();
		}
	});
}

var hideNodes = function(){
	for (key in set){
		if (set[key].level > 0){
			set[key]._children = set[key].children;
			set[key].children = null; 
		}
	}
}

var loadBridges = function(){
	console.log('drawing bridges');

	d3.csv('data/t1-s1.csv', function(data){
		for (key in data){
			temp = data[key];
			links.push({
				"source": temp.subjectURI,
				"target": temp.objectURI, 
				"value": 0.4
			});
		}
		//once both sets of links are drown
		if (links.length > 2000){
			update();
		}
	});

	d3.csv('data/t2-s1.csv', function(data){
		for (key in data){
			temp = data[key];
			links.push({
				"source": temp.subjectURI,
				"target": temp.objectURI, 
				"value": 0.4
			});
		}
		//once both sets of links are drown
		if (links.length > 2000){
			update();
		}
	});
}

console.log('nodemon works');

function update() {

	console.log('updating');

  var nodes = flatten("http://asn.jesandco.org/resources/D10003FB").concat(flatten("http://asn.jesandco.org/resources/D10003B9")).concat(flatten("http://asn.jesandco.org/resources/D100029D"));
  var shit = generateLinks("http://asn.jesandco.org/resources/D10003FB").concat(generateLinks("http://asn.jesandco.org/resources/D10003B9")).concat(generateLinks("http://asn.jesandco.org/resources/D100029D"));

  // Restart the force layout.
  console.log(shit);

  force
      .nodes(nodes)
      .links(shit)
      .start();

  console.log('links formed');

  // Update the links…
  link = link.data(links, function(d) { return d.target.id; });

  // Exit any old links.
  link.exit().remove();

  // Enter any new links.
  link.enter().insert("line", ".node")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  // Update the nodes…
  node = node.data(nodes, function(d) { return d.id; }).style("fill", color);

  // Exit any old nodes.
  node.exit().remove();

  // Enter any new nodes.
  node.enter().append("circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return Math.sqrt(d.size) / 10 || 4.5; })
      .style("fill", color)
      .on("click", click)
      .call(force.drag);
}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}

// Color leaf nodes orange, and packages white or blue.
function color(d) {
  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}

// Toggle children on click.
function click(d) {
	if (!d3.event.defaultPrevented) {
		console.log(set[d.name].children);
	    if (set[d.name].children != null) {
	        set[d.name]._children = set[d.name].children;
	    	set[d.name].children = null;
	    	console.log('children');
	    } else {
	        set[d.name].children = set[d.name]._children;
	        set[d.name]._children = null;
	        console.log('_children');
	    }
	    console.log(set[d.name].children);
	    update();
	}
}

// Returns a list of all nodes under the root.
function flatten(key) {
    var nodes = [];

	function recurse(key) {

	    if (set[key].children != undefined){
	    	for (var j = 0; j < set[key].children.length; j++){
	    		recurse(set[key].children[j].value);
	    	}
	    }

	    temp = set[key];

		var tempNode = {
			"description": temp.description,
			"name": key, 
			"id": temp.id, 
			"level": temp.level
		};

		if (key != "http://asn.jesandco.org/resources/D10003FB" && key != "http://asn.jesandco.org/resources/D10003B9" && key != "http://asn.jesandco.org/resources/D100029D")
		{
			tempNode.group = standard[temp.isPartOf[0].value];
		}
		else
		{
			tempNode.group = standard[key];
		}

		if (temp.children != undefined) 
		{
			var tempChildren = [];
			for (var k = 0; k < temp.children.length; k ++){
				tempChildren.push(set[temp.children[k].value].id);
			}
			tempNode.children = tempChildren;
		}
		else{
			tempNode.children = null;
		}

		nodes.push(tempNode);
	}

	recurse(key);

	return nodes;
}

//generateLinks
function generateLinks(key){
	var source = [];
	var target = [];

	function recurse(key){

		if (set[key].children != undefined){

			for (var i = 0; i < set[key].children.length; i++){

				//console.log('pancakes');
				//console.log(set[key].id);
				//console.log(set[key].children[i].value);
				//console.log(set[set[key].children[i].value].id);

				source.push(set[key].id);
				target.push(set[set[key].children[i].value].id);

				recurse(set[key].children[i].value);
			}
		}
	}

	recurse(key);

	var shit = [];

	for (var i = 0; i < source.length; i++){
		shit.push({
			"source": source[i], 
			"target": target[i]
		});
	}

	console.log(shit);

	return shit;
}

//Main Call
loadData();

/*
	var svg = d3.select("body").append("svg")
		.attr("viewBox", "0 0 " + width + " " + height)
		.attr("preserveAspectRatio", "xMidYMid meet");
		*/
