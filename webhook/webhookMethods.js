var state = require('./conversationState');
var helpers = require('../data/helpers');


module.exports.readyToStartConfirmation = function (req) {
    let response = req.body.result.parameters.option ;
    let speech ;

    if (response === "yes") {
        let categories = helpers.getAllCategories();
        //state.currentState = "categories";

        speech = "Nice! so I'm gonna introduce you " +
            "to the categories of products in our store.";

        for(let i = 0 ; i < categories.length ; i++){
            if(i === 0 ) {
                speech += " First we have : " + categories[i] + ". Then, There is : ";
            }
            else if(i === categories.length - 1){
                speech += " Finally we have : " + categories[i] + ". "
            }
            else{
                speech += categories[i] + ", " ;
            }

        }

        speech += "May you define the category of your product ?"

    }
    else if (response === "no") {
        speech = "ok! we can do it for another time. Good bye";
    }
    else {
        speech = "sorry! something bad happened. Try again!";

    }

    return speech ;
}

module.exports.defineCategoryMethod = function (req) {
    let category = req.body.result.parameters.Category.toString().toLowerCase();

    //state.currentState = "category";
    state.currentCategory = category;

    let brands = helpers.getBrandsOfCategory(category);

    let speech;

    if(brands.length) {
        speech = "the brands we have for " + category + " " +
            "are : ";

        for(let i=0 ; i < brands.length ; i++){
            if(i === brands.length - 1)
                speech += brands[i] + ".";
            else
                speech += brands[i] + ", " ;
        }

        speech += " May you choose one ?";
    }
    else
        speech = "unfortunately, we have currently any brand for " + category + " category" ;

    return speech ;
}

module.exports.defineBrandMethod = function (req) {

    let brand = req.body.result.parameters.Brand.toString().toLowerCase();

    //state.currentState = "brand";
    state.currentBrand = brand;


    let prods = helpers.getProductsOfCategoryAndBrand(state.currentCategory,brand);

    let speech ;

    if(prods.length === 1){
        speech = "we have only one product for now and that is: " + prods[0].name + "." +
           " Do you want to pick it up?";
    }
    else {
        speech = "this is all " + state.currentCategory + " products we have for " + brand + " brand.";
        speech += " we have : \n";


        for (let i = 0; i < prods.length; i++) {
            if (i === prods.length - 1 && prods.length === 2)
                speech += "and " + prods[i].name + ".\n";
            if (i === prods.length - 1)
                speech += "and Finally " + prods[i].name + ".\n";
            else
                speech += prods[i].name + ". ";
        }

        speech += " Did you like one of them ?";
    }

    return speech ;
}

module.exports.productionConfirmationMethod = function (req) {
    let option = req.body.result.parameters.option ;
    let speech;

    if(option === "yes"){
        let prods = helpers.getProductsOfCategoryAndBrand(state.currentCategory,state.currentBrand);
        if(prods.length === 1) {
            speech = "can you repeat its name please? Just to make sure it is really there.";
        }
        else{
            speech = "So which one do you want to subscribe to ?";
        }

    }
    else if(option === "no"){
        speech = "really do you want to look at other options ?" ;
    }
    else{
        speech = "sorry! something bad happened. Try again!" ;
    }

    return speech;
}

module.exports.defineProducts = function (req) {
    let productName = req.body.result.parameters.productName.toString().toLowerCase();
    let prods = helpers.getMatchedProducts(productName);

    //state.currentState = "product";
    state.currentProduct = productName;

    var resultProds = prods.filter(
        prod => prod.category === state.currentCategory && prod.brand === state.currentBrand );

    let speech ;


    if(resultProds.length){
        if(resultProds.length === 1)
            speech = "this is your dream product. The subscription plan for this " +
                "product is : " + resultProds[0].subprice + "\nAre you happy " +
                "with this deal ?";
        else{
            speech = "this corresponds to " + resultProds.length + " products. " +
                "Which one you want. Say more about it ( RAM || STORAGE || version )" ;
        }
    }
    else if(!resultProds.length){
        speech = "no " + productName + " corrensponds to this brand";
    }
    else{
        speech = "sorry! something bad happened. Try again!";
    }

    return speech;
}

module.exports.defineMoreAboutMethod = function (req) {
    let specGB = req.body.result.parameters.specificationGB;
    let specRAM = req.body.result.parameters.specificationRAM ;
    let info = req.body.result.parameters.specificationNumber.toString();

    //state.currentState = "product";
    state.currentMoreInfos = info ;

    if(specGB && !specRAM)
        info += "gb";
    if(specRAM || ( specGB && specRAM ))
        info += "gb ram";
    else
        info += "";

    let prods = helpers.getMatchedProducts(info);



    var resultProds = prods.filter(
        prod => prod.category === state.currentCategory
            && prod.brand === state.currentBrand
            && prod.name.includes(state.currentProduct));

    let speech;


    if(resultProds.length){
       speech = "this is your dream product. We got it for you. The subscription " +
           "plan for this one is : " + resultProds[0].subprice;
    }
    else{
        speech = "sorry! we didn't find what you're looking for. Check our products " +
            "and choose one of them";
    }

    return speech;


}


