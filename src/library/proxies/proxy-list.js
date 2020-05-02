class ProxyList {
	constructor(_list = []) {
		this.list = _list;
		this.currentProxy = '';
	}

	get list() {
		return this.list;
	}

	set list(_list) {
		this.list = _list;
	}

	add(proxy) {
		this.list.push(proxy);
	}

	rotate() {
		this.list.push(this.list.shift());
	}
}

let list = new ProxyList(
	[
		1, 
		2, 
		3, 
		4, 
		5
	]
);
console.log(list.list)
list.list = [0, 2, 4]
console.log(list.list)