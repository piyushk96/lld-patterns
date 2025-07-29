/**
 * Factory pattern will create concrete objects without exposing the creation logic to the client
 */

enum VehicleType {
  CAR = "car",
  BIKE = "bike",
  TRUCK = "truck"
}

interface Vehicle {
  createVehicle(): void;
}

class Car implements Vehicle {
  createVehicle(): void {
    console.log("Car created");
  }
}

class Bike implements Vehicle {
   createVehicle(): void {
    console.log("Bike created");
  }
}

class Truck implements Vehicle {
  createVehicle(): void {
    console.log("Truck created");
  }
}

class VehicleFactory {
  static getVehicle(type: VehicleType): Vehicle {
    switch (type) {
      case VehicleType.CAR:
        return new Car();
      case VehicleType.BIKE:
        return new Bike();
      case VehicleType.TRUCK:
        return new Truck();
      default:
        throw new Error("Invalid vehicle type");
    }
  }
}


function main() {
  const vehicleType = VehicleType.CAR; // can take from user input
  const vehicle = VehicleFactory.getVehicle(vehicleType);
  vehicle.createVehicle();
}

main();

export {}