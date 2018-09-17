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

- Log into your Amazon Developer account at https://developer.amazon.com/alexa.  Click the sign in button in the upper right hand corner.  If you don't arleady have an account simply follow the instructions to create one for free.

- After you log in, hover your mouse over "Your Alexa Consoles" text at the top of the screen and click the Skills Link.

- Once in the Alexa Skills console, select Create Skill near the top right of the list of the Alexa Skills.

- Enter a name for your skill. This name is displayed in the Alexa Skills Store. Here you can also change the default language if desired.  Make sure Custom is selected for the skill model.  Once you have finished click the "Create Skill" button in the upper right hand corner.

- On the Choose A Template page, select "Start From Scratch" and then click the Choose button in the upper right hand corner.

- Set up the Invocation name for your Skill.
   
	- Click on Invocation in the Custom skill menu on the left hand side.
	- Enter a Skill Invocation Name in the provided field.  This is what users will say to 
	activate your skill.
	- Click the Save Model button at the top of the screen.

- Set up the Interaction model for your Skill.  Interactions are the basis for all Alexa Skills.  They tell Alexa that specific responses are available based on the users request.

	- Click the Add Button next to Intents in the Custom Skill builder menu.
	- Give your custom intent a Name.  This name will be sent as part of the JSON request when the Lambda function is envoked. A good practice is to end the name with the word Intent. For our example this will be VerseOfTheDayIntent.  
	- Enter the Sample uterances that users will say when invoking your intent. Once you have typed a phrase or question, click the add symbol to the right of the entry box.  You can enter as many utterances as you would like.
	- Once you have entered all of your utterances, click the Build Model button at the top.  NOTE:  Any time you add an intent or utterance you must re-build your model before the changes will be available to the user.