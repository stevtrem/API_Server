function capitalizeFirstLetter(s){
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1);   
}


//////////////////////////////////////////////////////////////////////
// dispatch_API_EndPoint middleware
// parse the req.url that must have the following format:
// /api/{resource name} or
// /api/{resource name}/{id}
// then select the targeted controller
// using the http verb (req.method) and optionnal id
// call the right controller function
// warning: this function does not handle sub resource
// of like the following : api/resource/id/subresource/id?....
//
// Important note about controllers:
// You must respect pluralize convention: 
// For resource name RessourName you have to name the controller
// ResourceNamesController that must inherit from Controller class
/////////////////////////////////////////////////////////////////////
exports.dispatch_API_EndPoint = function(req, res){

    const Response = require("./response");
    let response = new Response(res);

    // this function extract the JSON data from the body of the request
    // and and pass it to controllerMethod
    // if an error occurs it will send an error response
    function processJSONBody(req, controller, methodName) {
        let body = [];
        req.on('data', chunk => {
            body.push(chunk);
        }).on('end', () => {
            try {
                // we assume that the data is in the JSON format
                if (req.headers['content-type'] === "application/json") {
                    controller[methodName](JSON.parse(body));
                }
                else 
                    response.unsupported();
            } catch(error){
                console.log(error);
                response.unprocessable();
            }
        });
    }

    let controllerName = '';
    let id = undefined;

    // this function check if url contain a valid API endpoint.
    // in the process, controllerName and optional id will be extracted
    function API_Endpoint_Ok(url){
        // ignore the query string, it will be handled by the targeted controller
        let queryStringMarkerPos = url.indexOf('?');
        if (queryStringMarkerPos > -1)
            url = url.substr(0, queryStringMarkerPos);
        // by convention api endpoint start with /api/...
        if (url.indexOf('/api/') > -1) {
            // extract url componants, array from req.url.split("/") should 
            // look like ['','api','{resource name}','{id}]'
            let urlParts = url.split("/");
            // do we have a resource name?
            if (urlParts.length > 2) {
                // by convention controller name -> NameController
                controllerName = capitalizeFirstLetter(urlParts[2]) + 'Controller';
                // do we have an id?
                if (urlParts.length > 3){
                    if (urlParts[3] !== '') {
                        id = parseInt(urlParts[3]);
                        if (isNaN(id)) { 
                            response.badRequest();
                            // bad id
                            return false;
                        } else
                        // we have a valid id
                        return true;

                    } else
                     // it is ok to have no id
                     return true;
                } else
                    // it is ok to have no id
                    return true;
            }
        }
        // bad API endpoint
        return false;
    }
   
    if (req.url == "/api"){
        const endpoints = require('./endpoints');
        endpoints.list(res);
        return true;
    }
    if (API_Endpoint_Ok(req.url)) {
        // At this point we have a controllerName and an id holding a number or undefined value.
        // in the following, we will call the corresponding method of the controller class accordingly  
        // by using the Http verb of the request.
        // for the POST and PUT verb, will we have to extract the data from the body of the request
        try{
            // dynamically import the targeted controller
            // if the controllerName does not exist the catch section will be called
            const Controller = require('./controllers/' + controllerName);
            // instanciate the controller       
            let controller =  new Controller(req, res);

            if (req.method === 'GET') {
                let queryElements = req.url.split("?");
                if (queryElements[0].includes("/api/bookmarks")){
                    if (queryElements.length === 1){
                        controller.get(id);
                    }else if (queryElements.length === 2 && queryElements[1] === ""){
                        controller.getParams();
                    }else{
                        let params = queryElements[1].split("&");
                        if (params.length > 1){
                            controller.getMultipleParams(params)
                        }else{
                            let data = params[0].split("=");
                            switch(data[0]){
                                case "sort":
                                    controller.sort(data[1].toLowerCase());
                                break;
                                case "name":
                                    controller.getName(data[1].toLowerCase());
                                break;
                                case "category":
                                    controller.getCategory(data[1].toLowerCase());
                                break;
                            }
                        }  
                    }
                }else{
                    response.badRequest();
                }
                // request consumed
                return true;
            }
            if (req.method === 'POST'){
                let postElements = req.url.split("/");
                if (postElements.length === 3 && postElements[1] === "api" && postElements[2] === "bookmarks"){
                    processJSONBody(req, controller,"post");
                }else{
                    response.badRequest();
                }
                // request consumed
                return true;
            }
            if (req.method === 'PUT'){
                let postElements = req.url.split("/");
                if (postElements.length === 4 && postElements[1] === "api" && postElements[2] === "bookmarks"){
                    processJSONBody(req, controller,"put");
                }else{
                    response.badRequest();
                }
                // request consumed
                return true;
            }
            if (req.method === 'PATCH'){
                processJSONBody(req, controller,"patch");
                // request consumed
                return true;
            }
            if (req.method === 'DELETE') {
                let postElements = req.url.split("/");
                if (postElements.length === 4 && postElements[1] === "api" && postElements[2] === "bookmarks" && !isNaN(id)){
                        controller.remove(id);
                }else{
                    response.badRequest();
                }
                // request consumed
                return true;
            }
        } catch(error){
            // catch likely called because of missing controller class
            // i.e. require('./' + controllerName) failed
            // but also any unhandled error...
            console.log('endpoint not found');
            response.notFound();
                // request consumed
                return true;
        }
    }
    // not an API endpoint
    // request not consumed
    // must be handled by another middleware
    return false;
}