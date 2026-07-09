package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type SeedAsset struct {
	ProjectName string `json:"project_name"`
	Tag         string `json:"tag"`
	UserInput   string `json:"user_input"`
}

var assets = []SeedAsset{
	// =================================================================
	// farm-adventure (32条)
	// user_input 模拟真实美术需求的prompt，会自然提及关联资产做参考
	// =================================================================

	// ── 马匹家族 (8条, tag=animal) ──
	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "哥哥的马，棕色成年公马，背部有白色菱形斑点，鬃毛深棕色，体型健壮"},

	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "弟弟的马，浅棕色小马驹，体型比哥哥的马小一圈，毛色偏浅，额头有白色额毛"},

	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "爸爸的马，参考爸爸的体型，高大黑色战马，肩宽体阔肌肉发达，披铁质马铠"},

	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "妈妈的马，纯白母马，体态修长优雅，鬃毛银白如丝，和爸爸的马形成对比"},

	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "白马，通体纯白鬃毛飘逸，和妈妈的马相似但更高更瘦，擅长奔跑"},

	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "黑马，纯黑公马皮毛油亮，风格偏野性，和哥哥的马温顺性格完全不同"},

	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "老马，棕色退役老马，毛色暗淡背部微弓，曾经和爸爸的马一起上过战场"},

	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "花斑马，黑白花色母马，性格温顺，和哥哥的马同住一个马厩"},

	// ── 驴 (3条, tag=animal) ──
	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "灰驴，灰色毛驴长耳朵，背上驮两个麻袋，专门给哥哥的马和弟弟的马运草料"},

	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "小黑驴，深灰皮毛大耳朵，体型矮小结实，脖子挂铃铛，经常拴在马厩旁边"},

	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "老驴，棕灰色皮毛粗糙，耳朵下垂，站石磨旁，和老马是邻居"},

	// ── 牛 (3条, tag=animal) ──
	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "黑白花奶牛，荷斯坦品种，体型壮实产奶量大，牛棚就在马厩隔壁"},

	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "小牛犊，黑白花刚出生一周，走路还不稳，和弟弟的马差不多大"},

	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "黄牛，棕黄色耕牛肩胛隆起，帮爸爸拉马车，和爸爸的马是干活搭档"},

	// ── 羊 (3条, tag=animal) ──
	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "白色绵羊，羊毛蓬松卷曲像棉花，黑色脸和腿，在农场另一边放牧"},

	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "小羊羔，雪白绒毛蓬松像棉花糖，粉色鼻子，刚满月"},

	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "灰色山羊，弯角山羊胡，喜欢爬石头，和绵羊共用一片草场"},

	// ── 狗 (2条, tag=animal) ──
	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "边境牧羊犬，黑白花色耳尖竖立，帮主人赶羊群，也会帮忙照看马群"},

	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "大黄狗，中华田园犬短毛棕黄，守在农舍门口，见到哥哥的马回来会摇尾巴"},

	// ── 家禽 (3条, tag=animal) ──
	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "大公鸡，红冠金颈翠绿尾羽，每天清晨站在围栏上打鸣，把整个农场叫醒"},

	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "芦花母鸡，麻褐色羽毛，蹲在干草窝里孵蛋，鸡窝在马厩后院"},

	{ProjectName: "farm-adventure", Tag: "animal", UserInput: "小雏鸡，鹅黄绒毛蓬松，跟在母鸡后面啄米，刚孵出来三天"},

	// ── 骑乘装备 (4条, tag=equipment) ──
	{ProjectName: "farm-adventure", Tag: "equipment", UserInput: "皮革马鞍，棕色手工缝制鞍面菱形压花，铜色马镫，是哥哥的马的专属鞍具"},

	{ProjectName: "farm-adventure", Tag: "equipment", UserInput: "小号马鞍，比哥哥的马的鞍具小一号，鞍桥更圆润，给弟弟的马用"},

	{ProjectName: "farm-adventure", Tag: "equipment", UserInput: "灰色驮鞍，粗布缝制内填稻草，两侧麻绳驮篮，套在灰驴身上给马运草料"},

	{ProjectName: "farm-adventure", Tag: "equipment", UserInput: "红色缰绳，红白双股麻绳编织铜扣连接，一套给哥哥的马一套给爸爸的马"},

	// ── 建筑 (4条, tag=building) ──
	{ProjectName: "farm-adventure", Tag: "building", UserInput: "木质马厩，原木色八隔间红瓦斜顶，哥哥的马弟弟的马和爸爸的马都在这里"},

	{ProjectName: "farm-adventure", Tag: "building", UserInput: "驴棚，茅草斜顶小木棚两个隔间，紧挨着马厩，灰驴和小黑驴住这里"},

	{ProjectName: "farm-adventure", Tag: "building", UserInput: "红色谷仓，尖顶高大外墙红漆斑驳，储存马和驴的过冬草料"},

	{ProjectName: "farm-adventure", Tag: "building", UserInput: "红砖农舍，白窗框绿斜顶，门口三级石阶烟囱冒烟，门口趴着大黄狗"},

	// ── 农作物 (2条, tag=crop) ──
	{ProjectName: "farm-adventure", Tag: "crop", UserInput: "金色麦田，麦穗沉甸甸低垂金黄光泽一望无际，收割后的麦秆喂马"},

	{ProjectName: "farm-adventure", Tag: "crop", UserInput: "青翠玉米地，秸秆高过人头叶片宽大浓绿，嫩玉米叶喂牛和驴"},

	// =================================================================
	// space-war (12条) - 不同project，搜农场不应出现
	// =================================================================

	{ProjectName: "space-war", Tag: "vehicle", UserInput: "星际战列舰，银灰流线舰体长500米，舰首重型激光炮阵列，参考旗舰规格设计"},

	{ProjectName: "space-war", Tag: "vehicle", UserInput: "轻型驱逐舰，深蓝三角舰体，引擎淡蓝尾焰，是战列舰的护航舰"},

	{ProjectName: "space-war", Tag: "vehicle", UserInput: "舰载战斗机，白色三角翼透明座舱，从战列舰甲板起降，用于近距离格斗"},

	{ProjectName: "space-war", Tag: "vehicle", UserInput: "外星母舰，暗黑巨三角造型压迫感强，体表紫色纹路发光，携带大量小型攻击机"},

	{ProjectName: "space-war", Tag: "weapon", UserInput: "重型激光炮塔，银白圆柱炮管充能蓝光，是战列舰的主武器"},

	{ProjectName: "space-war", Tag: "weapon", UserInput: "太空追踪鱼雷，银色梭形弹体红感应器，可锁定敌方驱逐舰引擎热源"},

	{ProjectName: "space-war", Tag: "weapon", UserInput: "离子加农炮，细长炮管蓝紫能量纹路，可穿透护盾直击舰体"},

	{ProjectName: "space-war", Tag: "equipment", UserInput: "能量护盾发生器，六边形基座悬浮蓝光核心，覆盖整艘战列舰"},

	{ProjectName: "space-war", Tag: "equipment", UserInput: "单兵太空机甲，人形高3米深灰外甲，关节蓝光环，用于登舰作战"},

	{ProjectName: "space-war", Tag: "equipment", UserInput: "离子推进器组，三组圆柱引擎并联，喷口蓝色环状加速圈层层嵌套"},

	{ProjectName: "space-war", Tag: "resource", UserInput: "紫色能量水晶，六棱柱晶体悬浮磁力基座，为战列舰和驱逐舰提供能源"},

	{ProjectName: "space-war", Tag: "building", UserInput: "环形轨道空间站，银白双层圆环旋转，前线指挥中心，为战列舰编队提供补给"},

	// =================================================================
	// ocean-explorer (8条) - 不同project，搜农场不应出现
	// =================================================================

	{ProjectName: "ocean-explorer", Tag: "vehicle", UserInput: "深渊潜水艇，钛合金球形舱体三个探照灯，最大下潜11000米"},

	{ProjectName: "ocean-explorer", Tag: "equipment", UserInput: "水下探测器，橙色流线外壳4K摄像头环形LED灯，配合潜水艇使用"},

	{ProjectName: "ocean-explorer", Tag: "environment", UserInput: "热带珊瑚礁群，各色珊瑚层叠生长，小丑鱼雀鲷穿梭，阳光透水面洒下"},

	{ProjectName: "ocean-explorer", Tag: "environment", UserInput: "海底古沉船，木质船体半埋白沙中覆海藻藤壶，桅杆断裂斜插"},

	{ProjectName: "ocean-explorer", Tag: "creature", UserInput: "巨型深海章鱼，暗红皮肤巨大吸盘触手长达20米，盘踞在沉船之上"},

	{ProjectName: "ocean-explorer", Tag: "creature", UserInput: "座头鲸母子，灰黑流线身躯腹部白纹，浮出水面喷白色水柱"},

	{ProjectName: "ocean-explorer", Tag: "environment", UserInput: "海底活火山，岩浆遇水冷却成黑色玄武岩，周围管状蠕虫密布"},

	{ProjectName: "ocean-explorer", Tag: "character", UserInput: "深海探险者，橙色全封闭潜水服黄铜色圆头盔，背双氧气瓶持焊枪"},
}

func main() {
	baseURL := "http://localhost:8080/api/assets"
	client := &http.Client{Timeout: 10 * time.Second}

	log.Printf("写入 %d 条数据...\n", len(assets))

	success := 0
	for i, a := range assets {
		body, _ := json.Marshal(a)
		resp, err := client.Post(baseURL, "application/json", bytes.NewReader(body))
		if err != nil {
			log.Printf("[%d] ❌ %v", i+1, err)
			continue
		}
		resp.Body.Close()
		if resp.StatusCode == http.StatusCreated {
			success++
			fmt.Printf("[%d/%d] ✅ %-16s | %-10s | %s\n", i+1, len(assets), a.ProjectName, a.Tag, truncate(a.UserInput, 55))
		} else {
			log.Printf("[%d] ⚠️ HTTP %d", i+1, resp.StatusCode)
		}
	}

	log.Printf("\n完成! %d/%d\n", success, len(assets))
}

func truncate(s string, n int) string {
	runes := []rune(s)
	if len(runes) > n {
		return string(runes[:n]) + "..."
	}
	return s
}
