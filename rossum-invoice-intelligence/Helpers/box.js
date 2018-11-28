
const fs = require('fs')
const TEMP_PATH = '/tmp/temp.pdf'

class Box {

  constructor(filesReader, skillsWriter) {
    this.filesReader = filesReader;
    this.skillsWriter = skillsWriter;
  }

  /**
   * Download Document from Box using the Skills Kit FilesReader class.
   */
  async downloadFileFromBox() {
    // get box file read stream and write to local temp file
    const readStream = await this.filesReader.getContentStream();
    const writeStream = fs.createWriteStream(TEMP_PATH);
    const stream = readStream.pipe(writeStream);

    // wait for stream write to 'finish'
    await new Promise((resolve, reject) => {
      stream.on('finish', function () {
          resolve()
        });
    });

    return TEMP_PATH;
  }

  /**
   * Attach skills metadata to file using the Skills Kit skillsWriter class.
   */
  async attachMetadataCard(rossumJson) {
 
    // Invoice information card
    const invoiceDetails = returnCard("Invoice Details", rossumJson,
      {
        "invoice_id": "Invoice Number",
        "customer_id": "Customer Number",
        "date_issue": "Issue Date",
        "date_due": "Due Date",
        "terms": "Terms",
        "amount_total": "Total Amount",
        "amount_paid": "Amount Paid",
        "amount_due": "Amount Due",
        "sender_name": "Sender Name",
        "recipient_name": "Recipient Name",
        "tax_detail_total": "Tax Total",
        "order_id": "Order Number"
      }
    );

    const transcriptJSON = this.skillsWriter.createTranscriptsCard(invoiceDetails);
    this.skillsWriter.saveDataCards([transcriptJSON]);
  }
}

/**
 * Helper function to format Skills metadata card.
 * 
 * @param {Object} keywordTitle - title of box skill metadata card
 * @param {Object} rossumJson - all Rossum metadata
 * @param {Object} properties - target keywords
 */
function returnCard(keywordTitle, rossumJson, properties) {
  const entries = [];

  // push metadata to cardTemplate entries
  Object.keys(properties).forEach((key) => {
    if(rossumJson[key]) {
      entries.push({
        // type: "text",
        text: `${properties[key]}: ${rossumJson[key]}`
      });
    }
  });

  return entries;
}

module.exports = Box;
