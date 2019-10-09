const axios = require('axios');

var express = require('express');
var router = express.Router();

//初始化blockChain
const blockChain = require('./dist/blockChain').BlockChain;
blockChain.init(1000);


//获取所有区块
router.get('/blocks', function (request, response) {
        var json = JSON.stringify({
                code: 1,
                message: blockChain.getBlocks(),
        });
        response.send(json);
});


//根据节点id获取指定区块
router.get('/blocks/:id', function (request, response) {
        var id = ctx.params.id;
        if (id == null) {
                console.log("无效节点id");
                var json = JSON.stringify({
                        code: 0,
                        message: '无效节点id',
                });
                response.send(json);
        }

        let blocks = blockChain.getBlocks();
        if (+id > blocks.length) {
                console.log("没有找到区块");
                var json = JSON.stringify({
                        code: 0,
                        message: "没有找到区块",
                });
                response.send(json);
        }
        if (!sendAddr || !recAddr || !value) {
                var json = JSON.stringify({
                        code: 0,
                        message: "没有找到区块",
                });
                response.send(json);
        } else {
                var json = JSON.stringify({
                        code: 0,
                        message: blocks[+id],
                });
                response.send(json);
        }

});

//获取交易池所有交易
router.get('/transactions', function (request, response) {
        var json = JSON.stringify({
                code: 1,
                message: blockChain.getTransaction(),
        });
        response.send(json);
});

//获取数据库所有交易
router.get('/gettransactions', function (request, response) {
        var json = JSON.stringify({
                code: 1,
                message: JSON.stringify(blockChain.getSqlTransaction()),
        });
        response.send(json);
});

//获取数据库交易
router.get('/getleveltransactions', function (request, response) {
        var json = JSON.stringify({
                code: 1,
                message: blockChain.getLevelTransaction(),
        });
        response.send(json);
});

//提交交易记录
router.post('/transactions', function (request, response) {
        var sendAddr = request.body.sendAddr || '';
        var recAddr = request.body.recAddr || '';
        var value = request.body.value || 0;

        if (!sendAddr || !recAddr || !value) {
                var json = JSON.stringify({
                        code: 0,
                        message: "无效参数",
                });
                response.send(json);
        }

        var result = blockChain.submitTransaction(sendAddr, recAddr, value);
        var json = JSON.stringify({
                code: 1,
                message: result,
        });
        response.send(json);
});

//挖矿api
router.get('/mine', function (request, response) {
        const newBlock = blockChain.createBlock();
        var json = JSON.stringify({
                code: 1,
                message: newBlock.blockNumber,
        });
        response.send(json);
});

//获取当前区块链的所有节点
router.get('/nodes', function (request, response) {
        var json = JSON.stringify({
                code: 1,
                message: blockChain.getNodes(),
        });
        response.send(json);
});

//注册节点
router.post('/nodes', function (request, response) {
        var nodeId = request.body.id,
                nodeurl = request.body.url || "";

        if (!nodeId || !nodeurl) {
                var json = JSON.stringify({
                        code: 0,
                        message: "无效参数",
                });
                response.send(json);
        } else {
                console.log('获得的参数，', nodeId, "......", nodeurl);
                if (blockChain.register(nodeId, nodeurl)) {
                        var json = JSON.stringify({
                                code: 1,
                                message: `成功注册节点${nodeId}`,
                        });
                        response.send(json);
                } else {
                        var json = JSON.stringify({
                                code: 2,
                                message: "节点已存在" + nodeId,
                        });
                        response.send(json);
                }
        }
});

//区块共识
router.put('/nodes/consensus', function (request, response) {
        let reqs = blockChain.getNodes().map(node => axios.get(`${node.url}blocks`));
        if (!reqs.length) {
                var json = JSON.stringify({
                        code: 1,
                        message: "没有节点需要同步",
                });
                response.send(json);
        } else {
                axios.all(reqs).then(axios.spread((...blockChains) => {
                        if (blockChain.consensus(blockChains.map(res => res.data))) {
                                var json = JSON.stringify({
                                        code: 1,
                                        message: "成功达成共识",
                                });
                                response.send(json);
                        } else {
                                var json = JSON.stringify({
                                        code: 1,
                                        message: '未达成共识',
                                });
                                response.send(json);
                        }
                }))
        }
})

//注册用户地址
router.post('/registeruseraddr', function (request, response) {
        var userAddr = request.body.userAddr || '';
        var coinCount = '0';
        var transactionCount = '0';

        if (!userAddr) {
                var json = JSON.stringify({
                        code: 0,
                        message: "无效参数",
                });
                response.send(json);
        }

        var result = blockChain.registeruserAddr(userAddr, coinCount, transactionCount);
        console.log('结果' + result)
        var json = JSON.stringify({
                code: 1,
                message: result,
        });
        response.send(json);
});

//获取所有用户地址
router.get('/alladdr', function (request, response) {
        var json = JSON.stringify({
                code: 1,
                message: blockChain.getSqlAddr(),
        });
        response.send(json);
});


module.exports = router;