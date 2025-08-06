// ============================================
// PROXY DESIGN PATTERN
// ============================================
// The Proxy pattern provides a placeholder for another object
// to control access to it. It's useful for lazy loading, access control,
// logging, caching, and remote service access.

// ============================================
// 1. VIRTUAL PROXY - Lazy Loading
// ============================================
// Virtual proxy controls access to a resource that is expensive to create

interface IImage {
  display(): void;
}

class RealImage implements IImage {
  private filename: string;

  constructor(filename: string) {
    this.filename = filename;
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    console.log(`Loading image: ${this.filename}`);
  }

  display(): void {
    console.log(`Displaying image: ${this.filename}`);
  }
}

class ImageProxy implements IImage {
  private realImage: RealImage | null = null;
  private filename: string;

  constructor(filename: string) {
    this.filename = filename;
  }

  display(): void {
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename);
    }
    this.realImage.display();
  }
}

function demonstrateVirtualProxy() {
  console.log("\n=== VIRTUAL PROXY DEMONSTRATION ===");

  const image = new ImageProxy("large-image.jpg");
  console.log("Virtual proxy created, but image not loaded yet");

  // Image is loaded only when display() is called
  image.display();
  image.display(); // Second call uses cached instance
}

// ============================================
// 2. PROTECTION PROXY - Access Control
// ============================================
// Protection proxy controls access to a resource based on permissions

interface IDocumentReader {
  unlockPdf(filePath: string, password: string): void;
}

class RealDocumentReader implements IDocumentReader {
  unlockPdf(filePath: string, password: string): void {
    console.log(`Unlocking PDF: ${filePath} with password: ${password}`);
  }
}

class DocumentReaderProxy implements IDocumentReader {
  private realDocument: RealDocumentReader;
  private userRole: string;

  constructor( userRole: string) {
    this.realDocument = new RealDocumentReader();
    this.userRole = userRole;
  }

  unlockPdf(filePath: string, password: string): void {
    if (this.userRole === "admin") {
      this.realDocument.unlockPdf(filePath, password);
    }
    else {
      console.log("Access denied");
    }
  }
}

function demonstrateProtectionProxy(): void {
  console.log("\n=== PROTECTION PROXY DEMONSTRATION ===");

  const adminProxy = new DocumentReaderProxy("admin");
  const readerProxy = new DocumentReaderProxy("reader");

  console.log("Admin access:");
  adminProxy.unlockPdf("data/sensitive.pdf", "secret123");

  console.log("\nReader access:");
  readerProxy.unlockPdf("data/sensitive.pdf", "secret123");
}

// ============================================
// 3. REMOTE PROXY - Remote Service Access
// ============================================
// Remote proxy provides a local representative for an object in a different address space

interface IRemoteService {
  fetchData(): Promise<string>;
}

class RemoteService implements IRemoteService {
  async fetchData(): Promise<string> {
    console.log(`Fetching data from remote server`);
    return "Remote data from server";
  }
}

class RemoteProxy implements IRemoteService {
  private realService: RemoteService | null = null;

  private getRealService(): RemoteService {
    if (this.realService === null) {
      this.realService = new RemoteService();
    }
    return this.realService;
  }

  async fetchData(): Promise<string> {
    // Fetch from remote service
    const data = await this.getRealService().fetchData();
    return data;
  }
}

async function demonstrateRemoteProxy(): Promise<void> {
  console.log("\n=== REMOTE PROXY DEMONSTRATION ===");

  const remoteProxy = new RemoteProxy();

  console.log("First data fetch (will be slow):");
  const data1 = await remoteProxy.fetchData();
  console.log(`Received: ${data1}`);
}

// ============================================
// MAIN DEMONSTRATION
// ============================================

async function main(): Promise<void> {
  console.log("PROXY DESIGN PATTERN EXAMPLES");
  console.log("=============================");

  demonstrateVirtualProxy();
  demonstrateProtectionProxy();
  await demonstrateRemoteProxy();
}

main();

export {};
