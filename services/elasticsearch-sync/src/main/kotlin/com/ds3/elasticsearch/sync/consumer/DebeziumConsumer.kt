package com.ds3.elasticsearch.sync.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.stereotype.Component

@Component
class DebeziumConsumer(
    private val objectMapper: ObjectMapper,
    private val elasticsearchIndexer: ElasticsearchIndexer
) {
    
    @KafkaListener(
        topics = ["ds3-ucp.public.global_products"],
        groupId = "elasticsearch-sync-group"
    )
    fun handleProductChange(message: String) {
        val event = objectMapper.readValue(message, DebeziumEvent::class.java)
        
        when (event.op) {
            "c", "u" -> elasticsearchIndexer.indexProduct(event.after)
            "d" -> elasticsearchIndexer.deleteProduct(event.before?.id)
        }
    }
}

data class DebeziumEvent(
    val op: String,
    val before: Map<String, Any>?,
    val after: Map<String, Any>?,
    val ts_ms: Long
)
