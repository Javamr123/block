
/*
交易   付款人地址，收款人地址， 金额
*/

export const Transaction = {
        generate: (sen, rec, val) => {
                const state = {
                        senderAddr: "",
                        recipientAddr: "",
                        value: 0
                }

                state.recipientAddr = rec;
                state.senderAddr = sen;
                state.value = val;
                return Object.assign(state)
        }
}