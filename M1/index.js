import http from "http";
import amqp from "amqplib";
// import fs from "fs";

const PORT = 5000;
const request_queue = "request_queue"; // Очередь для входящих чисел
const response_queue = "response_queue"; // Очередь для обработанных чисел
// const logFile = "log.txt";
const amqp_url =
  "amqps://mombwlwf:ST-l0O31nJnPfzAyuYc1iVyvV0Ns510y@cow.rmq2.cloudamqp.com/mombwlwf";

// Логирование
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

const createChannel = async (connection) => {
  try {
    const channel = await connection.createChannel();
    log("Channel created");
    return channel;
  } catch (error) {
    log("Error creating channel:", error.message);
    throw error;
  }
};

// Ожидание обработки запроса и передача результата в callback, который выдает ответ на запрос
const waitResult = (channel, callback) => {
  channel.assertQueue(response_queue, { durable: true });
  channel.consume(response_queue, (response) => {
    const numBuffer = response.content;
    channel.ack(response);
    const num = numBuffer.toString();
    callback(num);
  });
};

const start = async () => {
  // Соединение, каналы для принятия и отправки сообщений
  const connection = await createConnection();
  const senderChannel = await createChannel(connection);
  const consumerChannel = await createChannel(connection);

  consumerChannel.assertQueue(request_queue, { durable: true });
  senderChannel.assertQueue(response_queue, { durable: true });

  const server = http.createServer(async (req, res) => {
    if (req.method === "POST") {
      // Чтение тела запроса который является числом в виде простого текста
      let num = 0;
      req.on("data", (chunk) => {
        num += JSON.parse(chunk);
      });
      // По окончанию запроса отправить сообщение в "request_queue"
      req.on("end", async () => {
        try {
          senderChannel.assertQueue(request_queue, { durable: true });
          senderChannel.sendToQueue(
            request_queue,
            Buffer.from(JSON.stringify(num))
          );
          // Вернуть ответ
          waitResult(consumerChannel, (result) => {
              res.writeHead(200, { "Content-Type": "text/plain" });
              res.end(`${result}`);
          });
        } catch (error) {
          error(error);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.write("Internal Server Error");
          res.end();
        }
      });
    } else {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Server M1 is running");
    }
  });

  server.listen(PORT, () => {
    log(`Server M1 started at http://localhost:${PORT}`);
  });
};

start();
