import * as model from "./model.js";
import { MODAL_CLOSE_SEC } from "./config.js"
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";

import "core-js/stable";
import "regenerator-runtime/runtime";
import { async } from "regenerator-runtime";







// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

if(module.hot) {
  module.hot.accept();
}

const recipeContainer = document.querySelector('.recipe');

const controlRecipes = async function () {
  try { 
    const id = window.location.hash.slice(1);
    
    
    if (!id) return;
    recipeView.renderSpinner();

    // Update result view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    // 1. loading recipe
    bookmarksView.update(model.state.bookmarks);
    await model.loadRecipe(id);
    //const res = await fetch("https://forkify-api.herokuapp.com/api/v2/recipes/5ed6604591c37cdc054bc886");
    
    // 2. rendering recipe
    recipeView.render(model.state.recipe);
    
  
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    const query = searchView.getQuery();

    if(!query) return;

    await model.loadSearchResults(query);

    resultsView.render(model.getSearchResultsPage());

    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controPagination = function(goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
}

const controlServings = function (newServings) {
  model.updateServings(newServings);

  recipeView.update(model.state.recipe);
}

const controlAddBookmark = function () {
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function () {
     bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    setTimeout(function() {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};
  
const init = function() {
     bookmarksView.addHandlerRender(controlBookmarks);
     recipeView.addHandlerRender(controlRecipes);
     recipeView.addHandlerUpdateServings(controlServings);
     recipeView.addHandlerAddBookmark(controlAddBookmark);
     searchView.addHandlerSearch(controlSearchResults);
     paginationView.addHandlerClick(controPagination);
     addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();