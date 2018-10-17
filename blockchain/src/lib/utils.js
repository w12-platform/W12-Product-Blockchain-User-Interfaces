import jsunicode from 'jsunicode';
import Web3 from 'web3';

const web3 = new Web3();
const BigNumber = web3.BigNumber;

BigNumber.config({
    DECIMAL_PLACES: 36,
    FORMAT: {
        decimalSeparator: '.',
        groupSeparator: '',
        groupSize: 3,
        secondaryGroupSize: 0,
        fractionGroupSeparator: ' ',
        fractionGroupSize: 0
    }
});

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

export function wait(ms) { return new Promise(rs => setTimeout(rs, ms)); }

export function decodeStringFromBytes(bytesString) {
    bytesString = bytesString.indexOf('0x') === 0 ? bytesString.slice(2) : bytesString;

    return jsunicode.decode(bytesString, jsunicode.constants.encoding.utf16);
}

export function encodeStringToBytes (string) {
    return '0x' + jsunicode.encode(string, jsunicode.constants.encoding.utf16);
}

export function countStringBytes (string) {
    return jsunicode.encode(string, jsunicode.constants.encoding.utf16).length / 2;
}

export function isZeroAddress(address) {
    try {
        return /^0x$/.test(address) || web3.toBigNumber(address).eq(0);
    } catch (e) {
        return false;
    }
}

/* 11 111.22 -> 11111.22 */
export function formatNumber(textNumber) {
    return textNumber ? parseFloat(textNumber.replace(/\s+/g, '')):0;
}

export function fromWeiDecimalsString(value, decimals) {
    return value ? new BigNumber(value)
        .div(new BigNumber(10).pow(decimals))
        .toString()
        : "";
}

export function fromWeiDecimals(value, decimals) {
    return value ? new BigNumber(value)
        .div(new BigNumber(10).pow(decimals))
        : "";
}

export function toWeiDecimals(value, decimals) {
    const oneToken = new BigNumber(10).pow(decimals);
    return value ? new BigNumber(value).times(oneToken): "";
}

export function version(block, version) {
    return () => import("bem/" + block + "/" + version);
}

export async function dynamicImport(type, version, name) {
    return import("lib/Blockchain/" + type + "/" + version + "/" + name + ".js");
}

export async function jsonLoader(version, name) {
    return await fetch("/protocol/abi/" + version + "/" + name + ".json").then(data => data.json());
}
