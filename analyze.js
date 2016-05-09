var fs = require('fs'),
    xml2js = require('xml2js'),
 	path = require('path');

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

var srcpath = './sources',
	dirs = getDirectories(srcpath),
	parser = new xml2js.Parser();

var dir = dirs[0],
	index = 0,
	failCount = 0;

console.log('目标应用总共：' + dirs.length + ' 个');

var analyze = function(){
	if(index >= dirs.length){
		dir = dirs[0];
		index = 0;
		console.log('总共 ' + failCount + ' 个因为反编译失败无法分析');
		return;
	}

	var __dirname = srcpath + '/' + dir;
	fs.readFile(__dirname + '/AndroidManifest.xml', function(err, data) {
		;
		if(err != null){
			failCount += 1;
			// console.log(`exec error: ${err}`);
			// console.log(dir + '反编译失败，无法分析')

	        index += 1;
	        dir = dirs[index];
			return analyze(); 
		}

	    parser.parseString(data, function (err, result) {

	    	var application = result.manifest.application[0],
	    		metaDatas = application['meta-data'],
	    		serviceDatas = application['service'],
	    		receiverDatas = application['receiver'],
	    		rongyunResult = false,
	    		huanxinResult = false,
	    		nimResult = false,
	    		leanCloudResult = false,
	    		qcloudReslt = false;

	    	if(receiverDatas){
	    		for(var i = receiverDatas.length; i--;){
		    		var receiverData = receiverDatas[i].$;
		    		var name = receiverData['android:name'];

		    		if(name === 'com.avos.avoscloud.AVBroadcastReceiver'){
		    			leanCloudResult = true;
		    		}
		    	}
	    	}
    		if (metaDatas){
		    	for(var i = metaDatas.length; i--;){
		    		var metaData = metaDatas[i].$;
		    		var name = metaData['android:name'];
		    		if(name === 'RONG_CLOUD_APP_KEY'){
		    			rongyunResult = true;
		    		}
		    		if(name === 'EASEMOB_APPKEY'){
		    			huanxinResult = true;
		    		}

		    		if(name === 'com.netease.nim.appKey'){
		    			nimResult = true;
		    		}
		    		
		    	}
		    	
	    	}

	    	if(serviceDatas){
	    		for(var i = serviceDatas.length; i--;){
		    		var service = serviceDatas[i].$;
		    		var name = service['android:name'];
		    		// 腾讯云
		    		if(name === 'com.tencent.qalsdk.service.QalService'){
		    			qcloudReslt = true;
		    		}

		    		// leancloud
		    		if(name === 'com.avos.avoscloud.PushService'){
		    			leanCloudResult = true;
		    		}
		    	}

	    	}
	    	if (rongyunResult){
        		console.log(dir, '融云');
    		}
	        if (huanxinResult){
	        	console.log(dir, '环信');
	    	}

	    	if(nimResult){
	    		console.log(dir, '** 云信 **');
	    	}

	    	if (qcloudReslt){
        		console.log(dir, '腾讯云通信', qcloudReslt);
    		}
	    	if (leanCloudResult){
        		console.log(dir, 'leancloud', leanCloudResult);
    		}

	        index += 1;
	        dir = dirs[index];
	        analyze();
	    });
	});

}

analyze();



