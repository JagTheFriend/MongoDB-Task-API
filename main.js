require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config');
const { User, Task } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const isMongoId = (str) => mongoose.Types.ObjectId.isValid(str);

app.get('/', (_req, res) => {
  res.json({ message: 'Task API — Database Integration Phase' });
});

const router = express.Router();

router.post('/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }
  const user = await User.create({ name, email });
  res.status(201).json(user);
});

router.get('/users', async (_req, res) => {
  const users = await User.find();
  res.json(users);
});

router.get('/users/:id', async (req, res) => {
  if (!isMongoId(req.params.id)) {
    return res.status(400).json({ error: 'Malformed system identifier format.' });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Requested resource not found.' });
  res.json(user);
});

router.delete('/users/:id', async (req, res) => {
  if (!isMongoId(req.params.id)) {
    return res.status(400).json({ error: 'Malformed system identifier format.' });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Target resource for deletion operations not found.' });
  }
  res.json({ message: 'Resource successfully purged.', purgedResourceId: user._id });
});

router.post('/tasks', async (req, res) => {
  const { title, status, user } = req.body;
  const errors = [];
  if (!title || !title.trim()) errors.push('Title is required.');
  if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
    errors.push('Status must be pending, in-progress, or completed.');
  }
  if (!user || !isMongoId(user)) errors.push('Valid user ID is required.');
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });

  const newTask = await Task.create({ title: title.trim(), status, user });
  res.status(201).json(newTask);
});

router.get('/tasks', async (_req, res) => {
  const tasks = await Task.find().populate('user', 'name email');
  res.json(tasks);
});

router.get('/tasks/:id', async (req, res) => {
  if (!isMongoId(req.params.id)) {
    return res.status(400).json({ error: 'Malformed system identifier format.' });
  }
  const task = await Task.findById(req.params.id).populate('user', 'name email');
  if (!task) return res.status(404).json({ error: 'Requested resource not found.' });
  res.json(task);
});

router.put('/tasks/:id', async (req, res) => {
  if (!isMongoId(req.params.id)) {
    return res.status(400).json({ error: 'Malformed system identifier format.' });
  }
  const allowed = ['title', 'status', 'user'];
  const updateData = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updateData[key] = req.body[key];
  }
  if (updateData.title !== undefined && !updateData.title.trim()) {
    return res.status(400).json({ error: 'Title cannot be empty.' });
  }
  if (updateData.status && !['pending', 'in-progress', 'completed'].includes(updateData.status)) {
    return res.status(400).json({ error: 'Status must be pending, in-progress, or completed.' });
  }
  if (updateData.user && !isMongoId(updateData.user)) {
    return res.status(400).json({ error: 'Valid user ID is required.' });
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!updatedTask) {
    return res.status(404).json({ error: 'Target resource for update operations not found.' });
  }
  res.json(updatedTask);
});

router.delete('/tasks/:id', async (req, res) => {
  if (!isMongoId(req.params.id)) {
    return res.status(400).json({ error: 'Malformed system identifier format.' });
  }
  const deletedTask = await Task.findByIdAndDelete(req.params.id);
  if (!deletedTask) {
    return res.status(404).json({ error: 'Target resource for deletion operations not found.' });
  }
  res.json({ message: 'Resource successfully purged.', purgedResourceId: deletedTask._id });
});

app.use('/api', router);

// ── Start ────────────────────────────────────────────────

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
