package com.example;

import java.util.ArrayList;
import java.util.List;

// Concrete Observable
public class WeatherStation implements IObservable {
  private List<IObserver> observers;
  private int temperature;
  private int humidity;

  public WeatherStation() {
    this.observers = new ArrayList<>();
  }

  private boolean hasObserver(IObserver o) {
    int index = observers.indexOf(o);
    return index >= 0;
  }

  @Override
  public void subscribe(IObserver o) {
    if (!hasObserver(o)) {
      this.observers.add(o);
    }
  }

  @Override
  public void unsubscribe(IObserver o) {
    if (hasObserver(o)) {
      this.observers.remove(o);
    }
  }

  @Override
  public void notifyObservers() {
    this.observers.forEach(o -> o.update(this.temperature, this.humidity));
  }

  public void paramsChanged(int temp, int humidity) {
    this.temperature = temp;
    this.humidity = humidity;
    this.notifyObservers();
  }
}
