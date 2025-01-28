const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  const valid = users.filter((user) => user.username === username);
  if (valid.length > 0) {
    return false;
  } else {
    users.push();
    return true;
  }
};

const authenticatedUser = (username, password) => {
  const isAuthenticated = users.filter(
    (user) => user.username === username && user.password === password
  );
  if (isAuthenticated.length > 0) return true;
  else return false;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(404)
      .json({ message: "Please provide a username or password." });
  }
  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ data: password }, "access", {
      expiresIn: 60 * 60,
    });

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).json({ message: "User successfully logged in!" });
  } else {
    res.status(208).json({
      message: "User not registered, please register.",
    });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const { username } = req.session.authorization;

  const selectedBook = books[isbn];
  const formattedReview =
    review.at(0).toUpperCase() + review.slice(1).split("-").join(" ");
  if (selectedBook) {
    const reviews = selectedBook.reviews;
    const userHasReview = Object.keys(reviews).find(
      (review) => review === username
    );
    if (review) {
      if (userHasReview) {
        selectedBook.reviews[userHasReview] = formattedReview;
        res.status(200).json({
          message: `${userHasReview} updated book ${isbn} review to: ${formattedReview}`,
        });
      } else {
        selectedBook.reviews[username] = formattedReview;
        res.status(200).json({
          message: `${username} added the following review to book ${isbn}: ${formattedReview}`,
        });
      }
    } else {
      res.status(404).json({ message: "No review was provided" });
    }
  } else {
    res.status(404).json({ message: "Book with ISBN provided not found." });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { username } = req.session.authorization;

  const selectedBook = books[isbn];
  const userHasReview = Object.keys(selectedBook.reviews).find(
    (review) => review === username
  );
  if (selectedBook && userHasReview) {
    delete selectedBook.reviews[username];
    res.status(200).json({ message: "Review deleted successfully!" });
  } else {
    res
      .status(403)
      .json({ message: "This review does not belong to this user" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
