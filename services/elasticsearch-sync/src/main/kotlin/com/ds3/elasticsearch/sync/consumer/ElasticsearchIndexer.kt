package com.ds3.elasticsearch.sync.consumer

import co.elastic.clients.elasticsearch.ElasticsearchClient
import co.elastic.clients.elasticsearch.core.IndexRequest
import co.elastic.clients.elasticsearch.core.DeleteRequest
import org.springframework.stereotype.Component

@Component
class ElasticsearchIndexer(
    private val elasticsearchClient: ElasticsearchClient
) {
    
    private val indexName = "products"
    
    fun indexProduct(data: Map<String, Any>?) {
        if (data == null) return
        
        val id = data["id"]?.toString() ?: return
        
        val request = IndexRequest.of<Map<String, Any>> { i ->
            i.index(indexName)
            i.id(id)
            i.document(data)
        }
        
        elasticsearchClient.index(request)
    }
    
    fun deleteProduct(id: String?) {
        if (id == null) return
        
        val request = DeleteRequest.of { d ->
            d.index(indexName)
            d.id(id)
        }
        
        elasticsearchClient.delete(request)
    }
}
