# Adonis Vite

AdonisJS ships with webpack encore to manage your frontend assets. This package provides a way to use Vite instead.

_Note: the API may change between minor versions until we reach 1.0._

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
npm install --save-dev vite
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
import adonis from '@91codes/adonis-vite/build/plugins/adonis'

export default defineConfig({
	plugins: [
		react({ jsxRuntime: 'classic' }),
		adonis({ input: 'resources/frontend/entrypoints/app.tsx' }),
	],
})
```

#### Add edge tags in layout

Add the `@vite` edge tag in your edge layout's head. You don't need `@viteReactRefresh` if you aren't using react.

```edge
@viteReactRefresh()
@vite('resources/frontend/entrypoints/app.tsx')
```

#### Add to .gitignore

```
public/hot
public/assets
public/manifest.json
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
