set shell := ["nu", "-c"]

# Run the application with hot reloading
dev:
	bun run dev; z ./otto/; bun rollup -c --watch

