<img src="images/box-dev-logo-clip.png" 
alt= “box-dev-logo” 
style="margin-left:-10px;"
width=40%;>
# This repository has been archived due to our current work to update all Box Skills sample code. We will be releasing updated examples soon.

## Box Skills Samples: Custom Skills for Processing Documents 

This repository contains community created Box Skills samples for processing **document files** on Box. By clicking on each sub-folder, you can see a demo image of the end product, as it would look in your Box File Preview.

* [Leverton Rental Lease Extraction](leverton-lease-extraction) - Uses the [Leverton](https://www.leverton.ai/) API to automatically extract fields address, landlord, tenant, rent, etc, from rental leases and attach them to the respective files as Skills Metadata Cards.

* [Rossum invoice intelligence](rossum-invoice-intelligence) - Uses the [Rossum](https://rossum.ai/) API to automatically extract fields like amount, tax details, invoice ID, sender name and receiver name from invoices and attach them to the respective files as Skills Metadata Cards.

## What are Box Skills?

Box Skills are web applications configured with Box Platform that performs custom processing for files uploaded to Box. Typically they link to a machine learning service that does the processing for the files. Your choice of machine learning service, in-house or external, would depend on your business case or that of your customers on Box. However, the audio, video, image and document sample Skills repositories in Box Community can provide some guidance or inspiration on what you can built upon or deployed as-is.

Visit the [Official Box Skills Developer Documentation](https://developer.box.com/docs/box-skills) for complete information on Box Skills, the kind of Skill Metadata Cards that you can create to show on Box Preview, as well as instructions on configuring your Skill with Box.

## What is the Box Skills Kit?

The [Github Repository for Box Skills Kit Library](https://github.com/box/box-skills-kit-nodejs) is our official toolkit for writing custom Box Skills in Node.js. It minimizes the client side code to Box Files and Skills-Invocations APIs to a few lines and provides other utility functions to make developing your code very simple. It has the [Skills-kit Library and API Documentation](https://github.com/box/box-skills-kit-nodejs/tree/master/skills-kit-library)  and Boilerplate Skills that you can quickly deploy and expand on, when developing a new Skill.

## What file formats are supported by Box Skills?

The file formats supported by your skill depend on the files supported by Box and by the selected machine learning service.

Box supports [the following document formats](https://community.box.com/t5/How-to-Guides-for-Managing/File-Types-and-Fonts-Supported-in-Box-Content-Preview/ta-p/327#Type_TextBased) for direct previewing using Box Preview. The various machine learning providers often support a different set of file formats completely.

You can expand the effective set of file formats supported by your machine learning provider by using [Box's BasicFormat](https://github.com/box/box-skills-kit-nodejs/tree/master/skills-kit-library#basic-format) functionality in the Skills Kit. This automatically converts some file formats to more commonly used formats for you to use in your skill.

## How do I deploy a Box Skill?

In developing your custom Box Skill, you would need to deploy it somewhere. Have a look at our [Quick Start Deployment Instructions](https://github.com/box/box-skills-kit-nodejs/tree/master/boilerplate-skills) to learn how to deploy the boilerplate Skills to any of your preferred cloud server providers or on your own server environment. Additionally, each of the sample Skills in this repository may give extra or alternative deployment instructions, that you can use.

## Contributors

* [Matt Mitchell](https://github.com/mattmitchell6), Box
* [Phil Mayer](https://github.com/PhilMayer), Box

## License

This project is licensed under the [Apache 2.0 License](LICENSE)
