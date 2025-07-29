/**
 * Builder pattern is used to construct a complex object using a step by step approach.
 */

// Product class - the complex object we want to build
class Desktop {
  private cpu: string
  private ram: string
  private storage: string

  setCPU(cpu: string): void {
    this.cpu = cpu;
  }

  setRAM(ram: string): void {
    this.ram = ram;
  }

  setStorage(storage: string): void {
    this.storage = storage;
  }

  display(): void {
    console.log('------------ Desktop Configuration ------------');
    console.log(`CPU: ${this.cpu}`);
    console.log(`RAM: ${this.ram}`);
    console.log(`Storage: ${this.storage}`);
    console.log('----------------------------------------------');
  }
}

// Builder interface - defines the contract for building the product
interface IDesktopBuilder {
  setCPU(cpu: string): IDesktopBuilder;
  setRAM(ram: string): IDesktopBuilder;
  setStorage(storage: string): IDesktopBuilder;
  build(): Desktop;
}

// Concrete Builder - implements the building steps
class DesktopBuilder implements IDesktopBuilder {
  private desktop: Desktop;

  constructor() {
    this.desktop = new Desktop();
  }

  setCPU(cpu: string): IDesktopBuilder {
    this.desktop.setCPU(cpu);
    return this;
  }

  setRAM(ram: string): IDesktopBuilder {
    this.desktop.setRAM(ram);
    return this;
  }

  setStorage(storage: string): IDesktopBuilder {
    this.desktop.setStorage(storage);
    return this;
  }

  build(): Desktop {
    return this.desktop;
  }
}

// Director - orchestrates the building process
// You can create director class or client can directly act as director
class DesktopDirector {
  private builder: DesktopBuilder;

  constructor(builder: DesktopBuilder) {
    this.builder = builder;
  }

  // Predefined configurations
  buildDesktop(): Desktop {
    return this.builder
      .setCPU('Intel Core i9-13900K')
      .setRAM('32GB DDR5-6000')
      .setStorage('2TB NVMe SSD')
      .build();
  }
}

// Client code
function main(): void {
  console.log('=== Builder Design Pattern Demo ===\n');

  // Create a builder
  const builder = new DesktopBuilder();

  // Create a director
  const director = new DesktopDirector(builder);

  // Build predefined configurations
  const desktop = director.buildDesktop();
  desktop.display();

  // Custom build using fluent interface
  const customDesktop = builder
    .setCPU('AMD Ryzen 7 7700X')
    .setRAM('64GB DDR5-5200')
    .setStorage('4TB NVMe SSD')
    .build();

  customDesktop.display();
}

// Run the demonstration
main();

export {}