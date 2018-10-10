import jsunicode from 'jsunicode';
import bytes from 'utf8-bytes';
import moment from 'moment';

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

export function encodeMilestoneParameters(name, description, tranchePercent, endDate, voteEndDate, withdrawalWindow) {
    const result = {
        dates: [
            endDate, voteEndDate, withdrawalWindow
        ],
        tranchePercent,
        offsets: [],
        namesAndDescriptions: '0x',
        descriptionHex: null,
        nameHex: null
    };

    let utfBytes = bytes(name).map(num => num.toString(16)).join('');

    result.offsets.push(utfBytes.length / 2);
    result.namesAndDescriptions += utfBytes;
    result.nameHex = `0x${utfBytes}`;

    utfBytes = bytes(description).map(num => num.toString(16)).join('');

    result.offsets.push(utfBytes.length / 2);
    result.namesAndDescriptions += utfBytes;
    result.descriptionHex = `0x${utfBytes}`;
    return result;
}

export function packSetupCrowdsaleParameters(stages, milestones) {
    const [pack1, pack2] = stages.reduce((result, stage, idx) => {

        const pack1 = [moment(stage.startDate).unix(), moment(stage.endDate).unix(), Math.floor(stage.discount * 100), moment(stage.vestingDate).unix()];

        if (stage.bonusVolumes.length === 0) {
            pack1.push(0, 0);
        } else {
            let volumeBoundaries = [];
            let bonusVolumes = [];

            stage.bonusVolumes.forEach((bonus)=>{
                volumeBoundaries.push(toWeiDecimals(bonus[0], 18));
                bonusVolumes.push(Math.floor(bonus[1] * 100));
            });

            const lastOffset = result[1].length;

            pack1.push(lastOffset, lastOffset + bonusVolumes.length * 2);
            result[1].push(...bonusVolumes.reduce((result, v, idx) => (result.push(volumeBoundaries[idx], v), result), []));
        }

        result[0].push(pack1);
        return result;
    }, [[], []]);
    const [pack3, pack4, pack5] = milestones
        .map(m =>
            encodeMilestoneParameters(
                m.name,
                m.description,
                Math.floor(m.tranchePercent * 100),
                m.endDate,
                m.endDate + 1,
                m.withdrawalEndDate
            )
        )
        .reduce((result, m, idx) => {
            console.log(m);
            result[0].push([...m.dates, m.tranchePercent]);
            result[1].push(...m.offsets);
            result[2] += m.namesAndDescriptions.slice(2);

            return result;
        }, [[], [], '0x']);
    return [pack1, pack2, pack3, pack4, pack5];
}

