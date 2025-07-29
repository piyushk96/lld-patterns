/**
 * Adapter pattern is used to convert the interface of a class into another interface that the clients expect.
 *
 * To convert data for incompatible interfaces
 */

interface PaymentGateway {
  pay(amount: number): void;
}

class ModernPaymentProcessor implements PaymentGateway {
  pay(amount: number): void {
    console.log(`Paid $${amount} using Modern Payment Processor.`);
  }
}

// Legacy payment processor with a different interface (Adaptee)
class LegacyPaymentProcessor {
  makePayment(amountInCents: number): void {
    console.log(`Paid $${amountInCents / 100} using Legacy Payment Processor.`);
  }
}

class LegacyPaymentAdapter implements PaymentGateway {
  private legacyProcessor: LegacyPaymentProcessor;

  constructor(legacyProcessor: LegacyPaymentProcessor) {
    this.legacyProcessor = legacyProcessor;
  }

  pay(amount: number): void {
    // Convert dollars to cents for the legacy processor
    this.legacyProcessor.makePayment(amount * 100);
  }
}

// Client code
class CheckoutService {
  private paymentGateway: PaymentGateway;

  constructor(paymentGateway: PaymentGateway) {
    this.paymentGateway = paymentGateway;
  }

  checkout(amount: number) {
    this.paymentGateway.pay(amount);
    console.log("Checkout successful");
  }
}

function main() {
  const modernProcessor = new ModernPaymentProcessor();
  const modernCheckout = new CheckoutService(modernProcessor);
  modernCheckout.checkout(50);

  const legacyProcessor = new LegacyPaymentProcessor();
  const legacyAdapter = new LegacyPaymentAdapter(legacyProcessor);
  const legacyCheckout = new CheckoutService(legacyAdapter);
  legacyCheckout.checkout(50);
}

main();

export {};