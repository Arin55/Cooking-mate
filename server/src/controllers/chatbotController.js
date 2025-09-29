import axios from 'axios';

function mapMealsToRecipes(meals = []){
  return meals.map(m => {
    // Collect ingredients + measures
    const ingredients = [];
    for (let i = 1; i <= 20; i++){
      const ing = m[`strIngredient${i}`];
      const meas = m[`strMeasure${i}`];
      if (ing && ing.trim()) ingredients.push(`${(meas||'').trim()} ${ing.trim()}`.trim());
    }
    return {
      id: m.idMeal,
      title: m.strMeal,
      area: m.strArea,
      category: m.strCategory,
      tags: (m.strTags || '').split(',').filter(Boolean),
      image: m.strMealThumb,
      source: m.strSource || m.strYoutube || `https://www.themealdb.com/meal/${m.idMeal}`,
      instructions: m.strInstructions,
      ingredients,
    };
  });
}

export const chatbotQuery = async (req, res) => {
  try {
    const { message } = req.body;
    const text = String(message || '').trim();
    const lower = text.toLowerCase();
    // Extract a rough search query
    const match = lower.match(/recipe for (.+)$/) || lower.match(/show me (.+)$/) || lower.match(/make (.+)$/);
    const q = match ? match[1] : lower;
    const base = process.env.THEMEALDB_API_BASE || 'https://www.themealdb.com/api/json/v1/1';

    let url = `${base}/random.php`;
    if (q && q !== 'random' && q !== 'surprise') {
      url = `${base}/search.php?s=${encodeURIComponent(q)}`;
    }

    const { data } = await axios.get(url);
    const meals = data?.meals || [];
    const recipes = mapMealsToRecipes(meals);

    let reply = '';
    if (recipes.length) {
      reply = `Here ${recipes.length === 1 ? 'is' : 'are'} ${recipes.length} recipe${recipes.length>1?'s':''} for "${q || 'random'}".`;
    } else {
      reply = `I couldn't find recipes for "${q}". Here's a random pick for you!`;
      const { data: rand } = await axios.get(`${base}/random.php`);
      const fallback = mapMealsToRecipes(rand?.meals || []);
      recipes.push(...fallback);
    }

    res.json({ reply, recipes });
  } catch (e) {
    res.status(500).json({ message: 'Chatbot failed', error: e.message });
  }
};
