module.exports = function (RED) {
    function GetDataNode(config) {
        RED.nodes.createNode(this, config);

        // Get the reference to the config node
        this.authConfig = RED.nodes.getNode(config.authConfig);
        this.url = config.url;

        const node = this;
        node.on('input', async function (msg, send, done) {
            if (!node.authConfig) {
                node.error('Auth Config not set');
                return done();
            }

            try {
                // Get the auth token from the config node
                const authToken = await node.authConfig.getAuthToken();

                // Use URL from config or msg if specified
                const requestUrl = msg.url || node.url;
                if (!requestUrl) {
                    node.error('URL not specified');
                    return done();
                }

                // Prepare the GET request configuration
                const axios = require('axios');
                let requestConfig = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: requestUrl,
                    headers: {
                        Authorization: authToken, // Use the token
                        'Cookie': 'PHPSESSID=pirpdc81vnatpdego9os99lrnu'
                    }
                };

                // Make the GET request
                const response = await axios.request(requestConfig);

                // Pass the response to the next node
                msg.payload = response.data;
                send(msg);

                done();
            } catch (error) {
                // Handle errors
                node.error('Error making GET request: ' + error.message, msg);
                done(error);
            }
        });
    }

    RED.nodes.registerType('get-data-node', GetDataNode);
};
