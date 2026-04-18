package com.ds3.integration.infrastructure.adapter

import com.ds3.integration.application.ports.out.KafkaPublisherPort
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Component

@Component
class KafkaPublisherAdapter(
    private val kafkaTemplate: KafkaTemplate<String, String>,
    private val objectMapper: ObjectMapper
) : KafkaPublisherPort {
    
    override fun publish(topic: String, key: String, data: Any) {
        val json = objectMapper.writeValueAsString(data)
        kafkaTemplate.send(topic, key, json)
    }
}
