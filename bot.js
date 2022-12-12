const ethers = require('ethers');
require("dotenv").config();

// CONNECT TO BLOCKCHAIN
const matic_provider = process.env.PROVIDER_MATIC;
const bsc_provider = process.env.PROVIDER_BSC;
const key = process.env.PRIVATE_KEY;

// BRIDGE SMART CONTRACTS
const bscAddress = process.env.BSC_SC;
const maticAddress = process.env.POLYGON_SC;

// TOKEN ADDRESSES
const tokenBsc = process.env.TOKEN_BSC;
const tokenMatic = process.env.TOKEN_MATIC;

// ABI
const bscAbi = require('./JSON/BSC.json');
const maticAbi = require('./JSON/MATIC.json');

const tokenAbi = require('./JSON/TOKEN.json');

// THE MAIN FUNCTION
const main = async () => {

// CONNECT TO BSC HOT WALLET
console.log("Connecting to BSC TESTNET...");
const bscProvider = new ethers.providers.JsonRpcProvider(bsc_provider);
const bscWallet = new ethers.Wallet(String(key), bscProvider);
console.log("Connected! \n");

console.log("Connecting to MATIC TESTNET...");
const maticProvider = new ethers.providers.JsonRpcProvider(matic_provider);
const maticWallet = new ethers.Wallet(String(key), maticProvider);
console.log("Connected! \n");

// CONNECT TO THE BRIDGE SMART CONTRACT ON EACH NETWORK
console.log("Connecting to BSC BRIDGE SMART CONTRACT...");
let bscBridge = new ethers.Contract(bscAddress, bscAbi, bscWallet);
console.log("Connected! \n");

console.log("Connecting to MATIC SMART CONTRACT...");
let maticBridge = new ethers.Contract(maticAddress, maticAbi, maticWallet);
console.log("Connected! \n");

// CONNECT TO THE TOKEN SMART CONTRACT ON EACH NETWORK
console.log("Connecting to BSC TOKEN SMART CONTRACT...");
let bscToken = new ethers.Contract(tokenBsc, tokenAbi, bscWallet);
console.log("Connected! \n");

console.log("Connecting to MATIC TOKEN SMART CONTRACT...");
let maticToken = new ethers.Contract(tokenMatic, tokenAbi, maticWallet);
console.log("Connected! \n");

// SEND TOKENS FROM BSC BRIDGE
const sendTokensFromBsc = async (address, amount) => {
    try {
        console.log("Sending from BSC bridge...");
        console.log("To: " + address);
        console.log("Amount: " + amount);

        // Estimate gas limit
        let gasLimit = await bscBridge.estimateGas.sendTokens(address, amount, {from: bscWallet.address});

        let tx = await bscBridge.sendTokens(address, amount, {from: bsc.address, gasLimit: gasLimit.toString()});

        tx.wait();

        console.log("Sent!");

    } catch (error) {
        console.log("Error: " + error);
    }
}

// SEND TOKENS FROM MATIC BRIDGE
const sendTokensFromMatic = async (address, amount) => {
    try {
        console.log("Sending from MATIC bridge...");
        console.log("To: " + address);
        console.log("Amount: " + amount);

        // Estimate gas limit
        let gasLimit = await maticBridge.estimateGas.sendTokens(address, amount, {from: maticWallet.address});

        let tx = await maticBridge.sendTokens(address, amount, {from: maticWallet.address, gasLimit: gasLimit.toString()});

        tx.wait();

        console.log("Sent!");

    } catch (error) {
        console.log("Error: " + error);
    }
}

// LISTEN FOR TRANSFER EVENTS ON BSC
bscToken.on("Transfer", (from, to, value) => {
    let info = {
      from: from,
      to: to,
      value: value,
    };

    if(String(to) === bscAddress) {
        try {
            sendTokensFromBsc(String(info.from), String(info.value));
        } catch (error) {
            console.log("Error on transfer from bsc bridge: " + error);
        }
    }
  });

// LISTEN FOR TRANSFER EVENTS ON MATIC
maticToken.on("Transfer", (from, to, value) => {
    let info = {
      from: from,
      to: to,
      value: value,
    };

    if(String(to) === maticAddress) {
        try {
            sendTokensFromMatic(String(info.from), String(info.value));
        } catch (error) {
            console.log("Error on transfer from bsc bridge: " + error);
        }
    }
  });

} 

main();