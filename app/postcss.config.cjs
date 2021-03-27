// const cssnano = require("cssnano");

// const mode = process.env.NODE_ENV;
// const dev = mode === "development";

// eslint-disable-next-line no-undef
module.exports = {
	plugins: {
		// Some plugins, like postcss-nested, need to run before Tailwind
	
		"@tailwindcss/jit": {},
		
		// But others, like autoprefixer, need to run after

		autoprefixer: {}
		
	}
};


// !dev && cssnano({
// 	preset: "default",
// }),
