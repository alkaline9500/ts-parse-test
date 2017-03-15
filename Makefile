test: greeter.js
	open index.html

greeter.js: greeter.ts tslint.json
	tsc greeter.ts
	tslint greeter.ts -c tslint.json
