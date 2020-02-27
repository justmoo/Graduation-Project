const blockchain = require("../models/blockchain");
const node = require("../models/node");

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
    // check if the node is already registered
    for (let i = 0; i < peerList.length; i++) {
      if (peerList[i].URL == URL) {
        // TODO add more logic to it,
        return res.send(" The URL registered");
      }
    }
    // before that it should get accpeted into the network.
    // i.e. The other nodes(or at least 4) Must accept the new Node and verifiy it's identity

    // TODO // when a node joins the network, it should get a full list of peers
    // TODO // when a node joins the network it gets the full blockchain from the requested node.
    let link = "/sendBlockchain";
    let newBlockchain = myBlockChain.getTheBlockchain();
    let Options = {
      method: "POST",
      body: JSON.stringify(newBlockchain),
      headers: { "Content-Type": "application/json" }
    };
    let result = await fetch(URL + link, Options);
    peerList.push(newNode);
    // give the new peer the blockchain
    return res.send(peerList);
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
  sendBlockchain: (req, res) => {
    // TODO  Check if the client is a registered node.
    let blockchain = req.body;
    // save the blockchain to
    myBlockChain.saveBlockchain(blockchain);
    console.log("Blockchain saved");
    return true;
  }
};
