import fs from 'fs';

const BASE_URL = 'http://127.0.0.1:5000/api';
const testLog = [];
let passCount = 0;
let failCount = 0;

function log(msg) {
  console.log(msg);
  testLog.push(msg);
}

function expect(condition, msg) {
  if (condition) {
    passCount++;
    console.log('[PASS] ' + msg);
  } else {
    failCount++;
    console.error('[FAIL] ' + msg);
  }
}

async function api(method, url, body = null, headers = {}) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(BASE_URL + url, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function run() {
  log("--- MEDASSIST FINAL E2E TEST PASS ---");
  
  // 1. Backend Ping
  try {
    const res = await fetch(BASE_URL + '/appointments');
    expect(res.status === 401, "API basic response check (expect 401 without auth)");
  } catch (err) {}
  
  // 2. Admin Login
  let adminToken;
  try {
    const data = await api('POST', '/auth/login', { email: 'admin@medassist.com', password: 'AdminPassword123456' });
    adminToken = data.token;
    expect(data.user.role === 'admin', "Admin login successful");
  } catch (err) {
    expect(false, "Admin login failed: " + err.message);
  }
  
  const adminHeaders = { Authorization: 'Bearer ' + adminToken };
  
  // Admin Data checks
  try {
    const data = await api('GET', '/dashboard/admin', null, adminHeaders);
    expect(data.success === true, "Admin Dashboard loaded");
  } catch (e) {
    expect(false, "Admin dashboard failed to load");
  }

  // Create test doctor and patient
  let testDocId, testPatId, testDeptId, testSvcId;
  const t = Date.now();
  
  // Departments
  try {
    const depts = await api('GET', '/departments', null, adminHeaders);
    if(depts.departments.length === 0) {
       const createDept = await api('POST', '/departments', { name: "Test Dept " + t, description: "Test" }, adminHeaders);
       testDeptId = createDept.department._id;
    } else {
       testDeptId = depts.departments[0]._id;
    }
    expect(true, "Department retrieved/created");
  } catch(e) { expect(false, "Department failed: " + e.message); }

  // Services
  try {
    const svcs = await api('GET', '/services', null, adminHeaders);
    if(svcs.services.length === 0) {
       const createSvc = await api('POST', '/services', { name: "Test Svc " + t, description: "Test", duration: 30, price: 1000, departmentId: testDeptId }, adminHeaders);
       testSvcId = createSvc.service._id;
    } else {
       testSvcId = svcs.services[0]._id;
    }
    expect(true, "Service retrieved/created");
  } catch(e) { expect(false, "Service failed: " + e.message); }
  
  // Add Doctor
  try {
    const data = await api('POST', '/auth/create-staff', {
        name: "Test Doc " + t,
        email: "doc" + t + "@medassist.com",
        password: "AdminPassword123456",
        phone: "1234567890",
        role: "doctor",
        departmentId: testDeptId,
        specialization: "General",
        qualification: "MBBS",
        experience: 5
    }, adminHeaders);
    testDocId = data.doctor._id;
    expect(true, "Doctor created");
  } catch (e) {
    expect(false, "Doctor creation failed: " + (e.data?.message || e.message));
  }

  // Add Patient
  try {
    const data = await api('POST', '/auth/register-patient', {
        name: "Test Pat " + t,
        email: "pat" + t + "@medassist.com",
        password: "AdminPassword123456",
        phone: "0987654321",
        dateOfBirth: "1990-01-01",
        gender: "male",
        bloodGroup: "O+",
        address: "123 Test St",
        medicalHistory: ""
    });
    testPatId = data.patient._id;
    expect(true, "Patient created");
  } catch (e) {
    expect(false, "Patient creation failed: " + (e.data?.message || e.message));
  }

  // 3. Patient Login & Booking
  let patToken;
  try {
    const data = await api('POST', '/auth/login', { email: "pat" + t + "@medassist.com", password: 'AdminPassword123456' });
    patToken = data.token;
    expect(data.user.role === 'patient', "Patient login successful");
  } catch(e) {}
  const patHeaders = { Authorization: 'Bearer ' + patToken };

  let appointmentId;
  try {
    const data = await api('POST', '/appointments', {
      doctorId: testDocId,
      departmentId: testDeptId,
      serviceId: testSvcId,
      appointmentDate: "2026-10-15",
      startTime: "10:00",
      reason: "Test reason"
    }, patHeaders);
    appointmentId = data.appointment._id;
    expect(data.appointment.status === 'scheduled', "Patient booked appointment successfully (scheduled)");
  } catch (e) {
    expect(false, "Patient booking failed: " + (e.data?.message || e.message));
  }

  // 4. Receptionist/Admin confirm
  try {
    await api('PUT', '/appointments/' + appointmentId + '/status', { status: "confirmed" }, adminHeaders);
    const data = await api('GET', '/appointments', null, adminHeaders);
    const appt = data.appointments.find(a => a._id === appointmentId);
    expect(appt.status === "confirmed", "Admin confirmed appointment successfully");
  } catch(e) {
    expect(false, "Admin confirm appointment failed: " + e.message);
  }

  // 5. Doctor complete & Medical Record
  let docToken;
  try {
    const data = await api('POST', '/auth/login', { email: "doc" + t + "@medassist.com", password: 'AdminPassword123456' });
    docToken = data.token;
    expect(data.user.role === 'doctor', "Doctor login successful");
  } catch(e) {}
  const docHeaders = { Authorization: 'Bearer ' + docToken };

  // Doctor completes
  try {
    await api('PUT', '/appointments/' + appointmentId + '/status', { status: "completed" }, docHeaders);
    expect(true, "Doctor marked appointment completed");
  } catch (e) {
    expect(false, "Doctor complete failed: " + e.data?.message);
  }

  // Create Medical Record
  let recordId;
  try {
    const data = await api('POST', '/medical-records', {
      appointmentId,
      symptoms: "Test symptoms",
      diagnosis: "Test diagnosis",
      treatmentNotes: "Test notes",
      prescription: [{ medicineName: "TestMed", dosage: "10mg", frequency: "1", duration: "5", instructions: "take!" }]
    }, docHeaders);
    recordId = data.medicalRecord._id;
    expect(recordId != null, "Medical record created");
  } catch (e) {
    expect(false, "Medical record failed: " + e.data?.message);
  }

  // Verify DoctorAppointments hides the record button (hasMedicalRecord = true)
  try {
      const data = await api('GET', '/appointments/doctor-appointments', null, docHeaders);
      const foundAppt = data.appointments.find(a => a._id === appointmentId);
      expect(foundAppt.hasMedicalRecord === true, "Doctor appointments correctly stamps hasMedicalRecord = true");
  } catch (e) {
      expect(false, "Checking hasMedicalRecord failed: " + e.message);
  }

  // Edit Medical Record
  try {
    const data = await api('PUT', '/medical-records/' + recordId, {
      diagnosis: "Edited diagnosis"
    }, docHeaders);
    expect(data.medicalRecord.diagnosis === "Edited diagnosis", "Medical record edited");
  } catch(e) {
    expect(false, "Medical record edit failed: " + e.data?.message);
  }

  // Admin MUST NOT edit doctor's medical record
  try {
    await api('PUT', '/medical-records/' + recordId, {
      diagnosis: "Hacked by Admin!"
    }, adminHeaders);
    expect(false, "Admin was ABLE to edit medical record (SECURITY FAIL)");
  } catch(e) {
    expect(e.status === 403, "Admin correctly BLOCKED from editing medical record (SECURITY PASS)");
  }

  // Generate Invoice
  let invoiceId;
  try {
    const data = await api('POST', '/invoices', { appointmentId }, docHeaders);
    invoiceId = data.invoice._id;
    expect(invoiceId != null, "Doctor generated invoice");
  } catch(e) {
    expect(false, "Invoice generation failed: " + e.data?.message);
  }

  // 6. Patient Pay Invoice
  try {
    const data = await api('GET', '/invoices/my-invoices', null, patHeaders);
    const pInv = data.invoices.find(i => i._id === invoiceId);
    expect(pInv.paymentStatus === 'pending', "Patient sees pending invoice");
    
    await api('PUT', '/invoices/' + invoiceId + '/pay', { paymentMethod: 'card' }, patHeaders);
    expect(true, "Patient paid invoice successfully");
  } catch(e) {
    expect(false, "Patient invoice interaction failed: " + e.message);
  }

  // 7. Test Authorization Matrix (e.g., patient hitting admin routes)
  try {
    await api('GET', '/dashboard/admin', null, patHeaders);
    expect(false, "Patient hit admin dashboard! (SECURITY FAIL)");
  } catch(e) {
    expect(e.status === 403, "Patient blocked from admin dashboard (SECURITY PASS)");
  }

  try {
    await api('GET', '/dashboard/doctor', null, patHeaders);
    expect(false, "Patient hit doctor dashboard! (SECURITY FAIL)");
  } catch(e) {
    expect(e.status === 403, "Patient blocked from doctor dashboard (SECURITY PASS)");
  }

  try {
    await api('GET', '/dashboard/receptionist', null, patHeaders);
    expect(false, "Patient hit receptionist dashboard! (SECURITY FAIL)");
  } catch(e) {
    expect(e.status === 403, "Patient blocked from rx dashboard (SECURITY PASS)");
  }
  
  // Receptionist blocked from doctor dashboard etc.
  let rxToken;
  try {
    const data = await api('POST', '/auth/login', { email: "receptionist@medassist.com", password: 'AdminPassword123456' });
    rxToken = data.token;
  } catch(e) {}
  
  if (rxToken) {
    const rxHeaders = { Authorization: 'Bearer ' + rxToken };
    try {
      await api('GET', '/dashboard/doctor', null, rxHeaders);
      expect(false, "Receptionist hit doctor dashboard! (SECURITY FAIL)");
    } catch(e) {
      expect(e.status === 403, "Receptionist blocked from doctor dashboard (SECURITY PASS)");
    }
  }

  console.log("\n================================");
  console.log("TESTS COMPLETE. PASS: " + passCount + ", FAIL: " + failCount);
  console.log("================================\n");
  
  process.exit(failCount === 0 ? 0 : 1);
}

run();
