/**
 * Bridge Pattern create a bridge between Abstraction (High level part) and Implementation (Low level part)
 * Implementor(LLP) instance is passed to Abstraction(HLP) instance
 */

// Implementor (Low level layer)
interface Engine {
  start(): void;
}

// Concrete Implementor 1
class PetrolEngine implements Engine {
  start(): void {
    console.log("Petrol engine started");
  }
}

// Concrete Implementor 2
class DieselEngine implements Engine {
  start(): void {
    console.log("Diesel engine started");
  }
}

// Concrete Implementor 3
class ElectricEngine implements Engine {
  start(): void {
    console.log("Electric engine started")
  }
}

// Abstraction (High level layer)
abstract class Car {
  protected engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  abstract drive(): void;
}

// Refined Abstraction 1
class Sedan extends Car {
  constructor(e: Engine) {
    super(e);
  }

  drive(): void {
    this.engine.start()
    console.log("Driving a sedan car");
  }
}

// Refined Abstraction 2
class SUV extends Car {
  constructor(e: Engine) {
    super(e);
  }

  drive(): void {
    this.engine.start()
    console.log("Driving a SUV car");
  }
}

// Refined Abstraction 3
class Hatchback extends Car {
  constructor(e: Engine) {
    super(e);
  }

  drive(): void {
    this.engine.start()
    console.log("Driving a hatchback car");
  }
}

function main() {
  const petrolEngine = new PetrolEngine();
  const dieselEngine = new DieselEngine();
  const electricEngine = new ElectricEngine();

  const sedan = new Sedan(petrolEngine);
  const suv = new SUV(dieselEngine);
  const hatchback = new Hatchback(electricEngine);

  sedan.drive();
  suv.drive();
  hatchback.drive();
}

main();

export {}