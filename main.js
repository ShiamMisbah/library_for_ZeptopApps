var sidebarStatus = false;
var genreList = []

window.onload = () => {
  const path = window.location.pathname;

  if (path === '/index.html'){
    fetchBooks()
  } else if (path === '/wishlist.html'){
    fetchListedBooks()
  }

};

const fetchListedBooks = async () => {
  console.log(JSON.parse(localStorage.getItem("wishlist")));
  const idList = JSON.parse(localStorage.getItem("wishlist"));
  
  if (idList)
  {try {
    const response = await fetch(`https://gutendex.com/books?ids=${idList.join(',')}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    displayBooks(data.results);
    console.log(data);
  } catch (error) {
    console.error("Error fetching books:", error);
    document.getElementById("error-message").textContent =
      "Failed to fetch books. Please try again later.";
  }}
};


const fetchBooks = async (page = 1) => {
  try {
    const response = await fetch(`https://gutendex.com/books?page=${page}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    displayBooks(data.results);
    setupPagination(data.results, page);
  } catch (error) {
    console.error("Error fetching books:", error);
    document.getElementById("error-message").textContent =
      "Failed to fetch books. Please try again later.";
  }
};

const displayBooks = (books) => {
    
  library.innerHTML = '';
  books.forEach(book => {
      const genres = book.bookshelves;
      const filteredCategories = genres
        .filter((category) => category.startsWith("Browsing:"))
        .map((category) => category.replace("Browsing: ", ""))
      createGenreList(filteredCategories);
      const bookCard = `
      <div class="bookCard" onclick="goToBookDetails(${book.id})">
        <div class="infoSection">
          <img src="${book.formats['image/jpeg']}" alt="${book.title}" class="book-cover" />
          <h5>${book.title}</h5>
          <p>Author: ${book.authors.map(author => author.name).join(', ')}</p>
          <p class="genre">Genre: ${filteredCategories.length ? filteredCategories.join(', ') : 'N/A'}</p>
          <p>Book ID: ${book.id}</p>
        </div>
        <button onclick="toggleWishlist(event, ${book.id})" class="wishlistBtn" data-id="${book.id}">
          <i class="${isWishlisted(book.id) ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
      </div>
      `;
      library.innerHTML += bookCard;
  });

  genreList.forEach(genre => {
    bookGenre.innerHTML += `<option value="${genre}">${genre}</option>`;
  })
  
    
};

function goToBookDetails(bookId) {
  window.location.href = `/bookInfo.html?id=${bookId}`;
}

const createGenreList = (filteredCategories) => {
  const uniqueGenres = new Set([...genreList, ...filteredCategories]);
  genreList.length = 0
  genreList.push(...uniqueGenres);
};

// Setup pagination buttons dynamically based on total pages
const setupPagination = (data, page) => {
  const paginationControls = document.getElementById('paginationControls');
  paginationControls.innerHTML = ''

  // Create Previous button
  if (page > 1) {
    const prevButton = document.createElement('button');
    prevButton.innerText = 'Previous';
    prevButton.onclick = () => fetchBooks(page - 1)
    paginationControls.appendChild(prevButton);
  }

  if (page) {
    const nextButton = document.createElement("button");
    nextButton.innerText = "Next";
    nextButton.onclick = () => fetchBooks(page + 1);
    paginationControls.appendChild(nextButton);
  }
};

const toggleWishlist = (event, bookId) => {
  event.stopPropagation();
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const buttonElement = event.currentTarget;
  const children = buttonElement.children;

  if (wishlist.includes(bookId)) {
    wishlist = wishlist.filter((id) => id !== bookId);
    children[0].classList.remove("fa-solid");
    children[0].classList.add("fa-regular");
  } else {
    wishlist.push(bookId);
    children[0].classList.remove("fa-regular");
    children[0].classList.add("fa-solid");
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  
}

const isWishlisted = (bookId) => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    return wishlist.includes(bookId);

};

const filterBooks = () => {
  const query = document.getElementById("search-bar").value.toLowerCase();
  const books = document.querySelectorAll(".bookCard");
  
  books.forEach((book) => {
    const title = book.querySelector("h5").innerText.toLowerCase();
    book.style.display = title.includes(query) ? "block" : "none";
  });
};

function filterBooksByGenre() {
  const query = document.getElementById("bookGenre").value.toLowerCase();
  const books = document.querySelectorAll(".bookCard");
  console.log(query);
  

  books.forEach((book) => {
    const genreTitle = book.querySelector(".genre").innerText.toLowerCase();
    book.style.display = genreTitle.includes(query) ? "block" : "none";
  });
}
