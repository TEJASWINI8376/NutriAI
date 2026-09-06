# nutriAI
NutrIA is an AI-powered personalized nutrition and food-safety assistant that helps users understand whether a particular food is suitable for them based on their health profile, medical reports, prescriptions, ingredients, and nutritional information.

## Authentication

The patient-medical branch includes a dependency-free `AuthService` in `auth.js` for the initial account flow:

- Registers normalized email addresses with salted scrypt password hashes.
- Creates opaque, expiring session tokens on login.
- Authenticates and logs out sessions without exposing password hashes.
- Rejects weak passwords, duplicate accounts, invalid credentials, and expired sessions.

Run the tests with:

```bash
node --test auth.test.js
```
