package com.example.vetease.core.session

import android.content.Context
import org.json.JSONObject

class SessionManager(context: Context) {

    private val preferences = context.getSharedPreferences("vetease_session", Context.MODE_PRIVATE)

    var token: String
        get() = preferences.getString(KEY_TOKEN, "").orEmpty()
        set(value) = preferences.edit().putString(KEY_TOKEN, value).apply()

    var user: JSONObject
        get() = JSONObject(preferences.getString(KEY_USER, "{}").orEmpty())
        set(value) = preferences.edit().putString(KEY_USER, value.toString()).apply()

    val isLoggedIn: Boolean
        get() = token.isNotBlank()

    fun saveAuth(payload: JSONObject) {
        token = payload.optString("accessToken")
        user = payload.optJSONObject("user") ?: JSONObject()
    }

    fun clear() {
        preferences.edit().clear().apply()
    }

    companion object {
        private const val KEY_TOKEN = "token"
        private const val KEY_USER = "user"
    }
}
