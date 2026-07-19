import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const shellQuote = (value: string) => `'${value.replace(/'/g, `'\\''`)}'`;

const toolDescription =
  "Run Masscan with a specified target and ports. Masscan is a fast port scanner whose primary inputs are IP addresses/ranges and port numbers. Returns a safe local command because CLI execution is unavailable on Vercel serverless.";

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "do-masscan",
      toolDescription,
      {
        target: z.string().describe("Target IP address or range, for example 1.1.1.1 or 192.168.1.0/24."),
        port: z.string().describe("Target port, port range, or port list, for example 1234, 0-65535, or 80,443."),
        masscan_args: z.array(z.string()).describe("Additional Masscan arguments, for example --max-rate and 1000."),
      },
      async ({ target, port, masscan_args }) => {
        const args = [`-p${port}`, target, ...masscan_args];
        const command = ["masscan", ...args.map(shellQuote)].join(" ");

        return {
          content: [
            {
              type: "text",
              text: `Masscan cannot execute inside Vercel's serverless runtime. Run this command locally on a system where Masscan is installed, with appropriate privileges and authorization:\n\n${command}`,
            },
          ],
        };
      },
    );
  },
  {
    capabilities: {
      tools: {
        "do-masscan": {
          description: toolDescription,
        },
      },
    },
  } as any,
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true,
  },
);

export { handler as GET, handler as POST, handler as DELETE };
