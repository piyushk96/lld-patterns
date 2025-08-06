/**
 * Template Method Pattern
 *
 * Defines the skeleton of an algorithm in a base class,
 * letting subclasses override specific steps without changing the structure.
 */

abstract class ModelTrainer {
  // template method
  trainPipeline(path: string) {
    this.loadData(path);
    this.preprocessData();
    this.trainModel();
    this.evaluateModel();
    this.saveModel();
  }

  protected loadData(path: string) {
    console.log(`[Common] Loading data from ${path}`);
  }

  protected preprocessData() {
    console.log(`[Common] Preprocessing data`);
  }

  protected abstract trainModel(): void;
  protected abstract evaluateModel(): void;

  protected saveModel() {
    console.log("[Common] Saving model to disk as default format")
  }
}

class NeuralNetworkTrainer extends ModelTrainer {
  trainModel() {
    console.log("[NeuralNetwork] Training model");
  }

  evaluateModel() {
    console.log("[NeuralNetwork] Evaluating model");
  }

  saveModel() {
    console.log("[NeuralNetwork] Saving model to disk as .h5 format");
  }
}

class DecisionTreeTrainer extends ModelTrainer {
  trainModel() {
    console.log("[DecisionTree] Training model");
  }

  evaluateModel() {
    console.log("[DecisionTree] Evaluating model");
  }
}

function main() {
  console.log("Training Neural Network");
  const neuralNetworkTrainer = new NeuralNetworkTrainer();
  neuralNetworkTrainer.trainPipeline("data/images.csv");

  console.log("Training Decision Tree");
  const decisionTreeTrainer = new DecisionTreeTrainer();
  decisionTreeTrainer.trainPipeline("data/images.csv");
}

main();

export {}