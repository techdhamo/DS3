package harmony

import (
	"math"
)

// ProfileOutfit represents a profile's outfit colors
type ProfileOutfit struct {
	ProfileID    string
	PrimaryColor Color
	SecondaryColor Color
	Undertone   string
}

// GroupMatchResult represents the matching result for a group
type GroupMatchResult struct {
	GroupID      string
	Profiles     []ProfileOutfit
	HarmonyScore float64
	UndertoneMatch string
	Recommendations []string
}

// CalculateGroupMatch calculates outfit harmony for a group of profiles
func CalculateGroupMatch(profiles []ProfileOutfit) GroupMatchResult {
	if len(profiles) == 0 {
		return GroupMatchResult{}
	}

	// Collect all colors
	colors := make([]Color, 0, len(profiles)*2)
	undertones := make(map[string]int)

	for _, profile := range profiles {
		colors = append(colors, profile.PrimaryColor)
		colors = append(colors, profile.SecondaryColor)
		undertones[profile.Undertone]++
	}

	// Calculate overall harmony
	harmonyScore := CalculateGroupHarmony(colors)

	// Determine undertone match
	undertoneMatch := determineUndertoneMatch(undertones, len(profiles))

	// Generate recommendations
	recommendations := generateRecommendations(profiles, harmonyScore, undertoneMatch)

	return GroupMatchResult{
		Profiles:      profiles,
		HarmonyScore:  harmonyScore,
		UndertoneMatch: undertoneMatch,
		Recommendations: recommendations,
	}
}

// determineUndertoneMatch determines if the group has matching undertones
func determineUndertoneMatch(undertones map[string]int, profileCount int) string {
	warmCount := undertones["warm"]
	coolCount := undertones["cool"]

	if warmCount == profileCount {
		return "all_warm"
	}
	if coolCount == profileCount {
		return "all_cool"
	}
	if warmCount > coolCount*2 {
		return "predominantly_warm"
	}
	if coolCount > warmCount*2 {
		return "predominantly_cool"
	}
	return "mixed"
}

// generateRecommendations generates outfit recommendations based on harmony score
func generateRecommendations(profiles []ProfileOutfit, harmonyScore float64, undertoneMatch string) []string {
	recommendations := []string{}

	if harmonyScore < 0.5 {
		recommendations = append(recommendations, "Consider using a unified color palette")
		recommendations = append(recommendations, "Try analogous or complementary color schemes")
	} else if harmonyScore < 0.7 {
		recommendations = append(recommendations, "Good harmony, but could be improved")
		recommendations = append(recommendations, "Consider adjusting saturation levels")
	} else {
		recommendations = append(recommendations, "Excellent color harmony")
	}

	switch undertoneMatch {
	case "all_warm":
		recommendations = append(recommendations, "All profiles have warm undertones - great cohesion")
	case "all_cool":
		recommendations = append(recommendations, "All profiles have cool undertones - great cohesion")
	case "mixed":
		recommendations = append(recommendations, "Mixed undertones - consider neutral accessories")
	case "predominantly_warm":
		recommendations = append(recommendations, "Predominantly warm undertones - cool profiles can use warm accents")
	case "predominantly_cool":
		recommendations = append(recommendations, "Predominantly cool undertones - warm profiles can use cool accents")
	}

	return recommendations
}

// OptimizeGroupOutfit optimizes outfit colors for better group harmony
func OptimizeGroupOutfit(profiles []ProfileOutfit, targetHarmony float64) []ProfileOutfit {
	optimized := make([]ProfileOutfit, len(profiles))
	copy(optimized, profiles)

	// If harmony is below target, adjust colors
	currentHarmony := CalculateGroupMatch(profiles).HarmonyScore

	if currentHarmony < targetHarmony {
		// Generate a unified palette
		baseColor := profiles[0].PrimaryColor
		palette := GeneratePalette(baseColor, len(profiles))

		for i := range optimized {
			// Adjust primary color towards palette
			optimized[i].PrimaryColor = blendColors(optimized[i].PrimaryColor, palette[i], 0.5)
		}
	}

	return optimized
}

// blendColors blends two colors with a given ratio (0-1)
func blendColors(c1, c2 Color, ratio float64) Color {
	return Color{
		R: c1.R*(1-ratio) + c2.R*ratio,
		G: c1.G*(1-ratio) + c2.G*ratio,
		B: c1.B*(1-ratio) + c2.B*ratio,
	}
}

// CalculateColorDistance calculates Euclidean distance between two colors
func CalculateColorDistance(c1, c2 Color) float64 {
	dr := c1.R - c2.R
	dg := c1.G - c2.G
	db := c1.B - c2.B

	return math.Sqrt(dr*dr + dg*dg + db*db)
}
