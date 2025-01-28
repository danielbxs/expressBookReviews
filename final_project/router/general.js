const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require("axios");
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      users.push({ username, password });
      res.status(201).json({ message: "User registered successfully!" });
    } else {
      res.status(404).json({ message: "Username is not valid" });
    }
  } else {
    res.status(404).json({ message: "Please provide a username and password" });
  }
});

function getAllBooks() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  getAllBooks()
    .then((books) => res.send(JSON.stringify(books, null, 4)))
    .catch((err) => res.status(500).json({ message: "Failed to fetch books" }));
});

function getBookWithISBN(isbn) {
  return new Promise((resolve, reject) => {
    const selectedBook = books[isbn];
    if (selectedBook) {
      resolve(selectedBook);
    } else {
      reject(new Error("Book with provided ISBN not found"));
    }
  });
}

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const { isbn } = req.params;
  getBookWithISBN(isbn)
    .then((selectedBook) => res.send(JSON.stringify(selectedBook, null, 4)))
    .catch((err) => res.status(404).json({ message: err }));
});

function getBookDetails(author) {
  return new Promise((resolve, reject) => {
    const selectedAuthors = Object.values(books).filter(
      (book) =>
        book.author.split(" ").join("-").toLowerCase() ===
        author.split(" ").join("-").toLowerCase()
    );

    if (selectedAuthors.length > 0) {
      resolve(selectedAuthors);
    } else {
      reject(new Error("Author not found"));
    }
  });
}

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const { author } = req.params;
  getBookDetails(author)
    .then((selectedAuthors) =>
      res.send(JSON.stringify(selectedAuthors, null, 4))
    )
    .catch((err) => res.status(404).json({ message: err }));
});

function getBookByTitle(title) {
  return new Promise((resolve, reject) => {
    const selectedTitle = Object.values(books).find(
      (book) =>
        book.title.split(" ").join("-").toLowerCase() ===
        title.split(" ").join("-").toLowerCase()
    );

    if (selectedTitle) {
      resolve(selectedTitle);
    } else {
      reject(new Error("Book title not found"));
    }
  });
}

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const { title } = req.params;

  getBookByTitle(title)
    .then((selectedTitle) => res.send(JSON.stringify(selectedTitle, null, 4)))
    .catch((err) => res.status(404).json({ message: err }));
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const { isbn } = req.params;
  const selectedBook = books[isbn];
  if (selectedBook) {
    res.send(JSON.stringify(selectedBook.reviews, null, 4));
  } else {
    res.status(404).json({ message: "Book with ISBN provided not found" });
  }
});

module.exports.general = public_users;
