# Slik setter du opp Firebase for Makthjulet 🛡️

For at det nye identitetssystemet skal fungere, må du aktivere et par ting i Firebase Console.

## 1. Aktiver Authentication
Gå til [Firebase Console](https://console.firebase.google.com/) -> **Authentication** -> **Get Started**.

### Aktiver Logginn-metoder:
Gå til fanen **Sign-in method** og aktiver følgende:
1.  **Email/Password:** Aktiver denne.
3.  **Anonymous:** Aktiver denne (nederst på listen). Dette er kritisk for at spillere skal kunne starte som 'Gjest'.

## 1.5 Sjekk Database URL (Viktig!)
Hvis du får en feilmelding om "Database URL", sjekk følgende i Firebase Console:
1. Gå til **Realtime Database**.
2. Kopier URL-en som står rett over data-treet (den begynner med `https://`).
3. Sørg for at den samsvarer nøyaktig med det som står i `src/config/firebase.ts`. 
   > [!NOTE]
   > For europeiske servere må den ofte slutte på `/`. Jeg har lagt til dette i koden for deg nå.

## 2. Realtime Database Regler
Gå til **Realtime Database** -> fanen **Rules**. Kopier og lim inn disse reglene for å sikre at brukere kun kan endre sine egne data:

```json
{
  "rules": {
    "accounts": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "rooms": {
      "$roomId": {
        ".read": "true",
        "players": {
          "$charId": {
            ".read": "true",
            ".write": "auth != null && (data.child('uid').val() == auth.uid || !data.exists())"
          }
        },
        ".write": "auth != null && root.child('accounts').child(auth.uid).child('role').val() == 'ADMIN'"
      }
    }
  }
}
```

### Hva disse reglene gjør:
*   **`accounts`**: Kun eieren kan lese/skrive sin egen globale konto (XP, navn, prestasjoner).
*   **`rooms/.../players`**: Alle kan se hvem som er på en server, men kun eieren av en karakter (koblet via `uid`) kan endre sine egne stats.
*   **`rooms` Admin**: Kun brukere med Admin-rolle i databasen kan slette eller endre hele rom.

## 3. Klar til kamp! 🚀
Når dette er lagret, vil "Logg Inn"-knappen og karakter-skaperen i spillet fungere umiddelbart.
