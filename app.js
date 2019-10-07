var express = require('express');
var bodyParser = require('body-parser');

//挂载
var app = express();

//设置跨域访问
app.all('*', function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        res.header("X-Powered-By", ' 3.2.1')
        res.header("Content-Type", "application/json;charset=utf-8");
        next();
});

//引入路由
const router = require('./router.js');




//配置post解析
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//调用路由
app.use(router);


var args = require('args');
args.option('port', '节点服务已启动，端口号是：', 3000);     //默认3000
const flags = args.parse(process.argv);
app.listen(flags.port, function () {
        console.log('服务器启动，端口', flags.port);
});
