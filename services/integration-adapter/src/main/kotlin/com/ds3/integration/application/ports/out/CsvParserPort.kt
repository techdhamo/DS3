package com.ds3.integration.application.ports.out

import java.io.InputStream

interface CsvParserPort {
    fun parse(inputStream: InputStream): List<Map<String, String>>
}
