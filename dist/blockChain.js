'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var jsSha256 = require('js-sha256');
var bignumber_js = require('bignumber.js');
var fs = require('fs');
var path = require('path');

/*
交易   付款人地址，收款人地址， 金额
*/
const Transaction = {
  generate: (sen, rec, val) => {
    const state = {
      senderAddr: "",
      recipientAddr: "",
      value: 0
    };
    state.recipientAddr = rec;
    state.senderAddr = sen;
    state.value = val;
    return Object.assign(state);
  }
};

/* 用户地址 */
const addAddr = {
  generate: (addr, coinCount, transactionCount) => {
    const userAddr = {
      addr: '',
      //地址
      coinCount: '',
      //总持有币数量
      transactionCount: '' //交易次数

    };
    userAddr.addr = addr;
    userAddr.coinCount = coinCount;
    userAddr.transactionCount = transactionCount;
    return Object.assign(userAddr);
  }
};

const state = {
  blockNumber: 0,
  //区块序号
  transaction: [],
  //交易记录，数组
  userAddr: [],
  //记录用户信息
  timestamp: Date.now(),
  //时间戳
  noce: 0,
  //随机数，数值类型
  prevBlock: "" //前一个区块的HASH

};
const Block = {
  generate: (blockNumber, transaction, timestamp, nonce, prevBlock) => {
    state.blockNumber = blockNumber;
    state.transaction = transaction;
    state.timestamp = timestamp;
    state.noce = nonce;
    state.prevBlock = prevBlock;
    return Object.assign({}, state);
  },
  //提交交易
  transactions: transactionPool => {
    state.transaction.push(transactionPool);
  },
  getTransactions: () => {
    return state.transaction;
  },
  //注册地址
  registerAddr: newAddr => {
    console.log(newAddr);
    state.userAddr.push(newAddr);
  },
  //获取所有用户地址
  getAllAddr: () => {
    return state.userAddr;
  },
  computeSha256: state => {
    return jsSha256.sha256(JSON.stringify(state));
  }
};

//注册节点

const db = require('better-sqlite3')('./data/database/blockdatabase.db'); //挖矿奖励


const COINBASE_SENDER = "<COINBASE>"; //区块链官方地址

const COINBASE_REWARD = 50;
const difficulty = 1;
const state$2 = {
  nodeId: 0,
  //节点id
  blocks: [],
  //区块
  nodes: [],
  //存放所有节点的id
  transactionPool: [],
  // 交易池
  genesisBlock: Block.generate(0, [], 0, ""),
  //原始的，第一代block
  target: 2 ** (256 - difficulty),
  storagePath: ""
};
const BlockChain = {
  init: id => {
    state$2.nodeId = id;
    state$2.storagePath = path.resolve(__dirname, "../data/", `${state$2.nodeId}.blockchain`);
    state$2.blocks.push(state$2.genesisBlock); //将初代block放入交易池
  },
  //注册节点
  register: (id, url) => {
    // if (state.nodes.find(item => item.id == id)) {
    //         return false;
    // } else {
    //         state.nodes.push(NodeAction.generate(id, url));
    //         return true;
    // }
    //向数据库注册注册节点
    const row = db.prepare('SELECT * FROM block_node WHERE url=?').get(url);

    if (JSON.stringify(row) == undefined) {
      console.log('数据库没有这个节点ip');
    } else {
      console.log('数据库已有节点ip');
    }
  },
  //本地读取文件
  load: () => {
    try {
      state$2.blocks = JSON.parse(fs.readFileSync(state$2.storagePath, "utf-8"));
    } catch (error) {
      console.log("读取文件错误,区块连不存在，那就执行初始化区块");
      state$2.blocks = [state$2.genesisBlock];
    } finally {
      BlockChain.verify();
    }
  },
  //本地保存文件
  save: () => {
    try {
      state$2.blocks = JSON.parse(fs.readFileSync(state$2.blocks), "utf-8");
    } catch (error) {
      console.log("保存文件错误, 初始化区块");
    }
  },
  //提交交易
  submitTransaction: (send, rec, val) => {
    var transactions = [];
    state$2.transactionPool.push(Transaction.generate(send, rec, val));
    transactions = [Transaction.generate(send, rec, val), ...transactions];
    Block.transactions(transactions); //把交易数据给区块链,暂时模拟这样
    //将交易记录存到数据库

    var stmt = db.prepare("INSERT INTO block_transaction (senderAddr,recipientAddr,value) VALUES (?,?,?)");
    stmt.run(send, rec, parseInt(val));
    console.log('插入成功');
    return "插入成功";
  },
  //注册地址
  registeruserAddr: (addr, coinCount, transactionCount) => {
    var newAddr = [];
    newAddr = addAddr.generate(addr, coinCount, transactionCount);
    Block.registerAddr(newAddr); //查询数据库注册地址是否已存在

    const row = db.prepare('SELECT * FROM user WHERE addr=?').get(addr);

    if (JSON.stringify(row) == undefined) {
      var stmt = db.prepare("INSERT INTO user (addr,coinCount,transactionCount) VALUES (?,?,?)");
      stmt.run(addr, parseInt(coinCount), parseInt(transactionCount));
      console.log('插入成功');
      return "插入成功";
    } else {
      console.log('地址已存在');
      return "地址已存在";
    } // 增加一条数据
    // var sql_add = db.prepare('insert into user (addr, coinCount, transactionCount) values("' + addr + '", ' + parseInt(coinCount) + ',' + parseInt(transactionCount) + ')')
    // sql_add.run();

  },
  //获取所有用户地址
  getAllAddr: () => {
    return Block.getAllAddr();
  },
  //从数据库获取用户地址
  getSqlAddr: () => {
    const row = db.prepare('SELECT * FROM user  ').all();
    return JSON.stringify(row);
  },
  //获取节点
  getNodes: () => {
    return state$2.nodes;
  },
  //获取区块
  getBlocks: () => {
    return state$2.blocks;
  },
  //假设交易池里的交易都可以放到区块里
  //获取交易池里的交易记录
  getTransaction: () => {
    return state$2.transactionPool;
  },
  //获取区块里的交易
  getBlockTransaction: () => {
    return Block.getTransactions();
  },
  //获取数据库的交易记录
  getSqlTransaction: () => {
    const row = db.prepare('SELECT * FROM block_transaction ').all();
    return row;
  },
  //工作量证明
  isPowValid: pow => {
    try {
      if (!pow.startsWith("0x")) {
        pow = "0x" + pow; //转16进制
      }

      return new bignumber_js.BigNumber(pow).isLessThanOrEqualTo(state$2.target); //pow小于target才合法
    } catch (error) {
      console.log('转16进制异常：' + error);
      return false;
    }
  },
  //挖矿函数
  mineBlock: () => {
    let lastBlock = state$2.blocks[state$2.blocks.length - 1]; //找到上一个区块，在当前区块存储上一个区块的哈希

    var send_transactions = Transaction.generate(COINBASE_SENDER, state$2.nodeId, COINBASE_REWARD);
    Block.transactions(send_transactions); //把挖矿赠送的交易发到区块的交易记录里

    var newTransactions = Block.getTransactions(); //用区块链里完整的交易记录创建新区块

    const newBlock = Block.generate(lastBlock.blockNumber + 1, newTransactions, Date.now(), 0, Block.computeSha256(lastBlock)); //产生新的block
    //验证新区块是否符合工作量机制

    while (true) {
      let sha = Block.computeSha256(newBlock);
      console.log("我的区块随机数是：" + newBlock.noce);

      if (BlockChain.isPowValid(sha)) {
        console.log("找到有效工作：" + sha);
        /*
                将数据存储起来
        */
        //存储交易记录数据
        // var sql_add = db.prepare(`insert into user (username, password, email) values('buding', '1111', '221@sdsd.com')`)
        // sql_add.run()
        // console.log(sql_add)   

        break;
      }

      newBlock.noce++; //如果不符合机制，那就noce++,再继续挖
    }

    return newBlock;
  },
  //将区块添加到区块链尾部
  createBlock: () => {
    const newBlock = BlockChain.mineBlock(); //生成新的区块

    state$2.blocks.push(newBlock); //新区块追加到区块链尾部

    Block.transactions(BlockChain.transactionPool); //把交易数据给区块链

    state$2.transactionPool = []; //把新区块的交易记录从交易池清除

    return newBlock;
  },
  //验证节点
  verify: blocks => {
    try {
      if (!blocks.length) {
        console.log("blocks不能为空");
        throw new Error("blocks不能为空");
      }

      if (JSON.stringify(state$2.genesisBlock) != JSON.stringify(blocks[0])) {
        throw new Error("初始化blocks数据错误");
      }

      blocks.forEach((item, index) => {
        //验证前一个区块哈希
        if (index > 0 && item.prevBlock != Block.computeSha256(blocks[index - 1])) {
          throw new Error("前一个区块的哈希无效");
        }

        if (!BlockChain.isPowValid(Block.computeSha256(item))) {
          throw new Error("工作量无效");
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  },
  //验证并找到最长的区块连
  consensus: blockChains => {
    let maxLength = state$2.blocks.length,
        candidateIndex = -1;
    blockChains.forEach((item, index) => {
      if (item.length < maxLength) {//    continue;
      } else if (BlockChain.verify(item)) {
        maxLength = item.length;
        candidateIndex = index;
      }
    });

    if (candidateIndex > 0 && (maxLength >= state$2.blocks.lastIndexOf || BlockChain.verify(state$2.blocks))) {
      state$2.blocks = { ...blockChains[candidateIndex]
      };
      BlockChain.save();
      return true;
    }

    return false;
  }
};

exports.BlockChain = BlockChain;
