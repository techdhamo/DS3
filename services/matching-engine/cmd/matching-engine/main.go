package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/ds3/matching-engine/internal/api"
	"github.com/ds3/matching-engine/internal/database"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	// Load configuration
	config, err := loadConfig()
	if err != nil {
		log.Fatalf("Configuration error: %v", err)
	}

	// Initialize database
	if err := database.Init(config.DatabaseURL); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

	// Setup Gin router
	if config.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(corsMiddleware())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "matching-engine",
			"version": "1.0.0",
		})
	})

	// Metrics
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// API routes
	api.RegisterRoutes(router)

	// Start server
	srv := &http.Server{
		Addr:         ":" + config.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	log.Printf("Matching Engine running on port %s", config.Port)

	// Wait for shutdown signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}

func corsMiddleware() gin.HandlerFunc {
	allowedOriginsEnv := getEnv("ALLOWED_ORIGINS", "")
	allowedOrigins := map[string]bool{}
	if allowedOriginsEnv != "" {
		for _, o := range strings.Split(allowedOriginsEnv, ",") {
			if trimmed := strings.TrimSpace(o); trimmed != "" {
				allowedOrigins[trimmed] = true
			}
		}
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" && allowedOrigins[origin] {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			c.Writer.Header().Set("Vary", "Origin")
		} else if origin != "" {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func loadConfig() (*Config, error) {
	cfg := &Config{
		DatabaseURL: os.Getenv("DATABASE_URL"),
		Port:        getEnv("PORT", "8082"),
		Environment: getEnv("ENVIRONMENT", "development"),
	}
	if cfg.DatabaseURL == "" && cfg.Environment != "development" {
		return nil, fmt.Errorf("DATABASE_URL is required in %s environment", cfg.Environment)
	}
	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

type Config struct {
	DatabaseURL string
	Port        string
	Environment string
}
