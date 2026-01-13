import fs from 'node:fs/promises';
import { join } from 'node:path';

const DB_PATH = join(process.cwd(), 'database.json');

interface Schema {
    users: any[];
    messages: any[];
    receipts: any[];
}

class DbProvider {
    private data: Schema = { users: [], messages: [], receipts: [] };
    private initialized = false;

    async init() {
        if (this.initialized) return;
        try {
            const content = await fs.readFile(DB_PATH, 'utf-8');
            this.data = JSON.parse(content);
        } catch (e) {
            await this.save();
        }
        this.initialized = true;
    }

    private async save() {
        await fs.writeFile(DB_PATH, JSON.stringify(this.data, null, 2));
    }

    async findOne(collection: keyof Schema, query: any) {
        await this.init();
        return this.data[collection].find(item =>
            Object.keys(query).every(key => item[key] === query[key])
        );
    }

    async find(collection: keyof Schema, query: any = {}) {
        await this.init();
        return this.data[collection].filter(item =>
            Object.keys(query).every(key => item[key] === query[key])
        );
    }

    async create(collection: keyof Schema, doc: any) {
        await this.init();
        const newDoc = { ...doc, _id: Date.now().toString(), createdAt: new Date().toISOString() };
        this.data[collection].push(newDoc);
        await this.save();
        return newDoc;
    }

    async findById(collection: keyof Schema, id: string) {
        await this.init();
        return this.data[collection].find(item => item._id === id);
    }
}

export const db = new DbProvider();
