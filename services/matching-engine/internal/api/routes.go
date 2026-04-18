package api

import (
	"log"
	"net/http"

	"github.com/ds3/matching-engine/internal/harmony"
	"github.com/ds3/matching-engine/internal/similarity"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func RegisterRoutes(router *gin.Engine) {
	v1 := router.Group("/v1/matching")
	{
		v1.POST("/recommendations", getRecommendations)
		v1.POST("/group-harmony", getGroupHarmony)
		v1.POST("/group-harmony/optimize", optimizeGroupHarmony)
		v1.GET("/similar-products/:productId", getSimilarProducts)
		v1.POST("/feedback", submitFeedback)
		v1.GET("/analytics/profile/:profileId", getProfileAnalytics)
		v1.GET("/analytics/daily/:date", getDailyAnalytics)
	}
}

func getRecommendations(c *gin.Context) {
	var req RecommendationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Normalise limit: default 10, cap at 100
	if req.Limit <= 0 {
		req.Limit = 10
	} else if req.Limit > 100 {
		req.Limit = 100
	}

	// Call similarity search
	results, err := similarity.FindMatches(c.Request.Context(), req.ProfileID, req.Category, req.Limit, req.Filters)
	if err != nil {
		log.Printf("getRecommendations error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
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

	// Convert request to ProfileOutfit
	profiles := make([]harmony.ProfileOutfit, len(req.Profiles))
	for i, p := range req.Profiles {
		profiles[i] = harmony.ProfileOutfit{
			ProfileID:      p.ProfileID,
			PrimaryColor:   harmony.Color{R: p.PrimaryColor.R, G: p.PrimaryColor.G, B: p.PrimaryColor.B},
			SecondaryColor: harmony.Color{R: p.SecondaryColor.R, G: p.SecondaryColor.G, B: p.SecondaryColor.B},
			Undertone:      p.Undertone,
		}
	}

	result := harmony.CalculateGroupMatch(profiles)

	c.JSON(http.StatusOK, GroupHarmonyResponse{
		HarmonyScore:    result.HarmonyScore,
		UndertoneMatch:  result.UndertoneMatch,
		Recommendations: result.Recommendations,
	})
}

func optimizeGroupHarmony(c *gin.Context) {
	var req GroupHarmonyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert request to ProfileOutfit
	profiles := make([]harmony.ProfileOutfit, len(req.Profiles))
	for i, p := range req.Profiles {
		profiles[i] = harmony.ProfileOutfit{
			ProfileID:      p.ProfileID,
			PrimaryColor:   harmony.Color{R: p.PrimaryColor.R, G: p.PrimaryColor.G, B: p.PrimaryColor.B},
			SecondaryColor: harmony.Color{R: p.SecondaryColor.R, G: p.SecondaryColor.G, B: p.SecondaryColor.B},
			Undertone:      p.Undertone,
		}
	}

	// Optimize with target harmony of 0.85
	optimized := harmony.OptimizeGroupOutfit(profiles, 0.85)

	// Convert back to response format
	optimizedProfiles := make([]ProfileOutfitDTO, len(optimized))
	for i, p := range optimized {
		optimizedProfiles[i] = ProfileOutfitDTO{
			ProfileID:      p.ProfileID,
			PrimaryColor:   RGBColor{R: p.PrimaryColor.R, G: p.PrimaryColor.G, B: p.PrimaryColor.B},
			SecondaryColor: RGBColor{R: p.SecondaryColor.R, G: p.SecondaryColor.G, B: p.SecondaryColor.B},
			Undertone:      p.Undertone,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"optimized_profiles": optimizedProfiles,
		"target_harmony":     0.85,
	})
}

func getSimilarProducts(c *gin.Context) {
	productID := c.Param("productId")
	if productID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid productId"})
		return
	}
	if _, err := uuid.Parse(productID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid productId"})
		return
	}

	results, err := similarity.FindSimilarProducts(c.Request.Context(), productID, 10)
	if err != nil {
		log.Printf("getSimilarProducts error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"productId": productID,
		"similar":   results,
	})
}

func submitFeedback(c *gin.Context) {
	var req FeedbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate feedback type
	validFeedbackTypes := map[string]bool{
		"relevant": true, "irrelevant": true, "neutral": true, "not_interested": true,
	}
	if !validFeedbackTypes[req.FeedbackType] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid feedback type"})
		return
	}

	// Validate feedback score range
	if req.FeedbackScore != nil && (*req.FeedbackScore < 1 || *req.FeedbackScore > 5) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "feedback score must be between 1 and 5"})
		return
	}

	// In production, this would insert into the matching_history table
	// For now, return a success response
	c.JSON(http.StatusCreated, gin.H{
		"status":     "success",
		"message":    "Feedback recorded",
		"profile_id": req.ProfileID,
		"product_id": req.ProductID,
	})
}

func getProfileAnalytics(c *gin.Context) {
	profileID := c.Param("profileId")
	if _, err := uuid.Parse(profileID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid profile ID"})
		return
	}

	// In production, this would query the recommendation_analytics table
	// For now, return mock data
	c.JSON(http.StatusOK, gin.H{
		"profile_id":            profileID,
		"total_recommendations": 150,
		"total_clicks":          45,
		"total_views":           120,
		"total_add_to_cart":     12,
		"total_purchases":       8,
		"click_through_rate":    0.30,
		"conversion_rate":       0.067,
		"avg_feedback_score":    4.2,
	})
}

func getDailyAnalytics(c *gin.Context) {
	date := c.Param("date")
	// In production, validate date format and query recommendation_analytics table
	// For now, return mock data
	c.JSON(http.StatusOK, gin.H{
		"date":                  date,
		"total_recommendations": 15000,
		"total_clicks":          4500,
		"total_views":           12000,
		"total_add_to_cart":     1200,
		"total_purchases":       800,
		"click_through_rate":    0.30,
		"conversion_rate":       0.067,
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

type FeedbackRequest struct {
	ProfileID       string `json:"profileId" binding:"required"`
	ProductID       string `json:"productId" binding:"required"`
	FeedbackType    string `json:"feedbackType" binding:"required"`
	FeedbackScore   *int   `json:"feedbackScore"`
	FeedbackComment string `json:"feedbackComment"`
}

type RGBColor struct {
	R float64 `json:"r"`
	G float64 `json:"g"`
	B float64 `json:"b"`
}

type ProfileOutfitDTO struct {
	ProfileID      string   `json:"profileId"`
	PrimaryColor   RGBColor `json:"primaryColor"`
	SecondaryColor RGBColor `json:"secondaryColor"`
	Undertone      string   `json:"undertone"`
}

type GroupHarmonyRequest struct {
	Profiles []ProfileOutfitDTO `json:"profiles" binding:"required"`
}
