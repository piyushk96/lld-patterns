/**
 * Decorator Pattern allows you to add new behaviors to objects dynamically by placing them inside special wrapper objects that contain the behaviors.
 */

interface Character {
  getAbilities(): string;
}

class Mario implements Character {
  getAbilities(): string {
    return "Mario"
  }
}

abstract class CharacterDecorator implements Character {
  protected character: Character;

  constructor(character: Character) {
    this.character = character;
  }

  abstract getAbilities(): string
}

class HeightUp extends CharacterDecorator {
  constructor(character: Character) {
    super(character);
  }

  getAbilities(): string {
    return this.character.getAbilities() + " Height Up";
  }
}

class GunPower extends CharacterDecorator {
  constructor(character: Character) {
    super(character);
  }

  getAbilities(): string {
    return this.character.getAbilities() + " Gun Power";
  }

}

class StarPower extends CharacterDecorator {
  constructor(character: Character) {
    super(character);
  }

  getAbilities(): string {
    return this.character.getAbilities() + " Star Power";
  }
}

function main() {
  let mario = new Mario();
  console.log("Basic character: ", mario.getAbilities());

  mario = new HeightUp(mario);
  console.log("After height up: ", mario.getAbilities());

  mario = new GunPower(mario);
  console.log("After gun power: ", mario.getAbilities());

  mario = new StarPower(mario);
  console.log("After star power: ", mario.getAbilities());
}

main();

export {};