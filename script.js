const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";
const books = [];
const RENDER_EVENT = "render-bookshelf";

function generateID(){
    return +new Date();
}

function generateBookObj(id, title, author, year, isFinished){
    return {
        id,
        title,
        author,
        year,
        isFinished
    };

};

function showBookData(bookObj){
    const bookTitle = document.createElement("h2");
    bookTitle.innerText = bookObj.title;
    bookTitle.classList.add("title");

    const bookAuthor = document.createElement("p");
    bookAuthor.innerText = bookObj.author;

    const bookYear = document.createElement("p");
    bookYear.innerText = bookObj.year;

    const bookInfoContainer = document.createElement("div");
    bookInfoContainer.classList.add("inner");
    bookInfoContainer.append(bookTitle, bookAuthor, bookYear);

    const container = document.createElement("div");
    container.classList.add("textContainer");
    container.append(bookInfoContainer);
    container.setAttribute("id", `book-${bookObj.id}`);

    if(bookObj.isFinished){
        const undoButton = document.createElement("button");
        undoButton.classList.add("btn-data", "undo");
        undoButton.setAttribute("title", "Belum selesai dibaca");

        undoButton.addEventListener("click", function(){
            undoFinishedBook(bookObj.id)
        });

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn-data", "delete");
        deleteButton.setAttribute("title", "Hapus buku");

        deleteButton.addEventListener("click", function(){
            deleteBookFromList(bookObj.id);
        });

        container.append(undoButton, deleteButton);

    } else {
        const finishButton = document.createElement("button");
        finishButton.classList.add("btn-data", "done");
        finishButton.setAttribute("title", "Sudah selesai dibaca");

        finishButton.addEventListener("click", function(){
            addBookFinished(bookObj.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn-data", "delete");
        deleteButton.setAttribute("title", "Hapus buku");

        deleteButton.addEventListener("click", function(){
            deleteBookFromList(bookObj.id);
        });

        container.append(finishButton, deleteButton);
    };

    return container;

}

function addBookFinished(bookID){
    const bookTarget = findBookID(bookID);

    if (bookTarget == null) return;

    bookTarget.isFinished = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

}

function undoFinishedBook(bookID){
    const bookTarget = findBookID(bookID);

    if(bookTarget == null) return;

    bookTarget.isFinished = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function deleteBookFromList(bookID){
    Swal.fire({
        title: "Yakin mau hapus buku ini?",
        text: "Buku ini akan dihapus secara permanen dari daftar koleksi",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#C0564B",
        confirmButtonText: 'Ya, hapus bukunya!'
     }).then((result) => {
        if (result.isConfirmed) {
            const bookTarget = findBookIndex(bookID);

            if(bookTarget === -1) return;
        
            books.splice(bookTarget, 1);
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();

        Swal.fire("Berhasil", "Buku sudah dihapus!", "success");
        } else if (result.dismiss === Swal.DismissReason.cancel
        ) {
          Swal.fire(
            'Dibatalkan',
            'Buku ini tidak jadi dihapus.',
            'error'
          )
        }
     });

}

function findBookIndex(bookID){
    for(const index in books){
        if(books[index].id == bookID){
            return index;
        }
    }

    return -1;
}

function findBookID(bookID){
    for(const bookItem of books){
        if (bookItem.id == bookID){
            return bookItem;
        }
    }

    return null;
}

function checkisFinished() {
    const check = document.getElementById("isFinished");
    if(check.checked){
        return true;
    } else {
        return false;
    }
}

function addBook(){
    const textTitle = document.getElementById("title").value;
    const textAuthor = document.getElementById("author").value;
    const textYear = document.getElementById("year").value;
    const idData = generateID();
    const isFinish = checkisFinished();

    const bookObj = generateBookObj(idData, textTitle, textAuthor, textYear, isFinish);

    books.push(bookObj)

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

}

function saveData(){
    if(isStorageExist()){
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}

function isStorageExist(){
    if(typeof(Storage) === undefined){
        alert("Browser Anda tidak mendukung local storage");
        return false;
    }

    return true;
}

function loadDataFromStorage(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if(data != null){
        for(const book of data){
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));

}

function deleteAllBooks() {
    Swal.fire({
       title: "Yakin mau hapus semua koleksi buku?",
       text: "Semua buku akan dihapus secara permanen dari daftar koleksi",
       icon: "warning",
       showCancelButton: true,
       confirmButtonColor: "#C0564B",
       confirmButtonText: 'Ya, hapus semuanya!'
    }).then((result) => {
       if (result.isConfirmed) {
          books.splice(0, books.length);
          document.dispatchEvent(new Event(RENDER_EVENT));
          saveData();
 
          Swal.fire("Berhasil", "Semua koleksi buku sudah dihapus!", "success");
       } else if (result.dismiss === Swal.DismissReason.cancel
       ) {
         Swal.fire(
           'Dibatalkan',
           'Semua koleksi buku tidak jadi dihapus.',
           'error'
         )
       }
    });
}

const deleteAllButton = document.getElementById("delete-all-btn");
deleteAllButton.addEventListener("click", function(){
    deleteAllBooks();
});


const searchBar = document.getElementById("item-search");
searchBar.addEventListener("keyup", function(event){
    const searchTitle = event.target.value.toString().toLowerCase();
    const bookList = document.querySelectorAll(".textContainer"); 

    bookList.forEach((book) => {
        const inner = book.childNodes[0];
        const bookTitle = inner.firstChild.textContent.toLowerCase();

        if(bookTitle.indexOf(searchTitle) != -1){
            book.setAttribute("style", "display: flex;");
        } else {
            book.setAttribute("style", "display: none;");
        }
    });
});


document.addEventListener("DOMContentLoaded", function(){
    const submitData = document.getElementById("book-form");
    submitData.addEventListener("submit", function(event){
        event.preventDefault();
        addBook();

        submitData.reset();
    });

    if(isStorageExist()){
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function(){
    console.log(books);
    const listUnfinished = document.getElementById("not-finished-list");
    listUnfinished.innerHTML = "";

    const listFinished = document.getElementById("finished-list");
    listFinished.innerHTML = "";

    for(const itemBook of books){
        const bookData = showBookData(itemBook);
        if(!itemBook.isFinished){
            listUnfinished.append(bookData);
        } 
        else {
            listFinished.append(bookData);
        }
    }

  
    const deleteAllButton = document.getElementById("delete-all-btn");
    if(books.length == 0){
        deleteAllButton.style.display = "none";
    } else {
        deleteAllButton.style.display = "block";
    }
    
    
});

document.addEventListener(SAVED_EVENT, function(){
    console.log(localStorage.getItem(STORAGE_KEY));
});