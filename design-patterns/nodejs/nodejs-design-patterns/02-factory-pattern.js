// Factory Pattern - Creates objects without specifying the exact classes to create
// Use case: Creating different types of vehicles, database drivers, API clients

class Car {
  constructor(make, model) {
    this.type = 'car';
    this.make = make;
    this.model = model;
  }

  getInfo() {
    return `Car: ${this.make} ${this.model}`;
  }

  start() {
    return `${this.make} car engine started`;
  }
}

class Motorcycle {
  constructor(make, model) {
    this.type = 'motorcycle';
    this.make = make;
    this.model = model;
  }

  getInfo() {
    return `Motorcycle: ${this.make} ${this.model}`;
  }

  start() {
    return `${this.make} motorcycle engine roared`;
  }
}

class Truck {
  constructor(make, model, capacity) {
    this.type = 'truck';
    this.make = make;
    this.model = model;
    this.capacity = capacity;
  }

  getInfo() {
    return `Truck: ${this.make} ${this.model} (Capacity: ${this.capacity}t)`;
  }

  start() {
    return `${this.make} truck diesel engine started`;
  }
}

class VehicleFactory {
  static createVehicle(type, make, model, capacity = null) {
    switch (type.toLowerCase()) {
      case 'car':
        return new Car(make, model);
      case 'motorcycle':
        return new Motorcycle(make, model);
      case 'truck':
        return new Truck(make, model, capacity);
      default:
        throw new Error(`Unknown vehicle type: ${type}`);
    }
  }
}

// Usage Example
const vehicles = [
  VehicleFactory.createVehicle('car', 'Toyota', 'Camry'),
  VehicleFactory.createVehicle('motorcycle', 'Harley-Davidson', 'Street 750'),
  VehicleFactory.createVehicle('truck', 'Volvo', 'FH16', 25),
  VehicleFactory.createVehicle('car', 'BMW', 'M5')
];

console.log('Vehicles Created:');
vehicles.forEach(vehicle => {
  console.log(`${vehicle.getInfo()} -> ${vehicle.start()}`);
});

console.log('\nVehicle Types:');
vehicles.forEach(vehicle => {
  console.log(`Type: ${vehicle.type}`);
});

// Dynamic factory creation
const carList = [];
const types = ['car', 'motorcycle', 'truck', 'car'];
const details = [
  ['Honda', 'Civic'],
  ['Yamaha', 'YZF-R1'],
  ['MAN', 'TGX', 30],
  ['Mercedes', 'C-Class']
];

console.log('\nDynamically Created Vehicles:');
types.forEach((type, index) => {
  const vehicle = VehicleFactory.createVehicle(type, ...details[index]);
  carList.push(vehicle);
  console.log(vehicle.getInfo());
});
