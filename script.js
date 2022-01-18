const CATEGORIES = [
  { name: 'clean', ponderationValue: 0.3 },
  { name: 'communication', ponderationValue: 0.2 },
  { name: 'noise', ponderationValue: 0.1575 },
  { name: 'social', ponderationValue: 0.0525 },
  { name: 'fairness', ponderationValue: 0.15 },
  { name: 'boundaries', ponderationValue: 0.14 }
];

const calculateScoreForCategory = (categoryName, categoryPonderation, firstUserCategories, secondUserCategories) => {
  return (1 - (Math.abs(firstUserCategories[categoryName] - secondUserCategories[categoryName]) / 6)) * categoryPonderation;
};

const getScoreBetweenTwoUsers = (firstUserCategories, secondUserCategories) => {
  let score = 0;
  CATEGORIES.forEach((category) => {
    const categoryName = category.name;
    const categoryPonderation = category.ponderationValue;

    score += calculateScoreForCategory(categoryName, categoryPonderation, firstUserCategories, secondUserCategories);
  });

  return score;
};

const getCategories = (record) => ({
  clean: record.getCellValue('Clean'),
  communication: record.getCellValue('Communication'),
  noise: record.getCellValue('Noise'),
  social: record.getCellValue('Social'),
  fairness: record.getCellValue('Fairness'),
  boundaries: record.getCellValue('Boundaries')
});

const getUserData = (record) => {
  const userData = {
    name: record.getCellValue('Name'),
    id: record.getCellValue('ID'),
    categories: getCategories(record)
  };
  return userData;
};

const tableUsers = base.getTable('Users');
const inputRecord = await input.recordAsync('', tableUsers).catch();
const inputUserData = getUserData(inputRecord);

const { records: totalRecords } = await tableUsers.selectRecordsAsync();
const filteredRecords = totalRecords.filter((record) => record.id !== inputUserData.id);
const potentialMatches = filteredRecords.map((record) => {
  const currentUserData = getUserData(record);
  const score = getScoreBetweenTwoUsers(inputUserData.categories, currentUserData.categories);

  return { ...currentUserData, score };
});

const sortedPotentialMatches = potentialMatches.sort((a, b) => {
  return ((b.score > a.score) ? 1 : ((a.score > b.score) ? -1 : 0));
});

const removeAttributes = sortedPotentialMatches.map(({ id }) => ({ id }));

await tableUsers.updateRecordAsync(inputRecord.id, {
  'Best Match': [removeAttributes[0]],
  RecordID2: [removeAttributes[1]],
  RecordID3: [removeAttributes[2]],
  RecordID4: [removeAttributes[3]],
  RecordID5: [removeAttributes[4]],
  RecordID6: [removeAttributes[5]]
});
