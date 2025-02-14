var ghpages = require('gh-pages');

ghpages.publish('b', function(err) {
    console.log(err);
});