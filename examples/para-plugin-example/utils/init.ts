'use client'
import ParaWebPlugin from "@getpara/plugin-para-web";
import {solanaAgent} from "./solana";
export const solanaAgentWithPara = solanaAgent.use(ParaWebPlugin);
export const para = solanaAgentWithPara.methods.getParaInstance();


