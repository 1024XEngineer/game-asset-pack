func (dao *CourseElasticDAO) Search(ctx context.Context, keywords []string, uid int64,
	searchAfter *Cursor, // 上一页最后一条文档的 [_score, id]
) ([]Course, *Cursor, error) {
	queryString := strings.Join(keywords, " ")
	query := elastic.NewBoolQuery().Should(
		elastic.NewMatchQuery("name", queryString).Boost(1),
		elastic.NewMatchQuery("teacher", queryString).Boost(1),
	)

	// 构建 SearchService
	searchService := dao.client.Search(CourseIndexName).
		Query(query).
		Sort("_score", false). // 按相关度降序
		Sort("id", true).      // 作为tie-breaker，升序
		Size(dao.client.Limit)

	// 如果是非第一页，使用 search_after 游标
	if searchAfter != nil {
		searchService = searchService.SearchAfter(searchAfter.Score, searchAfter.Id)
	}

	// 执行查询
	resp, err := searchService.Do(ctx)
	if err != nil {
		return nil, nil, err
	}

	// 解析结果
	courses := make([]Course, 0, len(resp.Hits.Hits))
	for _, hit := range resp.Hits.Hits {
		var c Course
		if err := json.Unmarshal(hit.Source, &c); err != nil {
			return nil, nil, err
		}
		courses = append(courses, c)
	}

	// 取最后一条文档的排序值，作为下一页的 search_after返回给前端
	var nextSearchAfter []interface{}
	if len(resp.Hits.Hits) > 0 {
		nextSearchAfter = resp.Hits.Hits[len(resp.Hits.Hits)-1].Sort
		return courses, &Cursor{Id: int64(nextSearchAfter[1].(float64)), Score: nextSearchAfter[0].(float64)}, nil
	}

	return courses, nil, nil
}
