var express = require('express');
var router = express.Router();

//var helpers = require('../data/helpers');
//var state = require('./conversationState');
var webhookMethods = require('./webhookMethods');


router.post('/',function(req,res){

    let speech ;

    if(req.body.result && req.body.result.parameters) {



        if (req.body.result.parameters.presentStore) {
            speech = webhookMethods.readyToStartConfirmation(req);
        }
        else if(req.body.result.parameters.defineCategory){
            speech = webhookMethods.defineCategoryMethod(req);
        }
        else if(req.body.result.parameters.defineBrand){
            speech = webhookMethods.defineBrandMethod(req);
        }
        else if(req.body.result.parameters.productConfirmation){
            speech = webhookMethods.productionConfirmationMethod(req);
        }
        else if(req.body.result.parameters.defineProduct){
            speech = webhookMethods.defineProducts(req);
        }
        else if(req.body.result.parameters.defineMoreAbout){
            speech = webhookMethods.defineMoreAboutMethod(req);
        }
        else{
            speech = "sorry! something bad happened";
        }



    }
    else{
      speech = "sorry! something bad happened";
    }

    res.json({
        speech: speech,
        displayText: speech,
        source: "presentStore"
    });
});



module.exports = router;