# Figma MCP Setup Guide

This guide explains how to set up the Figma MCP server (using `figma-developer-mcp`) for AI coding assistants like Cursor and Claude Desktop.

## 1. Get Figma Access Token

1. Log in to [Figma](https://www.figma.com).
2. Go to **Settings** -> **Personal access tokens**.
3. Click **Generate new token**.
4. Enter a description (e.g., "MCP Server") and press Enter.
5. **Copy the generated token** (it starts with `figd_`). You won't be able to see it again.

## 2. Configure MCP Server

Add the server configuration to your MCP client's configuration file.

### For Cursor / VS Code

File path (Mac): `~/.config/cursor/mcp.json`

### For Claude Desktop

File path (Mac): `~/Library/Application Support/Claude/claude_desktop_config.json`

**Configuration JSON:**

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--figma-api-key=YOUR_FIGMA_TOKEN_HERE", "--stdio"]
    }
  }
}
```

> **Note:** Replace `YOUR_FIGMA_TOKEN_HERE` with the token you copied in Step 1.

## 3. Apply Changes

1. Save the configuration file.
2. Restart your MCP client (Cursor, VS Code, or Claude Desktop) or use the "Reload Window" command.
3. The Figma MCP server should now be active. You can test it by asking the AI to read your Figma designs (e.g., `@figma`).
