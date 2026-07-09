package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/olivere/elastic/v7"
)

const (
	AssetIndexName = "asset_index"
	ServerAddr     = ":8080"
)

// Asset 资产数据结构
type Asset struct {
	ProjectName string `json:"project_name"`
	Tag         string `json:"tag"`
	UserInput   string `json:"user_input"`
	Content     string `json:"content"`
}

// StoreRequest 存储请求
type StoreRequest struct {
	ProjectName string `json:"project_name"`
	Tag         string `json:"tag"`
	UserInput   string `json:"user_input"`
}

// StoreResponse 存储响应
type StoreResponse struct {
	ID      string `json:"id"`
	Message string `json:"message"`
}

// SearchResponse 搜索响应
type SearchResponse struct {
	Total       int           `json:"total"`
	Results     []ScoredAsset `json:"results"`
	Normalize   NormalizeMeta `json:"normalize"`
}

// NormalizeMeta 归一化参数元信息
type NormalizeMeta struct {
	Formula  string  `json:"formula"`
	D        float64 `json:"d"`
	MinScore float64 `json:"min_score"`
}

// ErrorResponse 错误响应
type ErrorResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// AssetDAO 资产数据访问对象
type AssetDAO struct {
	client *elastic.Client
}

// NewAssetDAO 创建新的AssetDAO
func NewAssetDAO(client *elastic.Client) *AssetDAO {
	return &AssetDAO{client: client}
}

// Store 将Asset以字符串拼接方式存储到ES中
func (dao *AssetDAO) Store(ctx context.Context, asset *Asset) (string, error) {
	asset.Content = strings.Join([]string{
		asset.ProjectName,
		asset.Tag,
		asset.UserInput,
	}, " ")

	resp, err := dao.client.Index().
		Index(AssetIndexName).
		BodyJson(asset).
		Do(ctx)
	if err != nil {
		return "", fmt.Errorf("store asset failed: %w", err)
	}

	return resp.Id, nil
}

const (
	// searchFetchSize   ES 单次查询拉取的候选条数
	searchFetchSize = 20
	// scoreDenominator sigmoid 归一化分母: 1/(1+e^(-score/D)), D 越小越严
	scoreDenominator = 5.0
	// normalizedMin 归一化后最低阈值 (0~1)
	normalizedMin = 0.9
)

// ScoredAsset 带 ES 原始分数及 sigmoid 归一化分数的资产
type ScoredAsset struct {
	Asset
	Score      float64 `json:"_score"`
	Normalized float64 `json:"_normalized"`
}

// Search 根据 project name, tag, user input 搜索匹配的Asset
// 使用 sigmoid 归一化: 1/(1+e^(-score/D)) > normalizedMin 才返回，最多 5 条
func (dao *AssetDAO) Search(ctx context.Context, projectName, tag, userInput string) ([]ScoredAsset, error) {
	queryParts := make([]string, 0, 3)
	if projectName != "" {
		queryParts = append(queryParts, projectName)
	}
	if tag != "" {
		queryParts = append(queryParts, tag)
	}
	if userInput != "" {
		queryParts = append(queryParts, userInput)
	}
	queryString := strings.Join(queryParts, " ")

	query := elastic.NewBoolQuery().Should(
		elastic.NewMatchQuery("content", queryString),
	)

	resp, err := dao.client.Search(AssetIndexName).
		Query(query).
		Sort("_score", false).
		Size(searchFetchSize).
		Do(ctx)
	if err != nil {
		return nil, fmt.Errorf("search asset failed: %w", err)
	}

	if len(resp.Hits.Hits) == 0 {
		return nil, nil
	}

	// 解析结果，保留原始分数
	scored := make([]ScoredAsset, 0, len(resp.Hits.Hits))
	for _, hit := range resp.Hits.Hits {
		var a Asset
		if err := json.Unmarshal(hit.Source, &a); err != nil {
			return nil, fmt.Errorf("unmarshal asset failed: %w", err)
		}
		s := float64(0)
		if hit.Score != nil {
			s = *hit.Score
		}
		scored = append(scored, ScoredAsset{Asset: a, Score: s})
	}

	// sigmoid 归一化过滤: normalized = 1/(1+e^(-score/D)) >= normalizedMin
	filtered := make([]ScoredAsset, 0, 5)
	for _, sa := range scored {
		sa.Normalized = 1.0 / (1.0 + math.Exp(-sa.Score/scoreDenominator))
		if sa.Normalized >= normalizedMin {
			filtered = append(filtered, sa)
			if len(filtered) >= 5 {
				break
			}
		}
	}

	return filtered, nil
}

// ---- HTTP Handlers ----

type AssetHandler struct {
	dao *AssetDAO
}

func (h *AssetHandler) handleStore(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "仅支持 POST 请求")
		return
	}

	var req StoreRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, fmt.Sprintf("请求体解析失败: %v", err))
		return
	}

	if req.ProjectName == "" || req.Tag == "" || req.UserInput == "" {
		writeError(w, http.StatusBadRequest, "project_name、tag、user_input 均为必填字段")
		return
	}

	asset := &Asset{
		ProjectName: req.ProjectName,
		Tag:         req.Tag,
		UserInput:   req.UserInput,
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	id, err := h.dao.Store(ctx, asset)
	if err != nil {
		log.Printf("Store error: %v", err)
		writeError(w, http.StatusInternalServerError, fmt.Sprintf("存储失败: %v", err))
		return
	}

	writeJSON(w, http.StatusCreated, StoreResponse{
		ID:      id,
		Message: "Asset stored successfully",
	})
}

func (h *AssetHandler) handleSearch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "仅支持 GET 请求")
		return
	}

	projectName := r.URL.Query().Get("project_name")
	tag := r.URL.Query().Get("tag")
	userInput := r.URL.Query().Get("user_input")

	if projectName == "" && tag == "" && userInput == "" {
		writeError(w, http.StatusBadRequest, "至少需要提供一个搜索条件: project_name、tag 或 user_input")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	results, err := h.dao.Search(ctx, projectName, tag, userInput)
	if err != nil {
		log.Printf("Search error: %v", err)
		writeError(w, http.StatusInternalServerError, fmt.Sprintf("搜索失败: %v", err))
		return
	}

	writeJSON(w, http.StatusOK, SearchResponse{
		Total:   len(results),
		Results: results,
		Normalize: NormalizeMeta{
			Formula:  "1/(1+e^(-score/d))",
			D:        scoreDenominator,
			MinScore: normalizedMin,
		},
	})
}

// corsMiddleware 跨域中间件
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// ---- 工具函数 ----

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, ErrorResponse{
		Code:    status,
		Message: message,
	})
}

func main() {
	client, err := elastic.NewClient(
		elastic.SetURL("http://localhost:9200"),
		elastic.SetSniff(false),
		elastic.SetHealthcheckTimeout(5*time.Second),
	)
	if err != nil {
		log.Fatalf("Failed to connect to Elasticsearch: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, _, err = client.Ping("http://localhost:9200").Do(ctx)
	if err != nil {
		log.Printf("Warning: Elasticsearch 连接检查失败: %v（服务仍会启动）", err)
	}

	dao := NewAssetDAO(client)
	handler := &AssetHandler{dao: dao}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/assets", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/api/assets" {
			handler.handleStore(w, r)
			return
		}
		writeError(w, http.StatusNotFound, "接口不存在")
	})
	mux.HandleFunc("/api/assets/search", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/api/assets/search" {
			handler.handleSearch(w, r)
			return
		}
		writeError(w, http.StatusNotFound, "接口不存在")
	})

	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	log.Printf("🚀 服务启动中，监听地址: http://localhost%s", ServerAddr)
	log.Printf("   POST /api/assets        - 存储资产")
	log.Printf("   GET  /api/assets/search  - 搜索资产")
	log.Printf("   GET  /api/health         - 健康检查")

	server := &http.Server{
		Addr:         ServerAddr,
		Handler:      corsMiddleware(mux),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("服务启动失败: %v", err)
	}
}
