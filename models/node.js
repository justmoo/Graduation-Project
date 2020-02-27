// the node info
class Node {
    constructor(URL, name, location) {
      // the url where the node will interact with the other nodes
      this.URL = URL;
      // name, Duh.
      this.name = name;
      // the place of the university In Real Life (IRL)
      this.location = location;
      // add a voting tracker to '++' when someone votes to add it.
      // and with each vote it checks if it reached the amount of votes needed.
      //i.e. starts with 0 and when it reach 4 nodes it activate the node
      this.numberOfVotes = 0;
      // Also add var activated and set it to false
      // activate when the goal reached
      this.activated = false;
    }
  }
  module.exports.Node = Node;
  