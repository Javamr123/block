'use strict';

var jsSha256 = require('js-sha256');
require('bignumber.js');
require('fs');
require('path');

/*
交易   付款人地址，收款人地址， 金额
*/

/* 用户地址 */

const state$1 = {
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
    state$1.blockNumber = blockNumber;
    state$1.transaction = transaction;
    state$1.timestamp = timestamp;
    state$1.noce = nonce;
    state$1.prevBlock = prevBlock;
    return Object.assign({}, state$1);
  },
  //提交交易
  transactions: transactionPool => {
    state$1.transaction.push(transactionPool);
  },
  getTransactions: () => {
    return state$1.transaction;
  },
  //注册地址
  registerAddr: newAddr => {
    console.log(newAddr);
    state$1.userAddr.push(newAddr);
  },
  //获取所有用户地址
  getAllAddr: () => {
    return state$1.userAddr;
  },
  computeSha256: state => {
    return jsSha256.sha256(JSON.stringify(state));
  }
};

//注册节点

const difficulty = 1;
const state$3 = {
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
