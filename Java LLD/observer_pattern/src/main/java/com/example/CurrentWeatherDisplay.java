package com.example;

public class CurrentWeatherDisplay implements IObserver {
  private int temperature;
  private int humidity;

  public CurrentWeatherDisplay(IObservable o) {
    o.subscribe(this);
  }

  @Override
  public void update(int temp, int humidity) {
    this.temperature = temp;
    this.humidity = humidity;
    this.display();
  }

  public void display() {
    System.out.println("Current Temperatur = " + this.temperature + " Humidity = " + this.humidity);
  }
}
