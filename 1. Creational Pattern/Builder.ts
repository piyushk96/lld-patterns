/**
 * Builder pattern is used to construct a complex object using a step by step approach.
 */

// Product class - the complex object we want to build
class Desktop {
  private cpu?: string
  private ram?: string
  private storage?: string

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
  buildCPU(cpu: string): IDesktopBuilder;
  buildRAM(ram: string): IDesktopBuilder;
  buildStorage(storage: string): IDesktopBuilder;
  build(): Desktop;
}

// Concrete Builder - implements the building steps
class HPDesktopBuilder implements IDesktopBuilder {
  private desktop: Desktop;

  constructor() {
    this.desktop = new Desktop();
  }

  buildCPU(cpu: string): IDesktopBuilder {
    this.desktop.setCPU(cpu);
    return this;
  }

  buildRAM(ram: string): IDesktopBuilder {
    this.desktop.setRAM(ram);
    return this;
  }

  buildStorage(storage: string): IDesktopBuilder {
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
  private builder: IDesktopBuilder;

  constructor(builder: IDesktopBuilder) {
    this.builder = builder;
  }

  // Predefined configurations
  buildDesktop(): Desktop {
    return this.builder
      .buildCPU('Intel Core i9-13900K')
      .buildRAM('32GB DDR5-6000')
      .buildStorage('2TB NVMe SSD')
      .build();
  }
}

// Client code
function main(): void {
  console.log('=== Builder Design Pattern Demo ===\n');

  // Create a builder
  const builder = new HPDesktopBuilder();

  // Create a director
  const director = new DesktopDirector(builder);

  // Build predefined configurations
  const desktop = director.buildDesktop();
  desktop.display();

  // Custom build using fluent interface
  const customDesktop = builder
    .buildCPU('AMD Ryzen 7 7700X')
    .buildRAM('64GB DDR5-5200')
    .buildStorage('4TB NVMe SSD')
    .build();

  customDesktop.display();
}

// Run the demonstration
main();

export {}