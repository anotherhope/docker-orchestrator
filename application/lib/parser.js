const fs 	= require("fs");
const YAML 	= require("yaml");

module.exports = class Parser {

	static loadFrom(path = null){

		if (!path || !fs.existsSync(path)){
			return null;
		}

		try {
			return YAML.parse(fs.readFileSync(process.env.DOCKER_COMPOSE, 'utf8'));
		} catch(e){
			return null;
		}
		
	}
}