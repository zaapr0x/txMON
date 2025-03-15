import { Wallet, ethers } from "ethers";
import { provider } from "./network.js";
import "dotenv/config";

// Ambil private key dari .env
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) throw new Error("❌ PRIVATE_KEY is missing in .env");

const wallet = new Wallet(PRIVATE_KEY, provider);

const walletInfo = async () => {
  const address = await wallet.getAddress();
  const balanceWei = await provider.getBalance(address);
  const balanceEth = Number(ethers.formatEther(balanceWei)).toFixed(4); // 4 desimal
  const nonce = await provider.getTransactionCount(address);

  return {
    address,
    balance: `${balanceEth} MON`, // Tambahkan unit ETH
    nonce,
  };
};

export { wallet, walletInfo };
