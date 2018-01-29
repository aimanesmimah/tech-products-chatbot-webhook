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

module.exports.defineBrandMethod = function (req,res) {

    let brand = req.body.result.parameters.Brand.toString().toLowerCase();

    let speech ;

    let categories = helpers.getCategoriesOfBrand(brand);

    if(!categories.includes(state.currentCategory)){
        res.json({
            followupEvent : {
                name: "brand_falls_outside_event",
                data: {
                    brand : brand
                }
            }
        });
    }

    //state.currentState = "brand";
    state.currentBrand = brand;


    let prods = helpers.getProductsOfCategoryAndBrand(state.currentCategory,brand);



    if(prods.length === 1){
        speech = "we have only one product for now and that is: " + prods[0].name + "." +
           " Do you want to pick it up?";
    }
    else {
        speech = "this is all " + state.currentCategory + " products we have for " + brand + " brand.";
        speech += " we have : \n";


        for (let i = 0; i < prods.length; i++) {
            if (i === prods.length - 1 ){
                if(prods.length === 2){
                    speech += "and " + prods[i].name + ".\n";
                }
                else{
                    speech += "and Finally " + prods[i].name + ".\n";
                }
            }
            else
                speech += prods[i].name + ". ";
        }

        speech += " Did you like one of them ?";
    }

    return speech ;
}

module.exports.defineAllBrandMethod = function (req) {

    let brand = req.body.result.parameters.Brand.toString().toLowerCase();

    let speech ;

    state.currentCategory = "all";
    state.currentBrand = brand;


    let prods = helpers.getAllProductsOfBrand(brand);

    if(prods.length){
        if(prods.length === 1){
            speech = "we have only one product for now and that is: " + prods[0].name + "." +
                " Do you want to pick it up?";
        }
        else{
            speech = "this is all products we have for " + brand + " brand.";
            speech += " we have : \n";


            for (let i = 0; i < prods.length; i++) {
                if (i === prods.length - 1 ){
                    if(prods.length === 2){
                        speech += "and " + prods[i].name + ".\n";
                    }
                    else{
                        speech += "and Finally " + prods[i].name + ".\n";
                    }
                }
                else
                    speech += prods[i].name + ". ";
            }

            speech += " Did you like one of them ?";
        }
    }
    else{
        speech = "no product was found try again";
    }

    return speech;
}

module.exports.productionConfirmationMethod = function (req) {
    let option = req.body.result.parameters.option ;
    let speech;

    if(option === "yes"){
        let prods ;
        if(state.currentCategory !== "all")
            prods = helpers.getProductsOfCategoryAndBrand(state.currentCategory,state.currentBrand);
        else
            prods = helpers.getAllProductsOfBrand(state.currentBrand);


        if(prods.length === 1) {
            speech = "can you repeat its name or a part of it please? Just to make " +
                "sure it is really there.";
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

module.exports.defineProducts = function (req,res) {
    let convertible = req.body.result.parameters.convertible;

    let productName = req.body.result.parameters.productName.toString().toLowerCase();

    let prods ;

    if(convertible) {
        productName = 'convertible laptop';
        prods = helpers.getMatchedProducts(productName);
    }
    else
        prods = helpers.getMatchedProducts(productName);

    //state.currentState = "product";
    state.currentProduct = productName;

    let resultProds ;

    if(state.currentCategory !== "all"){
        resultProds = prods.filter(
            prod => prod.category === state.currentCategory && prod.brand === state.currentBrand );
    }
    else{
        resultProds = prods.filter( prod => prod.brand === state.currentBrand );
    }

    let speech ;


    if(resultProds.length){
        if(resultProds.length === 1) {
            /*speech = "this is your dream product. The subscription plan for this " +
                "product is : " + resultProds[0].subprice + "\nAre you happy " +
                "with this deal ?";*/

            res.json({
                followupEvent: {
                    name: "dream_product_event",
                    data: {
                        subprice : resultProds[0].subprice,
                        product : resultProds[0].name
                    }
                }
            });
        }
        else{
            speech = "this corresponds to " + resultProds.length + " products. " +
                "Which one you want. Say more about it ( RAM || STORAGE || version )" ;
        }
    }
    else if(!resultProds.length){
        speech = "no " + productName + " corrensponds to this brand";
    }
    else{
        speech = "sorry! we didn't find what you're looking for! It seems that you typed a " +
            "wrong name. Try again please";
    }

    return speech;
}

module.exports.defineMoreAboutMethod = function (req,res) {
    let specGB = req.body.result.parameters.specificationGB;
    let specRAM = req.body.result.parameters.specificationRAM ;
    let info = req.body.result.parameters.specificationNumber.toString();

    let specIphone = req.body.result.parameters.iphoneSpecification.toString();
    let specSamsungPhone = req.body.result.parameters.SamsungPhoneSpecification.toString();
    let specWatch = req.body.result.parameters.watchSpecification.toString();

    //state.currentState = "product";

    let prods ;

    if(specIphone){
        state.currentMoreInfos = specIphone;
        prods = helpers.getMatchedProducts(specIphone);
    }
    else if(specSamsungPhone){
        state.currentMoreInfos = specSamsungPhone;
        prods = helpers.getMatchedProducts(specSamsungPhone);
    }
    else if(specWatch){
        state.currentMoreInfos = specWatch;
        prods = helpers.getMatchedProducts(specWatch);
    }
    else{
        state.currentMoreInfos = info ;

        if(specGB && !specRAM)
            info += "gb";
        if(specRAM || ( specGB && specRAM ))
            info += "gb ram";
        else
            info += "";

        prods = helpers.getMatchedProducts(info);
    }



    let resultProds ;

    if(state.currentCategory !== "all"){
        resultProds = prods.filter(
            prod => prod.category === state.currentCategory
                && prod.brand === state.currentBrand
                && prod.name.includes(state.currentProduct));
    }
    else{
        resultProds = prods.filter(
            prod => prod.brand === state.currentBrand
                 && prod.name.includes(state.currentProduct));
    }



    let speech;


    if(resultProds.length){
       /*speech = "this is your dream product. We got it for you. The subscription " +
           "plan for this one is : " + resultProds[0].subprice;*/

        res.json({
            followupEvent: {
                name: "dream_product_event",
                data: {
                    subprice : resultProds[0].subprice,
                    product : resultProds[0].name
                }
            }
        });
    }
    else{
        speech = "sorry! we didn't find what you're looking for. Check our products " +
            "and choose one of them";
    }

    return speech;


}

module.exports.defineMoreAboutBebopMethod = function (req,res) {
    let info = req.body.result.parameters.moreAboutBebop.toString().toLowerCase();

    //state.currentState = "product";
    state.currentMoreInfos = info ;

    let prods ;

    if(info === "version 1")
        prods = [{
            "name" : "drone bebop",
            "brand" : "parrot",
            "category" : "drones",
            "subprice"  : 49.99
        }];
    else
        prods = [{
            "name" : "drone bebop 2",
            "brand" : "parrot",
            "category" : "drones",
            "subprice"  : 59.99
        }];

    let resultProds ;

    if(state.currentCategory !== "all"){
        resultProds = prods.filter(
            prod => prod.category === state.currentCategory
                && prod.brand === state.currentBrand
                && prod.name.includes(state.currentProduct));
    }
    else{
        resultProds = prods.filter(
            prod => prod.brand === state.currentBrand
                && prod.name.includes(state.currentProduct));
    }

    let speech;


    if(resultProds.length){
        /*speech = "this is your dream product. We got it for you. The subscription " +
            "plan for this one is : " + resultProds[0].subprice;*/

        res.json({
            followupEvent: {
                name: "dream_product_event",
                data: {
                    subprice : resultProds[0].subprice,
                    product : resultProds[0].name
                }
            }
        });
    }
    else{
        speech = "sorry! we didn't find what you're looking for. Check our products " +
            "and choose one of them. Good Bye";
    }

    return speech;
}

module.exports.defineMoreAbouRoboticVaccuumMethod = function (req,res) {

    let info = req.body.result.parameters.roboticVacuumVersion.toString().toLowerCase();

    //state.currentState = "product";
    state.currentMoreInfos = info ;



    let prods = helpers.getMatchedProducts(info);

    let resultProds ;

    if(state.currentCategory !== "all"){
        resultProds = prods.filter(
            prod => prod.category === state.currentCategory
                && prod.brand === state.currentBrand
                && prod.name.includes(state.currentProduct));
    }
    else{
        resultProds = prods.filter(
            prod => prod.brand === state.currentBrand
                && prod.name.includes(state.currentProduct));
    }

    let speech;


    if(resultProds.length){
        /*speech = "this is your dream product. We got it for you. The subscription " +
            "plan for this one is : " + resultProds[0].subprice;*/

        res.json({
            followupEvent: {
                name: "dream_product_event",
                data: {
                    subprice : resultProds[0].subprice,
                    product : resultProds[0].name
                }
            }
        });
    }
    else{
        speech = "sorry! we didn't find what you're looking for. Check our products " +
            "and choose one of them. Good bye";
    }

    return speech;


}

module.exports.brandFallsOutsideMethod = function (req) {
    let brand = req.body.result.parameters.Brand.toString().toLowerCase();

    let speech ;

    state.currentBrand = brand;

    let categories = helpers.getCategoriesOfBrand(brand);

    speech = brand + " brand falls outside of this category you have chosen. We have it" +
        " only in: " ;

    if(categories.length === 1){
        speech += categories[0] + " category.";
    }
    else{
        for(let i = 0 ; i< categories.length ; i++){
            if(i === categories.length -1){
                speech += " and " + categories[i] + " categories." ;
            }
            else{
                speech += categories[i] ;
            }
        }
    }

    return speech + " Do you want to see what exist there ?";


}

module.exports.brandFallsOutsideConfirmationMethod = function (req,res) {
    let option = req.body.result.parameters.option ;
    let speech;

    if(option === "yes"){
        let categories = helpers.getCategoriesOfBrand(state.currentBrand);

        if(categories.length === 1){
            state.currentCategory = categories[0];

            res.json({
                followupEvent : {
                    name: "products_brands_falls_outside",
                    data: {
                        brand : state.currentBrand
                    }
                }
            });
        }

        else{
            res.json({
                followupEvent : {
                    name: "choose_category_brand_falls_outside_event",
                    data: {
                        brand : state.currentBrand
                    }
                }
            });
        }

    }
    else if(option === "no"){

        res.json({
            followupEvent : {
                name: "brand_falls_outside_confirmation_no_event",
                data: {
                    brand : brand
                }
            }
        });
    }
    else{
        speech = "sorry! something bad happened. Try again!" ;
    }

    return speech;
}

module.exports.defineCategoryBrandFallOutside = function (req) {
    let brand = req.body.result.parameters.Brand.toLowerCase() ;

    let categories = helpers.getCategoriesOfBrand(brand);

    let speech;

    speech = "choose one category between: " ;

    for(let i=0 ; i < categories.length ; i++){
        if(categories.length - 1 === i) {
            speech += " and " + categories[i] + ".";
        }
        else{
            speech += categories[i] + ", ";
        }
    }

    return speech;
}

module.exports.getCategoryBrandFallOutside = function (req,res) {
    let category = req.body.result.parameters.Category.toLowerCase() ;

    let categories = helpers.getCategoriesOfBrand(state.currentBrand);

    let speech;

    if(categories.includes(category)){
            state.currentCategory = category;
            res.json({
                followupEvent : {
                    name: "products_brands_falls_outside",
                    data: {
                          brand : state.currentBrand
                       }
                }
            });
    }
    else{
        speech = category + " category doesn't belong to this brand" ;
    }

    return speech;
}

module.exports.satisfactionConfirmationMethod = function (req) {
    let option = req.body.result.parameters.option ;
    let speech;

    if(option === "yes"){
        speech = "Nice! I'm happy for you. Do you want to pick up another thing ?";
    }
    else if(option === "no"){
        speech = "Do you want to have a look at other options ?";
    }
    else{
        speech = "sorry! something bad happened. Try again!" ;
    }

    return speech;
}

module.exports.nextStepConfirmationMethod = function (req,res) {
    let option = req.body.result.parameters.option ;
    let speech;

    if(option === "yes"){
        res.json({
            followupEvent : {
                name: "start_over_event",
                data : {}


            }
        });
    }
    else if(option === "no"){
        speech = "Ok next time. Good bye";
    }
    else{
        speech = "sorry! something bad happened. Try again!" ;
    }

    return speech;
}

module.exports.startOverConfirmationMethod = function (req,res) {
    let option = req.body.result.parameters.option ;
    let speech;

    if(option === "yes"){
        res.json({
            followupEvent : {
                name: "present_store_event",
                data : {}


            }
        });
    }
    else if(option === "no"){
        speech = "Ok next time. Good bye";
    }
    else{
        speech = "sorry! something bad happened. Try again!" ;
    }

    return speech;
}

module.exports.testMethod = function (req,res) {
    let speech = "ayman smimah";
      res.json({
          followupEvent : {
              name: "test_event",
              data: {
                  test :["cloud strife","ayman smimah"]
              }
          }
       });

      return speech ;
}


