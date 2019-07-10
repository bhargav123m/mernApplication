const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Posts = require('../../models/Posts');
const User = require('../../models/User');

//@route Posts api/posts
//@access private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');
      const newPost = new Posts({
        user: req.user.id,
        text: req.body.text,
        avatar: user.avatar,
        name: user.name
      });

      await newPost.save();
      res.status(200).send(newPost);
    } catch (e) {
      console.log(e.message);
      res.status(500).send('server error');
    }
  }
);

//@route Get api/posts
//@access private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Posts.find().sort({ date: -1 });
    res.status(200).json(posts);
  } catch (e) {
    res.status(500).send('server error');
  }
});

//@route Get api/posts/:id
//@access private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) {
      return res.status(404).send('post not found');
    }
    res.status(200).json(post);
  } catch (e) {
    console.log(e.message);
    if (e.kind === 'ObjectId') {
      return res.status(404).send('post not found');
    }
    res.status(500).send('server error');
  }
});

//@route Delete api/posts/:id
//@access private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) {
      return res.status(404).send('post not found');
    }
    //check user
    if (post.user.toString() !== req.user.id) {
      return res.status(404).send('user not authorized');
    }
    await post.remove();
    res.status(200).json({ msg: 'post removed' });
  } catch (e) {
    console.log(e.message);
    if (e.kind === 'ObjectId') {
      return res.status(404).send('post not found');
    }
    res.status(500).send('server error');
  }
});

//@route Patch api/posts/like/:id
//@access private
router.patch('/like/:id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    const likePost = post.likes.filter(like => {
      return like.user.toString() == req.user.id;
    });
    if (likePost.length > 0) {
      return res.status(400).json({ msg: 'post already liked' });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.status(200).send(post.likes);
  } catch (e) {
    res.status(500).send('server error');
  }
});

//@route Patch api/posts/unlike/:id
//@access private
router.patch('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    const likePost = post.likes.filter(like => {
      return like.user.toString() == req.user.id;
    });
    if (likePost.length == 0) {
      return res.status(400).json({ msg: 'post has not yet liked' });
    }
    const removeIndex = post.likes
      .map(like => {
        like.user.toString();
      })
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.status(200).send(post.likes);
  } catch (e) {
    res.status(500).send('server error');
  }
});

//@route Posts api/posts/comment/:id
//@access private
router.post(
  '/comment/:id',
  [
    auth,
    [
      check('text', 'text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Posts.findById(req.params.id);
      const newComment = {
        user: req.user.id,
        text: req.body.text,
        avatar: user.avatar,
        name: user.name
      };

      post.comments.unshift(newComment);

      await post.save();
      res.status(200).send(post.comments);
    } catch (e) {
      console.log(e.message);
      res.status(500).send('server error');
    }
  }
);

//@route Posts api/posts/comment/:id/:comment_id
//@access private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );
    if (!comment) {
      return res.status(404).json({ msg: 'comment not found' });
    }
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).send('user not authorized');
    }
    post.comments.remove(comment);
    await post.save();
    res.status(200).json(post.comments);
  } catch (e) {
    console.log(e.message);
    res.status(500).send('server error');
  }
});

module.exports = router;
