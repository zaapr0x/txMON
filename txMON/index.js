class txMON {
  constructor() {
    this.aprio = require("./dapps/aprio").aprio; // Langsung assign fungsi aprio
    this.shmonad = require("./dapps/shmon").shmonad;
  }
}

module.exports = txMON;
