var http = require('http');
var fs = require('fs');
var program = require('commander');
var download = require('./lib/download');
var exec = require('child_process').exec;

var dest = './apks/';

var downloadIndex = 0,
	apps = require('./target/topapps.json');

var syncDownload = function(){
  if (downloadIndex >= apps.length){
    downloadIndex = 0;
    apps = [];
    return;
  }  

  var app = apps[downloadIndex];

  app.downloadUrl = 'http://www.wandoujia.com/apps/' + app.packageName + '/download';
  var ranking = downloadIndex + 1;
  var apkName = ranking + '.' + app.title + '.apk';
  var target = dest  + apkName;

  console.log('↓↓↓↓↓ Downloading App ' + app.title + '. Top.' + (downloadIndex + 1));
  download(app.downloadUrl, target, null, function(){
    console.log('✓✓✓✓✓' + app.title + ' downloaded.');
    downloadIndex += 1;
    syncDownload()

    // 反编译 apk
    var cmd = "apktool d './apks/" + apkName + "' -o 'sources/" + ranking + "." + app.title + "' -f";
    console.log('→ → → → → Start decompile ' + apkName);
    exec(cmd, function(error, stdout, stderr) {
       if (error !== null) {
          console.log(`exec error: ${error}`);
        }else{
          console.log('✓✓✓ Finish decompile ' + apkName);    
        }
    });
  });

}

console.log('Downloading start. Target folder is ' + dest);
syncDownload();