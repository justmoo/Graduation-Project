const router = require("express").Router();

// controllers
const blockchainRoutes = require("./blockchainRoutes");

// blockchain management
router.use("/", blockchainRoutes);
// for future Routes.

module.exports = router;
