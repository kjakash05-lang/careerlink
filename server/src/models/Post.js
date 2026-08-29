const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'link', 'document'],
    default: 'image',
  },
  url: { type: String, required: true },
  title: { type: String },
  preview: { type: String },
});

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    content: {
      type: String,
      required: function() {
        return !this.isRepost; // Content required only if not a simple repost
      },
      default: '',
      trim: true,
    },
    media: [MediaSchema],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    sharesCount: {
      type: Number,
      default: 0,
    },
    // Repost functionality
    originalPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    isRepost: {
      type: Boolean,
      default: false,
    },
    repostCommentary: {
      type: String,
      default: '',
      trim: true,
    },
    reposts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for comments
PostSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'targetId',
  justOne: false,
});

PostSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

PostSchema.virtual('repostsCount').get(function () {
  return this.reposts ? this.reposts.length : 0;
});

PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ content: 'text' });
PostSchema.index({ originalPost: 1 });

module.exports = mongoose.model('Post', PostSchema);
