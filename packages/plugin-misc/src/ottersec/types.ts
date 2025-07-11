import { OSEC_ROUTER } from "./constants";

export type OSECRouterType = typeof OSEC_ROUTER;

export type OSECRouterKeyType = keyof typeof OSEC_ROUTER;

export type CreateVerifyPdaParam = {
  version: string;
  gitUrl: string;
  commit: string;
  args: string[];
  deploySlot: number;
};

export type VerifyProgramParamType = {
  program_id: string;
  repository: string;
  commit_hash: string;
  base_image?: string;
  bpf_flag?: boolean;
  cargo_args?: string[];
  lib_name?: string;
  mount_path?: string;
};

export type GetProgramVerificationStatusParams = {
  address: string;
};

export type GetVerificationJobStatusParams = {
  job_id: string;
};

export type GetProgramBuildLogParams = {
  address: string;
};

export type DecodeVerifyPdaDataParams = {
  hex: string;
};

export type GetVerifiedProgramsParams = {
  page: number;
};
