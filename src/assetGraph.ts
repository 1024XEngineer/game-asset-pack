export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export interface AssetNode {
  id: UUID;
  description: string;
  relatedNodes: UUID[];
  img: string;
}

export interface AssetGraphInput {
  nodes: AssetNode[];
}

export interface TraversalOptions {
  maxDepth?: number;
  directWeight?: number;
  weightDropPerHop?: number;
  useThreshold?: number;
  maybeThreshold?: number;
}

export type ReferenceDecision = "use" | "maybe" | "ignore";

export interface ReferenceCandidate {
  node: AssetNode;
  decision: ReferenceDecision;
  weight: number;
  distance: number;
  path: UUID[];
  pathDescriptions: string[];
  reasons: string[];
}

export interface ReferencePlan {
  target: AssetNode;
  use: ReferenceCandidate[];
  maybe: ReferenceCandidate[];
  ignore: ReferenceCandidate[];
  visited: ReferenceCandidate[];
  options: Required<TraversalOptions>;
}

interface TraversalState {
  nodeId: UUID;
  distance: number;
  path: UUID[];
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DEFAULT_OPTIONS: Required<TraversalOptions> = {
  maxDepth: 8,
  directWeight: 10,
  weightDropPerHop: 1,
  useThreshold: 8,
  maybeThreshold: 7,
};

export class AssetGraph {
  private readonly nodes = new Map<UUID, AssetNode>();
  private readonly adjacency = new Map<UUID, UUID[]>();

  constructor(input: AssetGraphInput) {
    for (const node of input.nodes) {
      this.addNode(node);
    }

    this.validateRelatedNodes();
    this.buildAdjacency();
  }

  getNode(id: UUID): AssetNode | undefined {
    return this.nodes.get(id);
  }

  listNodes(): AssetNode[] {
    return [...this.nodes.values()];
  }

  relatedNodes(id: UUID): AssetNode[] {
    const node = this.requireNode(id);
    return node.relatedNodes.map((relatedId) => this.requireNode(relatedId));
  }

  createReferencePlan(
    targetId: UUID,
    options: TraversalOptions = {},
  ): ReferencePlan {
    const target = this.requireNode(targetId);
    const config = normalizeOptions(options);
    const states = this.findShortestPaths(target.id, config.maxDepth);
    const candidates = [...states.values()]
      .filter((state) => state.nodeId !== target.id)
      .map((state) => this.toCandidate(state, config))
      .sort(compareCandidates);

    return {
      target,
      use: candidates.filter((candidate) => candidate.decision === "use"),
      maybe: candidates.filter((candidate) => candidate.decision === "maybe"),
      ignore: candidates.filter((candidate) => candidate.decision === "ignore"),
      visited: candidates,
      options: config,
    };
  }

  private addNode(node: AssetNode): void {
    assertUuid(node.id, "node.id");
    if (this.nodes.has(node.id)) {
      throw new Error(`duplicate asset node: ${node.id}`);
    }

    this.nodes.set(node.id, {
      ...node,
      relatedNodes: [...node.relatedNodes],
    });
  }

  private validateRelatedNodes(): void {
    for (const node of this.nodes.values()) {
      const uniqueRelatedNodes = new Set<UUID>();

      for (const relatedId of node.relatedNodes) {
        assertUuid(relatedId, `${node.id}.relatedNodes`);

        if (relatedId === node.id) {
          throw new Error(`node cannot relate to itself: ${node.id}`);
        }

        if (!this.nodes.has(relatedId)) {
          throw new Error(`unknown related node ${relatedId} on ${node.id}`);
        }

        if (uniqueRelatedNodes.has(relatedId)) {
          throw new Error(`duplicate related node ${relatedId} on ${node.id}`);
        }

        uniqueRelatedNodes.add(relatedId);
      }
    }

    for (const node of this.nodes.values()) {
      for (const relatedId of node.relatedNodes) {
        const relatedNode = this.requireNode(relatedId);
        if (!relatedNode.relatedNodes.includes(node.id)) {
          throw new Error(
            `missing backlink: ${relatedId} must include ${node.id}`,
          );
        }
      }
    }
  }

  private buildAdjacency(): void {
    for (const node of this.nodes.values()) {
      this.adjacency.set(node.id, [...node.relatedNodes].sort(compareUuid));
    }
  }

  private findShortestPaths(
    targetId: UUID,
    maxDepth: number,
  ): Map<UUID, TraversalState> {
    const startState: TraversalState = {
      nodeId: targetId,
      distance: 0,
      path: [targetId],
    };
    const states = new Map<UUID, TraversalState>([[targetId, startState]]);
    const queue: TraversalState[] = [startState];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || current.distance >= maxDepth) {
        continue;
      }

      for (const relatedId of this.adjacency.get(current.nodeId) ?? []) {
        if (states.has(relatedId)) {
          continue;
        }

        const nextState: TraversalState = {
          nodeId: relatedId,
          distance: current.distance + 1,
          path: [...current.path, relatedId],
        };

        states.set(relatedId, nextState);
        queue.push(nextState);
      }
    }

    return states;
  }

  private toCandidate(
    state: TraversalState,
    config: Required<TraversalOptions>,
  ): ReferenceCandidate {
    const node = this.requireNode(state.nodeId);
    const weight = calculateWeight(state.distance, config);
    const decision = decideReference(weight, config);
    const pathDescriptions = state.path.map(
      (nodeId) => this.requireNode(nodeId).description,
    );

    return {
      node,
      decision,
      weight,
      distance: state.distance,
      path: state.path,
      pathDescriptions,
      reasons: explainCandidate(weight, state.distance, decision, config),
    };
  }

  private requireNode(id: UUID): AssetNode {
    const node = this.nodes.get(id);
    if (!node) {
      throw new Error(`unknown asset node: ${id}`);
    }
    return node;
  }
}

export function createAssetGraph(input: AssetGraphInput): AssetGraph {
  return new AssetGraph(input);
}

export function formatReferencePlan(plan: ReferencePlan): string {
  const lines = [
    `Target: ${formatNode(plan.target)}`,
    `Weight rule: distance=1 => ${plan.options.directWeight}, then -${plan.options.weightDropPerHop} per hop`,
    `Thresholds: must>=${plan.options.useThreshold}, maybe>=${plan.options.maybeThreshold}`,
    "",
  ];

  appendSection(lines, "Must reference", plan.use);
  appendSection(lines, "Maybe reference", plan.maybe);
  appendSection(lines, "Ignore", plan.ignore);

  return lines.join("\n");
}

function appendSection(
  lines: string[],
  title: string,
  candidates: ReferenceCandidate[],
): void {
  lines.push(title);
  if (candidates.length === 0) {
    lines.push("  -");
    lines.push("");
    return;
  }

  for (const candidate of candidates) {
    lines.push(
      `  ${formatNode(candidate.node)} weight=${candidate.weight} distance=${candidate.distance}`,
    );
    lines.push(`    path: ${candidate.pathDescriptions.map(shortDescription).join(" -> ")}`);
    lines.push(`    uuidPath: ${candidate.path.map(shortUuid).join(" -> ")}`);
    for (const reason of candidate.reasons) {
      lines.push(`    reason: ${reason}`);
    }
  }
  lines.push("");
}

function normalizeOptions(
  options: TraversalOptions,
): Required<TraversalOptions> {
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  assertNonNegativeInteger(config.maxDepth, "maxDepth");
  assertNonNegativeNumber(config.directWeight, "directWeight");
  assertNonNegativeNumber(config.weightDropPerHop, "weightDropPerHop");
  assertNonNegativeNumber(config.useThreshold, "useThreshold");
  assertNonNegativeNumber(config.maybeThreshold, "maybeThreshold");

  if (config.maxDepth < 1) {
    throw new Error("maxDepth must be at least 1");
  }

  if (config.useThreshold < config.maybeThreshold) {
    throw new Error("useThreshold must be greater than or equal to maybeThreshold");
  }

  return config;
}

function calculateWeight(
  distance: number,
  config: Required<TraversalOptions>,
): number {
  if (distance < 1) {
    return config.directWeight;
  }

  return Math.max(
    0,
    config.directWeight - (distance - 1) * config.weightDropPerHop,
  );
}

function decideReference(
  weight: number,
  config: Required<TraversalOptions>,
): ReferenceDecision {
  if (weight >= config.useThreshold) {
    return "use";
  }

  if (weight >= config.maybeThreshold) {
    return "maybe";
  }

  return "ignore";
}

function explainCandidate(
  weight: number,
  distance: number,
  decision: ReferenceDecision,
  config: Required<TraversalOptions>,
): string[] {
  return [
    `shortest graph distance is ${distance}`,
    `weight = ${config.directWeight} - (${distance} - 1) * ${config.weightDropPerHop} = ${weight}`,
    `${decision} because weight ${weight} ${
      decision === "use"
        ? `>= ${config.useThreshold}`
        : decision === "maybe"
          ? `>= ${config.maybeThreshold}`
          : `< ${config.maybeThreshold}`
    }`,
  ];
}

function compareCandidates(
  left: ReferenceCandidate,
  right: ReferenceCandidate,
): number {
  if (right.weight !== left.weight) {
    return right.weight - left.weight;
  }

  if (left.distance !== right.distance) {
    return left.distance - right.distance;
  }

  return left.node.id.localeCompare(right.node.id);
}

function formatNode(node: AssetNode): string {
  return `${shortDescription(node.description)} (${shortUuid(node.id)})`;
}

function shortDescription(description: string): string {
  return description.split(/[：:。]/)[0]?.trim() || description;
}

function shortUuid(id: UUID): string {
  return id.slice(0, 8);
}

function compareUuid(left: UUID, right: UUID): number {
  return left.localeCompare(right);
}

function assertUuid(value: string, label: string): void {
  if (!UUID_PATTERN.test(value)) {
    throw new Error(`${label} must be a UUID: ${value}`);
  }
}

function assertNonNegativeNumber(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a non-negative number`);
  }
}

function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
}
