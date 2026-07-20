import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const shellQuote = (value: string) => `'${value.replace(/'/g, `'\\''`)}'`;

const toolDescription =
  "Run ffuf with a specified URL and additional arguments. Returns a safe local command because FFUF CLI execution is unavailable on Vercel serverless.";

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "do-ffuf",
      toolDescription,
      {
        url: z.string().url().describe("Target URL to fuzz, including the FUZZ keyword where payloads should be inserted."),
        ffuf_args: z
          .array(z.string())
          .describe(
            "Additional ffuf arguments, such as -w /path/to/wordlist.txt, -mc 200,301, or -t 40.",
          ),
      },
      async ({ url, ffuf_args }) => {
        const command = ["ffuf", "-u", url, ...ffuf_args].map(shellQuote).join(" ");

        return {
          content: [
            {
              type: "text",
              text: `FFUF cannot execute inside Vercel's serverless runtime. Run this command locally on a system where ffuf is installed and where you have authorization to test the target:\n\n${command}`,
            },
          ],
        };
      },
    );
  },
  {
    capabilities: {
      tools: {
        "do-ffuf": {
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
