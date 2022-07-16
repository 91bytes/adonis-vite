import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import adonisVite from '@91codes/adonis-vite/build/plugin/adonis-vite'

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
		origin: 'http://localhost:5173',
	},
	plugins: [react(), adonisVite()],
})
