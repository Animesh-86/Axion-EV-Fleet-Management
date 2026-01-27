# IntelliJ Connection Fix

Your CLI build works because we forced **Offline Mode** and **Java 17**. IntelliJ is likely failing because it's trying to go online or using the wrong Java version (it was set to Java 24!).

## 1. I have auto-fixed the Java Version
I modified `.idea/misc.xml` to set the project SDK to **Java 17**.
*   **Action**: Restart IntelliJ or go to `File > Reload All from Disk`.

## 2. You MUST Enable Offline Mode
IntelliJ tries to download dependencies by default, which fails on your network.
1.  Open **Maven** sidebar (right side).
2.  Click the **Toggle Offline Mode** button (icon looks like a plug/lightning bolt).
    *   *Result*: It should look "pressed".
3.  Click **Reload All Maven Projects** (refresh icon).

## 3. Verify Run Configuration
1.  Open `Edit Configurations...` (top right).
2.  Ensure your Spring Boot configuration is using **Java 17**.
3.  **Critical**: In the "Before launch" section, remove "Build" if it keeps failing, and replace it with a "Run Maven Goal" -> `package -o -DskipTests`.
    *   *Why?* Standard IntelliJ build might try to resolve dependencies online. Using the offline maven goal ensures it works.

## Summary
1.  **Java**: 17 (Fixed config)
2.  **Maven**: Toggle **Offline Mode** button.
3.  **Reload**: Reload Maven projects.
