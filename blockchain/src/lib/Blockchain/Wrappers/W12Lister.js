import { promisify } from '../../utils.js';
import { BaseWrapper } from './BaseWrapper.js';


export class W12ListerWrapper extends BaseWrapper {
    constructor(contractArtifacts, instance) {
        super(contractArtifacts, instance);

        this.W12CrowdsaleFactory = null;
    }

    setFactories({
        W12CrowdsaleFactory,
        ERC20Factory,
        DetailedERC20Factory,
        W12TokenLedgerFactory
    }) {
        this.W12CrowdsaleFactory = W12CrowdsaleFactory;
        this.ERC20Factory = ERC20Factory;
        this.W12TokenLedgerFactory = W12TokenLedgerFactory;
        this.DetailedERC20Factory = DetailedERC20Factory;
    }

    async fetchComposedTokenInformationByTokenAddress(tokenAddress) {
        const {ERC20Factory, W12CrowdsaleFactory, W12TokenLedgerFactory} = this;

        if (tokenAddress) {
            const whiteListEvent = this.events.OwnerWhitelisted({ tokenAddress }, { fromBlock: 0 });

            const getEventRecord = promisify(whiteListEvent.get.bind(whiteListEvent));

            const tokenIndex = (await this.methods.approvedTokensIndex(tokenAddress)).toNumber();

            if (tokenIndex > 0) {
                const eventRecord = await getEventRecord();

                if (eventRecord.length > 0) {
                    const {
                        name,
                        symbol,
                        tokenAddress,
                        tokenOwner
                    } = eventRecord[0].args; // take first record by default


                    const listedToken = await this.methods.approvedTokens(tokenIndex);
                    const ledgerAddress = await this.methods.ledger();
                    const decimals = listedToken[2].toString();
                    const feePercent = listedToken[3].toString();
                    const feeETHPercent = listedToken[4].toString();
                    let crowdsaleAddress = listedToken[5].toString();
                    const tokensForSaleAmount = listedToken[6].toString();
                    const wTokensIssuedAmount = listedToken[7].toString();
                    const ERC20 = ERC20Factory.at(tokenAddress);
                    const W12TokenLedger = W12TokenLedgerFactory.at(ledgerAddress);

                    if (!crowdsaleAddress || parseInt(crowdsaleAddress, 16) === 0) {
                        crowdsaleAddress = null;
                    }

                    const W12Crowdsale = crowdsaleAddress
                        ? W12CrowdsaleFactory.at(crowdsaleAddress)
                        : null;

                    return {
                        token: {
                            index: tokenIndex,
                            ledgerAddress,
                            name,
                            symbol,
                            tokenAddress,
                            tokenOwner,
                            decimals,
                            feePercent,
                            feeETHPercent,
                            crowdsaleAddress,
                            tokensForSaleAmount,
                            wTokensIssuedAmount,
                            listedToken
                        },
                        links: {
                            ERC20Instance: ERC20,
                            W12TokenLedgerInstance: W12TokenLedger,
                            W12CrowdsaleInstance: W12Crowdsale
                        }
                    }
                }
            }
        }
    }

    async fetchAllApprovedTokensByEvents() {
        const filter = this.events.OwnerWhitelisted(null, {
            fromBlock: 0
        });
        const getRecords = promisify(filter.get.bind(filter));

        const records = await getRecords();
        const list = [];

        for (let idx in records) {
            const record = records[idx];
            const {
                name,
                symbol,
                tokenAddress,
                tokenOwner
            } = record.args;

            list.push({
                name,
                symbol,
                tokenAddress,
                tokenOwner
            });
        }

        return list;
    }

    async fetchAllTokensComposedInformation() {
        const list = await this.fetchAllApprovedTokensByEvents();
        const result = [];

        for (let item of list) {
            const composedInfo = await this.fetchComposedTokenInformationByTokenAddress(item.tokenAddress);

            result.push(composedInfo);
        }

        return result;
    }

    async isTokenWhitelisted(tokenAddress) {
        if (tokenAddress) {
            try {
                const tokenIndex = (await this.methods.approvedTokensIndex(tokenAddress)).toNumber();
                return tokenIndex > 0;
            } catch (e) {
                console.log(e);
            }
        }

        return false;
    }
}
