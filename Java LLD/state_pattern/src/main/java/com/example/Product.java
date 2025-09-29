package com.example;

public class Product {
  private String name;
  private double price;
  private int quantity;

  public Product(String name, double price, int quantity) {
    this.name = name;
    this.price = price;
    this.quantity = quantity;
  }

  public double getPrice() {
    return price;
  }

  public String getName() {
    return name;
  }

  public int getQuantity() {
    return this.quantity;
  }

  public void decreaseQuantity() {
    this.quantity--;
  }

  public void addQuantity(int quantity) {
    this.quantity += quantity;
  }
}
