;(function(Newton) {

  'use strict'

  function noop() {}

  function prioritySort(a, b) {
    return b.priority - a.priority;
  }

  function Simulator(preSimulator, renderer, integrationFps, iterations) {
    if (!(this instanceof Simulator)) return new Simulator(preSimulator, renderer, integrationFps, iterations);

    this.preSimulator = preSimulator || noop;
    this.renderer = renderer || noop;
    this.step = this._step.bind(this);
    this.lastTime = 0;
    this.running = false;
    this.fps = 0;
    this.frames = 0;
    this.countTime = 0;
    this.countInterval = 250;
    this.accumulator = 0;
    this.simulationStep = 1000 / (integrationFps || 60);
    this.iterations = iterations || 3;

    this.layers = [];

    // The basic elements of the simulation
    this.particles = [];
    this.edges = [];
    this.forces = [];
    this.constraints = [];
  }

  Simulator.prototype.start = function() {
    this.running = true;
    this.countTime = Date.now() + 1000;
    Newton.frame(this.step);
  };

  Simulator.prototype.stop = function() {
    this.running = false;
  };

  Simulator.prototype.simulate = function(time) {
    this.cull(this.particles);
    this.cull(this.constraints);
    this.preSimulator(time, this);
    this.integrate(time);
    this.constrain(time);
    this.collide(time);
  };

  Simulator.prototype.cull = function(array) {
    var i = 0;
    while (i < array.length) {
      if (array[i].isDestroyed) array.splice(i, 1);
      else i++;
    }
  };

  Simulator.prototype.integrate = function(time) {
    var particles = this.particles;
    var forces = this.forces;
    var particle, force;

    for (var i = 0, ilen = particles.length; i < ilen; i++) {
      particle = particles[i];
      for (var j = 0, jlen = forces.length; j < jlen; j++) {
        forces[j].applyTo(particle);  // TODO: applyForce must check validity of force based on particle's layer
      }
      particle.integrate(time);
    }
  };

  Simulator.prototype.constrain = function(time) {
    var constraints = this.constraints;

    for (var j = 0, jlen = this.iterations; j < jlen; j++) {
      for (var i = 0, ilen = constraints.length; i < ilen; i++) {
        constraints[i].resolve(time, this.particles);
      }
    }
  };

  Simulator.prototype.collide = function(time) {
    var particles = this.particles;
    var edges = this.edges;

    for (var i = 0, ilen = particles.length; i < ilen; i++) {
      particles[i].collide(edges);
    }
  };

  Simulator.prototype.add = function(entity, layer) {
    entity.addTo(this, layer);
    return this;
  };

  Simulator.prototype.link = function(layer, linkedLayers) {
    return this;
  };

  Simulator.prototype.addParticles = function(particles) {
    this.particles.push.apply(this.particles, particles);
  };

  Simulator.prototype.addEdges = function(edges) {
    this.edges.push.apply(this.edges, edges);
  };

  Simulator.prototype.addConstraints = function(constraints) {
    this.constraints.push.apply(this.constraints, constraints);
    this.constraints.sort(prioritySort);
  };

  // TODO: this could be dramatically optimized by starting with bounding boxes
  Simulator.prototype.findParticle = function(x, y, radius) {
    var particles = this.particles;
    var found = undefined;
    var nearest = radius;
    var distance;

    for (var i = 0, ilen = particles.length; i < ilen; i++) {
      distance = particles[i].getDistance(x, y);
      if (distance <= nearest) {
        found = particles[i];
        nearest = distance;
      }
    }

    return found;
  };

  Simulator.prototype.addBody = function(body) {
    this.particles.push.apply(this.particles, body.particles);
    this.edges.push.apply(this.edges, body.edges);              // TODO: handle cases where the body's particles & edges change after adding
    this.bodies.push(body);
  };

  Simulator.prototype.Layer = function() {
    var newLayer = Newton.Layer();
    this.layers.push(newLayer);
    return newLayer;
  };

  Simulator.prototype._step = function() {
    if (!this.running) return;

    var time = Date.now();
    var step = time - this.lastTime;
    if (step > 100) step = 0;         // in case you leave / return

    this.accumulator += step;

    while (this.accumulator >= this.simulationStep) {
      this.simulate(this.simulationStep);
      this.accumulator -= this.simulationStep;
    }

    this.renderer(step, this);

    this.frames++;
    if (time >= this.countTime) {
      this.fps = (this.frames / (this.countInterval + time - this.countTime) * 1000).toFixed(0);
      this.frames = 0;
      this.countTime = time + this.countInterval;
    }

    this.lastTime = time;
    Newton.frame(this.step);
  };

  Newton.Simulator = Simulator;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
