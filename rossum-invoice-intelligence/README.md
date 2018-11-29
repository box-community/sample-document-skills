# Rossum Invoice Intelligence 

Use the [Rossum API](https://rossum.ai/) to automatically extract data from invoices and attach them to your files as metadata.

![Rossum Custom Skill](./sample_invoice.png)

## Usage

### Prerequisites

* Make sure to sign up for a [Rossum Developer](https://account.box.com/signup/n/developer#nql6m) account and obtain a Rossum API secret key.
* Make sure to sign up for a [Box Developer](https://developer.box.com/) account and prepare your app for Box skills. See our [developer documentation](https://developer.box.com/docs/box-skills) for more guidance. 

### Configuring Serverless for AWS

Our Box skills uses the excellent [Serverless framework](https://serverless.com/). This framework allows for deployment to various serverless platforms, but in this example we will use AWS as an example.

To use Serverless, install the NPM module.

```bash
npm install -g serverless
```

Then in order to give Serverless access to your AWS account, you'll need to create a new AWS IAM User with admin access. There is an excellent guide available on [serverless.com](https://serverless.com/framework/docs/providers/aws/guide/credentials/).

Next, you can configure the local Serverless install with your credentials:

```bash
serverless config credentials --provider aws --key YOUR_ACCESS_KEY_ID --secret YOUR_SECRET_ACCESS_KEY
```

### Deploying

Clone this repo and change into the Rossum folder.

```bash
git clone https://github.com/box-community/sample-document-skills
cd sample-document-skills/rossum-invoice-intelligence
```

Then change the `ROSSUM_SECRET_KEY` environment variable in your `serverless.yml` file to your Rossum API key.

```yaml
...

functions:
  index:
    ...
    environment:
      ROSSUM_SECRET_KEY: YOUR_ROSSUM_SECRET_KEY
```

Finally, deploy the Skill.

```bash
serverless deploy -v
```
