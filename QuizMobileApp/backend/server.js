const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5001; // Different port from main backend

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// In-memory data store for mobile app
let quizData = {
  questions: [
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correct: 2,
      category: "Geography"
    },
    {
      id: 2,
      question: "Which programming language is this app built with?",
      options: ["Python", "JavaScript", "Java", "C++"],
      correct: 1,
      category: "Technology"
    },
    {
      id: 3,
      question: "What year was the first iPhone released?",
      options: ["2006", "2007", "2008", "2009"],
      correct: 1,
      category: "Technology"
    }
  ],
  scores: [],
  users: []
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'QuizMobileApp Backend is running!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get('/api/questions', (req, res) => {
  try {
    res.json({
      success: true,
      questions: quizData.questions,
      total: quizData.questions.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/questions/:id', (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    const question = quizData.questions.find(q => q.id === questionId);
    
    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }
    
    res.json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/submit-answer', (req, res) => {
  try {
    const { questionId, answer, userId } = req.body;
    const question = quizData.questions.find(q => q.id === questionId);
    
    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }
    
    const isCorrect = question.correct === answer;
    const score = {
      id: Date.now(),
      userId: userId || 'anonymous',
      questionId,
      answer,
      correct: isCorrect,
      timestamp: new Date().toISOString()
    };
    
    quizData.scores.push(score);
    
    res.json({
      success: true,
      correct: isCorrect,
      correctAnswer: question.correct,
      explanation: isCorrect ? 'Correct!' : `Wrong! The correct answer was: ${question.options[question.correct]}`,
      score
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/scores', (req, res) => {
  try {
    const { userId } = req.query;
    let scores = quizData.scores;
    
    if (userId) {
      scores = scores.filter(score => score.userId === userId);
    }
    
    res.json({
      success: true,
      scores,
      total: scores.length,
      correctAnswers: scores.filter(s => s.correct).length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const totalQuestions = quizData.questions.length;
    const totalAttempts = quizData.scores.length;
    const correctAnswers = quizData.scores.filter(s => s.correct).length;
    const accuracy = totalAttempts > 0 ? ((correctAnswers / totalAttempts) * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      stats: {
        totalQuestions,
        totalAttempts,
        correctAnswers,
        accuracy: `${accuracy}%`,
        categories: [...new Set(quizData.questions.map(q => q.category))]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve mobile app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 QuizMobileApp Backend running on http://localhost:${PORT}`);
  console.log(`📱 Mobile App: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Questions API: http://localhost:${PORT}/api/questions`);
});

module.exports = app;