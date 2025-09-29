package com.example;

public class Driver {
    public static void main(String[] args) {
        Dog d1 = new Dog.DogBuilder("Bruno")
                        .setGender("Male")
                        .setBreed("Pug")
                        .setPrice(203.33)
                        .build();

        Dog d2 = new Dog.DogBuilder("Alissa")
                        .setGender("Female")
                        .build();

        System.out.println(d1);
        System.out.println(d2);
    }
}