// this is the Block
// Everything start from here.
class Block {
  constructor(data) {
    this.height = 0;
    //for the gensis block
    this.previousBlockHash = "x0000";

    this.timestamp = new Date().now;

    this.data = data;

    this.hash = "";
  }
}
module.exports.Block = Block;
