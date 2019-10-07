
import { sha256 } from "js-sha256";

const state = {
        blockNumber: 0,   //区块序号
        transaction: [],    //交易记录，数组
        userAddr: [],     //记录用户信息
        timestamp: Date.now(),   //时间戳
        noce: 0,    //随机数，数值类型
        prevBlock: ""    //前一个区块的HASH
}

export const Block = {
        generate: (blockNumber, transaction, timestamp, nonce, prevBlock) => {
                state.blockNumber = blockNumber;
                state.transaction = transaction;
                state.timestamp = timestamp;
                state.noce = nonce;
                state.prevBlock = prevBlock;
                return Object.assign({}, state);
        },
        //提交交易
        transactions: (transactionPool) => {
                state.transaction.push(transactionPool);
        },
        getTransactions: () => {
                return state.transaction;
        },
        //注册地址
        registerAddr: (newAddr) => {
                console.log(newAddr);
                state.userAddr.push(newAddr);
        },
        //获取所有用户地址
        getAllAddr: () => {
                return state.userAddr;
        },
        computeSha256: (state) => {
                return sha256(JSON.stringify(state));
        }
}