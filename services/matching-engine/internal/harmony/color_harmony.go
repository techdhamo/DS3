package harmony

import (
	"math"
)

// Color represents an RGB color
type Color struct {
	R, G, B float64
}

// HSL represents a color in Hue, Saturation, Lightness
type HSL struct {
	H, S, L float64
}

// RGBToHSL converts RGB to HSL color space
func RGBToHSL(r, g, b float64) HSL {
	r /= 255.0
	g /= 255.0
	b /= 255.0

	max := math.Max(math.Max(r, g), b)
	min := math.Min(math.Min(r, g), b)
	l := (max + min) / 2.0

	var h, s float64

	if max == min {
		h = 0 // achromatic
		s = 0
	} else {
		d := max - min
		s = l > 0.5 ? d / (2.0 - max - min) : d / (max + min)

		switch max {
		case r:
			h = (g - b) / d
			if g < b {
				h += 6.0
			}
		case g:
			h = (b - r) / d + 2.0
		case b:
			h = (r - g) / d + 4.0
		}
		h /= 6.0
	}

	return HSL{H: h * 360, S: s * 100, L: l * 100}
}

// HSLToRGB converts HSL to RGB color space
func HSLToRGB(h, s, l float64) Color {
	h /= 360.0
	s /= 100.0
	l /= 100.0

	var r, g, b float64

	if s == 0 {
		r, g, b = l, l, l // achromatic
	} else {
		var hue2rgb func(p, q, t float64) float64
		hue2rgb = func(p, q, t float64) float64 {
			if t < 0 {
				t += 1.0
			}
			if t > 1 {
				t -= 1.0
			}
			if t < 1.0/6.0 {
				return p + (q-p)*6.0*t
			}
			if t < 1.0/2.0 {
				return q
			}
			if t < 2.0/3.0 {
				return p + (q-p)*(2.0/3.0-t)*6.0
			}
			return p
		}

		var q float64
		if l < 0.5 {
			q = l * (1.0 + s)
		} else {
			q = l + s - l*s
		}
		p := 2.0*l - q

		r = hue2rgb(p, q, h+1.0/3.0)
		g = hue2rgb(p, q, h)
		b = hue2rgb(p, q, h-1.0/3.0)
	}

	return Color{R: r * 255, G: g * 255, B: b * 255}
}

// CalculateColorHarmony calculates harmony score between two colors
func CalculateColorHarmony(color1, color2 Color) float64 {
	hsl1 := RGBToHSL(color1.R, color1.G, color1.B)
	hsl2 := RGBToHSL(color2.R, color2.G, color2.B)

	// Hue difference (normalized to 0-1)
	hueDiff := math.Abs(hsl1.H - hsl2.H)
	if hueDiff > 180 {
		hueDiff = 360 - hueDiff
	}
	hueDiff = hueDiff / 180.0

	// Saturation difference
	satDiff := math.Abs(hsl1.S - hsl2.S) / 100.0

	// Lightness difference
	lightDiff := math.Abs(hsl1.L - hsl2.L) / 100.0

	// Calculate harmony based on color theory
	// Complementary (hue diff ~180), Analogous (hue diff ~30), Triadic (hue diff ~120)
	harmony := 0.0
	switch {
	case hueDiff > 0.85: // Complementary
		harmony = 0.9
	case hueDiff > 0.65 && hueDiff < 0.75: // Triadic
		harmony = 0.85
	case hueDiff > 0.15 && hueDiff < 0.25: // Analogous
		harmony = 0.8
	case hueDiff < 0.05: // Monochromatic
		harmony = 0.7
	default:
		harmony = 0.5
	}

	// Penalize saturation and lightness differences
	harmony -= satDiff * 0.3
	harmony -= lightDiff * 0.2

	// Ensure score is between 0 and 1
	if harmony < 0 {
		harmony = 0
	}
	if harmony > 1 {
		harmony = 1
	}

	return harmony
}

// DetermineUndertone determines if a color is warm or cool undertone
func DetermineUndertone(color Color) string {
	hsl := RGBToHSL(color.R, color.G, color.B)

	// Warm undertones: yellow, orange, red (0-60 and 300-360 degrees)
	// Cool undertones: blue, purple, green (60-300 degrees)
	if (hsl.H >= 0 && hsl.H <= 60) || (hsl.H >= 300 && hsl.H <= 360) {
		return "warm"
	}
	return "cool"
}

// GeneratePalette generates a harmonious color palette from a base color
func GeneratePalette(baseColor Color, count int) []Color {
	hsl := RGBToHSL(baseColor.R, baseColor.G, baseColor.B)

	palette := make([]Color, count)
	palette[0] = baseColor

	// Generate analogous colors (shift hue by small amounts)
	for i := 1; i < count; i++ {
		hueShift := float64(i) * 30.0 // 30 degree shifts
		newHue := hsl.H + hueShift
		if newHue > 360 {
			newHue -= 360
		}
		palette[i] = HSLToRGB(newHue, hsl.S, hsl.L)
	}

	return palette
}

// CalculateGroupHarmony calculates overall harmony score for a group of colors
func CalculateGroupHarmony(colors []Color) float64 {
	if len(colors) < 2 {
		return 1.0
	}

	totalHarmony := 0.0
	pairs := 0

	for i := 0; i < len(colors); i++ {
		for j := i + 1; j < len(colors); j++ {
			harmony := CalculateColorHarmony(colors[i], colors[j])
			totalHarmony += harmony
			pairs++
		}
	}

	return totalHarmony / float64(pairs)
}
