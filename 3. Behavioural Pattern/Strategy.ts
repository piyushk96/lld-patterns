/**
 * Strategy Pattern
 *
 * Define a family of algorithms, encapsulate each one, and make them interchangeable.
 * Strategy lets the algorithm vary independently from clients that use it.
 */

// Strategy interfaces
interface Talkable {
  talk(): void;
}

interface Walkable {
  walk(): void;
}

interface Flyable {
  fly(): void;
}

// Concrete Talk strategies
class NormalTalk implements Talkable {
  talk() {
    console.log("Robot talks normally.");
  }
}

class NoTalk implements Talkable {
  talk() {
    console.log("Robot is silent.");
  }
}

// Concrete Walk strategies
class NormalWalk implements Walkable {
  walk() {
    console.log("Robot walks normally.");
  }
}

class NoWalk implements Walkable {
  walk() {
    console.log("Robot cannot walk.");
  }
}

// Concrete Fly strategies
class NormalFly implements Flyable {
  fly() {
    console.log("Robot flies normally.");
  }
}

class NoFly implements Flyable {
  fly() {
    console.log("Robot cannot fly.");
  }
}

// Context: Robot
class Robot {
  private talkBehavior: Talkable;
  private walkBehavior: Walkable;
  private flyBehavior: Flyable;

  constructor(t: Talkable, w: Walkable, f: Flyable) {
    this.talkBehavior = t;
    this.walkBehavior = w;
    this.flyBehavior = f;
  }

  talk() {
    this.talkBehavior.talk();
  }

  walk() {
    this.walkBehavior.walk();
  }

  fly() {
    this.flyBehavior.fly();
  }
}

function main() {
  const robot1 = new Robot(new NormalTalk(), new NormalWalk(), new NoFly());
  console.log("Robot 1:");
  robot1.talk();
  robot1.walk();
  robot1.fly();

  console.log("\nRobot 2:");
  const robot2 = new Robot(new NoTalk(), new NoWalk(), new NormalFly());
  robot2.talk();
  robot2.walk();
  robot2.fly();
}

main();
