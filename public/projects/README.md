# Project media

Put screenshots and videos for each project in a folder named after its `id`
in `public/data/projects.json`, for example:

```
public/projects/training-system/cover.png    <- card cover + first gallery item
public/projects/training-system/courses.png
public/projects/training-system/demo.mp4     <- plays on card hover and in the gallery
```

Then list them in that project's `media` array:

```json
{ "type": "image", "src": "/projects/training-system/courses.png",
  "caption": { "en": "Courses management", "ar": "إدارة الدورات" } },
{ "type": "video", "src": "/projects/training-system/demo.mp4",
  "poster": "/projects/training-system/cover.png" }
```

Until a file exists, the site shows a branded placeholder in its place.
Tips: 1600×1000 PNG/WebP screenshots, MP4 (H.264) videos under ~10 MB.
