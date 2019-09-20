//Requirements
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const path = require("path");

//Server Connection
const MONGODB_URI = "mongodb://username1:password1@ds253017.mlab.com:53017/heroku_kr5xs6xb" || "mongodb://localhost/newsScraper";
var PORT = process.env.PORT || 3000;
var app = express();

// Our scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require Article model
var Article = require("./models/Article");

//==================================================
//Handlebars
const exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//==================================================
// Use morgan logger for logging requests
app.use(logger("dev"));
//==================================================
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI);

// Routes
app.get("/", function(req, res){
  Article.find({"saved": false}, function(error, data) {
    let loadedData = {
      article: data
    };
    console.log(loadedData);
    res.render("index", loadedData);
  });
});



// A GET route for scraping the reuters website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.reuters.com").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    let $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function(i, element) {
      // Save an empty result object
      let result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      result.summary = $(this)
        .children("p")
          .text();

      // Create a new Article using the `result` object built from scraping
      Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res){
  Article.find({}, function(error, data) {
   res.json(data);
    })
  });

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
//Delete single article
app.get("/articles/delete/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ _id: req.params.id })
      .update({ saved: false })
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//Save single article
app.get("/articles/save/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ _id: req.params.id })
      .update({ saved: true })
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//Route for getting saved Articles from the db
app.get("/saved", function(req, res){
  Article.find({"saved": true}, function(error, data) {
    let savedData = {
      article: data
    };
    console.log(savedData);
    res.render("saved", savedData);
  });
});







// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
