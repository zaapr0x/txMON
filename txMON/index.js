const { web3 } = require("./connection");
require("dotenv").config();
const chalk = require("chalk");
const prompt = require("prompt-sync")();

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY tidak ditemukan dalam .env file");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

/**
 * Menampilkan informasi kontrak
 */
const displayContractInfo = (contract, website, category) => {
  console.log(`${"=".repeat(30)}`);
  console.log(
    `Contract: ${contract}\nWebsite: ${website}\nCategory: ${category}`
  );
  console.log(`${"=".repeat(30)}`);
};

/**
 * Mengestimasi gas transaksi
 */
const estimateGas = async (contract, method, params, value = "0") => {
  return await contract.methods[method](...params).estimateGas({
    from: account.address,
    value,
  });
};

/**
 * Mengirim transaksi ke blockchain
 */
const sendTransaction = async (contract, method, params, value = "0") => {
  const nonce = await web3.eth.getTransactionCount(account.address);
  const chainId = await web3.eth.getChainId();
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = await estimateGas(contract, method, params, value);

  console.log(chalk.yellow(`[!] Estimated Gas: ${gasLimit}`));

  return await contract.methods[method](...params).send({
    from: account.address,
    value,
    nonce,
    chainId,
    gas: gasLimit,
    gasPrice,
  });
};

/**
 * Stake token pada platform tertentu
 */
const stakeToken = async (contractPath, website, category) => {
  const ABI = require(`../src/abi/${contractPath}.json`);
  const contract = new web3.eth.Contract(ABI.abi, ABI.contract);

  displayContractInfo(ABI.contract, website, category);
  console.log(chalk.yellow("[!] Starting Staking Transaction..."));

  try {
    const amount = web3.utils.toWei("0.01", "ether");

    console.log(chalk.yellow("[!] Stake 0.01 MON"));
    const sendTX = await sendTransaction(
      contract,
      "deposit",
      [amount, account.address],
      amount
    );

    console.log(chalk.green("[✔] Stake 0.01 Successful!"));
    console.log(chalk.yellow("[!] Transaction Hash:", sendTX.transactionHash));
    console.log(`${"=".repeat(30)}`);
  } catch (error) {
    console.error(chalk.red("[!] Staking Failed!"), error);
  }
};

/**
 * Swap token pada Monadex
 */
const monadex = async () => {
  const ABI = require("../src/abi/monadex.json");
  const contract = new web3.eth.Contract(ABI.abi, ABI.contract);
  const amount = web3.utils.toWei("0.01", "ether");

  displayContractInfo(ABI.contract, "https://app.monadex.exchange", "DEX");

  for (const pair of ABI.pair) {
    try {
      console.log(chalk.yellow(`[!] Swap 0.01 MON to ${pair.ticker}`));

      const amountOutMin = web3.utils.toWei("0.1", "ether");
      const path = ["0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701", pair.CA];
      const receiver = account.address;
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

      const raffle = {
        enter: false,
        fractionOfSwapAmount: { numerator: 1, denominator: 100 },
        raffleNftReceiver: account.address,
      };

      const sendTX = await sendTransaction(
        contract,
        "swapExactNativeForTokens",
        [amountOutMin, path, receiver, deadline, raffle],
        amount
      );

      console.log(chalk.green("[✔] Swap Successful!"));
      console.log(
        chalk.yellow("[!] Transaction Hash:", sendTX.transactionHash)
      );
      console.log(`${"=".repeat(30)}`);

      await sleep(3000); // Jeda 3 detik sebelum swap berikutnya
    } catch (error) {
      console.error(chalk.red("[!] Swap Failed!"), error);
    }
  }
};

/**
 * Menampilkan balance akun
 */
const balance = async () => {
  console.log(`Address: ${account.address}`);
  const balance = await web3.eth.getBalance(account.address);
  console.log(`Balance: ${web3.utils.fromWei(balance, "ether")} MON`);
  const nonce = await web3.eth.getTransactionCount(account.address);
  console.log(`TX Count: ${nonce}`);
};

/**
 * Banner aplikasi
 */
const banner = chalk.hex("#7400ff")(`
    '########:'##::::'##:'##::::'##::'#######::'##::: ##:
    ... ##..::. ##::'##:: ###::'###:'##.... ##: ###:: ##:
    ::: ##:::::. ##'##::: ####'####: ##:::: ##: ####: ##: 
    ::: ##::::::. ###:::: ## ### ##: ##:::: ##: ## ## ##: 
    ::: ##:::::: ## ##::: ##. #: ##: ##:::: ##: ##. ####: 
    ::: ##::::: ##:. ##:: ##:.:: ##: ##:::: ##: ##:. ###:
    ::: ##:::: ##:::. ##: ##:::: ##:. #######:: ##::. ##:
    :::..:::::..:::::..::..:::::..:::.......:::..::::..::
    
    txMon - Automated script for interacting with Monad dApps smart contracts
    Github: https://github.com/zaapr0x/txMON
    Version: 1.0
`);

/**
 * Menjalankan semua transaksi utama
 */
async function main() {
  await monadex();
  await stakeToken("aprio", "https://stake.apr.io/", "Staking");
  await stakeToken("shmond", "https://www.shmonad.xyz/", "Staking");
}

// Menjalankan script
console.log(banner);
balance();

console.log(`
    ==================
    Your Stats
    ==================\n[1] Start Scripts  
[2] List Supported Dapps
[3] Exit`);

const choice = prompt("Input: ");

switch (choice) {
  case "1":
    main();
    break;
  case "2":
    console.log(`
    LSD:
    - https://stake.apr.io
    - https://shmond.xyz
    DEX:
    - https://app.monadex.exchange
    More? Coming Soon`);
    break;
  default:
    console.log("Exiting...");
}
