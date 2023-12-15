import http from "http";
import amqp from "amqplib";

const PORT = 5000;
const request_queue = "request_queue";
const response_queue = "response_queue";
const amqp_url =
  "amqps://mombwlwf:ST-l0O31nJnPfzAyuYc1iVyvV0Ns510y@cow.rmq2.cloudamqp.com/mombwlwf";

const createConnection = async () => {
  try {
    const connection = await amqp.connect(amqp_url);
    console.log("Connected to RabbitMQ");
    return connection;
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error.message);
    throw error;
  }
};

const createChannel = async (connection) => {
  try {
    const channel = await connection.createChannel();
    console.log("Channel created");
    return channel;
  } catch (error) {
    console.error("Error creating channel:", error.message);
    throw error;
  }
};

const waitResult = (channel, callback) => {
  channel.assertQueue(response_queue, { durable: true });
  channel.consume(response_queue, (response) => {
    const numBuffer = response.content;
    channel.ack(response);
    const num = numBuffer.toString();
    callback(num);
  });
};

const setupM1Server = async () => {
  const connection = await createConnection();
  const senderChannel = await createChannel(connection);
  const consumerChannel = await createChannel(connection);

  consumerChannel.assertQueue(request_queue, { durable: true });
  senderChannel.assertQueue(response_queue, { durable: true });

  const server = http.createServer(async (req, res) => {
    if (req.method === "POST") {
      let num = 0;
      req.on("data", (chunk) => {
        num += JSON.parse(chunk);
      });
      req.on("end", async () => {
        try {
          senderChannel.assertQueue(request_queue, { durable: true });
          senderChannel.sendToQueue(
            request_queue,
            Buffer.from(JSON.stringify(num))
          );

          waitResult(consumerChannel, (result) => {
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.write(`Request processed. Result: ${result}`);
            res.end();
          });
        } catch (error) {
          console.error(error);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.write("Internal Server Error");
          res.end();
        }
      });
    } else {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.write("Server M1 is running");
      res.end();
    }
  });

  server.listen(PORT, () => {
    console.log(`Server M1 started at http://localhost:${PORT}`);
  });
};

setupM1Server();
