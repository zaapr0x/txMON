const { web3, checkPrivateKey } = require("./txMON/connection");
const txMON = require("./txMON/index");
checkPrivateKey();

const Interact = new txMON();
Interact.aprio();
Interact.shmonad();
