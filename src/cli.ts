#!/usr/bin/env bun

import { formatReferencePlan, type UUID } from "./assetGraph";
import { createDemoGraph, demoIds } from "./demo";

interface CliOptions {
  target?: UUID;
  json: boolean;
  help: boolean;
  list: boolean;
}

const options = parseArgs(Bun.argv.slice(2));

if (options.help) {
  console.log(usage());
  process.exit(0);
}

try {
  const graph = createDemoGraph();

  if (options.list) {
    console.log(
      graph
        .listNodes()
        .map((node) => `${node.id}  ${node.description}`)
        .join("\n"),
    );
    process.exit(0);
  }

  const target = options.target ?? demoIds.youngerBrotherHorse;
  const plan = graph.createReferencePlan(target);

  if (options.json) {
    console.log(JSON.stringify(plan, null, 2));
  } else {
    console.log(formatReferencePlan(plan));
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`assetgraph: ${message}`);
  process.exitCode = 1;
}

function parseArgs(args: string[]): CliOptions {
  let target: UUID | undefined;
  let json = false;
  let help = false;
  let list = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index] ?? "";

    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }

    if (arg === "--list") {
      list = true;
      continue;
    }

    if (arg === "--target") {
      target = (args[index + 1] as UUID | undefined) ?? target;
      index += 1;
      continue;
    }
  }

  return {
    target,
    json,
    help,
    list,
  };
}

function usage(): string {
  return [
    "Usage:",
    "  bun run demo",
    "  bun run assetgraph --list",
    "  bun run assetgraph --target <asset-uuid>",
    "  bun run assetgraph --target <asset-uuid> --json",
    "",
    "Examples:",
    "  bun run demo",
    `  bun run assetgraph --target ${demoIds.youngerBrotherHorse}`,
  ].join("\n");
}
