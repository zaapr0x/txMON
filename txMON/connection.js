const { Web3 } = require("web3");
try {
  const web3 = new Web3("https://testnet-rpc.monad.xyz");
  module.exports = { web3 };
} catch (error) {
  console.log("Failed to connect to RPC");
}
