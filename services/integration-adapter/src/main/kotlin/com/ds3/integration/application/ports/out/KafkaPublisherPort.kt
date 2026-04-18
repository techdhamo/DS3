package com.ds3.integration.application.ports.out

interface KafkaPublisherPort {
    fun publish(topic: String, key: String, data: Any)
}
