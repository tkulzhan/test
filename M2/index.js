import http from "http";
import amqp from "amqplib";

const PORT = 5001;
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
var connection = await createConnection();

const createChannel = async () => {
  try {
    const senderChannel = await connection.createChannel();
    console.log("Channel created");
    return senderChannel;
  } catch (error) {
    console.error("Error creating channel:", error.message);
    throw error;
  }
};
var senderChannel = await createChannel();
var consumerChannel = await createChannel();

const server = http.createServer(async (req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write("Server M2 is running");
  res.end();
});

await consumerChannel.assertQueue(request_queue, { durable: true });
await senderChannel.assertQueue(response_queue, { durable: true });
consumerChannel.consume(request_queue, (msg) => {
  const inputNum = JSON.parse(msg.content.toString());
  const num = inputNum * 2;
  consumerChannel.ack(msg);
  senderChannel.sendToQueue(response_queue, Buffer.from(JSON.stringify(num)));
});

server.listen(PORT, () => {
  console.log(`Server M1 started at http://localhost:${PORT}`);
});
