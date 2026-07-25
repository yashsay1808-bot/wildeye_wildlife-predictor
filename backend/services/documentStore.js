import { v4 as uuidv4 } from 'uuid';

export class DocumentStore {
  constructor() {
    this.documents = [];
  }

  async initialize() {
    this.documents = [
      {
        id: uuidv4(),
        title: 'Elephant Conflict Management',
        content: `Elephant Conflict Prevention and Response:
1. Prevention: Use electric fences, noise makers
2. During conflict: Alert rangers, use loud noises
3. After: Document damages, file claims`,
        source: 'Forest Department Guidelines',
        category: 'elephant',
        date: '2024-01-15',
      },
    ];
    console.log(`✅ Loaded ${this.documents.length} forest guidelines`);
  }

  getAll() {
    return this.documents;
  }

  searchByCategory(category) {
    return this.documents.filter(doc => doc.category === category);
  }

  searchByKeyword(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    return this.documents.filter(doc =>
      doc.title.toLowerCase().includes(lowerKeyword) ||
      doc.content.toLowerCase().includes(lowerKeyword)
    );
  }

  addDocument(title, content, source, category) {
    const doc = {
      id: uuidv4(),
      title,
      content,
      source,
      category,
      date: new Date().toISOString().split('T')[0],
    };
    this.documents.push(doc);
    return doc;
  }
}
