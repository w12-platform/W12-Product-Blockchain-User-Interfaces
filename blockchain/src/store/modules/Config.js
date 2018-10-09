export const CONFIG_UPDATE = "CONFIG_UPDATE";

export default {
    namespaced: true,
    state: {
        FactoryTokens: {
            address: "0x15bfbebcace798a18c42c2ff1f23388449355ea4"
        },
        W12Lister: {
            address: "0x4dda30a4ab8e05223a772e1bbf09e3bfb6c9aff3",
            version: "0.21.3"
        },
        Default: {
            version: "0.20.5"
        },
        W12ListerList: [
            {
                address: "0x0d60b4c74be0670166dc8f5588d35c8d50f4929d",
                version: "0.20.5"
            },
            {
                address: "0x4dda30a4ab8e05223a772e1bbf09e3bfb6c9aff3",
                version: "0.21.3"
            },
        ],
        Rates: {
            address: "0x811b10cde932759f6af53ba97e006ffe7796159b"
        }
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
