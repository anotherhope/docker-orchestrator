const Parser 	= require(__dirname + "/lib/parser.js");

module.exports = class Runner {

	static deploy(path = null){
		let compose = Parser.loadFrom(path);

		console.log(compose);
	}
}