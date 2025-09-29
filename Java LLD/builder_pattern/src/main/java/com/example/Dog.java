package com.example;

public class Dog {
  private String name;  // required
  private String gender;  // can't change
  private String breed;  // can't change
  private double price; // optional

  private Dog(DogBuilder builder) {
    this.name = builder.getName();
    this.gender = builder.getGender();
    this.breed = builder.getBreed();
    this.price = builder.getPrice();
  }

  public String getName() {
    return this.name;
  }

  // All setters in product class are private
  private void setName(String name) {
    this.name = name;
  }

  public String getGender() {
    return this.gender;
  }

  private void setGender(String gender) {
    this.gender = gender;
  }

  public String getBreed() {
    return this.breed;
  }

  private void setBreed(String breed) {
    this.breed = breed;
  }

  public double getPrice() {
    return this.price;
  }

  private void setPrice(double price) {
    this.price = price;
  }

  @Override
  public String toString() {
    String s = "name: " + this.name + " , ";
    s += ("gender: " + this.gender + " , ");
    s += ("breed: " + this.breed + " , ");
    s += ("price: " + this.price);
    return s;
  }

  // Builder Class
  public static class DogBuilder {
    private String name;
    private String gender;
    private String breed;
    private double price;

    // Taking name in contructor makes it required
    public DogBuilder(String name) {
      this.name = name;
    }

    public String getName() {
      return this.name;
    }

    public String getGender() {
      return this.gender;
    }

    // All setters return the same Builder instance for fluent calling
    public DogBuilder setGender(String gender) {
      this.gender = gender;
      return this;
    }

    public String getBreed() {
      return this.breed;
    }

    public DogBuilder setBreed(String b) {
      this.breed = b;
      return this;
    }

    public double getPrice() {
      return this.price;
    }

    public DogBuilder setPrice(double p) {
      this.price = p;
      return this;
    }

    // Build method returns the main product
    public Dog build() {
      return new Dog(this);
    }
  }
}
