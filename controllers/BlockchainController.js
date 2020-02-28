const blockchain = require("../models/blockchain");
const node = require("../models/node");
const fetch = require("node-fetch");

let myBlockChain = new blockchain.blockchain();
let peerList = [];
let pendingPeers = [];

module.exports = {
  homePage: (req, res) => {
    res.json({ success: true, result: "welcome to graduate's blockchain!" });
  },
  fetchBlockchain: async (req, res) => {
    let result = myBlockChain.getTheBlockchain();
    return res.send(result);
  },
  searchForBlock: (req, res) => {
    let result = myBlockChain.getBlock(req.params.hash);
    return res.send(result);
  },
  addBlock: async (req, res) => {
    // also we can fetch the data from a source (i.e. the university's ERP system)

    // TODO // reset the timer when the block
    // find a way to avoid proof of work machisme.
    // we agreed to skip POW because it might casue the university to lose money.

    // receive the data from a form, not a whole block
    let data = req.body.block;

    let newBlock = myBlockChain.addBlock(data);

    // check the peerList and send the block to them one by one
    let link = "/receiveBlock";
    for (let i = 0; i < peerList.length; i++) {
      let URL = peerList[i].URL;
      Link = URL + link;
      // doesn't work right now, because it require a real url not 'localhost'
      // get the url from the peerList and combine it with the endPoint with a Post request
      let Options = {
        method: "POST",
        body: JSON.stringify(newBlock),
        headers: { "Content-Type": "application/json" }
      };
      let result = await fetch(Link, Options);
      // for a while only
      // Showin' the result
      console.log("--------");
      console.log("block sent to:");
      console.log(URL + link);
      console.log("--------");
    }
    return res.send(newBlock);
  },
  registerNode: async (req, res) => {
    let name = req.body.name;
    let URL = req.body.URL;
    let location = req.body.location;
    let newNode = new node.Node(URL, name, location);
    try {
      // check if the node is already registered
      if (peerList.length > 0) {
        for (let i = 0; i < peerList.length; i++) {
          if (peerList[i].URL == URL) {
            // TODO add more logic to it,
            return res.send("The URL registered");
          }
        }
      }
      // before that it should get accpeted into the network.
      // i.e. The other nodes(or at least 4) Must accept the new Node and verifiy it's identity.
      // i did push the node here so it include it self when registering
      
      // TODO // when a node joins the network, it should get a full list of peers
      // TODO // when a node gets into the network its url should be broadcast to everyone.
      // TODO // when a node joins the network it gets the full blockchain from the requested node.
      let blockchainLink = "/sendblockchain";
      let newBlockchain = myBlockChain.getTheBlockchain();
      // brodcast the block.
      let blockchainRequest = {
        method: "POST",
        body: JSON.stringify(newBlockchain),
        headers: { "Content-Type": "application/json" }
      };
       await fetch(URL + blockchainLink, blockchainRequest);


      // broadcast the peer
      let peerLink = "/addpeers";
      let peerRequest = {
        method: "POST",
        body: JSON.stringify(newNode),
        headers: { "Content-Type": "application/json" }
      };
      await fetch(URL + peerLink, peerRequest);
      // give the new peer the blockchain
      peerList.push(newNode);
      return res.send(peerList);
    } catch (error) {
      return res.send("error : " + error);
    }
  },
  getPeers: (req, res) => {
    // TODO // verifying the node is registered.
    return res.send(peerList);
  },
  receiveBlock: (req, res) => {
    // TODO Check if the node is from the network.
    let Block = req.body;
    let hash = myBlockChain.getLastBlockHash();
    // check if they have the same Blockchain by checking the last block
    if (Block.previousHash == hash) {
      // TODO // add check if the Blockchain is valid (hash && validChain)
      // checking the blockchain if it's valid
      if (myBlockChain.receiveBlock(Block)) {
        // send the block if everything fine.
        return res.send(Block);
      }
    }
    return res.send("block rejected");
  },
  // TODO change this function to sendData, and pass peers along with the blockchain.

  sendBlockchain: (req, res) => {
    // TODO  Check if the client is a registered node.
    let blockchain = req.body.blockchain;
    // save the blockchain to
    console.log(blockchain);
    myBlockChain.saveBlockchain(blockchain);
    console.log("Blockchain saved");

    res.send("Blockchain accepted");
  },
  addPeer: (req, res) => {
    let name = req.body.name;
    let URL = req.body.URL;
    let location = req.body.location;
    let newNode = new node.Node(URL, name, location);
    console.log(req.body);
    console.log(newNode);
    peerList.push(newNode);
    res.send(" one peer added to the network");
  }
};
