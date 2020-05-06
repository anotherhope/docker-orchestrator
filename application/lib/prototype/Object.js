Object.prototype[Symbol.iterator] = function(){
	let properties	= Object.keys(this);
	let count 		= 0;
	let isDone 		= false;
	let next 		= () => {
		if(count >= properties.length){
			isDone = true;
		}
		return { done: isDone, value: this[properties[count++]] };
	}; 	return { next };
}