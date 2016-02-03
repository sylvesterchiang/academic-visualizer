var myStyles=['#268BD2', '#BD3613', '#FCF4DC'];

var width = 600,
    height = 400,
    root;

var force = d3.layout.force()
    .size([width, height])
    .on("tick", tick)
    .charge(-30)
    .gravity(0.3)

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", "0 0 " + width + " " + height)
	.attr("preserveAspectRatio", "xMidYMid meet");;

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

var index = {},
	set = {};
var size = 0, 
	id = 0;

standard = {
	"http://asn.jesandco.org/resources/D10003B9": 1, 
	"http://asn.jesandco.org/resources/D100029D": 2, 
	"http://asn.jesandco.org/resources/D10003FB": 3
}

var createNode = function(temp){
	set[key] = {
		"key": key, 
		"description": temp['http://purl.org/dc/terms/description'][0].value, 
		"comment": temp['http://purl.org/ASN/schema/core/comments'], 
		"subject": temp['http://purl.org/dc/terms/subject'][0].value, 
		"isPartOf": temp['http://purl.org/dc/terms/isPartOf'], 
		"isChildOf": temp['http://purl.org/gem/qualifiers/isChildOf'], 
		"educationLevel": temp['http://purl.org/dc/terms/educationLevel'].length, 
		"childNodes": [],
		"children": null, 
		"_children": null, 
		"bridge": null
	};
	size++;

	if (temp['http://purl.org/gem/qualifiers/hasChild'] != undefined){
		set[key].children = temp['http://purl.org/gem/qualifiers/hasChild'];
	}

	if (key != "http://asn.jesandco.org/resources/D10003FB" && key != "http://asn.jesandco.org/resources/D10003B9" && key != "http://asn.jesandco.org/resources/D100029D")
	{
		set[key].level = set[set[key].isChildOf[0].value].level + 1;
	}
	else
	{
		set[key].level = 0;
	}

	if (set[key].isPartOf != undefined){
		set[key].group = standard[set[key].isPartOf[0].value];
	}
	else{
		if (key == "http://asn.jesandco.org/resources/D10003FB")
			set[key].group = standard[key];
		else if (key == "http://asn.jesandco.org/resources/D10003B9")
			set[key].group = standard[key];
		else
			set[key].group = standard[key];
	}
}

var createJson = function(key){

	var recurse = function(key){

		children = [];
		if (set[key].children){
			for (var i = 0; i < set[key].children.length; i ++){
				set[key].childNodes.push(recurse(set[key].children[i].value));
			}
			
		}

		console.log(children);
		var node = {
			"key": key, 
			"description": set[key].description, 
			"level": set[key].level, 
			"_children": null, 
			"children": set[key].childNodes, 
			"group": set[key].group,
			"bridge": set[key].bridge
		};

		return node
	}

	return recurse(key);
}

var drawBridges = function(){
	console.log('creating bridges');

	var bridgeCount = 0;

	d3.csv('data/t1-s1.csv', function(data){
		for (key in data){
			temp = data[key];
			set[temp.subjectURI].bridge = temp.objectURI,
			set[temp.objectURI].bridge = temp.subjectURI 

			bridgeCount+=1;
		}

		if (bridgeCount > 700){

			console.log('done bridges');
			s1 = createJson("http://asn.jesandco.org/resources/D10003FB");
			t1 = createJson("http://asn.jesandco.org/resources/D10003B9");
			t2 = createJson("http://asn.jesandco.org/resources/D100029D");

			console.log(s1);
			something = JSON.stringify({"data":[s1, t1, t2]});
			console.log(something);
		}
	});

	d3.csv('data/t2-s1.csv', function(data){
		for (key in data){
			temp = data[key];
			set[temp.subjectURI].bridge = temp.objectURI,
			set[temp.objectURI].bridge = temp.subjectURI 

			bridgeCount +=1;
		}

		if (bridgeCount > 700){
			console.log('done bridges');
			s1 = createJson("http://asn.jesandco.org/resources/D10003FB");
			t1 = createJson("http://asn.jesandco.org/resources/D10003B9");
			t2 = createJson("http://asn.jesandco.org/resources/D100029D");
			console.log(s1);

			something = JSON.stringify({"data":[s1, t1, t2]});
			console.log(something);
		}
	});
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
			//hideNodes();
			//mupdate();
			drawBridges();
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
			//hideNodes();
			//mupdate();
			drawBridges();
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
			//hideNodes();
			//mupdate();
			drawBridges();
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

//checks to see if the set of links contains both source and target nodes. 
var checkExist = function(nodes, source, target){
	var hasSource = false;
	var hasTarget = false;

	for (var i = 0; i < nodes.length; i ++){
		if (nodes[i].name == source){
			hasSource = true;
			console.log('has source');
		}
		else if (nodes[i].name == target){
			hasTarget = true;
			console.log('has target');
		}
	}
	if (hasSource && hasTarget){
		return true;
	}
	return false;
}

/*
var loadBridges = function(links, nodes){
	console.log('drawing bridges');

	var bridge1 = false, 
		bridge2 = false;

	var bridges = [];

	d3.csv('data/t1-s1.csv', function(data){
		for (key in data){
			temp = data[key];
			if (checkExist(nodes, temp.subjectURI, temp.objectURI)){
				bridges.push({
					"source": temp.subjectURI,
					"target": temp.objectURI, 
					"value": 0.4
				});
			}
		}
		bridge1 = true;
		//once both sets of links are drown
		if (bridge1 && bridge2){
			console.log('done loading bridges');
			generateForce(nodes, links, bridges);
		}
	});

	d3.csv('data/t2-s1.csv', function(data){
		for (key in data){
			temp = data[key];
			if (checkExist(nodes, temp.subjectURI, temp.objectURI)){
				bridges.push({
					"source": temp.subjectURI,
					"target": temp.objectURI, 
					"value": 0.4
				});
			}
		}
		bridge2 = true;
		//once both sets of links are drown
		if (bridge1 && bridge2){
			console.log('done loading bridges');
			generateForce(nodes, links, bridges);
		}
	});
}
*/

console.log('nodemon works');

function update() {

	console.log('updating');

	id = 0;

  var nodes = flatten("http://asn.jesandco.org/resources/D10003FB").concat(flatten("http://asn.jesandco.org/resources/D10003B9")).concat(flatten("http://asn.jesandco.org/resources/D100029D"));
  //var shit = generateLinks("http://asn.jesandco.org/resources/D10003FB").concat(generateLinks("http://asn.jesandco.org/resources/D10003B9")).concat(generateLinks("http://asn.jesandco.org/resources/D100029D"));
  
  console.log(nodes[0]);
  console.log(set[nodes[0].name])

  for (var i = 0; i < nodes.length; i++){
  	nodes[i].x = set[nodes[i].name].x;
  	nodes[i].y = set[nodes[i].name].y;
  }	
  console.log(nodes[0]);

    console.log(nodes);

  var links = d3.layout.tree().links(nodes);
  //var shit = generateLinks(nodes);
  // Restart the force layout.
  console.log(links);

  //var bridges = loadBridges(links, nodes);
  //console.log(bridges);
}

var generateForce = function(nodes, links, bridges){
	console.log('generate force');
	console.log(nodes);
	console.log(links);
	console.log(bridges);

	links = links.concat(bridges);

  force
      .nodes(nodes)
      .links(links)
      .start();

  console.log('links formed');

  for (var i = 0; i < nodes.length; i++){
  	set[nodes[i].name].x = nodes[i].x;
  	set[nodes[i].name].y = nodes[i].y;
  }

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
      .attr("r", function(d) { return 5 - Math.sqrt(d.size); })
      .style("fill", color)
      .on("click", click)
      .call(force.drag)
      .attr('name', function(d){
			return d.description;
		})
      .on("mouseover", function(d){
 			temp_color = d3.select(this).style('fill');
 			d3.select(this).style('fill', "#ffcc00");
 			$("#name").text(d3.select(this).attr('name'));
 		})
 		.on("mouseout", function(d){
 			d3.select(this).style('fill', temp_color);
 			$("#name").text(" ");
  		});
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
	if (d.group == 1){
    	return d._children ? "#3182bd" : d.children ? "#3333cc" : "#c6dbef";
    }
    else if (d.group == 2){
    	return d._children ? "ff3300" : d.children ? "#cc2900" : "#ffc2b3";
    }
    else{
    	return d._children ? "#00cc66" : d.children ? "#008041" : "#00e675";
    }
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
			"level": temp.level, 
			"id": id, 
			"size": temp.level, 
			"group": temp.group
		};

		temp.id = id;
		id++;

		if (temp.children != undefined) 
		{
			var tempChildren = [];
			for (var k = 0; k < temp.children.length; k ++){
				tempChildren.push(set[set[key].children[k].value].id);
			}
			tempNode.children = tempChildren;
		}
		else{
			tempNode.children = null;
		}

		nodes.push(tempNode);
	}

	recurse(key);
	console.log(nodes);
	return nodes;
}

//generateLinks
function generateLinks(key){
	var source = [];
	var target = [];

	console.log('links');

	function recurse(key){

		if (set[key].children != undefined){

			for (var i = 0; i < set[key].children.length; i++){

				source.push(set[key]);
				target.push(set[set[key].children[i].value]);

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

	return shit;
}

//Main Call
loadData();

/*
	var svg = d3.select("body").append("svg")
		.attr("viewBox", "0 0 " + width + " " + height)
		.attr("preserveAspectRatio", "xMidYMid meet");
		*/
