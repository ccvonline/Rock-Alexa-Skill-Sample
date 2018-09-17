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

## Step 2) Create your Lambda Function
- In order to complete this step, you will need 
- Go to http://aws.amazon.com and login to your AWS Console.  If you don't already have an account, click Create an AWS Account and follow the steps to create your account.
- Click Services in the main menu and select Lambda under the Compute Section.
- Make sure you have a region selected that will work with Skills Kit.  Currently, the regions avaiable to use for this are US East (N. Virginia), US West (Oregon),  Asia Pacific (Tokyo) and EU (Ireland).
- Click the Create function button near the top of your screen.
- Select Author From Scratch.
- Give the Function a Name.  For our purposes we will use verseOfTheDayAlexa.  
- Under Runtime, select Node.js 8.10.
- Under Roles select Create new role from template(s).
- Create a role name.  For our project we will use vodAlexaSkill.
- From the Policy Templates list, select Simple Microservice Permissions.
- Click the Create Function button.

Now we must configure the trigger that will be used to invoke our function.  In our case, this will be an Alexa Skill.  In order for the Alexa Skill we created in step one to have permission to invoke our function, we must configure at least one Alexa Skills Kit Trigger.  We will also be enabling skill ID verification.  This will ensure that our function can only be triggered by our skill and allow us to avoid having to do any kind of id verification in the code.

- In a new browser tab or window, Go back to the custom alexa skill we created in step 1.  You can get there by going to https://developer.amazon.com/alexa.  Click the Your Alexa Consoles link in the upper right and select Skills.  
- Locate your skill from the list and copy the Skill ID which is displayed right below the skill name.
- Back on the Lambda page, make sure you have the Configuration Tab selected and the Designer window fully extended.
- In the Triggers list on the left hand side of the designer window, select Alexa Skills Kit.
- In the Configure triggers box, make sure Skill ID verification is enabled. 
- In the Skill ID Box, enter the skill ID of the custom skill we created in step 1.
- Click the Add button on the bottom right of the Configure Triggers box and then click save on the upper right hand side of the page.