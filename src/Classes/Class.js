export default class Class {
	constructor(url, instructor) {
		this._url = url;
		this._instructor = instructor;
		this._participants = [];
		this._id = url;
	}

	get id() {
		return this._id;
	}

	set id(id) {
		this._id = id;
	}

	get url() {
		return this._url;
	}

	set url(url) {
		this._url = url;
	}

	get instructor() {
		return this._instructor;
	}

	set instructor(instructor) {
		this._instructor = instructor;
	}

	get participants() {
		return this._participants;
	}

	set participants(participants) {
		this._participants = participants;
	}

	addParticipant(p) {
		this.participants.push(p);
	}

	removeParticipant(p) {
		// Note this gets the first participant with identifier p, others with same p will remain
		const index = this.participants.indexOf(p);
		if (index === -1) {
			// invalid participant id
			return;
		}
		this.participants = this.participants.splice(index, 1);
	}
}
