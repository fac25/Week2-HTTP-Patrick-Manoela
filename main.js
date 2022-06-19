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
// const API_KEY = "7b66bcffb0ff477498ca05be367d653a";
const API_KEY = "7878bcb59251411fab5fe4c14ee75639";

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

async function getCurrentUserData(username) {
  const users = await getPantryUsers();
  const currentUserData = await users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  );

  return currentUserData;
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
const sideBar = document.querySelector(".side-bar");
const sideBarCloseBtn = document.querySelector(".side-bar__close");
const sideBarSignIn = document.querySelector(".side-bar__sign-in");
const sideBarRegisterBtn = document.querySelector(".side-bar__register");
const username = document.querySelector("#username");
const password = document.querySelector("#password");

// Check if user has already signed in, in previous sessions
if (localStorage.signedIn) signIn();

signInBtn.addEventListener("click", toggleSideBar);
sideBarCloseBtn.addEventListener("click", toggleSideBar);
sideBarSignIn.addEventListener("click", signInAttempt);
sideBarRegisterBtn.addEventListener("click", createAccount);

// Display Modal
function toggleSideBar() {
  sideBar.classList.toggle("side-bar--active");
}

async function signInAttempt() {
  const currentUserData = await getCurrentUserData(username.value);

  // If fields are empty, return notification
  if (!username.value || !password.value)
    return createNotification("Please fill out all required fields");

  if (!currentUserData) return createNotification("Username does not exist");
  currentUserData.password === password.value
    ? signIn()
    : createNotification("Incorrect password");
}

function signIn() {
  const sideBarDefaultContent = document.querySelector(
    ".side-bar__default-content"
  );
  // Hide default content to show binder content
  sideBarDefaultContent.classList.add("side-bar__default-content--hidden");

  // Change Sign In btn content
  signInBtn.innerHTML = "Saved List";

  if (!localStorage.signedIn) createNotification("Signed in successfully");
  localStorage.setItem("signedIn", true);
  localStorage.setItem("username", username.value);

  updateSideBarContent();
}

async function updateSideBarContent() {
  const sideBarTitle = document.querySelector(".side-bar__title");
  const currentUserData = await getCurrentUserData(localStorage.username);
  const savedList = await currentUserData.savedList;

  sideBarTitle.innerText = "Recipe Binder";

  // If user's savedList is empty, exit function
  if (!savedList)
    return createElement({
      tag: "p",
      className: "side-bar__empty",
      parentSelector: ".side-bar__recipes",
      text: "You haven't saved any recipes yet",
    });

  savedList.forEach((item) => {
    const recipeContainer = createElement({
      tag: "div",
      parentSelector: ".side-bar__recipes",
      className: "side-bar__card",
    });

    const recipeImage = createElement({
      tag: "img",
      parent: recipeContainer,
      className: "side-bar__image",
    });
    recipeImage.src = item.image;

    const recipeTitle = createElement({
      tag: "p",
      parent: recipeContainer,
      className: "side-bar__name",
      text: item.title,
    });
  });
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
  const parentEl = parent || document.querySelector(parentSelector);
  const newElement = document.createElement(tag);

  if (text) newElement.innerText = text;
  if (className) newElement.classList.add(className);
  if (id) newElement.id = id;
  if (parentEl) parentEl.append(newElement);

  return newElement;
}
