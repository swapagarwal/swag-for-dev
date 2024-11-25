const { promisify } = require("util");
const { pipeline: pipeline_ } = require("stream");
const { createWriteStream } = require("fs");
const { mkdir, unlink } = require("fs").promises;
const path = require("path");
const { performance } = require("perf_hooks");
const Queue = require("p-queue").default;
const chalk = require("chalk");
const got = require("got").default.extend({
	timeout: 5000,
	retry: 0,
});

const pipeline = promisify(pipeline_);

const getTime = (start) => {
	const end = performance.now();
	const diff = end - start;
	let humanTime = `${diff.toFixed(2)}ms`;

	if (diff > 60000) {
		humanTime = `${(diff / 60000).toFixed(0)}m`;
	} else if (diff > 1000) {
		humanTime = `${(diff / 1000).toFixed(1)}s`;
	}

	return humanTime;
};

async function downloadSingleImage({ url, errors, outFile, retries = 3 }) {
	const start = performance.now();
	let attempt = 0;

	while (attempt < retries) {
		try {
			console.log(
				`${chalk.yellow("Downloading")} ${chalk.cyan(url)} to ${chalk.magenta(
					outFile
				)}`
			);
			await pipeline(got.stream({ url }), createWriteStream(outFile));
			const time = getTime(start);
			console.log(`${chalk.green("Downloaded")} ${chalk.cyan(url)} [${time}]`);
			return;
		} catch (error) {
			attempt++;
			const time = getTime(start);
			console.log(
				`${chalk.red("Failed downloading")} ${chalk.cyan(url)} [${time}]: ${
					error.message
				}`
			);
			errors.push(error);

			// Cleanup partial download if it exists
			try {
				await unlink(outFile);
			} catch (unlinkError) {
				console.error(`Error deleting file ${outFile}: ${unlinkError.message}`);
			}

			// If we reach the max retries, log an error
			if (attempt === retries) {
				console.log(
					`${chalk.red("Max retries reached for")} ${chalk.cyan(url)}.`
				);
			}
		}
	}
}

module.exports = async function (list, dest) {
	const queue = new Queue({ concurrency: 15 });
	const errors = [];

	await mkdir(dest, { recursive: true });

	for (const { url, file } of list) {
		queue.add(() =>
			downloadSingleImage({
				url,
				errors,
				outFile: path.join(dest, file),
				retries: 3,
			})
		);
	}

	await queue.onIdle();

	const totalErrors = errors.length;
	const errorText =
		totalErrors > 0 ? chalk.red(totalErrors) : chalk.green(totalErrors);
	const plural = totalErrors === 1 ? "" : "s";

	console.log(`Downloaded swag-images with ${errorText} error${plural}`);

	return (
		totalErrors === 0 ||
		!(
			!process.env.NETLIFY ||
			(process.env.NETLIFY && process.env.CONTEXT === "production")
		)
	);
};
