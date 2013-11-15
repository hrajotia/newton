;(function(Newton) {

  'use strict'

  function RigidConstraint(particles, iterations) {
    if (!(this instanceof RigidConstraint)) return new RigidConstraint(particles, iterations);

    this.particles = particles;
    this.deltas = this.getDeltas();
  }

  RigidConstraint.prototype.category = '';

  // TODO: make respect individual particle mass
  RigidConstraint.prototype.getCenterMass = function() {
    var i = -1, len = this.particles.length;
    var center = Newton.Vector(0, 0);

    while (++i < len) {
      center.add(this.particles[i].position);
    }

    center.scale(1 / len);
    return center;
  };

  RigidConstraint.prototype.getDeltas = function() {
    var center = this.getCenterMass();
    var i = -1, len = this.particles.length;
    var deltas = Array(len);

    while (++i < len) {
      deltas[i] = this.particles[i].position.clone().sub(center);
    }

    return deltas;
  }

  RigidConstraint.prototype.resolve = function(time) {
    var center = this.getCenterMass();
    var angleDelta = 0;
    var i = -1, len = this.particles.length;

    while (++i < len) {
      var p = this.particles[i].position.clone().sub(center);
      var q = this.deltas[i];

      var cos = p.x * q.x + p.y * q.y;
      var sin = p.y * q.x - p.x * q.y;

      angleDelta += Math.atan2(sin, cos) * 1; // TODO: replace 1 with particle[i].getMass()
    }

    angleDelta /= len;

    cos = Math.cos(angleDelta);
    sin = Math.sin(angleDelta);

    i = -1;
    while (++i < len) {
      var q = this.deltas[i];
      var correction = Newton.Vector(cos * q.x - sin * q.y, sin * q.x + cos * q.y);
      correction.add(center).sub(this.particles[i].position).scale(1);
      this.particles[i].position.add(correction)
    }
  };

  Newton.RigidConstraint = RigidConstraint;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);