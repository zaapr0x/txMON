import { aprio } from "./dapps/aprio.js";
import { shmonad } from "./dapps/shmonad.js";
import { kintsu } from "./dapps/kintsu.js";
import { monadex } from "./dapps/monadex.js";
import { walletInfo } from "../src/config/wallet.js";
import chalk from "chalk";
const accounts = await walletInfo();
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
Version: 1.2

Logged As:
 - Address: ${accounts.address}
 - Balance: ${accounts.balance}
 - Tx Counts: ${accounts.nonce}

`);
console.log(banner);
const main = async () => {
  console.log("🔄 Interact With shmonad...");
  await shmonad(); // Tunggu hingga selesai

  console.log("🔄 Interact With aprio...");
  await aprio(); // Baru eksekusi aprio setelah shmonad selesai

  console.log("🔄 Interact With kintsu...");
  await kintsu();

  console.log("🔄 Interact With monadex...");
  await monadex();

  console.log("✅ Done!");
};

main();
