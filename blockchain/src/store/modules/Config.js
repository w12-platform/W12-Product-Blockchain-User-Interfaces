import { encode } from '@redtea/semint';

export const CONFIG_UPDATE = "CONFIG_UPDATE";

export default {
    namespaced: true,
    state: {
        FactoryTokens: {
            address: "0x146f81931a3e0a53f1847f33175f25b488f9fef8"
        },
        W12Lister: {
            address: "0x4a3d202120d2d75445c73f256507f1b4186e25d4",
            version: "0.21.3"
        },
        Default: {
            version: "0.21.3"
        },
        W12ListerList: [
            {
                address: "0x4a3d202120d2d75445c73f256507f1b4186e25d4",
                version: "0.21.3"
            },
        ],
        Rates: {
            address: "0x811b10cde932759f6af53ba97e006ffe7796159b"
        }
    },
    modules: {},
    getters: {
        W12ListerLastVersion(state) {
            const list = state.W12ListerList.slice()
                .sort((a, b) => encode(a.version, 4) - encode(b.version, 4));

            return list.length != 0 ? list[list.length - 1] : null;
        }
    },
    mutations: {
        [CONFIG_UPDATE](state, payload) {
            Object.assign(state, payload);
        },
    },
    actions: {

    }
};
