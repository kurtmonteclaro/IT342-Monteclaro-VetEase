package com.example.vetease.core.api

import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.ByteArrayOutputStream
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URLEncoder
import java.net.URL

object VeteaseApi {

    const val API_BASE_URL = "http://10.0.2.2:8080"

    data class ApiResult(
        val success: Boolean,
        val statusCode: Int,
        val body: String
    ) {
        fun jsonObject(): JSONObject = try {
            if (body.isBlank()) JSONObject() else JSONObject(body)
        } catch (_: Exception) {
            JSONObject()
        }

        fun jsonArray(): JSONArray = try {
            if (body.isBlank()) JSONArray() else JSONArray(body)
        } catch (_: Exception) {
            JSONArray()
        }

        fun message(defaultMessage: String = "Request failed. Please try again."): String {
            val parsed = jsonObject()
            return parsed.optString("message")
                .ifBlank { parsed.optString("error") }
                .ifBlank { parsed.optString("details") }
                .ifBlank { defaultMessage }
        }
    }

    fun get(endpoint: String, token: String = ""): ApiResult = request("GET", endpoint, null, token)

    fun post(endpoint: String, payload: JSONObject? = null, token: String = ""): ApiResult =
        request("POST", endpoint, payload, token)

    fun put(endpoint: String, payload: JSONObject, token: String = ""): ApiResult =
        request("PUT", endpoint, payload, token)

    fun delete(endpoint: String, token: String = ""): ApiResult = request("DELETE", endpoint, null, token)

    fun encode(value: String): String = URLEncoder.encode(value, "UTF-8")

    fun uploadPetPhoto(endpoint: String, token: String, fileBytes: ByteArray, fileName: String, mimeType: String): ApiResult {
        val boundary = "VetEaseBoundary${System.currentTimeMillis()}"
        val lineBreak = "\r\n"
        val output = ByteArrayOutputStream()

        output.write("--$boundary$lineBreak".toByteArray())
        output.write("Content-Disposition: form-data; name=\"file\"; filename=\"$fileName\"$lineBreak".toByteArray())
        output.write("Content-Type: $mimeType$lineBreak$lineBreak".toByteArray())
        output.write(fileBytes)
        output.write(lineBreak.toByteArray())
        output.write("--$boundary--$lineBreak".toByteArray())

        val body = output.toByteArray()
        val connection = (URL(API_BASE_URL + endpoint).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 10000
            readTimeout = 10000
            doOutput = true
            setRequestProperty("Accept", "application/json")
            setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")
            setRequestProperty("Content-Length", body.size.toString())
            if (token.isNotBlank()) {
                setRequestProperty("Authorization", "Bearer $token")
            }
        }

        connection.outputStream.use { it.write(body) }
        val statusCode = connection.responseCode
        val success = statusCode in 200..299
        return ApiResult(success, statusCode, readResponse(connection, success))
    }

    private fun request(method: String, endpoint: String, payload: JSONObject?, token: String): ApiResult {
        val connection = (URL(API_BASE_URL + endpoint).openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 10000
            readTimeout = 10000
            setRequestProperty("Accept", "application/json")
            if (token.isNotBlank()) {
                setRequestProperty("Authorization", "Bearer $token")
            }
            if (payload != null) {
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
            }
        }

        if (payload != null) {
            OutputStreamWriter(connection.outputStream).use { writer ->
                writer.write(payload.toString())
                writer.flush()
            }
        }

        val statusCode = connection.responseCode
        val success = statusCode in 200..299
        return ApiResult(success, statusCode, readResponse(connection, success))
    }

    private fun readResponse(connection: HttpURLConnection, success: Boolean): String {
        val stream = if (success) connection.inputStream else connection.errorStream ?: connection.inputStream
        return BufferedReader(InputStreamReader(stream)).use { it.readText() }
    }
}
