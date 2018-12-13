# Rental Lease Extraction with Leverton

This example uses the [Leverton](https://www.leverton.ai/) data extraction platform and the [Box Skills Kit](https://github.com/box/box-skills-kit-nodejs) to extract valuable information from rental lease agreements.

![screenshot](./screenshots/sample-lease-extraction.png)

### Getting started with Leverton

Obtain a Leverton access token, root project ID, and default collection ID and populate these variables
in your local .env file.

## Usage

### Prerequisites

* Leverton does not currently have a publicly available API. You must reach out to Leverton in order to create a Leverton account and gain access to their API.
* Make sure to sign up for a [Box Developer](https://developer.box.com/) account and prepare your app for Box skills. See our [developer documentation](https://developer.box.com/docs/box-skills) for more guidance.

### Configuring Serverless

Our Box skills uses the excellent [Serverless framework](https://serverless.com/). This framework allows for deployment to various serverless platforms, but in this example we will use AWS as an example.

To use Serverless, install the NPM module.

```bash
npm install -g serverless
```

Next, follow our guide on [configuring Serverless for AWS](../AWS_CONFIGURATION.md), or any of the guides on [serverless.com](https://serverless.com/) to allow deploying to your favorite serverless provider.

### Deploying

Clone this repo and move into the Leverton folder.

```bash
git clone https://github.com/box-community/sample-document-skills
cd sample-document-skills/leverton-lease-extraction
```

Then update the environment variables `serverless.yml` with the appropriate IDs / keys from Leverton

```yaml
...

functions:
  index:
    ...
    environment:
      LEVERTON_AUTH_TOKEN: <your-leverton-auth-token>
      LEVERTON_PROJECT_ID: <your-project-id>
      DEFAULT_COLLECTION_ID: <your-default-collection-id>
```

Finally, deploy the Skill.

```bash
serverless deploy -v
```

*note: this custom skill takes around 2-5 minutes to process after lease document upload
