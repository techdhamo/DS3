package com.ds3.integration.infrastructure.adapter

import com.ds3.integration.application.ports.out.CsvParserPort
import com.opencsv.CSVReader
import org.springframework.stereotype.Component
import java.io.InputStream

@Component
class OpenCsvParserAdapter : CsvParserPort {
    
    override fun parse(inputStream: InputStream): List<Map<String, String>> {
        val reader = CSVReader(inputStream.bufferedReader())
        val headers = reader.readNext()
        val result = mutableListOf<Map<String, String>>()
        
        var row: Array<String>?
        while (reader.readNext().also { row = it } != null) {
            val map = mutableMapOf<String, String>()
            headers.forEachIndexed { index, header ->
                map[header] = row?.getOrNull(index) ?: ""
            }
            result.add(map)
        }
        
        reader.close()
        return result
    }
}
