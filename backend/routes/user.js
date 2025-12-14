const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const auth = require("../middleware/authMiddleware");

// 🔹 GET USER PROFILE
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "username")
      .populate("following", "username");

    if (!user) return res.status(404).json("User not found");

    const posts = await Post.find({ userId: req.params.id })
      .sort({ createdAt: -1 });

    res.json({ user, posts });
  } catch (err) {
    res.status(500).json(err.message);
  }
});


// 🔹 FOLLOW / UNFOLLOW USER
router.put("/:id/follow", auth, async (req, res) => {
  try {
    if (req.userId === req.params.id) {
      return res.status(400).json("You can't follow yourself");
    }

    const user = await User.findById(req.params.id);       // target user
    const currentUser = await User.findById(req.userId);  // logged-in user

    if (!user.followers.includes(req.userId)) {
      // FOLLOW
      user.followers.push(req.userId);
      currentUser.following.push(req.params.id);
      await user.save();
      await currentUser.save();
      res.json("User followed");
    } else {
      // UNFOLLOW
      user.followers.pull(req.userId);
      currentUser.following.pull(req.params.id);
      await user.save();
      await currentUser.save();
      res.json("User unfollowed");
    }

  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;
