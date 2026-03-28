package com.example.vetease

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity

class HomeActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_NAME = "extra_name"
        const val EXTRA_EMAIL = "extra_email"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_home)

        findViewById<TextView>(R.id.textHomeName).text = intent.getStringExtra(EXTRA_NAME).orEmpty()
        findViewById<TextView>(R.id.textHomeEmail).text = intent.getStringExtra(EXTRA_EMAIL).orEmpty()

        findViewById<Button>(R.id.buttonLogout).setOnClickListener {
            finish()
        }
    }
}
