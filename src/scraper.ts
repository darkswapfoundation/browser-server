import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

async function main() {
  console.log('Starting browser-server scraper test...');

  const transport = new StdioClientTransport({
    command: './run.sh',
  });
  const client = new Client(
    {
      name: 'scraper-client',
      version: '0.1.0',
    },
    {
      capabilities: {},
    }
  );

  try {
    await client.connect(transport);
    console.log('Successfully connected to server.');

    const result = await client.callTool({
      name: 'browse_page',
      arguments: {
        url: 'https://www.google.com',
      },
    });

    console.log(result);

  } catch (error) {
    console.error('Scraper test failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Scraper test finished.');
  }
}

main();