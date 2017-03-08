test: greeter.js
	open index.html

greeter.js: greeter.ts
	tsc greeter.ts
