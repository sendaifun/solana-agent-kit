import { findAllDomainsForTld, getAllTld, NameRecordHeader, TldParser } from "@onsol/tldparser";
import { SolanaAgentKit } from "../index";

/**
 * Get all registered domains for all TLDs
 * @param agent - SolanaAgentKit instance
 * @returns Promise resolving to an array of objects containing nameAccount and domain
 */
export async function getAllRegisteredAllDomains(agent: SolanaAgentKit) {
  //get all TLDs
  const allTlds = await getAllTld(agent.connection);
  const parser = new TldParser(agent.connection);
  let domains = [];
  for (let tld of allTlds) {
    //get the parent name record for a TLD
    const parentNameRecord = await NameRecordHeader.fromAccountAddress(
      agent.connection,
      tld.parentAccount
    );

    //get all name accounts in a specific TLD
    const allNameAccountsForTld = await findAllDomainsForTld(agent.connection, tld.parentAccount);

    if (!parentNameRecord || !parentNameRecord.owner) return;

    //parse all name accounts in a specific TLD
    for (let nameAccount of allNameAccountsForTld) {
      //get domain as string without the tld
      const domain = await parser.reverseLookupNameAccount(nameAccount, parentNameRecord.owner);
      domains.push({
        nameAccount: nameAccount,
        domain: `${domain}${tld.tld}`,
      });
    }
  }
  return domains;
}
