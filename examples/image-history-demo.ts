import { ImageHistoryStore } from "../src/image-history-store";

const store = new ImageHistoryStore();

const main = store.createSession({ title: "Main image iteration" });

const firstNode = store.appendConversationNode({ sessionId: main.id });
const v1 = store.createImageVersion({
  sessionId: main.id,
  label: "v1",
  assetKey: "asset:character:v1",
});

store.appendConversationNode({ sessionId: main.id });
const v2 = store.createImageVersion({
  sessionId: main.id,
  parentImageId: v1.id,
  label: "v2",
  assetKey: "asset:character:v2",
});

store.appendConversationNode({ sessionId: main.id });
store.createImageVersion({
  sessionId: main.id,
  parentImageId: v2.id,
  label: "v3",
  assetKey: "asset:character:v3",
});

const fork = store.forkSession({
  fromSessionId: main.id,
  atNodeId: firstNode.id,
  title: "Fork from v1",
});

store.appendConversationNode({ sessionId: fork.id });
store.createImageVersion({
  sessionId: fork.id,
  parentImageId: v1.id,
  label: "v1-fork-scout",
  assetKey: "asset:character:v1-scout",
});

const sessionFromNode = store.createSessionFromNode({
  nodeId: firstNode.id,
  title: "New session from history node",
});

store.appendConversationNode({ sessionId: sessionFromNode.id });
store.createImageVersion({
  sessionId: sessionFromNode.id,
  parentImageId: v1.id,
  label: "v1-fork-merchant",
  assetKey: "asset:character:v1-merchant",
});

const rollback = store.rollbackSession({
  sessionId: main.id,
  toNodeId: firstNode.id,
});

console.dir(
  {
    rollback,
    sessions: store.listSessions(),
    activeImageHistory: store.getImageHistoryTree(),
    allImageHistory: store.getImageHistoryTree({ includeDeleted: true }),
    allConversationNodes: store.listConversationNodes({ includeDeleted: true }),
  },
  { depth: null },
);
