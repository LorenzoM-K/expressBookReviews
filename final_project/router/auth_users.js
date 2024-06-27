const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [ {
        "username": "Lorenzo",
        "password": "12345"
    }];

const isValid = (username)=>{ //returns boolean
  const userMatches = users.filter((user) => user.username === username);
    return userMatches.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
 const matchingUsers = users.filter((user) => user.username === username && user.password === password);
  return matchingUsers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
 const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
            accessToken,username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { username,review} = req.body;
  const { isbn } = req.params;
  

  // Validate if the review, username, and ISBN are provided
  if (!review || !username || !isbn) {
    return res.status(400).json({ message: "Review, username, and ISBN are required." });
  }

  // Check if the user is valid
  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid user." });
  }

  // Check if the user has already reviewed this ISBN
  if (userReviews.hasOwnProperty(isbn) && userReviews[isbn].hasOwnProperty(username)) {
    // Modify the existing review
    userReviews[isbn][username] = review;
  } else {
    // Add a new review
    if (!userReviews.hasOwnProperty(isbn)) {
      userReviews[isbn] = {};
    }
    userReviews[isbn][username] = review;
  }

  return res.status(200).json({ message: "Review added/modified successfully." });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);
    const username = decoded.username;

    if (books[isbn] && books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        res.status(200).json({ message: "Review deleted successfully" });
    } else {
        res.status(404).json({ message: "Review not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
