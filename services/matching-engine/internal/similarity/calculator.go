package similarity

import (
	"context"
	"fmt"
	"math"
	"sort"

	"github.com/ds3/matching-engine/internal/database"
)

const (
	// Weight for different factors in multi-objective scoring
	WeightStyle    = 0.30
	WeightColor    = 0.25
	WeightFit      = 0.25
	WeightPrice    = 0.10
	WeightPopularity = 0.10
)

// Match represents a product match result
type Match struct {
	ProductID      string   `json:"productId"`
	ProductName    string   `json:"productName"`
	MatchScore     float64  `json:"matchScore"`
	MatchReasons   []Reason `json:"matchReasons"`
	Price          float64  `json:"price"`
	ImageURL       string   `json:"imageUrl"`
	VendorID       string   `json:"vendorId"`
	InStock        bool     `json:"inStock"`
}

// Reason explains why a product matched
type Reason struct {
	Factor string  `json:"factor"`
	Score  float64 `json:"score"`
	Weight float64 `json:"weight"`
}

// FindMatches finds top N matching products for a profile
func FindMatches(ctx context.Context, profileID, category string, limit int, filters map[string]string) ([]Match, error) {
	if limit == 0 {
		limit = 10
	}

	pool := database.GetPool()

	// Get profile vector
	var profileVector []float64
	err := pool.QueryRow(ctx, `
		SELECT vector_json 
		FROM identity_vectors 
		WHERE profile_id = $1
	`, profileID).Scan(&profileVector)

	if err != nil {
		return nil, fmt.Errorf("profile vector not found: %w", err)
	}

	// Get candidate products (with optional category filter)
	var query string
	var args []interface{}
	
	if category != "" {
		query = `
			SELECT id, global_product_id, vector_json, base_price, stock_quantity, status
			FROM vendor_offers 
			WHERE status = 'active' AND stock_quantity > 0
			AND global_product_id IN (
				SELECT id FROM global_products WHERE category_id IN (
					SELECT id FROM categories WHERE slug = $1
				)
			)
		`
		args = []interface{}{category}
	} else {
		query = `
			SELECT id, global_product_id, vector_json, base_price, stock_quantity, status
			FROM vendor_offers 
			WHERE status = 'active' AND stock_quantity > 0
		`
		args = []interface{}{}
	}

	rows, err := pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query products: %w", err)
	}
	defer rows.Close()

	var candidates []Match
	
	for rows.Next() {
		var offerID, productID string
		var productVector []float64
		var price float64
		var stock int
		var status string

		err := rows.Scan(&offerID, &productID, &productVector, &price, &stock, &status)
		if err != nil {
			continue
		}

		if len(productVector) == 0 {
			continue
		}

		// Calculate cosine similarity
		similarity := cosineSimilarity(profileVector, productVector)

		// Multi-objective scoring (simplified)
		styleScore := similarity
		colorScore := similarity * 0.9 // Placeholder
		fitScore := 0.8 // Placeholder based on size match
		priceScore := 0.7 // Placeholder based on price range

		totalScore := styleScore*WeightStyle +
			colorScore*WeightColor +
			fitScore*WeightFit +
			priceScore*WeightPrice

		match := Match{
			ProductID:  productID,
			MatchScore: totalScore,
			Price:      price,
			InStock:    stock > 0,
			MatchReasons: []Reason{
				{Factor: "style", Score: styleScore, Weight: WeightStyle},
				{Factor: "color", Score: colorScore, Weight: WeightColor},
				{Factor: "fit", Score: fitScore, Weight: WeightFit},
			},
		}
		candidates = append(candidates, match)
	}

	// Sort by match score
	sort.Slice(candidates, func(i, j int) bool {
		return candidates[i].MatchScore > candidates[j].MatchScore
	})

	// Return top N
	if len(candidates) > limit {
		candidates = candidates[:limit]
	}

	return candidates, nil
}

// FindGroupMatches finds coordinating outfits for multiple profiles
func FindGroupMatches(ctx context.Context, profileIDs []string, occasion, category string) (map[string]interface{}, error) {
	// Get all profile vectors
	profileVectors := make(map[string][]float64)
	
	for _, pid := range profileIDs {
		var vector []float64
		err := database.GetPool().QueryRow(ctx, `
			SELECT vector_json FROM identity_vectors WHERE profile_id = $1
		`, pid).Scan(&vector)
		
		if err != nil {
			continue
		}
		profileVectors[pid] = vector
	}

	// For each profile, find top matches
	profileMatches := make(map[string][]Match)
	for pid := range profileVectors {
		matches, err := FindMatches(ctx, pid, category, 5, nil)
		if err != nil {
			continue
		}
		profileMatches[pid] = matches
	}

	// Calculate harmony score based on color coordination
	harmonyScore := calculateHarmonyScore(profileVectors, profileMatches)

	return map[string]interface{}{
		"profileIds":    profileIDs,
		"occasion":      occasion,
		"harmonyScore":  harmonyScore,
		"recommendations": profileMatches,
	}, nil
}

// FindSimilarProducts finds products similar to a given product
func FindSimilarProducts(ctx context.Context, productID string, limit int) ([]Match, error) {
	// Get the product vector
	var sourceVector []float64
	err := database.GetPool().QueryRow(ctx, `
		SELECT vector_json FROM product_vectors WHERE global_product_id = $1
	`, productID).Scan(&sourceVector)

	if err != nil {
		return nil, fmt.Errorf("product not found: %w", err)
	}

	// Find similar products
	rows, err := database.GetPool().Query(ctx, `
		SELECT global_product_id, vector_json, base_price
		FROM vendor_offers
		WHERE global_product_id != $1 AND status = 'active' AND stock_quantity > 0
	`, productID)
	
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matches []Match
	for rows.Next() {
		var pid string
		var vector []float64
		var price float64
		
		if err := rows.Scan(&pid, &vector, &price); err != nil {
			continue
		}
		
		similarity := cosineSimilarity(sourceVector, vector)
		
		matches = append(matches, Match{
			ProductID:  pid,
			MatchScore: similarity,
			Price:      price,
		})
	}

	// Sort by similarity
	sort.Slice(matches, func(i, j int) bool {
		return matches[i].MatchScore > matches[j].MatchScore
	})

	if len(matches) > limit {
		matches = matches[:limit]
	}

	return matches, nil
}

// cosineSimilarity calculates cosine similarity between two vectors
func cosineSimilarity(a, b []float64) float64 {
	if len(a) != len(b) {
		return 0
	}

	var dotProduct, normA, normB float64
	
	for i := 0; i < len(a); i++ {
		dotProduct += a[i] * b[i]
		normA += a[i] * a[i]
		normB += b[i] * b[i]
	}

	if normA == 0 || normB == 0 {
		return 0
	}

	return dotProduct / (math.Sqrt(normA) * math.Sqrt(normB))
}

// calculateHarmonyScore calculates color harmony for group outfits
func calculateHarmonyScore(vectors map[string][]float64, matches map[string][]Match) float64 {
	// Simplified: just check if we have matches for all profiles
	if len(matches) == 0 {
		return 0
	}

	// In production: use color theory algorithms
	return 0.85 // Placeholder
}
