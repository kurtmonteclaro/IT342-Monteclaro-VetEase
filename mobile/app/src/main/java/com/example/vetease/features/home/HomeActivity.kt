package com.example.vetease.features.home

import android.app.DatePickerDialog
import android.content.Intent
import android.graphics.BitmapFactory
import android.graphics.Typeface
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.Spinner
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.example.vetease.R
import com.example.vetease.core.api.VeteaseApi
import com.example.vetease.core.session.SessionManager
import com.example.vetease.features.auth.LoginActivity
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDate
import java.util.Calendar
import java.net.URL
import kotlin.concurrent.thread

class HomeActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_NAME = "extra_name"
        const val EXTRA_EMAIL = "extra_email"
    }

    private lateinit var sessionManager: SessionManager
    private lateinit var root: LinearLayout
    private lateinit var messageView: TextView
    private lateinit var content: LinearLayout

    private var services = JSONArray()
    private var pets = JSONArray()
    private var appointments = JSONArray()
    private var dogBreeds = JSONArray()
    private var pendingAppointments = JSONArray()
    private var todayAppointments = JSONArray()
    private var blockedDates = JSONArray()
    private var activeView = "dashboard"
    private var selectedPetPhotoUri: Uri? = null
    private var petPhotoPreview: ImageView? = null

    private val petPhotoPicker = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        selectedPetPhotoUri = uri
        petPhotoPreview?.let { preview ->
            if (uri == null) {
                preview.setImageDrawable(null)
            } else {
                preview.setImageURI(uri)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        sessionManager = SessionManager(this)

        if (!sessionManager.isLoggedIn) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        buildShell()
        loadWorkspace()
    }

    private fun buildShell() {
        val scrollView = ScrollView(this).apply {
            setBackgroundResource(R.drawable.bg_page)
            isFillViewport = true
        }
        root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(18), dp(22), dp(18), dp(28))
        }
        scrollView.addView(root)
        setContentView(scrollView)

        val user = sessionManager.user
        root.addView(card().apply {
            addView(kicker(if (isAdmin()) "Clinic Ops" else "Client Portal"))
            addView(title("VetEase Mobile"))
            addView(body("${user.optString("firstName")} ${user.optString("lastName")}".trim().ifBlank { user.optString("username") }))
            addView(body(user.optString("email")))
            addView(navRow())
            addView(primaryButton("Refresh") { loadWorkspace() })
            addView(secondaryButton("Logout") {
                sessionManager.clear()
                startActivity(Intent(this@HomeActivity, LoginActivity::class.java))
                finish()
            })
        })

        messageView = TextView(this).apply {
            visibility = View.GONE
            setPadding(dp(14), dp(12), dp(14), dp(12))
            textSize = 14f
        }
        root.addView(messageView)

        content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
        }
        root.addView(content)
    }

    private fun navRow(): LinearLayout {
        val views = if (isAdmin()) {
            listOf("dashboard" to "Dashboard", "admin" to "Admin")
        } else {
            listOf(
                "dashboard" to "Dashboard",
                "pets" to "Pets",
                "services" to "Services",
                "book" to "Book",
                "appointments" to "Appointments"
            )
        }

        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(0, dp(12), 0, 0)
            views.chunked(2).forEach { rowItems ->
                addView(LinearLayout(this@HomeActivity).apply {
                    orientation = LinearLayout.HORIZONTAL
                    rowItems.forEach { (key, label) ->
                        addView(secondaryButton(label) {
                            activeView = key
                            renderActiveView()
                        }, LinearLayout.LayoutParams(0, dp(48), 1f).apply {
                            setMargins(dp(3), dp(3), dp(3), dp(3))
                        })
                    }
                })
            }
        }
    }

    private fun loadWorkspace() {
        clearMessage()
        content.removeAllViews()
        content.addView(body("Loading workspace..."))

        thread {
            try {
                services = VeteaseApi.get("/api/services").jsonArray()
                dogBreeds = VeteaseApi.get("/api/external/dog-breeds").jsonArray()

                if (isAdmin()) {
                    pendingAppointments = authedGet("/api/admin/appointments/pending").jsonArray()
                    todayAppointments = authedGet("/api/admin/appointments/today").jsonArray()
                    blockedDates = authedGet("/api/admin/blocked-dates").jsonArray()
                } else {
                    pets = authedGet("/api/pets").jsonArray()
                    appointments = authedGet("/api/appointments/mine").jsonArray()
                }

                runOnUiThread { renderActiveView() }
            } catch (_: Exception) {
                runOnUiThread {
                    showError("Could not reach the backend at ${VeteaseApi.API_BASE_URL}.")
                    renderActiveView()
                }
            }
        }
    }

    private fun renderActiveView() {
        content.removeAllViews()
        when (activeView) {
            "pets" -> renderPets()
            "services" -> renderServices()
            "book" -> renderBooking()
            "appointments" -> renderAppointments()
            "admin" -> renderAdmin()
            else -> renderDashboard()
        }
    }

    private fun renderDashboard() {
        content.addView(card().apply {
            addView(kicker("Workspace"))
            addView(title(if (isAdmin()) "Clinic Overview" else "Clinic Access Granted"))
            addView(body(if (isAdmin()) "Pending: ${pendingAppointments.length()} | Today: ${todayAppointments.length()}" else "Pets: ${pets.length()} | Appointments: ${appointments.length()}"))
        })

        if (!isAdmin()) {
            val next = findNextAppointment()
            content.addView(card().apply {
                addView(kicker("Next Appointment"))
                if (next == null) {
                    addView(body("No upcoming appointment yet."))
                    addView(primaryButton("Book Appointment") {
                        activeView = "book"
                        renderActiveView()
                    })
                } else {
                    addView(title(next.optJSONObject("service")?.optString("name").orEmpty()))
                    addView(body("${next.optJSONObject("pet")?.optString("name")} | ${next.optString("date")} ${timeLabel(next.optString("time"))}"))
                    addView(status(next.optString("status")))
                }
            })
        }
    }

    private fun renderPets() {
        selectedPetPhotoUri = null
        petPhotoPreview = null
        content.addView(card().apply {
            addView(kicker("Pet Profiles"))
            addView(title("Add a pet"))
            val photoPreview = petPhotoPreviewView()
            petPhotoPreview = photoPreview
            addView(photoUploadRow(photoPreview))
            val name = input("Name")
            val species = input("Species", "Dog")
            val breed = input("Breed", firstArrayValue(dogBreeds))
            val age = input("Age")
            val notes = input("Notes")
            val vaccine = input("Vaccine history")
            addView(name)
            addView(species)
            addView(breed)
            addView(age)
            addView(notes)
            addView(vaccine)
            addView(primaryButton("Save Pet") {
                val payload = JSONObject().apply {
                    put("name", name.text.toString().trim())
                    put("species", species.text.toString().trim())
                    put("breed", breed.text.toString().trim())
                    put("age", age.text.toString().trim().toIntOrNull())
                    put("notes", notes.text.toString().trim())
                    put("vaccineHistory", vaccine.text.toString().trim())
                }
                runMutation("Pet profile added.") {
                    val createResult = VeteaseApi.post("/api/pets", payload, sessionManager.token)
                    if (createResult.success && selectedPetPhotoUri != null) {
                        val petId = createResult.jsonObject().optLong("id")
                        if (petId > 0) {
                            uploadSelectedPetPhoto(petId)
                        } else {
                            createResult
                        }
                    } else {
                        createResult
                    }
                }
            })
        })

        content.addView(card().apply {
            addView(kicker("Your Pets"))
            if (pets.length() == 0) {
                addView(body("No pet profiles yet."))
            }
            forEach(pets) { pet ->
                addView(petCard(pet))
            }
        })
    }

    private fun uploadSelectedPetPhoto(petId: Long): VeteaseApi.ApiResult {
        val uri = selectedPetPhotoUri ?: return VeteaseApi.ApiResult(true, 204, "")
        val mimeType = contentResolver.getType(uri) ?: "image/jpeg"
        val extension = when (mimeType) {
            "image/png" -> "png"
            "image/webp" -> "webp"
            else -> "jpg"
        }
        val bytes = contentResolver.openInputStream(uri)?.use { it.readBytes() }
            ?: return VeteaseApi.ApiResult(false, 0, "")
        return VeteaseApi.uploadPetPhoto(
            "/api/pets/$petId/upload-photo",
            sessionManager.token,
            bytes,
            "pet-$petId.$extension",
            mimeType
        )
    }

    private fun renderServices() {
        content.addView(card().apply {
            addView(kicker("Clinic Services"))
            if (services.length() == 0) {
                addView(body("No active services found."))
            }
            forEach(services) { service ->
                addView(item(service.optString("name"), "${service.optString("description")} | ${service.optInt("durationMinutes")} min"))
            }
        })
    }

    private fun renderBooking() {
        content.addView(card().apply {
            addView(kicker("New Booking"))
            addView(title("Request a clinic visit"))

            if (pets.length() == 0 || services.length() == 0) {
                addView(body("Add a pet and make sure services are loaded before booking."))
                return@apply
            }

            val petSpinner = spinner(pets, "name")
            val serviceSpinner = spinner(services, "name")
            val date = input("Date", LocalDate.now().toString())
            val notes = input("Notes")
            val slotsPanel = LinearLayout(this@HomeActivity).apply { orientation = LinearLayout.VERTICAL }
            addView(label("Pet"))
            addView(petSpinner)
            addView(label("Service"))
            addView(serviceSpinner)
            addView(date)
            addView(secondaryButton("Pick Date") { showDatePicker(date) })
            addView(notes)
            addView(primaryButton("Load Available Slots") {
                slotsPanel.removeAllViews()
                val selectedService = spinnerJson(services, serviceSpinner.selectedItemPosition)
                loadSlots(date.text.toString(), selectedService.optLong("id"), slotsPanel) { slot ->
                    val selectedPet = spinnerJson(pets, petSpinner.selectedItemPosition)
                    val payload = JSONObject().apply {
                        put("petId", selectedPet.optLong("id"))
                        put("serviceId", selectedService.optLong("id"))
                        put("date", date.text.toString())
                        put("time", slot)
                        put("notes", notes.text.toString())
                    }
                    runMutation("Appointment request submitted.") { VeteaseApi.post("/api/appointments", payload, sessionManager.token) }
                }
            })
            addView(slotsPanel)
        })
    }

    private fun renderAppointments() {
        content.addView(card().apply {
            addView(kicker("My Appointments"))
            if (appointments.length() == 0) {
                addView(body("No appointments yet."))
            }
            forEach(appointments) { appointment ->
                val closed = appointment.optString("status") in listOf("COMPLETED", "CANCELLED")
                addView(item(
                    "${appointment.optJSONObject("service")?.optString("name")} - ${appointment.optJSONObject("pet")?.optString("name")}",
                    "${appointment.optString("date")} ${timeLabel(appointment.optString("time"))} | ${appointment.optString("status")}"
                ))
                if (!closed) {
                    val date = input("New date", appointment.optString("date"))
                    val slotsPanel = LinearLayout(this@HomeActivity).apply { orientation = LinearLayout.VERTICAL }
                    addView(date)
                    addView(secondaryButton("Pick New Date") { showDatePicker(date) })
                    addView(secondaryButton("Find Reschedule Slots") {
                        slotsPanel.removeAllViews()
                        loadSlots(date.text.toString(), appointment.optJSONObject("service")?.optLong("id") ?: 0L, slotsPanel) { slot ->
                            val endpoint = "/api/appointments/${appointment.optLong("id")}/reschedule?date=${VeteaseApi.encode(date.text.toString())}&time=${VeteaseApi.encode(slot)}"
                            runMutation("Appointment rescheduled.") { VeteaseApi.post(endpoint, token = sessionManager.token) }
                        }
                    })
                    addView(slotsPanel)
                    addView(secondaryButton("Cancel Appointment") {
                        runMutation("Appointment cancelled.") { VeteaseApi.post("/api/appointments/${appointment.optLong("id")}/cancel", token = sessionManager.token) }
                    })
                }
            }
        })
    }

    private fun renderAdmin() {
        content.addView(card().apply {
            addView(kicker("Pending Bookings"))
            if (pendingAppointments.length() == 0) {
                addView(body("No pending requests."))
            }
            forEach(pendingAppointments) { appointment ->
                addView(item(
                    appointment.optJSONObject("service")?.optString("name").orEmpty(),
                    "${appointment.optString("date")} ${timeLabel(appointment.optString("time"))} | ${appointment.optJSONObject("pet")?.optString("name")}"
                ))
                addView(primaryButton("Confirm") {
                    runMutation("Appointment confirmed.") { VeteaseApi.post("/api/admin/appointments/${appointment.optLong("id")}/confirm", token = sessionManager.token) }
                })
                addView(secondaryButton("Cancel") {
                    runMutation("Appointment cancelled.") { VeteaseApi.post("/api/admin/appointments/${appointment.optLong("id")}/cancel", token = sessionManager.token) }
                })
            }
        })

        content.addView(card().apply {
            addView(kicker("Today"))
            if (todayAppointments.length() == 0) {
                addView(body("No appointments for today."))
            }
            forEach(todayAppointments) { appointment ->
                addView(item(
                    appointment.optJSONObject("service")?.optString("name").orEmpty(),
                    "${timeLabel(appointment.optString("time"))} | ${appointment.optString("status")}"
                ))
                if (appointment.optString("status") == "CONFIRMED") {
                    addView(primaryButton("Complete") {
                        runMutation("Appointment completed.") { VeteaseApi.post("/api/admin/appointments/${appointment.optLong("id")}/complete", token = sessionManager.token) }
                    })
                }
            }
        })

        content.addView(card().apply {
            addView(kicker("Blocked Dates"))
            val date = input("Date", LocalDate.now().toString())
            addView(date)
            addView(secondaryButton("Pick Date") { showDatePicker(date) })
            addView(primaryButton("Block Date") {
                runMutation("Blocked date added.") { VeteaseApi.post("/api/admin/blocked-dates?date=${VeteaseApi.encode(date.text.toString())}", token = sessionManager.token) }
            })
            forEach(blockedDates) { blockedDate ->
                addView(item(blockedDate.optString("date"), "Clinic closed for online booking"))
                addView(secondaryButton("Remove") {
                    runMutation("Blocked date removed.") { VeteaseApi.delete("/api/admin/blocked-dates/${blockedDate.optLong("id")}", sessionManager.token) }
                })
            }
        })
    }

    private fun loadSlots(date: String, serviceId: Long, panel: LinearLayout, onSlot: (String) -> Unit) {
        panel.addView(body("Loading available slots..."))
        thread {
            val result = VeteaseApi.get("/api/availability?date=${VeteaseApi.encode(date)}&serviceId=$serviceId")
            val slots = result.jsonArray()
            runOnUiThread {
                panel.removeAllViews()
                if (!result.success || slots.length() == 0) {
                    panel.addView(body("No available slots for this date."))
                    return@runOnUiThread
                }
                forEachValue(slots) { slot ->
                    panel.addView(primaryButton(timeLabel(slot.toString())) { onSlot(slot.toString()) })
                }
            }
        }
    }

    private fun runMutation(successMessage: String, call: () -> VeteaseApi.ApiResult) {
        clearMessage()
        thread {
            val result = try {
                call()
            } catch (_: Exception) {
                VeteaseApi.ApiResult(false, 0, "")
            }
            runOnUiThread {
                if (result.success) {
                    showSuccess(successMessage)
                    loadWorkspace()
                } else {
                    showError(result.message())
                }
            }
        }
    }

    private fun authedGet(endpoint: String): VeteaseApi.ApiResult = VeteaseApi.get(endpoint, sessionManager.token)

    private fun isAdmin(): Boolean = sessionManager.user.optString("role") == "ADMIN"

    private fun findNextAppointment(): JSONObject? {
        for (index in 0 until appointments.length()) {
            val appointment = appointments.optJSONObject(index) ?: JSONObject()
            if (appointment.optString("status") in listOf("PENDING", "CONFIRMED")) {
                return appointment
            }
        }
        return null
    }

    private fun forEach(array: JSONArray, block: (JSONObject) -> Unit) {
        for (index in 0 until array.length()) {
            block(array.optJSONObject(index) ?: JSONObject())
        }
    }

    private fun forEachValue(array: JSONArray, block: (Any) -> Unit) {
        for (index in 0 until array.length()) {
            block(array.opt(index))
        }
    }

    private fun spinner(array: JSONArray, labelKey: String): Spinner {
        val labels = mutableListOf<String>()
        forEach(array) { item -> labels.add(item.optString(labelKey)) }
        return Spinner(this).apply {
            adapter = ArrayAdapter(this@HomeActivity, android.R.layout.simple_spinner_dropdown_item, labels)
            setPadding(0, dp(6), 0, dp(10))
        }
    }

    private fun spinnerJson(array: JSONArray, position: Int): JSONObject = array.optJSONObject(position) ?: JSONObject()

    private fun firstArrayValue(array: JSONArray): String = if (array.length() > 0) array.optString(0) else ""

    private fun showDatePicker(target: EditText) {
        val now = Calendar.getInstance()
        DatePickerDialog(this, { _, year, month, day ->
            target.setText("%04d-%02d-%02d".format(year, month + 1, day))
        }, now.get(Calendar.YEAR), now.get(Calendar.MONTH), now.get(Calendar.DAY_OF_MONTH)).show()
    }

    private fun card(): LinearLayout = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL
        setPadding(dp(18), dp(18), dp(18), dp(18))
        setBackgroundResource(R.drawable.bg_auth_card)
        layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
            setMargins(0, 0, 0, dp(14))
        }
    }

    private fun kicker(textValue: String): TextView = TextView(this).apply {
        text = textValue.uppercase()
        setTextColor(ContextCompat.getColor(this@HomeActivity, R.color.vetease_text_secondary))
        textSize = 11f
        typeface = Typeface.DEFAULT_BOLD
    }

    private fun title(textValue: String): TextView = TextView(this).apply {
        text = textValue
        setTextColor(ContextCompat.getColor(this@HomeActivity, R.color.vetease_text_primary))
        textSize = 24f
        typeface = Typeface.DEFAULT_BOLD
        setPadding(0, dp(6), 0, dp(6))
    }

    private fun body(textValue: String): TextView = TextView(this).apply {
        text = textValue
        setTextColor(ContextCompat.getColor(this@HomeActivity, R.color.vetease_text_secondary))
        textSize = 14f
        setPadding(0, dp(4), 0, dp(8))
    }

    private fun status(textValue: String): TextView = body(textValue).apply {
        typeface = Typeface.DEFAULT_BOLD
        setTextColor(ContextCompat.getColor(this@HomeActivity, R.color.vetease_mid))
    }

    private fun label(textValue: String): TextView = body(textValue).apply {
        typeface = Typeface.DEFAULT_BOLD
        setTextColor(ContextCompat.getColor(this@HomeActivity, R.color.vetease_text_primary))
    }

    private fun item(titleValue: String, detail: String): LinearLayout = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL
        setPadding(0, dp(12), 0, dp(12))
        addView(label(titleValue))
        addView(body(detail))
    }

    private fun photoUploadRow(preview: ImageView): LinearLayout = LinearLayout(this).apply {
        orientation = LinearLayout.HORIZONTAL
        setPadding(0, dp(8), 0, dp(10))
        addView(preview)
        addView(LinearLayout(this@HomeActivity).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), 0, 0, 0)
            addView(label("Photo"))
            addView(secondaryButton("Choose Photo") { petPhotoPicker.launch("image/*") })
            addView(secondaryButton("Remove Photo") {
                selectedPetPhotoUri = null
                preview.setImageDrawable(null)
            })
        }, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
    }

    private fun petPhotoPreviewView(): ImageView = ImageView(this).apply {
        setBackgroundResource(R.drawable.bg_input)
        scaleType = ImageView.ScaleType.CENTER_CROP
        layoutParams = LinearLayout.LayoutParams(dp(82), dp(82))
        contentDescription = "Pet photo preview"
    }

    private fun petCard(pet: JSONObject): LinearLayout = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL
        setPadding(0, dp(12), 0, dp(12))

        addView(LinearLayout(this@HomeActivity).apply {
            orientation = LinearLayout.HORIZONTAL
            val photo = petPhotoPreviewView()
            val photoUrl = pet.optString("photoUrl")
            if (photoUrl.isNotBlank() && photoUrl != "null") {
                loadRemoteImage("${VeteaseApi.API_BASE_URL}$photoUrl", photo)
            }
            addView(photo)
            addView(LinearLayout(this@HomeActivity).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(dp(12), 0, 0, 0)
                addView(label(pet.optString("name")))
                addView(body("${pet.optString("species")} - ${pet.optString("breed")}"))
                addView(chipRow("Age: ${pet.opt("age")}", if (pet.optString("vaccineHistory").isNotBlank()) "Vaccines tracked" else "No vaccine log"))
            }, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        })

        addView(LinearLayout(this@HomeActivity).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, dp(10), 0, 0)
            addView(secondaryButton("Delete") {
                runMutation("Pet profile deleted.") { VeteaseApi.delete("/api/pets/${pet.optLong("id")}", sessionManager.token) }
            }, LinearLayout.LayoutParams(0, dp(50), 1f))
        })
    }

    private fun chipRow(vararg values: String): LinearLayout = LinearLayout(this).apply {
        orientation = LinearLayout.HORIZONTAL
        values.forEach { value ->
            addView(TextView(this@HomeActivity).apply {
                text = value
                textSize = 12f
                typeface = Typeface.DEFAULT_BOLD
                setTextColor(ContextCompat.getColor(this@HomeActivity, R.color.vetease_mid))
                setBackgroundResource(R.drawable.bg_info_chip)
                setPadding(dp(10), dp(6), dp(10), dp(6))
            }, LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
                setMargins(0, dp(4), dp(8), dp(4))
            })
        }
    }

    private fun loadRemoteImage(url: String, imageView: ImageView) {
        thread {
            try {
                val bitmap = URL(url).openStream().use { BitmapFactory.decodeStream(it) }
                runOnUiThread { imageView.setImageBitmap(bitmap) }
            } catch (_: Exception) {
                runOnUiThread { imageView.setImageDrawable(null) }
            }
        }
    }

    private fun input(hint: String, value: String = ""): EditText = EditText(this).apply {
        this.hint = hint
        setText(value)
        setSingleLine(false)
        setBackgroundResource(R.drawable.bg_input)
        setTextColor(ContextCompat.getColor(this@HomeActivity, R.color.vetease_text_primary))
        setHintTextColor(ContextCompat.getColor(this@HomeActivity, R.color.vetease_text_secondary))
        setPadding(dp(14), 0, dp(14), 0)
        layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(52)).apply {
            setMargins(0, dp(8), 0, dp(8))
        }
    }

    private fun primaryButton(textValue: String, onClick: () -> Unit): Button = button(textValue, true, onClick)

    private fun secondaryButton(textValue: String, onClick: () -> Unit): Button = button(textValue, false, onClick)

    private fun button(textValue: String, primary: Boolean, onClick: () -> Unit): Button = Button(this).apply {
        text = textValue
        isAllCaps = false
        setTextColor(ContextCompat.getColor(this@HomeActivity, if (primary) android.R.color.white else R.color.vetease_mid))
        setBackgroundResource(if (primary) R.drawable.bg_primary_button else R.drawable.bg_input)
        setOnClickListener { onClick() }
        layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(50)).apply {
            setMargins(0, dp(6), 0, dp(6))
        }
    }

    private fun showSuccess(message: String) {
        messageView.visibility = View.VISIBLE
        messageView.text = message
        messageView.background = ContextCompat.getDrawable(this, R.drawable.bg_message_success)
        messageView.setTextColor(ContextCompat.getColor(this, R.color.vetease_success))
    }

    private fun showError(message: String) {
        messageView.visibility = View.VISIBLE
        messageView.text = message
        messageView.background = ContextCompat.getDrawable(this, R.drawable.bg_message_error)
        messageView.setTextColor(ContextCompat.getColor(this, R.color.vetease_error))
    }

    private fun clearMessage() {
        messageView.visibility = View.GONE
        messageView.text = ""
    }

    private fun timeLabel(value: String): String = value.take(5).ifBlank { "--:--" }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()
}
