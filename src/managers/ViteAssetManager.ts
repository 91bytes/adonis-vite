import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { PathLike } from 'fs'
import { readFile, access } from 'fs/promises'
import { resolveConfig, Manifest, ResolvedConfig } from 'vite'

async function fileExists(path: PathLike) {
	try {
		await access(path)
		return true
	} catch (_e) {
		return false
	}
}

export default class ViteAssetManager {
	private manifest: Manifest
	private config: ResolvedConfig
	private devServerUrl: string | undefined

	constructor(private app: ApplicationContract) {}

	/**
	 * Generates HTML to include appropriate JS, CSS.
	 * It uses the built files from manifest in production, links to vite dev server otherwise.
	 * All built files which aren't entry points are preloaded using <link rel="prefetch">
	 *
	 * @param entrypoints Vite entry points, for ex. app.ts
	 * @returns Raw HTML
	 */
	public async getMarkup(entrypoints: string | string[]) {
		await this.setup()
		const entrypointsList = ([] as string[]).concat(entrypoints)
		if (this.devServerUrl) {
			return ['@vite/client', ...entrypointsList]
				.map((entrypoint) => this.entryTag(`${this.devServerUrl}/${entrypoint}`))
				.join('\n')
		}
		let markup = entrypointsList
			.map((entrypoint) => this.prodEntrypointMarkup(entrypoint))
			.join('\n')
		markup += this.prefetchMarkup()
		return markup
	}

	private async setup() {
		if (!this.config) {
			await this.readViteConfig()
		}
		if (!this.manifest) {
			await this.readManifest()
		}
		if (!this.devServerUrl && (await this.isDevServerRunning())) {
			this.devServerUrl = await readFile(this.app.publicPath('hot'), 'utf-8')
		}
	}

	private isDevServerRunning() {
		return fileExists(this.app.publicPath('hot'))
	}

	private async readViteConfig() {
		const command = this.app.env.get('NODE_ENV', 'development') === 'production' ? 'build' : 'serve'
		this.config = await resolveConfig({}, command)
	}

	public async getFastRefreshMarkup() {
		await this.setup()
		if (!this.devServerUrl) {
			return ''
		}
		return `<script type="module">
		import RefreshRuntime from '${this.devServerUrl}/@react-refresh'
		window.RefreshRuntime = RefreshRuntime
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
			markup += this.entryTag('/' + cssFileName)
		})
		return markup
	}

	private prefetchMarkup() {
		const nonEntryKeys = Object.keys(this.manifest).filter(
			(fileName) => !this.manifest[fileName].isEntry
		)
		return nonEntryKeys
			.map((fileKey) => this.prefetchTag('/' + this.manifest[fileKey].file))
			.join('\n')
	}

	private async readManifest(): Promise<void> {
		const manifestFileName =
			typeof this.config.build.manifest === 'string' ? this.config.build.manifest : 'manifest.json'
		if (!(await fileExists(this.app.publicPath(manifestFileName)))) return

		const manifestText = await readFile(this.app.publicPath(manifestFileName), 'utf-8')
		this.manifest = JSON.parse(manifestText)
	}

	private entryTag(path: string) {
		if (path.endsWith('.css')) {
			return `<link rel="stylesheet" href="${path}">`
		}
		return `<script type="module" src="${path}"></script>`
	}

	private prefetchTag(path: string) {
		let as: HTMLLinkElement['as'] = 'image'
		if (path.endsWith('.js')) {
			as = 'script'
		}
		if (path.endsWith('.css')) {
			as = 'style'
		}
		return `<link rel="prefetch" href="${path}" as="${as}">`
	}
}
