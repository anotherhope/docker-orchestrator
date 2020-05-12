const fs 	= require("fs");
const YAML 	= require("yaml");

module.exports = class Parser {

	static loadFrom(path = null){

		if (!path || !fs.existsSync(path)){
			console.log('Error: no file to load');
			process.exit(1);
			return null;
		}

		try {
			return YAML.parse(fs.readFileSync(path, 'utf8'));
		} catch(e){
			console.log("Error: YAML file can't be parse");
			process.exit(2);
			return null;
		}
		
	}
}