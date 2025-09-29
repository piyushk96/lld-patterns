package com.example;

// Concrete Observer
public class AvgTempDisplay implements IObserver {
  private int sumOfTemps;
  private int countOfTemps;

  public AvgTempDisplay(IObservable observable) {
    this.sumOfTemps = 0;
    this.countOfTemps = 0;
    observable.subscribe(this);
  }

  @Override
  public void update(int temp, int humidity) {
    this.sumOfTemps += temp;
    this.countOfTemps++;
    this.display();
  }

  public void display() {
    System.out.println("Avg. Temperature = " + this.sumOfTemps + " Records = " + this.countOfTemps);
  }

}
