const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: [true, 'Article content is required'],
    },
    readTime: {
      type: Number,
      default: 3,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    published: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ArticleSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

ArticleSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  next();
});

ArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });
ArticleSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Article', ArticleSchema);
