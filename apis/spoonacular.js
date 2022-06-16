const API_KEY = "7b66bcffb0ff477498ca05be367d653a";

async function getRecipesByName(name) {
  const query = await fetch(
    `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${name}`
  );
  const data = await query.json();
  return data;
}

export { getRecipesByName };
