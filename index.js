'use strict';

const Alexa = require('ask-sdk');
// use 'ask-sdk' if standard SDK module is installed

const constants = require('./constants');

// use https to make the call to the rock api for the verse of the day.
var https = require('https');

// Amazaon date parser for handling dates returned by Alexa
var AmazonDateParser = require('amazon-date-parser');

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
        YesHandler,
        NoHandler,
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
        let verseDate = null;
        let vData = null;
        let filterString = null;

        console.log('VersOfTheDayIntentHandler');

        /** If the user included any kind of date related request, ie.  "Get Yesterday", 
         * An amazon date value will be provided.  Otherwise, use todays date. 
         */
        if(handlerInput.requestEnvelope.request.intent.slots.for_date.hasOwnProperty('value')){
            verseDate = new Date(handlerInput.requestEnvelope.request.intent.slots.for_date.value);
        }else{
            verseDate = new Date();
        }

        filterString = getFilterString(249,verseDate,true);

        let endPoint = '/api/ContentChannelItems?$filter='+filterString+'&LoadAttributes=True';

        let rData = await doRockRequest(endPoint);

        /** 
         * If no data is returned, pull in all verse of the day content.  This
         * way we're guaranteed to receive at least one verse of the day.
         * @param  {Array} rData The returned data.
         */
        if(!rData.length){
            filterString = getFilterString(249,null,false,true);
            endPoint = '/api/ContentChannelItems?$filter='+
                filterString+
                '&LoadAttributes=True';
            rData = await doRockRequest(endPoint);
        }

        if(rData.length){
            rData.sort(dateSortDesc);
            let vData = rData[0];

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

        }else{
            speechText = 'I\'m sorry, but I couldn\'t find any information that matches your request';
        }

        return handlerInput.responseBuilder
                .speak(speechText)
                .withSimpleCard('Verse Of The Day: ', displayText)
                .getResponse()
                .reprompt();
    }
};

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
 * YesHandler: handler will be fired for Amazon Yes intent requests.
 * We are currently only using this for audio player intents.  
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
const YesHandler = {
  async canHandle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);
    const request = handlerInput.requestEnvelope.request;

    return !playbackInfo[playbackInfo.type].inPlaybackSession && request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent';
  },
  handle(handleInput) {
    return controller.play(handleInput);
  },
};

/**
 * NoHandler: handler will be fired for Amazon No intent requests.
 * We are currently only using this for audio player intents.  
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
const NoHandler = {
  async canHandle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);
    const request = handlerInput.requestEnvelope.request;

    return !playbackInfo[playbackInfo.type].inPlaybackSession && request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent';
  },
  async handle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);

    playbackInfo[playbackInfo.type].index = 0;
    playbackInfo[playbackInfo.type].offsetInMilliseconds = 0;
    playbackInfo[playbackInfo.type].playbackIndexChanged = true;
    playbackInfo[playbackInfo.type].hasPreviousPlaybackSession = false;

    return controller.play(handlerInput);
  },
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

/**
 * Helper functions
 * @todo move to separate file and namespace.
 */

/**
 * doRockRequest: Submit a request to the rock api.
 * 
 * @param  {String} endPoint The specific endpoint for the request.
 * @return {Promise} A promise that is resolved upon the request completing
 * succesfully.
 */
const doRockRequest = async (endPoint) => {

    endPoint = endPoint || '';

    return new Promise( (resolve, reject) =>{

        /**
         * Request options
         * @type {Object}
         */
        var options = { 
            host: 'rock.ccv.church', 
            port: '443', 
            path: endPoint, 
            method: 'GET', 
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization-Token': 'PsUKsQGcqVMOWI6N6M6gxgu7'
            } 
        };

        var req = https.request(options, (res) => {

            res.setEncoding('utf8');

            let returnData = "";
            let out = {};

            /**
             * The amount of data returned at once can be limited by the
             * server or the browser, so we need to make sure we
             * are getting all of the returned data.
             */
            res.on('data', chunk => {
                returnData = returnData + chunk;
            });

            res.on('end', () => {
                // we have now received the raw return data in the returnData variable.
                // We can see it in the log output via:
                // console.log(JSON.stringify(returnData))
                // we may need to parse through it to extract the needed data

                out = JSON.parse(returnData);              

                resolve(out);

            });

        });

        req.on('error', (e) => {
            console.error('REQUEST ERROR: ',e);
            reject(null);
        });

        req.end();

    });

}

/**
 * Retuns the stored persistend playback data using the 
 * Sdk's interface.  
 * 
 * @param  {HandlerInput} handlerInput the handler input provided by
 * the skill request.
 * 
 * @return {object} the returned data, if available.
 */
async function getPlaybackInfo(handlerInput) {
  const attributes = await handlerInput.attributesManager.getPersistentAttributes();
  return attributes.playbackInfo;
}

/**
 * Saves persistent data to AWS Dynamo db using
 * the Alexa Skills sdk.  
 * 
 * @param {HandlerInput object} handlerInput handlerInput the handler input provided by
 * the skill request.
 * 
 * @param {object} data: The data to be stored.
 */
async function setPlaybackInfo(handlerInput, data){
    let attributes = await handlerInput.attributesManager.getPersistentAttributes();
    attributes.playbackInfo = data;
    handlerInput.attributesManager.setPersistentAttributes(attributes);
    return handlerInput.attributesManager.savePersistentAttributes();
}

/**
 * canThrowCard functino used to determine if a change to 
 * a devices display is required.  Will return true if the
 * playback file has changed.
 * 
 * @param  {object HandlerInput} handlerInput The input provided to the handler
 * from the Amazon skill request.
 * 
 * @return {Bool} True if the playback file has changed, otherwise false.
 */
async function canThrowCard(handlerInput) {

  const {
    requestEnvelope,
    attributesManager
  } = handlerInput;

  const playbackInfo = await getPlaybackInfo(handlerInput);

  if (requestEnvelope.request.type === 'IntentRequest' && playbackInfo[playbackInfo.type].playbackIndexChanged) {
    playbackInfo[playbackInfo.type].playbackIndexChanged = false;
    return true;
  }

  return false;

}

/**
 * Controller object contains all of the logic to handle
 * all of the Audio Controller functions
 * 
 * @type {Object}
 */
const controller = {

  /**
   * Play function will play an audio file.  The audio
   * file to play will be extracted from the playback info 
   * object which can be returned from persistent data, or set manually
   * earlier in the request chain.
   * 
   * @param  {Object HandlerInput} handlerInput the input provided to the IntentHandler
   * by the Amazon Alexa skills request.
   * 
   * @return {Object} Response Builder - May also return a promise which
   * resolves to a valid Alexa Skill response object.
   */
  async play(handlerInput) {
    let speechText = '';
    let audioUrl = '';

    const {
      attributesManager,
      responseBuilder
    } = handlerInput;

    const playbackInfo = await getPlaybackInfo(handlerInput);

    let aDate = new Date(playbackInfo.forDate);

    //Update the rock data.  This is necessary to 
    //ensure that we are working with the correct type of 
    //data.  If the last request was a sermon audio request
    //and the session had not ended, that is the data that would
    //be returned if this does not take place.
    await updateRockData(playbackInfo.type, aDate);

    /**
     * Set the error message based on the type of request
     * @todo  - Set this data as rock data.
     */
    switch(playbackInfo.type){
      case 'tipOfTheWeek' :
        speechText = "We're sorry, but we couldn't find any tips of the week for this week.  Can I find something else for you?."
        break;
      case 'sermonAudio' : 
        speechText = "We're sorry, but we couldn't find any Sermon Audio for this week.  Can I find something else for you?"
        break;
      case 'thisWeekAtCCV':
        speechText = "We're sorry, but we couldn't find any scheduled items for this week.  Can I find something else for you?"
        break;
    }

    /**
     * If there are no valud audio files, end the request with 
     * an error message.                                               
     */
    if(!constants.audioData[playbackInfo.type].length){
      return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Christ\'s Church of the Valley', speechText)
      .reprompt()
      .getResponse();
    }

    const {
      offsetInMilliseconds,
      index
    } = playbackInfo[playbackInfo.type];

    /** 
     * Playbehavior determines how the skill should handle the
     * returned audio file.  
     *
     * @see https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html#play-params
     * 
     * @type {String}
     */
    const playBehavior = 'REPLACE_ALL';

    let podcast = null;

    /**
     * If the request was a Sermon Audio request and
     * a previous session was ended before the audio
     * use the last audio file.
     */
    if(
      playbackInfo.type == 'sermonAudio' && 
      playbackInfo[playbackInfo.type].hasPreviousPlaybackSession && 
      playbackInfo[playbackInfo.type].lastItem
    ){
      podcast = playbackInfo[playbackInfo.type].lastItem;
    }else{
      podcast = constants.audioData[playbackInfo.type][0];
    }

    /**
     * A token is required with any play request.  In this
     * case we simply used the Guid provided by rock, but
     * this value can be any string.
     */
    const token = podcast.Guid;

    /** 
     * For now, the offset will always be zero.
     * @type {Number}
     * @todo  look at possible storing rock
     * data in DyamoDb.  
     */
    let offset = 0;

    switch(playbackInfo.type){
      case 'tipOfTheWeek' :
        audioUrl = podcast.AttributeValues.WeeklyCoachTips.Value;
        offset = 0;
        break;
      case 'sermonAudio' : 
        audioUrl = podcast.AttributeValues.HostedAudioUrl.Value;
        offset = offsetInMilliseconds;
        break;
      case 'thisWeekAtCCV':
        audioUrl = podcast.AttributeValues.ThisWeekatCCV.Value;
        offset = 0;
        break;
    }

    /**
     * If the request is for this weeks schedule, return the 
     * audio file only if no text content is present.  If
     * text content is provided, return a response with this data.
     */
    if( (playbackInfo.type == 'thisWeekAtCCV') && (podcast.AttributeValues.ThisweekatCCVtext.Value.length > 2) ){
      speechText = podcast.AttributeValues.ThisweekatCCVtext.Value
      return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('This Week at Christ\'s Church of the Valley: ', speechText)
      .reprompt()
      .getResponse();
    }

    if(!audioUrl){
        speechText = "We're sorry, but there was a problem finding your requested data.  Please try again.";
        return handlerInput.responseBuilder
          .speak(speechText)
          .withSimpleCard("Chirst's Church of the Valley", speechText)
          .reprompt()
          .getResponse();
    }

    playbackInfo[playbackInfo.type].token = token;

    if(playbackInfo.type == 'tipOfTheWeek'){
      speechText = `This is the ${podcast.Title}`;
    }else{
      speechText = `This is ${podcast.Title}`;
    }

    /**
     * Response must contain the AudioPlayerPlay directive.  
     */
    responseBuilder
      .speak(speechText)
      .addAudioPlayerPlayDirective(playBehavior, audioUrl, token, offset, null)
      .reprompt();

    if (await canThrowCard(handlerInput)) {
      const cardTitle = `Playing ${podcast.Title}`;
      const cardContent = `${podcast.Content}`;
      responseBuilder.withSimpleCard(cardTitle, cardContent);
    }

    return responseBuilder.getResponse();

  },

  /**
   * Stops the audio player.  This is called with a stop or pause 
   * Audio Player request.  
   * 
   * @param  {Object} handlerInput the Handler Input data provided by
   * the alexa skills request.
   * 
   * @return {object} Response Object: a valid respons object or
   * a promise resolving with a response object.
   */
  stop(handlerInput) {
    return handlerInput.responseBuilder
      .addAudioPlayerStopDirective()
      .getResponse();
  },

  /**
   * PlayNext handles any next audio player intent requsts.
   * Currently, these are disabled.
   * 
   * @param  {Object} handlerInput the handler input data provided
   * by the amazon skills request.
   * 
   * @return {Object} ResponseObject: a valid response object or 
   * a promise which resolves to a response object.
   */
  async playNext(handlerInput) {

    console.log('PLAY NEXT');
    const {
      playbackInfo,
      playbackSetting,
    } = await handlerInput.attributesManager.getPersistentAttributes();

    const nextIndex = (playbackInfo[playbackInfo.type].index + 1) % constants.audioData[playbackInfo.type].length;

    if (nextIndex === 0 && !playbackSetting.loop) {
      return handlerInput.responseBuilder
        .speak('You have reached the end of the playlist')
        .addAudioPlayerStopDirective()
        .getResponse();
    }

    playbackInfo[playbackInfo.type].index = nextIndex;
    playbackInfo[playbackInfo.type].offsetInMilliseconds = 0;
    playbackInfo[playbackInfo.type].playbackIndexChanged = true;

    return this.play(handlerInput);

  },

  /**
   * PlayPrevious handles any previous audio player intent requsts.
   * Currently, these are disabled.
   * 
   * @param  {Object} handlerInput the handler input data provided
   * by the amazon skills request.
   * 
   * @return {Object} ResponseObject: a valid response object or 
   * a promise which resolves to a response object.
   */
  async playPrevious(handlerInput) {
    const {
      playbackInfo,
      playbackSetting,
    } = await handlerInput.attributesManager.getPersistentAttributes();

    let previousIndex = playbackInfo[playbackInfo.type].index - 1;

    if (previousIndex === -1) {
      if (playbackSetting.loop) {
        previousIndex += constants.audioData[playbackInfo.type].length;
      } else {
        return handlerInput.responseBuilder
          .speak('You have reached the start of the playlist')
          .addAudioPlayerStopDirective()
          .getResponse();
      }
    }

    playbackInfo[playbackInfo.type].index = previousIndex;
    playbackInfo[playbackInfo.type].offsetInMilliseconds = 0;
    playbackInfo[playbackInfo.type].playbackIndexChanged = true;

    return this.play(handlerInput);
  },
};

/**
 * Returns a token provided by AudioPlayer requests.  
 * @param  {object} handlerInput request data provided by the
 * Alexa Skill.
 * 
 * @return {String || Null} The provided token if included in the request
 * otherwise, null.  
 */
function getToken(handlerInput) {
  if('token' in handlerInput.requestEnvelope.request){
    return handlerInput.requestEnvelope.request.token;
  }else{
    return null;
  }
}

/**
 * Returns the index stored in persistent data. Currently,
 * this should always be set to 0.
 * @param  {object} handlerInput handlerInput request data provided by the 
 * alexa skill request.
 * @param  {String} type: the type of intent request provided.
 * @return {int} The currently stored index.          
 */
async function getIndex(handlerInput,type) {
  const attributes = await handlerInput.attributesManager.getPersistentAttributes();
  return attributes.playbackInfo[type].index;
}

/**
 * Returns a new date object reflecting Monday of the
 * provided date objects week.
 * 
 * @param  {Date} d: A valid node date object.
 * @return {Date}    A new date object reflecting monday of the week reflected by d.
 */
function getMonday(d) {
  d = new Date(d);
  var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

/**
 * updateRockData, completes a rock api request and 
 * updates the current sessions stored rock data.
 * 
 * @param  {String} type      The type of the current sessions request.
 * @param  {Date} audioDate   A date object representing the requested date
 *                            for the request.
 *                            
 * @return {null}           
 */
async function updateRockData(type,audioDate){

    let out = null;
    let aData = {};

    type = type || 'sermonAudio';
    audioDate = audioDate || new Date();

    switch(type) {
        case 'sermonAudio':
          audioDate.setDate( audioDate.getDate() - (audioDate.getDay()+1) );
          aData = await doRockRequest('/api/ContentChannelItems?$filter='+getFilterString(constants.contentChannels[type], audioDate, true)+'&LoadAttributes=True');
          if(aData.length<1){
              adate.setDate( audioDate.getDate() - 7);
              aData = await doRockRequest('/api/ContentChannelItems?$filter='+getFilterString(constants.contentChannels[type], audioDate, true, true)+'&LoadAttributes=True');
          }
        break;
        case 'tipOfTheWeek':
            aData = await doRockRequest('/api/ContentChannelItems?$filter='+getFilterString(constants.contentChannels[type], audioDate, true)+'&LoadAttributes=True');
            if(aData.length<1){
              aData = await doRockRequest('/api/ContentChannelItems?$filter='+getFilterString(constants.contentChannels[type], audioDate, true, true)+'&LoadAttributes=True');
            }
        break;
        case 'thisWeekAtCCV':
            aData = await doRockRequest('/api/ContentChannelItems?$filter='+getFilterString(constants.contentChannels[type], audioDate, true)+'&LoadAttributes=True');
            if(aData.length < 1){
              aData = await doRockRequest('/api/ContentChannelItems?$filter='+getFilterString(constants.contentChannels[type], audioDate, true, true)+'&LoadAttributes=True');
            }
        break;
                
    }

    aData.sort(dateSortDesc);

    constants.audioData[type] = aData;

}

/**
 * Returns a properly formatted filter string for rock requests.
 * @param  {Date} filterDate  a date object for to search for.  If not included, todays date will be used.
 * @param  {Int} channelId   The channel to search
 * @param  {Bool} searchByDay whether or not to search by specific day.  If false the filter string will be generated with the month and year only.
 * @return {String} a Uri encoded string.         
 */
function getFilterString(channelId,filterDate,searchByDay,getAll){

    channelId = parseInt(channelId);
    filterDate = filterDate || new Date();
    searchByDay = searchByDay || false;
    getAll = getAll || false;

    console.log("FILTER DATE: ", filterDate);

    let filterString = 'ContentChannelTypeId eq '+ 
                    channelId;

    if(channelId == 254){
      filterString = 'ContentChannelId eq '+ 
                    channelId;
    }

    if(getAll){
      return encodeURIComponent(filterString);
    }

    if(searchByDay){
        filterString += ' and day(StartDateTime) eq ' + filterDate.getDate();
    }
    
    
    filterString += ' and month(StartDateTime) eq ' +
        (filterDate.getMonth()+1);
    
    
    filterString += ' and year(StartDateTime) eq '+
                    filterDate.getFullYear();

    return encodeURIComponent(filterString);

}

/**
 * Returns the the offset in milliseconds of the 
 * Audio intent request.  This is the last
 * location the user listened to with repect to the
 * audio file.
 * 
 * @param  {Object} handlerInput The input received by the
 *                               alexa skills request.
 * @return {int}                 The last recorded location.
 */
function getOffsetInMilliseconds(handlerInput) {
  // Extracting offsetInMilliseconds received in the request.
  return handlerInput.requestEnvelope.request.offsetInMilliseconds;
}

/**
 * This is a comparison function that will result in objects being 
 * sorted by the StartDateTime parameter in DESCENDING order.
 * This is to be used with the native sort function.  
 * 
 * @param  {Object} a An object to compare with b.
 * @param  {Object} b An object to compare with a
 * @return {int}    Returns -1 if a is greater than b, 1 if a is less than b and 0 if
 *                  both objects have the same value. 
 */
function dateSortDesc (a, b) {
  
  if( (a.StartDateTime.length < 1) && (b.StartDateTime.length > 1) ){
    return -1;
  }

  if( (b.StartDateTime.length < 1) && (a.StartDateTime.length > 1) ){
    return 1;
  }

  let aDate = new Date(a.StartDateTime);
  let bDate = new Date(b.StartDateTime);

  if (aDate > bDate) return -1;
  if (aDate < bDate) return 1;
  return 0;

};