# 每日中文 Daily Chinese

A small installable web app for daily Mandarin lessons. Lesson files in `lessons/` are AES-GCM encrypted; the app asks for a passcode once per device.

Add a lesson: `DC_PASSCODE=... node tools/add-lesson.mjs path/to/YYYY-MM-DD.json`
