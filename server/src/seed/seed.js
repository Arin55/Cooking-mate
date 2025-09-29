import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../lib/db.js';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
import Workout from '../models/Workout.js';
import Calorie from '../models/Calorie.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const run = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Recipe.deleteMany({}),
    Workout.deleteMany({}),
    Calorie.deleteMany({}),
  ]);

  const password = await bcrypt.hash('password123', 10);
  const user = await User.create({ username: 'demo', email: 'demo@example.com', password });

  const recipes = await Recipe.insertMany([
    {
      title: 'Grilled Chicken Salad',
      image: 'https://images.unsplash.com/photo-1556800734-3a53f5b8d4ef',
      ingredients: ['Chicken Breast', 'Lettuce', 'Tomatoes', 'Olive Oil'],
      steps: ['Grill chicken', 'Chop veggies', 'Mix and serve'],
      calories: 420,
      createdBy: user._id,
    },
    {
      title: 'Pasta Primavera',
      image: 'https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642',
      ingredients: ['Pasta', 'Bell Peppers', 'Zucchini', 'Parmesan'],
      steps: ['Boil pasta', 'Saute veggies', 'Combine and season'],
      calories: 550,
      createdBy: user._id,
    },
  ]);

  const workouts = await Workout.insertMany([
    { userId: user._id, exercise: 'Running', duration: 30, caloriesBurned: 300, date: new Date() },
    { userId: user._id, exercise: 'Cycling', duration: 45, caloriesBurned: 450, date: new Date() },
  ]);

  const calories = await Calorie.insertMany([
    { userId: user._id, food: 'Oatmeal', calories: 150, date: new Date() },
    { userId: user._id, food: 'Chicken Wrap', calories: 400, date: new Date() },
  ]);

  console.log('Seed complete:', { user: user.email, recipes: recipes.length, workouts: workouts.length, calories: calories.length });
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
