// this is the Block
// Everything start from here.
class Block {
    constructor(data) {
      this.height = 0;
      //for the gensis block
      this.previousHash = "x0000";
      this.timestamp = Date.now()
        .toString()
        .slice(0, -3);
      this.data = data;
      this.hash = "";
    }
  }
  module.exports.Block = Block;
  