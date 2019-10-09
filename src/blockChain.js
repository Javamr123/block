
import { Transaction } from './transaction';
import { addAddr } from './userAddr';
import { Block } from "./block";
import { BigNumber } from "bignumber.js";
import * as fs from 'fs';
import * as path from "path";
import { NodeAction } from "./register_node";

// 打开sqlites数据库
const db = require('better-sqlite3')('./data/database/blockdatabase.db');

//挖矿奖励
const COINBASE_SENDER = "<COINBASE>";   //区块链官方地址
const COINBASE_REWARD = 50;

const difficulty = 1;
const state = {
        nodeId: 0,  //节点id
        blocks: [],  //区块
        nodes: [],    //存放所有节点的id
        transactionPool: [], // 交易池
        genesisBlock: Block.generate(0, [], 0, ""),   //原始的，第一代block
        target: 2 ** (256 - difficulty),
        storagePath: ""
}

export const BlockChain = {
        init: (id) => {
                state.nodeId = id;
                state.storagePath = path.resolve(__dirname, "../data/", `${state.nodeId}.blockchain`);
                state.blocks.push(state.genesisBlock);   //将初代block放入交易池
        },

        //注册节点
        register: (id, url) => {
                if (state.nodes.find(item => item.id == id)) {
                        return false;
                } else {
                        state.nodes.push(NodeAction.generate(id, url));
                        return true;
                }
        },

        //本地读取文件
        load: () => {
                try {
                        state.blocks = JSON.parse(fs.readFileSync(state.storagePath, "utf-8"));
                } catch (error) {
                        console.log("读取文件错误,区块连不存在，那就执行初始化区块");
                        state.blocks = [state.genesisBlock];
                } finally {
                        BlockChain.verify();
                }
        },

        //本地保存文件
        save: () => {
                try {
                        state.blocks = JSON.parse(fs.readFileSync(state.blocks), "utf-8")
                } catch (error) {
                        console.log("保存文件错误, 初始化区块");
                }
        },

        //提交交易
        submitTransaction: (send, rec, val) => {
                var transactions = [];
                state.transactionPool.push(Transaction.generate(send, rec, val));
                transactions = [Transaction.generate(send, rec, val), ...transactions];
                Block.transactions(transactions);   //把交易数据给区块链,暂时模拟这样

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
                Block.registerAddr(newAddr);

                //查询数据库注册地址是否已存在
                const row = db.prepare('SELECT * FROM user WHERE addr=?').get(addr);
                if (JSON.stringify(row) == undefined) {
                        var stmt = db.prepare("INSERT INTO user (addr,coinCount,transactionCount) VALUES (?,?,?)");
                        stmt.run(addr, parseInt(coinCount), parseInt(transactionCount));
                        console.log('插入成功');
                        return "插入成功";
                } else {
                        console.log('地址已存在');
                        return "地址已存在";
                }


                // 增加一条数据
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
                return state.nodes
        },

        //获取区块
        getBlocks: () => {
                return state.blocks;
        },

        //假设交易池里的交易都可以放到区块里
        //获取交易池里的交易记录
        getTransaction: () => {
                return state.transactionPool;
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
        isPowValid: (pow) => {
                try {
                        if (!pow.startsWith("0x")) {
                                pow = "0x" + pow;   //转16进制
                        }
                        return new BigNumber(pow).isLessThanOrEqualTo(state.target);  //pow小于target才合法
                } catch (error) {
                        console.log('转16进制异常：' + error);
                        return false;
                }
        },

        //挖矿函数
        mineBlock: () => {

                let lastBlock = state.blocks[state.blocks.length - 1];   //找到上一个区块，在当前区块存储上一个区块的哈希
                var send_transactions = Transaction.generate(COINBASE_SENDER, state.nodeId, COINBASE_REWARD);
                Block.transactions(send_transactions); //把挖矿赠送的交易发到区块的交易记录里
                var newTransactions = Block.getTransactions();   //用区块链里完整的交易记录创建新区块
                const newBlock = Block.generate(lastBlock.blockNumber + 1, newTransactions, Date.now(), 0, Block.computeSha256(lastBlock));   //产生新的block

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
                        newBlock.noce++;   //如果不符合机制，那就noce++,再继续挖
                }
                return newBlock;
        },

        //将区块添加到区块链尾部
        createBlock: () => {
                const newBlock = BlockChain.mineBlock();  //生成新的区块
                state.blocks.push(newBlock);   //新区块追加到区块链尾部
                Block.transactions(BlockChain.transactionPool);   //把交易数据给区块链
                state.transactionPool = [];   //把新区块的交易记录从交易池清除
                return newBlock;
        },

        //验证节点
        verify: (blocks) => {
                try {
                        if (!blocks.length) {
                                console.log("blocks不能为空");
                                throw new Error("blocks不能为空");
                        }

                        if (JSON.stringify(state.genesisBlock) != JSON.stringify(blocks[0])) {
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
                        })
                        return true;
                } catch (error) {
                        return false;
                }
        },

        //验证并找到最长的区块连
        consensus: (blockChains) => {
                let maxLength = state.blocks.length, candidateIndex = -1;
                blockChains.forEach((item, index) => {
                        if (item.length < maxLength) {
                                //    continue;
                        } else if (BlockChain.verify(item)) {
                                maxLength = item.length;
                                candidateIndex = index;
                        }
                })

                if (candidateIndex > 0 && (maxLength >= state.blocks.lastIndexOf || BlockChain.verify(state.blocks))) {
                        state.blocks = { ...blockChains[candidateIndex] };
                        BlockChain.save();
                        return true;
                }

                return false;
        }

}

