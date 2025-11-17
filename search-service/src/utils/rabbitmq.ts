import { Channel, Connection, Message, connect } from "amqplib";

type AmqpConnection = Connection & {
  createChannel: () => Promise<Channel>;
};
import logger from "./logger";

let channel: Channel | null = null;
let connection: AmqpConnection | null = null;

const EXCHANGE_NAME = "post_exchange";

export const connectRabbitMQ = async (): Promise<Channel> => {
  if (channel) {
    return channel;
  }

  const url = process.env.RABBITMQ_URL;

  if (!url) {
    throw new Error("RABBITMQ_URL environment variable is not defined");
  }

  try {
    const result = await connect(url);
    const conn = result as unknown as AmqpConnection;
    connection = conn;
    const createdChannel = await conn.createChannel();
    channel = createdChannel;

    await createdChannel.assertExchange(EXCHANGE_NAME, "topic", {
      durable: false,
    });
    logger.info("Connected to RabbitMQ successfully");
    return createdChannel;
  } catch (error) {
    logger.error(
      `Failed to connect to RabbitMQ: ${(error as Error).message}`,
      error
    );
    throw error;
  }
};

export async function consumeEvent<T>(
  routingKey: string,
  callback: (payload: T) => Promise<void> | void
): Promise<void> {
  const ch = channel ?? (await connectRabbitMQ());
  const q = await ch.assertQueue("", { exclusive: true });
  await ch.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

  await ch.consume(q.queue, async (msg: Message | null) => {
    if (!msg) {
      return;
    }

    try {
      const content = JSON.parse(msg.content.toString()) as T;
      await callback(content);
      ch.ack(msg);
    } catch (error) {
      logger.error(
        `Error processing message for ${routingKey}: ${
          (error as Error).message
        }`
      );
      ch.nack(msg, false, false);
    }
  });

  logger.info(`Consuming events from ${routingKey}`);
}
