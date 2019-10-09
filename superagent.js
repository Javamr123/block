const superagent = require('superagent');

// //获取区块
// superagent.get('http://localhost:3000/blocks').end(function (err, res) {
//         console.log(res.text);
// });

// //获取交易
// superagent.get('http://localhost:3000/gettransactions').end(function (err, res) {
//         console.log("获取交易1" + res.text);
// });

// //创建交易
// superagent.post('http://localhost:3000/transactions').send({
//         sendAddr: " nezha",
//         recAddr: "taizi",
//         value: 3
// }).end(function (err, res) {
//         console.log("创建交易" + res.text)
// });

// //获取交易
// superagent.get('http://localhost:3000/gettransactions').end(function (err, res) {
//         console.log("获取交易2" + res.text);
// });

//挖矿
superagent.get('http://localhost:3000/mine').end(function (err, res) {
        //炮错拦截
        if (err) {
                console.log(err);
        }
        //等待code
        console.log("挖矿" + res.text);
});

//获取数据库的交易记录
superagent.get('http://localhost:3000/getleveltransactions').end(function (err, res) {
        //炮错拦截
        if (err) {
                console.log(err);
        }
        //等待code
        console.log("数据库交易记录" + res.text);
});




//获取所有节点id
// superagent.get('http://localhost:3000/nodes').end(function (err, res) {
//         console.log(res.text);
// });

//注册节点
// superagent.post('http://localhost:3000/nodes').send({
//         id: 15,
//         url: "189.26.123"
// }).end(function (err, res) {
//         console.log(res.text);
// });

//获取所有节点id
// superagent.get('http://localhost:3000/nodes').end(function (err, res) {
//         console.log(res.text);
// });


//创建区块