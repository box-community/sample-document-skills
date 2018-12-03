
const Box = require('./Helpers/box.js')
const Rossum = require('./Helpers/rossum.js');
const { FilesReader, SkillsWriter, SkillsErrorEnum } = require('./skills-kit-lib/skills-kit-2.0');

/**
 * This is the main function that the Lambda will call when invoked.
 */
exports.handler = async (triggeredEvent, context, callback) => {
  const { body } = triggeredEvent;
  const filesReader = new FilesReader(body);
  const skillsWriter = new SkillsWriter(filesReader.getFileContext());

  if (isValidEvent(triggeredEvent)) {
    skillsWriter.saveProcessingCard();
    await processEvent(filesReader, skillsWriter, callback);
  } else {
    await skillsWriter.saveErrorCard(SkillsErrorEnum.INVALID_EVENT);
    callback(null, { statusCode: 200, body: 'Event received but invalid' });
  }
};

function isValidEvent(triggeredEvent) {
  return triggeredEvent.body
};

async function processEvent(filesReader, skillsWriter, finalCallback) {
  const box = new Box(filesReader, skillsWriter);

  try {  
    const tempFilePath = await box.downloadFileFromBox();
    const rossumMetadata = await sendToRossum(tempFilePath)

    await box.attachMetadataCard(rossumMetadata); // process Rossum json object and attach Box Skills card as metadata
    console.log('Successfully attached Skills metadata to Box file');

    finalCallback(null, { statusCode: 200, body: 'It was a resounding success.' });
      
  } catch (error) {
      skillsWriter.saveErrorCard(SkillsErrorEnum.UNKNOWN);
      finalCallback(null, { statusCode: 200, body: 'Unknown error occurred somewhere along the line.' });
  }
}

async function sendToRossum(filePath) {
  const rossum = new Rossum();

  const uploadedFile = await rossum.uploadFiletoRossum(filePath);
  const invoiceId = uploadedFile.id;
  console.log('Successfully uploaded to Rossum');

  await rossum.waitForDocumentExtraction(invoiceId);
  console.log('Rossum data extraction complete');

  const fields = await rossum.getDocumentFields(invoiceId);
  console.log('Fetched Rossum data');

  return rossum.processJSON(fields);
}