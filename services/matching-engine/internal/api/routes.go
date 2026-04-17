package api

import (
	"net/http"

	"github.com/ds3/matching-engine/internal/similarity"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine) {
	v1 := router.Group("/v1/matching")
	{
		v1.POST("/recommendations", getRecommendations)
		v1.POST("/group-harmony", getGroupHarmony)
		v1.GET("/similar-products/:productId", getSimilarProducts)
	}
}

func getRecommendations(c *gin.Context) {
	var req RecommendationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Call similarity search
	results, err := similarity.FindMatches(c.Request.Context(), req.ProfileID, req.Category, req.Limit, req.Filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, RecommendationResponse{
		ProfileID:       req.ProfileID,
		Recommendations: results,
		Total:           len(results),
	})
}

func getGroupHarmony(c *gin.Context) {
	var req GroupHarmonyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Call group matching
	results, err := similarity.FindGroupMatches(c.Request.Context(), req.ProfileIDs, req.Occasion, req.Category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, results)
}

func getSimilarProducts(c *gin.Context) {
	productID := c.Param("productId")

	results, err := similarity.FindSimilarProducts(c.Request.Context(), productID, 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"productId": productID,
		"similar":   results,
	})
}

// Request/Response types
type RecommendationRequest struct {
	ProfileID string            `json:"profileId" binding:"required"`
	Category  string            `json:"category"`
	Limit     int               `json:"limit"`
	Filters   map[string]string `json:"filters"`
}

type RecommendationResponse struct {
	ProfileID       string             `json:"profileId"`
	Recommendations []similarity.Match `json:"recommendations"`
	Total           int                `json:"total"`
}

type GroupHarmonyRequest struct {
	ProfileIDs []string `json:"profileIds" binding:"required"`
	Occasion   string   `json:"occasion"`
	Category   string   `json:"category"`
}
