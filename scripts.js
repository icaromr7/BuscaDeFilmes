'use strict';
const apikey = '228589a75f24e270bf243621ac8aa118';
const baseURL = 'https://api.themoviedb.org/3/';
const imageBaseURL = 'https://image.tmdb.org/t/p/w500';
const btnHome = document.getElementById('homeButton');
const btnFavorites= document.getElementById('favoritesButton');

// This function is used to search for a movie using the movie database API.
// It fetches the data from the API and displays the results in a card format.
async function searchMovie(search = '') {
    try {
        document.getElementById('loading').style.display = 'block';
        let search = document.getElementById('search').value;
        let data = { results: [] };
        for (let page = 1; page <= 50; page++) {
            let response = await fetch(`${baseURL}search/movie?api_key=${apikey}&query=${search}&page=${page}`);
            let pageData = await response.json();
            data.results = [...data.results, ...pageData.results];
        }
        displayMovies(data);
    } catch (err) {
        console.error(err);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// This function is used to fetch the top rated movies from the movie database API.
// It fetches the data from the API and displays the results in a card format.
async function getTopRatedMovies() {
    btnHome.style.color= 'red';
    btnFavorites.style.color= '#ccc';
    try {
        document.getElementById('loading').style.display = 'block';
        let data = { results: [] };
        for (let page = 1; page <= 30; page++) {
            let response = await fetch(`${baseURL}movie/top_rated?api_key=${apikey}&page=${page}`);
            let pageData = await response.json();
            data.results = [...data.results, ...pageData.results];
        }
        displayMovies(data);
    } catch (err) {
        console.error(err);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// This function is used to display the favorite movies stored in the local storage.
// It retrieves the data from the local storage and displays the results in a card format.
async function showFavorites() {
    btnFavorites.style.color= 'red';
    btnHome.style.color= '#ccc';
    try {
        document.getElementById('loading').style.display = 'block';
        let favorites = localStorage.getItem('favorites');
        favorites = favorites ? JSON.parse(favorites) : [];
        let favoriteMovies = [];
        for (let id of favorites) {
            let response = await fetch(`${baseURL}movie/${id}?api_key=${apikey}`);
            let movie = await response.json();
            favoriteMovies.push(movie);
        }
        displayMovies({results: favoriteMovies});
    } catch (err) {
        console.error(err);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// This function is used to display the movies fetched from the API or local storage.
// It creates a card for each movie and appends it to the result section in the HTML.
function displayMovies(data) {
    // Show the loading effect
    document.getElementById('loading').style.display = 'block';

    // Clear the existing movies
    document.getElementById('result').innerHTML = '';

    let favorites = localStorage.getItem('favorites');
    favorites = favorites ? JSON.parse(favorites) : [];

    // Check if data is empty
    if (data.results.length === 0) {
        document.getElementById('result').innerHTML = 'No movies found';
    } else {
        for (let movie of data.results) {
            // Check if the movie has a poster before creating a card
            if (movie.poster_path !== null) {
                let card = createCard(movie);
                let favButton = card.querySelector('button');
                if (favorites.includes(movie.id)) {
                    favButton.innerHTML = '&#9733;'; // filled star
                } else {
                    favButton.innerHTML = '&#9734;'; // empty star
                }
                // Check if the image is loaded successfully
                let image = card.querySelector('img');
                image.onerror = function() {
                    // If the image fails to load, replace it with a placeholder image
                    this.src = 'https://via.placeholder.com/150';
                };
                document.getElementById('result').appendChild(card);
            }
        }
    }

    // Hide the loading effect
    document.getElementById('loading').style.display = 'none';
}

/**
 * This function creates a card for a movie.
 * It creates a div element and assigns it the class 'card'.
 * It then creates an h2 element for the movie title, an img element for the movie poster,
 * a p element for the movie overview, and a button to add the movie to favorites.
 * These elements are appended to the card in order.
 * The function then returns the card.
 *
 * @param {Object} movie - The movie data.
 * @returns {HTMLElement} The card element.
 */
function createCard(movie) {
    let card = document.createElement('div');
    card.className = 'card';

    let image = document.createElement('img');
    image.src = `${imageBaseURL}${movie.poster_path}`;
    card.appendChild(image);

    let cardContent = document.createElement('div');
    cardContent.className = 'card-content';

    let title = document.createElement('h2');
    title.textContent = movie.title;
    title.style.color = 'gold';
    cardContent.appendChild(title);

    let summary = document.createElement('p');
    summary.textContent = movie.overview;
    cardContent.appendChild(summary);

    let favButton = document.createElement('button');
    favButton.className = 'star';
    favButton.innerHTML = '&#9734;';
    favButton.onclick = function() { markAsFavorite(movie.id); };
    favButton.setAttribute('data-id', movie.id);
    cardContent.appendChild(favButton);

    card.appendChild(cardContent);

    let favorites = localStorage.getItem('favorites');
    favorites = favorites ? JSON.parse(favorites) : [];
    if (favorites.includes(movie.id)) {
        favButton.innerHTML = '&#9733;';
    }

    return card;
}

// This function is used to mark a movie as favorite.
// It retrieves the favorite movies from the local storage, checks if the movie is already marked as favorite,
// and adds or removes it from the favorites list accordingly.
// It also updates the star symbol of the favorite button for the movie.
function markAsFavorite(id) {
    let favorites = localStorage.getItem('favorites');
    favorites = favorites ? JSON.parse(favorites) : [];
    let index = favorites.indexOf(id);
    let favButton = document.querySelector(`button[data-id='${id}']`);
    if (index === -1) {
        favorites.push(id);
        if (favButton) favButton.innerHTML = '&#9733;'; // Change this line
    } else {
        favorites.splice(index, 1);
        if (favButton) favButton.innerHTML = '&#9734;'; // Change this line
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// This function is used to fetch the movie genres from the API.
async function getMovieGenres() {
    try {
        let response = await fetch(`${baseURL}genre/movie/list?api_key=${apikey}`);
        let data = await response.json();
        displayGenres(data.genres);
    } catch (err) {
        console.error(err);
    }
}

// This function is used to display the movie genres.
function displayGenres(genres) {
    let genreSelect = document.getElementById('genreSelect');
    for (let genre of genres) {
        let option = document.createElement('option');
        option.value = genre.id;
        option.textContent = genre.name;
        genreSelect.appendChild(option);
    }
}

// This function is used to filter the movies by genre.
async function filterMoviesByGenre() {
    try {
        document.getElementById('loading').style.display = 'block';
        let genreId = document.getElementById('genreSelect').value;
        let data = [];
        for (let page = 1; page <= 50; page++) {
            let response = await fetch(`${baseURL}discover/movie?api_key=${apikey}&with_genres=${genreId}&page=${page}`);
            let pageData = await response.json();
            data = data.concat(pageData.results);
        }
        displayMovies({results: data});
    } catch (err) {
        console.error(err);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// Add an event listener to the select element to filter the movies when a genre is selected.
document.getElementById('genreSelect').addEventListener('change', filterMoviesByGenre);

// Call the getMovieGenres function when the window is loaded.
window.onload = function() {
    getTopRatedMovies();
    getMovieGenres();
};

// Add an event listener to the "Show Favorites" button to display favorite movies when clicked.
document.querySelector('button[onclick="showFavorites()"]').addEventListener('click', showFavorites);

document.getElementById('search').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchMovie();
        event.preventDefault();
    }
});
// Add an event listener to the "Home" button to display top rated movies when clicked.
document.getElementById('homeButton').addEventListener('click', getTopRatedMovies);