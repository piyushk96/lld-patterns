/**
 * Abstract Factory pattern will create factories that will create concrete objects
 */

enum OS {
  WINDOWS = "windows",
  MAC = "mac",
}

// Abstract Product A
interface IButton {
  press(): void;
}

// Concrete Product A1
class WindowsButton implements IButton {
  press(): void {
    console.log("Windows Button pressed");
  }
}

// Concrete Product A2
class MacButton implements IButton {
  press(): void {
    console.log("Mac Button pressed");
  }
}

// Abstract Product B
interface ITextBox {
  showText(): void;
}

// Concrete Product B1
class WindowsTextBox implements ITextBox {
  showText(): void {
    console.log("Windows TextBox shown");
  }
}

// Concrete Product B2
class MacTextBox implements ITextBox {
  showText(): void {
    console.log("Mac TextBox shown");
  }
}

// Abstract Factory
interface IFactory {
  createButton(): IButton;
  createTextBox(): ITextBox;
}

// Concrete Factory 1
class WindowsFactory implements IFactory {
  createButton(): IButton {
    return new WindowsButton();
  }

  createTextBox(): ITextBox {
    return new WindowsTextBox();
  }
}

// Concrete Factory 2
class MacFactory implements IFactory {
  createButton(): IButton {
    return new MacButton();
  }

  createTextBox(): ITextBox {
    return new MacTextBox();
  }
}

// Client code that uses the Abstract Factory
class GUIAbstractFactory {
  static createFactory(osType: OS): IFactory {
    if (osType === OS.WINDOWS) {
      return new WindowsFactory();
    }
    else if (osType === OS.MAC) {
      return new MacFactory();
    }

    throw new Error("Invalid OS type");
  }
}

function main() {
  const osType = OS.WINDOWS; // can take from user input
  const factory = GUIAbstractFactory.createFactory(osType);

  const button = factory.createButton();
  const textBox = factory.createTextBox();

  button.press();
  textBox.showText();
}

main();

export {}