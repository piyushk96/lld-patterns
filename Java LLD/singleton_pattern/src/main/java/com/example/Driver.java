package com.example;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Driver {
    public static void main(String[] args) {
        ExecutorService executor = Executors.newFixedThreadPool(2);

        Counter c1 = Counter.getInstance();
        Counter c2 = Counter.getInstance();

        executor.execute(() -> System.out.println(c1.increment()));
        executor.execute(() -> System.out.println(c2.increment()));
    }
}