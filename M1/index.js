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
  if (req.method === "POST") {
    let num = 0;
    req.on("data", (chunk) => {
      num += JSON.parse(chunk);
    });
    req.on("end", async () => {
      try {
        await senderChannel.assertQueue(request_queue, { durable: true });
        senderChannel.sendToQueue(
          request_queue,
          Buffer.from(JSON.stringify(num))
        );
        res.writeHead(200);
        res.end();
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

await consumerChannel.assertQueue(response_queue, { durable: true });
consumerChannel.consume(response_queue, (response) => {
  const numBuffer = response.content;
  consumerChannel.ack(response);
  const num = numBuffer.toString();
  console.log(num);
});

server.listen(PORT, () => {
  console.log(`Server M1 started at http://localhost:${PORT}`);
});
