export default class Profile {
	constructor(
		firstName,
		lastName,
		type,
		id = 1,
		email = 'dummy@email.me',
		phone = '420-666-6969'
	) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.type = type;
		this.id = id;
		this.email = email;
		this.phone = phone;
	}
}
