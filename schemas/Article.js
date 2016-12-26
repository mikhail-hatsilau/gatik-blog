const mongoose = require('../database');

const AuthorSchema = new mongoose.Schema({
    username: String
});

const CommentSchema = new mongoose.Schema({
    description: String,
    comment_author: AuthorSchema,
    post_date: Date
});

const articleSchema = new mongoose.Schema({
    title: String,
    description: String,
    author: AuthorSchema,
    comments: [CommentSchema],
    tags: [String],
    post_date: Date
});

module.exports = mongoose.model('Article', articleSchema);
