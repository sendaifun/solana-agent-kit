const { src, dest } = require('gulp');

/**
 * Copies Node icons
 */
function copyIcons() {
	return src('src/nodes/**/*.svg')
		.pipe(dest('dist/nodes'));
}

exports.default = copyIcons;
exports['build:icons'] = copyIcons; 