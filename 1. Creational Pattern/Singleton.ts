let instance: Counter;

class Counter {
  private counter: number = 0;

  constructor() {
    if (instance) return instance;

    // this.counter = 0;
    instance = this;
  }

  getCount() {
    return this.counter;
  }

  increment() {
    this.counter += 1;
  }

  decrement() {
    this.counter -= 1;
  }
}

const singletonCounter = Object.freeze(new Counter());

export default singletonCounter;

export {}