package com.example.vetease

import android.content.Intent
import android.os.Bundle
import android.util.Patterns
import android.view.View
import android.widget.Button
import android.widget.CheckBox
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
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import org.json.JSONObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlin.concurrent.thread

class RegisterActivity : AppCompatActivity() {

    private lateinit var textMessage: TextView
    private lateinit var editUsername: EditText
    private lateinit var editName: EditText
    private lateinit var editEmail: EditText
    private lateinit var editPassword: EditText
    private lateinit var buttonSubmit: Button
    private lateinit var buttonGoogle: Button
    private lateinit var progressBar: ProgressBar
    private lateinit var checkAdmin: CheckBox
    private lateinit var textSwitch: TextView
    private lateinit var buttonBackHome: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_register)

        textMessage = findViewById(R.id.textMessage)
        editUsername = findViewById(R.id.editUsername)
        editName = findViewById(R.id.editName)
        editEmail = findViewById(R.id.editEmail)
        editPassword = findViewById(R.id.editPassword)
        buttonSubmit = findViewById(R.id.buttonSubmit)
        buttonGoogle = findViewById(R.id.buttonGoogle)
        progressBar = findViewById(R.id.progressBar)
        checkAdmin = findViewById(R.id.checkAdmin)
        textSwitch = findViewById(R.id.textSwitchLogin)
        buttonBackHome = findViewById(R.id.textBackHome)

        buttonSubmit.setOnClickListener {
            clearMessage()
            submitRegister()
        }
        buttonGoogle.setOnClickListener {
            clearMessage()
            submitGoogleLogin()
        }

        textSwitch.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        buttonBackHome.setOnClickListener {
            finish()
        }
    }

    private fun submitRegister() {
        val username = editUsername.text.toString().trim().lowercase()
        val name = editName.text.toString().trim()
        val email = editEmail.text.toString().trim()
        val password = editPassword.text.toString()
        val nameParts = name.split(Regex("\\s+"), limit = 2)
        val firstName = nameParts.firstOrNull().orEmpty()
        val lastName = nameParts.getOrNull(1).orEmpty().ifBlank { "User" }

        when {
            username.length < 3 -> showError("Username must be at least 3 characters.")
            name.isBlank() -> showError(getString(R.string.invalid_name))
            !Patterns.EMAIL_ADDRESS.matcher(email).matches() -> showError(getString(R.string.invalid_email))
            password.length < 8 -> showError(getString(R.string.invalid_password))
            else -> {
                val payload = JSONObject().apply {
                    put("username", username)
                    put("email", email)
                    put("password", password)
                    put("firstName", firstName)
                    put("lastName", lastName)
                    put("role", if (checkAdmin.isChecked) "ADMIN" else "CLIENT")
                }

                setLoading(true)
                thread {
                    try {
                        val result = VeteaseApi.post("/api/auth/register", payload)
                        runOnUiThread {
                            setLoading(false)
                            if (result.success) {
                                SessionManager(this).saveAuth(result.jsonObject())
                                startActivity(Intent(this, HomeActivity::class.java))
                                finish()
                                editUsername.text?.clear()
                                editName.text?.clear()
                                editEmail.text?.clear()
                                editPassword.text?.clear()
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
        checkAdmin.isEnabled = !loading
        buttonSubmit.text = getString(if (loading) R.string.creating_account else R.string.create_account)
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
                val credentialManager = CredentialManager.create(this@RegisterActivity)
                val googleOption = GetSignInWithGoogleOption.Builder(webClientId).build()
                val request = GetCredentialRequest.Builder()
                    .addCredentialOption(googleOption)
                    .build()
                val result = credentialManager.getCredential(
                    request = request,
                    context = this@RegisterActivity,
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
                    SessionManager(this@RegisterActivity).saveAuth(apiResult.jsonObject())
                    startActivity(Intent(this@RegisterActivity, HomeActivity::class.java))
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

    private fun showSuccess(message: String) {
        textMessage.visibility = View.VISIBLE
        textMessage.text = message
        textMessage.background = ContextCompat.getDrawable(this, R.drawable.bg_message_success)
        textMessage.setTextColor(ContextCompat.getColor(this, R.color.vetease_success))
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
