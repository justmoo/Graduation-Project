const router = require("express").Router();
const blockchainController = require("../controllers/BlockchainController");

// HomePage
router.get("/", (req, res) => {
  res.send("Blockchain is ready");
});

// for getting the whole blockchain.
router.get("/blockchain", blockchainController.fetchBlockchain);
// search for a block using hash.
router.get("/blockchain/search/:hash", blockchainController.searchForBlock);
// adding a block to this blockchain then broadcast it to the network.
router.post("/blockchain/addblock", blockchainController.addBlock);
// receive a block from a member of the network.
router.post("/blockchain/receiveblock", blockchainController.receiveBlock);
// this endpoint receives the whole blockchain from another peer and save it into this node.
router.post("/blockchain/sendblockchain", blockchainController.sendBlockchain);
// this endpoint takes hash of certificate and loops through the blockchain looking for it.
router.get('/blockchain/certificates/:hash',blockchainController.searchForAStudentByHashOfCertificate);

/// peer Routes
// get the peers
router.get("/peers", blockchainController.getPeers);
// register as a new node and broadcast it
router.post("/peers/register", blockchainController.registerNode);
// receive a node and add it to the peer list
router.post("/peers/add", blockchainController.addPeer);
// delete a node from the peer list (doesn't broadcast the change)
router.post("/peers/delete", blockchainController.deletePeer);
// route to receive a FULL list of peers
router.post("/peers/save", blockchainController.savePeers);
// getting pending peers
router.get("/peers/pending", blockchainController.getPendingPeers);
// vote for a pending peer
router.post("/peers/vote", blockchainController.peerVote);

// mempool Routes
//get the mempool
router.get("/mempool", blockchainController.getMempool);
// add and broadcast a student
router.post("/mempool/add", blockchainController.addStudent);
// clear the mempool (usually after adding a block)
router.post("/mempool/clear", blockchainController.clearMempool);
// receive a student from another node.
router.post("/mempool/receive", blockchainController.receiveStudent);
// getting the whole mempool when registering.
router.post("/mempool/save", blockchainController.receiveMempool);

module.exports = router;
