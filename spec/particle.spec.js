var assert = require('chai').assert;
var Particle = require('../lib/particle');
var Vector = require('../lib/vector');

describe('Particle', function() {

  describe('constructor', function() {

    it('should force instantiation', function() {
      var p = Particle();
      assert.instanceOf(p, Particle);
    });

    it('should have a type of "Particle"', function() {
      var p = Particle();
      assert.equal(p.type, 'Particle');
    });

    describe('with defaults', function() {

      before(function() {
        this.p = Particle();
      });

      it('should have position 0, 0', function() {
        assert.equal(this.p.position.x, 0);
        assert.equal(this.p.position.y, 0);
      });

      it('should have size 1', function() {
        assert.equal(this.p.size, 1);
      });

      it('should have zero velocity', function() {
        assert.equal(this.p.position.x, this.p.lastPosition.x);
        assert.equal(this.p.position.y, this.p.lastPosition.y);
      });

      it('should have zero acceleration', function() {
        assert.equal(this.p.acceleration.x, 0);
        assert.equal(this.p.acceleration.y, 0);
      });

    });

    it('should accept position', function() {
      var p = Particle(1, 2);
      assert.equal(p.position.x, 1);
      assert.equal(p.position.y, 2);
    });

    it('should accept size', function() {
      var p = Particle(1, 2, 3);
      assert.equal(p.size, 3);
    });
  });

  describe('#accelerate', function() {

    before(function() {
      this.p = Particle();
    });

    it('should yield (4, 6) from (1, 2) + (3, 4)', function() {
      this.p.accelerate(Vector(1, 2));
      assert.equal(this.p.acceleration.x, 1);
      assert.equal(this.p.acceleration.y, 2);
      this.p.accelerate(Vector(3, 4));
      assert.equal(this.p.acceleration.x, 4);
      assert.equal(this.p.acceleration.y, 6);
    });

  });

  describe('#bound', function() {

    it('should stay above min', function() {
      var p = Particle(40, 50);
      p.bound(Vector(75, 75), Vector(100, 100));
      assert.equal(p.position.x, 75);
      assert.equal(p.position.y, 75);
    });

    it('should stay below max', function() {
      var p = Particle(40, 50);
      p.bound(Vector(0, 0), Vector(25, 25));
      assert.equal(p.position.x, 25);
      assert.equal(p.position.y, 25);
    });

  });

  describe('#correct', function() {

    it('should yield (4, 6) from (1, 2) + (3, 4)', function() {
      var p = Particle(1, 2);
      p.correct(Vector(3, 4));
      assert.equal(p.position.x, 4);
      assert.equal(p.position.y, 6);
    });

  });

  describe('#integrate', function() {

    // TODO: tests

  });

  describe('#place', function() {

    before(function() {
      this.p = Particle(1, 2);
      this.p.place(Vector(-10, 20));
    });

    it('should position the particle at x, y', function() {
      assert.equal(this.p.position.x, -10);
      assert.equal(this.p.position.y, 20);
    });

    it('should reset velocity to zero', function() {
      assert.equal(this.p.position.x, this.p.lastPosition.x);
      assert.equal(this.p.position.y, this.p.lastPosition.y);
    });

  });

});
