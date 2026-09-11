import mongoose from 'mongoose';

const CodeReviewSchema = new mongoose.Schema({
  reviewId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  language: String,
  issues: [
    {
      line: Number,
      severity: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low', 'info']
      },
      type: {
        type: String,
        enum: ['bug', 'security', 'performance', 'style', 'logic']
      },
      description: String,
      suggestion: String,
      fixedCode: String
    }
  ],
  summary: String,
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  recommendations: [String],
  conversationId: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

CodeReviewSchema.index({ severity: 1, type: 1 });

export default mongoose.model('CodeReview', CodeReviewSchema);
