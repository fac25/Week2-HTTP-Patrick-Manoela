import { getRecipesByName } from "./apis/spoonacular.js";
import { editDocument, getUsers } from "./apis/pantry.js";

/*

o---------------o
| Recipe Search |
o---------------o

*/

const input = document.querySelector(".search__input");
const button = document.querySelector(".search__button");

button.addEventListener("click", handleClick);

async function handleClick() {
  const searchResponse = await getRecipesByName(input.value);
  const recipesArr = searchResponse.results;

  recipesArr.forEach(({ title, image }) =>
    createFromTemplate({
      templateSelector: ".card--template",
      parentSelector: ".recipes",
      content: { imgSrc: image, title },
    })
  );
}

function createFromTemplate({ templateSelector, parentSelector, content }) {
  const parent = document.querySelector(parentSelector);
  const template = document.querySelector(templateSelector);
  const { imgSrc, title } = content;

  const newElement = template.content.cloneNode(true);
  const img = newElement.querySelector(".card__image");
  const name = newElement.querySelector(".card__name");

  img.src = imgSrc;
  name.innerText = title;
  parent.append(newElement);
}

/*

o---------o
| Sign In |
o---------o

*/

const signInBtn = document.querySelector(".sign-in");

// User clicks 'sign in'
signInBtn.addEventListener("click", toggleModal);

// Modal pops up, asking for userName and password
const modal = document.querySelector(".modal");

// Display Modal
function toggleModal() {
  modal.classList.toggle("modal--active");
}

// Hide Modal
const modalCloseBtn = document.querySelector(".modal__close");

modalCloseBtn.addEventListener("click", toggleModal);

// User clicks 'sign in' in the form to validate userName and password
const formSignIn = document.querySelector(".modal__button");

formSignIn.addEventListener("click", signIn);

// Check if information is correct
async function signIn() {
  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;

  const users = await getUsers();
  const currentUserData = users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  );

  console.log(
    currentUserData.password === password
      ? "Signed In"
      : "Wrong password and/or username"
  );
}

/*

o----------o
| Register |
o----------o

*/
