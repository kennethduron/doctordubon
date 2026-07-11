import admin from "firebase-admin";

const TECHNICAL_OWNER = {
  clinicId: "clinic_dr_oscar_dubon",
  name: "Kenneth Asael Duron Paz",
  email: "kennethduron.paz@gmail.com",
  role: "technical_owner",
  status: "active",
};

function fail(message, error) {
  console.error(`\n${message}`);

  if (error) {
    console.error(error instanceof Error ? error.message : error);
  }

  process.exitCode = 1;
}

async function main() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    fail(
      "Falta GOOGLE_APPLICATION_CREDENTIALS. En PowerShell configura la ruta al JSON privado, por ejemplo:\n" +
        '$env:GOOGLE_APPLICATION_CREDENTIALS="C:\\Users\\user\\Documents\\firebase-keys\\doctordubon-service-account.json"',
    );
    return;
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });

  console.log("Buscando usuario...");

  let authUser;

  try {
    authUser = await admin.auth().getUserByEmail(TECHNICAL_OWNER.email);
  } catch (error) {
    if (error?.code === "auth/user-not-found") {
      fail("No se encontró el usuario en Firebase Authentication. Primero crea la cuenta desde /registro.");
      return;
    }

    fail("No se pudo buscar el usuario en Firebase Authentication.", error);
    return;
  }

  console.log("Usuario encontrado");
  console.log(`UID: ${authUser.uid}`);

  try {
    await admin.auth().updateUser(authUser.uid, { emailVerified: true });
    console.log("Correo marcado como verificado");
  } catch (error) {
    fail("No se pudo marcar el correo como verificado en Firebase Authentication.", error);
    return;
  }

  try {
    const db = admin.firestore();
    const userRef = db.collection("users").doc(authUser.uid);
    const snapshot = await userRef.get();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const profile = {
      id: authUser.uid,
      clinicId: TECHNICAL_OWNER.clinicId,
      name: TECHNICAL_OWNER.name,
      email: TECHNICAL_OWNER.email,
      role: TECHNICAL_OWNER.role,
      status: TECHNICAL_OWNER.status,
      updatedAt: timestamp,
    };

    if (!snapshot.exists) {
      profile.createdAt = timestamp;
    }

    await userRef.set(profile, { merge: true });
    console.log("Perfil de Firestore actualizado");
  } catch (error) {
    fail("No se pudo actualizar el perfil en Firestore.", error);
    return;
  }

  console.log("Técnico operativo activado correctamente");
}

main().catch((error) => {
  fail("No se pudo completar el bootstrap del Técnico operativo.", error);
});
