const KnowledgeArticle = require('../models/KnowledgeArticle');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');
const { paginate, buildSort } = require('../utils/helpers');

exports.createArticle = async (req, res, next) => {
  try {
    req.body.author = req.user._id;
    const article = await KnowledgeArticle.create(req.body);

    await ActivityLog.create({
      actor: req.user._id,
      action: 'created',
      resourceType: 'knowledge',
      resourceId: article._id,
      description: `Knowledge article created: ${article.title}`,
      ip: req.ip
    });

    res.status(201).json({ success: true, message: 'Article created', data: article });
  } catch (error) {
    next(error);
  }
};

exports.getArticles = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const filter = { isActive: true };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.tag) filter.tags = req.query.tag;
    if (req.query.author) filter.author = req.query.author;

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
        { tags: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const sort = buildSort(req.query.sortBy || '-createdAt');

    const [articles, total] = await Promise.all([
      KnowledgeArticle.find(filter)
        .populate('author', 'name email profilePicture')
        .select('-content')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      KnowledgeArticle.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: articles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: skip + articles.length < total }
    });
  } catch (error) {
    next(error);
  }
};

exports.getArticle = async (req, res, next) => {
  try {
    const article = await KnowledgeArticle.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name email profilePicture');

    if (!article) {
      return next(new AppError('Article not found', 404));
    }

    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

exports.updateArticle = async (req, res, next) => {
  try {
    const article = await KnowledgeArticle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    if (!article) {
      return next(new AppError('Article not found', 404));
    }

    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

exports.deleteArticle = async (req, res, next) => {
  try {
    const article = await KnowledgeArticle.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!article) {
      return next(new AppError('Article not found', 404));
    }

    res.json({ success: true, message: 'Article deleted' });
  } catch (error) {
    next(error);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const article = await KnowledgeArticle.findById(req.params.id);
    if (!article) {
      return next(new AppError('Article not found', 404));
    }

    const index = article.likes.indexOf(req.user._id);
    if (index > -1) {
      article.likes.splice(index, 1);
    } else {
      article.likes.push(req.user._id);
    }

    await article.save();
    res.json({ success: true, data: { likes: article.likes.length, isLiked: index === -1 } });
  } catch (error) {
    next(error);
  }
};

exports.toggleBookmark = async (req, res, next) => {
  try {
    const article = await KnowledgeArticle.findById(req.params.id);
    if (!article) {
      return next(new AppError('Article not found', 404));
    }

    const index = article.bookmarks.indexOf(req.user._id);
    if (index > -1) {
      article.bookmarks.splice(index, 1);
    } else {
      article.bookmarks.push(req.user._id);
    }

    await article.save();
    res.json({ success: true, data: { bookmarks: article.bookmarks.length, isBookmarked: index === -1 } });
  } catch (error) {
    next(error);
  }
};

exports.getBookmarkedArticles = async (req, res, next) => {
  try {
    const articles = await KnowledgeArticle.find({ bookmarks: req.user._id, isActive: true })
      .populate('author', 'name email')
      .select('-content');

    res.json({ success: true, data: articles });
  } catch (error) {
    next(error);
  }
};
