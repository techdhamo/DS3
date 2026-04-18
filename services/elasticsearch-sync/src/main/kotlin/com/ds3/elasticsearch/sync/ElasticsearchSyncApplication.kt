package com.ds3.elasticsearch.sync

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class ElasticsearchSyncApplication

fun main(args: Array<String>) {
    runApplication<ElasticsearchSyncApplication>(*args)
}
