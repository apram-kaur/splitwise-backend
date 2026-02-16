console.log("Group controller file loaded");

const Group = require("../models/Group");

// CREATE GROUP
const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name || !members || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name and members are required",
      });
    }

    const group = await Group.create({
      name,
      members,
    });

    res.status(201).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL GROUPS
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find();

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createGroup,
  getGroups,
};
