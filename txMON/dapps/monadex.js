import { ethers } from "ethers";
import { wallet } from "../../src/config/wallet.js";
import { provider } from "../../src/config/network.js";
import fs from "fs";
import ora from "ora";
import "dotenv/config";

// Load ABI
const ABI = JSON.parse(fs.readFileSync("./src/abi/monadex.json", "utf-8"));
const contract = new ethers.Contract(ABI.contract, ABI.abi, wallet);

const getSwapEstimation = async () => {
  try {
    const amount = ethers.parseUnits("0.01", "ether");
    const swapPath = [
      "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
      "0xD8C603A0Fe45c77f13FAF626C04fE69EEB628196",
    ];

    const result = await contract.getAmountsOut(amount, swapPath);
    return result;
  } catch (error) {
    console.error(`❌ Failed to get swap estimation: ${error.message}`);
  }
};

const monadex = async () => {
  try {
    const address = await wallet.getAddress();
    const nonce = await provider.getTransactionCount(address);
    const chainId = (await provider.getNetwork()).chainId;
    const gasPrice = await provider.getFeeData();
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 menit

    const swapEstimation = await getSwapEstimation();
    if (!swapEstimation) throw new Error("❌ Failed to fetch swap estimation");

    const amountIn = swapEstimation[0];
    const amountOutMin = swapEstimation[1];
    const swapPath = [
      "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
      "0xD8C603A0Fe45c77f13FAF626C04fE69EEB628196",
    ];

    const raffle = {
      enter: false,
      fractionOfSwapAmount: { numerator: 1, denominator: 100 },
      raffleNftReceiver: address,
    };

    const spinner = ora("⏳ Swapping 0.01 MON to MDX...").start();

    // Estimasi gas
    const estimatedGas = await contract.swapExactNativeForTokens.estimateGas(
      amountOutMin,
      swapPath,
      address,
      deadline,
      raffle,
      {
        from: address,
        value: amountIn,
      }
    );

    // Kirim transaksi
    const tx = await contract.swapExactNativeForTokens(
      amountOutMin,
      swapPath,
      address,
      deadline,
      raffle,
      {
        from: address,
        value: amountIn,
        gasLimit: Math.floor(Number(estimatedGas) * 1.2), // Tambah 20%
        gasPrice: gasPrice.gasPrice,
        nonce,
        chainId,
      }
    );

    spinner.text = "⏳ Waiting for transaction confirmation...";
    await tx.wait();

    spinner.succeed(`[ Monadex ] Swap 0.01 MON to MDX! Tx Hash: ${tx.hash}`);
  } catch (error) {
    console.error(`❌ Swap failed: ${error.message}`);
  }
};

export { monadex };
