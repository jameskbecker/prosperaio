interface String {
	capitalise(): string;
}

interface Object {
  contains(this:any, keyValuePair:any): boolean;
}

String.prototype.capitalise = function ():string {
	return this.substring(0, 1).toUpperCase() + this.substring(1);
};

Object.prototype.contains = function (this:any, keyValuePair:any):boolean {
	let key:any = Object.keys(keyValuePair)[0];
	if (this.hasOwnProperty(key) && this[key] === keyValuePair[key]) return true;
	else return false;
};