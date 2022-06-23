/*
  Table of Contents
  -----------------
  {0} Spoonacular API [recipe/nutrition information]
  {1} Pantry API [free cloud JSON storage]
  {2} Recipe Search
  {3} Sign In && Register
  {4} CRUD Recipe Binder
  {5} Sidebar control

  {99} Helper Functions 
*/

// o---------------------o
// | {0} Spoonacular API |
// o---------------------o
// const API_KEY = "7b66bcffb0ff477498ca05be367d653a";
const API_KEY = "7878bcb59251411fab5fe4c14ee75639";

async function getRecipesByName(name) {
  try {
    const query = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${name}&addRecipeInformation=true&fillIngredients=true`
    );
    const data = await query.json();
    return data;
  } catch (error) {
    handleError(error);
  }
}

// o----------------o
// | {1} Pantry API |
// o----------------o

const PANTRY_ID = "03e72aeb-874d-4b7b-9afc-e5bdb49ef939";

async function getPantryUsers() {
  try {
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
  } catch (error) {
    handleError(error);
  }
}

async function getCurrentUserData(username) {
  const users = await getPantryUsers();
  const currentUserData = await users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  );

  return currentUserData;
}

async function addPantryUser(data) {
  try {
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
  } catch (error) {
    handleError(error);
  }
}

async function updateSavedList(username, savedList) {
  try {
    const data = await getPantryUsers();
    const currentUser = await data.find((user) => user.username === username);
    currentUser.savedList = savedList;

    const requestOptions = {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ usersArr: await data }),
      redirect: "follow",
    };

    // Post information
    await fetch(
      `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/users`,
      requestOptions
    );

    return;
  } catch (error) {
    handleError(error);
  }
}

async function deleteFromSavedList(username, deletedItemIndex) {
  const currentUserData = await getCurrentUserData(username);
  const savedList = await currentUserData.savedList;
  if (!savedList) currentUserData.savedList = [];

  currentUserData.savedList.splice(deletedItemIndex, 1);
  await updateSavedList(username, await currentUserData.savedList);
  updateSideBarContent();
}

async function addToSavedList(username, newItem) {
  const currentUserData = await getCurrentUserData(username);
  const savedList = await currentUserData.savedList;
  if (!savedList) currentUserData.savedList = [];

  currentUserData.savedList.push(newItem);
  await updateSavedList(username, await currentUserData.savedList);
  updateSideBarContent();
}

// o-------------------o
// | {2} Recipe Search |
// o-------------------o

const searchInput = document.querySelector(".search__input");
const searchButton = document.querySelector(".search__button");

searchButton.addEventListener("click", handleClick);
searchInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    handleClick();
  }
});
async function handleClick() {
  const searchResponse = await getRecipesByName(searchInput.value);
  const recipesContainer = document.querySelector(".recipes");
  const recipesArr = searchResponse.results;

  recipesContainer.replaceChildren();

  createRecipeCards(recipesArr);
}

function createRecipeCards(recipesArr) {
  recipesArr.forEach(
    ({ title, image, extendedIngredients, analyzedInstructions, sourceUrl }) =>
      createFromTemplate({
        templateSelector: ".card--template",
        parentSelector: ".recipes",
        content: {
          image,
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
  const { image, title, extendedIngredients, analyzedInstructions, sourceUrl } =
    content;
  const instructionsData = analyzedInstructions[0].steps;

  const newElement = template.content.cloneNode(true);
  const imageEl = newElement.querySelector(".card__image");
  const name = newElement.querySelector(".card__name");
  const ingredients = newElement.querySelector(".card__ingredients");
  // const instructions = newElement.querySelector(".card__instructions");
  const seeMore = newElement.querySelector(".card__see-more");
  const saveBtn = newElement.querySelector(".card__save");

  imageEl.src = image;
  imageEl.alt = ""; // Setting alt to empty string for decorative recipe image
  name.innerText = title;
  ingredients.innerHTML = `
    ${extendedIngredients
      .map(
        (ingredient) =>
          `<li class='card__ingredient'>${ingredient.original}</li>`
      )
      .join("")}`;
  // instructions.innerHTML = `${instructionsData
  //   .map((instruction) => `<li class='card__step'>${instruction.step}</li>`)
  //   .join("")}`;
  seeMore.href = sourceUrl;
  saveBtn.addEventListener("click", () =>
    saveRecipe({ image, title, sourceUrl })
  );

  parent.append(newElement);
}

// o-------------------------o
// | {3} Sign In && Register |
// o-------------------------o

const signInBtn = document.querySelector(".sign-in");
const sidebarSignIn = document.querySelector(".sidebar__sign-in");
const sidebarRegisterBtn = document.querySelector(".sidebar__register");

const username = document.querySelector("#username");
const password = document.querySelector("#password");

signInBtn.addEventListener("click", toggleSideBar);
sidebarSignIn.addEventListener("click", signInAttempt);
sidebarRegisterBtn.addEventListener("click", register);

// Check if user has already signed in, in previous sessions
if (localStorage.signedIn) signIn();

async function signInAttempt() {
  const currentUserData = await getCurrentUserData(username.value);

  // If fields are empty, return notification
  if (username.value === "" || password.value === "") {
    return handleInputError("Please fill out all required fields");
  }

  if (!currentUserData) return handleInputError("Username does not exist");
  currentUserData.password === password.value
    ? signIn()
    : handleInputError("Incorrect password");
}

function signIn() {
  const sidebarDefaultContent = document.querySelector(
    ".sidebar__default-content"
  );
  // Hide default content to show binder content
  sidebarDefaultContent.classList.add("sidebar__default-content--hidden");

  // Change Sign In btn content
  signInBtn.innerHTML = "Recipe Binder";
  signInBtn.ariaLabel = "Open Recipe Binder";

  if (!localStorage.signedIn) {
    createNotification("Signed in successfully");
    localStorage.setItem("signedIn", true);
    localStorage.setItem("username", username.value);
  }

  updateSideBarContent();
}

async function register() {
  const data = await getPantryUsers();
  const usernameExists = await data.find(
    (user) => user.username === username.value
  );

  if (username.value === "" || password.value === "") {
    return handleInputError("Please fill out all required fields");
  }

  if (usernameExists) return handleInputError("Username already exists");

  await addPantryUser({
    usersArr: [{ username: username.value, password: password.value }],
  });

  createNotification("Account created");
  signIn();
}

// o------------------------o
// | {4} CRUD Recipe Binder |
// o------------------0-----o
async function updateSideBarContent() {
  const sidebarTitle = document.querySelector(".sidebar__title");
  const currentUserData = await getCurrentUserData(localStorage.username);
  const savedList = await currentUserData?.savedList;

  sidebarTitle.innerText = "Recipe Binder";

  // If user's savedList is empty, exit function
  if (!savedList)
    return createElement({
      tag: "p",
      className: "sidebar__empty",
      parentSelector: ".sidebar__recipes",
      text: "You haven't saved any recipes yet",
    });

  renderSavedList(savedList);
}

function renderSavedList(savedList) {
  const parentContainer = document.querySelector(".sidebar__recipes");

  // Clear element before rendering
  parentContainer.replaceChildren();

  savedList.forEach((item, index) => {
    const recipeAnchor = createElement({
      tag: "a",
      parent: parentContainer,
      className: "sidebar__card",
    });
    recipeAnchor.href = item.sourceUrl;

    const recipeImage = createElement({
      tag: "img",
      parent: recipeAnchor,
      className: "sidebar__image",
    });
    recipeImage.src = item.image;

    const recipeTitle = createElement({
      tag: "h2",
      parent: recipeAnchor,
      className: "sidebar__name",
      text: item.title,
    });

    const deleteBtn = createElement({
      tag: "button",
      parent: recipeAnchor,
      className: "sidebar__delete",
      innerHTML: `<i class="fa fa-trash"></i>`,
    });
    deleteBtn.ariaLabel = "Remove Recipe";

    deleteBtn.addEventListener("click", (event) => {
      // Prevent redirection from Recipe Anchor click
      event.preventDefault();
      deleteFromSavedList(localStorage.username, index);
    });
  });
}

function saveRecipe(recipeInfo) {
  toggleSideBar();
  addToSavedList(localStorage.username, recipeInfo);
}

// o----------------------o
// | {5} Side bar control |
// o----------------------o
const sidebar = document.querySelector(".sidebar");
const sidebarCloseBtn = document.querySelector(".sidebar__close");

// Do not allow screen readers to access sidebar by default
sidebar.inert = true;

document.addEventListener("keydown", hideSideBarOnEscPress);
sidebarCloseBtn.addEventListener("click", toggleSideBar);

// Display/Hide Side bar
function toggleSideBar() {
  sidebar.classList.toggle("sidebar--active");
  toggleInert();
}

// Apply/remove inert [Focus management for keyboard users]
function toggleInert() {
  const pageElements = [
    document.querySelector("nav"),
    document.querySelector("main"),
    document.querySelector("footer"),
    sidebar,
  ];

  pageElements.forEach((element) => (element.inert = !element.inert));
}

function hideSideBarOnEscPress({ key }) {
  if (key === "Escape" && sidebar.classList.contains("sidebar--active"))
    toggleSideBar();
}
// o-----------------------o
// | {99} Helper Functions |
// o-----------------------o

function handleInputError(text) {
  addToInputErrors(text);
  createNotification(text);
}

function addToInputErrors(text) {
  const inputErrorsList = document.querySelector(".sidebar__errors");

  // Empty list
  inputErrorsList.replaceChildren();

  createElement({
    tag: "li",
    className: "sidebar__error",
    parent: inputErrorsList,
    text: text,
  });
}

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
  innerHTML,
  id,
}) {
  const parentEl = parent || document.querySelector(parentSelector);
  const newElement = document.createElement(tag);

  if (innerHTML) newElement.innerHTML = innerHTML;
  if (text) newElement.innerText = text;
  if (className) newElement.classList.add(className);
  if (id) newElement.id = id;
  if (parentEl) parentEl.append(newElement);

  return newElement;
}

function createHeaders() {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  return myHeaders;
}

function handleError(error) {
  console.error(error);
  createNotification("Oops! Something went wrong.");
}
