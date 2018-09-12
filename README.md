# Rock-Alexa-Skill-Sample
A basic sample Alexa skill using data from a Rock RMS content channel

This tutorial will take you through the process of setting up a basic Verse of the Day Alexa skill driven by a Rock Channel.  We will be utilizing AWS resources to communicate with both the Alexa Skills api as well as Rock.  Your skill will be comprised of 3 primary components.

1) A Custom Alexa Skill
2) An AWS Lambda Function
3) A Rock Content channel.

## The basic communication model

The Alexa Skills Kit allows us to tap in to Amazon's powerful Natural Language processing engine, the same one that powers all Alexa enabled devices.  In essence we are allowing Alexa to process a users request and then responding to that request using our own data. 

When a user invokes our Alexa Skill a request is sent to an endpoint that we define containing structured data (JSON) pertaining to the details of the request.  All we have to do is return an appropriately formated response and Alexa will handle the rest.  Lets get started.

## Step 1) Create your custom Alexa Skill

1) Log into your Amazon Developer account at https://developer.amazon.com/alexa.  Click the sign in button in the upper right hand corner.  If you don't arleady have an account simply follow the instructions to create one for free.

2) After you log in, hover your mouse over "Your Alexa Consoles" text at the top of the screen and click the Skills Link.

3) Once in the Alexa Skills console, select Create Skill near the top right of the list of the Alexa Skills.

4) Enter a name for your skill. This name is displayed in the Alexa Skills Store. Here you can also change the default language if desired.  Make sure Custom is selected for the skill model.  Once you have finished click the "Create Skill" button in the upper right hand corner.

5) On the Choose A Template page, select "Start From Scratch" and then click the Choose button in the upper right hand corner.
