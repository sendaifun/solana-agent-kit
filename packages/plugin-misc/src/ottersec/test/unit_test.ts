import { verify_program } from "../tools";
import { OSEC_ENDPOINT_URI, OSEC_ROUTER } from "../constants";

async function test_verify_program() {
  console.log("Running OtterSec verify_program unit test...");

  // Mock global fetch
  const mockResponse = {
    status: "success",
    jobId: "mock-job-123",
  };

  // @ts-ignore
  global.fetch = async (url: string, options: any) => {
    console.log(`Mock fetch called with URL: ${url}`);
    if (url === OSEC_ENDPOINT_URI + OSEC_ROUTER.VERIFY_PROGRAM) {
      return {
        ok: true,
        json: async () => mockResponse,
      };
    }
    return { ok: false };
  };

  const params = {
    program_id: "8417BhZzzmGgPzDE1b43PK7n5zAy5rjYEEuSinSFZUWq", // Example wallet/program ID
    repository: "https://github.com/example/repo",
    commit_hash: "abcdef123456",
  };

  try {
    const result = await verify_program(params as any);
    console.log("Result:", result);

    if (result && result.jobId === "mock-job-123") {
      console.log("✅ Test Passed: verify_program returns correct mock response.");
    } else {
      console.error("❌ Test Failed: verify_program returned unexpected result.");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Test Failed with error:", error);
    process.exit(1);
  }
}

test_verify_program();
