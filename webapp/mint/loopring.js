import * as sdk from '@loopring-web/loopring-sdk';

export class LoopringAPIClass {
  constructor() {
      const config = {
        baseUrl: "https://api.loopring.network",
        chainId: sdk.ChainId.MAINNET
      };
      this.userAPI = new sdk.UserAPI(config);
      this.exchangeAPI = new sdk.ExchangeAPI(config);
      this.walletAPI = new sdk.WalletAPI(config);
      this.nftAPI = new sdk.NFTAPI(config);
  }
};

export function getNftFactory() {
  return sdk.NFTFactory[sdk.ChainId.MAINNET]
}

export async function signatureKeyPairMock(
    accInfo,
    _web3
  ) {
    const eddsaKey = await sdk.generateKeyPair({
      web3: _web3,
      address: accInfo.owner,
      accountId: accInfo.accountId,
      keySeed:
        accInfo.keySeed ||
        sdk.GlobalAPI.KEY_MESSAGE.replace(
          "${exchangeAddress}",
          "0x0BABA1Ad5bE3a5C0a66E7ac838a129Bf948f1eA4"
        ).replace("${nonce}", (accInfo.nonce - 1).toString()),
      chainId: sdk.ChainId.MAINNET,
    });
    return eddsaKey;
  }