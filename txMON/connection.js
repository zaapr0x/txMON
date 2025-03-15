const { Web3 } = require("web3");
const chalk = require("chalk");
const ora = require("ora");
require("dotenv").config();
const { daaps } = require("./dapps_list");
const RPC_URL = "https://testnet-rpc.monad.xyz";
let web3;
let SIGNER;
try {
  web3 = new Web3(RPC_URL);
  SIGNER = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
  web3.eth.accounts.wallet.add(SIGNER);
} catch (error) {
  console.error(chalk.red("Failed to connect to RPC"));
  process.exit(1);
}

const banner = chalk.hex("#7400ff")(/* Banner Content */ `
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

console.log(banner);
const checkPrivateKey = async () => {
  console.log(`${chalk.yellow("!")} Checking Private Key...`);
  const spinner = ora("Validating Private Key...").start();

  try {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE_KEY not found in .env file");

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const [balance, txCount] = await Promise.all([
      web3.eth.getBalance(account.address),
      web3.eth.getTransactionCount(account.address),
    ]);

    console.log(`\n⊚ Address: ${account.address}`);
    console.log(`⊚ Balance: ${web3.utils.fromWei(balance, "ether")} MON`);
    console.log(`⊚ TX Count: ${txCount}`);

    spinner.succeed("Private Key is valid ✅\n");
  } catch (error) {
    spinner.fail(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { web3, checkPrivateKey, SIGNER };
