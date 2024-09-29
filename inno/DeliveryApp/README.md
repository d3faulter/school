## Opsætning

1. Kør `npm install` i roden af projektet for at installere alle nødvendige afhængigheder.

2. Opret en `.env`-fil i roden af projektet med følgende format:

    ```plaintext
    FIREBASE_API_KEY=
    FIREBASE_AUTH_DOMAIN=
    FIREBASE_DATABASE_URL=
    FIREBASE_PROJECT_ID=
    FIREBASE_STORAGE_BUCKET=
    FIREBASE_MESSAGING_SENDER_ID=
    FIREBASE_APP_ID=
    GEOCODE_MAPS_APIKEY=
    ```

3. Start projektet med `npx expo`. Hvis du oplever problemer, kan det hjælpe at rydde cachen ved opstart. Brug evt. `npm start --reset-cache`, da der har været enkelte problemer med Expo CLI.

> **Bemærk:** Ja, det er et nested repository. Nej, det er ikke ideelt. Applikationen vil blive flyttet til et andet repository asap.