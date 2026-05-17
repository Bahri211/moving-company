# Photo Upload Guide

Drop your photos into the correct folder below, then update the matching
`src=""` path in index.html. Recommended format: JPG or WebP, max 2 MB each.

---

## gallery/   ← your work / job photos

Used in the Gallery section of the homepage.

| Filename to use          | Slot in HTML     | Description                  |
|--------------------------|------------------|------------------------------|
| gallery-1.jpg            | g-1 (large)      | Big hero shot — home or job  |
| gallery-2.jpg            | g-2              | Office / commercial move     |
| gallery-3.jpg            | g-3              | Packing / crating close-up   |
| gallery-4.jpg            | g-4              | Apartment or condo move      |
| gallery-5.jpg            | g-5              | House move, any state        |
| gallery-6.jpg            | g-6 (wide)       | Truck on the road            |
| gallery-7.jpg            | g-7              | White glove / high-end setup |
| gallery-8.jpg            | g-8              | Before/after or crew shot    |

---

## trucks/   ← truck / fleet photos

| Filename to use          | Where used       | Description                  |
|--------------------------|------------------|------------------------------|
| truck-fleet.jpg          | (future section) | Full fleet lined up          |
| truck-side.jpg           | (future section) | Side profile with logo       |
| truck-loading.jpg        | (future section) | Crew loading a truck         |

---

## Tips

- Rename your file to match the table above before dropping it in.
- WebP gives the best file size. If you only have JPG that's fine too.
- Minimum size: 800 × 600 px for gallery, 600 × 750 px for team portraits.
- After uploading, find the matching `src` in index.html and swap the
  Unsplash URL for the local path, e.g.:
    src="assets/images/gallery/gallery-1.jpg"
