const { web3, SIGNER } = require("../connection");
const ora = require("ora");

const aprio = async () => {
  const ABI = require(`../../src/abi/aprio.json`);
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
  Math.floor(tx.gas * 1.2);
  tx.gas = await web3.eth.estimateGas(tx);
  tx.gas = BigInt(Math.floor(Number(tx.gas) * 1.2));

  const spinner = ora("Interacting with aprio smart contract").start();
  const sendTx = await contract.methods
    .deposit(web3.utils.toWei("0.01", "ether"), SIGNER.address)
    .send(tx);

  spinner.succeed(
    `Interact Method: Stake 0.01 MON, Transaction Hash: ${sendTx.transactionHash}`
  );
};

module.exports = { aprio };
