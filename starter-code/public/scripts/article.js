'use strict';

// REVIEW: Check out all of the functions that we've cleaned up with arrow function syntax.

// TODO: Wrap the entire contents of this file in an IIFE.
(function(module) {

  // Set a parameter in the anonymous function that we immediately call called module.
  // Then pass in the global browser object - "window" - as an argument to our IIFE.
  function Article(rawDataObj) {
    /* REVIEW: In lab 8, we explored a lot of new functionality going on here. Let's re-examine
    the concept of context.
    Normally, "this" inside of a constructor function refers to the newly instantiated object.
    However, in the function we're passing to forEach, "this" would normally refer to "undefined"
    in strict mode. As a result, we had to pass a second argument to forEach to make sure our "this"
    was still referring to our instantiated object.
    One of the primary purposes of lexical arrow functions, besides cleaning up syntax to use fewer
    lines of code, is to also preserve context. That means that when you declare a function using
    lexical arrows, "this" inside the function will still be the same "this" as it was outside
    the function.
    As a result, we no longer have to pass in the optional "this" argument to forEach!*/
    Object.keys(rawDataObj).forEach(key => this[key] = rawDataObj[key]);
  }

  Article.all = [];

  Article.prototype.toHtml = function() {
    var template = Handlebars.compile($('#article-template').text());

    this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
    this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
    this.body = marked(this.body);

    return template(this);
  };

  Article.loadAll = rows => {
    rows.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)));

    // TODO: Refactor this forEach code, by using a `.map` call instead, since what we are trying to accomplish
    // is the transformation of one collection into another. Remember that we can set variables equal to the result
    // of functions. So if we set a variable equal to the result of a .map, it will be our transformed array.
    // There is no need to push to anything.
    Article.all = rawData.map(function(ele) {
      return new Article(ele);
    });
    /* OLD forEach():
    rawData.forEach(function(ele) {
    Article.all.push(new Article(ele));
  });
  */

};

Article.fetchAll = callback => {
  $.get('/articles')
  .then(
    results => {
      Article.loadAll(results);
      callback();
    }
  )
};

// TODO: Chain together a `map` and a `reduce` call to get a rough count of all words in all articles.
Article.numWordsAll = () => {
  return Article.all.map(article => article.body).reduce((acc,curr) => acc + curr.split(' ').length, 0)
};

// TODO: Chain together a `map` and a `reduce` call to produce an array of unique author names. You will
// probably need to use the optional accumulator argument in your reduce call.
Article.allAuthors = () => {
  return Article.all.map(authorNames => article.author).reduce((acc,curr) => {
    if (acc.indexOf(curr) === -1) {
      acc.push(curr);
    }
    return acc;
  },[])
};

Article.numWordsByAuthor = () => {
  return Article.allAuthors().map(author => {
      return {
        name: author,
        words: Article.all
          .filter(article => (article.author == author))
          .map(article == article.body)
          .reduce((acc,curr) => acc + curr.split(' ').length, 0)
      }
    }
    // TODO: Transform each author string into an object with properties for
    // the author's name, as well as the total number of words across all articles
    // written by the specified author.
    // HINT: This .map should be setup to return an object literal with two properties.
    // The first property should be pretty straightforward, but you will need to chain
    // some combination of filter, map, and reduce to get the value for the second
    // property.

  })
};

Article.truncateTable = callback => {
  $.ajax({
    url: '/articles',
    method: 'DELETE',
  })
  .then(console.log) // REVIEW: Check out this clean syntax for just passing 'assumed' data into a named function!
  // The reason we can do this has to do with the way Promise.prototype.then works. It's a little
  // outside the scope of 301 material, but feel free to research!
  .then(callback);
};

Article.prototype.insertRecord = function(callback) {
  // REVIEW: Why can't we use an arrow function here for .insertRecord()??
  $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
  .then(console.log)
  .then(callback);
};

Article.prototype.deleteRecord = function(callback) {
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'DELETE'
  })
  .then(console.log)
  .then(callback);
};

Article.prototype.updateRecord = function(callback) {
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'PUT',
    data: {
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title,
      author_id: this.author_id
    }
  })
  .then(console.log)
  .then(callback);
};
module.Article = Article;
})(window);
