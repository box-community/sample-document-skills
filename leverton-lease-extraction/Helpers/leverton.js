
const axios = require('axios');
const request = require('request');
const moment = require('moment');

const COLLECTIONS_API = "https://platform.leverton.ai/api/1/collections";
const DOCUMENTS_API = "https://platform.leverton.ai/api/1/documents";
const FILES_API = "https://platform.leverton.ai/api/1/files";
const ATTRIBUTES_API = "https://platform.leverton.ai/api/1/attributes"

const EXTRACTING = 2;
const EXTRACTED = 0;
const WAIT_PERIOD = 20000;

const METADATA_TARGETS = [
  "RenterName", "RenteeName", "RentalStreet", "RentalStreetNumber",
  "RentalCity", "RentalZip", "RentalCountry", "UDMBaseRentMonthlyAmount",
  "UDMBaseRentAnnualAmount", "UDMPaymentScheduleUS", "UDMLatePaymentFee",
  "UDMInterestOnLatePaymentFixed", "RenewalBeneficiary", "RenewalDuration",
  "RenewalTimes", "UDMPurposeUsageUS", "SubleaseGenerally", "UDMAssignmentGenerally",
  "UDMBaseRentEffectiveFrom", "UDMBaseRentEffectiveUntil",
  "ContractStart", "ContractDurationMain", "UDMAssignment"
];

// async timeout function
const timeout = (ms) => new Promise(res => setTimeout(res, ms))

class Leverton {

  constructor() {
    this.headers = { 'Authorization': `Basic ${process.env.LEVERTON_AUTH_TOKEN}` };
  }

  /**
   * Create a new Leverton 'collection'
   * @return {Object} - new collection objecet
   */
  async createCollection() {
    const body = {
      documentType: { id: 1 },
      language: "en_US",
      project: { id: process.env.LEVERTON_PROJECT_ID },
      name: "temp-collection",
      parent: { id: process.env.DEFAULT_COLLECTION_ID },
      structedElement: false
    }

    // call to create new collection
    const newCollection = await axios.post(COLLECTIONS_API, body, {headers: this.headers});

    return newCollection.data
  }

  /**
   * Create a new Leverton 'document'
   * @param {Object} collectionId - ID of parent collection
   * @return {Object} - new document object
   */
  async createDocument(collectionId) {
    const body = {
      language: "en_US",
      documentType: { id: 15 },
      collection: { id: collectionId },
      name: "temp-document"
    }

    // call to create new document
    const newDocument = await axios.post(DOCUMENTS_API, body, {headers: this.headers});

    return newDocument.data
  }

  /**
   * Upload document to leverton
   * @param {Object} documentID - ID of document to upload to
   * @return {Object} - uploaded file response
   */
  async uploadFileToLeverton(documentId, base64EncodedFile) {
    var decodedFile = new Buffer(base64EncodedFile, 'base64');

    const options = {
      method: 'POST',
      url: FILES_API,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' ,
        'Authorization': `Basic ${process.env.LEVERTON_AUTH_TOKEN}`
      },
      formData: {
        file: {
          value: decodedFile,
          options: { filename: 'temp-file.pdf' }
        },
        documentId: documentId,
        autoDocumentClassification: 'false'
      }
    };

    // send POST request to upload file to leverton
    return new Promise((resolve, reject) => {
      let r = request(options, function(error, response, body) {
        if (error) {
          reject(error)
        }
        resolve(JSON.parse(body))
      });
    });
  }

  /**
   * Check status and wait in increments of 20s for document extraction processing
   * to complete
   * @param {Object} documentID - ID of document
   * @param {Object} context - lambda context
   */
  async waitForDocumentExtraction(documentId, context) {
    let status = await this.getDocumentStatus(documentId)
    let retry = 0;
    let lambdaTimeLeft = context.getRemainingTimeInMillis();
    console.log("status: " + status);

    // wait until extraction finished or until < 25s left in lambda
    while(status == EXTRACTING && lambdaTimeLeft > 25000) {
      retry++;
      await timeout(WAIT_PERIOD)

      status = await this.getDocumentStatus(documentId)
      lambdaTimeLeft = context.getRemainingTimeInMillis();
      console.log('extraction wait retry number ' + retry + ". " + lambdaTimeLeft / 1000 + " seconds left in lambda");
    }

    // if less than 25s left, throw max time exceeded error
    if(lambdaTimeLeft <= 25000) {
      throw new Error('max lambda time exceeded')
    }
  }

  /**
   * Helper function to check the document status
   * @param {Object} documentID - ID of document to upload to
   * @return {Object} - extraction status of the document
   */
  async getDocumentStatus(documentId) {
    // call to get document status
    const newDocument = await axios.get(`${DOCUMENTS_API}?id=${documentId}`, {headers: this.headers});
    return newDocument.data.data.docStatus
  }

  /**
   * Fetch all extracted document attributes
   * @param {Object} documentID - ID of collection
   * @return {Object} - object containing all extracted document attributes
   */
  async getDocumentAttributes(collectionId) {
    const attributes = await axios.get(`${ATTRIBUTES_API}?collectionId=${collectionId}`, {headers: this.headers});
    return attributes.data
  }

  /**
   * Process all data returned by leverton extraction, reduce to only desired
   * metadata targets
   * @param {Object} levertonMetadata - all data returned from leverton extraction
   * @return {Object} - target leverton metadata
   */
  processJSON(levertonMetadata) {
    let metadata = {};
    let newObj;

    levertonMetadata.forEach(function(item) {
      if(item.attributes) {
        newObj = returnAttributes(item.attributes)
        metadata = {...metadata, ...newObj}
      }
    });

    return metadata
  }
}

// build metadata object
function returnAttributes(attributes) {
  let obj = {};
  attributes.forEach(function(item) {
    // check
    if(!obj[item.attributeType.name] && item.attributeType && METADATA_TARGETS.includes(item.attributeType.name)) {
      let value = item.text || item.numericValue || item.date;

      // if date type, format date
      if(item.date) {
        value = moment(item.date).format('MM/DD/YYYY');
      }

      if(value) {
        obj[item.attributeType.name] = value;
      }

      // check if a value exists in the secondary 'possibleValue' section
      // either append possibleValue or set as
      if(item.possibleValue) {
        obj[item.attributeType.name] = obj[item.attributeType.name] ?
          (obj[item.attributeType.name] + " " + item.possibleValue.value) :
          item.possibleValue.value;
      }
    }

    // recursively process subitems
    if(item.attributes) {
      let subAttributes = returnAttributes(item.attributes)
      obj = {...obj, ...subAttributes}
    }

  });
  return obj
}

module.exports = Leverton;
