/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

 // Fend off an XSS attack
 const escape =  function(str) {
  let div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

const renderTweets = function(tweets) {
  if (Array.isArray(tweets)) {
    return tweets.forEach(tweet => {
      $('#tweets-container').prepend(createTweetElement(tweet));
    });
  } else {
    return $('#tweets-container').prepend(createTweetElement(tweets));
  }
};

// Create the tweet and its HTML
const createTweetElement = function(tweetObj) {
  const dateOfTweet = new Date(tweetObj.created_at);
  
  const timeSinceTweet = () => {
    const now = new Date();
    const msInDay = 24 * 60 * 60 * 1000;
    const diffInDay = (now - dateOfTweet) / msInDay;
    const diffInHours = diffInDay * 24;
    const diffInMinutes = diffInHours * 60;
    if (Math.floor(diffInHours) === 0) {		
      return `${Math.floor(diffInMinutes)} minutes`;		
    } else if (Math.floor(diffInDay / 365) === 0) {
      return `${Math.floor(diffInHours)} hours`;
    } else if (diffInDay < 31) {
      return `${Math.floor(diffInDay / 365)} days`;
    } else if (diffInDay <= 365) {
      return `${Math.floor(diffInDay / 31)} months`;
    } else {
      return `${Math.floor(diffInDay / 365)} years`;
    }
  };

  const element = `
    <article class="tweet">
    <header>
      <div class="wrapper">
        <img src=${tweetObj.user.avatars} />
        <span class="name">${tweetObj.user.name}</span>
      </div>
      <span class="handle">${tweetObj.user.handle}</span>
    </header>
    <div class="content">
        ${escape(tweetObj.content.text)}
    </div>
    <footer>
      <span class="date">
      ${timeSinceTweet()} ago
      </span>
      <div class="actions">
        <img src="/images/flag.png">
        <img src="/images/retweet-symbol.png">
        <img src="/images/like-symbol.png">
      </div>
    </footer>
    </article>
  `;
  return element;
};

// Add tweets to the HTML page
const loadTweets = (url, method, cb) => {
  $.ajax({
    url,
    method,
  })
    .done(data => {
      cb(data);
    })
    .fail(err => {
      console.log('Error:', err);
    })
    .always(() => {
      console.log("Tweets loaded!");
    });
};

// Add a submitted tweet to the HTML page
const loadNewTweet = (url, method, cb) => {
  $.ajax({
    url,
    method,
  })
    .done(data => {
      cb(data[data.length - 1]);
    })
    .fail(err => {
      console.log('Error:', err);
    })
    .always(() => {
      console.log("Tweets loaded!");
    });
};

// Reset the compose form
const refreshPage = () => {
  $('textarea').val('');
  $('.counter').text(140);
  loadNewTweet("/tweets", "GET", renderTweets);
};

// Check if the tweet submitted isn't empty/too long
const submitHandler = (text) => {
  if (!text) {
    $('.error-message').slideDown();
    $('.error-message strong').text("Your tweet is empty");
    return;
  } else if (text.length > 140) {
    $('.error-message').slideDown();
    $('.error-message strong').text(`Your tweet is too long: ${text.length} characters`);
    return;
  } else {
    $.ajax({
      url: '/tweets',
      method: 'POST',
      data: {
        text
      }
    })
      .done(() => {
        console.log('Success!');
        refreshPage();
      })
      .fail((err) => {
        console.log("Error:", err);
      })
      .always(() => {
        console.log("Done!");
      });
  }
};

$(document).ready(function() {
  loadTweets("/tweets", "GET", renderTweets);
  $(".error-message").hide();
  $(".new-tweet").hide();

  $("form").on("submit", function() {
    event.preventDefault();
    $(".error-message").slideUp();
    console.log('Performing AJAX request...');
    submitHandler($('textarea').val());
  });

  $("nav button").on("click", () => {
    $(".new-tweet").slideToggle();
    $(".error-message").slideUp();
    $("textarea").focus();
  });

});