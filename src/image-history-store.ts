export type SessionId = `session_${string}`;
export type ConversationNodeId = `node_${string}`;
export type ImageVersionId = `image_${string}`;

type Timestamp = string;
type EntityKind = "session" | "node" | "image";

type IdByKind = {
  session: SessionId;
  node: ConversationNodeId;
  image: ImageVersionId;
};

export interface Session {
  id: SessionId;
  title: string;
  // A session can start from a root node, a fork point, or a selected history node.
  rootNodeId: ConversationNodeId;
  startedFromNodeId: ConversationNodeId;
  headNodeId: ConversationNodeId;
  baseImageId: ImageVersionId | null;
  forkedFromSessionId?: SessionId;
  forkedFromNodeId?: ConversationNodeId;
  createdAt: Timestamp;
  rollbackEvents: RollbackEvent[];
}

export interface ConversationNode {
  id: ConversationNodeId;
  sessionId: SessionId;
  // Conversation nodes form the rollback/fork tree.
  parentNodeId: ConversationNodeId | null;
  childNodeIds: ConversationNodeId[];
  imageVersionIds: ImageVersionId[];
  createdAt: Timestamp;
  deletedAt: Timestamp | null;
}

export interface ImageVersion {
  id: ImageVersionId;
  label: string;
  assetKey: string;
  // Image versions form a separate tree for the visual history panel.
  parentImageId: ImageVersionId | null;
  childImageIds: ImageVersionId[];
  sessionId: SessionId;
  // The UI can use this node id to jump back to the generating conversation turn.
  conversationNodeId: ConversationNodeId;
  createdAt: Timestamp;
  deletedAt: Timestamp | null;
}

export interface RollbackEvent {
  at: Timestamp;
  fromNodeId: ConversationNodeId;
  toNodeId: ConversationNodeId;
  deletedNodeIds: ConversationNodeId[];
  deletedImageIds: ImageVersionId[];
}

export interface ImageHistoryTreeNode {
  id: ImageVersionId;
  label: string;
  assetKey: string;
  deleted: boolean;
  sessionId: SessionId;
  conversationNodeId: ConversationNodeId;
  children: ImageHistoryTreeNode[];
}

interface CreateSessionInput {
  title?: string;
  fromNodeId?: ConversationNodeId | null;
  baseImageId?: ImageVersionId | null;
}

interface CreateSessionFromImageInput {
  imageId: ImageVersionId;
  title?: string;
}

interface CreateSessionFromNodeInput {
  nodeId: ConversationNodeId;
  title?: string;
}

interface ForkSessionInput {
  fromSessionId: SessionId;
  atNodeId: ConversationNodeId;
  title?: string;
}

interface AppendConversationNodeInput {
  sessionId: SessionId;
}

interface CreateImageVersionInput {
  sessionId: SessionId;
  assetKey: string;
  parentImageId?: ImageVersionId | null;
  label?: string;
}

interface RollbackSessionInput {
  sessionId: SessionId;
  toNodeId: ConversationNodeId;
}

interface ListInput {
  includeDeleted?: boolean;
}

export class ImageHistoryStore {
  #sessions = new Map<SessionId, Session>();
  #conversationNodes = new Map<ConversationNodeId, ConversationNode>();
  #imageVersions = new Map<ImageVersionId, ImageVersion>();
  #nextIds: Record<EntityKind, number> = {
    session: 1,
    node: 1,
    image: 1,
  };

  createSession(input: CreateSessionInput = {}): Session {
    const { title = "Untitled session", fromNodeId = null, baseImageId = null } = input;
    const sessionId = this.#id("session");
    const headNodeId =
      fromNodeId ??
      this.#createConversationNode({
        sessionId,
        parentNodeId: null,
      }).id;

    if (fromNodeId) {
      this.#assertLiveConversationNode(fromNodeId);
    }

    if (baseImageId) {
      this.#assertLiveImageVersion(baseImageId);
    }

    const session: Session = {
      id: sessionId,
      title,
      rootNodeId: this.#pathIdsToRoot(headNodeId)[0],
      startedFromNodeId: headNodeId,
      headNodeId,
      baseImageId,
      createdAt: this.#now(),
      rollbackEvents: [],
    };

    this.#sessions.set(session.id, session);
    return clone(session);
  }

  createSessionFromNode(input: CreateSessionFromNodeInput): Session {
    // Used when the user explicitly chooses a history node as the new session head.
    return this.createSession({
      title: input.title ?? "Session from history node",
      fromNodeId: input.nodeId,
    });
  }

  createSessionFromImage(input: CreateSessionFromImageInput): Session {
    // Image history entries resolve back to the conversation node that produced them.
    const image = this.#assertLiveImageVersion(input.imageId);
    return this.createSession({
      title: input.title ?? "Session from image history",
      fromNodeId: image.conversationNodeId,
      baseImageId: image.id,
    });
  }

  forkSession(input: ForkSessionInput): Session {
    const sourceSession = this.#assertSession(input.fromSessionId);
    this.#assertNodeIsOnSessionPath(sourceSession, input.atNodeId);

    // Forking keeps the old path intact and creates another live session head.
    const fork = this.createSession({
      title: input.title ?? "Forked session",
      fromNodeId: input.atNodeId,
    });

    const storedFork = this.#sessions.get(fork.id);
    if (!storedFork) {
      throw new Error(`Unknown session after fork: ${fork.id}`);
    }

    storedFork.forkedFromSessionId = sourceSession.id;
    storedFork.forkedFromNodeId = input.atNodeId;

    return clone(storedFork);
  }

  appendConversationNode(input: AppendConversationNodeInput): ConversationNode {
    const session = this.#assertSession(input.sessionId);
    const node = this.#createConversationNode({
      sessionId: input.sessionId,
      parentNodeId: session.headNodeId,
    });

    session.headNodeId = node.id;
    return clone(node);
  }

  createImageVersion(input: CreateImageVersionInput): ImageVersion {
    const session = this.#assertSession(input.sessionId);
    const conversationNode = this.#assertLiveConversationNode(session.headNodeId);
    const parentImageId = input.parentImageId ?? null;

    if (parentImageId) {
      this.#assertLiveImageVersion(parentImageId);
    }

    // Store only an asset key and structural links; generation metadata belongs outside this model.
    const image: ImageVersion = {
      id: this.#id("image"),
      label: input.label ?? "image version",
      assetKey: input.assetKey,
      parentImageId,
      childImageIds: [],
      sessionId: input.sessionId,
      conversationNodeId: conversationNode.id,
      createdAt: this.#now(),
      deletedAt: null,
    };

    this.#imageVersions.set(image.id, image);
    conversationNode.imageVersionIds.push(image.id);

    if (parentImageId) {
      this.#imageVersions.get(parentImageId)?.childImageIds.push(image.id);
    }

    return clone(image);
  }

  rollbackSession(input: RollbackSessionInput): RollbackEvent {
    const session = this.#assertSession(input.sessionId);
    this.#assertNodeIsOnSessionPath(session, input.toNodeId);

    const oldHeadNodeId = session.headNodeId;
    const candidateNodeIds = this.#collectRollbackCandidates({
      oldHeadNodeId,
      keepNodeId: input.toNodeId,
    });

    session.headNodeId = input.toNodeId;

    // Keep nodes that are still part of another active session path.
    const livePathNodeIds = this.#collectLiveSessionPathNodeIds();
    const deletedNodeIds: ConversationNodeId[] = [];
    const deletedImageIds: ImageVersionId[] = [];
    const deletedAt = this.#now();

    for (const nodeId of candidateNodeIds) {
      const node = this.#conversationNodes.get(nodeId);
      if (!node || node.deletedAt || livePathNodeIds.has(nodeId)) {
        continue;
      }

      node.deletedAt = deletedAt;
      deletedNodeIds.push(node.id);

      // Image records produced by rolled-back conversation nodes disappear from active history.
      for (const imageId of node.imageVersionIds) {
        const image = this.#imageVersions.get(imageId);
        if (image && !image.deletedAt) {
          image.deletedAt = deletedAt;
          deletedImageIds.push(image.id);
        }
      }
    }

    const rollback: RollbackEvent = {
      at: deletedAt,
      fromNodeId: oldHeadNodeId,
      toNodeId: input.toNodeId,
      deletedNodeIds,
      deletedImageIds,
    };

    session.rollbackEvents.push(rollback);
    return clone(rollback);
  }

  getSessionPath(sessionId: SessionId): ConversationNode[] {
    const session = this.#assertSession(sessionId);
    return this.#pathIdsToRoot(session.headNodeId).map((nodeId) => {
      const node = this.#conversationNodes.get(nodeId);
      if (!node) {
        throw new Error(`Unknown conversation node: ${nodeId}`);
      }
      return clone(node);
    });
  }

  getImageHistoryTree(input: ListInput = {}): ImageHistoryTreeNode[] {
    const includeDeleted = input.includeDeleted ?? false;
    const isVisible = (image: ImageVersion) => includeDeleted || !image.deletedAt;

    const rootIds: ImageVersionId[] = [];
    for (const image of this.#imageVersions.values()) {
      if (!isVisible(image)) {
        continue;
      }

      const parent = image.parentImageId ? this.#imageVersions.get(image.parentImageId) : null;
      if (!parent || !isVisible(parent)) {
        rootIds.push(image.id);
      }
    }

    return rootIds.map((imageId) => this.#buildImageHistoryNode(imageId, isVisible));
  }

  listSessions(): Session[] {
    return [...this.#sessions.values()].map(clone);
  }

  listConversationNodes(input: ListInput = {}): ConversationNode[] {
    const includeDeleted = input.includeDeleted ?? false;
    return [...this.#conversationNodes.values()]
      .filter((node) => includeDeleted || !node.deletedAt)
      .map(clone);
  }

  listImageVersions(input: ListInput = {}): ImageVersion[] {
    const includeDeleted = input.includeDeleted ?? false;
    return [...this.#imageVersions.values()]
      .filter((image) => includeDeleted || !image.deletedAt)
      .map(clone);
  }

  #createConversationNode(input: {
    sessionId: SessionId;
    parentNodeId: ConversationNodeId | null;
  }): ConversationNode {
    if (input.parentNodeId) {
      this.#assertLiveConversationNode(input.parentNodeId);
    }

    const node: ConversationNode = {
      id: this.#id("node"),
      sessionId: input.sessionId,
      parentNodeId: input.parentNodeId,
      childNodeIds: [],
      imageVersionIds: [],
      createdAt: this.#now(),
      deletedAt: null,
    };

    this.#conversationNodes.set(node.id, node);

    if (input.parentNodeId) {
      this.#conversationNodes.get(input.parentNodeId)?.childNodeIds.push(node.id);
    }

    return node;
  }

  #buildImageHistoryNode(
    imageId: ImageVersionId,
    isVisible: (image: ImageVersion) => boolean,
  ): ImageHistoryTreeNode {
    const image = this.#imageVersions.get(imageId);
    if (!image) {
      throw new Error(`Unknown image version: ${imageId}`);
    }

    return {
      id: image.id,
      label: image.label,
      assetKey: image.assetKey,
      deleted: Boolean(image.deletedAt),
      sessionId: image.sessionId,
      conversationNodeId: image.conversationNodeId,
      children: image.childImageIds
        .map((childId) => this.#imageVersions.get(childId))
        .filter((child): child is ImageVersion => Boolean(child && isVisible(child)))
        .map((child) => this.#buildImageHistoryNode(child.id, isVisible)),
    };
  }

  #collectRollbackCandidates(input: {
    oldHeadNodeId: ConversationNodeId;
    keepNodeId: ConversationNodeId;
  }): Set<ConversationNodeId> {
    const pathSuffix: ConversationNodeId[] = [];
    let cursorId: ConversationNodeId | null = input.oldHeadNodeId;

    while (cursorId && cursorId !== input.keepNodeId) {
      pathSuffix.push(cursorId);
      cursorId = this.#conversationNodes.get(cursorId)?.parentNodeId ?? null;
    }

    const candidates = new Set<ConversationNodeId>(pathSuffix.reverse());

    // Include abandoned descendants, but later skip any node still referenced by a live session.
    const visitDescendants = (nodeId: ConversationNodeId) => {
      const node = this.#conversationNodes.get(nodeId);
      if (!node) {
        return;
      }

      for (const childId of node.childNodeIds) {
        if (!candidates.has(childId)) {
          candidates.add(childId);
          visitDescendants(childId);
        }
      }
    };

    for (const nodeId of pathSuffix) {
      visitDescendants(nodeId);
    }

    return candidates;
  }

  #collectLiveSessionPathNodeIds(): Set<ConversationNodeId> {
    const nodeIds = new Set<ConversationNodeId>();
    for (const session of this.#sessions.values()) {
      for (const nodeId of this.#pathIdsToRoot(session.headNodeId)) {
        nodeIds.add(nodeId);
      }
    }
    return nodeIds;
  }

  #pathIdsToRoot(nodeId: ConversationNodeId): ConversationNodeId[] {
    const path: ConversationNodeId[] = [];
    let cursorId: ConversationNodeId | null = nodeId;

    while (cursorId) {
      const node = this.#conversationNodes.get(cursorId);
      if (!node) {
        throw new Error(`Unknown conversation node: ${cursorId}`);
      }

      path.push(cursorId);
      cursorId = node.parentNodeId;
    }

    return path.reverse();
  }

  #assertSession(sessionId: SessionId): Session {
    const session = this.#sessions.get(sessionId);
    if (!session) {
      throw new Error(`Unknown session: ${sessionId}`);
    }
    return session;
  }

  #assertLiveConversationNode(nodeId: ConversationNodeId): ConversationNode {
    const node = this.#conversationNodes.get(nodeId);
    if (!node || node.deletedAt) {
      throw new Error(`Unknown or deleted conversation node: ${nodeId}`);
    }
    return node;
  }

  #assertLiveImageVersion(imageId: ImageVersionId): ImageVersion {
    const image = this.#imageVersions.get(imageId);
    if (!image || image.deletedAt) {
      throw new Error(`Unknown or deleted image version: ${imageId}`);
    }
    return image;
  }

  #assertNodeIsOnSessionPath(session: Session, nodeId: ConversationNodeId): void {
    this.#assertLiveConversationNode(nodeId);
    const path = this.#pathIdsToRoot(session.headNodeId);
    if (!path.includes(nodeId)) {
      throw new Error(`Node ${nodeId} is not on session ${session.id}'s active path`);
    }
  }

  #id<K extends EntityKind>(kind: K): IdByKind[K] {
    const value = this.#nextIds[kind];
    this.#nextIds[kind] += 1;
    return `${kind}_${String(value).padStart(3, "0")}` as IdByKind[K];
  }

  #now(): Timestamp {
    return new Date().toISOString();
  }
}

function clone<T>(value: T): T {
  return structuredClone(value);
}
