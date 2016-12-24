const mongoose = require('../database');

const articleSchema = new mongoose.Schema({
    title: String,
    description: String,
    author: {
        username: String
    },
    comments: [
        {
            description: String,
            author: {
                username: String
            }
        }
    ],
    tags: [String],
    post_date: Date
});

module.exports = mongoose.model('Article', articleSchema);
