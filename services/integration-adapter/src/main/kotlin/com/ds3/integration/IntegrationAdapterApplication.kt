package com.ds3.integration

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class IntegrationAdapterApplication

fun main(args: Array<String>) {
    runApplication<IntegrationAdapterApplication>(*args)
}
