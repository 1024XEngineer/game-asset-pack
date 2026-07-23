package router_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"

	"github.com/1024XEngineer/Holonic-Asset/internal"
	"github.com/1024XEngineer/Holonic-Asset/internal/ai/handler"
	"github.com/1024XEngineer/Holonic-Asset/internal/ai/service"
)

func TestAIRoutesReturnPlaceholderResponses(t *testing.T) {
	aiService := service.NewAIService()
	aiHandler := handler.NewAIHandler(aiService)
	e := internal.Register(nil, nil, aiHandler)

	routes := []string{
		"/api/v1/ai/tile-set/item/edit",
		"/api/v1/ai/scenery/layer/edit",
		"/api/v1/ai/animation/frame/edit",
		"/api/v1/ai/ui/component/edit",
	}

	for _, route := range routes {
		t.Run(route, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, route, strings.NewReader("{}"))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			recorder := httptest.NewRecorder()

			e.ServeHTTP(recorder, req)

			if recorder.Code != http.StatusOK {
				t.Fatalf("expected status %d, got %d: %s", http.StatusOK, recorder.Code, recorder.Body.String())
			}
			if recorder.Body.String() != "{\"taskId\":0}\n" {
				t.Fatalf("unexpected placeholder response: %s", recorder.Body.String())
			}
		})
	}
}

func TestAIRoutesDoNotExposeUnsupportedOperations(t *testing.T) {
	aiService := service.NewAIService()
	aiHandler := handler.NewAIHandler(aiService)
	e := internal.Register(nil, nil, aiHandler)

	routes := []string{
		"/api/v1/ai/character/generate",
		"/api/v1/ai/character/edit",
		"/api/v1/ai/project-preview/generate",
		"/api/v1/ai/tile-set/item/generate",
		"/api/v1/ai/object/generate",
		"/api/v1/ai/object/edit",
		"/api/v1/ai/scenery/layer/generate",
		"/api/v1/ai/animation/generate",
		"/api/v1/ai/ui/generate",
	}

	for _, route := range routes {
		t.Run(route, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, route, strings.NewReader("{}"))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			recorder := httptest.NewRecorder()

			e.ServeHTTP(recorder, req)

			if recorder.Code != http.StatusNotFound {
				t.Fatalf("expected status %d, got %d: %s", http.StatusNotFound, recorder.Code, recorder.Body.String())
			}
		})
	}
}
