# Real-Pose Video Fixtures for MediaPipe Automated Testing

This directory can hold video fixtures for automated end-to-end testing of real MediaPipe pose detection in headless Chrome.

## How to create `person.mjpeg`

1. Record a 10-second video of a person doing Warrior II or Wall Slide with their full body or upper body clearly visible in frame.
2. Ensure good lighting and contrast against the background.
3. Convert the recorded MP4/MOV video to an MJPEG stream at 640x480 resolution (30 FPS) using `ffmpeg`:

```bash
ffmpeg -i input.mp4 -vcodec mjpeg -q:v 2 -an -s 640x480 -r 30 scripts/fixtures/person.mjpeg
```

4. When `scripts/fixtures/person.mjpeg` is present, `scripts/test-offline-pwa.mjs` will automatically launch Chrome with:

```
--use-file-for-fake-video-capture=scripts/fixtures/person.mjpeg
```

This feeds the video into Chrome's `getUserMedia` virtual camera device to verify that `MediaPipePoseSource` detects landmarks, emits valid keypoints, and transitions to the `tracking` state without requiring a physical camera or user interaction.
