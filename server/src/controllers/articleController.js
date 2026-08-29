const Article = require('../models/Article');
const Comment = require('../models/Comment');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');

// @desc    Create a new article
// @route   POST /api/articles
// @access  Private
exports.createArticle = async (req, res, next) => {
  try {
    const { title, coverImage, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide article title and content.' });
    }

    const article = await Article.create({
      author: req.user.id,
      title,
      coverImage: coverImage || '',
      content,
      tags: tags || [],
    });

    const populated = await Article.findById(article._id).populate({
      path: 'author',
      select: 'email role',
      populate: { path: 'profile', select: 'firstName lastName headline avatar' },
    });

    res.status(201).json({ success: true, article: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all published articles
// @route   GET /api/articles
// @access  Public
exports.getArticles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const articles = await Article.find({ published: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'email role',
        populate: { path: 'profile', select: 'firstName lastName headline avatar' },
      });

    const total = await Article.countDocuments({ published: true });

    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      articles,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single article by ID or Slug
// @route   GET /api/articles/:id
// @access  Public / Private
exports.getArticleById = async (req, res, next) => {
  try {
    let article = await Article.findById(req.params.id).populate({
      path: 'author',
      select: 'email role',
      populate: { path: 'profile', select: 'firstName lastName headline avatar about' },
    });

    if (!article) {
      article = await Article.findOne({ slug: req.params.id }).populate({
        path: 'author',
        select: 'email role',
        populate: { path: 'profile', select: 'firstName lastName headline avatar about' },
      });
    }

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    const comments = await Comment.find({ targetId: article._id, targetType: 'Article' })
      .sort({ createdAt: 1 })
      .populate({
        path: 'author',
        select: 'email role',
        populate: { path: 'profile', select: 'firstName lastName headline avatar' },
      });

    const articleObj = article.toObject();
    articleObj.comments = comments;
    articleObj.isLiked = req.user ? article.likes.some((id) => id.toString() === req.user.id.toString()) : false;

    res.status(200).json({ success: true, article: articleObj });
  } catch (err) {
    next(err);
  }
};

// @desc    Like or Unlike an article
// @route   PUT /api/articles/:id/like
// @access  Private
exports.likeArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    const isLiked = article.likes.some((id) => id.toString() === req.user.id.toString());

    if (isLiked) {
      article.likes = article.likes.filter((id) => id.toString() !== req.user.id.toString());
    } else {
      article.likes.push(req.user.id);

      if (article.author.toString() !== req.user.id.toString()) {
        const likerProfile = await Profile.findOne({ user: req.user.id });
        await Notification.create({
          recipient: article.author,
          sender: req.user.id,
          type: 'post_like',
          title: 'New Like on your article',
          message: `${likerProfile ? likerProfile.fullName : 'Someone'} liked your article "${article.title.slice(0, 40)}".`,
          data: { articleId: article._id },
        });
      }
    }

    await article.save();

    res.status(200).json({
      success: true,
      liked: !isLiked,
      likesCount: article.likes.length,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to article
// @route   POST /api/articles/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required.' });
    }

    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    const comment = await Comment.create({
      targetType: 'Article',
      targetId: article._id,
      author: req.user.id,
      content: content.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate({
      path: 'author',
      select: 'email role',
      populate: { path: 'profile', select: 'firstName lastName headline avatar' },
    });

    res.status(201).json({ success: true, comment: populatedComment });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private
exports.deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    if (article.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this article.' });
    }

    await Comment.deleteMany({ targetId: article._id, targetType: 'Article' });
    await article.deleteOne();

    res.status(200).json({ success: true, message: 'Article deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
