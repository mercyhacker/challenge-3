const filmsList = document.getElementById('films')
const posterPic = document.getElementById('poster')
const movieTitle = document.getElementById('title')
const movieDuration = document.getElementById('runtime')
const movieInfo = document.getElementById('film-info')
const timeAired = document.getElementById('showtime')
const remTickets = document.getElementById('ticket-num')
const ticketBtn = document.getElementById('buy-ticket')

let fetchUrl = 'http://localhost:3000/films'
function getItems(res) {
    fetch(fetchUrl)
        .then((res) => res.json())
        .then((data) => {
            data.forEach((movie) => {
                const li = document.createElement('li')
                li.innerHTML = `
            ${movie.title.toUpperCase()}
            <button id = 'D${movie.id}'>DELETE</button>
            `

                li.id = `F${movie.id}`
                filmsList.appendChild(li)
                if((movie.capacity - movie.tickets_sold) == 0){
                    li.classList.add ('sold-out')
                    document.getElementById(`D${movie.id}`).disabled=true
                }
                allInfoDisplay(movie)
                removeItem(movie)
            })
            initLoad(data[0])
        })

}
getItems();

function allInfoDisplay(movieItem) {
    let titleLine = document.getElementById(`F${movieItem.id}`)
    titleLine.addEventListener('click', () => {
        remTickets.textContent = `${movieItem.capacity - movieItem.tickets_sold}`
        posterPic.src = movieItem.poster
        movieTitle.textContent = movieItem.title
        movieDuration.textContent = movieItem.runtime
        timeAired.textContent = movieItem.showtime
        movieInfo.textContent = movieItem.description
        if(remTickets.textContent == 0){
            ticketBtn.textContent = 'Sold out!'
        }else(
            ticketBtn.textContent = 'Buy Ticket'
        )
        buyTicket(movieItem)
    })
    
}

function initLoad(movieItem) {
    remTickets.textContent = `${movieItem.capacity - movieItem.tickets_sold}`
    posterPic.src = movieItem.poster
    movieTitle.textContent = movieItem.title
    movieDuration.textContent = movieItem.runtime
    timeAired.textContent = movieItem.showtime
    movieInfo.textContent = movieItem.description
    if(remTickets.textContent == 0){
        ticketBtn.textContent = 'Sold out!'
        
    }else(
        ticketBtn.textContent = 'Buy Ticket'
    )
    buyTicket(movieItem)
}

function buyTicket(movie) {
    ticketBtn.onclick = () => {
        
        if (remTickets.textContent > 0) {
            remTickets.textContent--
            movie.tickets_sold++
            fetch(`${fetchUrl}/${movie.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body:JSON.stringify({
                    tickets_sold:movie.tickets_sold
                })
            }

            )
            .then((res)=> res.json())
            .then(data => {
                remTickets.textContent = `${data.capacity - data.tickets_sold}`
                if(remTickets.textContent == 0){
                    document.getElementById(`D${movie.id}`).disabled=true
                    ticketBtn.textContent = 'Sold out!'
                    document.getElementById(`F${movie.id}`).classList.add('sold-out')
                }
            })

            fetch('http://localhost:3000/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body:JSON.stringify({
                    film_id: movie.id,
                    number_of_tickets: 1
                })
                
            })
            .catch((err) => alert(err.message))
            
        }


    }
}

function removeItem(movie) {
    const deleteBtn = document.getElementById(`D${movie.id}`)
    deleteBtn.addEventListener('click', () => {
        fetch(`${fetchUrl}/${movie.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'

            }
        })

    } )
}
