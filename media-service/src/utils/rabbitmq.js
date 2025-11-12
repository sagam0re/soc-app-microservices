const amqp = require("amqplib");
const logger = require("./logger");

let channel;
let connection;

const EXCHANGE_NAME = "post_exchange";

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info("Connected to RabbitMQ successfully");
    return channel;
  } catch (error) {
    logger.error("Failed to connect to RabbitMQ", error);
  }
};

const publishEvent = async (routingKey, message) => {
  if (!channel) {
    await connectRabbitMQ();
  }
  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
  logger.info(`Event published to ${routingKey}`);
};

async function consumeEvent(routingKey, callback) {
  if (!channel) {
    await connectRabbitMQ();
  }
  const q = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
  channel.consume(q.queue, (msg) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString());
      callback(content);
      channel.ack(msg);
    }
  });
  logger.info(`Consuming events from ${routingKey}`);
}

module.exports = {
  connectRabbitMQ,
  publishEvent,
  consumeEvent,
};
