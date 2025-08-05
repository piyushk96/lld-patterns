/**
 * Composite Design Pattern
 *
 * The Composite pattern allows you to compose objects into tree structures
 * and treat individual objects and compositions uniformly.
 */

// Component interface - defines the common interface for all objects in the composition
interface FileSystemComponent {
  name: string;
  size: number;
  display(indent: string): void;
  getSize(): number;
}

// Leaf class - represents individual objects in the composition
class File implements FileSystemComponent {
  constructor(
    public name: string,
    public size: number
  ) {}

  display(indent: string = ''): void {
    console.log(`${indent}📄 ${this.name} (${this.size} bytes)`);
  }

  getSize(): number {
    return this.size;
  }
}

// Composite class - represents compositions of objects
class Directory implements FileSystemComponent {
  private children: FileSystemComponent[] = [];

  constructor(public name: string) {}

  add(component: FileSystemComponent): void {
    this.children.push(component);
  }

  remove(component: FileSystemComponent): void {
    const index = this.children.indexOf(component);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  getChild(index: number): FileSystemComponent | undefined {
    return this.children[index];
  }

  display(indent: string = ''): void {
    console.log(`${indent}📁 ${this.name}/`);
    for (const child of this.children) {
      child.display(indent + '  ');
    }
  }

  getSize(): number {
    return this.children.reduce((total, child) => total + child.getSize(), 0);
  }

  get size(): number {
    return this.getSize();
  }
}

// Client code demonstrating the Composite pattern
function main(): void {
  console.log('🌳 Composite Design Pattern Example: File System Structure\n');

  // Create the root directory
  const root = new Directory('Root');

  // Create some files
  const file1 = new File('document.txt', 1024);
  const file2 = new File('image.jpg', 2048);
  const file3 = new File('readme.md', 512);

  // Create subdirectories
  const documents = new Directory('Documents');
  const pictures = new Directory('Pictures');
  const projects = new Directory('Projects');

  // Add files to directories
  documents.add(file1);
  documents.add(file3);
  pictures.add(file2);

  // Create project files
  const projectFile1 = new File('main.ts', 2048);
  const projectFile2 = new File('config.json', 1024);
  const projectFile3 = new File('package.json', 1536);

  // Add files to projects directory
  projects.add(projectFile1);
  projects.add(projectFile2);
  projects.add(projectFile3);

  // Create a nested directory structure
  const src = new Directory('src');
  const utils = new Directory('utils');
  const utilsFile = new File('helper.ts', 768);
  utils.add(utilsFile);
  src.add(utils);

  projects.add(src);

  // Add directories to root
  root.add(documents);
  root.add(pictures);
  root.add(projects);

  // Display the entire file system structure
  console.log('📂 File System Structure:');
  root.display();

  console.log('\n📊 Statistics:');
  console.log(`Total size: ${root.getSize()} bytes`);
  console.log(`Documents size: ${documents.getSize()} bytes`);
  console.log(`Pictures size: ${pictures.getSize()} bytes`);
  console.log(`Projects size: ${projects.getSize()} bytes`);

  // Demonstrate removing a component
  console.log('\n🗑️  After removing document.txt:');
  documents.remove(file1);
  root.display();
  console.log(`Total size after removal: ${root.getSize()} bytes`);
}

main()

export {}