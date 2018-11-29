# Configure Serverless for AWS


Then in order to give Serverless access to your AWS account, you'll need to create a new AWS IAM User with admin access. There is an excellent guide available on [serverless.com](https://serverless.com/framework/docs/providers/aws/guide/credentials/), but here is a simple recap.

* Create or log in to your Amazon Web Services account	  
* Create or log in to your Amazon Web Services account
* Go to the Identity & Access Management (IAM) page	  
* Go to the Identity & Access Management (IAM) page
* Click on Users and then Add user.	  
* Click on Users and then Add user.
* Enter a name in the first field to remind you this User is Serverless, like serverless-admin.	  
* Enter a name in the first field to remind you this User is Serverless, like serverless-admin.
* Enable Programmatic access by clicking the checkbox.	  
* Enable Programmatic access by clicking the checkbox.
* Click Next to go through to the Permissions page.	  
* Click Next to go through to the Permissions page.
* Click on Attach existing policies directly.	  
* Click on Attach existing policies directly.
* Search for, and select AdministratorAccess then click Next: Review.	  
* Search for, and select AdministratorAccess then click Next: Review.
* Check everything looks good and click Create user.	  
* Check everything looks good and click Create user.
* View and copy the API Key & Secret to a temporary place. You'll need it in the next step.	  
* View and copy the API Key & Secret to a temporary place. You'll need it in the next step.

Next, you can configure the local Serverless install with your credentials:

```bash
serverless config credentials --provider aws --key YOUR_ACCESS_KEY_ID --secret YOUR_SECRET_ACCESS_KEY
```
