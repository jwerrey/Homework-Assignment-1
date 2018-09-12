var environments = {};

//staging object {default}
environments.staging = {
    'port': 3000,
    'envName': 'staging'

};
//production object
environments.production = {
    'port': 5000,
    'envName': 'production'
};

//determine which one should be exported buy loking at the comannd line argument supplied
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//check that the current enviroment exists  i.e. is one of the options above and if it is export the relevant environment object or default to the staging object
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;


module.exports = environmentToExport;