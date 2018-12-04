import { BaseWrapper } from 'src/lib/Blockchain/Wrappers/NoVersion/BaseWrapper.js';
import { decode } from '@redtea/semint';
import Web3 from 'web3';

const web3 = new Web3();
const BigNumber = web3.BigNumber;

export class W12ListerWrapper extends BaseWrapper {
    constructor(contractArtifacts, instance, version) {
        super(contractArtifacts, instance, version);

        this.W12CrowdsaleFactory = null;
    }

    setFactories({
        W12CrowdsaleFactory,
        ERC20Factory,
        DetailedERC20Factory,
        W12TokenLedgerFactory,
    }) {
        this.W12CrowdsaleFactory = W12CrowdsaleFactory;
        this.ERC20Factory = ERC20Factory;
        this.W12TokenLedgerFactory = W12TokenLedgerFactory;
        this.DetailedERC20Factory = DetailedERC20Factory;
    }

    async fetchComposedTokenInformationByTokenAddress(Token){
        const {W12TokenLedgerFactory} = this;
        const ledgerAddress = await this.methods.ledger();
        const W12TokenLedger = W12TokenLedgerFactory.at(ledgerAddress);
        const listedToken = (await this.methods.approvedTokens(Token.index));
        const wTokenAddress = await W12TokenLedger.methods.getWTokenByToken(listedToken[10].toString());
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
        const {W12TokenLedgerFactory} = this;

        const ledgerAddress = await this.methods.ledger();
        const W12TokenLedger = W12TokenLedgerFactory.at(ledgerAddress);
        let list = [];
        const length = (await this.methods.approvedTokensLength()).toNumber();
        for(let i = 1; i <= length; i++){
            const listedToken = (await this.methods.approvedTokens(i));
            const wTokenAddress = await W12TokenLedger.methods.getWTokenByToken(listedToken[10].toString());
            const tokenAddress = listedToken[10].toString();
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
        return list;
    }

    async fetchAllTokensComposedInformation() {
        return await this.fetchAllTokensInWhiteList();
    }

    async swap(){
        return await this.methods.swap();
    }
}
