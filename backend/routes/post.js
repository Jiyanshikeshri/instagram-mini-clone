const router = require("express").Router();
const Post = require("../models/Post");
const auth = require("../middleware/authMiddleware");

//FEED (FOLLOWING USERS POSTS)
router.get("/feed", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const posts = await Post.find({
      userId: { $in: user.following }
    })
      .populate("userId", "username")
      .populate("comments.userId", "username")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// Create Post
router.post("/", auth, async (req, res) => {
  const post = await Post.create({
    userId: req.userId,
    image: req.body.image,
    caption: req.body.caption
  });
  res.json(post);
});

// Like / Unlike
router.put("/:id/like", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post.likes.includes(req.userId)) {
    post.likes.push(req.userId);
  } else {
    post.likes.pull(req.userId);
  }
  await post.save();
  res.json(post);
});

// Comment
router.post("/:id/comment", auth, async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $push: { comments: { userId: req.userId, text: req.body.text } } },
    { new: true }
  );
  res.json(post);
});

// GET ALL POSTS (FEED)
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // newest first
      .populate("userId", "username email")
      .populate("comments.userId", "username");

    res.json(posts);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// GET SINGLE POST
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("userId", "username")
      .populate("comments.userId", "username");

    if (!post) return res.status(404).json("Post not found");

    res.json(post);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// DELETE POST
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found");

    if (post.userId.toString() !== req.userId) {
      return res.status(403).json("Not allowed");
    }

    await post.deleteOne();
    res.json("Post deleted");
  } catch (err) {
    res.status(500).json(err.message);
  }
});


module.exports = router;
