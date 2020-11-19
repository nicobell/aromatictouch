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
        const speechText = 'Benvenuto in Aromatic Touch!';
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
            speechText = 'Vino numero ' + wine + ' in posizione ' + spot;
            try {
                let data = await ddb.update({
                    TableName: "AromaticWines",
                    Key: {
                        spotid: parseInt(spot)
                    },
                    ExpressionAttributeValues: {
                        ':winetoshow': parseInt(wine),
                        ':wineclosed': ""
                    },
                    UpdateExpression: "set wineid = :winetoshow, winename = :wineclosed"
                }).promise();
            } catch (err) {
                speechText = 'Errore in apertura del vino in posizione ' + spot + '. Messaggio: ' + err.message
            };

        } else {
            speechText = 'Vino numero ' + wine + ' in posizione 1';
            try {
                let data = await ddb.update({
                    TableName: "AromaticWines",
                    Key: {
                        spotid: 1
                    },
                    ExpressionAttributeValues: {
                        ':winetoshow': parseInt(wine),
                        ':wineclosed': ""
                    },
                    UpdateExpression: "set wineid = :winetoshow, winename = :wineclosed"
                }).promise();
            } catch (err) {
                speechText = 'Errore in apertura del vino in posizione 1. Messaggio: ' + err.message
            };
        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const ShowWineNameIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ShowWineNameIntent';
    },
    async handle(handlerInput) {
        var name = Alexa.getSlotValue(handlerInput.requestEnvelope, 'name');
        const spot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'spot');

        if(name==undefined)
            name = Alexa.getSlotValue(handlerInput.requestEnvelope, 'nome');

        var speechText = '';

        if(spot!=undefined) {
            speechText = 'Vino ' + name + ' in posizione ' + spot;

            try {
                let data = await ddb.update({
                    TableName: "AromaticWines",
                    Key: {
                        spotid: parseInt(spot)
                    },
                    ExpressionAttributeValues: {
                        ':winetoshow': name,
                        ':wineclosed': 0
                    },
                    UpdateExpression: "set winename = :winetoshow, wineid = :wineclosed"
                }).promise();
            } catch (err) {
                speechText = 'Errore in apertura del vino in posizione ' + spot + '. Messaggio: ' + err.message
            };

        } else {
            speechText = 'Vino ' + name + ' in posizione 1';

            try {
                let data = await ddb.update({
                    TableName: "AromaticWines",
                    Key: {
                        spotid: 1
                    },
                    ExpressionAttributeValues: {
                        ':winetoshow': name,
                        ':wineclosed': 0
                    },
                    UpdateExpression: "set winename = :winetoshow, wineid = :wineclosed"
                }).promise();
            } catch (err) {
                speechText = 'Errore in apertura del vino in posizione ' + spot + '. Messaggio: ' + err.message
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
            speechText = 'Chiusura della posizione ' + spot;
            try {
                let data = await ddb.update({
                    TableName: "AromaticWines",
                    Key: {
                        spotid: parseInt(spot)
                    },
                    ExpressionAttributeValues: {
                        ':winetoclose': 0,
                        ':wineclosed': ""
                    },
                    UpdateExpression: "set wineid = :winetoclose, winename = :wineclosed"
                }).promise();

            } catch (err) {
                speechText = 'Errore in chiusura della posizione ' + spot + '. Messaggio: ' + err.message
            };

        } else {
            speechText = 'Chiusura della posizione 1';
            try {
                let data = await ddb.update({
                    TableName: "AromaticWines",
                    Key: {
                        spotid: 1
                    },
                    ExpressionAttributeValues: {
                        ':winetoclose': 0,
                        ":wineclosed": ""
                    },
                    UpdateExpression: "set wineid = :winetoclose, winename = :wineclosed"
                }).promise();

            } catch (err) {
                speechText = 'Errore in chiusura della posizione 1. Messaggio: ' + err.message
            };

        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const ResetAllWinesIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ResetAllWinesIntent';
    },
    async handle(handlerInput) {
        var speechText = '';
        var spot = 1;

        try {
            //for(var spot = 1; spot++; spot<6) {
            let data1 = await ddb.update({
                TableName: "AromaticWines",
                Key: {
                    spotid: 1
                },
                ExpressionAttributeValues: {
                    ':winetoclose': 0,
                    ':wineclosed': ""
                },
                UpdateExpression: "set wineid = :winetoclose, winename = :wineclosed",
            }).promise();
            //}

            let data2 = await ddb.update({
                TableName: "AromaticWines",
                Key: {
                    spotid: 2
                },
                ExpressionAttributeValues: {
                    ':winetoclose': 0,
                    ':wineclosed': ""
                },
                UpdateExpression: "set wineid = :winetoclose, winename = :wineclosed",
            }).promise();

            let data3 = await ddb.update({
                TableName: "AromaticWines",
                Key: {
                    spotid: 3
                },
                ExpressionAttributeValues: {
                    ':winetoclose': 0,
                    ':wineclosed': ""
                },
                UpdateExpression: "set wineid = :winetoclose, winename = :wineclosed",
            }).promise();

            let data4 = await ddb.update({
                TableName: "AromaticWines",
                Key: {
                    spotid: 4
                },
                ExpressionAttributeValues: {
                    ':winetoclose': 0,
                    ':wineclosed': ""
                },
                UpdateExpression: "set wineid = :winetoclose, winename = :wineclosed",
            }).promise();

            let data5 = await ddb.update({
                TableName: "AromaticWines",
                Key: {
                    spotid: 5
                },
                ExpressionAttributeValues: {
                    ':winetoclose': 0,
                    ':wineclosed': ""
                },
                UpdateExpression: "set wineid = :winetoclose, winename = :wineclosed",
            }).promise();

            let data6 = await ddb.update({
                TableName: "AromaticWines",
                Key: {
                    spotid: 6
                },
                ExpressionAttributeValues: {
                    ':winetoclose': 0,
                    ':wineclosed': ""
                },
                UpdateExpression: "set wineid = :winetoclose, winename = :wineclosed",
            }).promise();
            //}
            speechText = 'Ritorno alla home';

        } catch (err) {
            speechText = 'Errore in chiusura di tutte le posizioni. Messaggio: ' + err.message;
        };

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
        const speakOutput = 'Scegli un vino da esplorare! Prova a chiedermi: mostrami il vino numero 1 in posizione 1. Se ometti la posizione, il vino verrà aperto sulla prima di default.';

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

        const speechText = 'Errore: ' + error.message;
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
        const speakOutput = 'Alla prossima!';
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
                ResetAllWinesIntentHandler,
                ShowWineNameIntentHandler
            ).create();
    }

    const response = await skill.invoke(event, context);
    return response;
};
