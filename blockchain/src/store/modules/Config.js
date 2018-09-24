export const CONFIG_UPDATE = "CONFIG_UPDATE";

export default {
    namespaced: true,
    state: {
        FactoryTokens: {
            address: "0x15bfbebcace798a18c42c2ff1f23388449355ea4"
        },
        W12Lister: {
            address: "0x090fd7807410455b59b95c492fda165c4b5b5679",
            version: "1"
        },
        W12ListerList: [
            {
                address: "0x090fd7807410455b59b95c492fda165c4b5b5679",
                version: "1"
            },
            {
                address: "0x090fd7807410455b59b95c492fda165c4b5b5677",
                version: "2"
            },
        ]
    },
    modules: {},
    getters: {},
    mutations: {
        [CONFIG_UPDATE](state, payload) {
            Object.assign(state, payload);
        },
    },
    actions: {

    }
};
