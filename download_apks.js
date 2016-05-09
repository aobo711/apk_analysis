var http = require('http');
var fs = require('fs');
var program = require('commander');
var download = require('./lib/download');
var exec = require('child_process').exec;


program
  .version('0.0.1')
  .option('-d, --dest', 'Target folder')
  .option('-m, --max <n>', 'Item count to download, 60 max.', parseInt)
  .option('-s, --start <n>', 'Starter item index', parseInt)
  .option('-p, --packageName', 'Target app\'s packageName')
  .parse(process.argv);

var dest = program.dest,
  max = program.max,
  start = program.start,
  packageName = program.packageName;

dest = dest ? dest : './apks/';

var downloadIndex = 0,
  apps = [];

var syncDownload = function(){
  if (downloadIndex >= apps.length){
    downloadIndex = 0;
    apps = [];
    return;
  }  

  var app = apps[downloadIndex];

  app.downloadUrl = 'http://www.wandoujia.com/apps/' + app.packageName + '/download';
  var ranking = downloadIndex + start;
  var apkName = ranking + '.' + app.title + '.apk';
  var target = dest  + apkName;

  console.log('↓↓↓↓↓ Downloading App ' + app.title + '. Top.' + (downloadIndex + start));
  download(app.downloadUrl, target, null, function(){
    console.log('✓✓✓✓✓' + app.title + ' downloaded.');
    downloadIndex += 1;
    syncDownload()

    // 反编译 apk
    var cmd = "apktool d 'apks/" + apkName + "' -o 'sources/" + ranking + "." + app.title + "' -f";
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

var callback = function(response) {
  var str = '';

  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    apps = JSON.parse(str);
    syncDownload();


    // for(i = 0; i < max; i++){
    //   var app = apps[i];
    //   app.downloadUrl = 'http://www.wandoujia.com/apps/' + app.packageName + '/download';
    //   var target = dest  + (i + start) + '.' + app.title + '.apk';
    
    //   download(app.downloadUrl, target, null, function(){
    //     console.log(app.title + ' downloaded.');

    //   });
    // }
  });
}
if (max && start >= 0){
  // 下载排行榜
  var options = {
    host: 'apps.wandoujia.com',
    path: '/api/v1/apps?type=topapp&max=' + max + '&start=' + start + '&opt_fields=packageName,title'
  };

  http.request(options, callback).end();
  console.log('Downloading start. Target folder is ' + dest);
}else if(packageName){
  // 下载单个应用

}else{
  console.log('No ranking data nor packageName provided.')
}



