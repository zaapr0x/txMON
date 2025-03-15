import { ethers } from "ethers";
import { wallet } from "../../src/config/wallet.js";
import { provider } from "../../src/config/network.js";
import fs from "fs";
import ora from "ora";
import "dotenv/config";

const ABI = JSON.parse(fs.readFileSync("./src/abi/kintsu.json", "utf-8"));
const contract = new ethers.Contract(ABI.contract, ABI.abi, wallet);

const kintsu = async () => {
  try {
    const address = await wallet.getAddress();
    const nonce = await provider.getTransactionCount(address);
    const chainId = (await provider.getNetwork()).chainId;
    const gasPrice = await provider.getFeeData();

    const amount = ethers.parseUnits("0.1", "ether"); // 0.1
    const spinner = ora("⏳ Interacting with Aprio Smart Contract...").start();

    // Estimasi Gas
    const estimatedGas = await contract.stake.estimateGas({
      from: address,
      value: amount,
    });

    // Bangun transaksi
    const tx = await contract.stake({
      from: address,
      value: amount,
      gasLimit: Math.floor(Number(estimatedGas) * 1.2), // Naikkan 20%
      gasPrice: gasPrice.gasPrice, // Ambil gas price dari provider
      nonce,
      chainId,
    });

    spinner.text = "⏳ Waiting for transaction confirmation...";
    await tx.wait();

    spinner.succeed(`[ kintsu ] Methods:stake 0.1 MON! Tx Hash: ${tx.hash}`);
  } catch (error) {
    console.error(`❌ Transaction failed: ${error.message}`);
  }
};
export { kintsu };
