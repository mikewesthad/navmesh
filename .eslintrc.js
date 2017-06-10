module.exports = {
	// Enable core eslint rules, see: http://eslint.org/docs/rules/
	extends: "eslint:recommended",
	// Additional rules
	rules: {
		"brace-style": ["warn", "1tbs"],
		"indent": ["warn", 4, {"SwitchCase": 1}],
		"max-len": ["warn", 100, {"ignoreUrls": true}],
		"no-mixed-spaces-and-tabs": "warn",
		"no-console": "off"
	},
	env: {
		browser: true,
		commonjs: true,
		es6: true
	},
	parserOptions: {
		sourceType: "module"
	},
	globals: {
		Phaser: true
	}
}