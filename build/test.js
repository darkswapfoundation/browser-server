import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
async function main() {
    console.log('Starting browser-server connection test...');
    const transport = new StdioClientTransport({
        command: './run.sh',
    });
    const client = new Client({
        name: 'test-client',
        version: '0.1.0',
    });
    try {
        await client.connect(transport);
        console.log('Successfully connected to server.');
    }
    catch (error) {
        console.error('Connection test failed:', error);
        process.exit(1);
    }
    finally {
        await client.close();
        console.log('Connection test finished.');
    }
}
main();
