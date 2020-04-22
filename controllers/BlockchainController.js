const blockchain = require("../models/blockchain");
const node = require("../models/node");
const student = require("../models/student");
const fetch = require("node-fetch");
const SHA256 = require("crypto-js/sha256");
//
let myBlockChain = new blockchain.blockchain();

// getting the value from the CMD. Change it later to ENV when in prod.
let nodeURL = process.argv[3] || process.env.NODE_URL;
let nodeName = process.argv[4] || process.env.NODE_NAME;
let nodeLocation = process.argv[5] || process.env.NODE_LOCATION;

// mempool, duh.
let mempool = [];

// for refreancing this node. will change this to env in prod.
let currentNode = new node.Node(nodeURL, nodeName, nodeLocation);

// Peer management.

// this section is part of the demo not related to the project.

// let firstPeer = new node.Node(
//   "https://unichain-1.herokuapp.com",
//   "KSU",
//   "Riyadh"
// );
// let secondPeer = new node.Node(
//   "https://unichain-2.herokuapp.com",
//   "PSU",
//   "Riyadh"
// );
let peerList = [currentNode];
let pedndingPeerList = [];
module.exports = {
  fetchBlockchain: async (req, res) => {
    let result = await myBlockChain.getTheBlockchain();
    return res.send(result);
  },
  searchForBlock: async (req, res) => {
    let result = await myBlockChain.getBlockByHash(req.params.hash);
    return res.send(result);
  },
  // takes hash of the certificate and loops through the blockchain.
  searchForAStudentByHashOfCertificate: async (req, res) => {
    let student = await myBlockChain.getCertificateHash(req.params.hash);
    res.send(student);
  },
  addBlock: async (req, res) => {
    try {
      // sends the whole mempool.
      let data = mempool;
      // checks if the mempool has more than 5 students.
      if (data.length <= 5) {
        return res
          .status(403)
          .send("creating a block requires more than 5 students");
      }
      // add the block.
      let newBlock = await myBlockChain.addBlock(data);
      // check the peerList and send the block to them one by one
      for (let i = 0; i < peerList.length; i++) {
        if (!(currentNode.URL == peerList[i].URL)) {
          let URL = peerList[i].URL;
          let Link = URL + "/blockchain/receiveBlock";
          // doesn't work right now, because it require a real url not 'localhost'
          // get the url from the peerList and combine it with the endPoint with a Post request
          let Options = {
            method: "POST",
            body: JSON.stringify(newBlock),
            headers: { "Content-Type": "application/json" },
          };
          await fetch(Link, Options);
          await fetch(URL + "/mempool/clear", { method: "POST" });
          // for a while only
          // Showin' the result
          console.log("--------");
          console.log("block sent to:");
          console.log(Link);
          console.log("--------");
        }
      }
      mempool = [];
      return res.send(newBlock);
    } catch (error) {
      console.log(error);
    }
  },
  receiveBlock: async (req, res) => {
    let Block = req.body;
    let hash = await myBlockChain.getLastBlockHash();
    console.log(Block.previousBlockHash);
    console.log('^^^^^^^^^^^')
    console.log(hash)
    // check if they have the same Blockchain by checking the last block
    if (Block.previousBlockHash == hash) {
      console.log(' Yes previousHash is the same')
      // checking the blockchain if it's valid
      if (await myBlockChain.receiveBlock(Block)) {
        // send the block if everything fine.
        return res.send(Block);
      }
    }
    return res.send("block rejected");
  },

  sendBlockchain: async (req, res) => {
    let blockchain = req.body;
    // save the blockchain
    console.log(blockchain);
    await myBlockChain.saveBlockchain(blockchain);
    console.log("Blockchain saved");
    res.send("Blockchain accepted");
  },

  // peer Management. and Functions
  getPeers: (req, res) => {
    return res.send(peerList);
  },
  registerNode: async (req, res) => {
    let name = req.body.name;
    let URL = req.body.URL;
    let location = req.body.location;
    let newNode = new node.Node(URL, name, location);
    if (newNode.numberOfVotes > 1) {
      return res.status(401).send("You don't have enough votes");
    }
    newNode.activated = true;
    try {
      // check if the node is already registered
      for (let i = 0; i < peerList.length; i++) {
        if (peerList[i].URL == URL) {
          return res.send("The URL registered");
        }
      }
      // before that it should get accpeted into the network.
      // i.e. The other nodes(or at least 4) Must accept the new Node and verifiy it's identity.
      // i did push the node here so it include it self when registering
      let newBlockchain = await myBlockChain.getTheBlockchain();
      console.log(newBlockchain)
      // brodcast the block.
      let blockchainRequest = {
        method: "POST",
        body: JSON.stringify(newBlockchain),
        headers: { "Content-Type": "application/json" },
      };
      let peerListToSave = {
        method: "POST",
        body: JSON.stringify(peerList),
        headers: { "Content-Type": "application/json" },
      };
      let memepoolToSave = {
        method: "POST",
        body: JSON.stringify(mempool),
        headers: { "Content-Type": "application/json" },
      };
      // send the blockchain
      await fetch(URL + "/blockchain/sendblockchain", blockchainRequest);
      // send the peerList
      await fetch(URL + "/peers/save", peerListToSave);

      await fetch(URL + "/mempool/save", memepoolToSave);

      // broadcast the peer
      let peerLink = "/peers/add";

      let peerRequest = {
        method: "POST",
        body: JSON.stringify(newNode),
        headers: { "Content-Type": "application/json" },
      };

      // send the node to all the peers.
      for (let i = 0; i < peerList.length; i++) {
        if (!(currentNode.URL == peerList[i].URL)) {
          await fetch(peerList[i].URL + peerLink, peerRequest);
        }
      }

      // give the new peer the blockchain
      peerList.push(newNode);
      return res.send(peerList);
    } catch (error) {
      return res.send("error : " + error);
    }
  },
  getPendingPeers: (req, res) => {
    return pedndingPeerList;
  },
  savePeers: (req, res) => {
    let newPeerList = req.body;
    console.log(newPeerList);

    for (let i = 0; i < newPeerList.length; i++) {
      let URL = newPeerList[i].URL;
      let location = newPeerList[i].location;
      let name = newPeerList[i].name;
      let newNode = new node.Node(URL, name, location);
      peerList.push(newNode);
    }
    console.log("peers are saved");
    res.send("peers are saved");
  },
  addPeer: (req, res) => {
    let name = req.body.name;
    let URL = req.body.URL;
    let location = req.body.location;
    let newNode = new node.Node(URL, name, location);
    peerList.push(newNode);
    res.send("one peer added to the network");
  },
  deletePeer: (req, res) => {
    let nodeURL = req.body.URL;
    for (let i = 0; i < peerList.length; i++) {
      if (peerList[i] == nodeURL) {
        peerList.splice(i, 1);
        return res.send("Node deleted");
      }
    }
    return res.send("Not in the peer list");
  },
  savePeerList: (req, res) => {
    let PeerList = req.body;
    this.peerList = PeerList;
    console.log(this.peerList);
    return res.send("peerList Saved");
  },

  peerVote: async (req, res) => {
    for (let i = 0; i < pedndingPeerList.length; i++) {
      pedndingPeerListp[i].numberOfVotes++;

      if (req.body.URL == pedndingPeerList[i].URL) {
        if (pedndingPeerListp[i].numberOfVotes < 0) {
          let pendingNode = pedndingPeerListp[i];
          peerList.push(pedndingPeerList[i]);
          pedndingPeerList.splice(i, 1);
          let newNode = new node.Node(
            pendingNode.URL,
            pendingNode.name,
            pendingNode.location
          );
          let request = {
            method: "POST",
            body: JSON.stringify(newNode),
            headers: { "Content-Type": "application/json" },
          };
          await fetch(nodeURL + "/peers/register", request);
        }
      }
    }
  },

  // mempool management.
  getMempool: (req, res) => {
    return res.send(mempool);
  },
  addStudent: async (req, res) => {
    let ID = req.body.ID;
    let name = req.body.name;
    let major = req.body.major;
    let year = req.body.year;
    let university = req.body.university;
    let hash = SHA256(
      JSON.stringify(name + major + year + university)
    ).toString();

    let newStudent = new student.Student(
      ID,
      name,
      hash,
      year,
      university,
      major
    );
    mempool.push(newStudent);

    // setup the options before broadcasting it.
    let studentRequest = {
      method: "POST",
      body: JSON.stringify(newStudent),
      headers: { "Content-Type": "application/json" },
    };
    console.log(newStudent);
    // send it to everyone in the network.

    for (let i = 0; i < peerList.length; i++) {
      if (!(currentNode.URL == peerList[i].URL)) {
        await fetch(peerList[i].URL + "/mempool/receive", studentRequest);
        console.log("student sent to");
        console.log(peerList[i].URL + "/mempool/receive");
        console.log("_________________________________________");
      }
    }
    res.send("student added to mempool and broadcasted");
  },
  clearMempool: (req, res) => {
    mempool = [];
    console.log("mempoolCleared!");
    return res.send("memepool cleared");
  },
  receiveStudent: (req, res) => {
    let ID = req.body.ID;
    let name = req.body.name;
    let major = req.body.major;
    let year = req.body.year;
    let university = req.body.university;
    let hash = req.body.hash;
    console.log(req.body);
    let newStudent = new student.Student(
      ID,
      name,
      hash,
      year,
      university,
      major
    );

    mempool.push(newStudent);

    res.send("student stored in the mempool");
  },
  receiveMempool: (req, res) => {
    let newMemPool = req.body;
    for (let i = 0; i < newMemPool.length; i++) {
      mempool.push(newMemPool[i]);
    }
    console.log("mempool received!");
    res.send("mempool saved");
  },
};
