package com.example.vetease

import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

object AuthApi {

    private const val API_BASE_URL = "http://10.0.2.2:8080"

    data class AuthResult(
        val success: Boolean,
        val payload: JSONObject
    )

    fun post(endpoint: String, payload: JSONObject): AuthResult {
        val connection = (URL(API_BASE_URL + endpoint).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 10000
            readTimeout = 10000
            doOutput = true
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Accept", "application/json")
        }

        OutputStreamWriter(connection.outputStream).use { writer ->
            writer.write(payload.toString())
            writer.flush()
        }

        val success = connection.responseCode in 200..299
        val responseText = readResponse(connection, success)

        return AuthResult(success, parseJson(responseText))
    }

    private fun readResponse(connection: HttpURLConnection, success: Boolean): String {
        val stream = if (success) connection.inputStream else connection.errorStream
        if (stream == null) {
            return ""
        }

        return BufferedReader(InputStreamReader(stream)).use { reader ->
            reader.readText()
        }
    }

    private fun parseJson(raw: String): JSONObject {
        return try {
            if (raw.isBlank()) JSONObject() else JSONObject(raw)
        } catch (_: Exception) {
            JSONObject()
        }
    }
}
