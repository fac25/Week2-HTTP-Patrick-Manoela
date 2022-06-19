/*
  Table of Contents
  -----------------
  {0} Spoonacular API [recipe/nutrition information]
  {1} Pantry API [free cloud JSON storage]
  {2} Recipe Search
  {3} Sign In && Register

  {99} Helper Functions 
*/

// o---------------------o
// | {0} Spoonacular API |
// o---------------------o
const API_KEY = "7b66bcffb0ff477498ca05be367d653a";

async function getRecipesByName(name) {
  const query = await fetch(
    `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${name}&addRecipeInformation=true&fillIngredients=true`
  );
  const data = await query.json();
  return data;
}

// o----------------o
// | {1} Pantry API |
// o----------------o

const PANTRY_ID = "03e72aeb-874d-4b7b-9afc-e5bdb49ef939";
console.log(await getPantryUsers());

async function getPantryUsers() {
  const requestOptions = {
    method: "GET",
    headers: createHeaders(),
    redirect: "follow",
  };

  const response = await fetch(
    `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/users`,
    requestOptions
  );
  const data = await response.json();

  return data.usersArr;
}

async function addPantryUser(data) {
  const requestOptions = {
    method: "PUT",
    headers: createHeaders(),
    body: JSON.stringify(data),
    redirect: "follow",
  };

  // Post information
  const response = await fetch(
    `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/users`,
    requestOptions
  );

  return response.json();
}

function createHeaders() {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  return myHeaders;
}

async function addToSavedList(username, newContent) {
  const data = await getPantryUsers();
  const currentUserIndex = await data.findIndex(
    (user) => user.username === username
  );

  const savedList = data[currentUserIndex].savedList;

  if (!savedList) data[currentUserIndex].savedList = [];

  data[currentUserIndex].savedList.push(newContent);
  addPantryUser(JSON.stringify({ usersArr: [...(await data)] }));
}

// o-------------------o
// | {2} Recipe Search |
// o-------------------o

const searchInput = document.querySelector(".search__input");
const searchButton = document.querySelector(".search__button");

searchButton.addEventListener("click", handleClick);

async function handleClick() {
  const searchResponse = await getRecipesByName(searchInput.value);
  const recipesContainer = document.querySelector(".recipes");
  const recipesArr = searchResponse.results;

  recipesContainer.innerHTML = "";

  createRecipeCards(recipesArr);
}

function createRecipeCards(recipesArr) {
  console.log(recipesArr);
  recipesArr.forEach(
    ({ title, image, extendedIngredients, analyzedInstructions, sourceUrl }) =>
      createFromTemplate({
        templateSelector: ".card--template",
        parentSelector: ".recipes",
        content: {
          imageSrc: image,
          title,
          extendedIngredients,
          analyzedInstructions,
          sourceUrl,
        },
      })
  );
}

function createFromTemplate({ templateSelector, parentSelector, content }) {
  const parent = document.querySelector(parentSelector);
  const template = document.querySelector(templateSelector);
  const {
    imageSrc,
    title,
    extendedIngredients,
    analyzedInstructions,
    sourceUrl,
  } = content;
  const instructionsData = analyzedInstructions[0].steps;

  const newElement = template.content.cloneNode(true);
  const image = newElement.querySelector(".card__image");
  const name = newElement.querySelector(".card__name");
  const ingredients = newElement.querySelector(".card__ingredients");
  const instructions = newElement.querySelector(".card__instructions");
  const seeMore = newElement.querySelector(".card__see-more");

  image.src = imageSrc;
  name.innerText = title;
  ingredients.innerHTML = `
    ${extendedIngredients
      .map(
        (ingredient) =>
          `<li class='card__ingredient>${ingredient.original}</li>`
      )
      .join("")}`;
  instructions.innerHTML = `${instructionsData
    .map((instruction) => `<li class='card__step'>${instruction.step}</li>`)
    .join("")}`;
  seeMore.href = sourceUrl;

  parent.append(newElement);
}

// o-------------------------o
// | {3} Sign In && Register |
// o-------------------------o

const signInBtn = document.querySelector(".sign-in");
const modal = document.querySelector(".modal");
const modalCloseBtn = document.querySelector(".modal__close");
const modalSignIn = document.querySelector(".modal__sign-in");
const modalRegisterBtn = document.querySelector(".modal__register");
const username = document.querySelector("#username");
const password = document.querySelector("#password");

signInBtn.addEventListener("click", toggleModal);
modalCloseBtn.addEventListener("click", toggleModal);
modalSignIn.addEventListener("click", signIn);
modalRegisterBtn.addEventListener("click", createAccount);

// Display Modal
function toggleModal() {
  modal.classList.toggle("modal--active");
}

async function signIn() {
  const users = await getPantryUsers();
  const currentUserData = await users.find(
    (user) => user.username.toLowerCase() === username.value.toLowerCase()
  );

  // If fields are empty, return notification
  if (!username.value || !password.value)
    return createNotification("Please fill out all required fields");

  currentUserData.password === password.value
    ? createNotification("Signed in successfully")
    : createNotification("Incorrect password and/or username");
}

async function createAccount() {
  const data = await getPantryUsers();
  const doesUsernameExist = await data.find(
    (user) => user.username === username.value
  );

  if (doesUsernameExist) return createNotification("Username already exists");

  await addPantryUser({
    usersArr: [{ username: username.value, password: password.value }],
  });

  createNotification("Account created");
}

// o-----------------------o
// | {99} Helper Functions |
// o-----------------------o

function createNotification(text) {
  const notificationsDiv = document.querySelector(".notifications");
  const notification = createElement({
    tag: "div",
    className: "notification",
    parent: notificationsDiv,
    text: text,
  });

  setTimeout(() => notification.remove(), 3000);
}

function createElement({
  tag,
  className,
  parent,
  parentSelector,
  text = "",
  id,
}) {
  const parentEl = parent || $(parentSelector);
  const newElement = document.createElement(tag);

  if (text) newElement.innerText = text;
  if (className) newElement.classList.add(className);
  if (id) newElement.id = id;
  if (parentEl) parentEl.append(newElement);

  return newElement;
}
