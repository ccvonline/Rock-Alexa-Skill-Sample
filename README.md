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

You should now have a fully configured Lambda function with the appropriate permissions for communicating with the Alexa Skills kit.   Next
we need to upload our code and test our skill.

## Step 3) Upload the code package to your lambda Function.
- Download or clone the Verse Of The Day Sample code package at https://github.com/ccvonline/Rock-Alexa-Skill-Sample
- run npm install from a command prompt in windows or the terminal on a mac.
- Open the constants.js file in the code editor of your choice.
- Replace churchInfo.baseURL and churchInfo.authToken with the data specific to your rock installation.
- Save the file and create a Zip file containing index.js, constants.js, package.json, package-lock.json the Rock folder and the node_modules folder.
- From the Lambda management page, make sure your Lambda function configuration window is selected.  You can do this by clicking the box which shows your function name in the designer block.
- Scroll down to the function code section.  
- From the code entry type dropdown, select Upload a .zip file.
- Click the upload button and select the Archive.zip file from the code sample code package.
- Click the Save button in the upper right hand corner.

## Step 4) Test your Lambda function.
- At the top of the screen select configure test events from the Select a test event drop down.
- Give the test event a name.  
- Open the test/verseOfTheDayIntentRequest.js file from the code package.  Copy the contents of this file and paste it into the code window of the Configure Test Event dialog.
- Click the Save button.
- Click the Test button. 
- You should get a Succeeded excecution result along with the functions output.  The output should look something like the following:
```
{
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "SSML",
      "ssml": "<speak>Today's verse comes from the first book of Timothy.<break time=\"1s\"/>But godliness with contentment is great gain. For we brought nothing into the world, and we can take nothing out of it. 1 Timothy 6:6-7<break time=\"1s\"/></speak>"
    },
    "card": {
      "type": "Simple",
      "title": "Verse Of The Day: ",
      "content": "Today's verse comes from the first book of Timothy.But godliness with contentment is great gain. For we brought nothing into the world, and we can take nothing out of it. 1 Timothy 6:6-7 "
    }
  },
  "userAgent": "ask-node/2.0.9 Node/v8.10.0",
  "sessionAttributes": {}
}
```

Once you have succesfully tested your function you are ready to test your skill.  In order to do so, you need
to enter your Lambda functions ARN as the skills endpoint.  See below for instructions. 


## Step 5) Test your Alexa SKill.
- From your Lamdba function console, the arn can be located in the upper right hand corner. Copy the arn string.
- Navigate to your Skill in the Alexa Skill Console.  
- From the build page, select the Endpoint Tab on the right. 
- Paste the arn into the Default Region field.  
- Click the save endpoints button at the top of the screen. We are now ready to test.
- Click the test tab at the top of the screen.  
- Toggle the test is enabled for this skill button in order to activate the testing interface.
- You can either type or speak your commands to test. In the Alexa Simulator, type the following
  in the provided field: "Open sample verse of the day".  You can replace "sample verse of the day" with the invocation phrase you chose earlier in the process.
- You should get a response of "Welcome to {Your Church Name}!  If you need help, just ask."  You will aslo see the request sent by the Alexa Skills Kit under JSON Input and the response returned by your Lambda function under JSON output.  This can be incredibly helpful for troubleshooting purposes.
- Now type "Get the verse of the day".  Alexa should respond with the verse of the day.
- You can also type or say "Get the verse of the Day from sample verse of the day" where "sample verse of the day" is your skills invocation phrase.

Congratulations...You now have a functioning Verse of the Day Alexa Skill.  In order to make your skill available to the general public, simply fill out all of the requested information under the Distribution tab of the Alexa Skills console for your skill.  You can find complete documentation on this here: https://developer.amazon.com/docs/devconsole/launch-your-skill.html.  Once complete you must complete a certification process and submit your skill for review.  Documentation for completing the certifitation process can be found here: https://developer.amazon.com/docs/devconsole/launch-your-skill.html
