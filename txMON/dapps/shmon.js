const chalk = require("chalk");
const { web3, SIGNER } = require("../connection");
const ora = require("ora");

const shmonad = async () => {
  const ABI = require(`../../src/abi/shmond.json`);
  const contract = new web3.eth.Contract(ABI.abi, ABI.contract);
  const nonce = await web3.eth.getTransactionCount(SIGNER.address);
  const chainId = await web3.eth.getChainId();
  const gasPrice = await web3.eth.getGasPrice();
  const tx = {
    from: SIGNER.address,
    value: web3.utils.toWei("0.01", "ether"),
    nonce,
    chainId,
    gasPrice,
  };
  const spinner = ora("Interacting with shmonad smart contract").start();
  tx.gas = await web3.eth.estimateGas(tx);
  tx.gas = BigInt(Math.floor(Number(tx.gas) * 1.2));

  const sendTx = await contract.methods
    .deposit(web3.utils.toWei("0.01", "ether"), SIGNER.address)
    .send(tx);

  spinner.succeed(
    `Interact Method: Stake 0.01 MON, Transaction Hash: ${sendTx.transactionHash}`
  );
};

module.exports = { shmonad };
