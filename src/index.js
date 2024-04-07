document.addEventListener('DOMContentLoaded', () => {
  const filmsList = document.getElementById('films');
  const movieDetails = document.getElementById('movie-details');

  // Function to fetch and display movie details
  const fetchMovieDetails = async (id) => {
      const response = await fetch(`http://localhost:3000/films/${id}`);
      const movie = await response.json();
      const availableTickets = movie.capacity - movie.tickets_sold;

      movieDetails.innerHTML = `
          <img src="${movie.poster}" alt="${movie.title}" />
          <h2>${movie.title}</h2>
          <p>Runtime: ${movie.runtime} minutes</p>
          <p>Showtime: ${movie.showtime}</p>
          <p>Available Tickets: ${availableTickets}</p>
          <button id="buy-ticket" data-id="${movie.id}" ${
          availableTickets > 0 ? '' : 'disabled'
      }>Buy Ticket</button>
      `;

      // Event listener for buying ticket
      const buyTicketButton = document.getElementById('buy-ticket');
      buyTicketButton.addEventListener('click', () => buyTicket(movie));
  };

  // Function to buy a ticket
  const buyTicket = async (movie) => {
      if (movie.tickets_sold < movie.capacity) {
          const newTicketsSold = movie.tickets_sold + 1;
          const response = await fetch(`http://localhost:3000/films/${movie.id}`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  tickets_sold: newTicketsSold,
              }),
          });

          if (response.ok) {
              await fetch('http://localhost:3000/tickets', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      film_id: movie.id,
                      number_of_tickets: 1,
                  }),
              });

              // Update movie details after buying ticket
              fetchMovieDetails(movie.id);
          }
      }
  };

  // Function to render films menu
  const renderFilmsMenu = async () => {
      const response = await fetch('http://localhost:3000/films');
      const films = await response.json();

      filmsList.innerHTML = films
          .map(
              film => `
              <li class="film-item ${film.tickets_sold >= film.capacity ? 'sold-out' : ''}" data-id="${film.id}">
                  ${film.title}
                  ${
                      film.tickets_sold >= film.capacity
                          ? '<span class="status">Sold Out</span>'
                          : `<button class="buy-ticket-btn" data-id="${film.id}" ${
                                film.tickets_sold >= film.capacity ? 'disabled' : ''
                            }>Buy Ticket</button>`
                  }
                  <button class="delete-btn" data-id="${film.id}">Delete</button>
              </li>`
          )
          .join('');

      // Add event listener to each buy ticket button
      document.querySelectorAll('.buy-ticket-btn').forEach(button => {
          button.addEventListener('click', (event) => {
              event.stopPropagation();
              const id = event.target.dataset.id;
              const movie = films.find(film => film.id === id);
              buyTicket(movie);
          });
      });

      // Add event listener to each delete button
      document.querySelectorAll('.delete-btn').forEach(button => {
          button.addEventListener('click', async (event) => {
              event.stopPropagation();
              const id = event.target.dataset.id;
              await deleteFilm(id);
          });
      });

      // Add event listener to each film item to fetch its details
      document.querySelectorAll('.film-item').forEach(film => {
          film.addEventListener('click', () => {
              const id = film.dataset.id;
              fetchMovieDetails(id);
          });
      });
  };

  // Function to delete a film
  const deleteFilm = async (id) => {
      const response = await fetch(`http://localhost:3000/films/${id}`, {
          method: 'DELETE',
      });

      if (response.ok) {
          const filmItem = document.querySelector(`.film-item[data-id="${id}"]`);
          filmItem.remove();
          movieDetails.innerHTML = ''; // Clear movie details when film is deleted
      }
  };

  // Initial setup
  renderFilmsMenu();
  fetchMovieDetails(1); // Display details of the first movie initially
});
