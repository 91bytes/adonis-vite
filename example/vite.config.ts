import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	root: './resources/frontend/entrypoints',
	build: {
		manifest: true,
		rollupOptions: {
			input: './resources/frontend/entrypoints/app.tsx',
		},
		outDir: '../../../public',
		emptyOutDir: false,
	},
	preview: {
		strictPort: true,
	},
	optimizeDeps: {
		entries: [],
	},
	server: {
		origin: 'http://localhost:3000',
	},
	plugins: [react()],
})
