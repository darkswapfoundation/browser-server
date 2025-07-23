#!/usr/bin/env node
import { z } from 'zod';
import playwright from 'playwright';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  CallToolResult,
  ListToolsRequestSchema,
  ListToolsResult,
  Tool,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Define the tool
const browsePageToolInfo = {
  name: 'browse_page',
  title: 'Browse Page',
  description: 'Browse a web page and return its HTML content.',
  inputSchema: z.object({
    url: z.string().url().describe('The URL to browse'),
  }),
};

// Create an MCP server
const server = new Server(
  {
    name: 'browser-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Implement the 'tools/list' request handler
server.setRequestHandler(
  ListToolsRequestSchema,
  (): ListToolsResult => {
    const toolDefinition: Tool = {
      name: browsePageToolInfo.name,
      title: browsePageToolInfo.title,
      description: browsePageToolInfo.description,
      inputSchema: zodToJsonSchema(browsePageToolInfo.inputSchema) as Tool['inputSchema'],
    };
    return {
      tools: [toolDefinition],
    };
  }
);

// Implement the 'tools/call' request handler
server.setRequestHandler(
  CallToolRequestSchema,
  async (request): Promise<CallToolResult> => {
    if (request.params.name !== browsePageToolInfo.name) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Tool ${request.params.name} not found`
      );
    }

    const parseResult = await browsePageToolInfo.inputSchema.safeParseAsync(
      request.params.arguments
    );

    if (!parseResult.success) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid arguments for tool ${request.params.name}: ${parseResult.error.message}`
      );
    }

    const { url } = parseResult.data;
    let browser;
    try {
      browser = await playwright.chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(url);
      const content = await page.content();
      return {
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          {
            type: 'text',
            text: `Error browsing page: ${message}`,
          },
        ],
        isError: true,
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
);


// Connect the server to a transport
const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  console.error('Browser MCP server running on stdio');
});
