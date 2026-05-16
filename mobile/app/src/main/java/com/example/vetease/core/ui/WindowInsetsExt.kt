package com.example.vetease.core.ui

import android.view.View
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding

fun View.applySystemBarPadding(extraBottom: Int = 0) {
    ViewCompat.setOnApplyWindowInsetsListener(this) { view, insets ->
        val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
        view.updatePadding(
            left = bars.left,
            top = bars.top,
            right = bars.right,
            bottom = bars.bottom + extraBottom,
        )
        insets
    }
    ViewCompat.requestApplyInsets(this)
}
