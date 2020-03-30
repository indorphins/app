export default class Profile {
	constructor(name, type) {
		this._name = name;
		this._type = type;
	}

	get type() {
		return this._type.toUpperCase();
	}

	get name() {
		let final = '';
		this._name.split(' ').forEach(name => {
			let rest = ' ';
			if (name.length > 1) {
				rest = name.slice(1).toLowerCase() + ' ';
			}
			final += name[0].toUpperCase() + rest;
		});
		final = final.slice(0, final.length - 1);
		return final;
	}
}
