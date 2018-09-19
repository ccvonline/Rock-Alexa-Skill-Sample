'use strict';

const createRockSdkError = (eName, eMessage) => {

	let error = new Error(eMessage);

	error.name = 'RockSdk.' + eName + ' Error';

	return error;

}

exports.createRockSdkError = createRockSdkError;