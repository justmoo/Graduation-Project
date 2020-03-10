// for the sha256x
const SHA256 = require("crypto-js/sha256");
const Block = require("./block.js");
const Student = require("./student.js");
class blockchain {
  constructor() {
    // init the list (Temp) // TODO Add database
    this.list = [];
    this.dummyData = [];
    // create the first Block
    this.generateGenesisBlock();
    // generate data
    this.getData();
    // add the block with the dummyData
    this.addBlock(this.dummyData);
    // get the whole blockchain
    this.getTheBlockchain();
  }
  // generate the genesis block only if the blockchain has 0 blocks
  generateGenesisBlock() {
    if (this.list.length == 0) {
      let newBlock = new Block.Block("gradute's blockchain");

      // TODO // restore the genesis block func
      // did that to start all the nodes with the same hash.

      //gives the block time and discarding the last three numbers
      newBlock.timestamp = 0;
      // gives the height
      newBlock.height = 0;
      // to avoid the error from gensis block
      newBlock.previousHash = "x000";

      // hash all the data inside the block
      newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
      //push the block into the list (Temp)

      this.list.push(newBlock);
    }
    return this.blockchain;
  }
  // this method gets all the blockchain
  getTheBlockchain() {
    return this.list;
  }
  // this method adds blocks to the blockchain

  addBlock(data) {
    let newBlock = new Block.Block(data);

    // -- check if the mempool it has anything--
    // add graduted students, // TODO Block size dissection

    //gives the block time and discarding the last three numbers
    newBlock.timestamp = new Date().now;
    // gives the height
    newBlock.height = this.list.length;
    // to avoid the error from gensis block
    if (this.list.length > 0) {
      // get the hash from the last block
      newBlock.previousHash = this.list[this.list.length - 1].hash;
    }
    // hash all the data inside the block
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    //push the block into the list (Temp)

    this.list.push(newBlock);
    // return the block
    return newBlock;
  }

  // this method help if you want to search for a certain hash in the blockchain
  getBlock(hash) {
    // loop through the list and look for the hash
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].hash == hash) {
        let newBlock = this.list[i];
        return newBlock;
      }
    }
  }
  // helper method
  getLastBlockHash() {
    let Hash = this.list[this.list.length - 1].hash;

    return Hash;
  }
  // to check if the block's data is valid
  ValidateBlock(Block) {
    // new block to recreate the hash

    // --hard to test,but i'm pretty it's fine--
    //get a new obejct
    let newBlock = {};
    // give it the same properties
    newBlock.height = Block.height;
    newBlock.previousHash = Block.previousHash;
    newBlock.timestamp = Block.timestamp;
    newBlock.data = Block.data;
    // it took me 3 hours to figure out why it's not producing the same hash
    // this is the reason, i forgot to put the hash: "", it takes into account eveything you can think of
    newBlock.hash = "";

    //save the hash in a var
    let blockHash = Block.hash;
    // reset the hash
    Block.hash = "";
    // rehash the block
    Block.hash = SHA256(JSON.stringify(newBlock)).toString();
    // showin' result for testing purposes.
    // check if the hash is valid.
    if (Block.hash == blockHash) {
      return true;
    }
    return false;
  }
  saveBlockchain(blockchain) {
    // a method to save the blockchain for new nodes
    // if (this.list > 0) {
      this.list = blockchain;
      console.log("the blockchain saved in the database");
    // }
    return true;
  }
  // receive the block from other nodes
  receiveBlock(Block) {
    // need to handle the JSON file better // TODO
    // need to rehash the block to make sure the hash is valid
    if (this.ValidateBlock(Block)) {
      this.list.push(Block);
      console.log("received Block is valid and added to the Blockchain");
      return true;
    }
    return false;
  }

  // generate dummy data, there is so many ways to generate but this one is mine.
  getData() {
    // random "real numbers" 20 students
    for (let x = 437105030; x < 437105050; x++) {
      // hasing the number, not the certificate
      let Hash = SHA256(JSON.stringify(x)).toString();
      let newStudent = new Student.Student(x, Hash);
      //just to randomize the data
      if (x % 3 == 0) {
        newStudent.name = "Ali Ahmed";
        newStudent.university = "King saud university";
      } else if (x % 4 == 0) {
        newStudent.name = "khaild Mohammed";
        newStudent.university = "Stanford university";
      } else {
        newStudent.name = "Mohammed Abdullah";
        newStudent.name = "Harverd university";
      }
      newStudent.Year = 2020;
      this.dummyData.push(newStudent);
    }
  }
}
module.exports.blockchain = blockchain;
