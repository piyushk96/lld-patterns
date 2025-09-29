package com.example;

public interface IObservable {
  public void subscribe(IObserver o);
  public void unsubscribe(IObserver o);
  public void notifyObservers();
}
