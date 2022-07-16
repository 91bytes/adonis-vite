import { Exception } from '@poppinss/utils'

export default class MissingEntryPointException extends Exception {
	constructor() {
		super('You must specify one or more entry points for vite', 500, 'E_MISSING_VITE_ENTRYPOINT')
	}
}
