import http from "http";
import amqp from "amqplib";
// import fs from "fs";

const PORT = 5001;
const request_queue = "request_queue";
const response_queue = "response_queue";
// const logFile = "log.txt";
const amqp_url =
  "amqps://mombwlwf:ST-l0O31nJnPfzAyuYc1iVyvV0Ns510y@cow.rmq2.cloudamqp.com/mombwlwf";

const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  // fs.appendFileSync(logFile, logMessage);
  console.log(logMessage);
};

const createConnection = async () => {
  try {
    const connection = await amqp.connect(amqp_url);
    log("Connected to RabbitMQ");
    return connection;
  } catch (error) {
    log("Error connecting to RabbitMQ:", error.message);
    throw error;
  }
};
// Соединение с RabbitMQ
const connection = await createConnection();

const createChannel = async () => {
  try {
    const channel = await connection.createChannel();
    log("Channel created");
    return channel;
  } catch (error) {
    log("Error creating channel:", error.message);
    throw error;
  }
};
// Каналы для принятия и отправки сообщений
const senderChannel = await createChannel();
const consumerChannel = await createChannel();

consumerChannel.assertQueue(request_queue, { durable: true });
senderChannel.assertQueue(response_queue, { durable: true });

// Принимать сообщения из очереди "request_queue" и ...
consumerChannel.consume(request_queue, (msg) => {
  const inputNum = JSON.parse(msg.content.toString());
  const num = inputNum * 2;
  // Отправлять сообщеник в response_queue после симуляции задержки и обработки задания
  setTimeout(() => {
    senderChannel.sendToQueue(response_queue, Buffer.from(JSON.stringify(num)));
    consumerChannel.ack(msg);
  }, 5000);
});

const server = http.createServer(async (req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Server M2 is running");
});

server.listen(PORT, () => {
  log(`Server M2 started at http://localhost:${PORT}`);
});
