const router = require("express").Router();
const blockchainController = require("../controllers/BlockchainController");

router.get("/", blockchainController.homePage);

// for getting the whole blockchain.
router.get("/blockchain", blockchainController.fetchBlockchain);
// for getting peers // TODO check if he is a part of the network.
router.get("/getpeers", blockchainController.getPeers);
// request to enter the network.
router.post("/register", blockchainController.registerNode);
//adding a block to this blockchain then broadcast it to the network.
router.post("/addblock", blockchainController.addBlock);
// receive a block from a member of the network.
router.post("/receiveblock", blockchainController.receiveBlock);
// search for a block using hash.
router.post("/search/:hash", blockchainController.searchForBlock);
// this endpoint receives the whole blockchain from another peer and save it into this node.
router.post("/sendblockchain", blockchainController.sendBlockchain);
// when a peer register this route broadcast him to the network.
router.post("/addpeers", blockchainController.addPeer);

module.exports = router;
