const ObjectId = require('mongoose').Types.ObjectId;

const checkObjectID = (ID) => {
	if (ObjectId.isValid(ID)) {
		if (new ObjectId(ID).toString() === ID) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

module.exports = {
	checkObjectID
}