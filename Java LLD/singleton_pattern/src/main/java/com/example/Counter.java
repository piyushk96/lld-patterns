package com.example;

public class Counter {
  private static volatile Counter instance = null;
  private int count;

  private Counter() {
    this.count = 0;
    System.out.println("Counter instantiated");
  }

  public static Counter getInstance() {
    if (instance == null) {
      synchronized(Counter.class) {
        if (instance == null) {
          instance = new Counter();
        }
      }
    }
    return instance;
  }

  public int increment() {
    count = count + 1;
    return count;
  }
}
