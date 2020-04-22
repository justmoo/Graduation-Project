// for the sha256x
const SHA256 = require("crypto-js/sha256");
const Block = require("./block.js");
const Student = require("./student.js");
const LevelDB = require("../db/blockchainDB");

class blockchain {
  constructor() {
    this.database = new LevelDB.LevelSandbox();
    // create the first Block
    this.generateGenesisBlock();
    // get the whole blockchain
    this.getTheBlockchain();
  }

  async generateGenesisBlock() {
    let self = this;
    try {
      if ((await self.getBlockHeight()) <= -1) {
        // Changed it to <= instead of ==
        await self.addBlock("First block in the chain - Genesis block");
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getBlockHeight() {
    let self = this;
    let height = await self.database.getBlocksCount();
    let length = (await height.length) - 1; // now it shows the right number

    return length;
  }
  async getBlockchainHeight() {
    let self = this;
    let height = await self.database.getBlocksCount();
    let length = await height.length;

    return length;
  }

  // this method gets all the blockchain
  async getTheBlockchain() {
    let blockchain = [];
    let self = this;
    let data = await self.database.getBlocksCount();
    for (let i = 0; i < data.length; i++) {
      let value = JSON.parse(await data[i].value);
      blockchain.push(value);
    }
    return blockchain;
  }
  // this method adds blocks to the blockchain

  async addBlock(data) {
    try {
      let newBlock = new Block.Block(data);
      let self = this;
      // -- check if the mempool it has anything--
      // add graduted students

      //gives the block time and discarding the last three numbers
      newBlock.timestamp = Date.now();
      // gives the height
      newBlock.height = (await this.getBlockHeight()) + 1;
      // to avoid the error from gensis block
      if ((await self.getBlockchainHeight()) >= 1) {
        let previousBlock = await self.getBlock(
          (await self.getBlockchainHeight()) - 1
        ); // Fixed some Json.parse done
        newBlock.previousBlockHash = previousBlock.hash; //fixed await
      }
      // hash all the data inside the block
      newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
      //push the block into the list (Temp)

      // this.list.push(newBlock);
      console.log(newBlock);
      await this.database.addLevelDBData(
        newBlock.height,
        JSON.stringify(newBlock).toString()
      );
      // return the block
      return newBlock;
    } catch (err) {
      console.log(err);
    }
  }

  // this method help if you want to search for a certain hash in the blockchain
  async getBlock(key) {
    try {
      let self = this;
      let value = JSON.parse(await self.database.getLevelDBData(key));
      return value;
    } catch (err) {
      console.log(err);
    }
  }
  // get the block by hash
  async getBlockByHash(hash) {
    try {
      let result = await this.database.getBlockByHash(hash);
      let block = JSON.parse(result.value);
      return block;
    } catch (err) {
      console.log(err);
    }
  }
  // helper method
  async getLastBlockHash() {
    let block = await this.getBlock((await this.getBlockchainHeight()) - 1);
    return block.hash;
  }

  async getCertificateHash(hash) {
    // loops over the whole blockchain, and loops inside every block to get the hash.
    let blockchain = await this.getTheBlockchain();
    for (let i = 0; i < blockchain.length; i++) {
      for (let j = 0; j < blockchain[i].data.length; j++) {
        if (blockchain[i].data[j].hashOfCertificate == hash) {
          return blockchain[i].data[j];
        }
      }
    }
    return false;
  }
  // to check if the block's data is valid
  ValidateBlock(Block) {
    // new block to recreate the hash

    // --hard to test,but i'm pretty it's fine--
    //get a new obejct
    let newBlock = {};
    // give it the same properties
    newBlock.height = Block.height;
    newBlock.previousBlockHash = Block.previousBlockHash;
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
  async saveBlockchain(blockchain) {
    try {
      // a method to save the blockchain for new nodes
      for (let i = 0; i < blockchain.length; i++) {
        await this.database.addLevelDBData(
          blockchain[i].height,
          JSON.stringify(blockchain[i])
        );
      }
      console.log("the blockchain saved in the database");
      return true;
    } catch (error) {
      console.log(error);
    }
  }
  // receive the block from other nodes
  async receiveBlock(Block) {
    try {
      if (this.ValidateBlock(Block)) {
        console.log("Valid block!");
        await this.database.addLevelDBData(Block.height, JSON.stringify(Block));
        console.log("received Block is valid and added to the Blockchain");
        return true;
      }
      return false;
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports.blockchain = blockchain;
