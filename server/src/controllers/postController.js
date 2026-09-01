const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');

// Helper to create and emit real-time notification
const sendNotification = async (req, notifData) => {
  try {
    const notif = await Notification.create(notifData);
    const populated = await Notification.findById(notif._id).populate({
      path: 'sender',
      select: 'email role',
      populate: { path: 'profile', select: 'firstName lastName headline avatar' },
    });
    const io = req.app.get('io');
    if (io && notifData.recipient) {
      io.to(notifData.recipient.toString()).emit('new_notification', populated);
    }
    return populated;
  } catch (err) {
    console.warn('Notification error:', err.message);
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { content, media, company } = req.body;

    if (!content && (!media || media.length === 0)) {
      return res.status(400).json({ success: false, message: 'Please provide post text content or media.' });
    }

    const post = await Post.create({
      author: req.user.id,
      content,
      media: media || [],
      company: company || undefined,
    });

    const populatedPost = await Post.findById(post._id).populate({
      path: 'author',
      select: 'email role',
      populate: { path: 'profile', select: 'firstName lastName headline avatar location' },
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('new_feed_post', populatedPost);
    }

    res.status(201).json({ success: true, post: populatedPost });
  } catch (err) {
    next(err);
  }
};

// @desc    Repost a post (Simple repost or Repost with thoughts)
// @route   POST /api/posts/:id/repost
// @access  Private
exports.repostPost = async (req, res, next) => {
  try {
    const originalPostId = req.params.id;
    const { commentary, media } = req.body;

    const originalPost = await Post.findById(originalPostId).populate({
      path: 'author',
      select: 'email role',
      populate: { path: 'profile', select: 'firstName lastName headline avatar location' },
    });

    if (!originalPost) {
      return res.status(404).json({ success: false, message: 'Original post not found.' });
    }

    // Check if user already directly reposted without thoughts
    const hasAlreadyDirectlyReposted =
      !commentary &&
      originalPost.reposts?.some((id) => id.toString() === req.user.id.toString());

    if (hasAlreadyDirectlyReposted) {
      return res.status(400).json({
        success: false,
        message: 'You have already reposted this post.',
      });
    }

    // Create the repost entry
    const newPost = await Post.create({
      author: req.user.id,
      content: commentary || '',
      isRepost: true,
      originalPost: originalPost._id,
      repostCommentary: commentary || '',
      media: media || [],
    });

    // Add user to original post reposts array
    if (!originalPost.reposts.includes(req.user.id)) {
      originalPost.reposts.push(req.user.id);
      await originalPost.save();
    }

    // Populate the newly created repost
    const populatedRepost = await Post.findById(newPost._id)
      .populate({
        path: 'author',
        select: 'email role',
        populate: { path: 'profile', select: 'firstName lastName headline avatar location' },
      })
      .populate({
        path: 'originalPost',
        populate: {
          path: 'author',
          select: 'email role',
          populate: { path: 'profile', select: 'firstName lastName headline avatar location' },
        },
      });

    // Send real-time notification to original post author if not self
    if (originalPost.author && originalPost.author._id.toString() !== req.user.id.toString()) {
      const reposterProfile = await Profile.findOne({ user: req.user.id });
      const reposterName = reposterProfile ? reposterProfile.fullName : 'Someone';

      await sendNotification(req, {
        recipient: originalPost.author._id,
        sender: req.user.id,
        type: 'post_repost',
        title: 'Your post was reposted',
        message: `${reposterName} reposted your post: "${originalPost.content ? originalPost.content.slice(0, 45) : ''}..."`,
        data: { postId: newPost._id, originalPostId: originalPost._id },
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('new_feed_post', populatedRepost);
      io.emit('post_repost_count_updated', {
        postId: originalPost._id,
        repostsCount: originalPost.reposts.length,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Post reposted successfully.',
      post: populatedRepost,
      originalPostRepostsCount: originalPost.reposts.length,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all feed posts (with pagination, comments, likes)
// @route   GET /api/posts
// @access  Public / Private
exports.getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.author) {
      query.author = req.query.author;
    }
    if (req.query.company) {
      query.company = req.query.company;
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'email role',
        populate: { path: 'profile', select: 'firstName lastName headline avatar location' },
      })
      .populate({
        path: 'originalPost',
        populate: {
          path: 'author',
          select: 'email role',
          populate: { path: 'profile', select: 'firstName lastName headline avatar location' },
        },
      })
      .populate('company', 'name logo location industry');

    // Populate comments for each post
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({ targetId: post._id, targetType: 'Post' })
          .sort({ createdAt: 1 })
          .populate({
            path: 'author',
            select: 'email role',
            populate: { path: 'profile', select: 'firstName lastName headline avatar' },
          });

        const postObj = post.toObject();
        postObj.comments = comments;
        postObj.likesCount = post.likes ? post.likes.length : 0;
        postObj.repostsCount = post.reposts ? post.reposts.length : 0;
        postObj.isLiked = req.user
          ? post.likes.some((id) => id.toString() === req.user.id.toString())
          : false;
        postObj.isSaved = req.user
          ? post.savedBy.some((id) => id.toString() === req.user.id.toString())
          : false;
        return postObj;
      })
    );

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      count: postsWithComments.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      posts: postsWithComments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public / Private
exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate({
        path: 'author',
        select: 'email role',
        populate: { path: 'profile', select: 'firstName lastName headline avatar location' },
      })
      .populate({
        path: 'originalPost',
        populate: {
          path: 'author',
          select: 'email role',
          populate: { path: 'profile', select: 'firstName lastName headline avatar location' },
        },
      })
      .populate('company', 'name logo location industry');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const comments = await Comment.find({ targetId: post._id, targetType: 'Post' })
      .sort({ createdAt: 1 })
      .populate({
        path: 'author',
        select: 'email role',
        populate: { path: 'profile', select: 'firstName lastName headline avatar' },
      });

    const postObj = post.toObject();
    postObj.comments = comments;
    postObj.likesCount = post.likes ? post.likes.length : 0;
    postObj.repostsCount = post.reposts ? post.reposts.length : 0;
    postObj.isLiked = req.user
      ? post.likes.some((id) => id.toString() === req.user.id.toString())
      : false;
    postObj.isSaved = req.user
      ? post.savedBy.some((id) => id.toString() === req.user.id.toString())
      : false;

    res.status(200).json({ success: true, post: postObj });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this post.' });
    }

    if (req.body.content !== undefined) post.content = req.body.content;
    if (req.body.media) post.media = req.body.media;

    await post.save();

    res.status(200).json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (post.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post.' });
    }

    await Comment.deleteMany({ targetId: post._id, targetType: 'Post' });
    await post.deleteOne();

    res.status(200).json({ success: true, message: 'Post deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Like or Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const isLiked = post.likes.some((id) => id.toString() === req.user.id.toString());

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user.id.toString());
    } else {
      post.likes.push(req.user.id);

      // Notify post author in real-time if not liking own post
      if (post.author.toString() !== req.user.id.toString()) {
        const likerProfile = await Profile.findOne({ user: req.user.id });
        const likerName = likerProfile ? likerProfile.fullName : 'Someone';

        await sendNotification(req, {
          recipient: post.author,
          sender: req.user.id,
          type: 'post_like',
          title: 'New Like on your post',
          message: `${likerName} liked your post.`,
          data: { postId: post._id },
        });
      }
    }

    await post.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('post_likes_updated', {
        postId: post._id,
        likesCount: post.likes.length,
        userId: req.user.id,
        liked: !isLiked,
      });
    }

    res.status(200).json({
      success: true,
      liked: !isLiked,
      likesCount: post.likes.length,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Save or Unsave a post
// @route   PUT /api/posts/:id/save
// @access  Private
exports.savePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const isSaved = post.savedBy.some((id) => id.toString() === req.user.id.toString());

    if (isSaved) {
      post.savedBy = post.savedBy.filter((id) => id.toString() !== req.user.id.toString());
    } else {
      post.savedBy.push(req.user.id);
    }

    await post.save();

    res.status(200).json({
      success: true,
      saved: !isSaved,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const comment = await Comment.create({
      targetType: 'Post',
      targetId: post._id,
      author: req.user.id,
      content: content.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate({
      path: 'author',
      select: 'email role',
      populate: { path: 'profile', select: 'firstName lastName headline avatar' },
    });

    // Send notification to post author if not own post
    if (post.author.toString() !== req.user.id.toString()) {
      const commenterProfile = await Profile.findOne({ user: req.user.id });
      const commenterName = commenterProfile ? commenterProfile.fullName : 'Someone';

      await sendNotification(req, {
        recipient: post.author,
        sender: req.user.id,
        type: 'post_comment',
        title: 'New Comment on your post',
        message: `${commenterName} commented: "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}"`,
        data: { postId: post._id, commentId: comment._id },
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('new_comment_added', {
        postId: post._id,
        comment: populatedComment,
      });
    }

    res.status(201).json({ success: true, comment: populatedComment });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/posts/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    if (comment.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment.' });
    }

    await comment.deleteOne();
    res.status(200).json({ success: true, message: 'Comment deleted.' });
  } catch (err) {
    next(err);
  }
};
