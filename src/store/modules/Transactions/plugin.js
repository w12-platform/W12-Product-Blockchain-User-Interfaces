let cancel = () => {};
const asyncInternal = (cb, timeout) => {
    let id;
    const timer = () => (id = setTimeout(() => { cb().then(timer, (e) => (console.error(e), timer()))}, timeout));
    timer();
    return () => clearTimeout(id);
}
export default store => {
    cancel();
    cancel = asyncInternal(async () => {
        await store.dispatch('Transactions/updateStatusTx');
    }, 5000);
}
