package com.example.vetease.features.launch

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import com.example.vetease.R
import com.example.vetease.core.ui.applySystemBarPadding
import com.example.vetease.core.session.SessionManager
import com.example.vetease.features.auth.LoginActivity
import com.example.vetease.features.auth.RegisterActivity
import com.example.vetease.features.home.HomeActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        if (SessionManager(this).isLoggedIn) {
            startActivity(Intent(this, HomeActivity::class.java))
            finish()
            return
        }

        findViewById<android.view.View>(R.id.main).applySystemBarPadding()

        findViewById<Button>(R.id.buttonLogin).setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
        }

        findViewById<Button>(R.id.buttonRegister).setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }
}
