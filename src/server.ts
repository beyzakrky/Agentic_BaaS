// Both to identify 'MemberMissions' and To run the system
import "reflect-metadata"; 
import { entity, text, boolean, date } from './decorators';
import { synchronizeDatabase } from './schemaGenerator';
import express from 'express';
import { Pool } from 'pg';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";


// 1. Agent-Defined Code-First Model
@entity('MemberMissions')
export class MemberMission {
    @text({ required: true })
    title!: string;

    @text()
    detail!: string;

    @boolean()
    completed!: boolean;

    @date()
    createdTime!: Date;
}

// Connection Pool for Database Queries
const pool = new Pool({
    connectionString: "postgresql://baas_admin:super_secret_password@localhost:5432/agentic_db"
});

// MCP Server
const mcpServer = new Server(
    {name: "agentic-baas-server", version: "1.0.0"},
    { capabilities: { tools: {} } }
);

// To list the tools that agents can use
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "add_member_mission",
                description: "Adds new mission into MemberMissions table in database.",
                inputSchema: {
                    type: "object",
                    properties: {
                        title: {type: "string", description: "Mission Title" },
                        detail: { type: "string", description: "Mission description" }
                    },
                    required: ["title"]
                }
            }
        ]
    };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "add_member_mission") {
        const {title, detail } = request.params.arguments as { title: string; detail?: string };
        try {
            const query = `INSERT INTO "MemberMissions" ("title", "detail", "completed") VALUES ($1, $2, $3) RETURNING *;`;
            const result = await pool.query(query, [title, detail || "", false]);

            return {
                content: [{ type: "text", text: `Successful! Agent wrote mission into database: ${JSON.stringify(result.rows[0])}`}]
            };
        } catch ( err: any) {
            return {
                isError: true,
                content: [{ type: "text", text: `Error: ${err.message}` }]
            };
        }
    }
    throw new Error("Unknown tool");
});

// Express HTTP layer 
const app = express();
app.use(express.json());

/* app.get('/api/mcp/discover', (req, res) => {
    // Schema output that agents can explore for Model Context Protocol (MCP)
    res.json({
        protocol: "mcp/1.0",
        capabilities: {
            resources: ["MemberMissions"],
            tools: [
                {
                    name: "insert_to_table",
                    description: "Adds data into a table that has schema dynamically.",
                    parameters: {
                        type: "object",
                        properties: {
                            tableName: { type: "string" },
                            data: { type: "object" }
                        },
                        required: ["tableName", "data"]
                    }
                }
            ]
        }
    });
}); 
*/

//MCP Tool Execution
app.post('/api/mcp/mutation', async (req: express.Request, res: express.Response): Promise<void> => {
    const { tableName, data } = req.body;

    if (!tableName ||!data) {
        res.status(400).json({ error: "Missing tableName or data" });
        return;
    }

    try {
        const columns = Object.keys(data);
        const values = Object.values(data);

        const colNames = columns.map(c => `"${c}"`).join(', ');
        const valuePlaceholders = values.map((_, i) => `$${i + 1}`).join(', ');

        const query = `INSERT INTO "${tableName}" (${colNames}) VALUES (${valuePlaceholders}) RETURNING *;`;

        const result = await pool.query(query, values);

        res.json({
            success: true,
            message: `Data successfully written by Agent to ${tableName}`,
            insertedRow: result.rows[0]
        });
    } catch (error: any) {
        console.error("Agent automation write error:", error);
        res.status(500).json({ error: error.message });
    }
});

/* async function bootstrap() {
    try {
        // Creates the tables automatically after Docker Postgres runs 
        await synchronizeDatabase();

        const PORT = 3000;
        // Not: Burada tırnak işaretlerini backtick (`) yaptık!
        app.listen(PORT, () => {
            console.log(` Agentic BaaS Core is running on port ${PORT}.`);
            console.log(` MCP Discovery Endpoint: http://localhost:${PORT}/api/mcp/discover`);
            console.log(` MCP Mutation Endpoint: http://localhost:${PORT}/api/mcp/mutation`);
        });
    } catch (error) {
        console.error("Running Error:", error);
    }
} 
    */
async function bootstrap() {
    try {
        await synchronizeDatabase();

        // Start HTTP server
        app.listen(3000, () => {
            console.error(`HTTP layer is active: http://localhost:3000`);
        });

        // Start MCP Server (STDIN/STDOUT) in Stdio
        const transport = new StdioServerTransport();
        await mcpServer.connect(transport);
        console.error(" MCP Protocol Layer (Stdio) connected successfully.");
    } catch (error) {
        console.error("Running error:", error);
    }
}

bootstrap();