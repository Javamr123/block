
//注册节点
const state = {
        id: 0,    //节点id
        url: ""   //节点url
}

export const NodeAction = {
        generate: (id, url) => {
                state.id = id;
                state.url = url;
                return { ...state }
        }
}