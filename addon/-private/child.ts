export default class Child {
  state: 'new' | 'kept' | 'removing' = 'new';
  private removalBlockers = 0;
  private removalCycle: number | null = null;

  constructor(
    readonly group: string,
    readonly id: string,
    readonly value: unknown,
    readonly index: number,
  ) {
    this.removalBlockers = 0;
    this.removalCycle = null;
  }

  block(cycle: number) {
    if (this.removalCycle == null || this.removalCycle === cycle) {
      this.removalCycle = cycle;
      this.removalBlockers++;
    }
  }

  unblock(cycle: number) {
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
