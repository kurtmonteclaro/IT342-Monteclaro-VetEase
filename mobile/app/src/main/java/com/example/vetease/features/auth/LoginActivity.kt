package com.example.vetease.features.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import androidx.lifecycle.lifecycleScope
import com.example.vetease.R
import com.example.vetease.core.api.VeteaseApi
import com.example.vetease.core.session.SessionManager
import com.example.vetease.features.home.HomeActivity
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import org.json.JSONObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlin.concurrent.thread

class LoginActivity : AppCompatActivity() {

    private lateinit var textMessage: TextView
    private lateinit var editUsername: EditText
    private lateinit var editPassword: EditText
    private lateinit var buttonSubmit: Button
    private lateinit var buttonGoogle: Button
    private lateinit var progressBar: ProgressBar
    private lateinit var textSwitch: TextView
    private lateinit var buttonBackHome: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_login)

        textMessage = findViewById(R.id.textMessage)
        editUsername = findViewById(R.id.editEmail)
        editPassword = findViewById(R.id.editPassword)
        buttonSubmit = findViewById(R.id.buttonSubmit)
        buttonGoogle = findViewById(R.id.buttonGoogle)
        progressBar = findViewById(R.id.progressBar)
        textSwitch = findViewById(R.id.textSwitchRegister)
        buttonBackHome = findViewById(R.id.textBackHome)

        buttonSubmit.setOnClickListener {
            clearMessage()
            submitLogin()
        }
        buttonGoogle.setOnClickListener {
            clearMessage()
            submitGoogleLogin()
        }

        textSwitch.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        buttonBackHome.setOnClickListener {
            finish()
        }
    }

    private fun submitLogin() {
        val username = editUsername.text.toString().trim()
        val password = editPassword.text.toString()

        when {
            username.isBlank() -> showError("Please enter your username.")
            password.isBlank() -> showError(getString(R.string.invalid_login_password))
            else -> {
                val payload = JSONObject().apply {
                    put("username", username)
                    put("password", password)
                }

                setLoading(true)
                thread {
                    try {
                        val result = VeteaseApi.post("/api/auth/login", payload)
                        runOnUiThread {
                            setLoading(false)
                            if (result.success) {
                                val sessionManager = SessionManager(this)
                                val response = result.jsonObject()
                                val user = response.optJSONObject("user") ?: JSONObject()
                                sessionManager.saveAuth(response)
                                val intent = Intent(this, HomeActivity::class.java).apply {
                                    putExtra(HomeActivity.EXTRA_NAME, "${user.optString("firstName")} ${user.optString("lastName")}".trim())
                                    putExtra(HomeActivity.EXTRA_EMAIL, user.optString("email"))
                                }
                                startActivity(intent)
                                finish()
                            } else {
                                showError(result.message(getString(R.string.request_failed)))
                            }
                        }
                    } catch (_: Exception) {
                        runOnUiThread {
                            setLoading(false)
                            showError(getString(R.string.request_failed))
                        }
                    }
                }
            }
        }
    }

    private fun setLoading(loading: Boolean) {
        progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        buttonSubmit.isEnabled = !loading
        buttonGoogle.isEnabled = !loading
        textSwitch.isEnabled = !loading
        buttonBackHome.isEnabled = !loading
        buttonSubmit.text = getString(if (loading) R.string.signing_in else R.string.login_to_vetease)
    }

    private fun submitGoogleLogin() {
        val webClientId = getString(R.string.google_web_client_id)
        if (webClientId.startsWith("YOUR_")) {
            showError("Set google_web_client_id in strings.xml first.")
            return
        }

        setLoading(true)
        lifecycleScope.launch {
            try {
                val credentialManager = CredentialManager.create(this@LoginActivity)
                val googleOption = GetSignInWithGoogleOption.Builder(webClientId).build()
                val request = GetCredentialRequest.Builder()
                    .addCredentialOption(googleOption)
                    .build()
                val result = credentialManager.getCredential(
                    request = request,
                    context = this@LoginActivity,
                )
                val credential = result.credential
                if (credential !is CustomCredential || credential.type != GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                    showError("Google did not return a valid ID token.")
                    setLoading(false)
                    return@launch
                }
                val googleCredential = GoogleIdTokenCredential.createFrom(credential.data)
                val apiResult = withContext(Dispatchers.IO) {
                    VeteaseApi.post("/api/auth/oauth/google", JSONObject().put("idToken", googleCredential.idToken))
                }
                setLoading(false)
                if (apiResult.success) {
                    SessionManager(this@LoginActivity).saveAuth(apiResult.jsonObject())
                    startActivity(Intent(this@LoginActivity, HomeActivity::class.java))
                    finish()
                } else {
                    showError(apiResult.message(getString(R.string.request_failed)))
                }
            } catch (_: GetCredentialException) {
                setLoading(false)
                showError("Google sign-in was cancelled or unavailable.")
            } catch (_: Exception) {
                setLoading(false)
                showError(getString(R.string.request_failed))
            }
        }
    }

    private fun showError(message: String) {
        textMessage.visibility = View.VISIBLE
        textMessage.text = message
        textMessage.background = ContextCompat.getDrawable(this, R.drawable.bg_message_error)
        textMessage.setTextColor(ContextCompat.getColor(this, R.color.vetease_error))
    }

    private fun clearMessage() {
        textMessage.visibility = View.GONE
        textMessage.text = ""
    }
}
