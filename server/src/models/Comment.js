const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['Post', 'Article'],
      default: 'Post',
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
    },
    likes: [
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

CommentSchema.index({ targetId: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', CommentSchema);
