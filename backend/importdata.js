const mongoose = require("mongoose");
const { nodes, edges } = require("./data/campusGraph");

mongoose.connect("mongodb://127.0.0.1:27017/campus_nav");

const NodeModel = mongoose.model("Node", new mongoose.Schema({}, { strict: false }));
const EdgeModel = mongoose.model("Edge", new mongoose.Schema({}, { strict: false }));

const importData = async () => {
  try {
    await NodeModel.deleteMany();
    await EdgeModel.deleteMany();

    await NodeModel.insertMany(nodes);
    await EdgeModel.insertMany(edges);

    console.log("✅ FULL DATA IMPORTED");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

importData();