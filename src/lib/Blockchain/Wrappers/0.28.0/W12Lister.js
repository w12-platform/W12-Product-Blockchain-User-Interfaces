import { BaseWrapper } from 'src/lib/Blockchain/Wrappers/NoVersion/BaseWrapper.js';
import { decode } from '@redtea/semint';
import Web3 from 'web3';

const web3 = new Web3();
const BigNumber = web3.BigNumber;

export class W12ListerWrapper extends BaseWrapper {
    constructor(contractArtifacts, instance) {
        super(contractArtifacts, instance);

        this.W12CrowdsaleFactory = null;
    }

    setFactories({
        W12CrowdsaleFactory,
        ERC20Factory,
        ERC20DetailedFactory,
        TokenExchangerFactory,
    }) {
        this.W12CrowdsaleFactory = W12CrowdsaleFactory;
        this.ERC20Factory = ERC20Factory;
        this.TokenExchangerFactory = TokenExchangerFactory;
        this.ERC20DetailedFactory = ERC20DetailedFactory;
    }

    // TODO: should get by token address not index
    async fetchComposedTokenInformationByTokenAddress(Token){
        const {TokenExchangerFactory} = this;

        const ledgerAddress = await this.methods.getExchanger();
        const TokenExchanger = TokenExchangerFactory.at(ledgerAddress);
        const listedToken = (await this.methods.approvedTokens(Token.index));
        const wTokenAddress = await TokenExchanger.methods.getWTokenByToken(listedToken[10].toString());
        return {
            version: decode(parseInt(await new BigNumber(await this.methods.version()).toString()), 4),
            listerAddress: this.instance.address,
            index: Token.index,
            ledgerAddress,
            wTokenAddress,
            name: listedToken[0].toString(),
            symbol: listedToken[1].toString(),
            tokenAddress: listedToken[10].toString(),
            decimals: listedToken[2].toString(),
            feePercent: listedToken[3].toString(),
            feeETHPercent: listedToken[4].toString(),
            WTokenSaleFeePercent: listedToken[5].toString(),
            trancheFeePercent: listedToken[6].toString(),
            crowdsaleAddress: listedToken[7].toString(),
            tokensForSaleAmount: listedToken[8].toString(),
            wTokensIssuedAmount: listedToken[9].toString(),
            tokenOwners: (await this.methods.getTokenOwners(listedToken[10])),
        };
    }

    async fetchAllTokensInWhiteList() {
        const {TokenExchangerFactory} = this;

        const ledgerAddress = await this.methods.getExchanger();
        const TokenExchanger = TokenExchangerFactory.at(ledgerAddress);
        let list = [];
        let uniqTokenAddress = [];
        const length = (await this.methods.approvedTokensLength());
        for(let i = 1; i <= length; i++){
            const listedToken = (await this.methods.approvedTokens(i));
            const wTokenAddress = await TokenExchanger.methods.getWTokenByToken(listedToken[10].toString());
            const tokenAddress = listedToken[10].toString();
            if(uniqTokenAddress.indexOf(tokenAddress) === -1){
                uniqTokenAddress.push(tokenAddress);
                list.push({
                    version: decode(parseInt(await new BigNumber(await this.methods.version()).toString()), 4),
                    listerAddress: this.instance.address,
                    index: i,
                    ledgerAddress,
                    wTokenAddress,
                    name: listedToken[0].toString(),
                    symbol: listedToken[1].toString(),
                    tokenAddress,
                    decimals: listedToken[2].toString(),
                    feePercent: listedToken[3].toString(),
                    feeETHPercent: listedToken[4].toString(),
                    WTokenSaleFeePercent: listedToken[5].toString(),
                    trancheFeePercent: listedToken[6].toString(),
                    crowdsaleAddress: listedToken[7].toString(),
                    tokensForSaleAmount: listedToken[8].toString(),
                    wTokensIssuedAmount: listedToken[9].toString(),
                    tokenOwners: (await this.methods.getTokenOwners(listedToken[10])),
                });
            }
        }
        return list;
    }

    async fetchAllTokensComposedInformation() {
        const list = await this.fetchAllTokensInWhiteList();
        const result = [];
        const RecentAddresses = [];

        for (let item of list) {
            if(RecentAddresses.indexOf(item.tokenAddress) === -1){
                RecentAddresses.push(item.tokenAddress);
                result.push(item);
            }
        }

        return result;
    }

    async swap(){
        return await this.methods.getExchanger();
    }
}
