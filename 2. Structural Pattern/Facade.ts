/**
 * Facade Pattern provides a simplified interface to a complex system.
 */

// Subsystem 1
class PowerSupply {
  providePower() {
    console.log(`Power Supply: Providing power`);
  }
}

// Subsystem 2
class CoolingSystem {
  startFans() {
      console.log(`Cooling System: Fans started`);
  }
}

// Subsystem 3
class CPU {
  initialize() {
      console.log('CPU: initialization started');
  }
}

// Subsystem 4
class Memory {
  selfTest() {
      console.log(`Memory: self test passed`);
  }
}

// Subsystem 5
class HardDrive {
  spinUp() {
      console.log(`Hard Drive: spinning up`);
  }
}

// Subsystem 6
class BIOS {
  boot(cpu: CPU, memory: Memory) {
    console.log(`BIOS: Booting CPU and Memory`);
    cpu.initialize();
    memory.selfTest();
  }
}

// Subsystem 7
class OperatingSystem {
  load() {
    console.log(`Operating System: Loading`);
  }
}

// Facade
class ComputerFacade {
  private powerSupply: PowerSupply;
  private coolingSystem: CoolingSystem;
  private cpu: CPU;
  private memory: Memory;
  private hardDrive: HardDrive;
  private bios: BIOS;
  private os: OperatingSystem;

  constructor() {
    this.powerSupply = new PowerSupply();
    this.coolingSystem = new CoolingSystem();
    this.cpu = new CPU();
    this.memory = new Memory();
    this.hardDrive = new HardDrive();
    this.bios = new BIOS();
    this.os = new OperatingSystem();
  }

  startComputer() {
    console.log('Starting computer...');
    this.powerSupply.providePower();
    this.coolingSystem.startFans();
    this.bios.boot(this.cpu, this.memory);
    this.hardDrive.spinUp();
    this.os.load();
    console.log('Computer booted successfully');
  }
}

function main() {
  const computer = new ComputerFacade();
  computer.startComputer();
}

main();

export {};
