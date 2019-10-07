import { BlockChain } from "./blockChain";
import { Block } from "./block";

//测试pow
const testPow = () => {
        let blockData = Block.generate(0, [], Date.now(), 1, "");
        let sha = Block.computeSha256(blockData);
        console.log(sha);
        console.log(state.target);
        console.log(BlockChain.isPowValid(sha));
}

//测试区块连挖矿代码
const mineBlock = () => {
        BlockChain.init(1000);
        BlockChain.submitTransaction("aa", "bb", 100);
        BlockChain.submitTransaction("cc", "dd", 200);
        BlockChain.mineBlock(BlockChain.getTransaction());
}


//验证存储的区块
const fsBlock = () => {
        BlockChain.init(1000);
        BlockChain.save();
        BlockChain.load();
}
