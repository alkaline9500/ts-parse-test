test: greeter.js
	open index.html

greeter.js: greeter.ts tslint.json
	tsc greeter.ts --noImplicitAny --noImplicitReturns --noImplicitThis --strictNullChecks --outFile /dev/null
	tslint greeter.ts -c tslint.json
	tsc greeter.ts --noImplicitAny --noImplicitReturns --noImplicitThis --strictNullChecks

fix: greeter.ts
	tslint greeter.ts -c tslint.json --fix
