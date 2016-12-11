import fs from 'fs'
import path from 'path'
import webpack from 'webpack'

import SentryWebpackPlugin from '../index'

import {
	cleanUpRelease,
	fetchRelease,
	SENTRY_API_KEY,
	SENTRY_ORGANISATION,
	SENTRY_PROJECT,
	RELEASE_VERSION
} from './sentry-helpers'

const OUTPUT_PATH = path.resolve(__dirname, '../.tmp')

function ensureOutputPath() {
	if (!fs.existsSync(OUTPUT_PATH)) fs.mkdirSync(OUTPUT_PATH)
}

function createWebpackConfig(sentryConfig) {
	return {
		devtool: 'source-map',
		entry: path.resolve(__dirname, 'fixtures/index.js'),
		output: {
			path: OUTPUT_PATH,
			filename: 'sentry-test.bundle.js'
		},
		plugins: [
			configureSentryPlugin(sentryConfig)
		]
	}
}

function configureSentryPlugin(config) {
	const options = Object.assign({}, config, {
		organisation: SENTRY_ORGANISATION,
		project: SENTRY_PROJECT,
		apiKey: SENTRY_API_KEY
	})

	return new SentryWebpackPlugin(options)
}

function runWebpack(config) {
	return new Promise((resolve, reject) => {
		webpack(config, (err, stats) => {
			if (stats.toJson().errors.length)
				reject({ errors: stats.toJson().errors })
			else
				resolve({ config, stats })
		})
	})
}

function expectNoCompileError({ errors }) {
	return expect(errors).toBeUndefined();
}

/*
 * Work around Jest not having expect.fail()
 */
function expectFailure(msg) {
	return () => {
		throw new Error(msg)
	}
}

beforeEach(ensureOutputPath)
afterEach(cleanUpRelease)

it('creates Sentry release', () => {
	const release = RELEASE_VERSION

	return runWebpack(createWebpackConfig({ release }))
		.then(expectNoCompileError)
		.then(() => {
			return fetchRelease(release)
				.then(({ version }) => {
					expect(version).toEqual(release)
				})
				.catch(expectFailure('Release not found'))
		})
})

it('uploads files to Sentry release')