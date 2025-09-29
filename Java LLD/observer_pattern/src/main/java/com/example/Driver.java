package com.example;

public class Driver {
    private static void delay() {
        try {
            Thread.sleep(1000);
        }
        catch(InterruptedException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        WeatherStation ws = new WeatherStation();

        AvgTempDisplay tempDisplay = new AvgTempDisplay(ws);
        CurrentWeatherDisplay currDisplay = new CurrentWeatherDisplay(ws);

        ws.paramsChanged(5, 10);

        delay();

        ws.paramsChanged(15, 20);

        delay();

        ws.paramsChanged(30, 40);
    }
}