const { web3, SIGNER } = require("../connection");
const ora = require("ora");

const monadex = async () => {
  const ABI = require("../../src/abi/monadex.json");
  const contract = new web3.eth.Contract(ABI.abi, ABI.contract);
  const chainId = await web3.eth.getChainId();
  const SwapEstimation = getSwapEstimation();
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
  const nonce = await web3.eth.getTransactionCount(SIGNER.address);
  const gasPrice = await web3.eth.getGasPrice();
  const raffle = {
    enter: false,
    fractionOfSwapAmount: { numerator: 1, denominator: 100 },
    raffleNftReceiver: SIGNER.address,
  };

  const tx = {
    from: SIGNER.address,
    value: SwapEstimation[0],
    nonce,
    chainId,
    gasPrice,
  };
  tx.gas = await web3.eth.estimateGas(tx);
  tx.gas = BigInt(Math.floor(Number(tx.gas) * 1.2));
  const swap = ora(`Swap 0.01 MON To MDX`).start();
  const sendTx = await contract.methods
    .swapExactNativeForTokens(
      SwapEstimation[1],
      [
        "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
        "0xD8C603A0Fe45c77f13FAF626C04fE69EEB628196",
      ],
      SIGNER.address,
      deadline,
      raffle
    )
    .send(tx);
  swap.succeed(
    `Swap Method: Swap 0.01 MON To MDX, Transaction Hash: ${sendTx.transactionHash}`
  );
};
const getSwapEstimation = async () => {
  const ABI = require("../../src/abi/monadex.json");
  const contract = new web3.eth.Contract(ABI.abi, ABI.contract);
  const amount = web3.utils.toWei("0.01", "ether");
  const swapFROM = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701";
  const result = await contract.methods
    .getAmountsOut(amount, [
      "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
      "0xD8C603A0Fe45c77f13FAF626C04fE69EEB628196",
    ])
    .call();
  console.log(result);
  return result;
};
