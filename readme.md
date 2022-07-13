# Adonis Vite

AdonisJS ships with webpack encore to manage your frontend assets. This package provides a way to use Vite instead.

## Installation and usage

If you are creating a new project, choose **false** or **N** when you are asked if you want to configure webpack encore for compiling frontend assets.

If you are integrating this package in an existing project, you can remove webpack.config.js and any webpack related packages you may have in your project's dependencies.

#### Install using your package manager:

```sh
npm install --save @91codes/adonis-vite
# or
yarn add @91codes/adonis-vite
```

#### Please note that you need to install Vite separately.

```sh
npm inistall --save-dev vite
# or
yarn add -D vite
```

#### Add the Vite provider to `.adonisrc.json`

```sh
node ace configure @91codes/adonis-vite
```

#### Create a `vite.config.ts`

You can start with the following. Feel free to customise it to your needs. You don't need react plugin if you aren't using react.

```ts
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
```

#### Add edge tags in layout

Add the `@vite` edge tag in your edge layout's head. You don't need `@viteReactRefresh` if you are using react.

```edge
@viteReactRefresh()
@vite('app.tsx')
```

Add the following scripts in package.json:

```json
{
	"scripts": {
		"vite:dev": "npm run vite",
		"vite:build": "npm run vite build"
	}
}
```

Run these along with the default `dev` and `build` scripts.
