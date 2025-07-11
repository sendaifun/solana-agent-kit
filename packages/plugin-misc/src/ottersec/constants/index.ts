export const OTTER_SEC_PROGRAM_ID: string =
  "verifycLy8mB96wd9wqq3WDXQwM4oU6r42Th37Db9fC";

export const OSEC_ENDPOINT_URI: string = "https://verify.osec.io";

export const OSEC_ROUTER: Record<string, string> = {
  VERIFY_PROGRAM: "/verify",
  GET_PROGRAM_BUILD_LOG: "/logs/",
  GET_PROGRAM_VERIFICATION_STATUS: "/status/",
  GET_VERIFICATION_JOB_STATUS: "/job/",
  GET_VERIFIED_PROGRAM: "/verified-programs/",
};

export const PDA_INITIALIZE_SEED: string = "otter_verify";
