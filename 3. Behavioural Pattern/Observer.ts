/**
 * Observer pattern example: YouTube channel subscription system
 */

// Observer interface
interface ISubscriber {
  update(): void;
}

class Subscriber implements ISubscriber {
  name: string;
  channel: Channel;

  constructor(name: string, channel: Channel) {
    this.name = name;
    this.channel = channel;
  }

  update(): void {
    console.log(`${this.name} received notification: New video uploaded - ${this.channel.getLatestVideo()}`);
  }
}

// Observable interface
interface IChannel {
  subscribe(subscriber: ISubscriber): void;
  unsubscribe(subscriber: ISubscriber): void;
  notifySubscribers(): void;
}

// Concrete Observable
class Channel implements IChannel {
  private subscribers: ISubscriber[] = [];
  private name: string;
  private latestVideo: string = "";

  constructor(channelName: string) {
    this.name = channelName;
  }

  subscribe(subscriber: ISubscriber): void {
    this.subscribers.push(subscriber);
    console.log(`${(subscriber as Subscriber).name} subscribed to ${this.name}`);
  }

  unsubscribe(subscriber: ISubscriber): void {
    this.subscribers = this.subscribers.filter(s => s !== subscriber);
    console.log(`${(subscriber as Subscriber).name} unsubscribed from ${this.name}`);
  }

  uploadVideo(videoTitle: string): void {
    this.latestVideo = videoTitle;
    console.log(`\n${this.name} uploaded a new video: ${videoTitle}`);
    this.notifySubscribers();
  }

  getLatestVideo(): string {
    return "Latest video: " + this.latestVideo;
  }

  notifySubscribers(): void {
    this.subscribers.forEach(subscriber => subscriber.update());
  }
}

function main() {
  const channel = new Channel("TechExplained");

  const alice = new Subscriber("Alice", channel);
  const bob = new Subscriber("Bob", channel);
  const charlie = new Subscriber("Charlie", channel);

  channel.subscribe(alice);
  channel.subscribe(bob);
  channel.subscribe(charlie);

  channel.uploadVideo("Observer Pattern in TypeScript");

  channel.unsubscribe(bob);
  channel.uploadVideo("Strategy Pattern Explained");
}

main();

export {}