import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { resolveConfig, Manifest, ResolvedConfig } from 'vite'

export default class AssetManager {
	private manifest: Manifest
	private config: ResolvedConfig
	private devServerUrl: string | undefined

	constructor(private app: ApplicationContract) {}

	public async setup() {
		await this.readViteConfig()
		await this.readManifest()
		if (this.isDevServerRunning()) {
			this.devServerUrl = await readFile(this.app.publicPath('hot'), 'utf-8')
		}
	}

	/**
	 * Generates HTML to include appropriate JS, CSS.
	 * It uses the built files from manifest in production, links to vite dev server otherwise.
	 * All built files which aren't entry points are preloaded using <link rel="prefetch">
	 *
	 * @param entrypoints Vite entry points, for ex. app.ts
	 * @returns Raw HTML
	 */
	public getMarkup(entrypoints: string[]) {
		if (this.isDevServerRunning()) {
			return ['@vite/client', ...entrypoints]
				.map((entrypoint) => this.entryTag(`${this.devServerUrl}/${entrypoint}`))
				.join('\n')
		}
		let markup = entrypoints.map((entrypoint) => this.prodEntrypointMarkup(entrypoint)).join('\n')
		markup += this.prefetchMarkup()
		return markup
	}

	private isDevServerRunning() {
		return existsSync(this.app.publicPath('hot'))
	}

	private async readViteConfig() {
		const command = this.app.env.get('NODE_ENV', 'development') === 'production' ? 'build' : 'serve'
		this.config = await resolveConfig({}, command)
	}

	public getFastRefreshMarkup() {
		if (!this.isDevServerRunning()) {
			return ''
		}
		return `<script type="module">
		import RefreshRuntime from '${this.devServerUrl}/@react-refresh'
		RefreshRuntime.injectIntoGlobalHook(window)
		window.$RefreshReg$ = () => {}
		window.$RefreshSig$ = () => (type) => type
		window.__vite_plugin_react_preamble_installed__ = true
	</script>`
	}

	private prodEntrypointMarkup(entrypoint: string) {
		const fileName = '/' + this.manifest[entrypoint].file

		if (fileName.endsWith('.css')) {
			return this.entryTag(fileName)
		}
		let markup = this.entryTag(fileName)
		this.manifest[entrypoint].css?.forEach((cssFileName) => {
			markup += this.entryTag(cssFileName)
		})
		return markup
	}

	private prefetchMarkup() {
		const nonEntryKeys = Object.keys(this.manifest).filter(
			(fileName) => !this.manifest[fileName].isEntry
		)
		const assets = Array.from(
			new Set(
				Object.values(this.manifest)
					.map((chunk) => chunk.assets ?? [])
					.flat()
			)
		)
		const nonEntryCssFiles = Array.from(
			new Set(nonEntryKeys.map((fileName) => this.manifest[fileName].css ?? []).flat())
		)
		return nonEntryKeys
			.map((fileKey) => this.prefetchTag(this.manifest[fileKey].file, 'script'))
			.concat(
				nonEntryCssFiles.map((fileKey) => this.prefetchTag(this.manifest[fileKey].file, 'style'))
			)
			.concat(
				// TODO: provide image vs font hints
				assets.map((path) => this.prefetchTag(path))
			)
			.join('\n')
	}

	private async readManifest(): Promise<void> {
		const manifestFileName =
			typeof this.config.build.manifest === 'string' ? this.config.build.manifest : 'manifest.json'
		if (!existsSync(this.app.publicPath(manifestFileName))) return

		const manifestText = await readFile(this.app.publicPath(manifestFileName), 'utf-8')
		this.manifest = JSON.parse(manifestText)
	}

	private entryTag(path: string) {
		if (path.endsWith('.css')) {
			return `<link rel="stylesheet" href="${path}">`
		}
		return `<script type="module" src="${path}"></script>`
	}

	private prefetchTag(path: string, as?: HTMLLinkElement['as']) {
		return `<link rel="prefetch" href="${path}"${as ? ` as="${as}"` : ''}>`
	}
}
