import Workout from '../models/Workout.js';

export const addWorkout = async (req, res) => {
  try {
    const { exercise, duration, caloriesBurned, date, type, sets, reps, weight, distance, notes } = req.body;
    const doc = await Workout.create({ userId: req.user.id, exercise, duration, caloriesBurned, date, type, sets, reps, weight, distance, notes });
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ message: 'Failed to add workout', error: e.message });
  }
};

export const getWorkouts = async (req, res) => {
  try {
    const docs = await Workout.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: 'Failed to get workouts', error: e.message });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Workout.findOne({ _id: id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    await doc.deleteOne();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete workout', error: e.message });
  }
};
