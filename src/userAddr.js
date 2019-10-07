/* 用户地址 */


export const addAddr = {
        generate: (addr, coinCount, transactionCount) => {
                const userAddr = {
                        addr: '',   //地址
                        coinCount: '',   //总持有币数量
                        transactionCount: ''  //交易次数
                }

                userAddr.addr = addr;
                userAddr.coinCount = coinCount;
                userAddr.transactionCount = transactionCount;
                return Object.assign(userAddr)
        }
}