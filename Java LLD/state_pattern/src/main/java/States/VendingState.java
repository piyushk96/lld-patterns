package States;

import com.example.VendingMachine;

public interface VendingState {
  void selectItem(VendingMachine vm, int itemCode);
  void addCoin(VendingMachine vm, double amount);
  void dispense(VendingMachine vm);
  void refill(VendingMachine vm, String itemName, int quantity);
}
