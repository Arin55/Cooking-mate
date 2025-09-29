import Diet from '../models/Diet.js';

export const addDiet = async (req, res) => {
  try {
    const { food, calories, date } = req.body;
    const doc = await Diet.create({ userId: req.user.id, food, calories, date });
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ message: 'Failed to add diet entry', error: e.message });
  }
};

export const getDiets = async (req, res) => {
  try {
    const docs = await Diet.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: 'Failed to get diet entries', error: e.message });
  }
};

export const deleteDiet = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Diet.findOne({ _id: id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    await doc.deleteOne();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete diet entry', error: e.message });
  }
};
