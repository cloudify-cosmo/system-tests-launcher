'use strict';

angular.module('app.service.searcher', [])
  .factory('searcher', function() {
    var SimpleSearcher = function(pattern, options) {
      this.patterns = pattern.split(' ');
    };
    SimpleSearcher.prototype.search = function(text) {
      var indexes = _.map(this.patterns, function(p) {
        return text.indexOf(p);
      });
      var isMatch = _.all(indexes, function(i) { return i > -1; });
        var score = _.reduce(indexes, function(acc, v) { return acc + v; }, 0);
        return {
          isMatch: isMatch,
          score: score
      };
    };

    var newSearcher = function(items) {
      return new Fuse(items, {
        keys: ['name'],
        searchFn: SimpleSearcher
      });
    };

    return {
      newSearcher: newSearcher
    };
  });
