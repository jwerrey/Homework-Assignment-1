var url = require('url');
var http = require('http');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');


//set up a new server with a call back that supplies the request and response objects
var server = http.createServer(function(req, res) {

    //parse the URL that is received when the request object is decoded using the string decoder 
    //this second step is made explicit by the second parameter being set to 'true' gives permission for the programme
    //to use the built in string decoder in node see require 'string_decoder' above)
    var passedUrl = url.parse(req.url, true);

    //get the path that the client is trying to connect to by using the pathname method which comes from the url require module object
    var path = passedUrl.pathname;

    //use a regular expression to ensure that any extraneous slashes are removed to make the path easier to evaluate later
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //If the user supplies a query string in the URL make sure we have a way to handle and process this using the query method on the parsed URL supplied by the require string decoder module import
    var queryStringObject = passedUrl.query;

    //get the headers as an object
    var headers = req.headers;

    // Use method chaining to get the type of request from the client's request and make it lower case using the request object and the method 'method' which is part of the URL object returned by the require URL object
    var method = req.method.toLowerCase();
    console.log(method);

    //create a new instance of string decoder object the constructor for which is returned by the require string decoder module import
    var decoder = new StringDecoder('utf-8');

    //create an empty variable to store the data on the heap
    var buffer = '';

    //use Node's built in stream and piping functionality available on the request object to create a read stream and pipe the data in packets to the newly created string decoder object each time a 'data event' is emitted on the request object.
    //Use the decoder's built in write method to then stream this to a variable on the heap which is just a store of string characters

    req.on('data', function(data) {
        buffer += decoder.write(data);
    });

    //register the request object as a listener on the Node Event loop for the 'end' event and when this is emitted call the end function on the decoder object which is removed from memory via garbage collection?
    req.on('end', function() {
        buffer += decoder.end();

        //define the chosenHandler so it is in scope but not global
        var chosenHandler;

        //check the router object, which contains the types of routing available, against the route information passed by the client  which was captured by the request object having the 'parse' and 'pathname' methods from the URL 
        //library in Node called on it. If it matches use it as the chosen handler method if it doesn't then use the notfound handler method instead
        if (typeof(router[trimmedPath]) !== 'undefined') {
            if (method == 'post') {
                //the user has entered the correct path for a welcome message and has sent a POST request so give them the welcome message
                chosenHandler = router[trimmedPath];
                //the use has supplied the correct path but not via a POST message so inform them of their grevious error
            } else {
                chosenHandler = handlers.wrongMethod;
            }
            //the user has used the wrong path , inform them of this terrible error
        } else {
            chosenHandler = handlers.notFound;
        }



        //create a data object to store all of the variables in an easily accessible place that can be accessed by dot notation(property of the data object)
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer

        };

        //route the request to the specified handler in the router this is calling either the handlers not found method or the handlers greeting method
        //pass the function the newly created data object and the function it should callback
        chosenHandler(data, function(statusCode, payload) {


            //use the payload called back by the handler or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            //convert the payload to a string the payload the hadnler is sending back to the suer
            var payLoadString = JSON.stringify(payload);
            //send the response

            //tell the user we are sending them JSON via the header
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payLoadString);

            //log what path the person was asking for
            console.log('Returning this response', statusCode, payLoadString);

        });
    });

});


//instantiate handler object 
var handlers = {};



//attach handler methods

handlers.wrongMethod = function(data, callback) {
    callback(407, { 'greeting': 'invalid method request please use a post request for a response' });
};

handlers.notFound = function(data, callback) {
    callback(404, { 'greeting': 'invalid path please use /hello for a response' });
};

//attach handler methods
handlers.greeting = function(data, callback) {
    callback(200, { 'greeting': 'Hello how are you?' });
};

//define the permissable routing instructions
var router = {
    'hello': handlers.greeting,

};

//start the server ,dynamically set port to config fomr the required import module
server.listen(config.port, function() {
    console.log('The server is listening on ' + config.port + 'in ' + config.envName + ' now');
});