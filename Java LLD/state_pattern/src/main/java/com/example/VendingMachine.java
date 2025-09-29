package com.example;

import java.util.HashMap;
import java.util.Map;

import States.*;

public class VendingMachine {
  private Map<Integer, Product> inventory;
  private VendingState currentState;
  private int selectedItem;
  private double insertedAmount;

  private IdleState idleState;
  private ItemSelectedState itemSelectedState;
  private PaymentDoneState paymentDoneState;
  private DispenseState dispenseState;

  public VendingMachine(Product[] items) {
    this.idleState = new IdleState();
    this.itemSelectedState = new ItemSelectedState();
    this.paymentDoneState = new PaymentDoneState();
    this.dispenseState = new DispenseState();

    this.inventory = new HashMap<>();
    this.currentState = this.idleState;
    this.insertedAmount = 0.0;

    for (int i = 0; i < items.length; i++) {
      this.inventory.put(i, items[i]);
    }
  }

  public void listInventory() {
    System.out.println("Inventory");
    System.out.println("ItemId\tItemName\tPrice");
    this.inventory.forEach((k, v) -> {
      System.out.println(k + "\t" + v.getName() + "\t" + v.getPrice());
    });
  }

  public void setCurrentState(VendingState vs) {
    this.currentState = vs;
  }

  public void setSelecetedItem(int itemId) {
    this.selectedItem = itemId;
  }

  public void setInsertedAmount(double amount) {
    this.insertedAmount = amount;
  }

  public void selectItem(int id) {
    this.currentState.selectItem(this, id);
  }

  public void addCoin(double amount) {
    this.currentState.addCoin(this, amount);
  }

  public void dispense() {
    this.currentState.dispense(this);
  }
}
