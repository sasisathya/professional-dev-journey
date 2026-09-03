// Factory Pattern - TypeScript Version with Generics and Type Safety
// Creates objects without specifying the exact classes to create

// Interfaces for type safety
interface Vehicle {
  type: string;
  make: string;
  model: string;
  getInfo(): string;
  start(): string;
}

interface Car extends Vehicle {
  type: 'car';
  doors: number;
}

interface Motorcycle extends Vehicle {
  type: 'motorcycle';
  engineCc: number;
}

interface Truck extends Vehicle {
  type: 'truck';
  capacity: number;
}

interface BicycleVehicle extends Vehicle {
  type: 'bicycle';
  gears: number;
}

// Type definitions for discriminated union
type VehicleTypes = Car | Motorcycle | Truck | BicycleVehicle;

// Implementation classes
class CarImpl implements Car {
  type: 'car' = 'car';
  doors: number = 4;

  constructor(
    public make: string,
    public model: string,
    doors?: number
  ) {
    if (doors) this.doors = doors;
  }

  getInfo(): string {
    return `Car: ${this.make} ${this.model} (${this.doors} doors)`;
  }

  start(): string {
    return `${this.make} car engine started`;
  }
}

class MotorcycleImpl implements Motorcycle {
  type: 'motorcycle' = 'motorcycle';
  engineCc: number = 600;

  constructor(
    public make: string,
    public model: string,
    engineCc?: number
  ) {
    if (engineCc) this.engineCc = engineCc;
  }

  getInfo(): string {
    return `Motorcycle: ${this.make} ${this.model} (${this.engineCc}cc)`;
  }

  start(): string {
    return `${this.make} motorcycle engine roared`;
  }
}

class TruckImpl implements Truck {
  type: 'truck' = 'truck';

  constructor(
    public make: string,
    public model: string,
    public capacity: number
  ) {}

  getInfo(): string {
    return `Truck: ${this.make} ${this.model} (Capacity: ${this.capacity}t)`;
  }

  start(): string {
    return `${this.make} truck diesel engine started`;
  }
}

class BicycleImpl implements BicycleVehicle {
  type: 'bicycle' = 'bicycle';

  constructor(
    public make: string,
    public model: string,
    public gears: number
  ) {}

  getInfo(): string {
    return `Bicycle: ${this.make} ${this.model} (${this.gears} gears)`;
  }

  start(): string {
    return `${this.make} bicycle ready to ride`;
  }
}

// Generic Factory Pattern
interface FactoryConfig<T> {
  create(...args: any[]): T;
}

class GenericFactory<T> {
  private creators: Map<string, FactoryConfig<T>> = new Map();

  public register(type: string, creator: FactoryConfig<T>): void {
    this.creators.set(type, creator);
  }

  public create(type: string, ...args: any[]): T {
    const creator = this.creators.get(type);
    if (!creator) {
      throw new Error(`Unknown type: ${type}`);
    }
    return creator.create(...args);
  }

  public isRegistered(type: string): boolean {
    return this.creators.has(type);
  }

  public getRegisteredTypes(): string[] {
    return Array.from(this.creators.keys());
  }
}

// Vehicle Factory with type-safe creation
class VehicleFactory {
  private static instance: VehicleFactory | null = null;

  private constructor() {}

  public static getInstance(): VehicleFactory {
    if (!VehicleFactory.instance) {
      VehicleFactory.instance = new VehicleFactory();
    }
    return VehicleFactory.instance;
  }

  public createVehicle(
    type: 'car' | 'motorcycle' | 'truck' | 'bicycle',
    make: string,
    model: string,
    capacity?: number | number
  ): VehicleTypes {
    switch (type) {
      case 'car':
        return new CarImpl(make, model, capacity as number);
      case 'motorcycle':
        return new MotorcycleImpl(make, model, capacity as number);
      case 'truck':
        return new TruckImpl(make, model, capacity as number);
      case 'bicycle':
        return new BicycleImpl(make, model, capacity as number);
      default:
        throw new Error(`Unknown vehicle type: ${type}`);
    }
  }

  public createFromConfig(config: VehicleConfig): VehicleTypes {
    return this.createVehicle(config.type, config.make, config.model, config.capacity);
  }
}

interface VehicleConfig {
  type: 'car' | 'motorcycle' | 'truck' | 'bicycle';
  make: string;
  model: string;
  capacity?: number;
}

// Abstract Factory Pattern
interface AbstractFactory {
  createCar(): Car;
  createMotorcycle(): Motorcycle;
  createTruck(): Truck;
}

class LuxuryVehicleFactory implements AbstractFactory {
  createCar(): Car {
    return new CarImpl('Mercedes', 'S-Class', 4);
  }

  createMotorcycle(): Motorcycle {
    return new MotorcycleImpl('Ducati', 'Panigale V4', 1103);
  }

  createTruck(): Truck {
    return new TruckImpl('Volvo', 'FH16', 30);
  }
}

class EconomyVehicleFactory implements AbstractFactory {
  createCar(): Car {
    return new CarImpl('Toyota', 'Corolla', 4);
  }

  createMotorcycle(): Motorcycle {
    return new MotorcycleImpl('Honda', 'CB500', 471);
  }

  createTruck(): Truck {
    return new TruckImpl('Isuzu', 'N-Series', 10);
  }
}

// Generic Object Factory with type inference
type ObjectConstructor<T> = new (...args: any[]) => T;

class ObjectFactory {
  public static create<T>(constructor: ObjectConstructor<T>, ...args: any[]): T {
    return new constructor(...args);
  }

  public static createMultiple<T>(
    constructor: ObjectConstructor<T>,
    count: number,
    ...args: any[]
  ): T[] {
    return Array.from({ length: count }, () => new constructor(...args));
  }
}

// ===== Usage Examples =====

console.log('========== FACTORY PATTERN - TYPESCRIPT ==========\n');

// Example 1: Basic Vehicle Factory
console.log('--- Basic Vehicle Factory ---');
const factory = VehicleFactory.getInstance();

const car = factory.createVehicle('car', 'Toyota', 'Camry', 4);
const motorcycle = factory.createVehicle('motorcycle', 'Harley-Davidson', 'Street 750', 750);
const truck = factory.createVehicle('truck', 'Volvo', 'FH16', 25);
const bicycle = factory.createVehicle('bicycle', 'Trek', 'FX 3', 21);

const vehicles: VehicleTypes[] = [car, motorcycle, truck, bicycle];

vehicles.forEach(vehicle => {
  console.log(`${vehicle.getInfo()} -> ${vehicle.start()}`);
});

// Example 2: Factory from Config
console.log('\n--- Factory from Config ---');
const configs: VehicleConfig[] = [
  { type: 'car', make: 'Honda', model: 'Civic' },
  { type: 'motorcycle', make: 'Yamaha', model: 'YZF-R1', capacity: 998 },
  { type: 'truck', make: 'MAN', model: 'TGX', capacity: 35 }
];

configs.forEach(config => {
  const v = factory.createFromConfig(config);
  console.log(`${v.getInfo()}`);
});

// Example 3: Abstract Factory Pattern
console.log('\n--- Abstract Factory Pattern ---');

const luxuryFactory: AbstractFactory = new LuxuryVehicleFactory();
const economyFactory: AbstractFactory = new EconomyVehicleFactory();

console.log('Luxury Factory:');
console.log('  Car:', luxuryFactory.createCar().getInfo());
console.log('  Motorcycle:', luxuryFactory.createMotorcycle().getInfo());
console.log('  Truck:', luxuryFactory.createTruck().getInfo());

console.log('\nEconomy Factory:');
console.log('  Car:', economyFactory.createCar().getInfo());
console.log('  Motorcycle:', economyFactory.createMotorcycle().getInfo());
console.log('  Truck:', economyFactory.createTruck().getInfo());

// Example 4: Generic Factory
console.log('\n--- Generic Factory ---');

const genericVehicleFactory = new GenericFactory<Vehicle>();

genericVehicleFactory.register('car', {
  create: (make: string, model: string) => new CarImpl(make, model)
});

genericVehicleFactory.register('motorcycle', {
  create: (make: string, model: string) => new MotorcycleImpl(make, model)
});

genericVehicleFactory.register('truck', {
  create: (make: string, model: string, capacity: number) => new TruckImpl(make, model, capacity)
});

const genericCar = genericVehicleFactory.create('car', 'BMW', 'M5');
const genericBike = genericVehicleFactory.create('motorcycle', 'Kawasaki', 'Ninja');

console.log('Generic Car:', genericCar.getInfo());
console.log('Generic Motorcycle:', genericBike.getInfo());
console.log('Registered types:', genericVehicleFactory.getRegisteredTypes());

// Example 5: Object Factory with Type Inference
console.log('\n--- Object Factory with Type Inference ---');

class User {
  constructor(
    public id: number,
    public name: string,
    public email: string
  ) {}
}

class Product {
  constructor(
    public id: number,
    public title: string,
    public price: number
  ) {}
}

const user = ObjectFactory.create(User, 1, 'John Doe', 'john@example.com');
const product = ObjectFactory.create(Product, 101, 'Laptop', 999.99);

const users = ObjectFactory.createMultiple(User, 3, 1, 'User', 'user@example.com');
const products = ObjectFactory.createMultiple(Product, 2, 1, 'Product', 100);

console.log('User:', user);
console.log('Product:', product);
console.log('Users created:', users.length);
console.log('Products created:', products.length);

// Example 6: Conditional Factory with Type Guards
console.log('\n--- Conditional Factory with Type Guards ---');

function isCarType(v: VehicleTypes): v is Car {
  return v.type === 'car';
}

function isMotorcycleType(v: VehicleTypes): v is Motorcycle {
  return v.type === 'motorcycle';
}

function isElectricVehicle(vehicle: VehicleTypes): boolean {
  return vehicle.make === 'Tesla' || vehicle.make === 'BMW'; // Simplified check
}

const mixedVehicles: VehicleTypes[] = [
  new CarImpl('Tesla', 'Model 3'),
  new MotorcycleImpl('BMW', 'S1000RR'),
  new TruckImpl('Volvo', 'FH16', 25)
];

console.log('Filtering vehicles:');
mixedVehicles.forEach(vehicle => {
  if (isCarType(vehicle)) {
    console.log(`  Car: ${vehicle.model} (${vehicle.doors} doors)`);
  } else if (isMotorcycleType(vehicle)) {
    console.log(`  Motorcycle: ${vehicle.model} (${vehicle.engineCc}cc)`);
  } else {
    console.log(`  Truck: ${vehicle.model} (${vehicle.capacity}t)`);
  }
});

export {
  VehicleFactory,
  GenericFactory,
  AbstractFactory,
  LuxuryVehicleFactory,
  EconomyVehicleFactory,
  ObjectFactory
};

export type { Vehicle, Car, Motorcycle, Truck, BicycleVehicle, VehicleTypes, VehicleConfig };
