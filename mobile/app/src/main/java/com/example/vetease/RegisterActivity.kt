package com.example.vetease

import android.content.Intent
import android.os.Bundle
import android.util.Patterns
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import org.json.JSONObject
import kotlin.concurrent.thread

class RegisterActivity : AppCompatActivity() {

    private lateinit var textMessage: TextView
    private lateinit var editName: EditText
    private lateinit var editEmail: EditText
    private lateinit var editPassword: EditText
    private lateinit var buttonSubmit: Button
    private lateinit var progressBar: ProgressBar
    private lateinit var textSwitch: TextView
    private lateinit var buttonBackHome: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_register)

        textMessage = findViewById(R.id.textMessage)
        editName = findViewById(R.id.editName)
        editEmail = findViewById(R.id.editEmail)
        editPassword = findViewById(R.id.editPassword)
        buttonSubmit = findViewById(R.id.buttonSubmit)
        progressBar = findViewById(R.id.progressBar)
        textSwitch = findViewById(R.id.textSwitchLogin)
        buttonBackHome = findViewById(R.id.textBackHome)

        buttonSubmit.setOnClickListener {
            clearMessage()
            submitRegister()
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
        val name = editName.text.toString().trim()
        val email = editEmail.text.toString().trim()
        val password = editPassword.text.toString()

        when {
            name.isBlank() -> showError(getString(R.string.invalid_name))
            !Patterns.EMAIL_ADDRESS.matcher(email).matches() -> showError(getString(R.string.invalid_email))
            password.length < 8 -> showError(getString(R.string.invalid_password))
            else -> {
                val payload = JSONObject().apply {
                    put("name", name)
                    put("email", email)
                    put("password", password)
                }

                setLoading(true)
                thread {
                    try {
                        val result = AuthApi.post("/api/auth/register", payload)
                        runOnUiThread {
                            setLoading(false)
                            if (result.success) {
                                showSuccess(result.payload.optString("message", getString(R.string.register_success)))
                                editName.text?.clear()
                                editEmail.text?.clear()
                                editPassword.text?.clear()
                            } else {
                                showError(result.payload.optString("message", getString(R.string.request_failed)))
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
        textSwitch.isEnabled = !loading
        buttonBackHome.isEnabled = !loading
        buttonSubmit.text = getString(if (loading) R.string.creating_account else R.string.create_account)
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
