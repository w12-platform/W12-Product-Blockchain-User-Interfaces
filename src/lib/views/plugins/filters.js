const plugin = {
    install(Vue, options) {
        Vue.filter('shortEthAddress', (value) => {
            if (value.length < 16) return value;
            return value.slice(0, 8) + "..." + value.slice(-8, value.length);
        });
    }
}

export default plugin;
