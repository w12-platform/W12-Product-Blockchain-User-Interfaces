import jsunicode from 'jsunicode';
import Web3 from 'web3';
import moment from 'moment';
import * as Sentry from '@sentry/browser';

const web3 = new Web3();
const BigNumber = web3.BigNumber;


BigNumber.TEN = new BigNumber(10);
BigNumber.TWO = new BigNumber(2);
BigNumber.UINT_MAX = BigNumber.TWO.pow(256).minus(1);
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

export { web3 };
export { BigNumber };
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

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

export function promisifyLogsResult (funct, info) {
    return function (...args) {
        return new Promise((accept, reject) => {
            const callback = function (error, result) {
                Sentry.withScope(scope => {
                    scope.setTag("type", info.type);
                    scope.setTag("contract", info.contract_name);
                    scope.setTag("method", info.name);
                    scope.setTag("version", info.version);
                    scope.setTag("contract_address", info.address);
                    scope.setLevel(error != null ? Sentry.Severity.Error : Sentry.Severity.Info);
                    scope.setExtra("method_arguments", args);

                    if (error != null) {
                        Sentry.captureException(error);
                    } else {
                        scope.setExtra("result", result);
                        Sentry.captureEvent({
                            message: [info.type, info.contract_name, info.name, info.version, info.address].join(' ')
                        });
                    }
                });

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

export function promisifyLogsResultWarrantor(funct, info) {
    return function (...args) {
        return new Promise((accept, reject) => {
            const callback = async (error, result) => {
                Sentry.withScope(scope => {
                    scope.setTag("type", info.type);
                    scope.setTag("contract", info.contract_name);
                    scope.setTag("method", info.name);
                    scope.setTag("version", info.version);
                    scope.setTag("contract_address", info.address);
                    scope.setLevel(error != null ? Sentry.Severity.Error : Sentry.Severity.Info);
                    scope.setExtra("method_arguments", args);

                    if (error != null) {
                        Sentry.captureException(error);
                    } else {
                        scope.setExtra("result", result);
                        Sentry.captureEvent({
                            message: [info.type, info.contract_name, info.name, info.version, info.address].join(' ')
                        });
                    }
                });

                if (error != null) {
                    reject(error);
                } else {
                    if(result === "0x"){
                        await wait(1000);
                        funct(...args, callback);
                    } else {
                        accept(result);
                    }
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

export function waitContractEventOnce(contract, name, filters, timeout = Infinity) {
    return new Promise(function (accept, reject) {
        if (typeof contract.events[name] !== 'function') reject(new Error(`no event with name "${name}"`));

        const timerCb = () => {
            if (watcher) watcher.stopWatching();

            watcher = null;

            reject(new Error('timout has been expired'));
        };

        let watcher;
        let timer = isFinite(timeout) && timeout >= 0
            ? setTimeout(timerCb, timeout)
            : null;

        watcher = contract.events[name](filters, null, (error, result) => {
            if (!watcher) return;

            watcher.stopWatching();

            if (timer !== null) clearTimeout(timer);

            if (error) return reject(error);

            return accept(result);
        });
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

export async function dynamicImport(type, version, name) {
    return import("lib/Blockchain/" + type + "/" + version + "/" + name + ".js");
}

export function getRefundWindow(milestones, currentMilestoneIndex) {
    if(
        Array.isArray(milestones)
        && currentMilestoneIndex != null
        // refund allowed from milestone[1]
        && currentMilestoneIndex > 0
        && milestones.length > currentMilestoneIndex) {

        const milestone = milestones[currentMilestoneIndex];

        return [milestone.endDate, milestone.withdrawalEndDate];
    }
}

export function isRefundActive(milestones, currentMilestoneIndex) {
    if (currentMilestoneIndex === null || currentMilestoneIndex < 0) return false;

    const window = getRefundWindow(milestones, currentMilestoneIndex);

    if (!window) return false;

    const nowUnix = moment().unix();

    return window[0] <= nowUnix && nowUnix < window[1];
}

export function encodeUSD(value) {
    value = new BigNumber(value);

    return value.mul(BigNumber.TEN.pow(8));
}

export function decodeUSD(value) {
    value = new BigNumber(value);

    return value.div(BigNumber.TEN.pow(8));
}

export async function jsonLoader(version, name) {
    return import("abi/" + version + "/" + name + ".json");
}

export function round(value) {
    value = new BigNumber(value);

    return new BigNumber(value.toFixed(0, 1));
}

export function instanceOf(instance, Ctor) {
    if (!(instance instanceof Ctor)) {
        throw new Error(`Instance [${instance.constructor.name}] is not a instance of [${Ctor.name}]`);
    }
}

export function errorMessageSubstitution(e) {
    return e.name === 'BigNumber Error' ? 'UnexpectedError' : e.message;
}

export function warrantor(funct){
    return function (...args) {
        return new Promise((accept, reject) => {
            const callback = async (error, result) => {
                if (error != null) {
                    reject(error);
                } else {
                    if(result === null){
                        await wait(1000);
                        funct(...args, callback);
                    } else {
                        accept(result);
                    }
                }
            };

            return funct(...args, callback);
        });
    };
}