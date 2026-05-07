package com.example.vetease.core.api

import org.junit.Assert.assertEquals
import org.junit.Test

class VeteaseApiTest {

    @Test
    fun encodeEscapesQueryParameters() {
        assertEquals("May+8%2C+2026+09%3A30", VeteaseApi.encode("May 8, 2026 09:30"))
    }
}
