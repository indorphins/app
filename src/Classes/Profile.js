export default class Profile {
	constructor(name, type, id = 0) {
		this.name = name;
		this.type = type;
		this.id = id;
	}

	// get type() {
	// 	console.log('Profile getter for type called');
	// 	return this.type.toUpperCase();
	// }

	// set type(t) {
	// 	this.type = t;
	// }

	// get name() {
	// 	let final = '';
	// 	this.name.split(' ').forEach((name) => {
	// 		let rest = ' ';
	// 		if (name.length > 1) {
	// 			rest = name.slice(1).toLowerCase() + ' ';
	// 		}
	// 		final += name[0].toUpperCase() + rest;
	// 	});
	// 	final = final.slice(0, final.length - 1);
	// 	return final;
	// }

	// set name(n) {
	// 	this.name = n;
	// }
}
