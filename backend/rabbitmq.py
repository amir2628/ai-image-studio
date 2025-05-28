import aio_pika
import asyncio
from typing import Optional

# Global connection and channel variables
connection: Optional[aio_pika.Connection] = None
channel: Optional[aio_pika.Channel] = None

async def init_rabbitmq():
    """Initialize RabbitMQ connection and channel"""
    global connection, channel
    
    # Connect to RabbitMQ
    # connection = await aio_pika.connect_robust(
    #     "amqp://guest:guest@localhost/"
    # )
    connection = await aio_pika.connect_robust(
        "amqp://guest:guest@rabbitmq/"
    )
    
    # Create channel
    channel = await connection.channel()
    
    # Declare queue
    await channel.declare_queue(
        "sd_controlnet_tasks",
        durable=True
    )
    
    print("RabbitMQ connection established")

async def publish_message(message: str):
    """Publish a message to the queue"""
    if not channel:
        await init_rabbitmq()
        
    await channel.default_exchange.publish(
        aio_pika.Message(
            body=message.encode(),
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT
        ),
        routing_key="sd_controlnet_tasks"
    )

async def close_rabbitmq():
    """Close RabbitMQ connection"""
    global connection, channel
    
    if channel:
        await channel.close()
        channel = None
        
    if connection:
        await connection.close()
        connection = None