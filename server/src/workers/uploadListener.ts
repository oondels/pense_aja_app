import amqp from 'amqplib';
import logger from '../utils/logger';
import { PenseAjaService } from '../services/penseAjaService';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'pense_aja';
const MAX_ATTEMPTS = 3;

export async function startUploadListener() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  // Declara um exchange que vai receber as dead-letters
  await channel.assertExchange('pense_aja.dlx', 'direct', { durable: true });
  // Fila de retry
  await channel.assertQueue('pense_aja.retry', {
    durable: true,
    arguments: {
      'x-message-ttl': 15000,// Tempo de espera antes de enviar para a fila de dead-letter
      'x-dead-letter-exchange': '',
      'x-dead-letter-routing-key': 'pense_aja',
    }
  });
  // Declara a própria fila de dead-letters a esse exchange
  await channel.assertQueue('pense_aja.dlq', { durable: true });
  await channel.bindQueue('pense_aja.dlq', 'pense_aja.dlx', 'routing-key-dlq');

  await channel.assertQueue(QUEUE_NAME, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': '', // volta para default exchange
      'x-dead-letter-routing-key': 'pense_aja.retry', // chave de roteamento para a fila de retry
    }
  });

  logger.info("Upload Service", `Listening for uploads on queue: ${QUEUE_NAME}`);
  channel.consume(QUEUE_NAME, async (msg) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString());

      let { serviceName, payload, files, dassOffice } = content;
      if (!serviceName || !payload || !files) {
        logger.error("Upload Service", "Invalid message format received");
        channel.publish(
          'pense_aja.dlx',
          'routing-key-dlq',
          msg.content,
          { persistent: true }
        );

        return channel.ack(msg);
      }

      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch (error) {
          logger.error("Upload Service", "Failed to parse payload");
          channel.nack(msg, false, false);
          return;
        }
      }

      if (!Array.isArray(files)) {
        logger.error("Upload Service", "Files must be an array");
        channel.publish(
          'pense_aja.dlx',
          'routing-key-dlq',
          msg.content,
          { persistent: true }
        );

        return channel.ack(msg);
      }

      let attempts;
      if (msg.properties.headers && msg.properties.headers['x-death']) {
        const deaths = msg.properties.headers['x-death'] as Array<any> || [];
        const mainDeath = deaths.filter(death => death.queue === QUEUE_NAME + '.retry')
        
        // Alguns clientes acumulam múltiplos dead-letter através de diferentes filas/exchanges.
        attempts = mainDeath.reduce((sum, death) => sum + (death.count || 0), 0);
        console.log(`Total de tentativas: ${attempts}`);
      }

      if (attempts >= MAX_ATTEMPTS) {
        logger.error("Upload Service", `Máximo de tentativa alcançado, enviando para DLQ definitiva`);
        channel.publish('pense_aja.dlx', 'routing-key-dlq', msg.content, { persistent: true, });
        return channel.ack(msg);
      }

      logger.info("Upload Service", `Processing new upload.`);
      try {
        if (payload) {
          if (!payload.usuario) {
            logger.error("Upload Service", "Payload must contain a 'usuario' field");
            channel.publish(
              'pense_aja.dlx',
              'routing-key-dlq',
              msg.content,
              { persistent: true }
            );

            return channel.ack(msg);
          }

          // Check process type and call the appropriate service method
          // TODO: Implement additional process types as needed and ensure they are handled correctly
          if (payload.processType === 'product') {
            const newProduct = await PenseAjaService.createProduct(dassOffice, payload, files, payload.usuario);
            
            if (newProduct) {
              logger.info("Upload Service", `Product created successfully: ${newProduct}`);
              channel.ack(msg); // Acknowledge the message after successful processing
            } else {
              logger.error("Upload Service", "Failed to create product");
              channel.nack(msg, false, false); // Requeue the message for retry
            }
          } else {
            logger.error("Upload Service", `Unknown process type: ${payload.processType}`);
            channel.publish(
              'pense_aja.dlx',
              'routing-key-dlq',
              msg.content,
              { persistent: true }
            );
            return channel.ack(msg);
          }
        }
      } catch (error: any) {
        if (attempts >= MAX_ATTEMPTS) {
          logger.error("Upload Service", `Failed to process upload after ${MAX_ATTEMPTS} attempts: ${error.message}`);
          channel.publish('pense_aja.dlx', 'routing-key-dlq', msg.content, { persistent: true });
          return channel.ack(msg);
        }
        channel.nack(msg, false, false);
      }
    }
  })
}