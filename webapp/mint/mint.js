/* globals Chart:false, feather:false */

import { LoopringAPIClass, signatureKeyPairMock, getNftFactory } from "./loopring";
import * as sdk from '@loopring-web/loopring-sdk';
const Eth = require('web3-eth');
const LoopringProvider = require('@loopring-web/web3-provider');
const api = new LoopringAPIClass();
const lrp = new LoopringProvider.ConnectProvides();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const postId = urlParams.get("postId");

function addMintStatusText(text, progressPct) {
  const p = document.createElement('p');
  p.innerText = text;
  document.getElementById('mintProgressStatus').prepend(p);
  document.getElementById('mintProgressBar').style.width = progressPct + '%';
  if (text.includes('Fee:')) {
    p.classList.add('text-success');
  }
}

function mintError(text) {
  const p = document.createElement('p');
  p.innerText = text;
  p.classList.add('text-danger');
  document.getElementById('mintProgressStatus').prepend(p);
  document.getElementById('mintProgressBar').classList.remove('bg-success', 'progress-bar-striped');
  document.getElementById('mintProgressBar').classList.add('bg-danger');
  document.getElementById('mintProgressBar').style.width = '100%';

  const back = document.createElement('p');
  back.classList.add('text-warning');
  back.innerText = "Use your browser's refresh button to try again.";
  document.getElementById('mintProgressStatus').prepend(back);
  document.getElementById('mintModalCloseBtn').classList.remove('d-none');
}

async function mint() {
  document.getElementById('mintProgressModal').style.display = "block";
  document.getElementById('mintProgressModal').classList.add("show");

  addMintStatusText('Waiting for user to approve access to Loopring through Gamestop Wallet...', 10);
  const _web3 = lrp.usedWeb3;
  let accInfo = await api.exchangeAPI.getAccount({ owner: lrp.usedProvide.currentAddress });
  accInfo = accInfo['accInfo'];
  const eddsaKey = await signatureKeyPairMock(accInfo, _web3).catch((error) => {
    mintError("Signature not accepted by wallet.");
    return null;
  });
  if (eddsaKey === null) { return; }

  addMintStatusText('Generating NFT Metadata', 15);
  addMintStatusText('Uploading NFT Metadata to the Interplanetary File System', 15);
  addMintStatusText('Uploading Image to the Interplanetary File System', 20);
  const ipfsUrl = `https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/ipfs?redditBearer=${localStorage.getItem('redditBearer')}&postId=${postId}`;
  const ipfsHash = await fetch(ipfsUrl, {
    mode: 'cors',
    method: 'POST'
  }).then(async function (response) {
    const resJson = await response.json();
    return resJson['IpfsHash'];
  }).catch((error) => {
    mintError(error);
    return null;
  });
  if (ipfsHash === null) { return; }

  addMintStatusText('Requesting Loopring API Key', 30);
  const apiKey = await api.userAPI.getUserApiKey(
    {
      accountId: accInfo.accountId,
    },
    eddsaKey.sk
  ).catch((error) => {
    mintError(error);
    return null;
  });
  if (apiKey === null) { return; }

  addMintStatusText('Getting NFT token address', 40);
  const counterFactualNftInfo = {
    nftOwner: accInfo.owner,
    nftFactory: getNftFactory(),
    nftBaseUri: "",
  };
  const nftTokenAddress = api.nftAPI.computeNFTAddress(counterFactualNftInfo).tokenAddress.toLowerCase();

  addMintStatusText('Checking Fees...', 50);

  // Check if already paid computershared fees
  const nftUrl = `https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/nft/${postId}`;
  const hasPaid = await fetch(nftUrl, {
    mode: 'cors'
  }).then(async function (response) {
    const resJson = await response.json();
    return resJson['Count'] > 0;
  }).catch((error) => {
    mintError(error);
    return null;
  });
  if (hasPaid === null) { return; }

  const transferFee = await api.userAPI.getOffchainFeeAmt({
    accountId: accInfo.accountId,
    requestType: sdk.OffchainFeeReqType.TRANSFER,
  }, apiKey.apiKey).catch((error) => {
    mintError(error);
    return null;
  });
  if (transferFee === null) { return; }

  const mintingFee = await api.userAPI.getNFTOffchainFeeAmt(
    {
      accountId: accInfo.accountId,
      tokenAddress: nftTokenAddress,
      requestType: 9,
      amount: "0"
    },
    apiKey.apiKey
  ).catch((error) => {
    mintError(error);
    return null;
  });
  if (mintingFee === null) { return; }

  const mintFeeMsg = `Loopring Fee: ${Number(BigInt(mintingFee.fees.LRC.fee) / 10000000000000000n) / 100}LRC`
  const trnsfrFeeMsg = `Computershared Fee: ${Number((BigInt(transferFee.fees.LRC.fee) + BigInt(4000000000000000000n)) / 10000000000000000n) / 100}LRC`
  const trnsfrPaidMsg = `Computershared Fee: ALREADY PAID!`
  addMintStatusText(mintFeeMsg, 55);
  addMintStatusText(hasPaid ? trnsfrPaidMsg : trnsfrFeeMsg, 55);
  addMintStatusText('Protip: Save coin by minting in the off-hours', 60);

  addMintStatusText('Getting Storage ID', 60);
  const storageId = await api.userAPI.getNextStorageId(
    {
      accountId: accInfo.accountId,
      sellTokenId: 1,
      maxNext: true
    },
    apiKey.apiKey
    ).catch((error) => {
      mintError(error);
      return null;
    });
    if (storageId === null) { return; }
    
  addMintStatusText('Getting Exchange ID', 70);
  const exchange = await api.exchangeAPI.getExchangeInfo();

  // Get Paid 
  if (!hasPaid) {
    const transferRequest = {
      request: {
        exchange: exchange.exchangeInfo.exchangeAddress,
        payerAddr: accInfo.owner,
        payerId: accInfo.accountId,
        payeeAddr: "0x232352331bd4e60c9b31a6ce834efec104444060",
        payeeId: 0,
        storageId: storageId.offchainId,
        token: {
          tokenId: 1,
          volume: "4000000000000000000",
        },
        maxFee: {
          tokenId: 1,
          volume: transferFee.fees["LRC"].fee,
        },
        memo: postId,
        validUntil: Math.trunc((Date.now() + (3600 * 1000 * 24 * 28)) / 1000),
      },
      web3: _web3,
      chainId: 1,
      walletType: "GameStop",
      eddsaKey: eddsaKey.sk,
      apiKey: apiKey.apiKey,
    }
  
    addMintStatusText('Waiting for user to approve computershared fees...', 80);
    const transferResult = await api.userAPI.submitInternalTransfer(transferRequest).catch((error) => {
      mintError("Signature not accepted by wallet.");
      return null;
    });
    if (transferResult === null) { return; }
    console.log(transferResult);
    if (transferResult.message){
      mintError(`Minting NFT Failed: ${transferResult.message}`);
      return;
    }

    const nftPaymentUrl = `https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/nft?postId=${postId}&amount=4&token=LRC&redditBearer=${localStorage.getItem("redditBearer")}`;
    const nftPaymentRecordedStatus = await fetch(nftPaymentUrl, {
      mode: 'cors',
      method: 'POST'
    }).then(async function (response) {
      const resJson = await response.json();
      return resJson['status'];
    }).catch((error) => {
      mintError(error);
      return null;
    });
    if (nftPaymentRecordedStatus === null) { return; }
    if (nftPaymentRecordedStatus !== "Entered") {
      mintError("Failed to record payment even though it looks to have gone through. Please contact u/jonpro03");
      addMintStatusText('Proceeding with NFT Mint', 85);
    }
  }

  // Mint NFT
  const nftStorageId = await api.userAPI.getNextStorageId(
    {
      accountId: accInfo.accountId,
      sellTokenId: 1,
      maxNext: true
    },
    apiKey.apiKey
    ).catch((error) => {
      mintError(error);
      return null;
    });
    if (storageId === null) { return; }

  const mintRequest = {
    request: {
      exchange: exchange.exchangeInfo.exchangeAddress,
      minterId: accInfo.accountId,
      minterAddress: accInfo.owner,
      toAccountId: accInfo.accountId,
      toAddress: accInfo.owner,
      nftType: 0,
      tokenAddress: nftTokenAddress,
      nftId: api.nftAPI.ipfsCid0ToNftID(ipfsHash),
      amount: "1",
      validUntil: Math.trunc((Date.now() + (3600 * 1000 * 24 * 28)) / 1000),
      storageId: nftStorageId.offchainId,
      maxFee: {
        tokenId: 1,
        amount: mintingFee.fees["LRC"].fee,
      },
      royaltyPercentage: 0,
      counterFactualNftInfo: counterFactualNftInfo,
      forceToMint: false,
    },
    web3: _web3,
    chainId: sdk.ChainId.MAINNET,
    walletType: "GameStop",
    eddsaKey: eddsaKey.sk,
    apiKey: apiKey.apiKey,
  };

  addMintStatusText('Waiting for user to approve Loopring fees...', 90);
  const mintResult = await api.userAPI.submitNFTMint(mintRequest).catch((error) => {
    mintError("Signature not accepted by wallet.");
    return null;
  });
  if (mintResult === null) { return; }
  console.log(mintResult);
  if (mintResult.message){
    mintError(`Minting NFT Failed: ${mintResult.message}`);
    return;
  }
  addMintStatusText('NFT Mint Submitted! The NFT will be added to your wallet soon', 100);
  document.getElementById('mintProgressBar').classList.remove('progress-bar-striped');
  document.getElementById('mintModalCloseBtn').classList.remove('d-none');
}

async function connectWallet() {
  document.getElementById('connectWalletBtnText').textContent = " Authorizing...";
  document.getElementById('connectWalletBtn').setAttribute('disabled', null);
  await lrp.GameStop();

  let accInfo = await api.exchangeAPI.getAccount({ owner: lrp.usedProvide.currentAddress });
  localStorage.setItem("EthAccount", accInfo['owner']);
  localStorage.setItem("EthAcctId", accInfo['accountId']);
  document.getElementById('connectWalletBtnText').textContent = " Connected";
  document.getElementById('connectWalletBtn').setAttribute('disabled', null);
  document.getElementById('mintBtn').removeAttribute('disabled');
  document.getElementById('postsContainer').classList.remove('d-none');
};

async function getUserFromReddit() {
  const meUrl = "https://oauth.reddit.com/api/v1/me";
  const headers = {
    "Authorization": "bearer " + localStorage.getItem("redditBearer")
  };
  var name = await fetch(meUrl, {
    mode: 'cors',
    headers: headers
  }).then(async function (response) {
    const resJson = await response.json();
    localStorage.setItem('redditUser', resJson['name']);
    return resJson['name'];
  }).catch((error) => window.location.href = "../");

  return name;
}

(async function () {
  'use strict'
  feather.replace({ 'aria-hidden': 'true' })

  localStorage.removeItem('redditUser');
  const ape = await getUserFromReddit();
  if (localStorage.getItem('redditUser') === null) {
    window.location.href = "../";
  }

  document.getElementById('usernameTitle').innerHTML = "Welcome " + ape + "!";
  localStorage.setItem('isGamestopWallet', false);

  var userData = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/posts/" + ape, {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  var post = null;
  for (const p of userData.Items) {
    if (p['id']['S'] === postId) {
      post = p;
      break;
    }
  }

  let sadApes = ["sadape.jpg", "sadape2.jpg", "sadape3.jpg", "sadape4.jpg"]
  let postsDiv = document.createElement('div');
  postsDiv.classList.add("row");
  let randApeImg = sadApes[Math.floor(Math.random() * 4)];
  let imgFile = post.image_path.S.split('/').slice(-1)[0];
  const docTemplate = document.getElementById("postTemplate");
  const postDiv = document.importNode(docTemplate.content, true);
  imgFile = imgFile === "" ? randApeImg : imgFile;
  postDiv.querySelector('.postImage').src = "https://s3-us-west-2.amazonaws.com/computershared-reddit-images/" + imgFile;
  document.getElementById('modalImg').src = "https://s3-us-west-2.amazonaws.com/computershared-reddit-images/" + imgFile;
  postsDiv.appendChild(postDiv);
  document.getElementById('postsContainer').appendChild(postsDiv);

  document.getElementById('mintBtn').onclick = mint;

})()

document.addEventListener('DOMContentLoaded', async function () {
  setTimeout(function () {
    if (window.ethereum) {
      if (window.ethereum.isGamestop) {
        localStorage.setItem('isGamestopWallet', true);
        document.getElementById('connectWalletBtn').removeAttribute('disabled');
        document.getElementById('connectWalletBtn').classList.remove('btn-outline-secondary');
        document.getElementById('connectWalletBtn').classList.add('btn-success');
        document.getElementById('connectWalletBtnText').textContent = " Connect";
      } else {
        document.getElementById('connectWalletBtnText').textContent = " Incompatible";
        document.getElementById('incompatModal').style.display = "block";
        document.getElementById('incompatModal').classList.add("show");
      }
    } else {
      document.getElementById('connectWalletBtnText').textContent = " Not Found";
      document.getElementById('incompatModal').style.display = "block";
      document.getElementById('incompatModal').classList.add("show");
    }
  }, 500)
})

document.getElementById('connectWalletBtn').onclick = connectWallet;
document.getElementById('mintModalCloseBtn').onclick = (() => { window.location.href="../profile/"; });
