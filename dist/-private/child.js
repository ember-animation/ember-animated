class Child {
  state = 'new';
  removalBlockers = 0;
  removalCycle = null;
  constructor(group, id, value, index) {
    this.group = group;
    this.id = id;
    this.value = value;
    this.index = index;
    this.removalBlockers = 0;
    this.removalCycle = null;
  }
  block(cycle) {
    if (this.removalCycle == null || this.removalCycle === cycle) {
      this.removalCycle = cycle;
      this.removalBlockers++;
    }
  }
  unblock(cycle) {
    if (this.removalCycle === cycle) {
      this.removalBlockers--;
    }
  }
  flagForRemoval() {
    this.removalCycle = null;
    this.removalBlockers = 0;
    this.state = 'removing';
  }
  get shouldRemove() {
    return this.state === 'removing' && this.removalBlockers < 1;
  }
  clone() {
    return new Child(this.group, this.id, this.value, this.index);
  }
}

export { Child as default };
//# sourceMappingURL=child.js.map
