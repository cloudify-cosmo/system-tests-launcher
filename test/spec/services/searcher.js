'use strict';

describe('Service: searcher', function () {

  var search;

  beforeEach(module('app.service.searcher'));
  beforeEach(inject(function (searcher) {
    search = searcher;
  }));

  it('should contain a newSearcher function', function () {
    expect(search.newSearcher).toBeDefined();
  });

  it('should search by name key', function() {
    var items = [
      {name: 'aa'},
      {name: 'aaa'},
      {name: 'bb'},
      {name: 'bbb'}];
    expect(search.newSearcher(items).search('a')).toEqual([
      {name:'aa'}, {name: 'aaa'}]);
  });

  it('should support AND using spaces', function() {
    var items = [
      {name: 'aa 11'},
      {name: 'aaa 11'},
      {name: 'bb 11'},
      {name: 'bbb 11'}];
    expect(search.newSearcher(items).search('a 1')).toEqual([
      {name:'aa 11'}, {name: 'aaa 11'}]);
  });

  it('should return all items on an empty search', function() {
    var items = [
      {name: 'aa 11'},
      {name: 'aaa 11'},
      {name: 'bb 11'},
      {name: 'bbb 11'}];
    expect(search.newSearcher(items).search('')).toEqual(items);
  });

  it('should return an empty list on no match', function() {
    var items = [
      {name: 'aa 11'},
      {name: 'aaa 11'},
      {name: 'bb 11'},
      {name: 'bbb 11'}];
    expect(search.newSearcher(items).search('who am i')).toEqual([]);
  });

  it('should return an empty list on a partial match', function() {
    var items = [
      {name: 'aa 11'},
      {name: 'aaa 11'},
      {name: 'bb 11'},
      {name: 'bbb 11'}];
    expect(search.newSearcher(items).search('a 2')).toEqual([]);
  });

});
