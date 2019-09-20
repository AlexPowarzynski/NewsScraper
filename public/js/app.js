//Scrape button
$(document).on("click", ".scrape", function() {
    $.ajax({
        method: "GET",
        url: '/scrape'
        }).then(function(data){
            console.log(data);
            location.reload();
        })

});

// When you click the save button
$(document).on("click", ".saveArticle", function() {
  // Grab the id associated with the article from the submit button
  let thisArticle = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/save/" + thisArticle
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      location.reload();
    });

});

$(document).on("click", ".delArticle", function() {
  // Grab the id associated with the article from the delete button
  let thisArticle = $(this).attr("data-id");


  $.ajax({
    method: "POST",
    url: "/articles/delete/" + thisArticle
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      location.reload();
    });

});
