'use strict';

const Alexa = require('ask-sdk');
// use 'ask-sdk' if standard SDK module is installed

const constants = require('./constants');

// use https to make the call to the rock api for the verse of the day.
var https = require('https');

// Amazaon date parser for handling dates returned by Alexa
var AmazonDateParser = require('amazon-date-parser');

const Rock = require('./Rock');

let skill;

/**
 * General handler used to handle all requests to the Lambda endpoint.  
 * @param  {object} event   data provided by the event source.  In our case, the
 *                          Alexa Skills request data.
 * @param  {object} context Data specifc to the AWS Lambda environment.
 * @return {Promise<ResponseEnvelope>}        A promise which resolves with a request envelope.
 */
exports.handler = function (event, context) {

  console.log(`REQUEST++++${JSON.stringify(event)}`);
  if (!skill) {

    /**
     * Instantiate the alexa skill.  Any request handler
     * must be added here otherwise the Error handler will be called.
     * @type {Object} Alexa standard Skill builder.
     */
    skill = Alexa.SkillBuilders.standard()
      .addRequestHandlers(
        LaunchRequestHandler,
        VerseOfTheDayIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        ExitHandler
      )
      .addErrorHandlers(ErrorHandler)
      .create();
  }
  
  return skill.invoke(event,context);

}

/**
 * Launch request handler, used to handle any request that does not include a specific intent.  
 * 
 * @type {LaunchRequestHandler}
 * 
 * @method canHandle is used to determine if this Request handle can be used to respond to a specific request.
 * Should simply return a bool value.  If true, the objects handle method will be called.
 * 
 * @method handle is called if canHandle returns true.  Must return either a respons object or, a promise which
 * should resolve with a response object. Documentation for using the response builder can be found her: https://ask-sdk-for-nodejs.readthedocs.io/en/latest/Response-Building.html
 * documentation for json response format can be found here: https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html
 * 
 */
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {

        const speechText = `Welcome to ${constants.churchInfo.name}! If you need help, just ask.`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(constants.churchInfo.name, speechText)
            .getResponse();
    }
};

/**
 * VerseOfTheDayIntentHandler: handler, used to handle any request containing a 
 * VerseOfTheDayIntent.  
 * 
 * @type {Object}
 * 
 * @method canHandle is used to determine if this Request handle can be used to respond to a specific request.
 * Should simply return a bool value.  If true, the objects handle method will be called.
 * 
 * @method handle is called if canHandle returns true.  Must return either a response object or, a promise which
 * should resolve with a response object. 
 * 
 * Documentation for using the response builder can be found here: 
 * https://ask-sdk-for-nodejs.readthedocs.io/en/latest/Response-Building.html
 * Documentation for json response format can be found here: 
 * https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html
 */
const VerseOfTheDayIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'VerseOfTheDayIntent';
    },
    async handle(handlerInput) {

        let speechText = '';
        let displayText = '';
        let vData = null;
        let verseDate = new Date();
        let requestOpts = {
          baseURL:constants.churchInfo.baseUrl,
          authToken: constants.churchInfo.authToken,
          urlParams:{
            "LoadAttributes":"true"
          }
        };

        let verseRequest = Rock.ContentChannel.init(requestOpts)
          .filterByDate(verseDate)
          .filterByMonth(verseDate)
          .filterByYear(verseDate)
          .filterByChannelId(constants.contentChannels.vod);

        let rData = await verseRequest.send().catch(err => console.log(err));

        /** 
         * If no data is returned, pull a random default verse of the day from the constants file.  This
         * way we're guaranteed to receive at least one verse of the day.
         * @param  {Array} rData The returned data.
         */
        if(!rData.length){
          vData = constants.verseOfTheDayContent[Math.floor(Math.random()*constants.verseOfTheDayContent.length)]
        }else{
          vData = rData[0];
        }

        
        /**
          * Build the response.
          */
        if('Introduction' in vData.AttributeValues){
            if(vData.AttributeValues.Introduction.Value.length > 1){
                speechText += vData.AttributeValues.Introduction.Value + '<break time="1s"/>';
                displayText += vData.AttributeValues.Introduction.Value;
            }
        }

        speechText += vData.Content;
        displayText += vData.Content;

        if('Verse' in vData.AttributeValues){
            speechText += ' ' + vData.AttributeValues.Verse.Value + '<break time="1s"/>';
            displayText += ' ' + vData.AttributeValues.Verse.Value;
        }

        if('Conclusion' in vData.AttributeValues){
            speechText += ' ' + vData.AttributeValues.Conclusion.Value;
            displayText += ' ' + vData.AttributeValues.Conclusion.Value;
        }

        return handlerInput.responseBuilder
                .speak(speechText)
                .withSimpleCard('Verse Of The Day: ', displayText)
                .getResponse();
    }
}

/**
 * HelpIntentHandler: handler, used to handle any request containing a 
 * HelpIntent.  
 * 
 * @type {Object}
 * 
 * @method canHandle is used to determine if this Request handle can be used to respond to a specific request.
 * Should simply return a bool value.  If true, the objects handle method will be called.
 * 
 * @method handle is called if canHandle returns true.  Must return either a response object or, a promise which
 * should resolve with a response object.  See documentation notes below. 
 * 
 * Documentation for using the response builder can be found here: 
 * https://ask-sdk-for-nodejs.readthedocs.io/en/latest/Response-Building.html
 * Documentation for json response format can be found here: 
 * https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html
 */
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
      
        const speechText = 'You can ask me for the verse of the day';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(constants.churchInfo.name, speechText)
            .getResponse();
    }
};

/**
 * CancelAndStopIntentHandler: handler, used to handle any request containing a 
 * Cancel or Stop intent.  This is different than an Audio Intent stop request.  
 * 
 * @type {Object}
 * 
 * @method canHandle is used to determine if this Request handle can be used to respond to a specific request.
 * Should simply return a bool value.  If true, the objects handle method will be called.
 * 
 * @method handle is called if canHandle returns true.  Must return either a response object or, a promise which
 * should resolve with a response object.  See documentation notes below. 
 * 
 * Documentation for using the response builder can be found here: 
 * https://ask-sdk-for-nodejs.readthedocs.io/en/latest/Response-Building.html
 * Documentation for json response format can be found here: 
 * https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html
 */
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard(constants.churchInfo.name, speechText)
            .getResponse();
    }
};


/**
 * ExitHandler: handler will be fired for Amazon Exit, Stop or Cancel intent requests.
 * These are different from requests received during audio playback.
 * 
 * @type {Object}
 * 
 * @method canHandle is used to determine if this Request handle can be used to respond to a specific request.
 * Should simply return a bool value.  If true, the objects handle method will be called.
 * 
 * @method handle is called if canHandle returns true.  Must return either a response object or, a promise which
 * should resolve with a response object.  See documentation notes below. 
 * 
 */
const ExitHandler = {
  async canHandle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);
    const request = handlerInput.requestEnvelope.request;


    return !playbackInfo.inPlaybackSession &&
      request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.StopIntent' ||
        request.intent.name === 'AMAZON.CancelIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Goodbye!')
      .getResponse();
  },
};

/**
 * SystemExceptionHandler: Handler will be fired any time an Exception is received from 
 * Alexa skills.
 * 
 * @type {Object}
 * 
 * @method canHandle is used to determine if this Request handle can be used to respond to a specific request.
 * Should simply return a bool value.  If true, the objects handle method will be called.
 * 
 * @method handle is called if canHandle returns true.  Must return either a response object or, a promise which
 * should resolve with a response object.  See documentation notes below. 
 * 
 */
const SystemExceptionHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'System.ExceptionEncountered';
  },
  handle(handlerInput) {
    console.log(`System exception encountered: ${handlerInput.requestEnvelope.request.reason}`);
    const speechText = 'I\'m sorry, but im having a little trouble handling this request.  Please try again.';
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(constants.churchInfo.name, speechText)
      .getResponse();
  },
};

/**
 * SessionEndedRequestHandler: Handler will be fired any time a Session end request is
 * Received.
 * 
 * @type {Object}
 * 
 * @method canHandle is used to determine if this Request handle can be used to respond to a specific request.
 * Should simply return a bool value.  If true, the objects handle method will be called.
 * 
 * @method handle is called if canHandle returns true.  Must return either a response object or, a promise which
 * should resolve with a response object.  See documentation notes below. 
 * 
 */
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    console.log('Session ended', handlerInput.requestEnvelope);
    return handlerInput.responseBuilder.getResponse();
  },
};

/**
 * ErroHandler handles any request that
 * results in an error, or can't be handled by another
 * one of the above requests.
 * 
 * @type {Object}
 */
const ErrorHandler = {
    canHandle() {
      return true;
    },
    handle(handlerInput, error) {
      console.log('Error handled: ', error);

      return handlerInput.responseBuilder
        .speak('Sorry, I can\'t understand the command. Please say again.')
        .reprompt('Sorry, I can\'t understand the command. Please say again.')
        .getResponse();
    },
};