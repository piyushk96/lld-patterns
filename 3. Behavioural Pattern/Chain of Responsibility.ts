/**
 * Chain of Responsibility Pattern
 *
 * @description: This pattern is used to pass a request through a chain of objects.
 * Each object in the chain decides whether to process the request or pass it to the next object in the chain.
 *
 * @example: ATM Dispenser
 */


// Abstract Handler
abstract class CurrencyHandler {
  protected nextHandler: CurrencyHandler | null = null;

  setNext(handler: CurrencyHandler) {
    this.nextHandler = handler;
  }

  abstract handle(amount: number): void;
}

// Concrete Handlers for different denominations
class ThousandRupeeHandler extends CurrencyHandler {
  private numNotes: number;

  constructor(notes: number) {
    super();
    this.numNotes = notes;
  }

  handle(amount: number): void {
    let notesNeeded = Math.floor(amount / 1000);

    if (notesNeeded > this.numNotes) {
      notesNeeded = this.numNotes;
      this.numNotes = 0;
    }
    else {
      this.numNotes -= notesNeeded;
    }

    if (notesNeeded > 0) {
      console.log(`Dispensing ${notesNeeded} x ₹1000 notes`);
    }

    const remainingAmt = amount - (notesNeeded * 1000);
    if (remainingAmt > 0) {
      if (this.nextHandler) this.nextHandler.handle(remainingAmt);
      else console.log(`Cannot dispense remaining amount: ₹${remainingAmt} (Insufficient Balance)`);
    }
  }
}

class FiveHundredRupeeHandler extends CurrencyHandler {
  private numNotes: number;

  constructor(notes: number) {
    super();
    this.numNotes = notes;
  }

  handle(amount: number): void {
    let notesNeeded = Math.floor(amount / 500);

    if (notesNeeded > this.numNotes) {
      notesNeeded = this.numNotes;
      this.numNotes = 0;
    }
    else {
      this.numNotes -= notesNeeded;
    }

    if (notesNeeded > 0) {
      console.log(`Dispensing ${notesNeeded} x ₹500 notes`);
    }

    const remainingAmt = amount - (notesNeeded * 500);
    if (remainingAmt > 0) {
      if (this.nextHandler) this.nextHandler.handle(remainingAmt);
      else console.log(`Cannot dispense remaining amount: ₹${remainingAmt} (Insufficient Balance)`);
    }
  }
}

class TwoHundredRupeeHandler extends CurrencyHandler {
  private numNotes: number;

  constructor(notes: number) {
    super();
    this.numNotes = notes;
  }

  handle(amount: number): void {
    let notesNeeded = Math.floor(amount / 200);

    if (notesNeeded > this.numNotes) {
      notesNeeded = this.numNotes;
      this.numNotes = 0;
    }
    else {
      this.numNotes -= notesNeeded;
    }

    if (notesNeeded > 0) {
      console.log(`Dispensing ${notesNeeded} x ₹200 notes`);
    }

    const remainingAmt = amount - (notesNeeded * 200);
    if (remainingAmt > 0) {
      if (this.nextHandler) this.nextHandler.handle(remainingAmt);
      else console.log(`Cannot dispense remaining amount: ₹${remainingAmt} (Insufficient Balance)`);
    }
  }
}

class HundredRupeeHandler extends CurrencyHandler {
  private numNotes: number;

  constructor(notes: number) {
    super();
    this.numNotes = notes;
  }

  handle(amount: number): void {
    let notesNeeded = Math.floor(amount / 100);

    if (notesNeeded > this.numNotes) {
      notesNeeded = this.numNotes;
      this.numNotes = 0;
    }
    else {
      this.numNotes -= notesNeeded;
    }

    if (notesNeeded > 0) {
      console.log(`Dispensing ${notesNeeded} x ₹100 notes`);
    }

    const remainingAmt = amount - (notesNeeded * 100);
    if (remainingAmt > 0) {
      if (this.nextHandler) this.nextHandler.handle(remainingAmt);
      else console.log(`Cannot dispense remaining amount: ₹${remainingAmt} (Insufficient Balance)`);
    }
  }
}

// ATM Dispenser class that sets up the chain
class ATMDispenser {
  private handler: CurrencyHandler;

    constructor() {
    // Create handlers
    const thousandHandler = new ThousandRupeeHandler(3);
    const fiveHundredHandler = new FiveHundredRupeeHandler(5);
    const twoHundredHandler = new TwoHundredRupeeHandler(10);
    const hundredHandler = new HundredRupeeHandler(20);

    // Set up the chain: ₹1000 -> ₹500 -> ₹200 -> ₹100
    thousandHandler.setNext(fiveHundredHandler)
    fiveHundredHandler.setNext(twoHundredHandler)
    twoHundredHandler.setNext(hundredHandler);

    this.handler = thousandHandler;
  }

  dispense(amount: number): void {
    console.log(`\n=== Dispensing ₹${amount} ===`);
    if (amount <= 0) {
      console.log("Invalid amount. Please enter a positive value.");
      return;
    }

    this.handler.handle(amount);
    console.log("=== Dispensing Complete ===\n");
  }
}

function main() {
  const atm = new ATMDispenser();

  atm.dispense(1600); // Should dispense: 1x₹1000, 1x₹500, 1x₹100
  atm.dispense(2500); // Should dispense: 2x₹1000, 1x₹500
  atm.dispense(750);  // Should dispense: 1x₹500, 2x₹100, remaining ₹50
  atm.dispense(0);    // Invalid amount
  atm.dispense(-50);  // Invalid amount
}

main();

export {};
