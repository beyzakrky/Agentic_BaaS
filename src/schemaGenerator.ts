import { Client } from 'pg';
import { getRegisteredEntities, ColumnMetadata } from './decorators';

const mapTypeToPostgres = (type: string) => {
    switch (type) {
        case 'text': return 'TEXT';
        case 'boolean': return 'BOOLEAN DEFAULT FALSE';
        case 'date': return 'TIMESTAMP';
        default: return 'TEXT';
    }
};

export async function synchronizeDatabase() {
    const client = new Client({
        connectionString: "postgresql://baas_admin:super_secret_password@localhost:5432/agentic_db"
    });
    
    await client.connect();
    console.log(" Connected to database. Schema Synchronize is starting...");

    const entities = getRegisteredEntities();

    for (const entityTarget of entities) {
        const tableName = Reflect.getMetadata("tableName", entityTarget);
        const columns: ColumnMetadata[] = Reflect.getMetadata("columns", entityTarget) || [];

        if (!tableName) continue;

        // DIKKAT: Satır başındaki karakter ters tırnak (`) işaretidir!
        let query = `CREATE TABLE IF NOT EXISTS "${tableName}" (id SERIAL PRIMARY KEY`;

        for (const col of columns) {
            const pgType = mapTypeToPostgres(col.type);
            const nullConstraint = col.required ? "NOT NULL" : "NULL";
            query += `, "${col.propertyKey}" ${pgType} ${nullConstraint}`;
        }
        query += `);`;

        console.log(`🛠️ SQL is running: ${query}`);
        await client.query(query);
        console.log(`"${tableName}" table has been synchronized successfully.`);
    }

    await client.end();
}