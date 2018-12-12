// Import FilesReader and SkillsWriter classes from skills-kit-2.0.js library
const { FilesReader, SkillsWriter, SkillsErrorEnum } = require('skills-kit-lib/skills-kit-2.0');
require('dotenv').config()

const Leverton = require('./Helpers/leverton.js')

let skillsWriter;

/**
 * This is the main function that the Lamba will call when invoked.
 */
module.exports.handler = async (event, context, callback) => {
  console.log('Box event received');

  try {
    processSkill(event, context);
  } catch(error) {
    console.error('Skill processing failed');
  } finally {
    callback(null, { statusCode: 200 });
  }
};

async function processSkill(event, context) {

  try {
    const filesReader = new FilesReader(event.body);
    const fileId = filesReader.getFileContext().fileId;
    skillsWriter = new SkillsWriter(filesReader.getFileContext());

    await skillsWriter.saveProcessingCard();
    const base64File = await filesReader.getContentBase64();

    const levertonMetadata = await sendToLeverton(base64File, context);

    // process leverton json obj and attach Box Skills card as metadata
    let cards = populateMetadataCards(levertonMetadata);

    await skillsWriter.saveDataCards(cards);
    console.log("Successfully attached skill metadata to Box file");
  } catch(error) {
    console.log("Error " + error);
    // await skillsWriter.saveErrorCard(SkillsErrorEnum.UNKNOWN);
  }
}

/**
 * This function handles the entire Leverton ML process. Including
 * creating new document, new collection, uploading doc to leverton,
 * waiting for metadata extraction, and isolating target metadata
 * @param {Object} filePath - local file path of doc to be uploaded to leverton
 * @return {Object} - extracted Leverton metadata
 */
async function sendToLeverton(base64File, context) {
  const leverton = new Leverton();

  // create new Leverton collection
  const newCollection = await leverton.createCollection();
  const collectionId = newCollection.data.id;

  // create new 'document'
  const newDocument = await leverton.createDocument(collectionId);
  const docId = newDocument.data.id;

  // upload file to Leverton
  console.log('Uploading File to Leverton');
  const uploadedFile = await leverton.uploadFileToLeverton(docId, base64File)
  console.log('Document successfully uploaded to Leverton');

  // wait for document extraction to complete
  await leverton.waitForDocumentExtraction(docId, context)
  console.log('Leverton data Extraction complete');

  // fetch document attributes
  const attributes = await leverton.getDocumentAttributes(collectionId)
  console.log("Fetched document attributes from Leverton");

  // process Leverton metadata attributes
  const metadata = leverton.processJSON(attributes.data)
  console.log(metadata);

  return metadata;
}

/**
 * Populate skills metadata cards
 * @param {Object} levertonMetadata - metadata object extracted/parsed from leverton
 * @return {Object} - box skills metadata cards
 */
function populateMetadataCards(levertonMetadata) {
  const cards = [];
  let tempCard = formatCardTopics(
    {
      RenterName: "Landlord",
      RenteeName: "Tenant",
      RentalStreet: "Street",
      RentalStreetNumber: "Street #",
      RentalCity: "City",
      RentalZip: "Zip Code",
      RentalCountry: "Country"
    },
    levertonMetadata)
  cards.push(skillsWriter.createTopicsCard(tempCard, null, "Property Information"));

  tempCard = formatCardTopics(
    {
      RenterName: "Landlord",
      RenteeName: "Tenant",
      RentalStreet: "Street",
      RentalStreetNumber: "Street #",
      RentalCity: "City",
      RentalZip: "Zip Code",
      RentalCountry: "Country"
    },
    levertonMetadata)
  cards.push(skillsWriter.createTopicsCard(tempCard, null, "Property Information"));

  tempCard = formatCardTopics(
    {
      UDMBaseRentMonthlyAmount: "Monthly Rent",
      UDMBaseRentAmount: "Annual Rent",
      UDMBaseRentAnnualAmount: "Annual Rent",
      UDMPaymentScheduleUS: "Payment Schedule",
      UDMPaymentSchedule: "Payment Schedule",
      UDMBaseRentFrequency: "Rent Frequency",
      UDMLatePaymentFee: "Late Payment Fee",
      UDMInterestOnLatePaymentFixed: "Late Payment Interest Rate",
      UDMBaseRentEffectiveFrom: "Rent Effective From",
      UDMBaseRentEffectiveUntil: "Rent Effective Until"
    },
    levertonMetadata)
  cards.push(skillsWriter.createTopicsCard(tempCard, null, "Payment Information"));

  tempCard = formatCardTopics(
    { UDMPurposeUsageUS: "Permitted Use"},
    levertonMetadata)
  cards.push(skillsWriter.createTopicsCard(tempCard, null, "Permitted Use"));

  tempCard = formatCardTopics(
    { SubleaseGenerally: "Subleasing", UDMSublease: "Subleasing"},
    levertonMetadata)
  cards.push(skillsWriter.createTopicsCard(tempCard, null, "Subleasing"));

  tempCard = formatCardTopics(
    { UDMAssignmentGenerally: "Assignment", UDMAssignment: "Assignment"},
    levertonMetadata)
  cards.push(skillsWriter.createTopicsCard(tempCard, null, "Assignment"));

  return cards;
}

/**
 * Format topics card info
 * @param {Object} properties - target metadata properties
 * @param {Object} levertonMetadata - metadata object extracted/parsed from leverton
 * @return {Object} - formatted card topics
 */
function formatCardTopics(properties, levertonMetadata) {
  let cardTopics = []

  Object.keys(properties).forEach((key) => {
    if(levertonMetadata[key]) {
      cardTopics.push({
        text: `${properties[key]}: ${levertonMetadata[key]}`
      });
    }
  });

  return cardTopics;
}
