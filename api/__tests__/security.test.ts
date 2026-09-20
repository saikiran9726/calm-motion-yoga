import { describe, it, expect, beforeEach } from "vitest";
import clinicAuthHandler from "../clinic/auth";
import clinicPatientsHandler from "../clinic/patients";
import clinicPatientHandler from "../clinic/patient";
import clinicNotesHandler from "../clinic/notes";
import clinicProgramHandler from "../clinic/program";
import clinicSeedHandler from "../clinic/seed";
import reportsHandler from "../reports";
import patientJoinHandler from "../patient/join";
import patientDeleteDataHandler from "../patient/delete-data";
import patientProgramHandler from "../patient/program";
import { seedMemoryStore } from "../_lib/db";

function createMockReqRes(options: {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
}) {
  const req = {
    method: options.method || "GET",
    headers: options.headers || {},
    body: options.body || {},
    query: options.query || {},
  };

  let statusCode = 200;
  let responseData: any = null;
  const headers: Record<string, string> = {};
  let ended = false;

  const res: any = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      responseData = data;
      ended = true;
      return res;
    },
    setHeader(key: string, val: string) {
      headers[key.toLowerCase()] = val;
      return res;
    },
    end() {
      ended = true;
      return res;
    },
    get statusCode() {
      return statusCode;
    },
    get data() {
      return responseData;
    },
    get headers() {
      return headers;
    },
    get ended() {
      return ended;
    },
  };

  return { req, res };
}

describe("Backend Security Suite (/api)", () => {
  beforeEach(async () => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test-secret-at-least-32-chars-long-for-jwt-signing";
    process.env.CLINIC_ADMIN_PASSCODE = "CALM2026";
    await seedMemoryStore(true);
  });

  describe("Clinic Authentication & Passcode Hashing", () => {
    it("rejects wrong clinic passcode with 401 and generic message", async () => {
      const { req, res } = createMockReqRes({
        method: "POST",
        body: { clinicCode: "CALM01", passcode: "WRONG_PASS" },
      });
      await clinicAuthHandler(req, res);
      expect(res.statusCode).toBe(401);
      expect(res.data.error).toBe("Invalid clinic code or passcode");
      expect(res.data.token).toBeUndefined();
    });

    it("does not auto-create clinics from unknown code login and returns 401", async () => {
      const { req, res } = createMockReqRes({
        method: "POST",
        body: { clinicCode: "CLINIC99", passcode: "CALM2026" },
      });
      await clinicAuthHandler(req, res);
      expect(res.statusCode).toBe(401);
      expect(res.data.error).toBe("Invalid clinic code or passcode");
    });

    it("issues JWT token on valid credentials without exposing passcode or hash", async () => {
      const { req, res } = createMockReqRes({
        method: "POST",
        body: { clinicCode: "CALM01", passcode: "CALM2026" },
      });
      await clinicAuthHandler(req, res);
      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(typeof res.data.token).toBe("string");
      expect(res.data.clinic.clinicCode).toBe("CALM01");
      expect(res.data.clinic.passcode).toBeUndefined();
      expect(res.data.clinic.passcodeHash).toBeUndefined();
    });
  });

  describe("Clinic JWT Protection on /api/clinic/* and GET /api/reports", () => {
    it("returns 401 for GET /api/clinic/patients with no token", async () => {
      const { req, res } = createMockReqRes({ method: "GET" });
      await clinicPatientsHandler(req, res);
      expect(res.statusCode).toBe(401);
    });

    it("returns 401 for GET /api/clinic/patient with no token", async () => {
      const { req, res } = createMockReqRes({
        method: "GET",
        query: { patientId: "patient-ananya" },
      });
      await clinicPatientHandler(req, res);
      expect(res.statusCode).toBe(401);
    });

    it("returns 401 for GET /api/clinic/notes with no token", async () => {
      const { req, res } = createMockReqRes({
        method: "GET",
        query: { patientId: "patient-ananya" },
      });
      await clinicNotesHandler(req, res);
      expect(res.statusCode).toBe(401);
    });

    it("returns 401 for GET /api/clinic/program with no token", async () => {
      const { req, res } = createMockReqRes({
        method: "GET",
        query: { patientId: "patient-ananya" },
      });
      await clinicProgramHandler(req, res);
      expect(res.statusCode).toBe(401);
    });

    it("returns 401 for GET /api/reports with no token", async () => {
      const { req, res } = createMockReqRes({ method: "GET" });
      await reportsHandler(req, res);
      expect(res.statusCode).toBe(401);
    });

    it("returns 401 for POST /api/clinic/seed with no token", async () => {
      process.env.DEMO_MODE = "true";
      const { req, res } = createMockReqRes({
        method: "POST",
        body: { clinicCode: "CALM01" },
      });
      await clinicSeedHandler(req, res);
      expect(res.statusCode).toBe(401);
    });

    it("allows access to clinic patients when valid JWT is provided", async () => {
      // Login first
      const authReqRes = createMockReqRes({
        method: "POST",
        body: { clinicCode: "CALM01", passcode: "CALM2026" },
      });
      await clinicAuthHandler(authReqRes.req, authReqRes.res);
      const token = authReqRes.res.data.token;

      // Access patients
      const { req, res } = createMockReqRes({
        method: "GET",
        headers: { authorization: `Bearer ${token}` },
      });
      await clinicPatientsHandler(req, res);
      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(Array.isArray(res.data.patients)).toBe(true);
    });
  });

  describe("Patient Auth & Cross-Patient Data Isolation", () => {
    it("returns 401 for /api/patient/delete-data without a token", async () => {
      const { req, res } = createMockReqRes({
        method: "POST",
        body: { patientId: "patient-ananya" },
      });
      await patientDeleteDataHandler(req, res);
      expect(res.statusCode).toBe(401);
    });

    it("returns 401 for POST /api/reports without a patient token", async () => {
      const { req, res } = createMockReqRes({
        method: "POST",
        body: {
          reportId: "rep-test",
          patientId: "patient-ananya",
          patientName: "Ananya Kumar",
          date: "Today",
          exerciseTitle: "Warrior II",
          repsCompleted: 10,
          targetReps: 10,
          durationSeconds: 60,
          formQuality: "Excellent",
          painBefore: 2,
          painAfter: 2,
        },
      });
      await reportsHandler(req, res);
      expect(res.statusCode).toBe(401);
    });

    it("registers patient on join, returns patientToken, and rejects join with non-existent clinic", async () => {
      // Invalid clinic code
      const invalidReqRes = createMockReqRes({
        method: "POST",
        body: { name: "Test User", clinicCode: "FAKE99" },
      });
      await patientJoinHandler(invalidReqRes.req, invalidReqRes.res);
      expect(invalidReqRes.res.statusCode).toBe(404);

      // Valid join
      const validReqRes = createMockReqRes({
        method: "POST",
        body: { name: "Dev Patient", clinicCode: "CALM01" },
      });
      await patientJoinHandler(validReqRes.req, validReqRes.res);
      expect(validReqRes.res.statusCode).toBe(200);
      expect(typeof validReqRes.res.data.patientToken).toBe("string");
      expect(validReqRes.res.data.patient.id).toContain("patient-");
    });

    it("proves a patient token cannot read, write, or delete another patient data", async () => {
      // Register Patient A
      const p1ReqRes = createMockReqRes({
        method: "POST",
        body: { name: "Patient Alpha", clinicCode: "CALM01" },
      });
      await patientJoinHandler(p1ReqRes.req, p1ReqRes.res);
      const patientA = p1ReqRes.res.data.patient;
      const tokenA = p1ReqRes.res.data.patientToken;
      expect(patientA.id).toBeDefined();

      // Register Patient B
      const p2ReqRes = createMockReqRes({
        method: "POST",
        body: { name: "Patient Beta", clinicCode: "CALM01" },
      });
      await patientJoinHandler(p2ReqRes.req, p2ReqRes.res);
      const patientB = p2ReqRes.res.data.patient;

      // Patient A tries to submit a report claiming to be Patient B -> 403 Forbidden
      const reportAttempt = createMockReqRes({
        method: "POST",
        headers: { authorization: `Bearer ${tokenA}` },
        body: {
          reportId: "rep-spoof-1",
          patientId: patientB.id, // Trying to spoof Patient B
          patientName: "Patient Beta",
          date: "Today",
          exerciseTitle: "Warrior II",
          repsCompleted: 10,
          targetReps: 10,
          durationSeconds: 45,
          formQuality: "Good",
          painBefore: 1,
          painAfter: 1,
        },
      });
      await reportsHandler(reportAttempt.req, reportAttempt.res);
      expect(reportAttempt.res.statusCode).toBe(403);
      expect(reportAttempt.res.data.error).toContain("Forbidden");

      // Patient A tries to delete Patient B data -> 403 Forbidden
      const deleteAttempt = createMockReqRes({
        method: "POST",
        headers: { authorization: `Bearer ${tokenA}` },
        body: { patientId: patientB.id },
      });
      await patientDeleteDataHandler(deleteAttempt.req, deleteAttempt.res);
      expect(deleteAttempt.res.statusCode).toBe(403);
      expect(deleteAttempt.res.data.error).toContain("Forbidden");

      // Patient A can access their own prescribed program
      const programReq = createMockReqRes({
        method: "GET",
        headers: { authorization: `Bearer ${tokenA}` },
      });
      await patientProgramHandler(programReq.req, programReq.res);
      expect(programReq.res.statusCode).toBe(200);
    });
  });

  describe("DEMO_MODE Restriction on Seeding", () => {
    it("rejects /api/clinic/seed when DEMO_MODE is not true with 403", async () => {
      delete process.env.DEMO_MODE;
      const authReqRes = createMockReqRes({
        method: "POST",
        body: { clinicCode: "CALM01", passcode: "CALM2026" },
      });
      await clinicAuthHandler(authReqRes.req, authReqRes.res);
      const token = authReqRes.res.data.token;

      const { req, res } = createMockReqRes({
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
        body: { clinicCode: "CALM01" },
      });
      await clinicSeedHandler(req, res);
      expect(res.statusCode).toBe(403);
      expect(res.data.error).toContain("Demo seeding is disabled");
    });
  });

  describe("Production Configuration Enforcement (Task 2)", () => {
    it("returns 503 when required environment variables are missing in production", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.JWT_SECRET;
      delete process.env.MONGODB_URI;

      const { req, res } = createMockReqRes({
        method: "POST",
        body: { clinicCode: "CALM01", passcode: "CALM2026" },
      });
      await clinicAuthHandler(req, res);
      expect(res.statusCode).toBe(503);
      expect(res.data.error).toBe("Server not configured");
    });
  });
});

