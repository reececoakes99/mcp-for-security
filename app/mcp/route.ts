import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const shellQuote = (value: string) => `'${value.replace(/'/g, `'\\''`)}'`;

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "do-katana",
      "Performs fast and configurable web crawling on the given target URLs, identifying endpoints, parameters, and JS-based links. Returns a local Katana command because CLI execution is unavailable on Vercel serverless.",
      {
        target: z.array(z.string()).describe("List of target URLs (e.g., https://example.com) to scan for endpoints and JavaScript-based links."),
        exclude: z.array(z.string()).optional().describe("List of URLs or regex patterns to exclude from crawling."),
        depth: z.number().optional().describe("Maximum crawl depth (e.g., 3 for three levels deep)."),
        js_crawl: z.boolean().optional().describe("Enable crawling and endpoint extraction from JavaScript files."),
        jsluice: z.boolean().optional().describe("Enable JSluice parsing for deeper JavaScript-based link analysis (memory intensive)."),
        headers: z.array(z.string()).optional().describe("List of custom headers or cookies to include in requests (format: Header:Value)."),
        strategy: z.enum(["depth-first", "breadth-first"]).optional().describe("Crawling strategy to use: 'depth-first' or 'breadth-first' (default is depth-first)."),
        headless: z.boolean().optional().describe("Enable headless browser-based hybrid crawling (experimental)."),
        system_chrome: z.boolean().optional().describe("Use the locally installed Chrome browser instead of the built-in one."),
        show_brwoser: z.boolean().optional().describe("Show the browser window even in headless mode (for debugging/visual inspection)."),
      },
      async ({ target, exclude, depth, js_crawl, jsluice, headers, strategy, headless, system_chrome, show_brwoser }) => {
        const args: string[] = ["-u", target.join(","), "-silent"];
        if (exclude?.length) args.push("-exclude", exclude.join(","));
        if (depth !== undefined) args.push("-d", String(depth));
        if (js_crawl) args.push("-jc");
        if (jsluice) args.push("-jsl");
        for (const header of headers ?? []) args.push("-H", header);
        if (strategy) args.push("-strategy", strategy);
        if (headless) args.push("-headless");
        if (system_chrome) args.push("-system-chrome");
        if (show_brwoser) args.push("-show-browser");

        const command = ["katana", ...args.map(shellQuote)].join(" ");
        return {
          content: [{
            type: "text",
            text: `Katana cannot execute inside Vercel's serverless runtime. Run this command locally on a system where Katana is installed:\n\n${command}`,
          }],
        };
      },
    );
  },
  {
    capabilities: {
      tools: {
        "do-katana": {
          description: "Build a Katana web-crawling command for authorized local execution.",
        },
      },
    },
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true,
  },
);

export { handler as GET, handler as POST, handler as DELETE };
