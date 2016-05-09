var http = require('http');
var fs = require('fs');

var start = 0,
	allApps = [];
  
var fetch = function() {
	if (start >= 961){
		var outputFilename = './target/topapps.json';

		fs.writeFile(outputFilename, JSON.stringify(allApps, null, 4), function(err) {
		    if(err) {
		      console.log(err);
		    } else {
		      console.log("JSON saved to " + outputFilename);
		    }
		}); 
		return;
	}

	var options = {
    	host: 'apps.wandoujia.com',
    	path: '/api/v1/apps?type=topapp&max=60&start=' + start + '&opt_fields=packageName,title'
	};
  	http.request(options, function(response){
  		
		var str = '';

		response.on('data', function (chunk) {
			str += chunk;
		});

		response.on('end', function () {
			apps = JSON.parse(str);
			allApps = allApps.concat(apps);
			console.log(allApps.length);
			start += 60;
			fetch();
		});
  	}).end();
}
  

fetch();