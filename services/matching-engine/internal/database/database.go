package database

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

var pool *pgxpool.Pool

func Init(databaseURL string) error {
	if databaseURL == "" {
		databaseURL = "postgresql://ds3:password@localhost:5432/ds3_identity"
	}

	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return fmt.Errorf("unable to parse database URL: %w", err)
	}

	config.MaxConns = 20
	config.MinConns = 5

	pool, err = pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return fmt.Errorf("unable to create connection pool: %w", err)
	}

	// Test connection
	if err := pool.Ping(context.Background()); err != nil {
		return fmt.Errorf("unable to ping database: %w", err)
	}

	return nil
}

func Close() {
	if pool != nil {
		pool.Close()
	}
}

func GetPool() *pgxpool.Pool {
	return pool
}
