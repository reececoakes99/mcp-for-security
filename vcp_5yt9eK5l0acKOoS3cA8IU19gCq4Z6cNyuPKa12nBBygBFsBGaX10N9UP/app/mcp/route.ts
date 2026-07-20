import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "shuffledns",
      "Build a shuffledns command for DNS brute forcing, resolving, or filtering. CLI execution is unavailable on Vercel serverless, so the command is returned for authorized local execution.",
      {
        target: z.string().describe("A domain name (for example, example.com) to scan."),
        resolver: z.string().describe("Path to the resolver file."),
        mode: z.enum(["bruteforce", "resolve", "filter"]).describe("shuffledns operation mode."),
        wordlist: z.string().describe("Path to the wordlist or domain list."),
        rateLimit: z.number().optional().describe("Optional DNS requests-per-second rate limit."),
      },
      async ({ target, resolver, mode, wordlist, rateLimit }) => {
        const args = [
          "-d", shellQuote(target),
          "-r", shellQuote(resolver),
          "-mode", mode,
          "-w", shellQuote(wordlist),
          "-m", "<path-to-massdns>",
          "-silent",
        ];
        if (rateLimit !== undefined) args.push("-t", String(rateLimit));

        const command = `shuffledns ${args.join(" ")}`;
        return {
          content: [
            {
              type: "text",
              text: `Run this command locally on a system with shuffledns and massdns installed:\n\n${command}\n\nReplace <path-to-massdns> with the local massdns binary path. Only scan systems you are authorized to test.`,
            },
          ],
        };
      },
    );
  },
  {
    capabilities: {
      tools: {
        shuffledns: {
          description: "Build a shuffledns command for DNS brute forcing, resolving, or filtering.",
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
