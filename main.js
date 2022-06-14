import { getRecipeName } from "./spoonacular.js";

const input = document.querySelector("input");
const button = document.querySelector("button");

button.addEventListener("click", handleClick);

async function handleClick() {
  const searchResponse = await getRecipeName(input.value);
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
