import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildSyncPayload } from "../../src/lib/reportPayload";
import { SessionReportSchema } from "../_lib/validation";
import clinicAuthHandler from "../clinic/auth";
import patientJoinHandler from "../patient/join";
import reportsHandler from "../reports";
import { __setMongoForTests } from "../_lib/db";
import { resetRateLimitsForTests } from "../_lib/rateLimit";

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
    socket: { remoteAddress: "127.0.0.1" },
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

function createFakeMongo() {
  const collections = new Map<string, any[]>();

  function getCol(name: string) {
    if (!collections.has(name)) collections.set(name, []);
    return collections.get(name)!;
  }

  return {
    collection(name: string) {
      const items = getCol(name);
      return {
        async findOne(query: any) {
          return items.find((item) => {
            for (const key of Object.keys(query)) {
              if (item[key] !== query[key]) return false;
            }
            return true;
          }) || null;
        },
        find(query: any) {
          const filtered = items.filter((item) => {
            for (const key of Object.keys(query)) {
              if (item[key] !== query[key]) return false;
            }
            return true;
          });
          return {
            async toArray() {
              return [...filtered];
            },
            sort() {
              return {
                async toArray() {
                  return [...filtered].reverse();
                },
              };
            },
          };
        },
        async insertOne(doc: any) {
          items.push({ ...doc });
          return { insertedId: "fake-id" };
        },
        async updateOne(filter: any, update: any, options?: any) {
          let found = items.find((item) => {
            for (const key of Object.keys(filter)) {
              if (item[key] !== filter[key]) return false;
            }
            return true;
          });

          if (!found && options?.upsert) {
            found = { ...filter };
            items.push(found);
          }

          if (found) {
            if (update.$set) {
              Object.assign(found, update.$set);
            }
            if (update.$setOnInsert && options?.upsert) {
              Object.assign(found, update.$setOnInsert);
            }
            if (update.$inc) {
              for (const [k, v] of Object.entries(update.$inc)) {
                found[k] = (found[k] || 0) + (v as number);
              }
            }
          }
          return { matchedCount: found ? 1 : 0 };
        },
        async deleteMany(filter: any) {
          const remaining = items.filter((item) => {
            for (const key of Object.keys(filter)) {
              if (item[key] === filter[key]) return false;
            }
            return true;
          });
          collections.set(name, remaining);
          return { deletedCount: items.length - remaining.length };
        },
      };
    },
  };
}

describe("Clinic Sync, Bootstrap & Security Leftovers (FIX 2)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "valid-test-secret-at-least-32-chars-long";
    process.env.CLINIC_ADMIN_PASSCODE = "CALM2026";
    delete process.env.MONGODB_URI;
    const fakeDb = createFakeMongo();
    __setMongoForTests(fakeDb);
    resetRateLimitsForTests();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    __setMongoForTests(null);
  });

  describe("Contract Test: buildSyncPayload vs SessionReportSchema", () => {
    it("produces a whitelisted payload that succeeds SessionReportSchema.safeParse", () => {
      const rawReport = {
        reportId: "rep-001",
        date: "2026-09-20T10:00:00.000Z",
        exerciseTitle: "Warrior II",
        repsCompleted: 12,
        targetReps: 12,
        durationSeconds: 120,
        formQuality: "Excellent",
        peakRom: 88,
        painBefore: 2,
        painAfter: 1,
        painInterrupted: false,
        painThreshold: 5,
        mode: "reps",
        timestamp: 1774000000000,
        // Client-side extra fields that violate .strict()
        accuracyScore: 94,
        simulated: true,
        notes: "Should be stripped",
        arbitraryKey: 123,
      };

      const identity = {
        patientId: "patient-contract-1",
        clinicCode: "CALM01",
        patientName: "Contract Test Patient",
      };

      const cleanPayload = buildSyncPayload(rawReport, identity);

      // Verify that extra keys were stripped
      expect((cleanPayload as any).accuracyScore).toBeUndefined();
      expect((cleanPayload as any).simulated).toBeUndefined();
      expect((cleanPayload as any).notes).toBeUndefined();
      expect((cleanPayload as any).arbitraryKey).toBeUndefined();

      // Verify it passes strict schema parse
      const parseResult = SessionReportSchema.safeParse(cleanPayload);
      expect(parseResult.success).toBe(true);
    });

    it("verifies that raw unstripped payload with extra keys fails SessionReportSchema.safeParse", () => {
      const rawReportWithExtras = {
        reportId: "rep-002",
        patientId: "patient-1",
        patientName: "Test Patient",
        clinicCode: "CALM01",
        date: "2026-09-20",
        exerciseTitle: "Arm Raise",
        repsCompleted: 10,
        targetReps: 10,
        durationSeconds: 60,
        formQuality: "Good",
        painBefore: 1,
        painAfter: 2,
        painInterrupted: false,
        accuracyScore: 95,
        simulated: true,
      };

      const parseResult = SessionReportSchema.safeParse(rawReportWithExtras);
      expect(parseResult.success).toBe(false);
      if (!parseResult.success) {
        const errorString = JSON.stringify(parseResult.error.format());
        expect(errorString).toContain("accuracyScore");
      }
    });
  });

  describe("E2E Lifecycle with Empty Database (MongoDB Fake)", () => {
    it("bootstraps clinic, allows patient join, accepts report with painThreshold, and returns it to clinic", async () => {
      const fakeDb = createFakeMongo();
      __setMongoForTests(fakeDb);

      // 1. Clinic Auth: verify CALM01 is bootstrapped on first login attempt
      const authReqRes = createMockReqRes({
        method: "POST",
        body: { clinicCode: "CALM01", passcode: "CALM2026" },
      });
      await clinicAuthHandler(authReqRes.req, authReqRes.res);
      expect(authReqRes.res.statusCode).toBe(200);
      expect(authReqRes.res.data.success).toBe(true);
      const clinicToken = authReqRes.res.data.token;
      expect(typeof clinicToken).toBe("string");

      // Verify clinic was written into database
      const savedClinic = await fakeDb.collection("clinics").findOne({ clinicCode: "CALM01" });
      expect(savedClinic).not.toBeNull();
      expect(savedClinic.clinicCode).toBe("CALM01");

      // 2. Patient joins the bootstrapped clinic
      const joinReqRes = createMockReqRes({
        method: "POST",
        body: { clinicCode: "CALM01", name: "Ravi Patel", condition: "Rotator Cuff" },
      });
      await patientJoinHandler(joinReqRes.req, joinReqRes.res);
      expect(joinReqRes.res.statusCode).toBe(200);
      const patient = joinReqRes.res.data.patient;
      const patientToken = joinReqRes.res.data.patientToken;
      expect(patient.id).toBeDefined();
      expect(typeof patientToken).toBe("string");

      // 3. Patient uploads telemetry report with painThreshold and stripped extra keys
      const rawSession = {
        reportId: "rep-e2e-100",
        exerciseTitle: "Shoulder Flexion",
        repsCompleted: 8,
        targetReps: 10,
        durationSeconds: 75,
        formQuality: "Good",
        peakRom: 92,
        painBefore: 2,
        painAfter: 3,
        painInterrupted: false,
        painThreshold: 5,
        accuracyScore: 91, // extra key that buildSyncPayload must strip
        simulated: false,
      };

      const syncPayload = buildSyncPayload(rawSession, {
        patientId: patient.id,
        clinicCode: patient.clinicCode,
        patientName: patient.name,
      });

      const reportPostReqRes = createMockReqRes({
        method: "POST",
        headers: { authorization: `Bearer ${patientToken}` },
        body: syncPayload,
      });
      await reportsHandler(reportPostReqRes.req, reportPostReqRes.res);
      expect(reportPostReqRes.res.statusCode).toBe(200);
      expect(reportPostReqRes.res.data.success).toBe(true);
      expect(reportPostReqRes.res.data.saved).toBe(true);

      // 4. Clinic queries reports and sees painThreshold
      const reportsGetReqRes = createMockReqRes({
        method: "GET",
        headers: { authorization: `Bearer ${clinicToken}` },
        query: { patientId: patient.id },
      });
      await reportsHandler(reportsGetReqRes.req, reportsGetReqRes.res);
      expect(reportsGetReqRes.res.statusCode).toBe(200);
      expect(reportsGetReqRes.res.data.success).toBe(true);
      expect(reportsGetReqRes.res.data.reports.length).toBe(1);
      const fetchedReport = reportsGetReqRes.res.data.reports[0];
      expect(fetchedReport.reportId).toBe("rep-e2e-100");
      expect(fetchedReport.painThreshold).toBe(5);
      expect(fetchedReport.peakRom).toBe(92);
    });
  });

  describe("Security Leftovers Hardening", () => {
    it("verifies old demo-patient-token-ananya is rejected with 401", async () => {
      const { req, res } = createMockReqRes({
        method: "POST",
        headers: { authorization: "Bearer demo-patient-token-ananya" },
        body: {
          reportId: "rep-stale-token",
          patientId: "patient-ananya",
          patientName: "Ananya Kumar",
          date: "Today",
          exerciseTitle: "Test",
          repsCompleted: 5,
          targetReps: 5,
          durationSeconds: 30,
          formQuality: "Good",
          painBefore: 1,
          painAfter: 1,
        },
      });
      await reportsHandler(req, res);
      expect(res.statusCode).toBe(401);
    });

    it("ensures successful clinic logins do not count towards rate lockout", async () => {
      // 5 consecutive successful logins
      for (let i = 0; i < 5; i++) {
        const { req, res } = createMockReqRes({
          method: "POST",
          body: { clinicCode: "CALM01", passcode: "CALM2026" },
        });
        await clinicAuthHandler(req, res);
        expect(res.statusCode).toBe(200);
      }

      // 6th login still succeeds
      const { req, res } = createMockReqRes({
        method: "POST",
        body: { clinicCode: "CALM01", passcode: "CALM2026" },
      });
      await clinicAuthHandler(req, res);
      expect(res.statusCode).toBe(200);
    });

    it("locks out after 5 consecutive failed login attempts with 429", async () => {
      for (let i = 0; i < 5; i++) {
        const { req, res } = createMockReqRes({
          method: "POST",
          body: { clinicCode: "CALM01", passcode: "WRONG_PASSWORD" },
        });
        await clinicAuthHandler(req, res);
        expect(res.statusCode).toBe(401);
      }

      // 6th attempt should be blocked with 429 Too Many Requests
      const { req, res } = createMockReqRes({
        method: "POST",
        body: { clinicCode: "CALM01", passcode: "WRONG_PASSWORD" },
      });
      await clinicAuthHandler(req, res);
      expect(res.statusCode).toBe(429);
      expect(res.data.error).toContain("Too many failed login attempts");
    });

    it("rejects placeholder JWT_SECRET in production with 503", async () => {
      process.env.NODE_ENV = "production";
      process.env.JWT_SECRET = "change-me-in-production-long-placeholder-secret";
      process.env.CLINIC_ADMIN_PASSCODE = "strong_prod_passcode_123";
      process.env.MONGODB_URI = "mongodb://mock-mongo-uri:27017";

      const { req, res } = createMockReqRes({
        method: "POST",
        body: { clinicCode: "CALM01", passcode: "strong_prod_passcode_123" },
      });
      await clinicAuthHandler(req, res);
      expect(res.statusCode).toBe(503);
      expect(res.data.error).toBe("Server not configured");
    });

    it("rejects placeholder CLINIC_ADMIN_PASSCODE in production with 503", async () => {
      process.env.NODE_ENV = "production";
      process.env.JWT_SECRET = "super_secure_production_secret_key_32_characters_long";
      process.env.CLINIC_ADMIN_PASSCODE = "CALM2026";
      process.env.MONGODB_URI = "mongodb://mock-mongo-uri:27017";

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
