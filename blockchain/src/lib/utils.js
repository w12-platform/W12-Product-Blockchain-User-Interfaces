export function promisify (funct) {
    return function (...args) {
        return new Promise((accept, reject) => {
            const callback = function (error, result) {
                if (error != null) {
                    reject(error);
                } else {
                    accept(result);
                }
            };

            return funct(...args, callback);
        });
    };
}

export function waitTransactionReceipt(tx, web3, timeout = 240000) {
    return new Promise(function (accept, reject) {
        const start = new Date().getTime();

        const make_attempt = () => {
            web3.eth.getTransactionReceipt(tx, function (err, receipt) {
                if (err && !err.toString().includes('unknown transaction')) {
                    return reject(err);
                }

                if (receipt != null) {
                    if (parseInt(receipt.status, 16) == 0) {
                        return reject(new Error('status error'), tx, receipt);
                    } else {
                        return accept({
                            tx: tx,
                            receipt: receipt
                        });
                    }
                }

                if (timeout > 0 && new Date().getTime() - start > timeout) {
                    return reject(new Error("Transaction " + tx + " wasn't processed in " + (timeout / 1000) + " seconds!"));
                }

                setTimeout(make_attempt, 1000);
            });
        };

        make_attempt();
    });
}

