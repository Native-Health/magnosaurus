const populate = (reference, getDb) => async (data, populateArr) => {
	if (!data)
		return data;
	let isObj = false;
	if (!Array.isArray(data)) {
		isObj = true;
		data = [data];
	}

	if (!populateArr)
		populateArr = Object.keys(reference);
	else {
		populateArr = populateArr.filter(key => reference[key])
	}

	const foundDocs = await Promise.all(populateArr.map(attr => {

		const arr = data.map(datum => datum[attr]).filter(x => x);
		return findDocs(getDb.getDb.bind(getDb), reference[attr].model, reference[attr].key, arr);
	}));

	populateArr.forEach((attr, ind) => {
		data.forEach(datum => {
			if (datum[attr])
				datum[attr] = findDocInArr(foundDocs[ind], reference[attr].key, datum[attr]);
		})
	});

	if (isObj)
		data = data[0];

	return data;
}

const findDocs = async function (getDb, modelName, key = "_id", arr) {
	const db = await getDb();
	return await db.collection(modelName).find({
		[key]: {
			$in: arr
		}
	}).toArray();
}

const findDocInArr = function (docsArr, key = "_id", value) {
	return docsArr.filter(doc => {
		if (doc[key])
			return doc[key].toString() === value.toString();
	})[0];
}

module.exports = populate;