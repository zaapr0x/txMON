const { web3 } = require("./connection");
require("dotenv").config();
const chalk = require("chalk");
const prompt = require("prompt-sync")();

// Constants
const DIVIDER = "=".repeat(15);
const DEFAULT_SWAP_AMOUNT = "0.01";
const MONAD_TOKEN_ADDRESS = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701";

// Helper functions
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Load account from private key
function setupAccount() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY tidak ditemukan dalam .env file");
  }

  const account = web3.eth.accounts.privateKeyToAccount(
    process.env.PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(account);
  return account;
}

// Display account balance
async function displayBalance(account) {
  console.log(`Address: ${account.address}`);
  try {
    const balance = await web3.eth.getBalance(account.address);
    console.log(`Balance: ${web3.utils.fromWei(balance, "ether")} MON`);

    const nonce = await web3.eth.getTransactionCount(account.address);
    console.log(`TX Count: ${nonce}`);
  } catch (error) {
    console.error(chalk.red("Error fetching balance:"), error.message);
  }
}

// Load contract ABI and create contract instance
function loadContract(contractPath) {
  try {
    const ABI = require(`../src/abi/${contractPath}.json`);
    return {
      contract: new web3.eth.Contract(ABI.abi, ABI.contract),
      contractAddress: ABI.contract,
      abi: ABI,
    };
  } catch (error) {
    console.error(
      chalk.red(`Error loading contract ${contractPath}:`),
      error.message
    );
    throw error;
  }
}

// Stake tokens in a contract
async function stakeToken(contractPath, website, category) {
  console.log(`\n${DIVIDER}`);

  try {
    const { contract, contractAddress, abi } = loadContract(contractPath);

    console.log(
      `Contract: ${contractAddress}\nWebsite: ${website}\nCategory: ${category}`
    );
    console.log(DIVIDER);
    console.log(chalk.yellow("[!] Starting Transaction, please wait..."));

    const amount = web3.utils.toWei(DEFAULT_SWAP_AMOUNT, "ether");
    const account = web3.eth.accounts.wallet[0];

    // Get transaction parameters
    const [nonce, chainId, gasPrice, gasLimit] = await Promise.all([
      web3.eth.getTransactionCount(account.address),
      web3.eth.getChainId(),
      web3.eth.getGasPrice(),
      contract.methods.deposit(amount, account.address).estimateGas({
        from: account.address,
        value: amount,
      }),
    ]);

    console.log(chalk.yellow(`[!] Stake ${DEFAULT_SWAP_AMOUNT} MON`));

    // Send transaction
    const sendTX = await contract.methods
      .deposit(amount, account.address)
      .send({
        from: account.address,
        value: amount,
        nonce,
        chainId,
        gas: Math.ceil(gasLimit * 1.1), // Add 10% buffer to gas limit
        gasPrice,
      });

    console.log(
      chalk.green(`[✔] Stake ${DEFAULT_SWAP_AMOUNT} MON Successful!`)
    );
    console.log(chalk.yellow("[!] Transaction Hash:", sendTX.transactionHash));
    console.log(DIVIDER);

    return true;
  } catch (error) {
    console.error(chalk.red(`[!] Stake Failed: ${error.message}`));
    return false;
  }
}

// Swap tokens on Monadex
async function monadex() {
  console.log(`\n${DIVIDER}`);

  try {
    const { contract, contractAddress, abi } = loadContract("monadex");

    console.log(
      `Contract: ${contractAddress}\nWebsite: https://app.monadex.exchange\nCategory: DEX`
    );
    console.log(DIVIDER);

    const amount = web3.utils.toWei(DEFAULT_SWAP_AMOUNT, "ether");
    const chainId = await web3.eth.getChainId();
    const gasPrice = await web3.eth.getGasPrice();
    const account = web3.eth.accounts.wallet[0];

    // Process each pair in the ABI
    for (const pair of abi.pair) {
      try {
        console.log(chalk.yellow("[!] Creating Transaction..."));
        console.log(
          chalk.yellow(`[!] Swap ${DEFAULT_SWAP_AMOUNT} MON to ${pair.ticker}`)
        );

        const amountOutMin = web3.utils.toWei("0.1", "ether");
        const path = [MONAD_TOKEN_ADDRESS, pair.CA];
        const receiver = account.address;
        const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes

        const raffle = {
          enter: false,
          fractionOfSwapAmount: { numerator: 1, denominator: 100 },
          raffleNftReceiver: account.address,
        };

        // Get fresh nonce for each transaction
        const nonce = await web3.eth.getTransactionCount(account.address);

        // Estimate gas
        const gasLimit = await contract.methods
          .swapExactNativeForTokens(
            amountOutMin,
            path,
            receiver,
            deadline,
            raffle
          )
          .estimateGas({ from: account.address, value: amount });

        console.log(chalk.yellow(`[!] Estimated Gas: ${gasLimit}`));

        // Send transaction
        const sendTX = await contract.methods
          .swapExactNativeForTokens(
            amountOutMin,
            path,
            receiver,
            deadline,
            raffle
          )
          .send({
            from: account.address,
            value: amount,
            nonce,
            chainId,
            gas: Math.ceil(gasLimit * 1.1), // Add 10% buffer
            gasPrice,
          });

        console.log(chalk.green("[✔] Swap Successful!"));
        console.log(
          chalk.yellow("[!] Transaction Hash:", sendTX.transactionHash)
        );
        console.log(DIVIDER);

        // Wait between transactions
        await sleep(3000);
      } catch (error) {
        console.error(
          chalk.red(`[!] Swap Failed for ${pair.ticker}: ${error.message}`)
        );
        // Continue with next pair even if one fails
        await sleep(1000);
      }
    }
    return true;
  } catch (error) {
    console.error(chalk.red("Monadex error:"), error.message);
    return false;
  }
}

// Display banner
function displayBanner() {
  const banner = chalk.hex("#7400ff")(`
    '########:'##::::'##:'##::::'##::'#######::'##::: ##:
    ... ##..::. ##::'##:: ###::'###:'##.... ##: ###:: ##:
    ::: ##:::::. ##'##::: ####'####: ##:::: ##: ####: ##: 
    ::: ##::::::. ###:::: ## ### ##: ##:::: ##: ## ## ##: 
    ::: ##:::::: ## ##::: ##. #: ##: ##:::: ##: ##. ####: 
    ::: ##::::: ##:. ##:: ##:.:: ##: ##:::: ##: ##:. ###:
    ::: ##:::: ##:::. ##: ##:::: ##:. #######:: ##::. ##:
    :::..:::::..:::::..::..:::::..:::.......:::..::::..::
    
    txMon an automated script for interacting with monad dapps smart contracts
    Github: https://github.com/zaapr0x/txMON
    Version: 1.1
    `);
  console.log(banner);
}

// List supported dapps
function listSupportedDapps() {
  console.log(`
\nSupported DApps:
${DIVIDER}
LSD:
 - https://stake.apr.io
 - https://shmond.xyz
DEX:
 - https://app.monadex.exchange

More? Coming Soon
  `);
}

// Main function to execute transactions
async function main() {
  try {
    // Run monadex swaps
    await monadex();

    // Run staking operations
    await stakeToken("aprio", "https://stake.apr.io/", "Staking");
    await stakeToken("shmond", "https://www.shmonad.xyz/", "Staking");

    console.log(chalk.green("\n[✔] All operations completed!"));
  } catch (error) {
    console.error(chalk.red("\n[!] Error in main execution:"), error.message);
  }
}

// Menu system
async function showMenu() {
  const account = setupAccount();

  displayBanner();
  await displayBalance(account);

  console.log(`
${DIVIDER}
Your Options
${DIVIDER}
[1] Start Scripts  
[2] List Supported Dapps
[3] Exit
  `);

  const choice = prompt("Input: ");

  switch (choice) {
    case "1":
      await main();
      break;
    case "2":
      listSupportedDapps();
      break;
    default:
      console.log("Exiting...");
  }
}

// Run the application
(async () => {
  try {
    await showMenu();
  } catch (error) {
    console.error(chalk.red("\nFatal error:"), error.message);
    process.exit(1);
  }
})();
