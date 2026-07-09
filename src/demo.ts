import {
  createAssetGraph,
  formatReferencePlan,
  type AssetNode,
  type UUID,
} from "./assetGraph";

export const demoIds = {
  olderBrother: "2f1a0101-2d58-4aa9-8c5e-000000000101",
  olderBrotherHorse: "2f1a0102-2d58-4aa9-8c5e-000000000102",
  youngerBrother: "2f1a0103-2d58-4aa9-8c5e-000000000103",
  youngerBrotherHorse: "2f1a0104-2d58-4aa9-8c5e-000000000104",
  mother: "2f1a0105-2d58-4aa9-8c5e-000000000105",
  aunt: "2f1a0106-2d58-4aa9-8c5e-000000000106",
  motherHorse: "2f1a0107-2d58-4aa9-8c5e-000000000107",
  familyCrest: "2f1a0108-2d58-4aa9-8c5e-000000000108",
  olderSaddle: "2f1a0109-2d58-4aa9-8c5e-000000000109",
  youngerSaddle: "2f1a010a-2d58-4aa9-8c5e-00000000010a",
  motherSaddle: "2f1a010b-2d58-4aa9-8c5e-00000000010b",
  olderSword: "2f1a010c-2d58-4aa9-8c5e-00000000010c",
  youngerSword: "2f1a010d-2d58-4aa9-8c5e-00000000010d",
  motherShield: "2f1a010e-2d58-4aa9-8c5e-00000000010e",
  auntShield: "2f1a010f-2d58-4aa9-8c5e-00000000010f",
  auntSword: "2f1a0110-2d58-4aa9-8c5e-000000000110",
  stable: "2f1a0111-2d58-4aa9-8c5e-000000000111",
  royalArmory: "2f1a0112-2d58-4aa9-8c5e-000000000112",
  familyGate: "2f1a0113-2d58-4aa9-8c5e-000000000113",
  forestRoad: "2f1a0114-2d58-4aa9-8c5e-000000000114",
  borderOutpost: "2f1a0115-2d58-4aa9-8c5e-000000000115",
  oldTradeRoad: "2f1a0116-2d58-4aa9-8c5e-000000000116",
  desertCamp: "2f1a0117-2d58-4aa9-8c5e-000000000117",
  merchantCart: "2f1a0118-2d58-4aa9-8c5e-000000000118",
  banditHorse: "2f1a0119-2d58-4aa9-8c5e-000000000119",
} satisfies Record<string, UUID>;

export const demoTargets = [
  demoIds.youngerBrotherHorse,
  demoIds.youngerSaddle,
  demoIds.youngerSword,
  demoIds.auntShield,
] satisfies UUID[];

export function createDemoGraph() {
  const nodes = [
    asset(demoIds.olderBrother, "哥哥角色：已生成，冷色披风、银色护甲、稳重轮廓。"),
    asset(demoIds.olderBrotherHorse, "哥哥的马：已生成，黑马、银色马铠、蓝色缰绳、高大体型。"),
    asset(demoIds.youngerBrother, "弟弟角色：已生成，短披风、更轻盈、同族蓝色点缀。"),
    asset(demoIds.youngerBrotherHorse, "弟弟的马：待生成，需要延续家族骑乘资产语言。"),
    asset(demoIds.mother, "妈妈角色：已生成，家族主母，蓝银长袍、月牙胸针。"),
    asset(demoIds.aunt, "阿姨角色：妈妈的姐姐，已生成，紫蓝披肩、锋利轮廓。"),
    asset(demoIds.motherHorse, "妈妈的马：已生成，白马、蓝银织物、优雅马具。"),
    asset(demoIds.familyCrest, "家族徽记：已生成，蓝银配色、月牙纹章、细线雕刻。"),
    asset(demoIds.olderSaddle, "哥哥的马鞍：已生成，银边高桥鞍、蓝色皮革。"),
    asset(demoIds.youngerSaddle, "弟弟的马鞍：待生成，应比哥哥马鞍更轻便。"),
    asset(demoIds.motherSaddle, "妈妈的马鞍：已生成，白革、月牙纹章、流苏。"),
    asset(demoIds.olderSword, "哥哥的剑：已生成，长剑、银护手、蓝宝石。"),
    asset(demoIds.youngerSword, "弟弟的剑：待生成，短一些但保留家族武器风格。"),
    asset(demoIds.motherShield, "妈妈的盾牌：已生成，圆盾、月牙纹、蓝银珐琅。"),
    asset(demoIds.auntShield, "阿姨的盾牌：待生成，可以参考妈妈盾牌但更锋利。"),
    asset(demoIds.auntSword, "阿姨的剑：已生成，细剑、紫蓝护手、尖锐剪影。"),
    asset(demoIds.stable, "家族马厩：已生成，木质马厩、蓝色旗帜、清晨光。"),
    asset(demoIds.royalArmory, "家族武器库：已生成，蓝银武器架、月牙纹装饰。"),
    asset(demoIds.familyGate, "家族大门：已生成，蓝银门旗、石质拱门。"),
    asset(demoIds.forestRoad, "林间旧路：已生成，离开家族区域后的潮湿石路。"),
    asset(demoIds.borderOutpost, "边境哨站：已生成，远离家族主场景，灰木与尘土。"),
    asset(demoIds.oldTradeRoad, "旧商路：已生成，连接边境与沙漠，视觉上已经偏离家族资产。"),
    asset(demoIds.desertCamp, "沙漠营地：已生成，暖色布棚、粗糙皮具。"),
    asset(demoIds.merchantCart, "商队货车：已生成，杂色布料、旧木轮。"),
    asset(demoIds.banditHorse, "沙漠盗匪马：已生成，沙色、破旧皮具、粗犷剪影。"),
  ];

  connect(nodes, demoIds.youngerBrotherHorse, demoIds.youngerBrother);
  connect(nodes, demoIds.youngerBrotherHorse, demoIds.youngerSaddle);
  connect(nodes, demoIds.youngerBrotherHorse, demoIds.stable);

  connect(nodes, demoIds.olderBrotherHorse, demoIds.olderBrother);
  connect(nodes, demoIds.olderBrotherHorse, demoIds.olderSaddle);

  connect(nodes, demoIds.motherHorse, demoIds.mother);
  connect(nodes, demoIds.motherHorse, demoIds.motherSaddle);

  connect(nodes, demoIds.olderBrother, demoIds.youngerBrother);
  connect(nodes, demoIds.olderBrother, demoIds.mother);
  connect(nodes, demoIds.youngerBrother, demoIds.mother);
  connect(nodes, demoIds.mother, demoIds.aunt);

  connect(nodes, demoIds.olderBrother, demoIds.familyCrest);
  connect(nodes, demoIds.youngerBrother, demoIds.familyCrest);
  connect(nodes, demoIds.mother, demoIds.familyCrest);
  connect(nodes, demoIds.aunt, demoIds.familyCrest);

  connect(nodes, demoIds.olderSaddle, demoIds.familyCrest);
  connect(nodes, demoIds.youngerSaddle, demoIds.familyCrest);
  connect(nodes, demoIds.motherSaddle, demoIds.familyCrest);

  connect(nodes, demoIds.olderBrother, demoIds.olderSword);
  connect(nodes, demoIds.youngerBrother, demoIds.youngerSword);
  connect(nodes, demoIds.mother, demoIds.motherShield);
  connect(nodes, demoIds.aunt, demoIds.auntShield);
  connect(nodes, demoIds.aunt, demoIds.auntSword);

  connect(nodes, demoIds.olderSword, demoIds.royalArmory);
  connect(nodes, demoIds.youngerSword, demoIds.royalArmory);
  connect(nodes, demoIds.motherShield, demoIds.royalArmory);
  connect(nodes, demoIds.auntShield, demoIds.royalArmory);
  connect(nodes, demoIds.auntSword, demoIds.royalArmory);

  connect(nodes, demoIds.stable, demoIds.familyGate);
  connect(nodes, demoIds.familyGate, demoIds.forestRoad);
  connect(nodes, demoIds.forestRoad, demoIds.borderOutpost);
  connect(nodes, demoIds.borderOutpost, demoIds.oldTradeRoad);
  connect(nodes, demoIds.oldTradeRoad, demoIds.desertCamp);
  connect(nodes, demoIds.desertCamp, demoIds.merchantCart);
  connect(nodes, demoIds.merchantCart, demoIds.banditHorse);

  return createAssetGraph({ nodes });
}

function asset(id: UUID, description: string): AssetNode {
  return {
    id,
    description,
    relatedNodes: [],
    img: `placeholder://asset/${id}`,
  };
}

function connect(nodes: AssetNode[], left: UUID, right: UUID): void {
  const leftNode = requireDemoNode(nodes, left);
  const rightNode = requireDemoNode(nodes, right);
  addUnique(leftNode.relatedNodes, right);
  addUnique(rightNode.relatedNodes, left);
}

function requireDemoNode(nodes: AssetNode[], id: UUID): AssetNode {
  const node = nodes.find((item) => item.id === id);
  if (!node) {
    throw new Error(`unknown demo node: ${id}`);
  }
  return node;
}

function addUnique(values: UUID[], value: UUID): void {
  if (!values.includes(value)) {
    values.push(value);
  }
}

if (import.meta.main) {
  const graph = createDemoGraph();
  for (const targetId of demoTargets) {
    const plan = graph.createReferencePlan(targetId);
    console.log(formatReferencePlan(plan));
    console.log("=".repeat(80));
  }
}
