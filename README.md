# Browser Server

This MCP server provides a `browse_page` tool that uses Playwright to browse a web page and return its HTML content.

## Setup

This server is designed to be portable. All dependencies, including the Playwright browser binaries, are included in this package.

To install the server, run the following command:

```bash
npm install
```

This will install the Node.js dependencies listed in `package.json`.

## Running the Server

To run the server, execute the following command:

```bash
npm start
```

This will start the server and it will listen for requests on stdin.

## Usage

The server provides a single tool, `browse_page`. To use the tool, send a JSON-RPC request to the server's stdin.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "browse_page",
    "arguments": {
      "url": "https://example.com"
    }
  }
}
```

**Response:**

The server will respond with a JSON-RPC response containing the HTML content of the page.

## Connecting the Server

To connect the server to your MCP host, add the following to your `mcp_settings.json` file:

```json
"browser-server": {
  "command": "node",
  "args": [
    "/path/to/browser-server/build/index.js"
  ],
  "env": {
    "PLAYWRIGHT_BROWSERS_PATH": "/path/to/browser-server/bin"
  },
  "disabled": false,
  "alwaysAllow": [
    "browse_page"
  ]
}
```

Replace `/path/to/browser-server` with the absolute path to the `browser-server` directory.

## Portability

This server is designed to be portable. To share the server, create a compressed archive of the entire `browser-server` directory. The recipient can then unarchive the package, run `npm install`, and then run the server.

The Playwright browser binaries are stored in the `bin` directory. The server is configured to use this directory by setting the `PLAYWRIGHT_BROWSERS_PATH` environment variable in the `mcp_settings.json` file.
