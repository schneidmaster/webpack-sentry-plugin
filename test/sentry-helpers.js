import request from 'request-promise'
import dotenv from 'dotenv'

dotenv.load()

export const {
	SENTRY_API_KEY,
	SENTRY_ORGANISATION,
	SENTRY_PROJECT
} = process.env
export const RELEASE_VERSION = 'test-release'

const SENTRY_URL = `https://sentry.io/api/0/projects/${SENTRY_ORGANISATION}/${SENTRY_PROJECT}`

export function cleanUpRelease() {
	return request({
		url: `${SENTRY_URL}/releases/${RELEASE_VERSION}/`,
		method: 'DELETE',
		auth: {
			bearer: SENTRY_API_KEY
		},
		resolveWithFullResponse: true
	})
	.catch((err) => {
		console.error(`ERROR CLEANING UP RELEASE!
Status: ${err.statusCode}
Error: ${err.error}`
		)
		return err
	})
}

export function fetchRelease(version) {
	return request({
		url: `${SENTRY_URL}/releases/${version}/`,
		auth: {
			bearer: SENTRY_API_KEY
		},
		json: true,
		resolveWithFullResponse: true
	})
	.then(({ body }) => body)
}