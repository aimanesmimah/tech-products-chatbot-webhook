var express = require('express');
var helpers = require('../data/helpers');
var router = express.Router();


//var helpers = require('../data/helpers');
//var state = require('./conversationState');
var webhookMethods = require('./webhookMethods');

router.get('/test',function (req,res) {
    var prods = helpers.getMatchedProducts('galaxy');
   res.json({success : true , method : "GET method 2" , products : prods, message : "success"});
});

router.post('/test',function (req,res) {
    res.json({success : true , method : "POST method" , message : "success"});
});


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
            speech = webhookMethods.defineBrandMethod(req,res);
        }
        else if(req.body.result.parameters.defineAllbrand){
            speech = webhookMethods.defineAllBrandMethod(req,res);
        }
        else if(req.body.result.parameters.productConfirmation){
            speech = webhookMethods.productionConfirmationMethod(req);
        }
        else if(req.body.result.parameters.defineProduct){
            speech = webhookMethods.defineProducts(req,res);
        }
        else if(req.body.result.parameters.defineMoreAbout) {
            speech = webhookMethods.defineMoreAboutMethod(req, res);
        }
        else if(req.body.result.parameters.defineMoreAboutRoboticVacuum){
            speech = webhookMethods.defineMoreAbouRoboticVaccuumMethod(req,res);
        }
        else if(req.body.result.parameters.testParam){
            speech = webhookMethods.testMethod(req,res);
        }
        else if(req.body.result.parameters.brandFallsOutside){
            speech = webhookMethods.brandFallsOutsideMethod(req);
        }
        else if(req.body.result.parameters.brandFallsOutsideConfirmation){
            speech = webhookMethods.brandFallsOutsideConfirmationMethod(req,res);
        }
        else if(req.body.result.parameters.chooseCategoryBrandFallOutside){
            speech = webhookMethods.defineCategoryBrandFallOutside(req);
        }
        else if(req.body.result.parameters.getCategoryBrandFallsOutside){
            speech = webhookMethods.getCategoryBrandFallOutside(req,res);
        }
        else if(req.body.result.parameters.satisfactionConfirmation){
            speech = webhookMethods.satisfactionConfirmationMethod(req);
        }
        else if(req.body.result.parameters.nextStepConfirmation){
            speech = webhookMethods.nextStepConfirmationMethod(req,res);
        }
        else if(req.body.result.parameters.startOverConfirmation){
            speech = webhookMethods.startOverConfirmationMethod(req,res);
        }
        else{
            speech = "sorry! something bad happened. Try again!";
        }



    }
    else{
      speech = "sorry! something bad happened. Try again!";
    }

    res.json({
        speech: speech,
        displayText: speech,
        source: "presentStore"
    });
});



module.exports = router;