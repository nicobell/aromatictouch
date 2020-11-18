const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const Alexa = require('ask-sdk');

exports.handler = async (event) => {
    return { "message": "Successfully executed" };
};
let skill;

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Welcome to Aromatic Touch!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const ShowWineNumberIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ShowWineNumberIntent';
    },
    async handle(handlerInput) {
        const wine = Alexa.getSlotValue(handlerInput.requestEnvelope, 'number');
        const spot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'spot');

        var speechText = ''

        if (spot != undefined) {
            speechText = 'Showing wine ' + wine;
            try {
                let data = await ddb.update({
                    TableName: "AromaticWines",
                    Key: {
                        spotid: spot
                    },
                    ExpressionAttributeValues: {
                        ':winetoshow': wine
                    },
                    UpdateExpression: "set #wineid = :winetoshow"
                }).promise();
            } catch (err) {
                speechText = 'Error while showing wine in spot x.'
            };

        } else {
            speechText = 'Showing wine ' + wine + ' in spot ' + spot;
            try {
                let data = await ddb.update({
                    TableName: "AromaticWines",
                    Key: {
                        spotid: 1
                    },
                    ExpressionAttributeValues: {
                        ':winetoshow': wine
                    },
                    UpdateExpression: "set #wineid = :winetoshow"
                }).promise();
            } catch (err) {
                speechText = 'Error while showing wine in spot 1.'
            };
        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const ResetWineNumberIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ResetWineNumberIntent';
    },
    async handle(handlerInput) {
        const spot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'spot');

        var speechText = ''
        if (spot != undefined) {
            speechText = 'Closing spot 1.';
            try {
                let data = await ddb.update({
                    TableName: "AromaticWines",
                    Key: {
                        spotid: spot
                    },
                    ExpressionAttributeValues: {
                        ':winetoclose': 0
                    },
                    UpdateExpression: "set #wineid = :winetoclose"
                }).promise();

            } catch (err) {
                speechText = 'Error whiel closing spot x.'
            };

        } else {
            speechText = 'Closing spot ' + spot + '.';
            try {
                let data = await ddb.update({
                    TableName: "AromaticWines",
                    Key: {
                        spotid: 1
                    },
                    ExpressionAttributeValues: {
                        ':winetoclose': 0
                    },
                    UpdateExpression: "set #wineid = :winetoclose"
                }).promise();

            } catch (err) {
                speechText = 'Error whiel closing spot 1.'
            };

        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const ResetAllWinesHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ResetAllWines';
    },
    handle(handlerInput) {
        const speechText = 'Closing all spots.';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Chooose a wine to explore! Try to say: Show me wine number 1 in spot 1.' +
            'If you do not request a spot, the first will be default.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(false)
            .getResponse();
    }
}

const ErrorHandler = {
    canHandle(handlerInput) {
        return true;
    },
    handle(handlerInput, error) {
        console.log('Error handled: ' + JSON.stringify(error.message));

        const speechText = 'Error encountered: ' + error.message;
        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

exports.handler = async function (event, context) {
    if (!skill) {
        skill = Alexa.SkillBuilders.custom()
            .addErrorHandlers(ErrorHandler)
            .addRequestHandlers(
                CancelAndStopIntentHandler,
                HelpIntentHandler,
                LaunchRequestHandler,
                ShowWineNumberIntentHandler,
                ResetWineNumberIntentHandler,
                ResetAllWinesHandler
            ).create();
    }

    const response = await skill.invoke(event, context);
    return response;
};
