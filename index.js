
const request = require("superagent");
const cheerio = require("cheerio");
const moment = require("moment");
const fs = require("fs");
const json2csv = require("json2csv").parse;

const fields = [
  'date',
  'title',
  'url',
  'likes',
  'dislikes',
  'recommendationsToOthers',
  'businessProplemsAndSolutions',
  'stars'
];

const opts = { fields };

const reviews = [];

request.get('https://www.g2crowd.com/products/cision/reviews').end((err, res) => {
  if (err) {
    throw err;
  }
  

  parseReviews(res.text);

  try {
    const result = json2csv(reviews, opts);

    fs.writeFile('./scrape.csv', result, err => {
      if (err) {
        console.error(err);
      }
    });
  } catch (err) {
    console.error(err);
  }
});

const parseReviews = body => {
  const $ = cheerio.load(body);

  $('div[itemprop="review"]').each((idx, item) => {
    let review = {};

    review.title = $(item).find('.review-list-heading').text();
    review.date = $(item).find('time').text();
    review.url = 'https://www.g2crowd.com' + $(item).find('.review-list-heading').closest('a').attr('href');

    $(item).find('[itemprop="reviewBody"] h5').each((idx, question) => {
      if ($(question).text() === 'What do you like best?') {
        review.likes = $(question).next().find('p.formatted-text').text();
      } else if ($(question).text() === 'What do you dislike?') {
        review.dislikes = $(question).next().find('p.formatted-text').text();
      } else if ($(question).text() === 'What business problems are you solving with the product?  What benefits have you realized?') {
        review.businessProplemsAndSolutions = $(question).next().find('p.formatted-text').text();
      } else if ($(question).text() === 'Recommendations to others considering the product') {
        review.recommendationsToOthers = $(question).next().find('p.formatted-text').text();
      }
    });

    const starsEl = $(item).find('.stars').attr('class');
    switch (starsEl) {
      case 'stars large stars-0':
        review.stars = '0';
        break;
      case 'stars large stars-1':
        review.stars = '.5';
        break;
      case 'stars large stars-2':
        review.stars = '1';
        break;
      case 'stars large stars-3':
        review.stars = '1.5';
        break;
      case 'stars large stars-4':
        review.stars = '2';
        break;
      case 'stars large stars-5':
        review.stars = '2.5';
        break;
      case 'stars large stars-6':
        review.stars = '3';
        break;
      case 'stars large stars-7':
        review.stars = '3.5';
        break;
      case 'stars large stars-8':
        review.stars = '4';
        break;
      case 'stars large stars-9':
        review.stars = '4.5';
        break;
      case 'stars large stars-10':
        review.stars = '5';
        break;
    }

    reviews.push(review);
  });
};