import { Plugin, ResolvedConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import { AddressInfo } from 'net'

export default function adonisVitePlugin(): Plugin {
	return {
		name: 'adonis-vite',
		configureServer(server) {
			const hotFile = path.join('public', 'hot')

			server.httpServer?.once('listening', () => {
				const address = server.httpServer?.address()
				const isAddressInfo = (x: string | AddressInfo | null | undefined): x is AddressInfo =>
					typeof x === 'object'
				if (isAddressInfo(address)) {
					const devServerUrl = resolveDevServerUrl(address, this.config)
					fs.writeFileSync(hotFile, devServerUrl)
				}
			})
			const clean = () => {
				if (fs.existsSync(hotFile)) {
					fs.rmSync(hotFile)
				}
			}
			process.on('exit', clean)
			process.on('SIGINT', process.exit)
			process.on('SIGTERM', process.exit)
			process.on('SIGHUP', process.exit)
		},
	}
}

/**
 * Resolve the dev server URL from the server address and configuration.
 */
function resolveDevServerUrl(address: AddressInfo, config: ResolvedConfig) {
	const configHmrProtocol =
		typeof config.server.hmr === 'object' ? config.server.hmr.protocol : null
	const clientProtocol = configHmrProtocol ? (configHmrProtocol === 'wss' ? 'https' : 'http') : null
	const serverProtocol = config.server.https ? 'https' : 'http'
	const protocol = clientProtocol ?? serverProtocol

	const configHmrHost = typeof config.server.hmr === 'object' ? config.server.hmr.host : null
	const configHost = typeof config.server.host === 'string' ? config.server.host : null
	const serverAddress = address.family === 'IPv6' ? `[${address.address}]` : address.address
	const host = configHmrHost ?? configHost ?? serverAddress

	return `${protocol}://${host}:${address.port}`
}
