var id = 0;

function Constraint() {
  if (!(this instanceof Constraint)) return new Constraint();
  this.id = id++;
}

Constraint.prototype.type = 'Constraint';
Constraint.prototype.priority = Infinity;
Constraint.prototype.correct = function() {};
Constraint.prototype.evaluate = function() {};
Constraint.prototype._deleted = false;

// todo: this should be run on the class, right?
// we're runnign this every time we add a constraint
Constraint.prototype.setPriority = function(types) {
  for (var i = 0; i < types.length; i++) {
    if (this instanceof types[i]) {
      this.priority = i;
      return;
    }
  }
  this.priority = Infinity;
  return;
};

module.exports = Constraint;
