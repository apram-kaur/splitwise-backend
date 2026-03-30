console.log("Invite controller loaded");

const Invite = require("../models/Invite");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

exports.sendInvite = async (req, res) => {
  try {
    const { email } = req.body;
    const { groupId } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const invite = await Invite.create({
      email,
      group: groupId,
      invitedBy: req.user._id,
      token,
    });

    const inviteLink = `${process.env.CLIENT_URL}/accept-invite/${token}`;

    /* await sendEmail(
      email,
      "You're invited to join a group!",
      `
        <h2>You're invited to join Evenly 🎉</h2>
        <p>Click the link below to accept the invite:</p>
        <a href="${inviteLink}">${inviteLink}</a>
      `
    ); */
 
    res.status(201).json({
      message: "Invite created and email sent successfully",
      invite,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
exports.getInvitesByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const invites = await Invite.find({ group: groupId });

    res.status(200).json({ invites });
  } catch (err) {
    console.error("Get invites error:", err);
    res.status(500).json({ error: err.message });
  }
};