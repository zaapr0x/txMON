import { ethers } from "ethers";
import "dotenv/config";

// Ambil RPC URL dari .env
const RPC_URL = "https://testnet-rpc.monad.xyz";
if (!RPC_URL) throw new Error("❌ RPC_URL is missing in .env");

// Buat provider menggunakan RPC custom
const provider = new ethers.JsonRpcProvider(RPC_URL);

export { provider };
