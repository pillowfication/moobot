import Route from '@ember/routing/route';

export default Route.extend({
  model () {
    return [
      { username: 'Foo', score: 723 },
      { username: 'Bar', score: 47 },
      { username: 'Quux', score: 1 }
    ]
  }
});
