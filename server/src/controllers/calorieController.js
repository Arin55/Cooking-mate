import Calorie from '../models/Calorie.js';

export const addCalorie = async (req, res) => {
  try {
    const { food, calories, date, notes } = req.body;
    const doc = await Calorie.create({ userId: req.user.id, food, calories, date, notes });
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ message: 'Failed to add calorie entry', error: e.message });
  }
};

export const getCalories = async (req, res) => {
  try {
    const docs = await Calorie.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: 'Failed to get calories', error: e.message });
  }
};

export const deleteCalorie = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Calorie.findOne({ _id: id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    await doc.deleteOne();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete calorie entry', error: e.message });
  }
};
