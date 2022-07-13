import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import MissingEntryPointException from '../exceptions/MissingEntryPoint'

export default class ViteProvider {
	public static needsApplication = true

	constructor(protected app: ApplicationContract) {}

	public register() {
		// Register your own bindings
		this.app.container.singleton('AdonisJS/Vite', () => require('../managers/ViteAssetManager'))
	}

	public async boot() {
		// IoC container is ready
		const View = this.app.container.resolveBinding('Adonis/Core/View')
		const ViteAssetManager = (await import('../managers/ViteAssetManager')).default
		const assetManager = new ViteAssetManager(this.app)
		await assetManager.setup()

		View.registerTag({
			tagName: 'vite',
			seekable: true,
			block: false,
			compile(parser, buffer, token) {
				if (!token.properties.jsArg.trim()) {
					throw new MissingEntryPointException()
				}
				const parsed = parser.utils.transformAst(
					parser.utils.generateAST(token.properties.jsArg, token.loc, token.filename),
					token.filename,
					parser
				)
				const entrypoints =
					parsed.type === 'Literal'
						? [parsed.value]
						: parsed.elements.map((element) => element.value)

				buffer.outputRaw(assetManager.getMarkup(entrypoints))
			},
		})

		View.registerTag({
			tagName: 'viteReactRefresh',
			seekable: true,
			block: false,
			compile(_parser, buffer) {
				buffer.outputRaw(assetManager.getFastRefreshMarkup())
			},
		})
	}
}
